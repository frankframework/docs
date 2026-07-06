---
sidebar_position: 4
title: Health and Readiness
description: Monitor container health using the Frank!Framework health API and Docker healthchecks.
---

Monitor container health by polling `/iaf/api/server/health`:

- **HTTP 200**: configurations are loaded and running
- **HTTP 503**: one or more configurations are not running

To check the health of a specific adapter:

```text
GET /iaf/api/configurations/{configuration}/adapters/{name}/health
```

You can add a Docker healthcheck in `compose.yaml`:

```yaml
services:
  frankframework:
    # ...
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/iaf/api/server/health"]
      interval: 10s
      timeout: 5s
      retries: 5
```

