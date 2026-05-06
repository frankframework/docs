---
title: API & HTTP Issues
description: Troubleshooting API and HTTP-related problems in Frank!Framework.
sidebar_position: 4
---

# API & HTTP Issues

## Testing ApiListener with Authentication Locally

Make `authenticationMethod` a property:

```
${api.authMethod}
```

Disable in `StageSpecifics_LOC.properties`:

```
api.authMethod=NONE
servlet.ApiListenerServlet.securityroles=
```

## ApiListener and curl Content-Type Issue

**Problem:** Using `curl --data` automatically adds `Content-Type: application/x-www-form-urlencoded`, causing unexpected behavior (empty input message, data treated as form parameter).

**Fix:** Suppress the header:

```
curl -H "Content-Type:" --request POST --url http://localhost/api/ingestDocument --data 'your-data'
```

## Security Warning: Path/Query Parameters Copied to Session

**Cause:** `ApiListener` without explicit parameter restrictions.

**Options:**

- If all parameters are needed: suppress the warning (see logfile for instructions)
- If no parameters are needed: set `allowAllParams="false"`
- If specific parameters are needed: list them in `allowedParameters` (this automatically restricts to listed parameters)

