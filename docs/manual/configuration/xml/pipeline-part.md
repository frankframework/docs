---
sidebar_position: 5
---

# PipelinePart

A `<PipelinePart>` is a reusable piece of a pipeline stored in its own file, much like an [include](./includes.md) file — but instead of whole adapters it contains a fragment of pipeline (a set of pipes). This lets you factor out a sequence of pipes that is shared between adapters or that you simply want to keep in a separate file for readability.

## Structure of a PipelinePart File

A PipelinePart file uses `<PipelinePart>` as its root element and contains one or more pipes:

```xml
<!-- included-part.xml -->
<PipelinePart
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="https://schemas.frankframework.org/FrankConfig.xsd">
  <EchoPipe name="ping"/>
  <EchoPipe name="pong"/>
</PipelinePart>
```

The `<PipelinePart>` element is only a container. When the file is included, the wrapper is stripped and the pipes it contains are inserted directly into the surrounding pipeline.

## Including a PipelinePart

Reference the file from within a `<Pipeline>` using the [`<Include>`](./includes.md) element and its `ref` attribute:

```xml
<Adapter name="Adapter1">
  <Receiver>
    <JavaListener name="my-JavaListener"/>
  </Receiver>
  <Pipeline>
    <FixedResultPipe name="fr1"/>
    <Include ref="included-part.xml"/>
    <EchoPipe name="e2"/>
  </Pipeline>
</Adapter>
```

After parsing, the pipeline above behaves exactly as if the `ping` and `pong` pipes had been written inline between `fr1` and `e2`:

```
fr1  →  ping  →  pong  →  e2
```

Because the pipes are inlined, forwards and flow control work exactly as they would for pipes written directly in the pipeline.

## When to Use a PipelinePart

- **Reuse a sequence of pipes** across multiple adapters without copying and pasting them.
- **Keep large pipelines readable** by extracting logically grouped pipes into their own file.
- **Standardize common steps** such as logging, validation, or enrichment fragments.

## PipelinePart vs. Sub-Adapters and Plugins

A `<PipelinePart>` is a *compile-time* include: its pipes become part of the including pipeline and run in the same pipeline call. This differs from calling a sub-adapter with a [FrankSender](./frank-sender-listener.md), which invokes a separate pipeline (and optionally a separate transaction) at runtime.

The Frank!Framework also supports **plugins**, which are called at runtime as their own sub-process using a `CompositePipe` (or a `CompositeSender` inside a sender or iterating pipe). Like a sub-adapter call, a plugin runs as its own pipeline, and — because not all session variables are copied over — values are passed in explicitly through `<Param>` elements:

```xml
<CompositePipe name="callPlugin" plugin="name-of-the-plugin">
  <Param name="inject-me" value="im a value"/>
  <Param name="inject-me-too" sessionKey="originalMessage"/>
</CompositePipe>
```

| Mechanism | Called as | Best for |
|-----------|-----------|----------|
| `<PipelinePart>` via `<Include>` | Inlined into the pipeline (same pipeline call) | Reusing a piece of pipeline within your own configuration |
| `<FrankSender>` | Separate adapter/pipeline at runtime | Calling another adapter as a subroutine |
| `<CompositePipe>` / `<CompositeSender>` | Separate sub-process (plugin) at runtime | Calling a packaged Frank!Framework plugin |

For a complete and up-to-date list of available components and their attributes, see the [FF! Reference](https://reference.frankframework.org/#/components).
