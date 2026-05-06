# Message Management

The Frank!Framework provides database-backed message storage for error handling, queuing, and auditing. All storage types use the `IBISSTORE` database table.

## Error Store

Stores messages that failed processing for later retry.

- Failed messages are written to `<JdbcErrorStorage>`
- Operators can view, resend, or delete failed messages from the console
- An error store icon appears on the Adapter Status page when messages are present
- Used with the Fire and Forget pattern to prevent message loss

### How Error Storage Works

When an adapter fails to process a message:

1. The transaction rolls back (no data is changed)
2. The message is stored in the error store
3. The error count appears on the Adapter Status page next to the receiver

### Resending Failed Messages

1. Open the Frank!Console
2. Navigate to **Adapter Status**
3. Look for the red error store icon (with count badge) next to the adapter's receiver
4. Click the error store icon to open the error store viewer
5. The list shows all failed messages with:
   - Message ID and Correlation ID
   - Timestamp of failure
   - Error message (reason for failure)
6. Select one or more messages using the checkboxes
7. Click **Resend** to reprocess the selected messages
8. Or click **Delete** to permanently remove them

After resending, the message re-enters the adapter pipeline. If it succeeds, it is removed from the error store. If it fails again, it returns with an updated error message.

### Bulk Operations

- **Resend all** — processes all messages in the error store
- **Delete all** — clears the error store (use with caution; messages cannot be recovered)

### When to Resend

Common scenarios:
- A downstream system was temporarily unavailable (resend after it recovers)
- A data fix was applied to correct invalid input
- A configuration bug was fixed that caused the processing failure

## Message Store

Database-backed message queue, an alternative to JMS queues.

- `<MessageStoreSender>` writes messages to the IBISSTORE table
- `<MessageStoreListener>` dequeues and processes messages
- Provides transactional queuing using the application database

When a `<MessageStoreSender>`/`<MessageStoreListener>` pair is used, the Frank!Framework automatically adds an error store. An explicit `<JdbcErrorStorage>` is not required.

### Queue Depth Monitoring

The message store queue depth is visible in the Frank!Console:

1. Navigate to **Adapter Status**
2. Adapters with a `MessageStoreListener` show a queue icon
3. The badge number indicates messages waiting to be processed

A growing queue may indicate:
- The processing adapter has a performance bottleneck
- The processing adapter is stopped or in error
- Upstream is sending at a higher rate than expected

## Message Log

Audit trail of all processed messages.

- `<JdbcMessageLog>` stores messages with metadata
- Records are retained for auditing and compliance
- Supports duplicate detection by checking previously processed message IDs
- Messages are automatically deleted when their retention period expires

### Inspecting the Message Log

1. Navigate to **JDBC → Browse** in the Frank!Console
2. Select the IBISSTORE table
3. Filter by:
   - **Type** = `L` (message log)
   - **SlotId** — matches the adapter/pipe that logged the message
   - **Date range**
4. Click a row to view the full message content

### Retention

Configure automatic cleanup:

```xml
<JdbcMessageLog
    datasourceName="jdbc/${instance.name.lc}"
    retention="30"/>
```

The retention value is in days.

## IBISSTORE Table

The `IBISSTORE` database table stores all message logs, message stores, and error stores. Key fields:

| Field | Type Code | Description |
|-------|-----------|-------------|
| Message Log | `L` | Logged messages (audit) |
| Message Store | `M` | Queued messages waiting for processing |
| In Process | `I` | Message currently being processed (when `statusValueInProcess="I"`) |
| Processed | `A` | Successfully processed from message store |
| Error Store | `E` | Failed messages awaiting retry |

### Requirements

- Property `jdbc.migrator.active=true` must be set as an environment or application property for the `IBISSTORE` table to be created
- The table is created in the database referenced by `jdbc.datasource.default`
- The database-backed stores work correctly across multiple application instances since state is shared

### JDBC Execute Query

For ad-hoc investigation, use **JDBC → Execute Query**:

```sql
SELECT * FROM IBISSTORE WHERE TYPE = 'E' AND SLOTID = 'MyInstance/MyAdapter' ORDER BY MESSAGEDATE DESC
```

This requires the `IbisDataAdmin` role.
