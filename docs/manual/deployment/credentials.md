# Credentials Management

Credentials keep secrets (usernames, passwords) out of Frank configurations and log files. They are managed by credential factories and referenced by alias names. For a complete list of all available credential providers and their configuration options, see the [FF! Reference for credential providers](https://reference.frankframework.org/#/credential-providers).

## Credential Factories

| Factory | Class | Additional Properties |
|---------|-------|----------------------|
| Property File | `org.frankframework.credentialprovider.PropertyFileCredentialFactory` | `credentialFactory.map.properties` |
| File System | `org.frankframework.credentialprovider.FileSystemCredentialFactory` | `credentialFactory.filesystem.root`, `credentialFactory.filesystem.usernamefile`, `credentialFactory.filesystem.passwordfile` |
| Ansible Vault | `org.frankframework.credentialprovider.AnsibleVaultCredentialFactory` | `credentialFactory.ansibleVault.vaultFile`, `credentialFactory.keyFile` |

### PropertyFileCredentialFactory

Set in environment properties. See the [PropertyFileCredentialFactory reference](https://reference.frankframework.org/#/credential-providers/PropertyFileCredentialFactory) for all configuration options:

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

Stores each username and password in a dedicated file. Default file paths per alias: `<alias>/username` and `<alias>/password`, relative to `credentialFactory.filesystem.root`. See the [FileSystemCredentialFactory reference](https://reference.frankframework.org/#/credential-providers/FileSystemCredentialFactory) for all configuration options.

### Ansible Vault

Credentials are stored in an Ansible Vault encrypted file. The vault password is read from a separate file specified by `credentialFactory.keyFile`. See the [AnsibleVaultCredentialFactory reference](https://reference.frankframework.org/#/credential-providers/AnsibleVaultCredentialFactory) for all configuration options.

## Using Credentials in Configurations

### authAlias Attribute

Use `authAlias` on senders and listeners for authentication:

```xml
<SenderPipe name="callServer">
    <HttpSender name="callServer"
        url="http://api.example.com/endpoint"
        authAlias="myAlias"/>
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

## Docker Example

```yaml
services:
  frank:
    image: frankframework/frankframework:latest
    ports:
      - 8080:8080
    volumes:
      - ./configurations:/opt/frank/configurations
      - ./secrets:/opt/frank/secrets
    environment:
      instance.name: my-app
      dtap.stage: DEV
      credentialFactory.class: org.frankframework.credentialprovider.PropertyFileCredentialFactory
      credentialFactory.map.properties: /opt/frank/secrets/credentials.properties
```

## Troubleshooting

If credentials are not working (HTTP 401 from external system), check application server startup logs for credential factory initialization errors:

```
WARNING [main] org.frankframework.credentialprovider.CredentialFactory.tryFactory Cannot instantiate CredentialFactory [...]
```

These errors do not appear as console warnings — only in the application server logs (e.g., `${catalina.home}/logs`).
