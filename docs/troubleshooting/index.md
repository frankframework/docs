---
title: Troubleshooting
description: Common issues and solutions for Frank!Framework.
---

# Troubleshooting

## ManageDatabase Error on Startup

**Problem:** Adapter status page shows an error in adapter `ManageDatabase` about a missing datasource.

**Cause:** File names are lowercase. For example, `deploymentspecifics.properties` and `configuration.xml` instead of the required `DeploymentSpecifics.properties` and `Configuration.xml`.

**Fix:** Correct file names to use proper casing.

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

## Passing XML Parameter to XSLT

**Problem:** An XSLT transformation parameter of type XML is interpreted as a string.

**Fix:** Set `type="domdoc"` on the `<Param>` element:

```xml
<XsltPipe
    name="transformHermesMessage"
    styleSheetName="printBridge.xsl"
    omitXmlDeclaration="true"
    xsltVersion="2"
    getInputFromSessionKey="originalMessage">
  <Param
      name="statistics"
      sessionKey="statistics"
      type="domdoc"/>
  <Forward name="success" path="sendToPrintBridge"/>
</XsltPipe>
```

## XPath Expression with Null Default Value

**Problem:** Inserting a table row using `FixedQuerySender` with an XPath expression and needing `null` as the default.

**Fix:** Omit the `defaultValue` attribute. When the XPath expression finds nothing, the value is `null` by default.

```xml
<Param name="myParam" xpathExpression="/BIJKANT/PK/PK_NUMMER"/>
```

## Logging with LogSender

Add logging with `<LogSender>`. Set `logCategory` to control the category name (defaults to the sender's name). Output goes to `${instance.name.lc}.log` by default.

## Testing XSLT with Larva

```
scenario.description = adapt input ldap insert into functionally expired passwords

xpl.MaakLdapInput.className   = org.frankframework.larva.XsltProviderListener
xpl.MaakLdapInput.filename    = ../../../JavaSource/CheckPasswordFunctionalExpired/xsl/AdaptInputLdapInsertIntoPasswordFunctionalExpired.xsl

step1.xpl.MaakLdapInput.read              = scenario01/step1.xml
step1.xpl.MaakLdapInput.read.param1.name  = userType
step1.xpl.MaakLdapInput.read.param1.value = WN
step2.xpl.MaakLdapInput.write             = scenario01/step2.xml
```

## Larva Tests: No Restart Needed

Edited Larva tests take effect immediately without restarting the Frank!Framework or reloading configurations.

## Parameters in Larva Tests

Inline value:

```
adapter.TitanGET.param1.name=uniqueIdentifier
adapter.TitanGET.param1.value=abc
```

Value from file:

```
adapter.TitanGET.param1.name=uniqueIdentifier
adapter.TitanGET.param1.valuefile=01/input.xml
```

## Transaction Attribute: Receiver vs Pipeline

Both `<Receiver>` and `<Pipeline>` support `transactionAttribute`.

- **Receiver:** Controls transaction for message acceptance (e.g., reading from a queue). If the receiver supports transactions and has `transactionAttribute` set, the pipeline inherits the transaction.
- **Pipeline:** Controls transaction for message processing.

> **Warning:** If a receiver does not support transactions, regardless of `transactionAttribute`, and there is no `transactionAttribute` on the pipeline, the pipeline does not inherit a transaction.

## Loading Multiple Configurations at Once

Pack all configuration JAR files into a single `.zip` file. Use the "Multiple Configurations" checkbox in the "Upload Configuration" screen and upload the zip.

## Property `configurations.<configname>.parentConfig`

Changes the file/property lookup order. For each file or property, the framework looks up:

1. Global setting (classpath resource or environment property)
2. Local configuration
3. Parent configuration (if specified)
4. WAR (`src/main/resources`)

## Authorization to Enable Ladybug

Required role: `IbisDataAdmin`, `IbisAdmin`, or `IbisTester`.

## Flow Diagram Images

Property `flow.adapter.dir` holds the directory where flow diagrams are saved. Find its value under "Environment Variables" in the Frank!Console.

## XmlSwitchPipe "Premature end of file"

**Cause:** Input message is not valid XML.

`XmlSwitchPipe` requires valid XML input and applies an XSLT stylesheet to determine the forward. With attribute `sessionKey`, the pipe uses the session key value directly as the forward without XSLT transformation.

## Testing ApiListener with Authentication Locally

Make `authenticationMethod` a property:

```
${api.authMethod}
```

Disable in `StageSpecifics_LOC.properties`:

```
api.authMethod=NONE
servlet.ApiListenerServlet.securityroles=
```

## Liquibase Validation Failure Logs

From version 7.6+, the Frank!Console warning includes the failure reason. For older versions, check the regular logfile at WARN level or lower.

## Filling Adapter Response from Session Key

Use `EchoPipe` with `getInputFromSessionKey` to output a session key value as the adapter response.

## Reading Auto-Generated Keys from Database

Use `FixedQuerySender` with `columnsReturned` attribute (comma-separated column names) on INSERT or UPDATE queries. Set `scalar="true"` to get a plain value instead of XML.

> **Warning:** This feature does not work for all database drivers/versions.

## Iterating Over CSV Files

Use `CsvParserPipe` (available since version 7.6). For older versions, use `BatchFileTransformerPipe`.

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

## Watching Frank!Framework Startup

- `INFO [main] org.apache.catalina.core.ApplicationContext.log Starting IbisContext` — framework startup begins
- `INFO [main] org.apache.catalina.startup.Catalina.start Server startup in [xxx] milliseconds` — ready to receive HTTP requests

## ApiListener and curl Content-Type Issue

**Problem:** Using `curl --data` automatically adds `Content-Type: application/x-www-form-urlencoded`, causing unexpected behavior (empty input message, data treated as form parameter).

**Fix:** Suppress the header:

```
curl -H "Content-Type:" --request POST --url http://localhost/api/ingestDocument --data 'your-data'
```

## Adapters Stopped by Default

Use `autoStart="false"` on the `<Adapter>` element:

```xml
<Adapter name="Adapter1a" autoStart="false">
    <Receiver name="Receiver1a">
        ...
    </Receiver>
    ...
</Adapter>
```

The adapter starts in stopped state and can be started manually from the Adapter Status page.

## Security Warning: Path/Query Parameters Copied to Session

**Cause:** `ApiListener` without explicit parameter restrictions.

**Options:**

- If all parameters are needed: suppress the warning (see logfile for instructions)
- If no parameters are needed: set `allowAllParams="false"`
- If specific parameters are needed: list them in `allowedParameters` (this automatically restricts to listed parameters)

## Custom Code: IllegalAccessError Between Classes

**Problem:** `IllegalAccessError: failed to access class` when custom classes are loaded by different classloaders (`URLClassLoader` vs `DirectoryClassLoader`).

**Cause:** The JVM treats classes from different classloaders as separate unnamed modules, blocking non-public access.

**Fix:** Make all custom Java classes `public`, or define helper classes as inner classes within the custom pipe.

## Credential Factory Not Working

**Problem:** HTTP 401 from external system despite configured credentials.

**Fix:** Check Application Server startup logs (e.g., `${catalina.home}/logs`) for credential factory initialization errors. Example:

```
WARNING [main] org.frankframework.credentialprovider.CredentialFactory.tryFactory Cannot instantiate CredentialFactory [org.frankframework.credentialprovider.FileSystemCredentialFactory]
```

These errors do not appear as console warnings.
