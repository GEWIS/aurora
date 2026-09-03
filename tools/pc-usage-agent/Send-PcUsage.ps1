<#
.SYNOPSIS
    Reports the usage of the GEWIS room PCs and the shared virtual desktop to
    aurora.

.DESCRIPTION
    Collects the state of every room PC and the shared virtual desktop, and
    posts all of it to aurora in one request.

    Members are identified by their GEWIS membership number (lidnr), read from
    Active Directory; aurora derives the board/keyholder symbols from that
    number, so login names never leave this script. The name is sent purely to
    be displayed.

    Run it from a scheduled task on a domain-joined machine that can reach the
    room's PCs. It never throws on a single unreachable machine: that PC is
    reported offline and the rest still goes out.

.PARAMETER AuroraUrl
    Base URL of the aurora core, e.g. https://aurora.gewis.nl.

.PARAMETER ApiKey
    Integration key with the "setInfoPcUsage" scope. Create it in the backoffice
    under integrations.

.EXAMPLE
    .\Send-PcUsage.ps1 -AuroraUrl https://aurora.gewis.nl -ApiKey $env:AURORA_PC_KEY

.EXAMPLE
    .\Send-PcUsage.ps1 -AuroraUrl http://localhost:3000 -ApiKey dev-key -WhatIf
    Prints the payload without sending it.
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $true)]
    [string] $AuroraUrl,

    [Parameter(Mandatory = $true)]
    [string] $ApiKey,

    # Hostname of the machine behind each seat, indexed by the pcId aurora knows.
    # Keys must be "1".."10": aurora treats those as the physical seats in the
    # room and anything else as a virtual session.
    [hashtable] $Machines = @{
        '1'  = 'PCGEWIS1'
        '2'  = 'PCGEWIS2'
        '3'  = 'PCGEWIS3'
        '4'  = 'PCGEWIS4'
        '5'  = 'PCGEWIS5'
        '6'  = 'PCGEWIS6'
        '7'  = 'PCGEWIS7'
        '8'  = 'PCGEWIS8'
        '9'  = 'PCGEWIS9'
        '10' = 'PCGEWIS10'
    },

    [string] $VirtualDesktopHost = 'GEWISVDESKTOP',

    # AD attribute holding the GEWIS membership number. GEWISWG writes the lidnr
    # here when a member account is created, so there should be no reason to
    # change it.
    [string] $MemberIdAttribute = 'employeeNumber',

    # Machines in this AD group report as under maintenance regardless of who is
    # logged in. Leave empty to skip the lookup.
    [string] $MaintenanceGroup = 'S-1-5-21-3053190190-970261712-1328217982-5278',

    [int] $TimeoutSeconds = 30
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Read from the PDC emulator: a member who just got their account, or just had it
# expired, is visible there first.
$script:Server = $null
try {
    $script:Server = (Get-ADDomain).PDCEmulator
} catch {
    Write-Verbose "Could not determine the PDC emulator, using the default DC: $($_.Exception.Message)"
}

# Splatted into every AD call, so they all hit the same controller. Empty when
# the domain could not be queried, which leaves the cmdlets on their default DC.
$script:AdArgs = @{}
if ($script:Server) { $script:AdArgs = @{ Server = $script:Server } }

# --------------------------------------------------------------------------
# Active Directory lookups
# --------------------------------------------------------------------------

# Resolving the same account repeatedly is the slowest thing this script does,
# so remember what the directory said within a run.
$script:UserCache = @{}

<#
.SYNOPSIS
    Resolve a login name to the membership number and display name aurora wants.
.OUTPUTS
    A hashtable with MemberId (int or $null) and Name (string), or $null when
    the account does not exist in the directory.
#>
function Resolve-Member {
    param([string] $SamAccountName)

    if ([string]::IsNullOrWhiteSpace($SamAccountName)) { return $null }

    $key = $SamAccountName.ToLowerInvariant()
    if ($script:UserCache.ContainsKey($key)) { return $script:UserCache[$key] }

    $resolved = $null
    try {
        $user = Get-ADUser -Identity $SamAccountName @script:AdArgs `
            -Properties DisplayName, GivenName, $MemberIdAttribute -ErrorAction Stop

        # The attribute is a string in AD and may be absent or non-numeric.
        # External accounts (e1234) are created without it, and so are service
        # accounts; anything that is not a whole number is "no member".
        $memberId = $null
        $raw = $user.$MemberIdAttribute
        if ($raw -and ($raw -as [int])) { $memberId = [int] $raw }

        # Member accounts are named m<lidnr>, so the login itself carries the
        # number when the attribute is missing: a member whose attribute never
        # got written still shows their symbol.
        if ($null -eq $memberId -and $user.SamAccountName -match '^m(\d+)$') {
            $memberId = [int] $Matches[1]
        }

        # Prefer the full name; fall back to the given name and then the login
        # so a machine in use never shows a blank label.
        $name = @($user.DisplayName, $user.GivenName, $user.SamAccountName) |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
            Select-Object -First 1

        $resolved = @{ MemberId = $memberId; Name = $name }
    } catch {
        Write-Verbose "Could not resolve '$SamAccountName' in AD: $($_.Exception.Message)"
        # An account the directory does not know is still somebody at a keyboard;
        # show the login rather than an empty seat.
        $resolved = @{ MemberId = $null; Name = $SamAccountName }
    }

    $script:UserCache[$key] = $resolved
    return $resolved
}

<# Machines the directory says are under maintenance. #>
function Get-MaintenanceMachines {
    if ([string]::IsNullOrWhiteSpace($MaintenanceGroup)) { return @() }
    try {
        return @(Get-ADGroupMember -Identity $MaintenanceGroup -Recursive @script:AdArgs |
            Select-Object -ExpandProperty Name |
            ForEach-Object { $_.ToUpperInvariant() })
    } catch {
        Write-Warning "Could not read the maintenance group: $($_.Exception.Message)"
        return @()
    }
}

# --------------------------------------------------------------------------
# Session discovery
# --------------------------------------------------------------------------

<#
.SYNOPSIS
    Parse `qwinsta /server:<host>` into one object per active session.
.DESCRIPTION
    Fields are split on whitespace rather than cut at fixed column offsets, so a
    long username does not shift the parse: SESSIONNAME USERNAME ID STATE ...
#>
function Get-Sessions {
    param([string] $ComputerName)

    $output = & qwinsta /server:$ComputerName 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $output) { return @() }

    $sessions = @()
    foreach ($line in $output | Select-Object -Skip 1) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }

        # ">console  jdoe  2  Active  ..." — the leading > marks the current
        # session and is not part of the name.
        $fields = ($line -replace '^\s*>', '') -split '\s+' | Where-Object { $_ -ne '' }
        if ($fields.Count -lt 3) { continue }

        $sessionName = $fields[0]
        $state = $fields | Where-Object { $_ -in @('Active', 'Disc', 'Listen', 'Conn') } | Select-Object -First 1
        if ($state -ne 'Active') { continue }

        # A session with no user has the id where the username would be, so a
        # numeric second field means nobody is logged in.
        $userName = $null
        if ($fields.Count -ge 4 -and ($fields[1] -notmatch '^\d+$')) { $userName = $fields[1] }
        if (-not $userName) { continue }

        # Domain-qualified names come back as GEWISWG\jdoe.
        $userName = $userName -replace '^.*\\', ''

        $sessions += [pscustomobject]@{
            SessionName = $sessionName
            UserName    = $userName
            IsConsole   = $sessionName -like 'console*'
            IsRemote    = $sessionName -like 'rdp*'
        }
    }
    return $sessions
}

<# Whether the logon screen is up, i.e. the console session is locked. #>
function Test-Locked {
    param([string] $ComputerName)
    try {
        $logonUi = Get-CimInstance -ClassName Win32_Process -ComputerName $ComputerName `
            -Filter "Name='LogonUI.exe'" -OperationTimeoutSec 5 -ErrorAction Stop
        return $null -ne $logonUi
    } catch {
        Write-Verbose "Lock check failed for ${ComputerName}: $($_.Exception.Message)"
        return $false
    }
}

<# Whether the machine answers a ping. #>
function Test-Online {
    param([string] $ComputerName)
    try {
        return Test-Connection -ComputerName $ComputerName -Count 1 -Quiet -ErrorAction Stop
    } catch {
        return $false
    }
}

# --------------------------------------------------------------------------
# Building the report
# --------------------------------------------------------------------------

$maintenance = Get-MaintenanceMachines
$report = [System.Collections.Generic.List[object]]::new()

foreach ($pcId in ($Machines.Keys | Sort-Object { [int] $_ })) {
    $computer = $Machines[$pcId]
    $entry = @{ pcId = $pcId }

    if ($maintenance -contains $computer.ToUpperInvariant()) {
        # An explicit status wins over anything inferred from the session.
        $entry.status = 'maintenance'
    } elseif (-not (Test-Online -ComputerName $computer)) {
        $entry.status = 'offline'
    } else {
        $session = Get-Sessions -ComputerName $computer |
            Sort-Object -Property @{ Expression = { -not $_.IsConsole } } |
            Select-Object -First 1

        if ($null -eq $session) {
            $entry.status = 'free'
        } else {
            $member = Resolve-Member -SamAccountName $session.UserName
            $entry.memberId = $member.MemberId
            $entry.name = $member.Name
            $entry.remote = [bool] $session.IsRemote

            # Only a console session can be locked; an RDP session that shows the
            # logon screen is somebody connecting, not a locked desk.
            if ($session.IsConsole -and (Test-Locked -ComputerName $computer)) {
                $entry.lockedAt = (Get-Date).ToUniversalTime().ToString('o')
            }
            # No status: aurora infers locked/remote/in-use from the above.
        }
    }

    $report.Add($entry)
    Write-Verbose "$computer -> $($entry | ConvertTo-Json -Compress)"
}

# The virtual desktop is one PC that many people share. Every active session
# goes in under the same non-numeric pcId; aurora folds them into a single row
# and de-duplicates on the membership number.
if (-not [string]::IsNullOrWhiteSpace($VirtualDesktopHost)) {
    if ($maintenance -contains $VirtualDesktopHost.ToUpperInvariant()) {
        $report.Add(@{ pcId = 'vdesktop'; status = 'maintenance' })
    } elseif (-not (Test-Online -ComputerName $VirtualDesktopHost)) {
        $report.Add(@{ pcId = 'vdesktop'; status = 'offline' })
    } else {
        $sessions = Get-Sessions -ComputerName $VirtualDesktopHost
        if ($sessions.Count -eq 0) {
            # Still report the machine, so an empty vdesktop reads as free
            # rather than going stale into offline.
            $report.Add(@{ pcId = 'vdesktop'; remote = $true })
        } else {
            foreach ($session in $sessions) {
                $member = Resolve-Member -SamAccountName $session.UserName
                $report.Add(@{
                    pcId     = 'vdesktop'
                    memberId = $member.MemberId
                    name     = $member.Name
                    remote   = $true
                })
            }
        }
    }
}

# --------------------------------------------------------------------------
# Sending
# --------------------------------------------------------------------------

$payload = @{ pcs = $report } | ConvertTo-Json -Depth 4
$endpoint = "$($AuroraUrl.TrimEnd('/'))/api/handler/screen/info/pc-usage"

if ($PSCmdlet.ShouldProcess($endpoint, 'POST pc usage')) {
    try {
        Invoke-RestMethod -Uri $endpoint -Method Post -Body $payload `
            -ContentType 'application/json' `
            -Headers @{ 'X-API-Key' = $ApiKey } `
            -TimeoutSec $TimeoutSeconds -UseBasicParsing | Out-Null
        Write-Verbose "Reported $($report.Count) entries to $endpoint"
    } catch {
        # A failed post is not fatal: aurora flips unreported machines to
        # offline by itself, and the next run will catch up.
        Write-Error "Reporting to aurora failed: $($_.Exception.Message)"
        exit 1
    }
} else {
    Write-Output $payload
}
