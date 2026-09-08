---
sidebar_position: 6
---

# Error Message Formatters

Error message formatters control how the Frank!Framework formats error responses returned by adapters. When a pipeline finishes with a state other than `SUCCESS`, or when an unhandled exception occurs, the error message formatter determines the structure and content of the response sent back to the caller.

## Default Behavior

By default, the framework wraps error information in an XML envelope containing the error message, the adapter name, and the message ID. The exact format depends on the listener type that received the request.

## Configuring an ErrorMessageFormatter

An `errorMessageFormatter` is configured on a `<Receiver>`. It determines how errors produced by that receiver's pipeline are presented to the caller.

```xml
<Adapter name="MyAdapter">
  <Receiver name="input">
    <ApiListener name="inputListener" uriPattern="myService" method="POST"/>
  </Receiver>
  <XslErrorMessageFormatter styleSheetName="errorResponse.xsl"/>
  <Pipeline>
    ...
  </Pipeline>
</Adapter>
```

## Available Formatters

| Formatter Class | Description |
|----------------|-------------|
| `ErrorMessageFormatter` | Default formatter. Wraps error details in a simple XML or JSON structure. |
| `XslErrorMessageFormatter` | Applies an XSLT stylesheet to produce a custom error response. |
| `DataSonnetErrorMessageFormatter` | Applies a DataSonnet stylesheet to produce a custom error response. |
| `SoapErrorMessageFormatter` | Produces a SOAP Fault envelope for SOAP-based services. |
| `FixedErrorMessageFormatter` | Returns a fixed, preconfigured error message regardless of the actual error. |

For a complete and up-to-date list of all available formatters and their attributes, see the [FF! Reference](https://reference.frankframework.org/#/search?search=ErrorMessageFormatter).

## XslErrorMessageFormatter Example

Use `XslErrorMessageFormatter` when you need full control over the error response format:

```xml
<Adapter name="MyAdapter">
  <Receiver name="input">
    <ApiListener name="inputListener" uriPattern="myService" method="POST"/>
  </Receiver>
  <XslErrorMessageFormatter styleSheetName="errorResponse.xsl"/>
  <Pipeline>
    ...
  </Pipeline>
</Adapter>
```

The stylesheet receives an XML document containing the error details and can transform it into any desired output format (JSON, custom XML, plain text, etc.).

## Use Cases

- **Security**: Hide internal error details from external consumers by controlling exactly what parts of the error are returned.
- **Compliance**: Format error responses according to a specific standard (SOAP Fault, RFC 7807, etc.).
- **Integration**: Match error formats expected by upstream systems that consume your API.


## DataSonnetErrorMessageFormatter Example

Use `DataSonnetErrorMessageFormatter` when you need full control over the error response format but prefer to work with JSON rather than XML:
```xml
<Adapter name="MyAdapter">
  <Receiver name="input">
    <ApiListener name="inputListener" uriPattern="myService" method="POST"/>
  </Receiver>
  <DataSonnetErrorMessageFormatter styleSheetName="errorResponse.jsonnet"/>
  <Pipeline>
    ...
  </Pipeline>
</Adapter>
```

The stylesheet receives a JSON document containing the error details and can transform it into any desired output format (JSON, custom XML, plain text, CSV, etc.).

## Use Cases

- **Security**: Hide internal error details from external consumers by controlling exactly what parts of the error are returned.
- **Compliance**: Format error responses according to a specific standard (SOAP Fault, RFC 7807, etc.).
- **Integration**: Match error formats expected by upstream systems that consume your API.


## FixedErrorMessageFormatter Example

When you want to hide internal error details from external callers:

```xml
<Adapter name="MyAdapter">
  <Receiver name="input">
    <ApiListener name="inputListener" uriPattern="myService" method="POST"/>
  </Receiver>
  <FixedErrorMessage fileName="genericError.xml"/>
  <Pipeline>
    ...
  </Pipeline>
</Adapter>
```

## Use Cases

- **Security**: Hide internal error details from external consumers by returning generic messages.
- **Compliance**: Format error responses according to a specific standard (SOAP Fault, RFC 7807, etc.).
- **Integration**: Match error formats expected by upstream systems that consume your API.
