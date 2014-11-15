//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
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

Since this example observes TP.sig.Change, a fairly large-grained signal, the
handler will be invoked any time the sourceObject changes any property.

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
often TP.CREATE, TP.UPDATE, TP.DELETE, TP.INSERT, or a similar "crud" term. A
getValue() method provides you with the newly changed value.

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
done by using the defineBinding() method on the local object.

    //  Bind a specific object property to a data source.
    someObject.defineBinding(attributeName, resource_spec);

The defineBinding method on a local object is simple syntactic sugar for
constructing one of the TP.observe() calls shown earlier. In this case the
generated method is:

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

    //  within the current $UICANVAS (the active window)
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

TP.definePrimitive('defineBinding',
function(target, targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @name defineBinding
     * @synopsis Adds a binding to the supplied target object.
     * @param {Object} target The target object to define the binding on.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If not specified,
     *     this will default to 'value'.
     * @returns {Object} The target object.
     */

    var resource,
        sourceAttr,

        facetName,
        signalName,
        aspectKey,

        methodName,

        handler;

    if (TP.isEmpty(targetAttributeName)) {
        return this.raise('TP.sig.InvalidParameter',
            'No attribute name provided for bind.');
    }

    if (TP.isString(resourceOrURI)) {
        resource = TP.uc(TP.TIBET_URN_PREFIX + resourceOrURI);
    } else {
        resource = resourceOrURI;
    }

    //  Prefer URIs but can bind to any object in theory.
    if (TP.notValid(resource)) {
        return this.raise('TP.sig.InvalidResource',
            'No resource spec provided for bind.');
    }

    //  Get the source attribute. If there is no source attribute, then use the
    //  target attribute as the source attribute.
    if (TP.notValid(sourceAttr = sourceAttributeName)) {
        sourceAttr = targetAttributeName;
    }

    //  Get the source facet. If there is no source facet, then default it to
    //  'value'.
    if (TP.notValid(facetName = sourceFacetName)) {
        facetName = 'value';
    } else {
        facetName = facetName.toLowerCase();
    }

    //  Choose the correct subtype of TP.sig.FacetSignal to use, depending on
    //  facet.
    switch (facetName) {

        case 'readonly':
            signalName = 'TP.sig.ReadonlyChange';
            break;

        case 'relevant':
            signalName = 'TP.sig.RelevantChange';
            break;

        case 'required':
            signalName = 'TP.sig.RequiredChange';
            break;

        case 'valid':
            signalName = 'TP.sig.ValidChange';
            break;

        case 'value':
            signalName = 'TP.sig.ValueChange';
            break;
    }

    if (sourceAttr.isAccessPath()) {

        //  Do a 'get' to establish the interest in the path - we're not really
        //  interested in the value though. We don't do this if it's a URI,
        //  though, since the URI will do that automatically.
        if (!TP.isURI(resource)) {
            resource.get(sourceAttr);
        }
    } else {
        //  If the facet is 'value' as well, but the sourceAttr *isn't*, then we
        //  go ahead and set up for a spoofed <aspect>Change signal (if the
        //  sourceAttr is 'value' we'd rather have a signal name of
        //  'TP.sig.ValueChange' than 'ValueChange').
        if (facetName === 'value' && sourceAttr !== 'value') {
            signalName = sourceAttr.asStartUpper() + 'Change';
        }
    }

    //  The key into the aspect map is the global ID of the resource, the source
    //  attr name and the source facet name all joined together.
    aspectKey = TP.gid(resource) + TP.JOIN +
                TP.str(sourceAttr) + TP.JOIN +
                facetName;

    //  Make sure that target object has a local method to handle the change
    methodName = 'handle' + TP.escapeTypeName(signalName);

    if (TP.notValid(handler = target.getMethod(methodName))) {

        //  Define a handler function
        handler = function(aSignal) {

            var newVal,
                aspect,
                facet,

                mapKey,

                targetAttr;

            TP.stop('break.bind_change');

            try {
                newVal = aSignal.getValue();
                aspect = aSignal.at('aspect');
                facet = aSignal.at('facet');

                mapKey = TP.gid(aSignal.getOrigin()) +
                                TP.JOIN +
                                TP.str(aspect) +
                                TP.JOIN +
                                facet;

                //  If we found a target attribute registration under the key,
                //  then perform the set()
                if (TP.notEmpty(targetAttr = handler.$aspectMap.at(mapKey))) {

                    //  If this is a URI, and it's not a primary URI (i.e. it
                    //  has a fragment pointing to a subresource), then we want
                    //  to get the primary URI and perform a 'set' against it's
                    //  resource using the path from the fragment.
                    //  Otherwise, if it's a primary URI, then just set using
                    //  the registered target attribute.
                    if (TP.isURI(this)) {
                        if (!this.isPrimaryURI()) {
                            this.getPrimaryURI().getResource().set(
                                            this.getFragmentText(), newVal);
                        } else {
                            this.getResource().set(targetAttr, newVal);
                        }
                    } else {
                        //  Otherwise, it's not a URI - just do the set with the
                        //  registered target attribute.
                        this.set(targetAttr, newVal);
                    }
                }
            } catch (e) {
                this.raise('TP.sig.InvalidBinding');
            }
        };

        //  Allocate an aspect map that various aspects will register themselves
        //  with. This allows a set of source aspects to share a single change
        //  handler function.
        handler.$aspectMap = TP.hc();
        target.defineMethod(methodName, handler);
    }

    //  Add an entry to make a mapping between a source aspect and a target
    //  aspect.
    handler.$aspectMap.atPut(aspectKey, targetAttributeName);

    target.observe(resource, signalName);

    return target;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @name defineBinding
     * @synopsis Adds a binding to the receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If not specified,
     *     this will default to 'value'.
     * @returns {Object} The receiver.
     */

    return TP.defineBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('defineBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @name defineBinding
     * @synopsis Adds a binding to the type receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If not specified,
     *     this will default to 'value'.
     * @returns {Object} The receiver.
     */

    return TP.defineBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('defineBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @name defineBinding
     * @synopsis Adds a binding to the instance receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If not specified,
     *     this will default to 'value'.
     * @returns {Object} The receiver.
     * @todo
     */

    return TP.defineBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('destroyBinding',
function(target, targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @name defineBinding
     * @synopsis Adds a binding to the supplied target object.
     * @param {Object} target The target object to define the binding on.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If not specified,
     *     this will default to 'value'.
     * @returns {Object} The target object.
     */

    var resource,
        sourceAttr,

        facetName,
        signalName,
        aspectKey,

        methodName,

        handler;

    if (TP.isEmpty(targetAttributeName)) {
        return this.raise('TP.sig.InvalidParameter',
            'No attribute name provided for bind.');
    }

    if (TP.isString(resourceOrURI)) {
        resource = TP.uc(TP.TIBET_URN_PREFIX + resourceOrURI);
    } else {
        resource = resourceOrURI;
    }

    //  Prefer URIs but can bind to any object in theory.
    if (TP.notValid(resource)) {
        return this.raise('TP.sig.InvalidResource',
            'No resource spec provided for bind.');
    }

    //  Get the source attribute. If there is no source attribute, then use the
    //  target attribute as the source attribute.
    if (TP.notValid(sourceAttr = sourceAttributeName)) {
        sourceAttr = targetAttributeName;
    }

    //  Get the source facet. If there is no source facet, then default it to
    //  'value'.
    if (TP.notValid(facetName = sourceFacetName)) {
        facetName = 'value';
    } else {
        facetName = facetName.toLowerCase();
    }

    //  Choose the correct subtype of TP.sig.FacetSignal to use, depending on
    //  facet.
    switch (facetName) {

        case 'readonly':
            signalName = 'TP.sig.ReadonlyChange';
            break;

        case 'relevant':
            signalName = 'TP.sig.RelevantChange';
            break;

        case 'required':
            signalName = 'TP.sig.RequiredChange';
            break;

        case 'valid':
            signalName = 'TP.sig.ValidChange';
            break;

        case 'value':
            signalName = 'TP.sig.ValueChange';
            break;
    }

    if (!sourceAttr.isAccessPath()) {
        //  If the facet is 'value' as well, but the sourceAttr *isn't*, then we
        //  go ahead and set up for a spoofed <aspect>Change signal (if the
        //  sourceAttr is 'value' we'd rather have a signal name of
        //  'TP.sig.ValueChange' than 'ValueChange').
        if (facetName === 'value' && sourceAttr !== 'value') {
            signalName = sourceAttr.asStartUpper() + 'Change';
        }
    }

    //  The key into the aspect map is the global ID of the resource, the source
    //  attr name and the source facet name all joined together.
    aspectKey = TP.gid(resource) + TP.JOIN +
                TP.str(sourceAttr) + TP.JOIN +
                facetName;

    //  Make sure that target object has a local method to handle the change
    methodName = 'handle' + TP.escapeTypeName(signalName);

    if (TP.isValid(handler = target.getMethod(methodName)) &&
        TP.isValid(handler.$aspectMap)) {

        //  There was a valid handler and a valid key map - remove our source
        //  aspect from it.
        handler.$aspectMap.removeKey(aspectKey);
    }

    //  Ignore the target.
    target.ignore(resource, signalName);

    return target;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('destroyBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @name destroyBinding
     * @synopsis Removes a binding from the receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If not specified,
     *     this will default to 'value'.
     * @returns {Object} The receiver.
     * @todo
     */

    return TP.destroyBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('destroyBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @name destroyBinding
     * @synopsis Removes a binding from the type receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If not specified,
     *     this will default to 'value'.
     * @returns {Object} The receiver.
     * @todo
     */

    return TP.destroyBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('destroyBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @name destroyBinding
     * @synopsis Removes a binding from the instance receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If not specified,
     *     this will default to 'value'.
     * @returns {Object} The receiver.
     * @todo
     */

    return TP.destroyBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName);
});

//  ------------------------------------------------------------------------
//  TP.core.ElementNode
//  ------------------------------------------------------------------------

//  The attributes for this element type that are considered to 'bidi
//  attributes' that can not only be bound to data source but be bound *back* to
//  the data source so that when they are changed by the user, they update the
//  data source.
TP.core.ElementNode.Type.defineAttribute('bidiAttrs', TP.ac());

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getBindingInfoFrom',
function(attributeName) {

    /**
     * @name getBindingInfoFrom
     * @synopsis Gets binding information from the attribute named by the
     *     supplied attribute name on the receiver.
     * @param {String} attributeName The *local* name of the attribute to obtain
     *     the binding information from.
     * @returns {TP.lang.Hash} A hash of binding information keyed by the
     *     binding target name.
     */

    var elem,

        infoHash,

        attrNodes,
        bindEntries,

        scopeVals;

    elem = this.getNativeNode();

    infoHash = TP.hc();

    //  If there are no attributes on the receiver that belong to the
    //  TP.w3.Xmlns.BIND namespace, then just return an empty hash here - there
    //  is no reason to compute a bind scope chain for an element that doesn't
    //  have any binding.

    if (TP.isEmpty(attrNodes = TP.elementGetAttributeNodesInNS(
                        elem, '*:' + attributeName, TP.w3.Xmlns.BIND))) {
        return infoHash;
    } else {
        //  Otherwise, grab the value and split it along ';' (and stripping
        //  surrounding whitespace)
        bindEntries = attrNodes[0].value.split(/\s*;\s*/);
    }

    scopeVals = this.getBindingScopeValues();

    //  Iterate over all of the binding entries and qualify them with the values
    //  from the scope values array.
    bindEntries.perform(
        function(bindEntry) {

            var parts,

                bindName,
                bindVal,

                allVals,
                fullyExpandedVal;

            //  Each entry will have a 'name: value' pair. We split them all out
            //  by semicolon above - now we have to split each one into name and
            //  value.
            parts = bindEntry.match(/(\w+)\:\s*([^;]+)/);
            bindName = parts.at(1);
            bindVal = parts.at(2);

            if (TP.notEmpty(scopeVals)) {
                //  Concatenate the binding value onto the scope values array
                //  (thereby creating a new Array) and use it to join all of the
                //  values together.
                allVals = scopeVals.concat(bindVal);
                fullyExpandedVal = TP.uriJoinFragments.apply(TP, allVals);

                if (!TP.isURI(fullyExpandedVal)) {
                    this.raise('TP.sig.InvalidURI');
                    return TP.BREAK;
                }

                infoHash.atPut(bindName, fullyExpandedVal);
            } else {
                //  Scope values is empty - this is (hopefully) a fully
                //  qualified binding expression.
                infoHash.atPut(bindName, bindVal);
            }
        });

    return infoHash;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getBindingScopeValues',
function() {

    /**
     * @name getBindingScopeValues
     * @synopsis Returns the binding scope values by starting at the receiver
     *      and traversing the DOM tree up to the #document node, gathering
     *      'bind:scope' attribute values along the way. This will be used to
     *      qualify binding expressions on the receiver.
     * @returns {Array} An Array of binding scope values.
     */

    var elem,

        localScopeNode,

        scopeVals;

    elem = this.getNativeNode();

    scopeVals = TP.ac();

    //  Check to see if there is a local 'scope' attribute on the element
    //  itself. It will be used to qualify any expressions on itself.
    if (TP.notEmpty(localScopeNode = TP.elementGetAttributeNodesInNS(
                                    elem, '*:scope', TP.w3.Xmlns.BIND))) {
        scopeVals.push(localScopeNode[0].value);
    }

    //  Gather the 'bind:scope' setting up the chain.
    TP.nodeAncestorsPerform(
        elem,
        function(aNode) {

            var scopeAttrNodes;

            //  Have to check to make sure we're not at the #document node.
            if (TP.isElement(aNode)) {

                //  Get any 'scope' attributes belonging to the TP.w3.Xmlns.BIND
                //  namespace.
                scopeAttrNodes = TP.elementGetAttributeNodesInNS(
                                    aNode, '*:scope', TP.w3.Xmlns.BIND);

                //  If we found one, add it's value onto the end of the scope
                //  values array.
                if (TP.notEmpty(scopeAttrNodes)) {
                    scopeVals.push(scopeAttrNodes[0].value);
                }
            }
        });

    //  Make sure to reverse the scope values, since we want the 'most
    //  significant' to be first.
    scopeVals.reverse();

    return scopeVals;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('isBoundElement',
function() {

    /**
     * @name isBoundElement
     * @synopsis Whether or not the receiver is a bound element.
     * @returns {Boolean} Whether or not the receiver is bound.
     */

    var bindAttrNodes;

    //  We look for either 'in', 'out', or 'io' here to determine if the
    //  receiver is bound. The 'scope' attribute doesn't indicate that it is
    //  bound.
    bindAttrNodes = TP.elementGetAttributeNodesInNS(
                        this.getNativeNode(), /in|out|io/, TP.w3.Xmlns.BIND);

    return TP.notEmpty(bindAttrNodes);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('rebuild',
function(aSignalOrHash) {

    /**
     * @name rebuild
     * @synopsis Rebuilds any bindings for the receiver.
     * @param {TP.sig.DOMRebuild|TP.lang.Hash} aSignalOrHash An optional signal
     *     which triggered this action or hash supplied by the caller. This
     *     object should include the following keys:
     *          'deep'          ->      a value of true causes all descendant
     *                                  nodes to rebuild their bindings. If this
     *                                  value isn't supplied, this method
     *                                  defaults this setting to true.
     *          'shouldDefine'  ->      a value of true causes this method to
     *                                  define bindings when rebuilding them. If
     *                                  this value isn't supplied, this method
     *                                  defaults this setting to true.
     *          'shouldDestroy' ->      a value of true causes this method to
     *                                  destroy bindings when rebuilding them.
     *                                  If this value isn't supplied, this
     *                                  method defaults this setting to true.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var shouldDefine,
        shouldDestroy,

        bindingInfos,
        bindingInfo;

    shouldDefine = aSignalOrHash.atIfInvalid('shouldDefine', true);
    shouldDestroy = aSignalOrHash.atIfInvalid('shouldDestroy', true);

    //  If there isn't an overall 'binding information' dictionary defined on
    //  the receiver, then define one.
    if (TP.notValid(bindingInfos = this.get('bindInfos'))) {
        bindingInfos = TP.hc();
        this.set('bindInfos', bindingInfos);
    }

    //  If the caller wants us to destroy bindings, then we do so here.
    if (shouldDestroy) {

        //  bind:in

        //  Read the binding information from any 'bind:in' attribute.
        if (TP.notEmpty(bindingInfo = bindingInfos.at('in'))) {

            bindingInfo.perform(
                function(kvPair) {
                    var attrName,
                        obsURI;

                    attrName = kvPair.first();
                    obsURI = TP.uc(kvPair.last());

                    //  Destroy the binding using the attribute name and 'value'
                    //  as the source attribute name (any URI that we're
                    //  observing - whether a URI pointing to a primary resource
                    //  or one pointing to a subresource will have been sending
                    //  a 'TP.sig.ValueChange').
                    this.destroyBinding('@' + attrName, obsURI, 'value');
                }.bind(this));
        }

        //  bind:io

        //  Read the binding information from any 'bind:io' attribute.
        if (TP.notEmpty(bindingInfo = bindingInfos.at('io'))) {

            bindingInfo.perform(
                function(kvPair) {
                    var attrName,
                        obsURI;

                    attrName = kvPair.first();
                    obsURI = TP.uc(kvPair.last());

                    //  Destroy the binding using the attribute name and 'value'
                    //  as the source attribute name (any URI that we're
                    //  observing - whether a URI pointing to a primary resource
                    //  or one pointing to a subresource will have been sending
                    //  a 'TP.sig.ValueChange').
                    this.destroyBinding('@' + attrName, obsURI, 'value');

                    //  Since we're binding for 'io', we check to see if we can
                    //  remove the binding in the other direction by asking the
                    //  receiver. If so, remove it.

                    if (this.getType().get('bidiAttrs').contains(attrName)) {

                        //  Remove any binding from the control to the URI
                        obsURI.destroyBinding('value', this, 'value');
                    }

                }.bind(this));
        }

        //  bind:out

        //  Read the binding information from any 'bind:out' attribute.
        if (TP.notEmpty(bindingInfo = bindingInfos.at('out'))) {

            bindingInfo.perform(
                function(kvPair) {
                    var attrName,
                        obsURI;

                    attrName = kvPair.first();
                    obsURI = TP.uc(kvPair.last());

                    //  Remove any binding from the control to the URI
                    obsURI.destroyBinding('value', this, 'value');

                }.bind(this));
        }
    }

    //  Empty out all of the stored binding information - we will repopulate
    //  below.
    bindingInfos.empty();

    //  If the caller wants us to define bindings.
    if (shouldDefine) {

        //  bind:in

        //  Read the binding information from any 'bind:in' attribute.
        if (TP.notEmpty(bindingInfo = this.getBindingInfoFrom('in'))) {

            bindingInfo.perform(
                function(kvPair) {
                    var attrName,
                        obsURI;

                    attrName = kvPair.first();
                    obsURI = TP.uc(kvPair.last());

                    //  Define the binding using the attribute name and 'value'
                    //  as the source attribute name (any URI that we're
                    //  observing - whether a URI pointing to a primary resource
                    //  or one pointing to a subresource will send a
                    //  'TP.sig.ValueChange').
                    this.defineBinding('@' + attrName, obsURI, 'value');
                }.bind(this));

            bindingInfos.atPut('in', bindingInfo);
        }

        //  bind:io

        //  Read the binding information from any 'bind:io' attribute.
        if (TP.notEmpty(bindingInfo = this.getBindingInfoFrom('io'))) {

            bindingInfo.perform(
                function(kvPair) {
                    var attrName,
                        obsURI;

                    attrName = kvPair.first();
                    obsURI = TP.uc(kvPair.last());

                    //  Define the binding using the attribute name and 'value'
                    //  as the source attribute name (any URI that we're
                    //  observing - whether a URI pointing to a primary resource
                    //  or one pointing to a subresource will send a
                    //  'TP.sig.ValueChange').
                    this.defineBinding('@' + attrName, obsURI, 'value');

                    //  Since we're binding for 'io', we check to see if we can
                    //  add another binding in the other direction by asking the
                    //  receiver. If so, establish one.

                    if (this.getType().get('bidiAttrs').contains(attrName)) {
                        //  Establish the binding from the control to the URI
                        obsURI.defineBinding('value', this, 'value');
                    }

                }.bind(this));

            bindingInfos.atPut('io', bindingInfo);
        }

        //  bind:out

        //  Read the binding information from any 'bind:out' attribute.
        if (TP.notEmpty(bindingInfo = this.getBindingInfoFrom('out'))) {

            bindingInfo.perform(
                function(kvPair) {
                    var attrName,
                        obsURI;

                    attrName = kvPair.first();
                    obsURI = TP.uc(kvPair.last());

                        //  Establish the binding from the control to the URI
                    obsURI.defineBinding('value', this, 'value');

                }.bind(this));

            bindingInfos.atPut('out', bindingInfo);
        }
    }

    //  TODO: Send 'rebuild' to *shallow children* elements with 'bind:'
    //  attributes if the 'deep' flag is specified.

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
