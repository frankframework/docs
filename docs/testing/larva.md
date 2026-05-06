# Larva (Unit Testing)

## Purpose and Architecture

Larva tests adapters in isolation (unit tests). The Frank!Framework integrates external systems, but setting up integration test environments with all connected systems is resource-intensive. Larva allows testing individual adapters without requiring external systems by replacing their interfaces with direct Java call stubs.

Larva provides a simple properties-based scripting language to define test scenarios. Each scenario exercises a single adapter by sending input messages and verifying output messages against expected values.

## Stubbing External Interfaces

When property `stub4testtool.configuration` is `true`, the Frank!Framework rewrites adapters to replace external interfaces with testable alternatives:

- **ApiListener** → replaced with a **JavaListener** (accessible via direct Java calls)
- **HttpSender** → replaced with an **IbisJavaSender** (calls a Java object directly)

The replacement listener gets the name `testtool-<adapterName>` and the replacement sender gets the name `testtool-<pipeName>`. Set this property in `StageSpecifics_LOC.properties` to restrict stubbing to the LOC DTAP stage:

```properties
stub4testtool.configuration=true
warnings.suppress.sqlInjections.ManageDatabase=true
```

## Test Scenario Structure

Larva tests are stored in a `tests/` directory. A test scenario consists of:

- A **`common.properties`** file defining reusable services
- A **scenario properties file** (e.g., `scenario01.properties`) defining the test steps
- **Message files** (e.g., XML) containing input/expected output data

Directory structure example:

```
tests/
  hermesBridge/
    common.properties
    scenario01.properties
    scenario01/
      hermesAddressRequest.xml
      conscienceAddressRequest.xml
      conscienceAddressResponse.xml
      hermesAddressResponse.xml
```

## Service Definitions

Services are defined in `common.properties` using the format `serviceName.propertyName = value`. A service name always has two words (e.g., `adapter.toConscience` or `stub.conscience`).

**IbisJavaSender** — sends messages to a JavaListener via direct Java calls:

```properties
adapter.toConscience.className = org.frankframework.senders.IbisJavaSender
adapter.toConscience.serviceName=testtool-adapterToConscience
```

Properties:
- `className` — always `org.frankframework.senders.IbisJavaSender`
- `serviceName` — the name of the target JavaListener

**JavaListener** — receives messages from an IbisJavaSender:

```properties
stub.conscience.className = org.frankframework.receivers.JavaListener
stub.conscience.serviceName = testtool-pipeCallConscience
```

Properties:
- `className` — always `org.frankframework.receivers.JavaListener`
- `serviceName` — identifier used by IbisJavaSender to locate this listener

Convention: use `adapter` prefix for services representing the entry point of the adapter under test, and `stub` prefix for services representing stubbed external systems.

## Step Commands

Scenario properties files define a sequence of numbered steps. Each step reads from or writes to a service.

**Syntax:** `step<n>.<serviceName>.<command> = <filename>`

Commands:
- `write` — sends the contents of `<filename>` to the service
- `read` — reads from the service and compares the result with `<filename>`

Example (`scenario01.properties`):

```properties
scenario.description = Hermes requests address from Conscience

include = common.properties

step1.adapter.toConscience.write = scenario01/hermesAddressRequest.xml
step2.stub.conscience.read = scenario01/conscienceAddressRequest.xml
step3.stub.conscience.write = scenario01/conscienceAddressResponse.xml
step4.adapter.toConscience.read = scenario01/hermesAddressResponse.xml
```

The `include` directive loads service definitions from the specified file (relative path from the scenario file). Multiple `include =` lines are allowed.

A step result can be ignored: `step7.database.Generic.read=ignore`

Example message file (`hermesAddressRequest.xml`):

```xml
<addressRequest>
  <relationId>1053247</relationId>
</addressRequest>
```

## Properties in Tests

Larva supports property references within test scenarios. Properties from environment-level and the "Frank!Framework + classes" layer are available.

**Caveat:** Properties defined in the "Configurations" layer (typically in `configurations/` subdirectories) are NOT available to Larva.

Define a property in `classes/StageSpecifics_LOC.properties`:

```properties
myProperty=myValue
```

Reference it in scenario files using standard `${propertyName}` syntax.

## Ignore/Replace/Remove Transformations

Larva transforms actual results before comparison to handle dynamic values. Transformations use the syntax:

```
<transformationType><numberOrName>.key=<text>
```

For two-key transformations: `<type><id>.key1=<start>` and `<type><id>.key2=<end>`.

The `<numberOrName>` is either an increasing integer starting at 1, or a dot-prefixed string (e.g., `.contentA`).

Ignores are typically placed in `common.properties` (applies to all scenarios) or in individual scenario files.

| Transformation | Description |
|---|---|
| `ignoreRegularExpressionKey` | Replaces all regex matches with `IGNORE` |
| `ignoreKey` | Replaces all literal occurrences of key with `IGNORE` |
| `ignoreContentBetweenKeys` | Replaces content between key1 and key2 (exclusive) with `IGNORE` |
| `ignoreKeysAndContentBetweenKeys` | Replaces content between key1 and key2 (inclusive) with `IGNORE` |
| `ignoreContentBeforeKey` | Replaces everything before key with `IGNORE` |
| `ignoreContentAfterKey` | Replaces everything after key with `IGNORE` |
| `ignoreCurrentTimeBetweenKeys` | Replaces current time between key1/key2 with `IGNORE_CURRENT_TIME` |
| `replaceRegularExpressionKeys` | Replaces all regex matches (key1) with key2 value |
| `replaceKey` | Replaces all literal occurrences of key1 with key2 |
| `replaceEverywhereKey` | Same as `replaceKey` |
| `removeRegularExpressionKey` | Removes all regex matches (replaces with `""`) |
| `removeKeysAndContentBetweenKeys` | Removes content between key1 and key2 (inclusive) |
| `removeKey` | Removes all literal occurrences of key |
| `decodeUnzipContentBetweenKeys` | Decodes and unzips base64 content between key1/key2 |
| `canonicaliseFilePathContentBetweenKeys` | Canonicalizes file path between key1/key2 |
| `formatDecimalContentBetweenKeys` | Formats decimal number between key1/key2 to canonical form |

**Examples:**

```properties
# Ignore dynamic content between XML tags
ignoreContentBetweenKeys1.key1=<RecordID>
ignoreContentBetweenKeys1.key2=</RecordID>

# Or with named identifiers
ignoreContentBetweenKeys.contentA.key1=<Timestamp>
ignoreContentBetweenKeys.contentA.key2=</Timestamp>

# Replace regex matches
replaceRegularExpressionKeys1.key1=RecordID
replaceRegularExpressionKeys1.key2=ID

# Remove all digits
removeRegularExpressionKey1.key=\\d

# Ignore current time with pattern and margin
ignoreCurrentTimeBetweenKeys1.key1=<Timestamp>
ignoreCurrentTimeBetweenKeys1.key2=</Timestamp>
ignoreCurrentTimeBetweenKeys1.pattern=yyyy-MM-dd'T'HH:mm:ss.SSSZ
ignoreCurrentTimeBetweenKeys1.margin=12345
ignoreCurrentTimeBetweenKeys1.errorMessageOnRemainingString=false

# Decode and unzip
decodeUnzipContentBetweenKeys1.key1=<File>
decodeUnzipContentBetweenKeys1.key2=</File>
decodeUnzipContentBetweenKeys1.replaceNewlines=false
```

## Larva Console UI

The Larva console (Testing → Larva in the Frank!Console) provides:

1. **Run button** — executes selected test scenarios
2. **Scenarios root selector** — groups scenarios by root directory. Configured via properties:
   - `scenariosroot1.description` — display name
   - `scenariosroot1.directory` — filesystem path
   - Additional roots: `scenariosroot<n>.description` / `scenariosroot<n>.directory`
3. **Scenario selector** — choose which scenarios to run within the selected root
4. **Request timeout** — maximum wait time for a response (default from `larva.timeout`, default 30000 ms)
5. **Wait before clean up** — time to wait for async responses after all writes complete (default 100 ms)
6. **Output verbosity** — controls how much detail is shown during execution

---

