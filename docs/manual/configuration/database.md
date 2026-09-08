---
sidebar_position: 4
---

# Database Configuration

## Database Access

Senders and listeners that access a database use the `datasourceName` attribute to reference a database by name. The standard pattern is:

```xml
datasourceName="jdbc/${instance.name.lc}"
```

The property `instance.name.lc` is automatically derived from `instance.name` by converting to lowercase. If `instance.name` is `MyApp`, then `instance.name.lc` is `myapp`, and the datasource resolves to `jdbc/myapp`.

## Configuring Databases via `resources.yml`

Database connections are defined in `resources.yml`. When using the standard Frank!Framework Docker image, the expected path is `/opt/frank/resources/resources.yml`.

```yaml
jdbc:
  - name: "myapp"
    type: "org.postgresql.xa.PGXADataSource"
    url: "jdbc:postgresql://localhost:5432/myapp"
    username: "myapp_user"
    password: "myapp_pass"
    properties:
      defaultAutoCommit: "false"
```

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | The part after `jdbc/` in the datasource name. For `jdbc/myapp`, use `myapp`. |
| `type` | Java class of the datasource or driver (see [Driver Configuration](#database-driver-configuration)). |
| `url` | JDBC connection URL (see [URL Formats](#url-formats)). |

### Authentication

Credentials are provided via `username`/`password` fields, or via `authalias` for secret management. If both are present, `authalias` takes precedence.

```yaml
jdbc:
  - name: "myapp"
    type: "org.postgresql.xa.PGXADataSource"
    url: "jdbc:postgresql://localhost:5432/myapp"
    authalias: "${db.authalias}"
```

Environment properties and application properties can be referenced in `resources.yml` using `${property.name}` syntax, with defaults via `${property.name:-default}`.

### The `properties` Field

Vendor-specific connection properties are configured under the `properties` field:

```yaml
jdbc:
  - name: "ibis4test-mssql"
    type: "com.microsoft.sqlserver.jdbc.SQLServerXADataSource"
    url: "jdbc:sqlserver://localhost:1433;database=testiaf"
    username: "testiaf_user"
    password: "testiaf_user00"
    properties:
      sendStringParametersAsUnicode: "false"
      sendTimeAsDatetime: "true"
      selectMethod: "direct"
```

## Multiple Databases

To use multiple databases, define additional entries in `resources.yml` with distinct names and reference them in configurations via `datasourceName`:

```xml
datasourceName="jdbc/alternative"
```

```yaml
jdbc:
  - name: "myapp"
    type: "org.postgresql.xa.PGXADataSource"
    url: "jdbc:postgresql://localhost:5432/myapp"
    username: "user1"
    password: "pass1"
  - name: "alternative"
    type: "org.postgresql.xa.PGXADataSource"
    url: "jdbc:postgresql://otherhost:5432/otherdb"
    username: "user2"
    password: "pass2"
```

## Default Database

The Frank!Framework uses a default database for internal data (e.g., error store). The default database name is controlled by:

```properties
jdbc.datasource.default=jdbc/${instance.name.lc}
```

Set this property to a different value to change the default database. On Apache Tomcat, the framework expects this database to exist.

## Database Initialization with Liquibase

### Enabling Migration

Database initialization requires:

```properties
jdbc.migrator.active=true
```

When set as an environment property or classpath property, the Frank!Framework creates both system tables (error store, etc.) and application tables. When set only within a configuration, only application tables defined in that configuration's `DatabaseChangelog.xml` are created — system tables are not.

### `DatabaseChangelog.xml`

Include a `DatabaseChangelog.xml` in your Frank configuration to define tables and initial data. Change sets can be written in SQL or database-agnostic XML. See [Liquibase documentation](https://www.liquibase.org/) for syntax.

Change sets are wrapped in `<changeSet>` elements:

```xml
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog">
    <changeSet id="1" author="dev">
        <!-- table definitions, inserts, etc. -->
    </changeSet>
</databaseChangeLog>
```

### Multi-Instance Behavior

Liquibase tracks which change sets have been applied in database tables. When multiple Frank!Framework instances share a database, each instance only applies change sets not yet processed. **Never modify existing change sets** — always append new ones.

### Target Database

By default, Liquibase operates on the default database. Override with:

```properties
jdbc.migrator.dataSource=jdbc/alternative
```

## Database Driver Configuration

Database vendor libraries must be placed in `/opt/frank/drivers`. This can be done in a Containerfile or by mounting the directory as a volume.

### Datasource Type vs Driver Type

The `type` field in `resources.yml` specifies a Java class. Two categories exist:

- **DataSource** (recommended): Configures a connection directly with full control over settings.
- **Driver** (discouraged): A wrapper that attempts to initialize a DataSource with potentially biased defaults. Drivers do not provide additional functionality and typically wrap a non-XA DataSource.

Always prefer configuring a DataSource directly.

### DataSource Classes

:::info

These classes are only examples and may differ depending on driver vendor and version.

:::

| Brand | Non-XA DataSource | XA DataSource |
|-------|-------------------|---------------|
| PostgreSQL | `org.postgresql.ds.PGSimpleDataSource` | `org.postgresql.xa.PGXADataSource` |
| MariaDB | `org.mariadb.jdbc.MariaDbDataSource` | `org.mariadb.jdbc.MariaDbDataSource` |
| MySQL | `com.mysql.cj.jdbc.MysqlDataSource` | `com.mysql.cj.jdbc.MysqlXADataSource` |
| MS SQL | `com.microsoft.sqlserver.jdbc.SQLServerDataSource` | `com.microsoft.sqlserver.jdbc.SQLServerXADataSource` |
| Oracle | `oracle.jdbc.pool.OracleDataSource` | `oracle.jdbc.xa.client.OracleXADataSource` |
| H2 | `org.h2.jdbcx.JdbcDataSource` | `org.h2.jdbcx.JdbcDataSource` |

XA DataSources require a transaction manager (e.g., Narayana) to coordinate XA transactions across multiple systems (databases, queues).

### Driver Classes (Discouraged)

| Brand | Driver Class |
|-------|-------------|
| PostgreSQL | `org.postgresql.Driver` |
| MariaDB | `org.mariadb.jdbc.Driver` |
| MySQL | `com.mysql.cj.jdbc.Driver` |
| MS SQL | `com.microsoft.sqlserver.jdbc.SQLServerDriver` |
| Oracle | `oracle.jdbc.driver.OracleDriver` |
| H2 | `org.h2.Driver` |

### URL Formats

| Brand | URL Template |
|-------|-------------|
| PostgreSQL | `jdbc:postgresql://<host>:5432/<database>` |
| MariaDB | `jdbc:mariadb://<host>:3306/<database>` |
| MySQL | `jdbc:mysql://<host>:3306/<database>` |
| MS SQL | `jdbc:sqlserver://<host>:1433;database=<database>` |
| Oracle | `jdbc:oracle:thin:@<host>:1521:<database>` |
| H2 (in-memory) | `jdbc:h2:mem:<database>` |
| H2 (file) | `jdbc:h2:<directory>/<database>` |

Port numbers shown are defaults and may be omitted. A non-default port requires the database to be configured to listen on that port.

### Driver Downloads

| Brand | Download                                                                                                                     |
|-------|------------------------------------------------------------------------------------------------------------------------------|
| PostgreSQL | [Maven Repository](https://mvnrepository.com/artifact/org.postgresql/postgresql)                                             |
| MariaDB | [Maven Repository](https://mvnrepository.com/artifact/org.mariadb.jdbc/mariadb-java-client)                                  |
| MySQL | [Maven Repository](https://mvnrepository.com/artifact/com.mysql/mysql-connector-j)                                           |
| MS SQL | [Maven Repository](https://mvnrepository.com/artifact/com.microsoft.sqlserver/mssql-jdbc) (JRE 11 versions work with JRE 21) |
| Oracle | [Maven Repository](https://mvnrepository.com/artifact/com.oracle.database.jdbc/ojdbc11)                                      |
| H2 | [Maven Repository](https://mvnrepository.com/artifact/com.h2database/h2)                                                     |

## Vendor-Specific Notes

### PostgreSQL

For XA transactions, set `max_prepared_transactions` in the database:

```sql
ALTER SYSTEM SET max_prepared_transactions = 100;
```

Without this, XA transactions may roll back unexpectedly with error: `prepared transactions are disabled`.

### H2

Recommended `properties` configuration:

```yaml
jdbc:
  - name: "myapp"
    type: "org.h2.jdbcx.JdbcDataSource"
    url: "jdbc:h2:mem:myapp"
    username: "sa"
    password: ""
    properties:
      DB_CLOSE_DELAY: "-1"
      DB_CLOSE_ON_EXIT: "FALSE"
      AUTO_RECONNECT: "TRUE"
      MODE: "Post"
```

To reset an H2 database initialized by Liquibase, execute `DROP ALL OBJECTS` in the JDBC Execute Query screen.
