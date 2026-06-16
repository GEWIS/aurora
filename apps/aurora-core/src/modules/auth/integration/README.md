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
