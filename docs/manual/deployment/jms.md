# JMS Queue Configuration

## Overview

JMS (Java Message Service) is the standard interface between Java applications and message queues. Frank!Framework JMS connections are configured in `resources.yml` under the `jms` key.

## resources.yml Configuration

```yaml
jms:
  - name: "qcf-artemis"
    type: "org.apache.activemq.artemis.jms.client.ActiveMQXAConnectionFactory"
    url: "tcp://${jms.hostname:-localhost}:61615"
```

The `name` field is the part after `jms/` in the connection factory reference. For example, `name: "qcf-artemis"` is referenced as `jms/qcf-artemis` in configurations.

## Using JMS in Configurations

### JmsSender

```xml
<JmsSender name="enqueue"
    destinationName="myQueue"
    messageClass="TEXT"
    queueConnectionFactoryName="jms/qcf-artemis"/>
```

### JmsListener

```xml
<JmsListener name="dequeue"
    destinationName="myQueue"
    messageClass="TEXT"
    queueConnectionFactoryName="jms/qcf-artemis" />
```

| Attribute | Description |
|-----------|-------------|
| `queueConnectionFactoryName` | JNDI reference to the queue connection factory (e.g., `jms/qcf-artemis`). Must match a resource defined in `resources.yml`. |
| `destinationName` | Name of the queue. Can be chosen freely when `jms.createDestination=true`. In production, set this to `false` to restrict to administrator-configured queues. |
| `messageClass` | Message type (e.g., `TEXT`). |

## Connection Factory Types

| Brand | Non-XA | XA |
|-------|--------|-----|
| ActiveMQ Classic | `org.apache.activemq.ActiveMQConnectionFactory` | `org.apache.activemq.ActiveMQXAConnectionFactory` |
| ActiveMQ Artemis | `org.apache.activemq.artemis.jms.client.ActiveMQConnectionFactory` | `org.apache.activemq.artemis.jms.client.ActiveMQXAConnectionFactory` |

Use XA connection factories when transactions span multiple systems (e.g., reading a queue and writing a database in one transaction). Set `transactionmanager.type.default=NARAYANA` to enable XA transaction support.

## Driver Libraries

Place vendor-specific JMS client libraries in `/opt/frank/drivers`:

| Brand | Library | Maven Artifact |
|-------|---------|----------------|
| ActiveMQ Classic | activemq-all | [org.apache.activemq:activemq-all](https://mvnrepository.com/artifact/org.apache.activemq/activemq-all) |
| ActiveMQ Artemis | artemis-jakarta-client-all | [org.apache.activemq:artemis-jakarta-client-all](https://mvnrepository.com/artifact/org.apache.activemq/artemis-jakarta-client-all) |

## Properties

| Property | Description |
|----------|-------------|
| `jms.createDestination` | When `true`, queues are auto-created if they do not exist. Use only in development. |
| `jms.hostname` | Can be referenced in `resources.yml` URLs for flexibility (e.g., `tcp://${jms.hostname}:61616`). |

## XA Transactions

XA transactions require:

1. An XA-capable connection factory class
2. The Narayana transaction manager:

```properties
transactionmanager.type.default=NARAYANA
```

See [Integration Patterns](../configuration/integration-patterns.md) for full Narayana configuration details.
