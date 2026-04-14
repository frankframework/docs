---
sidebar_position: 1
title: Building a WAR Archive
description: Use Maven parent POMs to build a Frank!Framework WAR or EAR archive.
---

As a Maven project, the easiest way to use Frank!Framework is to use one of the starter parent POMs. The minimal or full bundle avoids manually managing required modules and version locking for application servers.

## Minimal bundle

```xml
<parent>
  <groupId>org.frankframework</groupId>
  <artifactId>frankframework-bundle-minimal</artifactId>
  <version>${ff.version}</version>
</parent>
```

## Full bundle

Contains almost every module:

```xml
<parent>
  <groupId>org.frankframework</groupId>
  <artifactId>frankframework-bundle-full</artifactId>
  <version>${ff.version}</version>
</parent>
```

## Optional modules

If you need `CMIS` or `Aspose`, add those dependencies explicitly:

```xml
<dependency>
  <groupId>org.frankframework</groupId>
  <artifactId>frankframework-aspose</artifactId>
  <version>${ff.version}</version>
</dependency>
```

Notes:
- The parent version and other framework module versions must match.
- Example modules such as `test` and `ear` are available as reference material.

