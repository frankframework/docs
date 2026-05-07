# Custom Code

## Overview

Custom Java code can extend the Frank!Framework when standard building blocks are insufficient. Custom pipes integrate with Ladybug reports and Frank!Console flowcharts.

## Extending FixedForwardPipe

Derive custom pipes from [`org.frankframework.pipes.FixedForwardPipe`](https://reference.frankframework.org/#/components/FixedForwardPipe) and implement:

```java
public PipeRunResult doPipe(Message message, PipeLineSession session) throws PipeRunException
```

## Implementation Template

```java
package org.wearefrank.mermaid.dashboard;

import org.frankframework.core.PipeLineSession;
import org.frankframework.core.PipeRunException;
import org.frankframework.core.PipeRunResult;
import org.frankframework.pipes.FixedForwardPipe;
import org.frankframework.stream.Message;

public class MyCustomPipe extends FixedForwardPipe {

    public PipeRunResult doPipe(Message message, PipeLineSession session) throws PipeRunException {
        try {
            String template = message.asString();
            String result = /* processing logic */;
            Message m = new Message(result);
            return new PipeRunResult(getSuccessForward(), m);
        }
        catch(SomeException e) {
            throw new PipeRunException(this, "Some exception encountered", e);
        }
    }
}
```

## Message Class

`org.frankframework.stream.Message` holds input and output data for pipes. Convert to string with `message.asString()`. Create new messages with `new Message(result)`.

## PipeRunResult

`org.frankframework.core.PipeRunResult` wraps:

- A **forward name** (e.g., `success`) — determines which path the pipeline follows
- An **output message**

Use `getSuccessForward()` for the default success forward. Return other forward names to signal error conditions.

## Accessing Parameters

Define parameters with `<Param>` elements in XML. Access them in the pipe implementation via the session or parameter resolution mechanisms provided by the framework.

## Forward Names in XML

Forward names returned by `PipeRunResult` are linked to target pipes or pipeline exits with `<Forward>` elements:

```xml
<Pipe name="myPipe" className="org.wearefrank.mermaid.dashboard.MyCustomPipe">
    <Forward name="success" path="nextPipe"/>
    <Forward name="error" path="errorExit"/>
</Pipe>
```

## Referencing Custom Pipes

Reference custom pipes using the `className` attribute on the `<Pipe>` element:

```xml
<Pipe name="pipe-name" className="full.path.of.MyClass"> ... </Pipe>
```

## Compile-Time Dependencies

Custom code must target the same Java version as the Frank!Framework. Add Frank!Framework components as compile-time dependencies:

```xml
<dependencies>
    <dependency>
        <groupId>org.frankframework</groupId>
        <artifactId>frankframework-core</artifactId>
        <version>${ff.version}</version>
        <scope>compile</scope>
    </dependency>
</dependencies>
```

## Packaging Options

### Configuration-specific

Package custom code with the configuration. The code is not accessible by other configurations.

Requirements:
- Set property `configurations.<configuration name>.allowCustomClasses` to `true`
- Configuration must be packaged (JAR) — plain directory trees do not work
- Uses `DirectoryClassLoader` or `JarFileClassLoader` depending on deployment

### Shared JAR

Build custom code into a dedicated `.jar` and deploy it in `/opt/frank/resources`. This makes the code available to all configurations in the container.

Requirements:
- Set property `configurations.allowCustomClasses` to `true`

## ClassLoader Requirements

Custom classes are loaded through the Frank!Framework's class loading mechanism. When classes are loaded by different classloaders (e.g., `DirectoryClassLoader` vs `java.net.URLClassLoader`), the JVM treats them as separate unnamed modules. This can cause `IllegalAccessError` exceptions.

To avoid this:
- Make all custom Java classes `public`
- Or use inner classes within the custom pipe class

This ensures JVM module visibility rules do not prevent classes from accessing each other.

## allowCustomClasses Property

- `configurations.<configname>.allowCustomClasses=true` — enables custom classes for a specific configuration
- `configurations.allowCustomClasses=true` — enables custom classes globally (for shared JARs in `/opt/frank/resources`)
