# Packaging Configurations

## Overview

Frank configurations can be packaged as `.zip` or `.jar` files for deployment. Reasons to package configurations:

- Single-file delivery simplifies deployment
- Enables inclusion of custom Java classes
- Supports versioning in database-deployed configurations

## Archive Structure

```
my-config/BuildInfo.properties
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

## BuildInfo.properties

```properties
configuration.version=1
configuration.timestamp=20250807-163000
```

Version information is read from `BuildInfo.properties` in uploaded archives for database deployment.

## Maven Parent POM

Use the Frank!Framework configuration parent POM to handle packaging automatically:

```xml
<parent>
    <groupId>org.frankframework</groupId>
    <artifactId>configuration-parent</artifactId>
    <version>10.1.0</version>
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

## Loading Multiple Configurations

Pack all configuration JAR files into a single `.zip` file. Use the "Multiple Configurations" checkbox in the "Upload Configuration" screen and upload the zip.
