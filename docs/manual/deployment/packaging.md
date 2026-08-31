# Packaging Configurations

## Overview

Frank configurations can be packaged as `.zip` or `.jar` files for deployment. Reasons to package configurations:

- Single-file delivery simplifies deployment
- Enables inclusion of custom Java classes
- Supports versioning in database-deployed configurations

## Archive Structure

```
META-INF/MANIFEST.MF
my-config/Configuration.xml
my-config/Data.xml
my-config/webcontent/index.html
org/wearefrank/myapp/CustomPipe.class
```

Rules:
- The configuration name **must differ** from `${instance.name}`
- Configuration files live under a top-level directory named after the configuration
- Frontend code goes in `<config-name>/webcontent/`
- Java `.class` files are siblings of the configuration root directory (not inside it)

## Maven Parent POM

Use the Frank!Framework configuration parent POM to handle packaging automatically:

```xml
<parent>
    <groupId>org.frankframework</groupId>
    <artifactId>configuration-parent</artifactId>
    <version>10.2.0</version>
</parent>
```

Do not configure `maven-jar-plugin` manually when using the parent POM. The parent POM handles manifest generation, build info, and archive layout.

## WAR Packaging

The Frank!Framework can be packaged as a `.war` file for deployment on application servers (Apache Tomcat, WildFly, JBoss EAP, WebSphere).

Use Maven with `<packaging>war</packaging>` in `pom.xml`:

```bash
mvn clean install
```

The resulting `.war` file (in `target/`) is deployed by placing it in the application server's deployment directory (e.g., Tomcat's `webapps/`).

WAR-based deployments integrate with CI/CD pipelines (Jenkins, GitLab CI, GitHub Actions).

## Uploading Multiple Configurations in the console

Pack all configuration JAR files into a single `.zip` file. Use the "Multiple Configurations" checkbox in the "Upload Configuration" screen and upload the zip.

## Using autoload of multiple configurations with Docker compose

When using Docker, you can autoload multiple configurations by placing them in a directory and mounting it to `/opt/frank/configurations` in the container. 
The Frank!Framework will automatically load all configurations found in that directory if you use:
```
    environment:
      - configurations.directory.autoLoad=true
```

We have a maven module which defines the base for a configuration jar file. This is the `configuration-parent` module. It is available in the
Maven Central repository. You can use it as a parent POM for your configuration project. 
Assuming you have two configurations named `Configuration1` and `Configuration2` residing in the `src/main/configurations` directory of your project. 
There's also a `src/main/resources` directory which contains some resources that will be copied to the root of the jar file. The `pom.xml` file would look 
like this:

```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.frankframework</groupId>
        <artifactId>configuration-parent</artifactId>
        <version>10.3.0-SNAPSHOT</version>
    </parent>

	<artifactId>multiple-configs</artifactId>
    
    <properties>
        <configuration.names>Configuration1, Configuration2</configuration.names>
        <framework.version>10.3.0-SNAPSHOT</framework.version>
        <maven.compiler.source>25</maven.compiler.source>
        <maven.compiler.target>25</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <build>
        <defaultGoal>install</defaultGoal>
        <resources>
            <resource>
                <directory>${project.basedir}/src/main/configurations</directory>
            </resource>
            <resource>
                <directory>${project.basedir}/src/main/resources</directory>
            </resource>
        </resources>
    ...
</project>
```

Building this would result in a `.jar` file with the following structure:
* META-INF
    * MANIFEST.MF
* Configuration1
    * Configuration.xml
* Configuration2
    * Configuration.xml
* DeploymentSpecifics.properties (copied from `/src/main/resources`)
* resources.yml (copied from `/src/main/resources`)

In the pom.xml file we have defined the configurations that are contained in the jar file using the property `<configuration.names>Configuration1, Configuration2</configuration.names>`.
The configuration names must differ from the `${instance.name}` property.
