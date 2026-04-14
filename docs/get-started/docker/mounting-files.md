---
sidebar_position: 2
title: Mounting Files
description: Mount configuration files, resources, secrets, and drivers into the Frank!Framework Docker container.
---

The Frank!Framework container uses several well-known directories and files. You can mount these to provide your own content.

## Directories

| Directory | Description |
|---|---|
| `/opt/frank/configurations` | For configurations. May contain per-configuration directories or a JAR containing those directories. If `Configuration.xml` is not at `<configurationName>/Configuration.xml`, define `configurations.<configurationName>.configurationFile` with the path to `Configuration.xml`. Configurations are loaded automatically by default (`configurations.directory.autoLoad=true`). |
| `/opt/frank/resources` | For application-wide properties. May contain files or a JAR with all files. Minimum required properties are `instance.name` and `configurations.names`, which can also be set using environment variables. |
| `/opt/frank/testtool` | Larva tests included in the image. |
| `/opt/frank/testtool-ext` | Larva tests mounted from the environment. |
| `/opt/frank/secrets` | Credential storage (`credentials.properties` is read by default). See [Secrets](https://github.com/frankframework/frankframework/blob/master/DOCKER.md#secrets). |
| `/opt/frank/drivers` | Driver JARs. See [Drivers](https://github.com/frankframework/frankframework/blob/master/DOCKER.md#drivers). |
| `/opt/frank/plugins` | Plugin JARs. |
| `/usr/local/tomcat/logs` | Log directory. |

To mount additional directories, add volumes or watch entries to the `frankframework` service in `compose.yaml`.

Example with volumes:

```yaml
services:
  frankframework:
    ...
    volumes:
      - ./resources/:/opt/frank/resources
```

Example with file watch:

```yaml
develop:
  watch:
    - action: sync
      path: ./resources
      target: /opt/frank/resources
```

> The image runs Tomcat as `tomcat:tomcat` (`UID=2000`, `GID=2000`). Ensure mounted or copied files are owned appropriately.

## Files

| File | Description |
|---|---|
| `/opt/frank/resources/resources.yml` | Mount or copy your `resources.yml`. Use `host.docker.internal` to reach the host for local testing. Changes require restart (for watch mode, use `sync+restart`). |
| `/usr/local/tomcat/conf/server.xml` | Mount or copy your `server.xml`. Replace as needed to secure your Tomcat setup. |
| `/usr/local/tomcat/conf/catalina.properties` | Contains default framework values. Do not replace it. Use [environment variables](./environment-variables.md) or append values instead. |

