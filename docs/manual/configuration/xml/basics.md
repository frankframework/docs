---
sidebar_position: 1
---

# XML Configuration Basics

A Frank!Framework application is defined by XML configuration files validated against `FrankConfig.xsd`. The root element is `<Configuration>`, which contains one or more `<Adapter>` elements.

## Minimal Configuration

```xml
<Configuration
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="../FrankConfig.xsd">
  <Adapter name="Adapter1a">
    <Receiver name="Receiver1a">
      <ApiListener name="Listener1a" uriPattern="service1a"/>
    </Receiver>
    <Pipeline>
      <EchoPipe name="HelloWorld" getInputFromFixedValue="Hello World!"/>
    </Pipeline>
  </Adapter>
</Configuration>
```

## Core Elements

| Element | Purpose |
|---------|---------|
| `<Configuration>` | Root element; references the XSD schema |
| `<Adapter>` | A named service unit combining a receiver and a pipeline |
| `<Receiver>` | Defines how the adapter is triggered (contains a listener) |
| `<Pipeline>` | Defines the processing logic (contains pipes and exits) |

An adapter is triggered by its receiver and executes its pipeline. Each configuration can contain multiple adapters. Configurations are independent packages that can be loaded and refreshed without restarting the framework.

## Listeners

Listeners define how an adapter receives input. They are placed inside a `<Receiver>`.

| Listener | Trigger |
|----------|---------|
| `<ApiListener>` | RESTful HTTP requests |
| `<JavaListener>` | Direct Java invocations |
| `<DirectoryListener>` | File system events |

### ApiListener

```xml
<Receiver name="input">
  <ApiListener
      name="inputListener"
      uriPattern="booking"
      allowedParameters="comma,separated,listOfParams"
      method="POST"/>
</Receiver>
```

Key attributes:
- `uriPattern` — URL path segment (accessible at `/api/{uriPattern}`)
- `method` — HTTP method (GET, POST, PUT, DELETE)
- `allowedParameters` — A comma separated list with query parameters that may be used
- `allowAllParams` — Disable the use of query parameters completely
## Pipeline and Exits

A pipeline contains an `<Exits>` block and one or more pipes. The `firstPipe` attribute specifies the entry point. Without `firstPipe`, pipes execute sequentially.

```xml
<Pipeline firstPipe="checkInput">
  <Exits>
    <Exit name="Exit" state="SUCCESS" code="201"/>
    <Exit name="BadRequest" state="ERROR" code="400"/>
  </Exits>
  <!-- pipes here -->
</Pipeline>
```

Each exit has a `name`, a `state` (SUCCESS or ERROR), and an HTTP response `code`.

## Pipes

Pipes are the processing units inside a pipeline and have control over the processing flow. As such each pipe must have an unique name using the `name` attribute and one or more `<Forward>` elements. For a complete and up-to-date list of all available pipes, possible sub-elements and their attributes, see the [FF! Reference](https://reference.frankframework.org/#/components).

### EchoPipe

Returns its input unchanged, or a fixed value if `getInputFromFixedValue` is set. See the [EchoPipe reference](https://reference.frankframework.org/#/Components/Pipes/EchoPipe) for all available attributes.

```xml
<EchoPipe
    name="makeInvalidBookingError"
    getInputFromFixedValue="Input booking does not satisfy booking.xsd">
  <Forward name="success" path="BadRequest"/>
</EchoPipe>
```

### XmlValidatorPipe

Validates the incoming XML message against an XSD schema. See the [XmlValidatorPipe reference](https://reference.frankframework.org/#/Components/Pipes/XmlValidatorPipe) for all available attributes.

```xml
<XmlValidatorPipe
    name="checkInput"
    root="booking"
    schema="booking.xsd">
  <Forward name="success" path="insertBooking"/>
  <Forward name="failure" path="makeInvalidBookingError"/>
</XmlValidatorPipe>
```

- `root` — expected root element name
- `schema` — path to XSD file (relative to configuration directory)
- Produces a `success` or `failure` forward

### SenderPipe

Wraps a sender to communicate with external systems (databases, services, etc.). Unlike a `Pipe` senders do not control the flow of execution and may not be placed directly inside a `Pipeline` but must be wrapped by either a `SenderPipe` any type of `IteratingPipe`. See the [SenderPipe reference](https://reference.frankframework.org/#/Components/Pipes/SenderPipe) for all available attributes.

```xml
<SenderPipe name="insertBooking">
  <FixedQuerySender
      name="insertBookingSender"
      query="INSERT INTO booking VALUES(?, ?, ?, ?)"
      datasourceName="jdbc/${instance.name.lc}">
    <Param name="id" xpathExpression="/booking/@id"/>
    <Param name="travelerId" xpathExpression="/booking/travelerId"/>
    <Param name="price" xpathExpression="/booking/price"/>
    <Param name="fee" xpathExpression="/booking/fee"/>
  </FixedQuerySender>
  <Forward name="success" path="next-pipe-to-execute"/>
</SenderPipe>
```

### XsltPipe

Applies an XSLT stylesheet to transform XML. See the [XsltPipe reference](https://reference.frankframework.org/#/Components/Pipes/XsltPipe) for all available attributes.

```xml
<XsltPipe
    name="getDestinations"
    styleSheetName="booking2destinations.xsl"
    getInputFromSessionKey="originalMessage">
  <Forward name="success" path="iterateDestinations"/>
</XsltPipe>
```

- `styleSheetName` — path to the XSLT file
- `getInputFromSessionKey` — reads input from a session variable instead of the current message. The `originalMessage` session key automatically holds the message as it entered the pipeline.

### ForEachChildElementPipe

Iterates over XML elements matching an XPath expression, applying a sender to each. See the [ForEachChildElementPipe reference](https://reference.frankframework.org/#/Components/Pipes/ForEachChildElementPipe) for all available attributes.

```xml
<ForEachChildElementPipe
    name="iterateDestinations"
    elementXPathExpression="/destinations/destination">
  <FixedQuerySender
      name="insertVisitSender"
      query="INSERT INTO visit VALUES(?, ?, ?, ?, ?, ?, ?)"
      datasourceName="jdbc/${instance.name.lc}">
    <Param name="bookingId" xpathExpression="/destination/bookingId"/>
    <Param name="seq" xpathExpression="/destination/seq"/>
    <Param name="hostId" xpathExpression="/destination/hostId"/>
    <Param name="productId" xpathExpression="/destination/productId"/>
    <Param name="startDate" xpathExpression="/destination/startDate"/>
    <Param name="endDate" xpathExpression="/destination/endDate"/>
    <Param name="price" xpathExpression="/destination/price"/>
  </FixedQuerySender>
  <Forward name="success" path="Exit"/>
</ForEachChildElementPipe>
```

- `elementXPathExpression` — XPath selecting the child elements to iterate over
- `<Param>` XPath expressions inside this pipe operate on the current iteration element

## Forwards and Flow Control

Each pipe declares `<Forward>` elements that determine which pipe (or exit) executes next.

```xml
<Forward name="success" path="nextPipeName"/>
<Forward name="failure" path="ErrorExit"/>
```

- `name` — the outcome name (pipe-specific; common values are `success` and `failure`)
- `path` — the name of the next pipe or exit

This mechanism enables branching: different outcomes route to different pipes.

## Senders

### FixedQuerySender

Executes SQL queries against a JDBC datasource.

```xml
<FixedQuerySender
    name="insertBookingSender"
    query="INSERT INTO booking VALUES(?, ?, ?, ?)"
    datasourceName="jdbc/${instance.name.lc}">
  <Param name="id" xpathExpression="/booking/@id"/>
  <Param name="travelerId" xpathExpression="/booking/travelerId"/>
  <Param name="price" xpathExpression="/booking/price"/>
  <Param name="fee" xpathExpression="/booking/fee"/>
</FixedQuerySender>
```

- `query` — SQL statement with `?` positional parameters
- `datasourceName` — DataSource name; defaults to `${instance.name.lc}` which resolves to the lowercase instance name
- `<Param>` — binds values via XPath expressions; `/element` selects elements, `/@attr` selects attributes

#### Named Parameters

An alternative syntax uses named parameters:

```xml
<FixedQuerySender
    name="insertBookingSender"
    query="INSERT INTO booking VALUES(?{id}, ?{travelerId}, ?{price}, ?{fee})">
  <Param name="id" xpathExpression="/booking/@id"/>
  <Param name="travelerId" xpathExpression="/booking/travelerId"/>
  <Param name="price" xpathExpression="/booking/price"/>
  <Param name="fee" xpathExpression="/booking/fee"/>
</FixedQuerySender>
```

- The query-parameters in the SQL query may reference a specific parameter using `?{name}`
- You do not need to specify the `datasourceName` attribute if you wish to use the default.

## Database Initialization with Liquibase

Frank!Framework uses Liquibase for database schema management. Enable it by setting `jdbc.migrator.active=true`.
Each configuration may use their own changelog file. It is possible to change the name of the file and also to change the datasource it needs to apply the changelog to.

### DatabaseChangelog.xml

Place this file in the configuration directory. It defines schema changes as ordered changesets.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.0.xsd">

  <changeSet id="1" author="dev">
    <createTable tableName="booking">
      <column name="id" type="int">
        <constraints primaryKey="true" nullable="false"/>
      </column>
      <column name="travelerId" type="int">
        <constraints nullable="false"/>
      </column>
      <column name="price" type="decimal">
        <constraints nullable="false"/>
      </column>
      <column name="fee" type="decimal">
        <constraints nullable="false"/>
      </column>
    </createTable>
  </changeSet>
</databaseChangeLog>
```

Important rules:
- Never modify existing changesets after they have been applied. Always add new changesets.
- The default datasource when using the Frank!Framework is `jdbc/${instance.name.lc}` (e.g., `jdbc/frank2manual`).
- Use `DROP ALL OBJECTS` via JDBC Execute Query to reset an H2 database during development, this however does not reapply the migration changelog!

## XML Validation with XSD

Define an XSD schema file in the configuration directory and reference it from `<XmlValidatorPipe>`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="booking">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="travelerId" type="xs:integer"/>
        <xs:element name="price" type="money"/>
        <xs:element name="fee" type="money"/>
      </xs:sequence>
      <xs:attribute name="id" type="xs:integer"/>
    </xs:complexType>
  </xs:element>

  <xs:simpleType name="money">
    <xs:restriction base="xs:decimal">
      <xs:fractionDigits value="2"/>
    </xs:restriction>
  </xs:simpleType>
</xs:schema>
```

## XSLT Transformations

Use `<XsltPipe>` with an XSLT stylesheet to transform XML messages:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <destinations>
      <xsl:apply-templates select="booking/destination">
        <xsl:with-param name="bookingId" select="booking/@id"/>
      </xsl:apply-templates>
    </destinations>
  </xsl:template>

  <xsl:template match="destination">
    <xsl:param name="bookingId"/>
    <destination>
      <bookingId><xsl:value-of select="$bookingId"/></bookingId>
      <seq><xsl:value-of select="position()"/></seq>
      <hostId><xsl:value-of select="@hostId"/></hostId>
      <productId><xsl:value-of select="@productId"/></productId>
      <startDate><xsl:value-of select="startDate"/></startDate>
      <endDate><xsl:value-of select="endDate"/></endDate>
      <price><xsl:value-of select="price"/></price>
    </destination>
  </xsl:template>
</xsl:stylesheet>
```

## Transactions
Transactions are configured in a `<Receiver>` or in a `<Pipeline>`. You can control the use of transactions via the `transactionAttribute` on either of the elements to wrap all operations in a database transaction. If configured on the `Receiver` and not the `Pipeline`, the `Pipeline` will inherit the given transaction controlled by the `Receiver`.

```xml
<Pipeline firstPipe="checkInput" transactionAttribute="RequiresNew">
```

| Value | Behavior |
|-------|----------|
| `Required` | Ensures there is a transaction; inherits or create a new one if none exists. |
| `Supports` | Support a current transaction; execute non-transactionally if none exists. |
| `Mandatory` | Requires a transaction is present; throws an exception if no current transaction exists. |
| `RequiresNew` | Always create a new transaction, suspending the current transaction if one exists. |
| `NotSupported` | Do not support a transaction; remove it when present and always execute non-transactional. |
| `Never` | Do not support a transaction; throw an exception if a current transaction exists. |

- With transactions enabled, all database operations within the pipeline either succeed or roll back together (ACID semantics).
- It is possible to have different transactions for data transport and data processing.

## File Layout

A typical Frank!Framework configuration directory:

```
configurations/
  MyConfig/
    Configuration.xml
    DatabaseChangelog.xml
    StageSpecifics_LOC.properties
    xml/xsd/booking.xsd
    xml/xsl/booking2destinations.xsl
    webcontent/
      index.html
```
