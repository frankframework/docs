# Includes

Frank!Framework configurations support including external XML fragments to promote reuse, reduce duplication, and improve maintainability. The `<Include>` and `<Entity>` mechanisms let you split large configurations across multiple files.

## XML Entity Includes

The standard XML entity mechanism allows you to define reusable fragments. Declare an entity in the DOCTYPE and reference it in the configuration body:

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

The file `commonPipes.xml` contains raw XML fragment(s) that are inserted at the entity reference location:

```xml
<XmlValidatorPipe name="validateInput" root="request" schema="request.xsd">
  <Forward name="success" path="process"/>
  <Forward name="failure" path="BadRequest"/>
</XmlValidatorPipe>
```

:::note
Entity includes are resolved by the XML parser before the Frank!Framework processes the configuration. The included fragment must be well-formed XML but does not need a root element or XML declaration.
:::

## The Include Element

The `<Include>` element is a Frank!Framework-specific mechanism for including entire adapter definitions or configuration fragments:

```xml
<Configuration
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="../FrankConfig.xsd">
  <Include uri="adapters/orderAdapter.xml"/>
  <Include uri="adapters/customerAdapter.xml"/>
</Configuration>
```

Each included file should contain one or more `<Adapter>` elements (without a wrapping `<Configuration>` element):

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

## When to Use Includes

| Approach | Best For |
|----------|----------|
| XML Entity (`<!ENTITY>`) | Reusing pipe fragments, shared parameter blocks, or common pipeline sections across adapters |
| `<Include>` element | Splitting a configuration into multiple files for organization, with each file containing complete adapter definitions |

## Best Practices

- **Keep shared fragments small and focused** — include common validation pipes, standard error handling, or shared parameter definitions.
- **Use descriptive file names** — `validateBooking.xml` is clearer than `fragment1.xml`.
- **Organize included files in subdirectories** — use `adapters/`, `shared/`, or similar folder structures within your configuration directory.
- **Avoid deep nesting** — includes within includes make configurations harder to trace and debug.
