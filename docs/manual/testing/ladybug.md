# Ladybug (Integration/Debug Testing)

## Purpose and Architecture

Ladybug captures adapter executions as reports. Each time an adapter runs, a report is generated containing all checkpoints (input/output at each processing step). These reports can be captured as test reports and replayed for regression testing.

Ladybug is accessed from Testing → Ladybug in the Frank!Console. The interface has two main tabs:

- **Debug** — displays live reports of adapter executions in a table; provides tree views of report contents
- **Test** — manages captured test reports; supports running, organizing, and comparing results

## Report Capture and Replay

To capture a test report:

1. In the **Debug** tab, select a report row
2. Select the uppermost "Pipeline" node in the tree view
3. Choose a **stub strategy** (e.g., "Never" or "Always")
4. Press **Copy** to capture the report to the Test tab

To run captured tests:

1. Go to tab **Test**, press **Refresh**
2. Select tests and press **Run**
3. Press **Refresh** to see results (green = pass, red = fail)

Use **Compare** to investigate failures — shows expected vs. actual results side-by-side with differences highlighted in red.

**Storage location:** Test reports are stored in the `tests/` directory within the instance directory. Files are:
- `metadata.xml` — Ladybug metadata
- `*.report.xml` — individual test reports

Configure a custom directory with property `ibistesttool.directory`.

## Stub Strategies

- **Never** — all calls to external systems are executed normally
- **Always** — all calls to external systems are stubbed using saved data from the captured report

Stub strategy "Always" reduces test scope to your adapter only, ignoring external system changes. Stub strategy "Never" tests the full integration including external systems.

## Test Report Organization

**Descriptions:** Open a test report → Edit → modify the description field. Descriptions appear in the Test tab overview.

**Folders:** Select a test report, enter a destination folder path (e.g., `/sutArchive/`), and press **Move**. Use **Copy** to duplicate a test report instead of moving it.

**Delete:** Select test reports and press **Delete**.

## Download/Upload Reports

- **Download all** — exports all captured test reports as a zip file
- **Upload** — imports a previously downloaded zip file, restoring test reports

This mechanism works independently of the Frank!Runner and supports sharing test reports between environments or team members.

## Editing Test Reports

Open a test report → select a node in the tree view → press **Edit**:
- Modify checkpoint messages (expected input/output values)
- Change the report name or description
- Add transformations or variables

Use the **Replace** button (visible after a failed test run) to automatically update the expected output to match the actual output.

## Ignoring Differences

#### Global Ignore

Configure a global XSLT transformation via Debug tab → **Options** → **Transformation**. This transformation is applied to all test reports during comparison.

Example — ignore a `<retrievalTime>` element globally:

```xml
<xsl:template match="*[local-name()='retrievalTime']">
  <xsl:element name="RETRIEVALTIME-IGNORED" namespace="{namespace-uri()}"/>
</xsl:template>
```

The global transformation is NOT saved with test reports when downloaded/uploaded.

#### Test-Specific Ignore

Each test report has its own **Transformation** field (accessible via Open → Edit → select topmost Pipeline node). Paste an XSLT transformation there to apply ignores only to that specific test.

The test-specific transformation IS saved with the test report during download/upload.

## Variables in Test Reports

Variables parameterize test reports. Define variables by opening a test report → Edit → enter variable names and values in the Variables field.

**Format:**

```
variableName1;variableName2
value1;value2
```

Reference variables in checkpoint messages using `${variableName}` syntax:

```xml
<docid>${docId}</docid>
```

Variable names and values are displayed in the Test tab next to each test report.

**Clone:** Select a test report, enter a folder name, and press **Clone**. The clone dialog accepts a CSV with variable names in the first row and values in subsequent rows. One clone is generated per row.

## Referencing Other Reports

Test reports can read values from other reports using the syntax:

```
${checkpoint(<checkpointUid>).xpath(<xpathExpression>)}
```

To find a checkpoint UID: open the source test report, select the target node, and read the checkpoint UID displayed in the details panel.

Example — read a UUID from another report's output:

```
<uuid>${checkpoint(2#32).xpath(/uuid)}</uuid>
```

**Constraint:** The referenced value must be inside an XML element.

## Custom Table Columns (springIbisTestToolCustom.xml)

Add columns to the Debug tab report table by creating a Spring bean configuration file.

**Step 1:** Create `classes/springIbisTestToolCustom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans
    xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd"
    >

    <import resource="springIbisTestTool.xml"/>

    <bean name="metadataExtractor" class="org.wearefrank.ladybug.MetadataExtractor">
        <property name="extraMetadataFieldExtractors">
            <list>
                <bean class="org.wearefrank.ladybug.metadata.StatusMetadataFieldExtractor"/>
                <bean class="org.wearefrank.ladybug.metadata.XpathMetadataFieldExtractor">
                    <property name="name" value="customer"/>
                    <property name="label" value="Customer"/>
                    <!-- <property name="extractFrom" value="first"/> -->
                    <property name="xpath" value="/message/customer" />
                </bean>
            </list>
        </property>
    </bean>

    <bean name="metadataNames" class="java.util.ArrayList">
        <constructor-arg>
            <list>
                <value>storageId</value>
                <value>endTime</value>
                <value>duration</value>
                <value>name</value>
                <value>correlationId</value>
                <value>status</value>
                <value>numberOfCheckpoints</value>
                <value>estimatedMemoryUsage</value>
                <value>storageSize</value>
                <value>customer</value>
            </list>
        </constructor-arg>
    </bean>
</beans>
```

**Step 2:** Set `ibistesttool.custom=Custom` in `classes/DeploymentSpecifics.properties`:

```properties
ibistesttool.custom=Custom
```

The `extractFrom` property controls which messages are queried:
- `first` — input messages only
- `last` — output messages only
- `all` — both input and output messages

## Database Storage for Reports

From Frank!Framework version 8.1+, reports are stored in the database by default (table `LADYBUG`).

| Property | Description |
|---|---|
| `ladybug.jdbc.migrator.active` | Whether to create table `LADYBUG`. Default: `${jdbc.migrator.active}` |
| `ladybug.jdbc.datasource` | Database name for Ladybug reports. If empty, uses local filesystem |

These must be environment or application properties.

**Custom columns in the database:** If you add columns via `springIbisTestToolCustom.xml`, add matching database columns using Liquibase. Create `ladybug/DatabaseChangelog_Custom.xml` in the classpath:

```xml
<changeSet id="LadybugCustom:1" author="Jaco de Groot">
    <comment>Add column EXTRACOLUMN</comment>
    <addColumn tableName="LADYBUG">
        <column name="EXTRACOLUMN" type="java.sql.Types.VARCHAR(255)"/>
    </addColumn>
</changeSet>
```

## Test Pipeline Interface

The Test Pipeline screen (Testing → Test Pipeline) bypasses the adapter's external interface and passes messages directly to the business logic. This avoids needing to construct HTTP requests or satisfy interface requirements.

Usage:
1. Select an adapter from the dropdown
2. Enter the input message in the message field
3. Press **Send**
4. The result appears below; a corresponding report is generated in Ladybug

The Debug tab table supports filtering by column headers (hover for tooltip descriptions) to locate specific reports among many.
