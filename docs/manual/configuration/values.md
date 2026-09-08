---
sidebar_position: 3
---

# Messages and Values

## Messages in Pipelines

A message flows through a pipeline from pipe to pipe. Each pipe receives an input message, processes it, and produces an output message. The Frank!Framework stores the incoming pipeline message in the session key `originalMessage` automatically.

## Session Keys

Session keys act as variables that hold the same kind of data as the message flowing through the pipeline. The framework automatically sets:

- `originalMessage` — the pipeline's input message
- `httpMethod` — the HTTP method (when using an `ApiListener`)

Custom session keys can be written with [`PutInSessionPipe`](https://reference.frankframework.org/#/Components/Pipes/PutInSessionPipe):

```xml
<PutInSessionPipe name="save" sessionKey="saved"/>
```

## Default Input Behavior

- The **first pipe** in a pipeline receives the pipeline's input message.
- **Subsequent pipes** receive the previous pipe's output message as input.

Override this with:

- `getInputFromSessionKey` — use a session key value as input
- `getInputFromFixedValue` — use a literal string as input

These attributes are defined by `AbstractPipe` and available on all pipes.

```xml
<ReplacerPipe name="replace" getInputFromFixedValue="Property value ${my.property} and parameter value ?{my.param}">
    <Param name="my.param" value="My parameter value"/>
</ReplacerPipe>
```

## Property References

Properties are referenced with `${property.name}` syntax:

```
${my.property}
```

Properties come from properties files (e.g., `DeploymentSpecifics.properties`) or the application environment.

## Parameter References

Parameters are referenced with `?{param.name}` syntax:

```
?{my.param}
```

Parameters are defined using `<Param>` child elements on a pipe or sender.

## Context Keys

Messages carry additional key/value pairs called *context keys*. When an `ApiListener` captures an HTTP request, it adds HTTP headers as context keys:

- `Header.content-type` — the Content-Type header value
- Other HTTP headers follow the pattern `Header.<header-name>`

Context keys are visible in Ladybug via the "Show messagecontext" button.

## Param Element

The `<Param>` element fetches values for use in pipes and senders. It can access:

- Fixed values (`value` attribute)
- Session keys (`sessionKey` attribute)
- Context keys (`contextKey` attribute on a session key reference)

Example reading a context key from `originalMessage`:

```xml
<ReplacerPipe name="contentType" getInputFromFixedValue="?{context.value}">
    <Param name="context.value" sessionKey="originalMessage" contextKey="Header.content-type"/>
</ReplacerPipe>
```

Only the `<Param>` element can obtain context key values. The parameter must then be referenced by the pipe to produce the output.

## ReplacerPipe Pattern Substitution

[`ReplacerPipe`](https://reference.frankframework.org/#/Components/Pipes/ReplacerPipe) substitutes both property references (`${...}`) and parameter references (`?{...}`) in its input. When the `find` attribute is omitted, no text replacement occurs — only property and parameter substitution.

```xml
<ReplacerPipe name="replace" getInputFromFixedValue="Property value ${my.property} and parameter value ?{my.param}">
    <Param name="my.param" value="My parameter value"/>
</ReplacerPipe>
```

Output: `Property value My property value and parameter value My parameter value`

## EchoPipe Property Substitution

[`EchoPipe`](https://reference.frankframework.org/#/Components/Pipes/EchoPipe) substitutes **properties only** (`${...}`). It does not substitute parameters (`?{...}`).

## Complete Example

```xml
<Configuration
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="../FrankConfig.xsd"
>
    <Adapter name="values">
        <Receiver>
            <ApiListener name="values" method="POST" uriPattern="values" allowAllParams="true" />
        </Receiver>
        <Pipeline>
            <PutInSessionPipe name="save" sessionKey="saved"/>
            <ReplacerPipe name="replace" getInputFromFixedValue="Property value ${my.property} and parameter value ?{my.param}">
                <Param name="my.param" value="My parameter value"></Param>
            </ReplacerPipe>
            <ReplacerPipe name="contentType" getInputFromFixedValue="?{context.value}">
                <Param name="context.value" sessionKey="originalMessage" contextKey="Header.content-type"/>
            </ReplacerPipe>
        </Pipeline>
    </Adapter>
</Configuration>
```

Sending a request:

```
curl -i -X POST -H 'Content-Type: application/text' http://localhost/api/values -d 'Something'
```

- First pipe (`save`): stores `Something` in session key `saved`
- Second pipe (`replace`): outputs `Property value My property value and parameter value My parameter value`
- Third pipe (`contentType`): outputs `application/text`
