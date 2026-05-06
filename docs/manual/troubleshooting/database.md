---
title: Database Issues
description: Troubleshooting database-related problems in Frank!Framework.
sidebar_position: 2
---

# Database Issues

## SQL Syntax Error in Liquibase Changeset

**Problem:** Startup produces a `JdbcSQLSyntaxErrorException` referencing SQL in `DatabaseChangelog.xml`.

**Example error:**

```
CREATE TABLE visit (...)
ALTER TABLE visit ADD FOREIGN KEY (bookingId) REFERENCES booking(id)
```

**Cause:** Multiple SQL statements within a single `<sql>` element require a semicolon separator.

**Fix:** Add `;` between statements:

```xml
<changeSet id="2" author="martijn">
    <sql>
        CREATE TABLE visit (
            bookingId INT NOT NULL,
            seq INT NOT NULL,
            hostId INT NOT NULL,
            productId INT NOT NULL,
            startDate date NOT NULL,
            endDate date NOT NULL,
            price DECIMAL NOT NULL,
            PRIMARY KEY (bookingId, seq)
        );
        ALTER TABLE visit ADD FOREIGN KEY (bookingId) REFERENCES booking(id)
    </sql>
</changeSet>
```

The changeset ID is identified in the stack trace: `Migration failed for change set DatabaseChangelog.xml::2::martijn:`.

## H2 In-Memory Database: IBISSTORE Table Missing

**Cause:** Incorrect `type` or `driverClassName` in `context.xml`.

**Fix:**

```xml
<Resource
    name="jdbc/ibis4pt"
    type="javax.sql.DataSource"
    driverClassName="org.h2.Driver"
    url="jdbc:h2:mem:ibis4pt"
/>
```

## Liquibase Validation Failure Logs

From version 7.6+, the Frank!Console warning includes the failure reason. For older versions, check the regular logfile at WARN level or lower.

## Reading Auto-Generated Keys from Database

Use `FixedQuerySender` with `columnsReturned` attribute (comma-separated column names) on INSERT or UPDATE queries. Set `scalar="true"` to get a plain value instead of XML.

> **Warning:** This feature does not work for all database drivers/versions.

