---
sidebar_position: 7
---

# Frank!Flow (Graphical Editor)

Frank!Flow is a browser-based graphical editor for Frank configurations. It provides a drag-and-drop interface to build and edit adapter pipelines visually, as an alternative to writing XML directly.

## What Frank!Flow Does

- Displays the configuration as a flow diagram (pipes connected by forwards)
- Allows adding, removing, and rearranging pipes by dragging
- Generates valid configuration XML from the visual representation
- Reads existing XML configurations and renders them as diagrams

## Running Frank!Flow with Docker Compose

Frank!Flow runs as a separate container alongside the Frank!Framework. Add it to your `docker-compose.yml`:

```yaml
services:
  frank:
    image: frankframework/frank-framework:latest
    ports:
      - "8080:8080"
    volumes:
      - ./configurations:/opt/frank/configurations
    environment:
      - management.gateway.inbound.class=org.frankframework.management.gateway.HttpInboundGateway

  frank-flow:
    image: frankframework/frank-flow:latest
    ports:
      - "8081:8080"
    volumes:
      - ./configurations:/opt/frank/configurations
```

### Required Configuration

The `management.gateway.inbound.class` property must be set on the Frank!Framework container. This enables the HTTP management interface that Frank!Flow uses to communicate with the running framework.

### Shared Volume

Both containers must share the same configurations volume. Frank!Flow reads and writes configuration XML files directly. Changes made in Frank!Flow are immediately visible to the Frank!Framework after a configuration reload.

## Using Frank!Flow

1. Open `http://localhost:8081` in a browser
2. The left panel shows available configurations and their XML files
3. Select a configuration file to open it as a flow diagram
4. Use the canvas to:
   - **Add a pipe** — drag from the component palette onto the canvas
   - **Connect pipes** — drag from a forward exit to another pipe
   - **Edit properties** — click a pipe to open its property panel
   - **Delete** — select and press Delete
5. Changes are saved directly to the XML file on the shared volume
6. Reload the configuration in the Frank!Console to apply changes

## XML Compatibility

Frank!Flow generates standard Frank configuration XML. Configurations created in Frank!Flow can be edited as XML and vice versa.

Note: When using Frank!Flow, the `xsi:noNamespaceSchemaLocation` attribute on the `<Configuration>` root element is not required. Frank!Flow resolves element types through its own metadata. However, the attribute does not cause problems if present.

## Limitations

- Frank!Flow edits one configuration file at a time
- Complex XPath expressions in attributes are displayed as text (not visually interpreted)
- Module and include references are shown but not resolved visually
- Frank!Flow does not start/stop adapters — use the Frank!Console for runtime control
