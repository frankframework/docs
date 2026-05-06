# Custom Logging Configuration

## Overview

The Frank!Framework uses Log4j2 for logging. To customize logging, set the environment property:

```properties
log4j.configurationFile=log4j4ibis.xml,my-log4j2.xml
```

`log4j4ibis.xml` is the framework's default configuration. Additional files are loaded from the classpath or via absolute path (`file:///path/to/file`).

Logging levels can also be set via properties:

```properties
logging.level.org.springframework=WARN
```

Format: `logging.level.<package or class>=<level>`

## Logger Names

| Logger | Default Output File | Content |
|--------|-------------------|---------|
| (root) | `${instance.name.lc}.log` | Fallback when no other logger matches |
| `MSG` | `${instance.name.lc}-messages.log`, `${instance.name.lc}-messages.json` | Processed messages in human-readable format |
| `SEC` | `${instance.name.lc}-security.log` | Audit logging |
| `HEARTBEAT` | `${instance.name.lc}-heartbeat.log` | Periodic adapter health messages |
| `CONFIG` | `${instance.name.lc}-config.xml` | Current configuration printout |
| `APPLICATION` | Console | Boot sequence, subsystem discovery, configuration reloads |

The `{instance}` prefix is derived from the instance name converted to lowercase (e.g., instance name `Frank2Manual` → prefix `frank2manual`).

## Log Levels

| Level | Description |
|-------|-------------|
| `DEBUG` | Detailed diagnostic information |
| `INFO` | General operational messages |
| `WARN` | Potential issues that do not prevent operation |
| `ERROR` | Failures that require attention |

Default depends on `dtap.stage`:

| dtap.stage | Default log.level |
|------------|-------------------|
| `LOC`, `DEV`, `TST` | `DEBUG` |
| `ACC`, `PRD` | `WARN` |

Adjustable at runtime via **Environment Variables → Dynamic Parameters** in the Frank!Console.

## Log Rotation

- **Daily rotation** — used by `catalina` logs. A new file is created each day.
- **Size-based rotation** — used by framework logs. When a file exceeds the size limit, it is renamed with a numeric suffix (`.log.1`, `.log.2`, etc.) and a new file is created.

## Log Line Format

Application log:

```
2020-04-23 10:07:52,815 INFO  [localhost-startStop-1] null util.AppConstants - Application constants loaded from url [...]
```

Fields: timestamp, log level, thread name, Java component, message text.

Messages log:

```
2020-04-23 10:08:49,911 [receiverGetDestinations-listener[1]] Adapter [adapterGetDestinations] received message [SIZE=57B] with messageId [...]
```

Fields: timestamp, thread name, adapter/sender identification, message metadata.

## Log Files in the Console

Log files are viewable from **Logging** in the Frank!Console main menu. The directory listing shows file size and last modification date.

## References

- [Default log configuration source](https://github.com/frankframework/frankframework/blob/master/core/src/main/resources/log4j4ibis.xml)
- [Log4j2 configuration](https://logging.apache.org/log4j/2.x/manual/configuration.html)
- [Log4j2 appenders](https://logging.apache.org/log4j/2.x/manual/appenders.html)
