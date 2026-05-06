---
title: Testing
description: Troubleshooting testing-related issues in Frank!Framework.
sidebar_position: 3
---

# Testing

## Testing XSLT with Larva

```
scenario.description = adapt input ldap insert into functionally expired passwords

xpl.MaakLdapInput.className   = org.frankframework.larva.XsltProviderListener
xpl.MaakLdapInput.filename    = ../../../JavaSource/CheckPasswordFunctionalExpired/xsl/AdaptInputLdapInsertIntoPasswordFunctionalExpired.xsl

step1.xpl.MaakLdapInput.read              = scenario01/step1.xml
step1.xpl.MaakLdapInput.read.param1.name  = userType
step1.xpl.MaakLdapInput.read.param1.value = WN
step2.xpl.MaakLdapInput.write             = scenario01/step2.xml
```

## Larva Tests: No Restart Needed

Edited Larva tests take effect immediately without restarting the Frank!Framework or reloading configurations.

## Parameters in Larva Tests

Inline value:

```
adapter.TitanGET.param1.name=uniqueIdentifier
adapter.TitanGET.param1.value=abc
```

Value from file:

```
adapter.TitanGET.param1.name=uniqueIdentifier
adapter.TitanGET.param1.valuefile=01/input.xml
```

## Authorization to Enable Ladybug

Required role: `IbisDataAdmin`, `IbisAdmin`, or `IbisTester`.

