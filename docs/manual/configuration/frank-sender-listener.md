# FrankSender and FrankListener

The `FrankSender` and `FrankListener` (via `JavaListener`) enable communication between adapters within the same Frank!Framework instance. This is the primary mechanism for building modular configurations where adapters call other adapters.

## Overview

| Component | Role |
|-----------|------|
| `FrankSender` | Sends a message to another adapter within the same instance |
| `JavaListener` | Receives messages from a `FrankSender` (acts as the "FrankListener") |

A `FrankSender` targets a `JavaListener` by referencing either the adapter name or the listener's `serviceName`. The called adapter processes the message and returns a response synchronously.

## Basic Example

**Calling adapter:**

```xml
<Adapter name="MainAdapter">
  <Receiver name="input">
    <ApiListener name="listener" uriPattern="process" method="POST"/>
  </Receiver>
  <Pipeline>
    <SenderPipe name="callSubAdapter">
      <FrankSender name="toSubAdapter" target="SubAdapter"/>
      <Forward name="success" path="Exit"/>
    </SenderPipe>
  </Pipeline>
</Adapter>
```

**Called adapter:**

```xml
<Adapter name="SubAdapter">
  <Receiver name="input">
    <JavaListener name="SubAdapterListener"/>
  </Receiver>
  <Pipeline>
    <EchoPipe name="respond" getInputFromFixedValue="Processed"/>
  </Pipeline>
</Adapter>
```

The `target` attribute on `FrankSender` matches the `name` of the target adapter. The target adapter must have a `<JavaListener>` in its receiver.

## Using serviceName

Alternatively, you can target a specific `serviceName` on the `JavaListener`:

```xml
<!-- Sender side -->
<FrankSender name="sender" target="myService"/>

<!-- Receiver side -->
<Adapter name="ServiceAdapter">
  <Receiver name="input">
    <JavaListener name="listener" serviceName="myService"/>
  </Receiver>
  <Pipeline>
    <!-- processing -->
  </Pipeline>
</Adapter>
```

When `serviceName` is specified, the `FrankSender` uses it to locate the listener. This is useful when multiple listeners exist or when you want a stable service identifier independent of adapter naming.

## Transactions Across Adapters

`FrankSender` calls participate in the caller's transaction when configured correctly. Set `transactionAttribute="Mandatory"` on the called adapter's receiver to enforce that it only executes within an existing transaction:

```xml
<Adapter name="MainAdapter">
  <Receiver transactionAttribute="Required">
    <ApiListener name="listener" uriPattern="orders" method="POST"/>
  </Receiver>
  <Pipeline>
    <SenderPipe name="writeOrder">
      <FrankSender name="sender" target="WriteOrderAdapter"/>
      <Forward name="success" path="writeAudit"/>
    </SenderPipe>
    <SenderPipe name="writeAudit">
      <FrankSender name="sender" target="WriteAuditAdapter"/>
      <Forward name="success" path="Exit"/>
    </SenderPipe>
  </Pipeline>
</Adapter>

<Adapter name="WriteOrderAdapter">
  <Receiver transactionAttribute="Mandatory">
    <JavaListener name="writeOrderListener"/>
  </Receiver>
  <Pipeline>
    <SenderPipe name="insert">
      <FixedQuerySender query="INSERT INTO orders VALUES(?{id})">
        <Param name="id" xpathExpression="/order/@id"/>
      </FixedQuerySender>
    </SenderPipe>
  </Pipeline>
</Adapter>
```

If `WriteOrderAdapter` or `WriteAuditAdapter` fails, the entire transaction rolls back—including operations already completed by the other sub-adapter.

## When to Use FrankSender

- **Modularity**: Break complex processing into smaller, testable adapters.
- **Reuse**: Multiple adapters can call the same sub-adapter for shared logic.
- **Transaction boundaries**: Control which operations participate in the same transaction.
- **Separation of concerns**: Isolate database writes, external calls, or transformation logic into dedicated adapters.

## Comparison with Other Senders

| Sender | Use Case |
|--------|----------|
| `FrankSender` | Call another adapter in the same Frank!Framework instance |
| `IbisLocalSender` | Legacy alternative to `FrankSender` (deprecated) |
| `HttpSender` | Call an external HTTP service |
| `JmsSender` | Send a message to a JMS queue (asynchronous) |

For a complete and up-to-date list of all available senders and their attributes, see the [FF! Reference](https://reference.frankframework.org/#/components).
