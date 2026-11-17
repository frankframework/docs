---
sidebar_position: 8
---

# Validator or ValidatorPipe

Frank!Framework offers two ways to validate a message: a **Validator** and a **ValidatorPipe**. Both use the same validation logic (for example, checking a
message against an XSD). The only difference is **where and when** the validation runs.
If you check the XSD for configurations, you will see that `XmlInputValidator`, `XmlOutputValidator` and `XmlValidatorPipe` all refer to the same underlying
type `XmlValidator`. Depending on which one you use, the framework will run the validation at a different point in time.

## In short

|               | Validator                                                     | ValidatorPipe                            |
|---------------|---------------------------------------------------------------|------------------------------------------|
| Runs          | Automatically, at the edge of the pipeline                    | Where you place it in the pipeline       |
| Position      | Before the first pipe (input) or after the last pipe (output) | Anywhere between pipes                   |
| Configured as | `<InputValidator>` / `<OutputValidator>`                      | A normal pipe, e.g. `<XmlValidatorPipe>` |
| Checks        | The message entering or leaving the pipeline                  | The message at that point in the flow    |

## Validator

A validator is configured inside the `<Pipeline>`, but is not part of the pipe sequence. It is run for you, at the edge of the pipeline:

- An **InputValidator** checks the incoming message *before* any pipe runs.
- An **OutputValidator** checks the result *after* the last pipe has run.

```xml
<Pipeline>
    <XmlInputValidator
            name="InputValidator"
            root="Order"
            schema="Order.xsd"
    />
    <!-- pipes -->
</Pipeline>
```

Depending on the configuration, validators can also run at the receiver, before the message reaches the pipeline. Validators also run on Sender pipes, on messages about to be sent out and on replies received.

### Validator on a receiver

A validator placed inside a receiver checks the message as soon as it arrives, before it reaches the pipeline. If the message is invalid, the pipeline never starts.

```xml
<Adapter name="ProcessOrder">
    <Receiver name="OrderReceiver">
        <ApiListener name="OrderListener" uriPattern="orders" method="POST"/>
        <XmlInputValidator
                root="Order"
                schema="Order.xsd"
        />
    </Receiver>
    <Pipeline>
        ...
    </Pipeline>
</Adapter>
```

### Validator on a sender pipe

A validator placed inside a sender pipe checks the message that is about to be sent out. An output validator checks the reply that comes back.

```xml
<Pipeline>
    <SenderPipe name="Send order to backend">
        <HttpSender url="https://backend.example.com/orders" method="POST"/>
        <XmlInputValidator
                root="Order"
                schema="Order.xsd"
        />
        <XmlOutputValidator
                root="Confirmation"
                schema="Confirmation.xsd"
        />
    </SenderPipe>
</Pipeline>
```

## ValidatorPipe

A ValidatorPipe is a pipe like any other. It runs when the message reaches it, so you can validate the message in the middle of the flow, for example after a
transformation. Use its forwards to send valid and invalid messages to different places.

```xml
<Pipeline>
    <XmlValidatorPipe
            name="Validate transformed message"
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

## Combining with wrappers

Wrappers can be used the same way as Validators. They will run before or after the pipeline, depending on whether they are configured as input or output wrappers. Wrappers can also be used inside a sender pipe, to wrap the message before it is sent out and to wrap the reply that comes back.

Keep in mind though, that there's a specific order in which wrappers and validators run. For input, the order is `InputValidator` → `InputWrapper` → first pipe. For output, the order is last pipe → `OutputWrapper` → `OutputValidator`. 

In a Sender pipe, the order in which wrappers and validators are executed is reversed.
`InputWrapper` -> `InputValidator`; `OutputValidator` -> `OutputWrapper`.

This can be deceiving, since the order you define them in in your configuration doesn't matter, the framework will always run them in the order described above.