### React Demo #1

#### Setup

There is no set up involved with this demo. Simply load a TIBET development
environment, open the Sherpa and enter the following into the TIBET Developer
Console command line:

```
~lib_demo/react1/ReactDemo1.xhtml .> TP.sys.uiwin()
```

This uses the TIBET shell to redirect the contents of the XHTML file pointed to
by the virtual URI into the object returned by `TP.sys.uiwin()` (which happens
to be an instance of `TP.core.Window`).

#### What is being demonstrated

In this markup file, you'll see a single custom tag, `<demo:reactlikebutton/>`.
This is an instance of the custom tag type, `TP.demo.reactlikebutton`, which is
defined in `TP.demo.reactlikebutton.js`.

This type, a subtype of `TP.tag.CustomTag` that mixes in the
`TP.dom.ReactElement` trait type (you can read more about TIBET type traits in
the core documentation), has some interesting constructs worth discussing:

- It defines two 'type local' attributes that tell TIBET that this component
doesn't have either core style or theme style files associated with it. This
tells TIBET to not bother trying to fetch these files during development.

- It has a type-level method, `getComponentScriptLocations` that returns an
Array of paths to JavaScript files containing React code, 'like_button.js',
which located in the source directory that this file is in.

- It has an instance-level method, `getComponentClassName` that returns a String
that tells TIBET the name of the React component constructor Function to use to
construct the underlying React component.

- It also contains examples of the 3 TIBET methods that show how the ReactJS
'component lifecycle' methods can be hooked in the TIBET code simply by
providing a method override. For now, those methods simply 'call up' their
supertype chain. When bridging TIBET with your own ReactJS code, you should
always call up to the common TIBET supertype.

The ReactJS file, `like_button.js`, defines a simple, class-based, ReactJS
component that has trival `console.log` messages so that you can see that, even
TIBET hooks React lifecycle methods to do some of its work, the various
lifecycle methods in the React component itself are still invoked as you would
expect.
