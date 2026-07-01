# Includes

Frank!Framework configurations support including external XML files to promote reuse, reduce duplication, and improve maintainability. This lets you split large configurations across multiple files.

The framework offers two mechanisms: the `<Include>` element and standard XML entities (`<!ENTITY>`). **The `<Include>` element is the recommended approach.** It is syntactically nicer, is a first-class Frank!Framework feature, and can also include a piece of a pipeline (see [PipelinePart](./pipeline-part.md)).

## The Include Element

The `<Include>` element includes the contents of another file at the location where it is placed. The file to include is referenced through the `ref` attribute:

```xml
<Include ref="included-part.xml"/>
```

When the configuration is parsed, the `<Include>` element is replaced by the body of the referenced file (its root element is stripped and its children are inserted in place). This means an `<Include>` can be placed wherever the included content is valid — at the configuration level to include whole adapters, or inside a `<Pipeline>` to include a piece of pipeline.

### Including Adapters

Place `<Include>` at the configuration level to split adapters into separate files:

```xml
<Configuration
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="../FrankConfig.xsd">
  <Include ref="adapters/orderAdapter.xml"/>
  <Include ref="adapters/customerAdapter.xml"/>
</Configuration>
```

Each included file contains one or more `<Adapter>` elements:

```xml
<!-- adapters/orderAdapter.xml -->
<Adapter name="OrderService">
  <Receiver name="input">
    <ApiListener name="listener" uriPattern="orders" method="POST"/>
  </Receiver>
  <Pipeline>
    <EchoPipe name="echo"/>
  </Pipeline>
</Adapter>
```

### Including a Piece of a Pipeline

An `<Include>` placed inside a `<Pipeline>` can include a reusable set of pipes. The included file uses `<PipelinePart>` as its root element:

```xml
<Pipeline>
  <FixedResultPipe name="fr1"/>
  <Include ref="included-part.xml"/>
  <EchoPipe name="e2"/>
</Pipeline>
```

```xml
<!-- included-part.xml -->
<PipelinePart
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="https://schemas.frankframework.org/FrankConfig.xsd">
  <EchoPipe name="ping"/>
  <EchoPipe name="pong"/>
</PipelinePart>
```

The `<PipelinePart>` wrapper is stripped during parsing, so the `<EchoPipe>` pipes are inserted directly into the pipeline. See [PipelinePart](./pipeline-part.md) for details.

### Path Resolution

Paths in the `ref` attribute are resolved relative to the file that contains the `<Include>` (and ultimately relative to the configuration directory). Organize included files in subdirectories such as `adapters/` or `shared/` for clarity.

## XML Entities (Discouraged)

The standard XML entity mechanism can also include external fragments. Declare an entity in the DOCTYPE and reference it in the configuration body:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE Configuration [
  <!ENTITY commonPipes SYSTEM "commonPipes.xml">
]>
<Configuration
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="../FrankConfig.xsd">
  <Adapter name="MyAdapter">
    <Receiver name="input">
      <ApiListener name="listener" uriPattern="myService" method="POST"/>
    </Receiver>
    <Pipeline>
      &commonPipes;
      <EchoPipe name="done" getInputFromFixedValue="OK"/>
    </Pipeline>
  </Adapter>
</Configuration>
```

:::warning
While XML entities work, their use is **discouraged**. Prefer the `<Include>` element instead: it is syntactically nicer, is resolved by the Frank!Framework itself (rather than the raw XML parser), and can also include a pipeline part. Reserve `<!ENTITY>` for legacy configurations that already rely on it.
:::

## Best Practices

- **Prefer `<Include>` over `<!ENTITY>`** — it is the supported, more readable mechanism.
- **Keep shared files small and focused** — include common validation pipes, standard error handling, or a shared piece of pipeline.
- **Use descriptive file names** — `validateBooking.xml` is clearer than `fragment1.xml`.
- **Organize included files in subdirectories** — use `adapters/`, `shared/`, or similar folder structures within your configuration directory.
- **Avoid deep nesting** — includes within includes make configurations harder to trace and debug.
