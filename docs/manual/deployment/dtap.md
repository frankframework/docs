# DTAP Stages and Instance Name

## DTAP Stages

DTAP stands for Development, Test, Acceptance, Production. The `dtap.stage` property identifies the environment in which the Frank application runs.

| Value | Stage | Description |
|-------|-------|-------------|
| `LOC` | Local | Local development. No authorization required. HTTP allowed. |
| `DEV` | Development | Development server. |
| `TST` | Test | Test environment. |
| `ACC` | Acceptance | Acceptance testing. |
| `PRD` | Production | Production environment. |

The DTAP stage affects:

- **Security defaults** — `LOC` disables authentication; all other stages require it.
- **Transport guarantee** — `LOC` allows HTTP; others require HTTPS.
- **Log level** — `LOC`/`DEV`/`TST` default to `DEBUG`; `ACC`/`PRD` default to `WARN`.
- **Property file loading** — determines which `StageSpecifics_<STAGE>.properties` file is read.

## Instance Name

| Property | Description |
|----------|-------------|
| `instance.name` | Unique identifier for the Frank application (required). |
| `instance.name.lc` | Auto-computed lowercase version. Used in database names, log file names, and other derived identifiers. |

Example: `instance.name=GettingStarted` → `instance.name.lc=gettingstarted`

## DTAP Side

The `dtap.side` property identifies a specific server within a DTAP stage. Use this when multiple servers share the same stage (e.g., cluster nodes). Default: `xxx`.

## Setting These Properties

These properties must be set as environment properties, outside of the Frank configuration itself:

- **JVM system properties** — `-Ddtap.stage=TST -Dinstance.name=MyApp`
- **Tomcat** — `catalina.properties`
- **Docker Compose**:

```yaml
environment:
  instance.name: MyApp
  dtap.stage: TST
  dtap.side: node1
```

Setting these as environment properties ensures they are available before any configuration is loaded.

## Backward Compatibility

`otap.stage` and `otap.side` are supported for backward compatibility (OTAP is the Dutch equivalent of DTAP). If both `dtap.stage` and `otap.stage` are set, `dtap.stage` takes precedence.
