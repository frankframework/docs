---
title: Configuration Issues
description: Troubleshooting configuration-related problems in Frank!Framework.
sidebar_position: 1
---

# Configuration Issues

## ManageDatabase Error on Startup

**Problem:** Adapter status page shows an error in adapter `ManageDatabase` about a missing datasource.

**Cause:** File names are lowercase. For example, `deploymentspecifics.properties` and `configuration.xml` instead of the required `DeploymentSpecifics.properties` and `Configuration.xml`.

**Fix:** Correct file names to use proper casing.

## Passing XML Parameter to XSLT

**Problem:** An XSLT transformation parameter of type XML is interpreted as a string.

**Fix:** Set `type="domdoc"` on the `<Param>` element. See the [XsltPipe reference](https://reference.frankframework.org/#/components/XsltPipe) for all available attributes:

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

## XmlSwitchPipe "Premature end of file"

**Cause:** Input message is not valid XML.

[`XmlSwitchPipe`](https://reference.frankframework.org/#/components/XmlSwitchPipe) requires valid XML input and applies an XSLT stylesheet to determine the forward. With attribute `sessionKey`, the pipe uses the session key value directly as the forward without XSLT transformation.

## Logging with LogSender

Add logging with `<LogSender>`. Set `logCategory` to control the category name (defaults to the sender's name). Output goes to `${instance.name.lc}.log` by default.

## Filling Adapter Response from Session Key

Use [`EchoPipe`](https://reference.frankframework.org/#/components/EchoPipe) with `getInputFromSessionKey` to output a session key value as the adapter response.

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

## Iterating Over CSV Files

Use [`CsvParserPipe`](https://reference.frankframework.org/#/components/CsvParserPipe) (available since version 7.6). For older versions, use [`BatchFileTransformerPipe`](https://reference.frankframework.org/#/components/BatchFileTransformerPipe).

