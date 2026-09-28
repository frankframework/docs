---
sidebar_position: 7
---

# Configuration Warnings

A configuration warning is a non-fatal warning message attached to a Frank configuration element. It lets you flag a situation during configuration loading without preventing the configuration from starting.

Use the `<ConfigWarning>` element to add such a warning in `Configuration.xml`. The warning text is the element body, and the optional `active` attribute determines whether the warning is emitted.

## Framework Warnings

The Frank!Framework may throw warnings when deprecated attributes are used or when unsafe attributes are used.

These framework-generated warnings can be suppressed with dedicated properties. Each suppress key can be set to `true` on a specific configuration (as a configuration property) to suppress the corresponding warnings for that configuration. Some keys may also be set globally (for example in `DeploymentSpecifics.properties` or as a Java system property) to suppress the warning for all configurations; keys that are not globally suppressible can only be suppressed per configuration, to prevent important warnings from being hidden application-wide.

| Property (Suppress Key) | Suppresses | Global Suppression Allowed |
|---|---|---|
| `warnings.suppress.sqlInjections` | Warnings about attributes or settings that could make the configuration vulnerable to SQL injection | No |
| `warnings.suppress.transaction` | Warnings about transaction handling issues | No |
| `warnings.suppress.deprecated` | Warnings about the use of deprecated elements and attributes | Yes |
| `warnings.suppress.defaultvalue` | Warnings about attributes that are explicitly set to their default value | Yes |
| `warnings.suppress.integrityCheck` | Warnings about missing message-log / integrity-check configuration | Yes |
| `warnings.suppress.resultSetHoldability` | Warnings about JDBC result set holdability | Yes |
| `warnings.suppress.configurations.validation` | Warnings raised during configuration validation | Yes |
| `warnings.suppress.flow.generation` | Warnings about errors during flow-diagram generation | Yes |
| `warnings.suppress.multiPasswordKeystore` | Warnings about keystores that use multiple passwords | Yes |
| `warnings.suppress.xslt.streaming` | Warnings related to XSLT streaming | Yes |
| `warnings.suppress.xsd.warning` | XSD validation warnings | Yes |
| `warnings.suppress.xsd.error` | XSD validation errors reported as configuration warnings | Yes |
| `warnings.suppress.xsd.fatalError` | XSD validation fatal errors reported as configuration warnings | Yes |
| `warnings.suppress.unsafeAttribute` | Warnings about the use of unsafe attributes | Yes |

For example, to suppress deprecation warnings for a single configuration, add the following to that configuration's properties:

```properties
warnings.suppress.deprecated=true
```

> [!NOTE]
> Not every configuration warning is suppressable.

> [!IMPORTANT]
> Suppressing warnings hides potentially important information about your configuration. Only suppress a warning after you have verified that the underlying situation is acceptable, and prefer suppressing per configuration rather than globally.

## Adding Your Own Configuration Warnings

Add a `<ConfigWarning>` child element at the place in `Configuration.xml` where you want the warning to belong. Put the warning message in the element body and use `active` to control when it appears.
When the `active` attribute evaluates to `true`, the warning is added to the configuration warnings collected during startup. When it evaluates to `false`, the warning is ignored.

```xml
<ConfigWarning active="${= StringUtils.isEmpty(remote.url) }">
  Adapter 'MyAdapter' is disabled because property 'remote.url' is empty
</ConfigWarning>
<Adapter name="MyAdapter" active="${= StringUtils.isNotEmpty(remote.url) }">
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
