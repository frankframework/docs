# Integration Patterns and Data Integrity

The Frank!Framework connects applications from different vendors, transforming requests and responses between otherwise incompatible systems. This document covers patterns and features for protecting data integrity during integration.

For details on the pipes and senders used in these examples, see the [FF! Reference](https://reference.frankframework.org/#/components).

## Request/Reply

System A sends a request to system B. System B processes the request immediately and returns a response indicating success or failure. The sender waits for the response before proceeding.

## Fire and Forget

System A sends a request to system B without waiting for processing to complete. B may return an acknowledgment, but this does not indicate whether the request was successfully processed. This pattern applies when:

- System A must produce quick feedback to an upstream system or user.
- System B requires a long time to process the request.

Eventually, a separate notification may inform A about success or failure of the original request.

Messages in Fire and Forget are typically placed on a queue. The sender receives a positive response when the message is enqueued. The recipient reads from the queue and processes the message. If processing fails, reading from the queue can be rolled back using XA transactions so the message can be retried.

## Database Transactions

Transactions ensure data manipulations are either completed correctly or not performed at all. Transactions are configured on a `<Receiver>` or `<Pipeline>` using the `transactionAttribute` attribute.

### transactionAttribute Values

| Value | Behavior |
|-------|----------|
| `Required` | Joins an existing transaction or creates a new one if none exists. |
| `RequiresNew` | Always creates a new transaction, suspending any existing one. |
| `Mandatory` | Requires an existing transaction; throws an error if none exists. |
| `NotSupported` | Executes without a transaction, suspending any existing one. |
| `Supports` | Joins an existing transaction if one exists; otherwise executes without one. This is the default. |
| `Never` | Executes without a transaction; throws an error if one exists. |

When `transactionAttribute="Required"` is set on a receiver, all data manipulations by the receiver and its pipeline occur within the same transaction. Sub-adapters participate in or create transactions based on their own `transactionAttribute` setting.

### Example: Transaction with Sub-Adapters

```xml
<Adapter name="writeDbAsync">
    <Receiver checkForDuplicates="true" processResultCacheSize="0" transactionAttribute="Required">
        <ApiListener uriPattern="/write" method="POST" allowAllParams="false"/>
        <JdbcMessageLog slotId="write-db-req"/>
    </Receiver>
    <Pipeline>
        <SenderPipe name="enqueue">
            <JmsSender name="enqueue" destinationName="myQueue" messageClass="TEXT" queueConnectionFactoryName="jms/qcf-artemis"/>
        </SenderPipe>
    </Pipeline>
</Adapter>
<Adapter name="writeDb">
    <Receiver transactionAttribute="Required" maxRetries="5">
        <JmsListener name="dequeue" destinationName="myQueue" messageClass="TEXT" queueConnectionFactoryName="jms/qcf-artemis" />
        <JdbcErrorStorage slotId="write-db"/>
    </Receiver>
    <Pipeline>
        <SenderPipe name="writeTableMessage">
            <FrankSender name="writeTableMessage" target="writeTableMessage" />
        </SenderPipe>
        <EchoPipe name="originalMessage" getInputFromSessionKey="originalMessage" />
        <SenderPipe name="writeTableOtherMessage">
            <FrankSender name="writeTableOtherMessage" target="writeTableOtherMessage" />
        </SenderPipe>
    </Pipeline>
</Adapter>
<Adapter name="writeTableMessage">
    <Receiver transactionAttribute="Mandatory">
        <JavaListener name="writeTableMessage" serviceName="writeTableMessage" />
    </Receiver>
    <Pipeline>
        <SenderPipe name="writeTableMessage">
            <FixedQuerySender query="INSERT INTO &quot;message&quot;(message) VALUES(?)">
                <Param name="message" type="string" defaultValueMethods="input" />
            </FixedQuerySender>
        </SenderPipe>
    </Pipeline>
</Adapter>
```

If a sub-adapter fails, the entire transaction is rolled back—including successful operations by other sub-adapters within the same transaction.

## Message ID and Correlation ID

Duplicate detection ensures an incoming message is processed only once, even if the upstream system sends the same request multiple times.

### Message ID

The upstream system provides a unique message ID with each request. The receiver maintains a message log of all received IDs. Duplicate message IDs cause the request to be discarded (HTTP 304 Not Modified for API listeners).

```xml
<Adapter name="writeDb">
    <Receiver checkForDuplicates="true" processResultCacheSize="0">
        <ApiListener uriPattern="/write" method="POST" allowAllParams="false"/>
        <JdbcMessageLog slotId="write-db"/>
    </Receiver>
    <Pipeline>
        ...
    </Pipeline>
</Adapter>
```

The message ID is expected in HTTP header `Message-Id` by default. This is configurable via the `messageIdHeader` attribute on the listener.

### Correlation ID

For correlation-based duplicate detection, set `checkForDuplicatesMethod="CORRELATIONID"` on the receiver. The correlation ID is extracted from the message body using an XPath expression:

```xml
<Receiver checkForDuplicates="true" checkForDuplicatesMethod="CORRELATIONID"
    correlationIDXPath="/input/@correlationId" processResultCacheSize="0">
    <ApiListener uriPattern="/write" method="POST" allowAllParams="false"/>
    <JdbcMessageLog slotId="write-db"/>
</Receiver>
```

Input schema for correlation ID extraction:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="input">
    <xs:complexType>
      <xs:attribute name="correlationId" type="xs:string" />
      <xs:attribute name="message" type="xs:string" />
    </xs:complexType>
  </xs:element>
</xs:schema>
```

The correlation ID can also be extracted from a HTTP header using the `correlationIdHeader` attribute on the listener.

## JdbcMessageLog

`<JdbcMessageLog>` stores incoming messages in the `IBISSTORE` database table for duplicate detection and audit logging.

| Attribute | Description |
|-----------|-------------|
| `checkForDuplicates` | Set to `true` on the receiver to enable duplicate detection. |
| `checkForDuplicatesMethod` | `MESSAGEID` (default) or `CORRELATIONID`. Determines which ID is checked for duplicates. |
| `slotId` | Distinguishes records belonging to different message logs within the shared `IBISSTORE` table. |

Requirements:

- Property `jdbc.migrator.active=true` must be set as an environment or application property (not within a configuration) for the `IBISSTORE` table to be created.
- The table is created in the database referenced by `jdbc.datasource.default`.
- The database-backed message log works correctly across multiple application instances since state is shared via the database.

## MessageStoreSender / MessageStoreListener

The `<MessageStoreSender>` / `<MessageStoreListener>` pair uses database table `IBISSTORE` as a queue, eliminating the need for a separate message queue and XA transactions.

```xml
<Adapter name="writeDbAsync">
    <Receiver checkForDuplicates="true" processResultCacheSize="0" transactionAttribute="Required">
        <ApiListener uriPattern="/write" method="POST" allowAllParams="false"/>
        <JdbcMessageLog slotId="write-db-req"/>
    </Receiver>
    <Pipeline>
        <SenderPipe name="enqueue">
            <MessageStoreSender slotId="write-db"/>
        </SenderPipe>
    </Pipeline>
</Adapter>
<Adapter name="writeDb">
    <Receiver transactionAttribute="Required" maxRetries="5">
        <MessageStoreListener slotId="write-db" statusValueInProcess="I" />
    </Receiver>
    <Pipeline>
        ...
    </Pipeline>
</Adapter>
```

When a `<MessageStoreSender>` / `<MessageStoreListener>` pair is used, the Frank!Framework automatically adds an error store to the Frank!Console. An explicit `<JdbcErrorStorage>` is not required.

The `statusValueInProcess="I"` attribute updates the `TYPE` field in `IBISSTORE` when processing begins (outside the transaction), preventing parallel instances from reading the same message.

## IBISSTORE Table TYPE Field

The `TYPE` field in the `IBISSTORE` table indicates the state and purpose of each record:

| Value | Meaning |
|-------|---------|
| `L` | Message is in a message log. |
| `M` | Message is waiting to be read by a `<MessageStoreListener>`. |
| `I` | Message is in process (only when `statusValueInProcess="I"` is set). |
| `A` | Message has been processed successfully. |
| `E` | Message is in error store (processing failed). |

A `<JdbcMessageLog>` and a `<JdbcErrorStorage>` can share the same `slotId` value because they use different `TYPE` values.

## Error Stores

### JdbcErrorStorage

`<JdbcErrorStorage>` stores messages that fail processing, allowing operators to resend them from the Frank!Console after resolving the issue.

```xml
<Receiver transactionAttribute="Required" maxRetries="5">
    <JmsListener name="dequeue" destinationName="myQueue" messageClass="TEXT" queueConnectionFactoryName="jms/qcf-artemis" />
    <JdbcErrorStorage slotId="write-db"/>
</Receiver>
```

### maxRetries

The `maxRetries` attribute on the receiver controls how many times processing is retried before the message is moved to the error store. After all retries are exhausted, the transaction is committed (permanently dequeueing the message) and the message is stored in the error store.

When a message is resent from the Frank!Console, it enters the pipeline directly (bypassing the receiver), but the transaction attribute of the receiver is still inherited by the pipeline.

## XA Transactions and Two-Phase Commit

XA transactions span multiple data-processing systems (e.g., a queue and a database). They are implemented using the two-phase commit protocol, which requires a transaction coordinator.

Enable XA transactions by setting:

```
transactionmanager.type.default=NARAYANA
```

The `transactionAttribute` works the same for XA transactions as for single-resource transactions. In a Fire and Forget setup with a queue:

- Enqueueing happens in one transaction: the message is either placed in the message log **and** enqueued, or nothing is done.
- Dequeueing happens in another transaction that also spans database writes: the message is either dequeued **and** processed, or not dequeued at all.

Use `transactionAttribute="Required"` (not `RequiresNew`) for the default case. A `<JmsListener>` or `<MessageStoreListener>` receiver does not have an existing transaction, so `Required` creates a new one. Reserve `RequiresNew` for cases where an existing transaction is present but a new separate transaction is needed.

## JMS Configuration

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

## Narayana Transaction Manager Configuration

Narayana is the open-source two-phase commit transaction coordinator used by the Frank!Framework. It was developed for WildFly/JBoss EAP and is backed by Red Hat.

### General Properties

```properties
# Unique identifier for this transaction manager instance (required in clustered deployments).
transactionmanager.uid=

# Maximum timeout (in seconds) allowed for transactions.
transactionmanager.defaultTransactionTimeout=180

# Time (in ms) between runs of the transaction maintenance thread.
transactionmanager.narayana.reapTime=120000

# Time (in ms) a connection can be active before it is considered stuck.
transactionmanager.narayana.stuckTime=180000

# How often (in ms) the connection pool checks for stuck connections.
transactionmanager.narayana.stuckTimerTime=30000
```

### Object Store Types

Narayana supports multiple storage backends for transaction information:

- **ShadowNoFileLockStore** (default): File-based storage using user-level locking with shadow/committed file pairs. Requires a local filesystem with low latency (not a network mount).
- **JDBCStore**: Stores transaction state in a database as BLOBs. Preferred for cloud deployments where filesystem mounts may introduce latency across cluster nodes.

### Object Store Properties

```properties
# Object store implementation class.
# Default: com.arjuna.ats.internal.arjuna.objectstore.ShadowNoFileLockStore
# For JDBC: com.arjuna.ats.internal.arjuna.objectstore.jdbc.JDBCStore
transactionmanager.narayana.objectStoreType=com.arjuna.ats.internal.arjuna.objectstore.ShadowNoFileLockStore

# DataSource name for JDBCStore (should not be XA-capable; managed and pooled by the framework).
transactionmanager.narayana.objectStoreDatasource=

# Whether to drop the object store table on startup.
transactionmanager.narayana.dropTable=false

# Whether to create the object store table if it does not exist.
transactionmanager.narayana.createTable=true
```

JDBCStore limitations:

- Object state size is limited to 64KB (BLOB constraint).
- The DataSource must not be transactional itself.

Reference: [Narayana documentation](https://www.narayana.io/docs/project/index.html)

## Console Warnings Suppression

The Frank!Framework produces console warnings when it suspects error stores or message logs are missing. These warnings may be false positives, for example when sub-adapters are only called from a parent adapter that already has an error store.

To suppress specific warnings, search the log file for the warning text. The log entry includes the property name to set. Example suppression properties:

```properties
warnings.suppress.transaction.writeDbAsync=true
warnings.suppress.transaction.writeTableMessage=true
warnings.suppress.transaction.writeTableOtherMessage=true
warnings.suppress.integrityCheck.writeDbAsync=true
```
