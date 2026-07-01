# Exits and Global Forwards

This page covers advanced pipeline flow control: defining exits, using global forwards to reduce repetition, and structuring pipelines for clarity.

## Pipeline Exits

Every pipeline must declare at least one `<Exit>`. Exits define the possible end states of a pipeline and map to HTTP response codes (for API-based adapters).

```xml
<Pipeline>
  <Exits>
    <Exit name="Exit" state="SUCCESS" code="200"/>
    <Exit name="Created" state="SUCCESS" code="201"/>
    <Exit name="BadRequest" state="ERROR" code="400"/>
    <Exit name="NotFound" state="ERROR" code="404"/>
    <Exit name="ServerError" state="ERROR" code="500"/>
  </Exits>
  <!-- pipes here -->
</Pipeline>
```

### Exit Attributes

| Attribute | Description |
|-----------|-------------|
| `name` | Unique identifier; referenced by forwards in pipes |
| `state` | `SUCCESS` or `ERROR`; determines whether the result is treated as successful |
| `code` | HTTP status code returned to the caller (for HTTP-based listeners) |

A pipe routes to an exit by specifying the exit's `name` in a `<Forward>` element's `path` attribute.

## Global Forwards

When multiple pipes need to forward to the same exit or pipe (e.g., a shared error handler), declaring the same `<Forward>` on every pipe is repetitive. **Global forwards** solve this by defining forwards at the pipeline level that apply to all pipes.

```xml
<Pipeline>
  <Exits>
    <Exit name="Exit" state="SUCCESS" code="200"/>
    <Exit name="BadRequest" state="ERROR" code="400"/>
    <Exit name="ServerError" state="ERROR" code="500"/>
  </Exits>

  <GlobalForward name="exception" path="ServerError"/>
  <GlobalForward name="failure" path="BadRequest"/>

  <XmlValidatorPipe name="validate" root="order" schema="order.xsd">
    <Forward name="success" path="process"/>
    <!-- "failure" forward is inherited from the global forward -->
  </XmlValidatorPipe>

  <SenderPipe name="process">
    <FixedQuerySender query="INSERT INTO orders VALUES(?{id})" datasourceName="jdbc/${instance.name.lc}">
      <Param name="id" xpathExpression="/order/@id"/>
    </FixedQuerySender>
    <Forward name="success" path="Exit"/>
    <!-- "exception" forward is inherited from the global forward -->
  </SenderPipe>
</Pipeline>
```

### How Global Forwards Work

- A global forward applies to **all pipes** in the pipeline.
- If a pipe declares its own `<Forward>` with the same `name`, the pipe-level forward takes precedence (overrides the global).
- Global forwards are typically used for `failure` and `exception` outcomes that should route to the same exit across all pipes.

### Common Global Forward Names

| Forward Name | Typical Use |
|--------------|-------------|
| `success` | Default success path (rarely used globally) |
| `failure` | Validation or processing failures |
| `exception` | Unexpected errors or exceptions |
| `parserError` | XML parsing errors |

## Combining Exits and Global Forwards

A well-structured pipeline uses exits to define all possible outcomes and global forwards to establish default routing, with pipe-level forwards only where behavior differs from the default:

```xml
<Pipeline firstPipe="validate">
  <Exits>
    <Exit name="Exit" state="SUCCESS" code="200"/>
    <Exit name="BadRequest" state="ERROR" code="400"/>
    <Exit name="ServerError" state="ERROR" code="500"/>
  </Exits>

  <GlobalForward name="failure" path="BadRequest"/>
  <GlobalForward name="exception" path="ServerError"/>

  <XmlValidatorPipe name="validate" root="request" schema="request.xsd">
    <Forward name="success" path="transform"/>
  </XmlValidatorPipe>

  <XsltPipe name="transform" styleSheetName="transform.xsl">
    <Forward name="success" path="store"/>
  </XsltPipe>

  <SenderPipe name="store">
    <FixedQuerySender query="INSERT INTO data VALUES(?{value})">
      <Param name="value" xpathExpression="/result/value"/>
    </FixedQuerySender>
    <Forward name="success" path="Exit"/>
  </SenderPipe>
</Pipeline>
```

This pattern keeps configurations concise and ensures consistent error handling across all pipes.
