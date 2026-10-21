# Custom Views

Custom Views add links to other pages in the sidebar of the Frank!Console. A view can display a page inside the console or open an external page in a new browser tab.

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

Each view listed in `customViews.names` is added as a navigation option in the Frank!Console sidebar. Selecting a view opens its page inside the console in an iframe, or opens it in a new browser tab if it is an external page.
