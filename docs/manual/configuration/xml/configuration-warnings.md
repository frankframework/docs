---
sidebar_position: 7
---

# Configuration Warnings

A configuration warning is a non-fatal warning message attached to a Frank configuration element. It lets you flag a situation during configuration loading without preventing the configuration from starting.

Use the `<ConfigWarning>` element to add such a warning in `Configuration.xml`. The warning text is the element body, and the optional `active` attribute determines whether the warning is emitted.

## Framework Warnings

The Frank!Framework may throw warnings when deprecated attributes are used or when unsafe attributes are used.

## Adding Your Own Configuration Warnings

Add a `<ConfigWarning>` child element at the place in `Configuration.xml` where you want the warning to belong. Put the warning message in the element body and use `active` to control when it appears.
When the `active` attribute evaluates to `true`, the warning is added to the configuration warnings collected during startup. When it evaluates to `false`, the warning is ignored.

```xml
<Adapter name="MyAdapter" active="${= StringUtils.isNotEmpty(remote.url) }">
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

- Use warnings for situations that should be visible but should not stop startup. Think of missing required properties, or advising against a certain property.
- Make the message explain what is wrong and what the effect is.
- Keep the warning close to the element it applies to. You can nest it almost everywhere directly in the configuration xml.
- Use `active` to avoid showing the warning when the situation does not apply, see [JEXL expressions](../properties.md).
