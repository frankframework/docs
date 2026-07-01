# Error Message Formatters

Error message formatters control how the Frank!Framework formats error responses returned by adapters. When a pipeline finishes with a state other than `SUCCESS`, or when an unhandled exception occurs, the error message formatter determines the structure and content of the response sent back to the caller.

## Default Behavior

By default, the framework wraps error information in an XML envelope containing the error message, the adapter name, and the message ID. The exact format depends on the listener type that received the request.

## Configuring an ErrorMessageFormatter

An `errorMessageFormatter` is configured on a `<Receiver>`. It determines how errors produced by that receiver's pipeline are presented to the caller.

```xml
<Receiver name="input">
  <ApiListener name="inputListener" uriPattern="myService" method="POST"/>
  <errorMessageFormatter className="org.frankframework.errormessageformatters.XslErrorMessageFormatter"
      styleSheetName="errorResponse.xsl"/>
</Receiver>
```

## Available Formatters

| Formatter Class | Description |
|----------------|-------------|
| `ErrorMessageFormatter` | Default formatter. Wraps error details in a simple XML structure. |
| `XslErrorMessageFormatter` | Applies an XSLT stylesheet to produce a custom error response. |
| `SoapErrorMessage` | Produces a SOAP Fault envelope for SOAP-based services. |
| `FixedErrorMessage` | Returns a fixed, preconfigured error message regardless of the actual error. |

For a complete and up-to-date list of all available formatters and their attributes, see the [FF! Reference](https://reference.frankframework.org/#/components).

## XslErrorMessageFormatter Example

Use `XslErrorMessageFormatter` when you need full control over the error response format:

```xml
<Receiver name="input">
  <ApiListener name="inputListener" uriPattern="orders" method="POST"/>
  <errorMessageFormatter className="org.frankframework.errormessageformatters.XslErrorMessageFormatter"
      styleSheetName="errorFormat.xsl"/>
</Receiver>
```

The stylesheet receives an XML document containing the error details and can transform it into any desired output format (JSON, custom XML, plain text, etc.).

## FixedErrorMessage Example

When you want to hide internal error details from external callers:

```xml
<Receiver name="input">
  <ApiListener name="inputListener" uriPattern="public/api" method="POST"/>
  <errorMessageFormatter className="org.frankframework.errormessageformatters.FixedErrorMessage"
      fileName="genericError.xml"/>
</Receiver>
```

## Use Cases

- **Security**: Hide internal error details from external consumers by returning generic messages.
- **Compliance**: Format error responses according to a specific standard (SOAP Fault, RFC 7807, etc.).
- **Integration**: Match error formats expected by upstream systems that consume your API.
