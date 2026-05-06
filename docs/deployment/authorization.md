# Authorization

## Security Overview

Two interfaces of the Frank!Framework require protection:

- **HTTP interfaces** — REST or SOAP endpoints accessed by integrated systems (e.g., `<ApiListener>`, `<RestListener>`, `<WebServiceListener>`).
- **Frank!Console** — the management console. Protecting the console automatically protects the Ladybug debugger.

System administrators must also protect external data sources (file systems, databases) independently of the Frank!Framework.

## DTAP Stage Security Defaults

The `dtap.stage` property controls default security behavior:

| DTAP Stage | Authentication Required | Transport Guarantee |
|---|---|---|
| `LOC` | No (all interfaces open) | HTTP allowed |
| `DEV`, `TST`, `ACC`, `PRD` | Yes (most interfaces blocked by default) | HTTPS required (Tomcat) |

Override the transport guarantee with:

```properties
application.security.http.transportGuarantee=none
application.security.http.transportGuarantee=confidential
```

## Authentication Methods

Authentication is configured via properties prefixed with:

- `application.security.console.authentication.` — for the Frank!Console and Ladybug.
- `application.security.http.authenticators.<name>.` — for HTTP interfaces.

| Type | Description | Properties |
|---|---|---|
| `NONE` | No authorization required | — |
| `SEALED` | No access (default for non-LOC stages) | — |
| `IN_MEMORY` | Username/password in properties | `username`, `password` |
| `YAML` (or `YML`) | Users defined in `localUsers.yml` | — |
| `AD` | Active Directory | `domainName`, `url`, `baseDn`, `followReferrals`, `searchFilter`, `roleMappingFile` |
| `OAUTH2` | OAuth 2.0 | `scopes`, `authorizationUri`, `tokenUri`, `jwkSetUri`, `issuerUri`, `userInfoUri`, `userNameAttributeName`, `clientId`, `clientSecret`, `provider`, `roleMappingFile` |
| `CONTAINER` | Application server (deprecated) | — |

### IN_MEMORY Example

```properties
application.security.console.authentication.type=IN_MEMORY
application.security.console.authentication.username=ADMIN
application.security.console.authentication.password=PASSWORD1234
```

With `IN_MEMORY`, the authenticated user receives all roles.

### YAML Example

`DeploymentSpecifics.properties`:

```properties
application.security.console.authentication.type=YAML
```

`localUsers.yml` (default location: `/opt/frank/resources/localUsers.yml`):

```yaml
users:
  - username: observer
    password: IbisObserver
    roles: IbisObserver
```

Multiple roles are assigned as a comma-separated list in the `roles` field.

### Active Directory Role Mapping

A role mapping file translates AD roles to Frank!Framework roles:

```
IbisTester=ad_role_testers
IbisAdmin=ad_role_admins
```

The mapping is one-to-one; one Frank!Framework role cannot map to multiple AD roles.

## Security Roles

Roles are hierarchical. Higher roles include all permissions of lower roles.

| Role | Permissions |
|---|---|
| `IbisWebService` | Call a WebServiceListener. No access to Ladybug. |
| `IbisObserver` | View configurations, statistics, log files. View Ladybug reports, errors, and warnings. Change Ladybug XSLT and node link strategies. |
| `IbisDataAdmin` | Browse/resend/delete messages in message logs, stores, and error stores. Reload configurations. Start/stop adapters. Configure and manage Ladybug reports. Includes all `IbisObserver` permissions. |
| `IbisAdmin` | Full reload. Includes all `IbisDataAdmin` permissions. |
| `IbisTester` | Execute JDBC queries, send JMS messages, test services and pipelines. Rerun Ladybug reports. Includes all `IbisAdmin` and `IbisWebService` permissions. |

## HTTP Interface Protection

Each HTTP interface is served by a servlet with specific role requirements:

| URL | Listener | Servlet | Required Role |
|---|---|---|---|
| `/api` | `<ApiListener>` | `ApiListenerServlet` | None by default* |
| `/rest` | `<RestListener>` | `RestListenerServlet` | Any role |
| `/services` | `<WebServiceListener>` | `SoapProviderServlet` | `IbisTester` or `IbisWebService` |
| `/webcontent` | (frontend code) | `WebContentServlet` | Any role |
| `/iaf/larva` | (Larva test tool) | `LarvaServlet` | `IbisTester` |

\* `ApiListenerServlet` is open by default. To protect it, set `servlet.ApiListenerServlet.securityRoles` to a comma-separated list of roles.

### Protecting HTTP Interfaces with Authenticators

Define authenticators and assign them to servlets:

```properties
# Define available authenticators
application.security.http.authenticators=inMem

# Configure the authenticator
application.security.http.authenticators.inMem.type=IN_MEMORY
application.security.http.authenticators.inMem.username=ADMIN
application.security.http.authenticators.inMem.password=PASSWORD1234

# Assign authenticator to servlet
servlet.ApiListenerServlet.authenticator=inMem
servlet.ApiListenerServlet.securityRoles=IbisAdmin
```

Multiple authenticators are defined as a comma-separated list in `application.security.http.authenticators`.

## Console and Ladybug Protection

Console and Ladybug authentication properties use the prefix `application.security.console.authentication.`. Properties `dtap.stage` and `application.security.http.transportGuarantee` must be provided as environment properties. Other authorization properties can be application properties but not configuration properties.

## Credentials Management

Credentials keep secrets (usernames, passwords) out of Frank configurations and log files.

### Credential Factories

| Factory Class | Description | Additional Properties |
|---|---|---|
| `org.frankframework.credentialprovider.PropertyFileCredentialFactory` | Credentials in a properties file | `credentialFactory.map.properties` |
| `org.frankframework.credentialprovider.FileSystemCredentialFactory` | Username and password in separate files | `credentialFactory.filesystem.root`, `credentialFactory.filesystem.usernamefile`, `credentialFactory.filesystem.passwordfile` |
| `org.frankframework.credentialprovider.AnsibleVaultCredentialFactory` | Credentials in Ansible vault | `credentialFactory.ansibleVault.vaultFile`, `credentialFactory.keyFile` |

### PropertyFileCredentialFactory

Set in environment properties:

```properties
credentialFactory.class=org.frankframework.credentialprovider.PropertyFileCredentialFactory
credentialFactory.map.properties=/opt/frank/secrets/credentials.properties
```

Contents of `credentials.properties`:

```properties
myAlias/username=ADMIN
myAlias/password=PASSWORD1234
```

Each alias is a named set of credentials. The alias name prefixes the `username` and `password` keys separated by `/`.

> **Note:** The Frank!Framework interprets escape sequences in properties files. A literal `\t` in a password must be escaped as `\\t`.

### FileSystemCredentialFactory

Stores each username and password in a dedicated file. Default file paths per alias: `<alias>/username` and `<alias>/password`, relative to `credentialFactory.filesystem.root`.

## Using Credentials in Configurations

### HttpSender with authAlias

Use `authAlias` on `<HttpSender>` for basic authentication:

```xml
<SenderPipe name="callServer">
    <HttpSender name="callServer"
        url="http://frank-authorization-server:8080/api/server"
        authAlias="myAlias">
    </HttpSender>
</SenderPipe>
```

The Frank!Framework authenticates using the username and password stored under the specified alias.

### Param with hidden=true

When credentials must appear in URLs, headers, or query parameters, use `<Param>` with `hidden="true"` to prevent secrets from appearing in logs and Ladybug reports:

```xml
<HttpSender name="callServer" urlParam="url">
    <Param name="url"
        authAlias="myAlias"
        pattern="http://server:8080/api/endpoint?user={username}&amp;pass={password}"
        hidden="true" />
</HttpSender>
```

Within the pattern, `{username}` and `{password}` are replaced with values from the alias.

### Expanding Credentials as Properties (Development Only)

```properties
authAliases.expansion.allowed=myAlias
```

This allows referencing credentials as `${credential:username:myAlias}`. **Do not use in production** — values will appear in log files, Ladybug reports, and Test a Pipeline results.

## Internal Network Isolation with Docker

Restrict a Frank!Framework server to an internal Docker network by omitting the `ports` entry in `docker-compose.yml`:

```yaml
services:
  frank-authorization-server:
    image: frankframework/frankframework:latest
    volumes:
      - ./server/configurations:/opt/frank/configurations
      - ./server/resources:/opt/frank/resources
    environment:
      instance.name: frank-authorization-server
      dtap.stage: DEV
      configurations.directory.autoLoad: true
      application.security.http.transportGuarantee: none
  frank-authorization-client:
    image: frankframework/frankframework:latest
    ports:
      - 8080:8080
    volumes:
      - ./client/configurations:/opt/frank/configurations
      - ./client/resources:/opt/frank/resources
      - ./client/secrets:/opt/frank/secrets
    environment:
      instance.name: frank-authorization-client
      dtap.stage: LOC
      configurations.directory.autoLoad: true
      credentialFactory.class: org.frankframework.credentialprovider.PropertyFileCredentialFactory
      credentialFactory.map.properties: /opt/frank/secrets/credentials.properties
```

The server has no `ports` entry, making it accessible only within the Docker Compose internal network. The client connects to `http://frank-authorization-server:8080` using the internal Docker DNS. In enterprise environments, a dedicated ingress server handles HTTPS termination, and internal services communicate over HTTP within the isolated network.
