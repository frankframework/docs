# Custom Views

Custom Views are links to other web pages that are added to the navigation in the sidebar of the FF! Console. A view can display a page inside the console (embedded) or open an external page in a new browser tab.

## Configure Custom Views

Define each view with a name and URL, then list its identifier in `customViews.names`:

```properties
customViews.example.name=Example App
customViews.example.url=https://example.com

customViews.reference.name=FF! Reference
customViews.reference.url=https://reference.frankframework.org

customViews.names=example,reference
```

The identifier (`example` or `reference`) connects the view's properties to the list. The `name` is shown in the console sidebar, and the `url` is the page opened by the view.

These properties are part of the application properties (appconstants). Set them in an application properties file or in a `StageSpecifics_<STAGE>.properties` file to configure views for a specific stage.

## Open a Custom View

Each view listed in `customViews.names` is added as a navigation option in the FF! Console sidebar. The URL determines how the page opens:

- A relative path (without a protocol) to a page in the web-content folder is embedded in the console in an iframe.
- A URL starting with `http://` or `https://` opens directly in a new browser tab.
