---
sidebar_position: 6
---

# Handling Large Messages

## Memory Threshold

The property `message.max.memory.size` controls when messages are offloaded to disk:

```properties
message.max.memory.size=5242880
```

Default: 5 MB (5,242,880 bytes). Messages below this threshold are stored in memory; messages above are written to disk during processing.

For high-volume applications with smaller messages, increasing to 30 MB may improve performance by reducing disk I/O:

```properties
message.max.memory.size=31457280
```

Disk-stored messages are written to `${java.io.tmpdir}/${instance.name}/temp-messages/` and cleaned up automatically.

> **Warning:** Insufficient disk space causes exceptions or warnings.

## Memory vs Disk Storage

The framework writes messages to disk only when necessary — specifically when a message may be read multiple times and does not already reference disk storage. This improves memory management for large messages at the cost of additional disk I/O.

## XSLT Streaming

The Frank!Framework streams messages through pipelines by default, holding only currently-processed bytes in memory.

| XSLT Version | Processor | Streaming Support |
|---|---|---|
| 1.0 (`xsltVersion=1`) | Xalan | ✅ Full streaming |
| 2.0 (`xsltVersion=2`) | Saxon (free) | ❌ Entire message loaded in memory |
| 3.0 (`xsltVersion=3`) | Saxon (free) | ❌ Entire message loaded in memory |

For large messages, use `xsltVersion=1` to avoid out-of-memory exceptions. The trade-off is reduced XSLT feature richness.

This limitation applies equally to XPath expressions, which use XSLT processing internally.

## ForEachChildElementPipe Streaming

[`ForEachChildElementPipe`](https://reference.frankframework.org/#/Components/Pipes/ForEachChildElementPipe) defaults to Xalan (`xsltVersion=1`) rather than Saxon. This exception exists because `ForEachChildElementPipe` is designed to iterate over large messages and requires streaming support.

Most other pipes and senders default to Saxon (XSLT 2.0+).

## Streaming Best Practices

- Use `xsltVersion=1` (Xalan) for pipelines processing large messages
- Streaming works best when the pipeline consists of pipes that all support streaming end-to-end
- Certain pipe combinations may break the streaming chain, causing intermediate materialization of the full message
- Monitor `${java.io.tmpdir}` disk usage in production
