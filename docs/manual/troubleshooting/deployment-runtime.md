---
title: Deployment & Runtime
description: Troubleshooting deployment and runtime issues in Frank!Framework.
sidebar_position: 5
---

# Deployment & Runtime

## Watching Frank!Framework Startup

- `INFO [main] org.apache.catalina.core.ApplicationContext.log Starting IbisContext` — framework startup begins
- `INFO [main] org.apache.catalina.startup.Catalina.start Server startup in [xxx] milliseconds` — ready to receive HTTP requests

## Custom Code: IllegalAccessError Between Classes

**Problem:** `IllegalAccessError: failed to access class` when custom classes are loaded by different classloaders (`URLClassLoader` vs `DirectoryClassLoader`).

**Cause:** The JVM treats classes from different classloaders as separate unnamed modules, blocking non-public access.

**Fix:** Make all custom Java classes `public`, or define helper classes as inner classes within the custom pipe.

## Credential Factory Not Working

**Problem:** HTTP 401 from external system despite configured credentials.

**Fix:** Check Application Server startup logs (e.g., `${catalina.home}/logs`) for credential factory initialization errors. See the [FF! Reference for credential providers](https://reference.frankframework.org/#/credential-providers) for configuration details. Example:

```
WARNING [main] org.frankframework.credentialprovider.CredentialFactory.tryFactory Cannot instantiate CredentialFactory [org.frankframework.credentialprovider.FileSystemCredentialFactory]
```

These errors do not appear as console warnings.

## Flow Diagram Images

Property `flow.adapter.dir` holds the directory where flow diagrams are saved. Find its value under "Environment Variables" in the Frank!Console.

