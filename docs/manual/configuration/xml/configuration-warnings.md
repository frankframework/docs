---
sidebar_position: 7
---

# Configuration Warnings

A configuration warning is a non-fatal warning message attached to a Frank configuration element. It lets you flag a situation during configuration loading without preventing the configuration from starting.

Use the `<ConfigWarning>` element to add such a warning in `Configuration.xml`. The warning text is the element body, and the optional `active` attribute determines whether the warning is emitted.

## How It Works

When the `active` attribute evaluates to `true`, the warning is added to the configuration warnings collected during startup. When it evaluates to `false`, the warning is ignored.

The framework test configuration below shows that warnings can be added at different levels, such as directly under `<Configuration>`, under an `<Adapter>`, and under nested elements like a `<JavaListener>`:

```xml
<Configuration
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="https://schemas.frankframework.org/FrankConfig.xsd">
  <ConfigWarning active="true">C1 Warning</ConfigWarning>

  <Adapter name="Adapt1">
    <ConfigWarning active="${= false == false}">A1 Warning</ConfigWarning>
    <Receiver>
      <ConfigWarning active="!${= false != true}">R1 Warning</ConfigWarning>
      <JavaListener name="List1"/>
    </Receiver>
    <Pipeline>
      <EchoPipe name="ping"/>
    </Pipeline>
  </Adapter>

  <Adapter name="Adapt2">
    <Receiver>
      <JavaListener name="List2">
        <ConfigWarning active="${=true}">JL2 Warning</ConfigWarning>
      </JavaListener>
    </Receiver>
    <Pipeline>
      <EchoPipe name="pong"/>
    </Pipeline>
  </Adapter>
</Configuration>
```

In this example, `C1 Warning`, `A1 Warning`, and `JL2 Warning` are emitted. `R1 Warning` is not, because its `active` expression evaluates to `false`.

## Adding Your Own Configuration Warnings

Add a `<ConfigWarning>` child element at the place in `Configuration.xml` where you want the warning to belong. Put the warning message in the element body and use `active` to control when it appears.

```xml
<Adapter name="MyAdapter" active="${remote.configured}">
  <ConfigWarning active="${= StringUtils.isEmpty(remote.url) }">
    Adapter 'MyAdapter' is disabled because property 'remote.url' is empty
  </ConfigWarning>
  <Receiver>
    <ApiListener name="listener" uriPattern="my-service"/>
  </Receiver>
  <Pipeline>
    <EchoPipe name="done"/>
  </Pipeline>
</Adapter>
```

This is useful when a configuration is intentionally optional, partially enabled, or depends on environment-specific properties. For expression syntax in `active`, see [Properties](../properties.md).

## Best Practices

- Use warnings for situations that should be visible but should not stop startup.
- Make the message explain what is wrong and what the effect is.
- Keep the warning close to the element it applies to.
- Use `active` to avoid showing the warning when the situation does not apply.
