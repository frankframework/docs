# Adapter Status

The Adapter Status page is the primary operational dashboard for monitoring and controlling a Frank instance. It displays all adapters and their current state.

## Adapter States

| State | Description |
|-------|-------------|
| Started | Adapter is running and processing messages |
| Starting | Adapter is initializing |
| Stopped | Adapter is inactive, not processing messages |
| Stopping | Adapter is shutting down |
| Error | Adapter has encountered a critical issue |

## Page Layout

- **Configuration selector** at the top switches between loaded configurations
- **Configuration summary** shows total adapters, running count, stopped count, and counts per state
- **Configuration messages** — info, warning, and error messages per adapter
- **Adapter list** shows each adapter with its state and receivers
- **Error indicators** (red badge) appear when messages are in the error store
- **Message store indicators** (blue badge) show pending messages in queue

> **Note:** Not all errors result in an adapter entering state "Error". Monitor both the state matrix and the configuration messages for complete visibility.

## Managing Receivers

Each adapter can have one or more receivers. Receivers can be individually started and stopped independently of the adapter.

### Stopping a Receiver

1. Navigate to **Adapter Status**
2. Find the adapter and locate its receiver
3. Click the **Stop** button next to the specific receiver
4. The receiver state changes to Stopped — no new messages will be picked up
5. Messages already in flight continue processing to completion

Use this when:
- A downstream system is unavailable and you want to stop picking up new messages
- You need to apply a data fix before processing continues
- You want to drain a queue at a controlled rate

### Starting a Receiver

1. Click the **Start** button next to the stopped receiver
2. Processing resumes immediately
3. Any messages that arrived while the receiver was stopped are picked up (if using a persistent queue or message store)

### Stopping a Receiver vs. Stopping an Adapter

| Action | Effect |
|--------|--------|
| Stop receiver | Receiver stops picking up messages. Pipeline remains available (e.g., for IbisLocalSender calls). |
| Stop adapter | All receivers stop. Pipeline is deactivated. Calls from other adapters will fail. |

## Test Pipeline

Test Pipeline allows manual invocation of an adapter with a custom message, useful for debugging and verification.

### Using Test Pipeline

1. Navigate to **Testing → Test Pipeline** in the Frank!Console
2. Select the target adapter from the dropdown
3. Enter or paste the input message in the text area
4. Optionally set:
   - **Encoding** — character encoding for the message
   - **Session keys** — additional session variables as key=value pairs
5. Click **Send**
6. The result panel shows:
   - **State** — SUCCESS or ERROR
   - **Output message** — the response from the pipeline
   - **Duration** — processing time in milliseconds

### When to Use Test Pipeline

- **Initial development** — verify an adapter processes a message correctly before connecting real inputs
- **Debugging failures** — reproduce a failed message by pasting it from the error store
- **Verification after fix** — confirm a configuration change resolves the issue before resending from the error store

## Configuration Management

### Reload Configuration

To reload a configuration without restarting the application:

1. Navigate to **Adapter Status**
2. Click the **Reload** button next to the configuration name
3. The framework re-reads configuration XML and reinitializes all adapters in that configuration
4. Other configurations remain unaffected

Use reload when:
- Configuration XML has been modified on disk or in the database
- You want to pick up property changes
- A class-loaded configuration was updated

### Database Deployment

Configurations can be stored in the database for shared access across instances:

```properties
configurations.NewHorizons.classLoaderType=DatabaseClassLoader
```

Upload via **Configuration → Manage Configurations → Upload Config**:
- Select datasource and zip file
- **Activate Config** — marks this version as active
- **Auto Reload** — automatically reloads the configuration

Version information is read from `BuildInfo.properties`:

```properties
configuration.version=1_20200416-140400
```

Multiple versions are stored simultaneously with instant switching. Configurations are stored in the `IBISCONFIG` table.

### Reload vs. Restart

| Action | Scope |
|--------|-------|
| Reload configuration | Reinitializes all adapters in one configuration |
| Stop/Start single adapter | Affects only one adapter |
| Application restart | Reinitializes everything including framework internals |

## Environment Variables

The Environment Variables page displays all system properties and Frank!Framework properties. Use browser search (Ctrl+F) to locate specific properties.

The **Dynamic parameters** panel includes runtime-adjustable settings:
- **Log Level** — sets the minimum log level. Changes are not persistent across restarts.
- **Enable Ladybug Debugger** — enables or disables report generation at runtime.
