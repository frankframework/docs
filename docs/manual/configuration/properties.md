# Properties

Properties are name/value pairs that configure Frank!Framework behavior and allow Frank configurations to adapt to different deployment environments.

## Property Syntax and Referencing

Properties are defined as `name=value` pairs. Property names are words separated by dots. Lines starting with `#` are comments.

```properties
my.hello=Hello
my.text=My text is ${my.hello}
```

Reference a property by surrounding its name with `${` and `}`. References are resolved at runtime by substituting the property's value. A property can reference another property defined later in the same file.

In XML configuration files, property references use the same syntax:

```xml
<EchoPipe name="accessProperties"
    getInputFromFixedValue="From stage ${dtap.stage}, I say ${my.text}" />
```

With the properties above and `dtap.stage=LOC`, this produces:

```
From stage LOC, I say My text is Hello
```

Properties can also be set as Java system properties via `-Dproperty="value"` on the command line. These override values defined in property files.

## Deployment Environment Layers

The Frank!Framework deployment stack consists of four layers, from bottom to top:

| Layer | Description |
|-------|-------------|
| Operating System | Base server environment |
| Application Server | Apache Tomcat, JBoss/WildFly, or WebSphere |
| Frank!Framework + classes | The framework and shared resources (`classes` folder) |
| Configurations | Individual Frank configurations |

This stack determines three property types:

### Property Types

| Type | Source | Description |
|------|--------|-------------|
| Environment properties | OS, command-line arguments, application server config files (e.g., `catalina.properties`) | Set by the system administrator. Highest precedence. |
| Application properties | Property files in the Frank!Framework deployment (`classes` folder) | Read during framework boot. |
| Configuration properties | Property files within individual Frank configurations | Loaded after the framework starts. |

Some properties only work at specific levels:

- **Environment only**: `log.dir`, `dtap.stage`, `dtap.side`
- **Environment or application only**: `configurations.names`, `configurations.<name>.classLoaderType`
- **Any level**: Custom properties (e.g., `my.hello`)

## Precedence Order

For each configuration, property precedence from highest to lowest:

1. Environment properties
2. Configuration properties
3. Application properties

Environment properties always override configuration and application properties. Configuration properties override application properties.

## DTAP Stages

The Frank!Framework uses DTAP stages to identify the deployment lifecycle phase:

| Stage | Description |
|-------|-------------|
| `LOC` | Local development on an individual developer's machine |
| `DEV` | Development team environment |
| `TST` | Test environment |
| `ACC` | Acceptance testing (customer) |
| `PRD` | Production |

Set `dtap.stage` as an environment property. When using Frank!Runner, it defaults to `LOC`.

> **Note:** `otap.stage` is supported for backward compatibility (OTAP is the Dutch equivalent of DTAP). If both are set, `dtap.stage` takes precedence.

## Property Files

The Frank!Framework reads property files from the configuration root directory. The files read and their precedence depend on `dtap.stage`, `dtap.side`, and `application.server.type`.

### Loading Order (Highest to Lowest Priority)

For `dtap.stage=LOC`, `application.server.type=TOMCAT`, `dtap.side=MyOrg`:

1. `Test.properties`
2. `StageSpecifics_LOC.properties`
3. `SideSpecifics_MyOrg.properties`
4. `ServerSpecifics_TOMCAT.properties`
5. `BuildInfo.properties`
6. `DeploymentSpecifics.properties`

None of these files are required to exist. The framework reads whichever files are present and applies precedence when a property appears in multiple files.

### File Descriptions

| File | Purpose |
|------|---------|
| `Test.properties` | Individual developer overrides. Should be in `.gitignore`. |
| `StageSpecifics_<STAGE>.properties` | Stage-specific settings (e.g., `StageSpecifics_PRD.properties`) |
| `SideSpecifics_<SIDE>.properties` | Side-specific settings for multi-department deployments |
| `ServerSpecifics_<TYPE>.properties` | Application server-specific settings |
| `BuildInfo.properties` | Populated by build scripts (version number, commit SHA) |
| `DeploymentSpecifics.properties` | Default/fallback property values |

### Application vs. Configuration Level

These property files can exist at both the application level (`classes` folder) and the configuration level. File type precedence takes priority over level precedence:

1. `StageSpecifics_LOC.properties` — configuration level
2. `StageSpecifics_LOC.properties` — application level
3. `DeploymentSpecifics.properties` — configuration level
4. `DeploymentSpecifics.properties` — application level

Properties at the configuration level can reference properties from the application level. However, application-level properties **cannot** reference configuration-level properties because application properties are resolved before configurations are loaded.

### Example: Environment-Specific Service URLs

```properties
# DeploymentSpecifics.properties (fallback for LOC/DEV/TST)
serviceURL=https://dev.someservice.io

# StageSpecifics_ACC.properties
serviceURL=https://acc.someservice.io

# StageSpecifics_PRD.properties
serviceURL=https://someservice.io
```

## Framework Properties Reference

### Core Properties

**`instance.name`**
The name of the Frank!Framework instance.

**`instance.name.lc`**
Automatically derived lowercase version of `instance.name`. Example: `GettingStarted` → `gettingstarted`.

**`application.server.type`**
Automatically detected by the framework. Determines which `ServerSpecifics_` file is loaded.

| Value | Application Server |
|-------|-------------------|
| `WAS` | WebSphere Application Server |
| `TOMCAT` | Apache Tomcat / Frank!Runner |
| `JBOSS` | JBoss Application Server (WildFly) |
| `TIBCOAMX` | Tibco AMX |

**`dtap.stage`**
DTAP stage of the deployment. Environment property only. Values: `LOC`, `DEV`, `TST`, `ACC`, `PRD`. Defaults to `LOC` with Frank!Runner.

**`dtap.side`**
Characterizes the deployment side/department. Environment property only. Default: `xxx`.

**`otap.stage`** / **`otap.side`**
Backward-compatible aliases for `dtap.stage` and `dtap.side`.

### Configuration Management

**`configurations.names`**
Comma-separated list of all configurations. Example: `${instance.name},MyConfig`. Environment or application property only.

**`configurations.<name>.classLoaderType`**
Defines how a configuration is loaded. Example values: `DirectoryClassLoader`, `DatabaseClassLoader`. Environment or application property only.

**`configurations.directory`**
Directory where the framework looks for configurations when using `DirectoryClassLoader`. Set automatically by Frank!Runner.

**`configurations.<name>.directory`**
Overrides `configurations.directory` for a specific configuration. Points to the directory containing `Configuration.xml`.

**`configurations.directory.autoLoad`**
When `true`, loads all subdirectories of `configurations.directory` as configurations without requiring `configurations.names`. Default: `false`.

**`configurations.autoDatabaseClassLoader`**
When `true`, any configuration can be uploaded to the database without explicit `classLoaderType` setup. Default: `false`.

### Logging

**`log.dir`**
Directory for log files. Environment property only. Usually auto-detected.

**`log.level`**
Minimum log level. Environment property only. Values: `ERROR`, `WARN`, `INFO`, `DEBUG`.

Default depends on `dtap.stage`:

| dtap.stage | Default log.level |
|------------|-------------------|
| `LOC` | `DEBUG` |
| `DEV` | `DEBUG` |
| `TST` | `DEBUG` |
| `ACC` | `WARN` |
| `PRD` | `WARN` |

Adjustable at runtime via the Frank!Console.

### Database

**`jdbc.migrator.active`**
Enables database initialization (Liquibase). Values: `true`, `false` (default). When enabled, executes `DatabaseChangelog.xml`.

**`loadDatabaseSchedules.active`**
When `true`, allows uploading Frank configurations to the database via the Frank!Console. Default: `false`.

### Testing

**`testtool.enabled`**
Controls whether Ladybug test reports are created during adapter execution. Default: `true`. Adjustable at runtime.

**`ibistesttool.directory`**
Directory used by Ladybug to store test reports.

**`scenariosroot<n>.description`** / **`scenariosroot<n>.directory`**
Define Larva scenario roots.

**`larva.timeout`**
Larva request timeout.

### Warnings

**`warnings.suppress.defaultvalue`**
When `true`, suppresses warnings about redundant default value assignments. Default: `false`.

**`warnings.suppress.sqlInjections.ManageDatabase`**
Suppresses SQL injection warnings for the ManageDatabase adapter. Default: `false`.

**`warnings.suppress.sqlInjections.<adapter>`**
Suppresses SQL injection warnings for a specific adapter that intentionally uses dynamic SQL.

### Credentials

**`credential:username:<alias>`** / **`credential:password:<alias>`**
Defines credentials for external systems. Replace `<alias>` with the chosen alias name.

### SOAP/CXF Security

Properties prefixed with `soap.bus.org.apache.cxf.stax.` configure CXF protection against DDOS attacks on SOAP endpoints (used with `WebServiceListener`):

- `soap.bus.org.apache.cxf.stax.maxAttributeSize`
- `soap.bus.org.apache.cxf.stax.maxChildElements`
- `soap.bus.org.apache.cxf.stax.maxElementDepth`
- `soap.bus.org.apache.cxf.stax.maxAttributeCount`
- `soap.bus.org.apache.cxf.stax.maxTextLength`
- `soap.bus.org.apache.cxf.stax.maxElementCount`

All accept integer values. See [CXF Security documentation](https://cxf.apache.org/docs/security.html).

### Custom Console Tabs

```properties
customViews.names=CustomTab
customViews.CustomTab.name=Custom Tab
customViews.CustomTab.url=http://localhost:8080
```

Adds a custom entry to the Frank!Console main menu pointing to the specified URL.

## Special Characters in Property Values

Property files follow Java properties file format. The following escape sequences are interpreted:

| Sequence | Character |
|----------|-----------|
| `\t` | TAB |
| `\n` | Newline |
| `\r` | Carriage return |
| `\\` | Literal backslash (`\`) |

A line ending with `\` continues the value on the next line.

**Important:** If a literal value contains these sequences, escape the backslash. For example, a password `abcd\t` must be written as:

```properties
credential:password:myAlias=abcd\\t
```

Without escaping, `\t` is interpreted as a TAB character and authentication will fail.

These escaping rules also apply to credentials files that use properties file format.

See the [Oracle Properties File Format specification](https://docs.oracle.com/cd/E23095_01/Platform.93/ATGProgGuide/html/s0204propertiesfileformat01.html) for full details.

## Runtime Property Changes

Some properties can be modified at runtime through the Frank!Console under **Environment Variables → Dynamic Parameters**. Changes made at runtime are not persistent and revert when the Frank!Framework restarts.

Examples of runtime-adjustable properties:

- `log.level` — Temporarily increase logging detail during incident investigation
- `testtool.enabled` — Enable/disable Ladybug test report generation
