# Webcontent (Frontend Serving)

The Frank!Framework can serve static web content (HTML, CSS, JavaScript) directly from a configuration. This allows building custom frontends that interact with Frank adapters via API calls.

## Directory Convention

Place static files in a `webcontent/` directory within the configuration:

```
src/main/configurations/MyConfig/
├── Configuration.xml
├── webcontent/
│   ├── index.html
│   ├── style.css
│   └── app.js
```

## URL Pattern

Files in `webcontent/` are served at:

```
https://<host>/webcontent/<configuration-name>/<path>
```

For example, if the configuration is named `MyConfig`:

| File path | Served at URL |
|-----------|---------------|
| `webcontent/index.html` | `/webcontent/MyConfig/index.html` |
| `webcontent/css/style.css` | `/webcontent/MyConfig/css/style.css` |
| `webcontent/js/app.js` | `/webcontent/MyConfig/js/app.js` |

## Welcome File

`index.html` is the default welcome file. Navigating to `/webcontent/MyConfig/` serves `webcontent/index.html` automatically.

## The `<base>` Tag

For multi-file frontends with relative paths (CSS, JavaScript, images), set the `<base>` tag in `index.html` to ensure relative URLs resolve correctly:

```html
<!DOCTYPE html>
<html>
<head>
    <base href="/webcontent/MyConfig/">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <script src="app.js"></script>
</body>
</html>
```

Without the `<base>` tag, relative paths may resolve against the browser's address bar rather than the webcontent directory.

## Angular Applications

For Angular single-page applications, set `baseHref` in `angular.json` to match the webcontent URL:

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "baseHref": "/webcontent/MyConfig/",
            "outputPath": "../frank/src/main/configurations/MyConfig/webcontent"
          }
        }
      }
    }
  }
}
```

This ensures:

- Angular router generates correct URLs
- Static assets (images, fonts) load from the correct path
- The `ng build` output goes directly into the Frank configuration's webcontent folder

## ClassLoader Compatibility

Webcontent serving works regardless of the `classLoaderType` configured for the configuration. Whether the configuration is loaded from the filesystem, the database, or a classpath JAR, the `webcontent/` directory is served to the browser.

## Security

The `/webcontent` URL is protected by default — access requires an authenticated user with any role. To restrict access to specific roles, configure:

```properties
servlet.WebContentServlet.securityRoles=IbisObserver
```

For public (unauthenticated) access in LOC stage, no additional configuration is needed since LOC stage disables authentication by default.

## Calling Frank Adapters from the Frontend

A typical pattern is to expose adapter endpoints via `<ApiListener>` and call them from the frontend JavaScript:

```javascript
// Example: calling a Frank adapter from webcontent
fetch('/api/my-endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'value' })
})
.then(response => response.json())
.then(data => console.log(data));
```

The API endpoint and webcontent are served from the same origin, so no CORS configuration is needed.
