---
sidebar_position: 8
---

# Validator or ValidatorPipe

Frank!Framework offers two ways to validate a message: a **Validator** and a **ValidatorPipe**. Both use the same validation logic (for example, checking a
message against an XSD). The only difference is **where and when** the validation runs.
If you check the XSD for configurations, you will see that `XmlInputValidator`, `XmlOutputValidator` and `XmlValidatorPipe` all refer to the same underlying type `XmlValidator`. Depending on which one you use, the framework will run the validation at a different point in time.

## In short

|               | Validator                                                     | ValidatorPipe                            |
|---------------|---------------------------------------------------------------|------------------------------------------|
| Runs          | Automatically, at the edge of the pipeline                    | Where you place it in the pipeline       |
| Position      | Before the first pipe (input) or after the last pipe (output) | Anywhere between pipes                   |
| Configured as | `<InputValidator>` / `<OutputValidator>`                      | A normal pipe, e.g. `<XmlValidatorPipe>` |
| Checks        | The message entering or leaving the pipeline                  | The message at that point in the flow    |

## Validator

A validator is configured inside the `<Pipeline>`, but is not part of the pipe sequence. It is run for you:

- An **InputValidator** checks the incoming message *before* any pipe runs.
- An **OutputValidator** checks the result *after* the last pipe has run.

```xml
<Pipeline>
    <XmlInputValidator name="InputValidator"
                  root="Order"
                  schema="Order.xsd"/>
    <!-- pipes -->
</Pipeline>
```

Depending on the configuration, validators can also run at the receiver, before the message reaches the pipeline.

## ValidatorPipe

A ValidatorPipe is a pipe like any other. It runs when the message reaches it, so you can validate the message in the middle of the flow, for example after a
transformation. Use its forwards to send valid and invalid messages to different places.

```xml
<Pipeline>
    <XmlValidatorPipe name="Validate transformed message"
                      root="Invoice"
                      schema="Invoice.xsd">
        <Forward name="failure" path="InvalidInvoice"/>
    </XmlValidatorPipe>
    <!-- more pipes -->
</Pipeline>
```

## Example

1. The **InputValidator** checks that the incoming `Order` is valid, before anything else happens.
2. A pipe transforms the `Order` into an `Invoice`.
3. An **XmlValidatorPipe** checks that the `Invoice` is valid, before it is sent on.

Both can use the `failure` forward when validation fails.

## When to use which

- Use a **Validator** to check everything that comes in or goes out of the adapter. This is the default choice, and keeps the pipeline free of validation steps.
- Use a **ValidatorPipe** to check a message *in between* processing steps, or when you want to route valid and invalid messages down different paths.

