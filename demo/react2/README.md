### React Demo #2

#### Setup

There is no set up involved with this demo. Simply load a TIBET development
environment, open the Sherpa and enter the following into the TIBET Developer
Console command line:

```
~lib_demo/react2/ReactDemo2.xhtml .> TP.sys.uiwin()
```

This uses the TIBET shell to redirect the contents of the XHTML file pointed to
by the virtual URI into the object returned by `TP.sys.uiwin()` (which happens
to be an instance of `TP.core.Window`).

#### What is being demonstrated

In this markup file, you'll see a single custom tag, `<demo:reactgreeting/>`.
This is an instance of the custom tag type, `TP.demo.reactgreeting`, which is
defined in `TP.demo.reactgreeting.js`. It is really important to see that we've
given our element an `id` here - this will be considered the React 'root' and is
needed for the JSX component definition.

This type, a subtype of `TP.tag.CustomTag` that mixes in the
`TP.dom.ReactElement` trait type (you can read more about TIBET type traits in
the core documentation), has some interesting constructs worth discussing:

- It defines two 'type local' attributes that tell TIBET that this component
doesn't have either core style or theme style files associated with it. This
tells TIBET to not bother trying to fetch these files during development.

- It has an instance-level method, `getComponentClassName` that returns a String
that tells TIBET the name of the React component constructor Function to use to
construct the underlying React component.

- It has another instance-level method, `getComponentDefinitionLocation`, that
returns a String that tells TIBET where to find the underlying component
definition, typically a JSX file. This is different than the component script
location given at the type level for other types of React components (and
omitted here because its unnecessary). Those files *describe* the component
class but leave it up to the machinery to instantiate Element instances of them.
By supplying a component definition, both the *description* and *instantiation*
of the element are given in the React Javascript file.

- It also contains examples of the 3 TIBET methods that show how the ReactJS
'component lifecycle' methods can be hooked in the TIBET code simply by
providing a method override. For now, those methods simply 'call up' their
supertype chain. When bridging TIBET with your own ReactJS code, you should
always call up to the common TIBET supertype.

The ReactJS file, `react_greeting.jsx`, defines a simple, class-based, ReactJS
component that has trival `console.log` messages so that you can see that, even
TIBET hooks React lifecycle methods to do some of its work, the various
lifecycle methods in the React component itself are still invoked as you would
expect.

You'll see that this is also a JSX file. TIBET will bring in and use the Babel
standalone compiler to dynamically transform this content before inserting it
into the page. Using the standard browsing mechanism in the Sherpa to navigate
to an instance of this component will allow you to change the JSX definition on
the fly, test it and save it. One important thing to note here is that the JSX
component is looking for an element with an id of `root` in it, which is why we
have to put an id of `root` on our custom tag. Obviously, they must match! :-)

