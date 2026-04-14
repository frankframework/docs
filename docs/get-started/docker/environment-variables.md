---
sidebar_position: 3
title: Environment Variables
description: Configure Frank!Framework properties using environment variables in Docker Compose.
---

Environment variables can be used to set properties. They have the highest precedence and override application properties set in `.properties` files from Tomcat, resources, and configurations.

Set variables in `compose.yaml` under `environment`:

```yaml
services:
  frankframework:
    ...
    environment:
      instance.name: my-frank-app
      dtap.stage: LOC
      configurations.directory.autoLoad: "false"
```

> Do not use environment variables for secrets. See [Secrets](https://github.com/frankframework/frankframework/blob/master/DOCKER.md#secrets).

