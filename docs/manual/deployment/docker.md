# Docker Deployment

## Base Image

The official Frank!Framework Docker image is available from:

| Registry | Image |
|----------|-------|
| DockerHub | `frankframework/frankframework` |
| Nexus | `nexus.frankframework.org/frankframework` |

The image contains Apache Tomcat with the Frank!Framework deployed. It serves on port 8080.

For Docker installation, see [Docker documentation](https://docs.docker.com/get-docker/).

## Directory Layout

The image expects data in three directories:

| Path | Purpose |
|------|---------|
| `/opt/frank/configurations` | Frank configurations (XML, properties). Each subdirectory or archive is a separate configuration. Data is isolated between configurations. |
| `/opt/frank/resources` | Shared data accessible to all configurations: `resources.yml`, application-level properties. |
| `/opt/frank/drivers` | Third-party libraries (database drivers, JMS client libraries). |

## docker-compose.yml for Development

```yaml
services:
  frank-docker-example:
    image: frankframework/frankframework:latest
    ports:
      - 8080:8080
    volumes:
      - ./configurations:/opt/frank/configurations
      - ./resources:/opt/frank/resources
    environment:
      instance.name: frank-docker-example
      dtap.stage: LOC
      configurations.directory.autoLoad: true
```

Setting `configurations.directory.autoLoad: true` causes the framework to load all subdirectories and archives in `/opt/frank/configurations` automatically. This works from Frank!Framework version 9.3.0-20250806.042330 onwards.

Start with `docker compose up`. The console is available at `http://localhost:8080`.

## Resources Configuration (resources.yml)

File `resources.yml` in `/opt/frank/resources` defines datasources and JMS connections.

### Minimal H2 Database

```yaml
jdbc:
  - name: "frank-docker-example"
    type: "org.h2.jdbcx.JdbcDataSource"
    url: "jdbc:h2:mem:h2;DB_CLOSE_ON_EXIT=FALSE;DB_CLOSE_DELAY=-1;"
```

The `name` field corresponds to the resource name without the `jdbc/` prefix. The default database name is `jdbc/${instance.name.lc}` (instance name in lowercase).

For in-memory H2 databases, include `DB_CLOSE_ON_EXIT=FALSE` to prevent data loss when connections are closed.

To start without a database, set `jdbc.required=false`.

### Fields

| Field | Description |
|-------|-------------|
| `name` | Resource name (without `jdbc/` or `jms/` prefix) |
| `type` | Java class for the driver/datasource/connection factory |
| `url` | Connection URL |
| `authalias` | Credential alias (takes precedence over username/password) |
| `username` | Username for authentication |
| `password` | Password for authentication |
| `properties` | Additional name/value pairs passed to the driver |

## Dockerfile for Packaging Configurations

For production, package configurations into the image rather than using volumes:

```dockerfile
ARG PG_VERSION
FROM frankframework/frankframework:latest
ARG PG_VERSION
ADD --chown=tomcat https://jdbc.postgresql.org/download/postgresql-${PG_VERSION}.jar /opt/frank/drivers/postgresql-${PG_VERSION}.jar
COPY src/main/configurations/MyConfig /opt/frank/configurations/MyConfig
```

Corresponding `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres
    ports:
      - 5432:5432
    environment:
      POSTGRES_PASSWORD: testiaf_user00
      POSTGRES_USER: testiaf_user
      POSTGRES_DB: testiaf
  ff:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        PG_VERSION: 42.7.8
    ports:
      - 8080:8080
    volumes:
      - ./src/main/resources:/opt/frank/resources
    environment:
      jdbc.hostname: db
```

No volume is needed for `/opt/frank/configurations` since it is populated during image build. The `/opt/frank/resources` volume allows system administrators to configure resources externally.

Configurations with custom Java code must be packaged as `.jar` or `.zip` archives and require the property `configurations.<configuration name>.allowCustomClasses=true`.

## Transport Security

- HTTP is only allowed when `dtap.stage=LOC`.
- All other DTAP stages require HTTPS by default.
- Override with `application.security.http.transportGuarantee=none`.

## Internal Network Isolation

Restrict a Frank!Framework server to an internal Docker network by omitting the `ports` entry:

```yaml
services:
  frank-server:
    image: frankframework/frankframework:latest
    volumes:
      - ./server/configurations:/opt/frank/configurations
    environment:
      instance.name: frank-server
      dtap.stage: DEV
      configurations.directory.autoLoad: true
      application.security.http.transportGuarantee: none
  frank-client:
    image: frankframework/frankframework:latest
    ports:
      - 8080:8080
    volumes:
      - ./client/configurations:/opt/frank/configurations
    environment:
      instance.name: frank-client
      dtap.stage: LOC
```

The server has no `ports` entry, making it accessible only within the Docker Compose internal network. The client connects using the internal Docker DNS name (e.g., `http://frank-server:8080`).
