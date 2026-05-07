# Monitoring

The monitoring system allows defining custom operational alerts based on framework events.

## Requirements

```properties
monitoring.enabled=true
```

Monitors only function when this property is `true`.

## Core Concepts

| Term | Description |
|------|-------------|
| Monitor | A named state that can be *raised* or *not raised*. Belongs to a single configuration. |
| Trigger | Changes monitor state. Two types: *Alarm* (raises) and *Clearing* (clears). |
| Event | Framework occurrence that fires a trigger (e.g., `Pipe Exception`, `Receiver Shutdown`). |
| Threshold | Number of events required before the trigger fires. |
| Period | Time window (in seconds) within which the threshold must be reached. |
| Destination | Action performed when a monitor is raised. |
| Tags | Visual classification: `TECHNICAL`, `FUNCTIONAL`, `HEARTBEAT`, `CLEARING`. |

Example: a trigger with threshold=2 and period=60 fires only if two matching events occur within 60 seconds.

Monitors are scoped to a single configuration. Triggers can be further scoped to specific adapters.

## Alarm and Clearing Triggers

- **Alarm trigger** — raises the monitor when its conditions are met.
- **Clearing trigger** — clears (un-raises) the monitor.

A monitor can also be cleared manually via the UI.

## Destinations

Destinations define actions executed when a monitor is raised. The available destination type is `<SenderMonitorAdapterDestination>`, which wraps a sender:

```xml
<Monitoring>
    <Destination name="TheDestination">
        <IbisJavaSender name="TheSender" serviceName="OnMonitoringTriggered" />
    </Destination>
</Monitoring>
```

The sender receives a message when the monitor is raised. This can trigger another adapter to perform any action (log, send email, call external system).

> **Important:** Each destination must have a `name` attribute.

## Configuration XML

Monitors defined in the UI must be exported and added to `Configuration.xml` to persist across restarts. Use the "XML" button in the UI to export.

Full configuration example (see the [FF! Reference](https://reference.frankframework.org/#/components) for pipe details):

```xml
<Configuration
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="../FrankConfig.xsd">

    <Adapter name="First">
        <Receiver name="First">
            <JavaListener name="First" serviceName="First" />
        </Receiver>
        <Pipeline>
            <EchoPipe name="Message" getInputFromFixedValue="Greetings from First"/>
        </Pipeline>
    </Adapter>

    <Monitoring>
        <Destination name="TheDestination">
            <IbisJavaSender name="TheSender" serviceName="OnMonitoringTriggered" />
        </Destination>
        <Monitor name="MyMonitor" destinations="TheDestination">
            <Alarm>
                <Event>Receiver Shutdown</Event>
            </Alarm>
        </Monitor>
    </Monitoring>
</Configuration>
```

> **Note:** The `<Event>` tag contains a string value as content, unlike other Frank!Framework XML elements which use only attributes and child elements.

## Console Interface

The **Monitoring** page in the Frank!Console shows:

- All configured monitors and their current state (raised/cleared)
- Trigger configuration details
- Manual raise/clear controls
- Event history
