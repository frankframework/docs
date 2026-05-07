---
sidebar_position: 0
title: Introduction
description: What is Frank!Framework and how to get started building integrations.
---

# Introduction

Frank!Framework is an open-source, low-code integration framework for building message-based adapters and connecting systems. It uses XML configuration to define pipelines that receive, transform, and route messages — without writing application code.

## Key Concepts

- **Adapter** — A self-contained integration flow with a receiver (input) and a pipeline (processing logic).
- **Receiver** — Listens for incoming messages (HTTP, JMS, file polling, scheduling, etc.).
- **Pipeline** — A sequence of pipes that process the message step by step.
- **Pipe** — A single processing unit (XSLT transformation, database query, API call, validation, etc.).
- **Sender** — Delivers a message to an external system or resource.

## How It Works

You define your integrations in XML configuration files. The framework loads these at startup and exposes each adapter as a running service. A typical adapter looks like this:

```xml
<Adapter name="HelloWorld">
    <Receiver name="HelloWorldReceiver">
        <ApiListener uriPattern="/hello" method="GET"/>
    </Receiver>
    <Pipeline>
        <FixedResultPipe name="sayHello" returnString="Hello, World!"/>
    </Pipeline>
</Adapter>
```

This creates an HTTP endpoint at `/api/hello` that responds with "Hello, World!". See the [`FixedResultPipe` reference](https://reference.frankframework.org/#/components/FixedResultPipe) for all available attributes.

## Choose Your Setup

Get Frank!Framework running in minutes using one of these approaches:

- **[Docker](docker/running-with-docker-compose.md)** — Run a pre-built image with Docker Compose. Recommended for most users.
- **[Java (from source)](java/building.md)** — Build and run from source using Maven. For contributors or advanced customization.

## What's Next

Once you have the framework running, head to [Further Reading](further-reading.md) for links to configuration guides, deployment options, testing tools, and more.
