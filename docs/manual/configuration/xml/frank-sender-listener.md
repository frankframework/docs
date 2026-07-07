# FrankSender and FrankListener

The `FrankSender` sends a message to another Frank!Adapter (or an external program running in the same JVM). It is the modern, preferred way to call one adapter from another and replaces the older `IbisLocalSender` and `IbisJavaSender`.

A `FrankSender` can reach its target in different ways, controlled by its `scope` attribute. Two scopes are relevant for adapter-to-adapter calls:

- `ADAPTER` (the default) — call the target adapter **directly**.
- `LISTENER` — call the target adapter through a configured `FrankListener`.

Understanding when to use each is the key to using `FrankSender` well.

## How a Call Works

The `FrankSender` is placed inside a `<SenderPipe>`. It sends the current message to the target, the target's pipeline runs, and its result is returned to the caller.

If the called adapter exits with an `<Exit>` that has state `ERROR`, the caller treats this as an error and follows its `exception` forward (if present). The called adapter's exit `code` is returned as the forward name on the `SenderPipe`, provided the code can be parsed as an integer. For example, if the called adapter exits with code `2`, the `SenderPipe` can define a `<Forward name="2" .../>`.

| Attribute | Purpose |
|-----------|---------|
| `target` | Name of the target. For `scope="ADAPTER"` this is the adapter name; for `scope="LISTENER"` this is the `FrankListener` name. |
| `scope` | `ADAPTER` (default), `LISTENER`, `JVM`, or `DLL`. |

To call an adapter in a different configuration within the same instance, prefix the target with the configuration name and a slash: `target="targetConfigurationName/targetAdapterName"`.

## Scope ADAPTER: Calling an Adapter Directly

This is the default and most efficient, low-overhead way to call another adapter. The target adapter does **not** need a `<Receiver>` or listener — the `FrankSender` invokes its pipeline directly.

```xml
<Adapter name="Adapter A">
  <Receiver name="Adapter A Receiver">
    <!-- Listener setup and other configuration -->
  </Receiver>
  <Pipeline>
    <SenderPipe name="send">
      <!-- when scope="ADAPTER", target is the name of the adapter you want to call -->
      <FrankSender name="call Adapter B" scope="ADAPTER" target="Adapter B"/>
      <Forward name="success" path="EXIT"/>
    </SenderPipe>
  </Pipeline>
</Adapter>

<Adapter name="Adapter B">
  <!-- No receiver needed for FrankSender in this scenario -->
  <Pipeline>
    <!-- Exits, Pipes etc -->
  </Pipeline>
</Adapter>
```

Key characteristics:

- **Lowest overhead** — no receiver, listener, or message-log machinery is involved.
- **Runs in the caller's transaction** by default. If the called adapter should run in its own transaction, set the `transactionAttribute` on the called adapter's `<Pipeline>` (or on the `<SenderPipe>` that contains the `FrankSender`).
- If the listener is in a different configuration, prefix the target with the configuration name and a slash.
- 
Use scope `ADAPTER` for the common case: calling a sub-adapter as a subroutine when you do not need the extra error handling of a receiver.

## Scope LISTENER: Calling via a FrankListener

With scope `LISTENER`, the call goes through a `FrankListener` configured in a `<Receiver>` on the target adapter. This adds a bit of overhead, but in return you get all the message logging and error handling that the `<Receiver>` provides — most notably an **error storage**.

```xml
<Adapter name="Adapter A">
  <Receiver name="Adapter A Receiver">
    <!-- Listener setup and other configuration -->
  </Receiver>
  <Pipeline>
    <SenderPipe name="send">
      <!-- when scope="LISTENER", target is the name of the FrankListener -->
      <FrankSender scope="LISTENER" target="Adapter B Listener"/>
      <Forward name="success" path="EXIT"/>
    </SenderPipe>
  </Pipeline>
</Adapter>

<Adapter name="Adapter B">
  <Receiver name="Receiver B" maxRetries="0" transactionAttribute="NotSupported">
    <!-- Listener name is optional; it defaults to the Adapter name -->
    <FrankListener name="Adapter B Listener"/>
    <!-- With a Receiver and FrankListener the sub-adapter can have an error storage -->
    <JdbcErrorStorage slotId="Adapter B - Errors"/>
  </Receiver>
  <!-- If transactions are required, set the transaction attribute on the Pipeline -->
  <Pipeline transactionAttribute="RequiresNew">
    <!-- Exits, Pipes etc -->
  </Pipeline>
</Adapter>
```

Key characteristics:

- The `FrankListener` `name` is optional; when omitted it defaults to the adapter name.
- The target now has a full `<Receiver>`, so it can use an **error storage** (e.g. `JdbcErrorStorage`) and message logging — something a directly-called adapter cannot have.
- If the listener is in a different configuration, prefix the target with the configuration name and a slash.

Use scope `LISTENER` when you specifically need the receiver's capabilities for the sub-adapter, such as an error store for failed messages.

## Choosing Between ADAPTER and LISTENER

| Scenario | Recommended scope |
|----------|-------------------|
| Call a sub-adapter as a simple subroutine with least overhead | `ADAPTER` |
| Let the sub-adapter run in the caller's transaction with no extra machinery | `ADAPTER` |
| You need message logging or an error storage on the sub-adapter | `LISTENER` |
| You want the sub-adapter to have its own `<Receiver>` behaviour (retries, error handling) | `LISTENER` |

## Other Scopes: JVM and DLL

`FrankSender` can also call an external program running in the same JVM by setting `scope="JVM"` (a Java application) or `scope="DLL"` (code loaded from a DLL registered as a service). In these cases `target` is the service name the other application registered itself under. This requires the [IbisServiceDispatcher](https://github.com/frankframework/servicedispatcher) library on the class path.

## Migrating from IbisLocalSender / IbisJavaSender

`FrankSender` replaces the older combination of an `IbisLocalSender` (or `IbisJavaSender`) in the calling adapter and a `JavaListener` in the called adapter:

- Replace an `IbisLocalSender javaListener="..."` with a `FrankSender scope="LISTENER" target="..."` (keeping the receiver), or with a `FrankSender scope="ADAPTER" target="..."` if the receiver is no longer needed.
- Replace an `IbisJavaSender serviceName="..."` targeting an in-JVM service with a `FrankSender scope="JVM" target="..."`.

## Comparison with Other Senders

| Sender | Use Case |
|--------|----------|
| `FrankSender` | Call another adapter in the same Frank!Framework instance (or an in-JVM program) |
| `IbisLocalSender` / `IbisJavaSender` | Legacy predecessors of `FrankSender` |
| `HttpSender` | Call an external HTTP service |
| `JmsSender` | Send a message to a JMS queue (asynchronous) |

For a complete and up-to-date list of all available senders and their attributes, see the [FF! Reference](https://reference.frankframework.org/#/components).
