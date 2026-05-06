---
sidebar_position: 1
title: Running with Docker Compose
description: Set up and run Frank!Framework, Frank!Flow, and Swagger UI using Docker Compose.
---

The Docker Compose setup includes:

- **Frank!Framework**: core application
- **Frank!Flow**: visual configuration tool
- **Swagger UI**: API documentation viewer

Production-ready containers are pushed to [Docker Hub: frankframework/frankframework](https://hub.docker.com/r/frankframework/frankframework) and the [Nexus Repository Manager](https://nexus.frankframework.org/) `frankframework-docker` repository. Helm charts are available in the [charts repository](https://github.com/frankframework/charts).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose) or Docker Engine with the [Compose plugin](https://docs.docker.com/compose/install/)
- Docker Compose **v2.22 or later** (required for `docker compose watch`)

## Getting started

### Directory structure

Create a project directory and add a `configurations/` subdirectory:

```text
my-frank-project/
├── compose.yaml
└── configurations/
    └── <YourConfiguration>/
        └── Configuration.xml
```

The `configurations/` directory is synced automatically when using `docker compose watch`.

### Docker Compose file

Create `compose.yaml` with this content:

```yaml
services:
  frankframework:
    image: frankframework/frankframework:latest
    ports:
      - "8080:8080"
    configs:
      - source: resources.yml
        target: /opt/frank/resources/resources.yml
    environment:
      instance.name: ff-quick-start
      customViews.names: FrankFlow
      customViews.FrankFlow.name: Frank!Flow
      customViews.FrankFlow.url: http://localhost:8081
      # Enable CORS for local development.
      cors.enforced: "true"
    develop:
      watch:
        - action: sync
          initial_sync: true
          path: ./configurations/
          target: /opt/frank/configurations/

        # Optional additional watch actions.
        # - action: sync
        #   path: ./resources
        #   target: /resources
        # - action: sync+restart
        #   path: ./secrets
        #   target: /secrets

  frank-flow:
    image: frankframework/frank-flow:latest
    ports:
      - "8081:8080"
    volumes:
      - ./configurations/:/opt/frank/configurations
    environment:
      configurations.directory: /opt/frank/configurations

  swagger-ui:
    image: swaggerapi/swagger-ui:v5.32.0
    ports:
      - "8082:8080"
    environment:
      URLS: |
        [
          {"name":"Configurations API","url":"http://localhost:8080/iaf/api/webservices/openapi.json"},
          {"name":"Frank!Framework API","url":"http://localhost:8080/iaf/api/openapi/v3.yaml"}
        ]

configs:
  resources.yml:
    content: |
      jdbc:
        - name: "ff-quick-start"
          type: "org.h2.jdbcx.JdbcDataSource"
          url: "jdbc:h2:mem:test;NON_KEYWORDS=VALUE;DB_CLOSE_ON_EXIT=FALSE;DB_CLOSE_DELAY=-1;TRACE_LEVEL_FILE=0;"
```

### Run the setup

Recommended:

```shell
docker compose watch
```

Stop watching with `Ctrl+C`. Containers keep running in the background. Stop and remove them with:

```shell
docker compose down
```

> `docker compose watch` requires Docker Compose v2.22 or later. Use `docker compose version` to check.

### Alternative: use `--watch`

```shell
docker compose up --watch
```

### Alternative: plain volume mount

If `docker compose watch` is unavailable, mount `configurations/` as a volume in the `frankframework` service:

```yaml
services:
  frankframework:
    ...
    volumes:
      - ./configurations/:/opt/frank/configurations
```

Then start normally:

```shell
docker compose up -d
```

Changes to `configurations/` are still picked up, but may be slower (especially on Windows).

## What's next

When the services are running:

| URL | Description |
|---|---|
| http://localhost:8080 | **Frank!Framework console**: monitor and manage your application |
| http://localhost:8081 | **Frank!Flow**: visual configuration editor |
| http://localhost:8082 | **Swagger UI**: browse and test the API |

Open `http://localhost:8080` in your browser. Frank!Flow is available from the console sidebar.

From there you can:
- Place configuration files in `configurations/` and let Compose sync them.
- Monitor adapters, view logs, and test configurations.
- Create and edit configurations in Frank!Flow.
- Use Swagger UI at `http://localhost:8082` to test the REST API.

