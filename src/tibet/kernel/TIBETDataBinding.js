//  ============================================================================
/*
NAME:   TIBETDataBinding.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ============================================================================

/*
General-purpose support for data binding.

//  ---
//  Overview
//  ---

A core design goal for TIBET has always been to support existing or emerging web
standards whenever possible. With respect to data binding that's been a
challenge. First of all, there really aren't any open standards for general
purpose data binding. The one data binding model that is part of a W3
specification, the model found in XForms, is XML-specific and not well suited to
the level of functionality required by AJAX-style applications.

We wanted our binding model to:

    - avoid "page centric" rules for defining model data/binds,
    - bind to non-XML data like JSON and native JS objects,
    - use non-XPath query syntaxes like CSS selector syntax,
    - bind to properties of an object other than its 'value',
    - provide for both bi-directional and one-way binds,
    - bind to non-UI elements/controls such as action tags,
    - support lazy/deferred initialization of bound elements,
    - minimize new constructs for TIBET developers to learn.

One of the key things that arises out of these requirements is that we have a
need for binding both within the JavaScript of the application and within the
markup. We call these "Object binds" and "Markup binds" respectively in the
discussions which follow.

//  ---
//  Object Binds
//  ---

As it turns out, binds at the Object level are straightforward in TIBET.

In TIBET, all objects are capable of signaling "Change" events when their values
change. This feature extends to native types like Arrays provided you're using
atPut() and the other methods TIBET provides.

Change events provide the foundation for data binding at an object level.

Using notifications, a simple bind can be expressed as a Change observation. For
example, assuming some sourceObject whose property changes you want to observe
and some targetObject you want to keep updated, you might say:

    TP.observe(
        sourceObject,
        'TP.sig.Change',
        function(aSignal) {

            //  Use getAspect to determine what property changed.
            var aspect = aSignal.getAspect();

            //  Update target's version of that aspect value.
            targetObject.set(aspect, sourceObject.get(aspect));
        });

Since this example observes Change, a fairly large-grained signal, the handler
will be invoked any time the sourceObject changes any property.

If you were concerned with a particular aspect of the sourceObject you might
adjust the name of the signal you observe to trigger your bind handler only when
that aspect of the source changes:

    TP.observe(
        sourceObject,
        'SalaryChange',
        function(aSignal) {

            targetObject.set('salary', sourceObject.get('salary'));
        });

The prior observation works because TIBET's change signaling computes a signal
name from the aspect and signals [aspect]Change as well as Change. By observing
only the [aspect]Change signal you keep overhead to a minimum and avoid having
to test the aspect with each Change signal.

TIBET's Change signal hierarchy provides getTarget(), getAspect(), and
getAction() convenience methods. These help you access the originating object,
the property name that changed, and the type of action. Action in this case is
often 'add', 'update', 'delete', or a similar "crud" term. A getValue() method
provides you with the newly changed value.

Even with convenience methods however, setting up observations of this form for
every binding can become tedious. To avoid a lot of boilerplate code TIBET
provides binding functions with syntax much like attribute/method declarations
to help you define common bindings.

    //  Bind a type attribute to some data source.
    SomeBoundType.Type.defineBinding(attributeName, resource_spec);

    //  Bind an instance attribute to a data source.
    SomeBoundType.Inst.defineBinding(attributeName, resource_spec);

It's important to note that since both type and instance attributes follow the
standard prototype lookup scenario all subtypes/instances which don't set a
specific value will reflect the bound value. If any subtype or instance were to
call a set() method on the target aspect that local value would mask any value
being updated by the bind [the prototype value].

At present there is no support for avoiding the potential for individual
subtypes or instances to be "disconnected" from the binding by virtue of
JavaScript's copy-on-write behavior. This may be addressed once we fully
support private attributes since support for a 'bound attribute' would leverage
the same encapsulation model. In the interim, the best way to conceptualize Type
and Inst bindings is as binding the default value only.

While powerful, type and instance binds aren't particularly common. The most
common case is binding a single instance to a source value. In TIBET this is
done via the addLocalBinding() method.

    //  Bind a specific object property to a data source.
    someObject.addLocalBinding(attributeName, resource_spec);

The addLocalBinding method is simple syntactic sugar for constructing one of the
TP.observe() calls shown earlier. In this case the generated method is:

    TP.observe(
        resource_spec,
        attributeName + 'Change',
        function(aSignal) {

            someObject.set(attributeName, aSignal.getValue());
        });

//  ---
//  "Virtual" Resources
//  ---

Once you start using binds you realize pretty quickly that there are a number of
common cases where you want to bind to "virtual" objects. These virtual objects
are often temporal in nature like the "current selection" or "current employee".
If you were to bind to the actual object in these cases you'd never be notified
when that object was no longer "current" since it's not the object itself which
is changing, its the "value holder" [to use a Smalltalk term] which is taking on
a new value.

One way to work around these issues is to observe a manager object of some type.
For example, you might observe a SelectionManager object for an event like
SelectionChange. That approach works in cases where you don't mind having a new
object type, but it can add to the development burden.

The classical approach for virtual sources is binding to a "value holder", an
object which provides a single reference while allowing its content to change.
This strategy also works when trying to bind to a non-mutable value like a
String, Number, or Boolean which can't signal Change itself. The advantage to
this approach is that you can reuse a common object type to solve an entire
class of observation and binding problems.

Even value holders have their limitations however. You still need a concrete
object reference to bind to and that can mean creating dependencies that add
complexity to your code.

TIBET offers a different way to observe virtual sources that doesn't rely on
concrete object references. Instead it relies on well-known origin IDs.

Since signaling in TIBET uses string IDs you can observe objects which don't
exist as long as you know what ID they will use when signaling. As a result you
can observe a hypothetical 'CurrentEmployee' by using that key provided that
your application signals changes to the current employee object reference using
'CurrentEmployee' as the origin. For example:

    TP.observe(
        'CurrentEmployee',
        'TP.sig.Change',
        function(aSignal) {

            TP.byId('salaryField').set(
                    'value',
                    aSignal.get('target').get('salary'));
        });

Using this approach you don't actually have to concern yourself with whether the
concrete object was a SelectionManager or a ValueHolder or the Employee type or
any other concrete type. All that's relevant is that your code has agreed to use
the ID 'CurrentEmployee' as the common ID for that resource.

Understanding and leveraging Change signals is the key to object bindings.

With or without the use of TIBET's convenience methods you can create handlers
for Change notifications that ensure the values you want to synchronize are kept
consistent.

//  ---
//  Markup Binds
//  ---

Even though we've made JavaScript binding easy to do, binding objects at the
JavaScript level isn't something we encourage. The reason is simple -- we think
you should be writing markup most of the time, not JavaScript.

Our goal for TIBET has always been to invert the authoring load so that instead
of authoring applications in 90% code and 10% markup you do 90% of your work in
markup and augment that with 10% code. This new balance implies that the
majority of binding should happen in markup, not JS.

As it turns out, the TIBET shell (TSH) already has to deal with connecting data
between markup elements. That's what a TSH pipe does. With that in mind we took
a closer look at how to define markup-level bindings in a way that is compatible
with the TSH and the rest of the TIBET tag processing system. What we found was
that we could blend the two so you end up with a single, comprehensive way of
defining how data should move through your tags.

//  ---
//  Standard I/O and Binding
//  ---

Taking the concept of standard I/O ('STDIO') and applying it to the concept of
data binding might seem a little strange at first. The thing to keep in mind is
that, to TIBET at least, markup is simply source code for the shell.

If you were to look at the parsed source markup for a TSH script you'd see that
initially each element in a pipe contains a tsh:pipe attribute whose content is
the symbol you used at that location in the pipe.

For example, a simple pipe like: 1 + 2 .| alert($_) initially becomes:

    <tsh:cmd pipe=".|">1 + 2</tsh:cmd><tsh:cmd>alert($_)</tsh:cmd>

The pipe attribute in this specific case tells the runtime machinery that the
first command, the 1 + 2, should write to standard output or "stdout". During
execution similar information is conveyed to the alert() command informing it
that it should read from standard input or "stdin".

In essence, the various pipe symbols act as shorthand for telling the shell how
data between the various sources, commands, and sinks should flow.

While data flow in a pipe isn't precisely the same as data binding there's an
interesting opportunity for overlap here.

Tags in TIBET know how to read stdin when they execute - it's necessary for them
to function in pipes. If we map an object's bound resource_spec to be its stdin
provider we've effectively unified binding with STDIO concepts.

As an example, think about the <html:input type="text"/> tag. When that tag is
run its tshExecute method is invoked. Most html-prefixed elements respond to
that method by checking for input parameters, which includes checking for STDIN.
The input they read during that stage is then used as their 'value'. This is
precisely what you'd want for model-to-view data binding.

For example, we might bind an input text field using the following:

    <html:input type="text" tsh:in="resource_spec"/>

In the previous example we've added a simple attribute saying that this input
tag should read STDIN from resource_spec. If we combine logic to read data
based on the tsh:in attribute with logic to observe resource_spec for Change
notifications we've effectively bound our input tag to resource_spec. All that's
necessary is for our Change handler to trigger a "refresh" which includes
reading from the input data source and updating as needed.

That's fine for a one-way bind. What about two-way binds? It turns out that
using a STDIO model gives us those and more.

If you're familiar with UNIX Shells you probably recall that there are three
standard components in the "STDIO" model: stdin, stdout, and stderr. Mapping
those to attributes as we did with stdin (tsh:in) gives us three channels
through which we can route data.

Imagine:

    <html:input type="text"
        tsh:in="resource_spec"
        tsh:out="resource_spec"
        tsh:err="#errorDiv"/>

In this case we've not only created a two-way binding but we've said that any
errors which might occur while processing STDIO should be sent to the element
whose ID is errorDiv.

For brevity we can shorten that syntax to:

    <html:input type="text"
        tsh:io="resource_spec"
        tsh:err="#errorDiv"/>

Here we've used an attribute reference for 'stdio' of tsh:io rather than stdin
or stdout. This sugared attribute name is shorthand for assigning stdin and
stdout to the same resource.

Since we're using simple markup attributes there's no limitation on the element
types we can apply a binding to. Any markup element can contain one or more
stdio attributes.

As it turns out UI elements typically serve as data sources or data sinks. In
other words, they act as the final output target when used as a pure "sink" and
as an input "source" when bound at the start of a sequence. You can do much more
when you add bindings for "action tags" into the mix.

Action tags are tags whose primary purpose is to perform some type of processing
rather than presenting some type of visual output. When you mix action tags with
UI controls you literally "script your page" in shell terms.

For example, you might start a "pipe" from a UI control and run it through a set
of action tags to validate it, reformat it for storage, and then send it to a
server. Error output can similarly be directed via the same mechanisms. Or, you
might bind the output of a server call tag to a set of actions which receive the
data, reformat it, and then pipe it to an html:table.

At this point you're not binding using limited bidirectional "silos" of data,
you're truly scripting your page in the Unix sense of a shell script.

So how do you define stdin, stdout, and stderr resource_spec values for your
tags? You make use of another central object in TIBET development -- a URI.

//  ---
//  Resource References
//  ---

URIs are the focal point for much of TIBET development and data management.
Almost everything in TIBET has a URI (implicit or explicit) which can be used
to reference that object. This applies to remote data on a server, local data
in the file system, data in the browser-hosted database, and JavaScript objects
within your application.

A common feature of all TIBET URI types is that they are not simple strings with
parsing logic. They are data containers with caching logic all their own. As a
result you can observe a URI instance for Change and be notified when the object
that URI references is updated (within certain constraints). URI instances are
effectively TIBET's most common form of "value holder".

For server communication TIBET supports standard http: and https: URI formats
for accessing remote data using any of those protocols. A TIBET extension, the
xmpp: scheme, allows you to reference data on a remote XMPP server (the same
base protocol underlying Google Talk). An additional extension, the jsonp:
scheme, tells TIBET you're referencing data using the JSONP protocol (as opposed
to sending/receiving JSON via HTTP(S) or another protocol).

For local (offline) storage you can use file: URIs to access data on the local
file system (subject to browser-specific security considerations). You can also
use a localdb: URI, a TIBET-specific extension, to read and write data to and
from any HTML5-compliant browser database.

The often-overlooked urn: (Universal Resource Name) format is leveraged by TIBET
to allow you to register any object in your application under a public name that
TIBET can locate on request. TIBET types are accessible in this fashion
automatically, as are a few other common objects within TIBET. For example, you
can access the TP.core.URI type via urn:tibet:TP.core.URI. Leveraging URN
instances for 'value holders' is extrememly common in TIBET.

A final extension to URIs are "virtual URIs" - URIs whose concrete path is
resolved at runtime based on the current application's environment and
configuration parameters. While all TIBET URIs undergo a routing and rewriting
process, virtual URIs add even more flexibility.

A common use of virtual URIs is to avoid defining whether a resource is local or
remote. Instead TIBET will resolve the "root" of the URI on demand. A leading ~
(with no scheme) is a form of convenient shorthand. For example, ~app/...
and ~lib/... represent your application's root directory and the TIBET library
"root" your application is using respectively. By using a virtual URI you can
develop code without tying it to a specific location, or even a specific
protocol (http: vs. localdb: for example).

The following are all valid TIBET resource references:

    //  RSS on a remote server...
    http://www.teamtibet.com/tibet/TeamTIBET.rss

    //  XML in the local file system.
    file:///usr/local/src/TIBET/cfg/tibet_kernel.xml

    //  JavaScript source code wherever the application stores config data.
    ~app_cfg/development.js

    //  A JavaScript object in the browser.
    urn:tibet:TP

So far we've talked about what the W3C specifications would refer to as the
"primary resource", the portion of a URI before the fragment identifier (#).
TIBET URIs all support secondary resource references using standards including
xpointer() and element(), or extended resource query schemes.

The following are all valid TIBET fragment references:

    //  within the current ${UICANVAS} (the active window)
    #an_element_id              //  also known as an 'XPointer barename'
    #element(/1/1/3)            //  the 3rd child of the 1st child of the root
    #element(an_element_id/3)   //  the 3rd child of the element with that ID
    #xpointer(//*[@foo])        //  all elements with a foo attribute
    #css(.foo)                  //  all elements with a foo class
    #tibet(path)                //  invoke get()/set() on the resource with
                                //  'path'

Additional variations are possible, the full scope of TIBET URI syntax is too
broad to cover here. Suffice it to say that by combining the right primary
resource reference with the right secondary resource reference you can reach any
object likely to be useful to your application.

//  ---
//  Aspect References
//  ---

The previous paragraph needs a little extra discussion before the full import of
TIBET URIs becomes clear, particularly as they relate to data binding and the
TIBET shell.

According to the URI specification the fragment portion of a URI is _not_ part
of the server-side resource resolution process. Instead, the fragment is a form
of client-side indirect referencing which is processed after the server has
resolved the resource reference in front of the fragment. If you think about the
typical use, as an "anchor reference" in an HTML document, you'll see this is
true. The server returns the entire page to the client, then your browser
navigates you to the anchor. This is in contrast to having the server return
just the subset of the DOM referenced by the ID you've provided.
(See http://labs.apache.org/webarch/uri/rfc/rfc3986.html#fragment for more
 information.)

The implication of the previous paragraph is that when you construct a URI in
TIBET you're really telling the system two things: what "primary" data resource
to use, and what fragment or "aspect" of that data source. As it turns out this
is precisely what's needed to define useful data bindings which can go beyond
simple references to an object's "value" property and express bindings to other
properties or attributes of the resource.

URI data access in TIBET is broken down precisely along these lines, with all
handling of asynchronous logic provided for you. When you ask for data from a
URI that data is acquired by first accessing the primary resource (which may be
shared across multiple URIs) and then accessing the individual subset of the
data referenced by the specific URIs fragment. The final data access process
here is performed by the get() method of the primary resource so that different
fragment processing can be highly specialized by resource.

To bind data to a STDIO channel you simply provide the URI necessary to point to
the data you need to reference.

//  ---
//  Binding Attributes
//  ---

TIBET's functional attributes for binding are tsh:in, tsh:out, and tsh:err.
An optional tsh:io attribute sugars authoring for bi-directional binds
where a repetitive tsh:in and tsh:out pair would otherwise be required. An
additional sugar is the use of a tsh:base attribute which provides a way to
define partial URI paths so that leaf elements can use scoped relative URIs.
Think of the tsh:base attribute as xml:base for data bindings.

To make things concrete let's look at some sample markup which provides a
master/detail display of TIBET's current VCard data from vcards.xml.

<html>
<head>

    <!-- define a data source to load once the document is ready. NOTE
    that this is bound only to output, it's a one-way bind which is
    used to define a common URN for the VCard data. -->
    <tsh:uri href="~app_dat/vcards.xml" out="urn:tibet:VCARDS"
        ev:event="TP.sig.DOMContentLoaded" ev:target="#document"/>

    <!-- define a data source that has a parameterized query -->
    <tsh:uri href="jsonp://ajax.googleapis.com/ajax/services/search/web?v=1.0&amp;q=${queryInput}" ev:event="TP.sig.DOMClick" ev:observer="query_button">
        <tsh:param name="queryInput" in="#query_field"/>
    </tsh:uri>

    <!-- define some inline JavaScript object data we'll bind to below.
    Note how we're now using inline content, using the tsh:data tag -->
    <tsh:data out="urn:tibet:HASH" ev:event="TP.sig.DOMContentLoaded"
        ev:target="#document">
        <![CDATA[
            TP.hc('title', 'Available VCard Data');
        ]]>
    </tsh:data>

    <!-- define an error handing script we'll reference below. NOTE
    that since this is invoked via tsh:err processing we don't need to
    bind it, it will receive the error output as stdin automatically. -->
    <ev:script type="text/javascript" id="onerror">
    <![CDATA[
        alert('There was an error: ' + $_);
    ]]>
    </ev:script>

</head>

<!-- reference our error script for document-wide error handling -->
<body tsh:err="#onerror">

    <!-- display a demo header bound to the current application user.
    Note the ${} syntax for the variable name here is required. We are
    asking the resource urn:tibet:TSH (the TSH Type) for ${EFF_USER},
    the value of the "effective" (vs. the real) user at the moment -->
    <hello:world tsh:in="urn:tibet:TSH#${EFF_USER}" />

    <!-- define a template to generate our master table of VCard data.
    NOTE that this is bound only on input, it's a readonly table, but
    it will respond to notification of state changes in the vCard data -->
    <tsh:transform id="vcard_table" in="urn:tibet:VCARDS">

        <!-- define the template for the overall table structure -->
        <tsh:template tsh:root="true">
            <table>
            <!-- typically we use interpolation but binds also work, they
            don't resolve until the content is "awakened" however. NOTE
            this binding is to simple JS data declared in the page HEAD. -->
            <thead tsh:in="urn:tibet:HASH#title"></thead>
            <tbody>
                ${item .|* vcard_row}   <!-- interpolate via row template -->
            </tbody>
            </table>
        <tsh/template>

        <!-- define the template for a row, matching reference above -->
        <tsh:template tsh:name="vcard_row">
            <tr>
                <td>${FN}</td>
                <td>${ROLE}</td>
                <td>${ORG/ORGNAME}</td>
                <td>${ORG/ORGUNIT}</td>
            </tr>
        <tsh/template>
    <tsh/transform>

    <!-- define a static set of scoped detail fields driven from master -->
    <fieldset name="detail" tsh:base="urn:tibet:TSH#${CURRENT_RECORD}">
        <input type="text" id="name" tsh:io="FN"/>
        <input type="text" id="role" tsh:io="ROLE"/>

        <!-- define a nested group of scoped fields for org data -->
        <fieldset name="org_detail" tsh:base="ORG">
            <input type="text" id="org_name" tsh:io="ORGNAME"/>
            <input type="text" id="org_unit" tsh:io="ORGUNIT"/>
        </fieldset>
    </fieldset>

    <!-- another in-page script, this time using TIBET Shell source. NOTE
    the use of tsh:err="" to turn off "inheritance" of the onerror action.
    -->
    <ev:script tsh:err="">
    <![CDATA[
    $_ .| blah blah .| blah .> fooelem
    ]]>
    </ev:script>

</body>
</html>

Our sample markup demonstrates some of the power and flexibility of the
TIBET binding model. We've done input and output binds as well as binding
stderr and allowing the DOM structure to drive inheritance of that
error-handler binding. We've also used "scoped" bindings via the tsh:base
attribute. In short, we've built a simple master/detail page without writing
a single line of JavaScript.

//  ---
//  Model Item Properties
//  ---

The W3C XForms standard is the only open standard which defines how to do XML
data binding. Unfortunately, as mentioned earlier, that specification didn't
go far enough to support the full scope of binding required by today's
applications. At the same time, XForms does provide a good reference for some
of the base requirements of binds. Which leads us to the concept of "model
item properties."

In XForms the readonly, required, relevant, and constraint attributes on a
model element define rules regarding the state of that data. These attributes
are collectively referred to in XForms as "model item properties".

An additional XForms 'calculate' attribute defines what is, in effect, an
action taken when the result of that attribute's XPath expression changes.
When a relevant data change occurs for a calculate attribute a new value is
computed by executing the calculate expression and the result updates the
target of the bind.

It's not hard to see how the pattern used for the calculate attribute might
be useful in other contexts. In fact, if you were to use any of the
attributes for readonly, required, relevant, or valid as targets for the
bind you could replace those custom attribute behaviors with a single
"compute" action. That's precisely how TIBET manages XForms' model item
property attributes -- as <tsh:compute/> actions with bindings.

For example:

    ...here's an action to set relevancy based on an xpath...
    <tsh:compute base="urn:tibet:CURRENT_EMPLOYEE"
        in="./us_citizen"
        out="#ssn@relevant" />

By providing a way to execute a computation (subject to the processing
capabilities of XPath or TSH) and target anything within the DOM with the
output TIBET lets you adjust your page in almost any form necessary.
*/

//  ========================================================================
//  OBJECT BINDING
//  ========================================================================

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('Inst.defineBinding',
function(attributeName, resourceURI) {

    /**
     * @name Inst.defineBinding
     * @synopsis Adds a binding to the instance prototype of the receiver.
     * @param {String} attributeName The attribute name to bind.
     * @param {Object} resourceOrURI The resource specification.
     * @returns {Object} The receiver.
     * @todo
     */

    var proto;

    proto = this.getInstPrototype();
    if (!TP.canInvoke(proto, 'addLocalBinding')) {
        return this.raise('TP.sig.InvalidBinding', arguments);
    }

    return proto.addLocalBinding(attributeName, resourceURI);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('Type.defineBinding',
function(attributeName, resourceURI) {

    /**
     * @name Type.defineBinding
     * @synopsis Adds a binding to the type prototype of the receiver.
     * @param {String} attributeName The attribute name to bind.
     * @param {Object} resourceOrURI The resource specification.
     * @returns {Object} The receiver.
     * @todo
     */

    var proto;

    proto = this.getPrototype();
    if (!TP.canInvoke(proto, 'addLocalBinding')) {
        return this.raise('TP.sig.InvalidBinding', arguments);
    }

    return proto.addLocalBinding(attributeName, resourceURI);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addLocalBinding',
function(attributeName, resourceOrURI) {

    /**
     * @name addLocalBinding
     * @synopsis Adds a binding to the receiver itself.
     * @param {String} attributeName The attribute name to bind.
     * @param {Object} resourceOrURI The resource specification.
     * @returns {Object} The receiver.
     * @todo
     */

    var thisref,
        resource;

    if (TP.isEmpty(attributeName)) {
        return this.raise('TP.sig.InvalidParameter', arguments,
            'No attribute name provided for bind.');
    }

    //  Prefer URIs but can bind to any object in theory.
    resource = TP.ifInvalid(TP.uc(resourceOrURI), resourceOrURI);
    if (TP.notValid(resource)) {
        return this.raise('TP.sig.InvalidResource', arguments,
            'No resource spec provided for bind.');
    }

    //  TODO:   register the objects involved in binds under a common root
    //  urn:tibet:BINDINGS object and look them up there rather than holding
    //  hard object references in the closure below.
    thisref = this;

    //  Do the observation, focusing on the specific aspect being changed as
    //  part of the signal we'll observe.
    TP.observe(
        resource,
        attributeName.asTitleCase() + 'Change',
        function(aSignal) {

            TP.debug('break.bind_change');
            try {
                //  TODO: lookup the bind target by URN, not thisref.

                //  The getValue call for Change subtypes will do its best
                //  to get us a viable value from the signal origin.
                thisref.set(attributeName, aSignal.getValue());
            } catch (e) {
                thisref.raise('TP.sig.InvalidBinding', arguments);
            }
        });
});

//  ========================================================================
//  MARKUP BINDING
//  ========================================================================

//  ------------------------------------------------------------------------
//  TP.core.DocumentNode
//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('refresh',
function(aSignal) {

    /**
     * @name refresh
     * @synopsis Updates the receiver's content by refreshing all bound elements
     *     in the document. For an HTML document this will refresh content under
     *     the body, while in an XML document all elements including the
     *     documentElement are refreshed.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action. This signal should include a key of 'deep' and a value of
     *     true to cause a deep refresh that updates all nodes.
     * @todo
     */

    var node,
        body;

    TP.debug('break.bind_refresh');

    node = this.getNativeNode();

    if (TP.isHTMLDocument(node) || TP.isXHTMLDocument(node)) {
        if (TP.isElement(body = TP.documentGetBody(node))) {
            return TP.tpnode(body).refresh(aSignal);
        }
    } else {
        return TP.tpnode(node.documentElement).refresh(aSignal);
    }
});

//  ------------------------------------------------------------------------
//  TP.core.ElementNode
//  ------------------------------------------------------------------------

TP.core.ElementNode.Type.defineMethod('isBoundElement',
function(anElement, aDirection) {

    /**
     * @name isBoundElement
     * @synopsis Returns true if the element has a binding for the specified
     *     STDIO reference.
     * @param {Element} anElement A native element to test.
     * @param {Constant} aDirection TP.STDIN, TP.STDOUT, or TP.STDERR.
     * @returns {Boolean} True if the receiver has a binding relative to the
     *     particular STDIO reference given.
     * @todo
     */

    if (TP.notValid(anElement)) {
        this.raise('TP.sig.InvalidElement', arguments);
        return false;
    }

    //  TODO:   once expansion is ensured we can optimize these checks,
    //  probably just checking for single known attribute like tsh:bound.
    switch (aDirection) {
        case TP.STDIN:
            return TP.notEmpty(TP.elementGetAttribute(anElement, 'tsh:io')) ||
                TP.notEmpty(TP.elementGetAttribute(anElement, 'tsh:in'));
        case TP.STDOUT:
            return TP.notEmpty(TP.elementGetAttribute(anElement, 'tsh:io')) ||
                TP.notEmpty(TP.elementGetAttribute(anElement, 'tsh:out'));
        case TP.STDERR:
            return TP.notEmpty(TP.elementGetAttribute(anElement, 'tsh:err'));
        default:
            return false;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('isBoundBidi',
function() {

    /**
     * @name isBoundBidi
     * @synopsis Returns true if the receiver's bindings for input and output
     *     were expressed as a single bidirectional binding. This has
     *     implications for setBoundOutput which tests current value when the
     *     bind is bidirection to avoid setting a value that's already been set.
     * @returns {Boolean} True if tsh:io was non-empty.
     */

    return TP.notEmpty(this.getAttribute('tsh:io'));
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('isBoundElement',
function(aDirection) {

    /**
     * @name isBoundElement
     * @synopsis Returns true if the element has a binding for the specified
     *     STDIO reference.
     * @param {Constant} aDirection TP.STDIN, TP.STDOUT, or TP.STDERR.
     * @returns {Boolean} True if the receiver has a binding relative to the
     *     particular STDIO reference given.
     */

    return TP.core.ElementNode.isBoundElement(this.getNativeNode(), aDirection);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('isScalarValued',
function() {

    /**
     * @name isScalarValued
     * @synopsis Returns true if the receiver binds to scalar values.
     * @description Most 'field-level' UI controls bind to scalar values, but
     *     action tags and certain more complex UI elements can bind to nodes or
     *     nodelists. When you combine isScalarValued() with isSingleValued()
     *     you get a fairly broad range of options for what a control wants to
     *     consume.
     * @returns {Boolean} True when scalar valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('isSingleValued',
function() {

    /**
     * @name isSingleValued
     * @synopsis Returns true if the receiver binds to single values.
     * @returns {Boolean} True when single valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('refresh',
function(aSignal) {

    /**
     * @name refresh
     * @synopsis Updates the receiver to reflect the current value of any data
     *     binding it may have. If the signal argument's payload specifies a
     *     'deep' refresh then descendant elements are also updated.
     * @description For bound elements there are really two "values", the
     *     element's internal value such as its text value (what we call its
     *     "display" value) and the element's bound value which is the value
     *     found by evaluating its binding aspect against its source. This
     *     method is used to update the former from the latter, typically in
     *     response to a Change notification from the underlying bound content.
     *
     *     Also note that TIBET binding rules allow a bind to define a
     *     bind:target, the actual aspect which should be updated. For example,
     *     while XForms binds only allow updating a control's value from a
     *     binding, in TIBET you can update any attribute of the control that's
     *     available via set(). For this reason it's not strictly a question of
     *     setValue, it may be setStyle or some other aspect which is altered.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action. This signal should include a key of 'deep' and a value of
     *     true to cause a deep refresh that updates all nodes.
     * @returns {TP.core.ElementNode} The receiver.
     * @todo
     */

    var request;

    TP.debug('break.bind_refresh');

    //  signals coming into the refresh method should be requests already,
    //  but in case we didn't get one...
    request = TP.request(aSignal);
    request.atPutIfAbsent('refreshRoot', this);

    //  everything else that's bound refreshes itself unless its ID is
    //  listed on its binding as a bind:target. that logic, along with logic
    //  to default to the 'value' aspect is found in $refreshBoundAspect.
    if (this.isBoundElement(TP.STDIN)) {
        //  debugging mode, just log what we find/would do
        TP.ifTrace(TP.sys.cfg('log.bind_refresh')) ?
            TP.trace(TP.boot.$annotate(this, 'Refreshing bound element.'),
                TP.LOG, arguments) : 0;

        this.$refreshBoundAspect(request);
    }

    //  bound or not, some of our children may be, so we need to pass the
    //  message along to them
    if (TP.isTrue(request.at('deep'))) {
        this.$refreshBoundRoots(request);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$refreshBoundAspect',
function(aSignal) {

    /**
     * @name $refreshBoundAspect
     * @synopsis Elements with bindings can have an optional bind:set aspect on
     *     them which allows them to bind something other than their value
     *     aspect to a query result. This method handles refresh operations for
     *     standard elements, defaulting the aspect to value when no bind:set is
     *     found locally or as part of a binding's bind:target/bind:set pair.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action.
     * @todo
     */

    var aspect,
        value;

    //  TODO: not very useful...need to look elsewhere for an aspect?
    aspect = 'value';
    value = this.getBoundInput(aSignal);

    //  value is so common (and canonical) that we dispatch directly to it
    //  rather than risk confusion with a path
    if (aspect === 'value') {
        this.setValue(value);
    } else {
        this.set(aspect, value);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$refreshBoundRoots',
function(aSignal) {

    /**
     * @name $refreshBoundRoots
     * @synopsis Updates the receiver's bound descendant roots, but not the
     *     receiver itself. This method is normally called indirectly via
     *     refresh() when the refresh signal requested 'deep'.
     * @description This method uses an iteration model that tries to locate
     *     only the "topmost" descendant along each branch so that the traversal
     *     works top-down to help populate content caches during the refresh,
     *     never tries to refresh the same node more than once, and doesn't miss
     *     nodes that might be added as a result of processing related to the
     *     refresh itself.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action.
     * @todo
     */

    var node;

    //  don't bother if we're empty
    node = this.getNativeNode();
    if (node.childNodes.length === 0) {
        return this;
    }

    //  play a trick, attach the signal to the function so we can access it
    //  during iteration
    TP.core.ElementNode.$refreshElementEntered.$$signal = aSignal;

    //  traverse the tree breadth-first, which allows each node to
    //  awaken and potentially either skip its children or modify them
    //  before they are added to the iteration list
    TP.nodeBreadthTraversal(
                    node,
                    TP.core.ElementNode.$refreshElementEntered,
                    null,       //  no pop function
                    null,       //  no content (text nodes etc) function
                    false);     //  false to skip the element itself

    return;
});

//  ------------------------------------------------------------------------

// Direct assignment to support internal reference.
TP.core.ElementNode.$refreshElementEntered = function(anElement) {

    /**
     * @name $refreshElementEntered
     * @synopsis An "enter function" for TP.nodeBreadthTraversal used by the
     *     awakenElement() routine to awaken an individual element. The return
     *     value of this function is the return value from calling awaken()
     * @param {Element} anElement The element to awaken.
     */

    //  enter function. returning TP.CONTINUE will skip children

    if (TP.core.ElementNode.isBoundElement(anElement, 'tsh:in')) {
        try {
            TP.wrap(anElement).refresh(
                    TP.core.ElementNode.$refreshElementEntered.$$signal);
        } catch (e) {
        }

        return TP.CONTINUE;
    }

    return;
};

// Register it.
TP.core.ElementNode.Type.defineMethod(TP.core.ElementNode.$refreshElementEntered);

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$refreshBoundTargets',
function(aSignal) {

    /**
     * @name $refreshBoundTargets
     * @synopsis Bindings which contain bind:target definitions can update those
     *     targets directly in response to this method. Standard elements simply
     *     return.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action.
     * @todo
     */

    //  no-op for most element types. bindings override
    return;
});

//  ------------------------------------------------------------------------
//  TP.core.ActionElementNode
//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Inst.defineMethod('refresh',
function(aSignal) {

    /**
     * @name refresh
     * @synopsis Updates the receiver to reflect the current value of any data
     *     binding it may have. NOTE that even though this is an action tag it
     *     only activates in response to a refresh call when it's a bound
     *     element.
     * @description If an action tag is bound the presumption is that the
     *     binding provides input data the action should use as "standard input"
     *     and then send any result data to whatever bind target/set location
     *     may be designated (or whatever serves as the output vector).
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action. This signal should include a key of 'deep' and a value of
     *     true to cause a deep refresh that updates all nodes.
     * @todo
     */

    //  Note that this presumes that the action's result will only change
    //  when it's a bound element.
    if (this.isBoundElement()) {
        return this.act(aSignal);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.Type.defineMethod('getActionInput',
function(aRequest) {

    /**
     * @name getActionInput
     * @synopsis Returns either the element's bound content or the request's
     *     standard input (binds override stdin).
     * @synopsis Returns either the request's standard input or the receiver's
     *     'primary argument'.
     * @param {TP.sig.Request} aRequest The request to check for stdin.
     * @returns {Object} The input data.
     */

    var node,

        tpnode,
        input;

    if (!TP.isNode(node = aRequest.at('cmdNode'))) {
        return;
    }

    if (this.isBoundElement(node)) {
        tpnode = TP.wrap(node);
        input = tpnode.getBoundInput();
    } else if (TP.notEmpty(input = aRequest.stdin())) {
        //  stdin is always an array, so we can just return it
        return input;
    } else {
        input = this.getPrimaryArgument(aRequest);
    }

    if (TP.isValid(input)) {
        input = TP.ac(input);
    }

    return input;
});

//  ------------------------------------------------------------------------
//  TP.core.UIElementNode
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('$getBoundInputDefault',
function(aRequest) {

    /**
     * @name $getBoundInputDefault
     * @synopsis Returns the value this element considers to be a viable default
     *     when a binding doesn't resolve to a non-null value. This is typically
     *     the empty string so that text controls don't display undefined or
     *     some other inappropriate value.
     * @param {TP.sig.Request} aRequest The request containing command
     *     parameters.
     * @returns {Object} An appropriate default value. The type of this object
     *     may vary by control.
     * @todo
     */

    if (this.isScalarValued()) {
        return '';
    } else {
        return this.getNativeDocument().createTextNode('');
    }
});

//  ------------------------------------------------------------------------
//  "tsh-service" Signal Handlers
//  ------------------------------------------------------------------------

/*
The methods in this section provide support for the XControls service
"processing model" as it were. There are a number of discrete signals used
to notify potential event handlers that service activity is taking place.

Service signals fall into 3 basic categories: requesting, transmitting, and
responding. The requesting phase is where serialization of the data occurs
along with other pre-transmission processing. Transmission is the actual
process of sending the request. Note that since this can be synchronous or
asynchronous the signals in this phase can be very close together in time.
The responding phase is where "deserialization" and other post-result
processing occurs.  Note that each phase can encounter an error, and that
each error handler will ultimately ensure that the XForms compatibility
signals are fired.
*/

//  ------------------------------------------------------------------------

TP.core.URIHandler.Inst.defineMethod(
    'handletsh-service-request-construct',
function(aSignal) {

    /**
     * @name handletsh-service-request-construct
     * @synopsis Responds to notifications that the request data needs to be
     *     constructed (serialized) for transmission. Any handlers that needed
     *     to alter the data before this step have to be placed higher in the
     *     DOM or registered as capturing handlers.
     * @param {tsh-service-request-construct} aSignal The signal instance which
     *     triggered this handler.
     */

    var signal;

    //  do the work to get the body content ready for transmission
    this.serialize(aSignal);

    //  now we can signal the done event, providing the signal args as the
    //  payload so we keep the data moving through the pipeline
    signal = this.dispatch(
                'tsh-service-request-construct-done',
                this.getNativeNode(),
                aSignal.getPayload());

    //  direct invocation so we avoid the observe/ignore overhead for the
    //  service type itself and allow ourselves to be last in line
    this['handletsh-service-request-construct-done'](signal);

    return;
});

//  ------------------------------------------------------------------------

TP.core.URIHandler.Inst.defineMethod(
    'handletsh-service-request-construct-done',
function(aSignal) {

    /**
     * @name handletsh-service-request-construct-done
     * @synopsis Responds to notifications that the request is ready for
     *     transmission to the receiver's service.
     * @param {tsh-service-request-construct-done} aSignal The signal instance
     *     which triggered this handler.
     */

    //  NOTE that since this is potentially asynchronous we return
    //  immediately and rely on notification events to pick things back up
    return this.transmit(aSignal);
});

//  ------------------------------------------------------------------------

TP.core.URIHandler.Inst.defineMethod(
    'handletsh-service-response-construct',
function(aSignal) {

    /**
     * @name handletsh-service-response-construct
     * @synopsis Responds to notifications that the request is ready for
     *     transmission to the receiver's service.
     * @param {tsh-service-request-done} aSignal The signal instance which
     *     triggered this handler.
     */

    var signal;

    //  do the internal deserialization work, processing the data from the
    //  signal so it can be manipulated by the requestor
    this.deserialize(aSignal);

    //  now we can signal the done event, providing the signal args as the
    //  payload so we keep the data moving through the pipeline
    signal = this.dispatch(
                'tsh-service-response-construct-done',
                this.getNativeNode(),
                aSignal.getPayload());

    //  direct invocation so we avoid the observe/ignore overhead for the
    //  service type itself and allow ourselves to be last in line
    this['handletsh-service-response-construct-done'](signal);

    return;
});

//  ------------------------------------------------------------------------

TP.core.URIHandler.Inst.defineMethod(
    'handletsh-service-response-construct-done',
function(aSignal) {

    /**
     * @name handletsh-service-response-construct-done
     * @synopsis Responds to notifications that the request is ready for
     *     transmission to the receiver's service.
     * @param {tsh-service-request-done} aSignal The signal instance which
     *     triggered this handler.
     */

    var signal;

    //  notify the standard 'all done' message for observers
    signal = this.dispatch(
                'tsh-service-done',
                this.getNativeNode(),
                aSignal.getPayload());

    //  do any local processing of service-done last
    return this['handletsh-service-done'](signal);
});

//  ------------------------------------------------------------------------

TP.core.URIHandler.Inst.defineMethod(
    'handletsh-service-transmit-done',
function(aSignal) {

    /**
     * @name handletsh-service-transmit-done
     * @synopsis Responds to notifications that a call has completed.
     * @param {tsh-service-transmit-done} aSignal The signal instance which
     *     triggered this handler.
     */

    var signal;

    //  NOTE we dispatch the event used by XForms 1.1 to get things started
    //  so observers (listener registrations essentially) can be notified
    signal = this.dispatch(
                'tsh-service-deserialize',
                this.getNativeNode(),
                aSignal.getPayload());

    //  we don't observe that signal, it's for others only, we use the
    //  request/response construction signals to run the pipeline
    this['handletsh-service-deserialize'](signal);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
