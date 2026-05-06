# Scheduling

The Frank!Framework uses the Quartz scheduler for periodic adapter execution.

## Configuration

Schedules are defined in the Frank configuration XML:

```xml
<MSGScheduler>
    <MSGSchedulerJob name="MyJob" cronExpression="0 0/5 * * * ?" adapterName="MyAdapter"/>
</MSGScheduler>
```

Schedules can also be uploaded via the Frank!Console.

## Cron Expressions

Standard Quartz cron format with six or seven fields:

```
seconds minutes hours day-of-month month day-of-week [year]
```

Examples:

| Expression | Meaning |
|-----------|---------|
| `0 0/5 * * * ?` | Every 5 minutes |
| `0 0 8 * * ?` | Daily at 08:00 |
| `0 0 0 1 * ?` | First day of each month at midnight |
| `0 30 6 ? * MON-FRI` | Weekdays at 06:30 |
| `0 0 22 ? * SAT,SUN` | Saturday and Sunday at 22:00 |

## Console

The Scheduling page in the Frank!Console shows:

- Job groups with their triggers
- Next fire time for each trigger
- Previous fire time
- Trigger state (NORMAL, PAUSED)
- Pause and resume controls

### Pause and Resume

To temporarily stop a scheduled job without removing it:

1. Navigate to **Scheduling** in the Frank!Console
2. Find the job in the list
3. Click **Pause** next to the trigger
4. The trigger state changes to PAUSED — no further executions occur
5. Click **Resume** when ready to restart the schedule

Pausing is useful during maintenance windows or when a downstream dependency is unavailable.

### Pause All / Resume All

The page header provides buttons to pause or resume all triggers at once. This is equivalent to a "maintenance mode" for all scheduled processing.

## Uploading a Schedule

Schedules can be defined outside the Frank configuration XML and uploaded via the console:

1. Navigate to **Scheduling**
2. Click **Upload**
3. Provide:
   - **Job name** — unique identifier
   - **Cron expression** — the schedule
   - **Adapter name** — the adapter to invoke
   - **Configuration name** — which configuration contains the adapter
   - **Message** (optional) — input message to pass to the adapter
4. Click **Save**

Uploaded schedules are stored in the database and survive application restarts (if using a database-backed job store).

### Modifying an Uploaded Schedule

To change a schedule:

1. Delete the existing job from the Scheduling page
2. Upload a new job with the updated cron expression

There is no in-place edit; delete and recreate is the workflow.

## Persistence

When configured with a database-backed job store, schedules survive application restarts. Without database persistence, schedules are recreated from the configuration on startup.

Configure a database-backed job store by pointing it at the application datasource:

```properties
quartz.scheduler.jobStore.class=org.quartz.impl.jdbcjobstore.JobStoreTX
quartz.scheduler.jobStore.dataSource=quartzDS
quartz.scheduler.dataSource.quartzDS.jndiURL=java:comp/env/jdbc/${instance.name.lc}
```

The `jndiURL` must match the JNDI name of the datasource configured in the application server or Spring context.

## Interval-Based Scheduling

For simple interval scheduling (no cron complexity), use `MSGSchedulerJob` with an interval attribute inside `<MSGScheduler>`:

```xml
<MSGScheduler>
    <MSGSchedulerJob name="PollJob" interval="300000" adapterName="PollAdapter"/>
</MSGScheduler>
```

The interval is in milliseconds (300000 = 5 minutes).


