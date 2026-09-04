# PC usage agent

Reports which of the GEWIS room PCs are in use, and by whom, to the aurora info
screen.

## What it sends

One `POST {AURORA_URL}/api/handler/screen/info/pc-usage` per run, with every
machine in a single payload:

```json
{
  "pcs": [
    { "pcId": "1", "memberId": 1234, "name": "Jane Doe" },
    { "pcId": "2", "memberId": 5678, "name": "John Doe", "lockedAt": "2026-09-02T13:05:00.000Z" },
    { "pcId": "3", "status": "offline" },
    { "pcId": "4" },
    { "pcId": "vdesktop", "memberId": 1234, "name": "Jane Doe", "remote": true },
    { "pcId": "vdesktop", "memberId": 9012, "name": "Alex Doe", "remote": true }
  ]
}
```

- `pcId` `"1"`–`"10"` are the physical seats. Anything else is a virtual
  session, and every one of them folds into the single `vdesktop` row.
- `memberId` is the GEWIS membership number (`lidnr`), read from the
  `employeeNumber` attribute in Active Directory. It is the identity: aurora
  matches it against the keyholder registry to decide whether to show a board
  star or a key. Login names are never sent.
- `name` is only there to be displayed, and is the given name rather than the
  full one: a seat on the screen is about one short name wide. Aurora shows a
  member its keyholder registry knows under the registry's own short name, so
  this mainly decides what everybody else is called.
- Omitting `status` lets aurora infer it: `lockedAt` → locked, `remote` →
  remote, no user → free, otherwise in use. Send `status` explicitly only for
  `offline` and `maintenance`, which no session can express.

Accounts without an `employeeNumber` — external accounts (`e1234`) and service
accounts — report `memberId: null`. They show their name and get no symbol,
which is correct: they are not members. Member accounts are also named
`m<lidnr>`, and the script falls back to parsing that when the attribute is
empty.

## Setup

1. **Create the integration key.** In the backoffice, add an integration with
   the `setInfoPcUsage` scope and copy its key.

2. **Schedule it.** On a domain-joined machine that can reach the room:

   ```powershell
   $action  = New-ScheduledTaskAction -Execute 'powershell.exe' `
       -Argument '-NoProfile -ExecutionPolicy Bypass -File C:\aurora\Send-PcUsage.ps1 -AuroraUrl https://aurora.gewis.nl -ApiKey <key>'
   $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
       -RepetitionInterval (New-TimeSpan -Minutes 1)
   Register-ScheduledTask -TaskName 'Aurora PC usage' -Action $action -Trigger $trigger `
       -User 'GEWISWG\svc-infoscreen' -RunLevel Highest
   ```

   Run it at least once a minute. Aurora marks a machine offline after
   `INFOSCREEN_PC_STALE_MINUTES` (default 5) without a report, so the interval
   must stay comfortably under that.

## Trying it out

`-WhatIf` builds the payload and prints it instead of sending:

```powershell
.\Send-PcUsage.ps1 -AuroraUrl https://aurora.gewis.nl -ApiKey dummy -WhatIf -Verbose
```

`-Verbose` also logs what each machine resolved to.

## Behaviour worth knowing

- Machines are pinged before anything else, and every per-machine failure is
  caught: one unreachable PC is reported offline and the rest of the report
  still goes out.
- AD is read from the PDC emulator, so an account created or expired moments ago
  is already visible.
- Accounts are resolved once per run and cached, since that is the slowest part.
- A failed POST is not fatal. Aurora flips unreported machines to offline by
  itself, and the next run catches up.
