# Aurora Integrations

Aurora's goal is to integrate and synchronize many different devices and services. However, in certain cases, some
services also wish to integrate with Aurora. The goal of integrations is to provide such a service. Only use an
integration if the service you wish to integrate with takes the initiative in sending information. Even though it is
theoretically possible, integrations are not designed to request data from Aurora (polling).

## Authentication

Just like subscribers, `IntegrationUsers` can start a session with Aurora using an API key. You receive a cookie from
the core, which you can use in all following communication. You can also use the cookie to connect to SocketIO.

However, to ease the integration process, `IntegrationUsers` are also able to authenticate themselves by using HTTP
headers. Simply put the API key in the `x-api-key` header of every request to authenticate that single HTTP
request. For integrations, this is the preferred authentication method.

## Authorization

For security purposes, each integration is assigned a specific subset of endpoints that integration can access.
To use an endpoint, the endpoint needs to be marked in Aurora Core first. By adding the
`@Security(SecurityNames.INTEGRATION, <endpoint name>)` decorator to a controller method, this endpoint is marked as
both being accessible for integrations with access to that endpoint, and as an endpoint that integrations can use
(so both sides of the arrow). **Make sure that you use the custom @Security() decorator from the `auth` module and NOT
the TSOA version!** In the backoffice, admins can assign endpoints to integrations.

## Example: poster requests

External services, such as a website form, can submit posters for review with the `createPosterRequest` endpoint
(`POST /api/handler/screen/poster/requests`). The request is a multipart form with either a `file` (JPG, PNG or MP4, at
most 20 MB) for a media poster or a `uri` (http or https) for an external poster, the requester's `requesterName` and
`requesterEmail`, the poster `name`, and optionally the `requesterAssociation`, a `message` for the reviewers and the
regular poster fields (`label`, `startDate`, `expirationDate`, `accentColor`, `footerSize`, `defaultTimeout` and
`borrelMode`).

Requests are not shown on any screen. They appear under "Poster requests" in the backoffice, where users with
privileged poster rights can edit them and approve them into the carousel, or deny them. Approving or denying a request
deletes it, including the requester's details. The endpoint is only available when the `Poster.Requests` server setting
is enabled, which it is not by default.
