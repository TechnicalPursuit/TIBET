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
handler will be invoked any time the source object changes any property.

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
to test the aspect with each Change signal. Note that the standard aspect is
'value', so the large-grained observation on TP.sig.Change that is shown above
first could have also been observing 'TP.sig.ValueChange'.

TIBET's Change signal hierarchy provides getTarget(), getAspect(), and
getAction() convenience methods. These help you access the originating object,
the property name that changed, and the type of action. Action in this case is
often TP.CREATE, TP.UPDATE, TP.DELETE, TP.INSERT, or a similar "crud" term. A
getValue() method provides you with the newly changed value.

//  ---
//  Object Binds - aspect facets
//  ---

In TIBET, aspects can have different facets. These are what the XForms
specification calls 'Model Item Properties'. Facets include: readonly, relevant,
required, type, etc. In addition to observing the value of an aspect changing,
we can also observe changes to facets of the aspect.

TP.sig.Change

TP.sig.FacetChange

TP.sig.ValueChange
SalaryChange

TP.sig.ReadonlyChange
SalaryReadonlyChange

TP.sig.RequiredChange
SalaryRequiredChange

TP.sig.RelevantChange
SalaryRelevantChange

TP.sig.ValidityChange
SalaryValidityChange

//  ---
//  Object Binds - defineBinding.
//  ---

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

For example, we might bind an input text field using the following:

    <input type="text" tsh:io="resource_spec"/>

All that's necessary is for our Change handler to trigger a "refresh" which
includesreading from the input data source and updating as needed.

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
from any HTML5-compliant browser local storage.

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

To bind data to an Element you simply provide the URI necessary to point to the
data you need to reference.

//  ---
//  Binding Attributes
//  ---

TIBET's functional attributes for binding are bind:in and bind:out. An optional
bind:io attribute sugars authoring for bi-directional binds where a repetitive
bind:in and bind:out pair would otherwise be required. An additional sugar is
the use of a bind:scope attribute which provides a way to define partial URI
paths so that leaf elements can use scoped relative URIs. Think of the bind:scope
attribute as xml:base for data bindings.

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
    <tsh:uri href="jsonp://ajax.googleapis.com/ajax/services/search/web?v=1.0&amp;q={{queryInput}}" ev:event="TP.sig.DOMClick" ev:observer="query_button">
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
            sourceFacetName, transformationFunc) {

    /**
     * @method defineBinding
     * @summary Adds a binding to the supplied target object.
     * @param {Object} target The target object to define the binding on.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will bound to. If not
     *     specified, this will default to 'value'.
     * @param {Function} transformationFunc A Function to transform the value
     *     before it is supplied to the observer of the binding. It takes one
     *     parameter, the new value from the model and returns the
     *     transformation parameter. This parameter is optional.
     * @param {Function} transformationFunc
     * @returns {Object} The target object.
     */

    var resource,

        finalTarget,

        sourceAttr,

        facetName,
        signalName,
        aspectKey,

        methodName,

        handler,

        resourceValue,

        i,
        allFacets;

    if (TP.isEmpty(targetAttributeName)) {
        return this.raise('TP.sig.InvalidParameter',
            'No attribute name provided for bind.');
    }

    if (TP.isString(resourceOrURI)) {
        resource = TP.uc(TP.TIBET_URN_PREFIX + resourceOrURI);
    } else if (TP.isKindOf(resourceOrURI, TP.core.TIBETURL)) {
        resource = resourceOrURI.getConcreteURI();
    } else {
        resource = resourceOrURI;
    }

    //  Prefer URIs but can bind to any object in theory.
    if (TP.notValid(resource)) {
        return this.raise('TP.sig.InvalidResource',
            'No resource spec provided for bind.');
    }

    finalTarget = target;

    if (TP.isKindOf(finalTarget, TP.core.TIBETURL)) {
        finalTarget = finalTarget.getConcreteURI();
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
    }

    //  Choose the correct subtype of TP.sig.FacetSignal to use, depending on
    //  facet.
    switch (facetName) {

        //  Specifying TP.ALL means that we use the supertype of all facet
        //  signals.
        case TP.ALL:
            signalName = 'TP.sig.FacetChange';
            break;

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
        default:
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

    //  Make sure that target object has a local method to handle the change
    methodName = TP.computeHandlerName(signalName);

    if (TP.notValid(handler = finalTarget.getMethod(methodName))) {

        //  Define a handler function
        handler = function(aSignal) {

            var origin,

                aspect,
                facet,

                mapKey,

                entry,
                targetAttr,
                transformFunc,

                source,
                newVal,

                parsedVal;

            try {
                origin = aSignal.getOrigin();

                aspect = aSignal.at('aspect');

                facet = aSignal.at('facet');

                //  Compute a map key in the same way we did above when we made
                //  the registration and see if the map has it.
                mapKey = TP.gid(origin) +
                                TP.JOIN +
                                TP.str(aspect) +
                                TP.JOIN +
                                facet;

                //  If we found a target attribute registration under the key,
                //  then perform the set()
                if (TP.notEmpty(entry =
                                handler.$observationsMap.at(mapKey))) {

                    //  The target attribute is the first item in the entry pair
                    //  and any (optional) transformation Function is the last.
                    targetAttr = entry.first();
                    transformFunc = entry.last();

                    newVal = aSignal.getValue();

                    //  If what we got back was a String, and that String can be
                    //  parsed into another 'JavaScript primitive' data type
                    //  (Number, Boolean, RegExp, etc.), then we do that here
                    //  *before* we call the transformation function.
                    if (TP.isString(newVal) &&
                        TP.isValid(parsedVal =
                                    TP.getParsedPrimitiveValue(newVal))) {
                        newVal = parsedVal;
                    }

                    //  If there was a transformation Function registered, then
                    //  execute it.
                    if (TP.isCallable(transformFunc)) {

                        source = aSignal.getSource();
                        newVal = transformFunc(source, newVal);
                    }

                    this.setFacet(targetAttr, facet, newVal, false);
                }
            } catch (e) {
                this.raise('TP.sig.InvalidBinding', TP.ec(e));
            }
        };

        //  Allocate an aspect map that various aspects will register themselves
        //  with. This allows a set of source aspects to share a single change
        //  handler function.
        handler.$observationsMap = TP.hc();
        finalTarget.defineHandler(signalName, handler);
    }

    if (facetName !== TP.ALL) {

        //  The key into the aspect map is the global ID of the resource, the
        //  source attr name and the source facet name all joined together.
        aspectKey = TP.gid(resource) + TP.JOIN +
                    TP.str(sourceAttr) + TP.JOIN +
                    facetName;

        //  Add an entry to make a mapping between a source aspect and a target
        //  aspect.
        handler.$observationsMap.atPut(aspectKey,
                                        TP.ac(targetAttributeName,
                                                transformationFunc));
    } else {

        //  TP.ALL was specified - set up an entry for each facet.

        allFacets = TP.FACET_NAMES.concat('value');
        for (i = 0; i < allFacets.getSize(); i++) {

            aspectKey = TP.gid(resource) + TP.JOIN +
                        TP.str(sourceAttr) + TP.JOIN +
                        allFacets.at(i);

            handler.$observationsMap.atPut(aspectKey,
                                            TP.ac(targetAttributeName,
                                                    transformationFunc));
        }
    }

    //  PERF

    //  If the resource is a URI and we can obtain the resource result value of
    //  it, make sure that it is configured to signal Change notifications.

    //  NB: We assume 'async' of false here.
    if (TP.isURI(resource) &&
        TP.isValid(resourceValue =
            resource.getResource(TP.hc('resultType', TP.WRAP)).get('result'))) {
        resourceValue.shouldSignalChange(true);
    }

    //  Go ahead and make the observation.
    finalTarget.observe(resource, signalName);

    return finalTarget;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName, transformationFunc) {

    /**
     * @method defineBinding
     * @summary Adds a binding to the receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will bound to. If not
     *     specified, this will default to 'value'.
     * @param {Function} transformationFunc A Function to transform the value
     *     before it is supplied to the observer of the binding. It takes one
     *     parameter, the new value from the model and returns the
     *     transformation parameter. This parameter is optional.
     * @returns {Object} The receiver.
     */

    return TP.defineBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName, transformationFunc);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('defineBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName, transformationFunc) {

    /**
     * @method defineBinding
     * @summary Adds a binding to the type receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will bound to. If not
     *     specified, this will default to 'value'.
     * @param {Function} transformationFunc A Function to transform the value
     *     before it is supplied to the observer of the binding. It takes one
     *     parameter, the new value from the model and returns the
     *     transformation parameter. This parameter is optional.
     * @returns {Object} The receiver.
     */

    return TP.defineBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName, transformationFunc);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('defineBinding',
function(targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName, transformationFunc) {

    /**
     * @method defineBinding
     * @summary Adds a binding to the instance receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will bound to. If not
     *     specified, this will default to 'value'.
     * @param {Function} transformationFunc A Function to transform the value
     *     before it is supplied to the observer of the binding. It takes one
     *     parameter, the new value from the model and returns the
     *     transformation parameter. This parameter is optional.
     * @returns {Object} The receiver.
     */

    return TP.defineBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName, transformationFunc);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('destroyBinding',
function(target, targetAttributeName, resourceOrURI, sourceAttributeName,
            sourceFacetName) {

    /**
     * @method destroyBinding
     * @summary Removes a binding from the supplied target object.
     * @param {Object} target The target object to remove the binding from.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will be unbound. If not
     *     specified, this will default to 'value'.
     * @returns {Object} The target object.
     */

    var resource,
        sourceAttr,

        facetName,
        signalName,
        aspectKey,

        methodName,

        handler,

        i,
        allFacets;

    if (TP.isEmpty(targetAttributeName)) {
        return this.raise('TP.sig.InvalidParameter',
            'No attribute name provided for bind.');
    }

    if (TP.isString(resourceOrURI)) {
        resource = TP.uc(TP.TIBET_URN_PREFIX + resourceOrURI);
    } else if (TP.isKindOf(resourceOrURI, TP.core.TIBETURL)) {
        resource = resourceOrURI.getConcreteURI();
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
    }

    //  Choose the correct subtype of TP.sig.FacetSignal to use, depending on
    //  facet.
    switch (facetName) {

        //  Specifying TP.ALL means that we use the supertype of all facet
        //  signals.
        case TP.ALL:
            signalName = 'TP.sig.FacetChange';
            break;

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
        default:
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

    //  Make sure that target object has a local method to handle the change
    methodName = TP.computeHandlerName(signalName);

    if (TP.isValid(handler = target.getMethod(methodName)) &&
        TP.isValid(handler.$observationsMap)) {

        if (facetName !== TP.ALL) {

            //  The key into the aspect map is the global ID of the resource,
            //  the source attr name and the source facet name all joined
            //  together.
            aspectKey = TP.gid(resource) + TP.JOIN +
                        TP.str(sourceAttr) + TP.JOIN +
                        facetName;

            //  There was a valid handler and a valid key map - remove our
            //  source aspect from it.
            handler.$observationsMap.removeKey(aspectKey);
        } else {

            //  TP.ALL was specified - remove the entry for each facet.

            allFacets = TP.FACET_NAMES.concat('value');
            for (i = 0; i < allFacets.getSize(); i++) {

                aspectKey = TP.gid(resource) + TP.JOIN +
                            TP.str(sourceAttr) + TP.JOIN +
                            allFacets.at(i);

                handler.$observationsMap.removeKey(aspectKey);
            }
        }
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
     * @method destroyBinding
     * @summary Removes a binding from the receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will be unbound. If not
     *     specified, this will default to 'value'.
     * @returns {Object} The receiver.
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
     * @method destroyBinding
     * @summary Removes a binding from the type receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will be unbound. If not
     *     specified, this will default to 'value'.
     * @returns {Object} The receiver.
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
     * @method destroyBinding
     * @summary Removes a binding from the instance receiver.
     * @param {String} targetAttributeName The target attribute name.
     * @param {Object} resourceOrURI The resource specification.
     * @param {String} sourceAttributeName The source attribute name. If not
     *     specified, this will default to targetAttributeName.
     * @param {String} sourceFacetName The source facet name. If TP.ALL is
     *     specified, then all facets from the source will be unbound. If not
     *     specified, this will default to 'value'.
     * @returns {Object} The receiver.
     */

    return TP.destroyBinding(
            this, targetAttributeName, resourceOrURI,
            sourceAttributeName, sourceFacetName);
});

//  ========================================================================
//  MARKUP BINDING
//  ========================================================================

//  ------------------------------------------------------------------------
//  TP.core.DocumentNode
//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineHandler('DOMRefresh',
function(aSignal) {

    /**
     * @method handleDOMRefresh
     * @summary Refreshes the receiver's bound data.
     * @param {TP.sig.DOMRefresh} aSignal The signal instance which triggered
     *     this handler.
     */

    this.refresh(aSignal);

    return;
});

//  ------------------------------------------------------------------------

TP.core.DocumentNode.Inst.defineMethod('refresh',
function(aSignalOrHash) {

    /**
     * @method refresh
     * @summary Updates the receiver's content by refreshing all bound elements
     *     in the document. For an HTML document this will refresh content under
     *     the body, while in an XML document all elements including the
     *     documentElement are refreshed.
     * @param {TP.sig.DOMRefresh|TP.core.Hash} aSignalOrHash An optional signal
     *     which triggered this action or a hash. If this is a signal, this
     *     method will try first to use 'getValue()' to get the value from the
     *     binding. If there is no value there, or this is a hash, this method
     *     will look under a key of TP.NEWVAL.
     *     This signal or hash should include a key of 'deep' and a value
     *     of true to cause a deep refresh that updates all nodes.
     * @returns {TP.core.DocumentNode} The receiver.
     */

    var node,
        body;

    node = this.getNativeNode();

    if (TP.isHTMLDocument(node) || TP.isXHTMLDocument(node)) {
        if (TP.isElement(body = TP.documentGetBody(node))) {
            return TP.tpnode(body).refresh(aSignalOrHash);
        }
    } else {
        return TP.tpnode(node.documentElement).refresh(aSignalOrHash);
    }
});

//  ------------------------------------------------------------------------
//  TP.core.ElementNode
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The attributes for this element type that are considered to 'bidi
//  attributes' that can not only be bound to data source but be bound *back* to
//  the data source so that when they are changed by the user, they update the
//  data source.
TP.core.ElementNode.Type.defineAttribute('bidiAttrs', TP.ac());

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineAttribute('bindInfos');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('defineBindingsUsing',
function(attrName, attrValue, scopeVals, direction, refreshImmediately) {

    /**
     * @method defineBindingsUsing
     * @summary Defines a binding between the data source as described in the
     *     supplied attribute value and the receiver.
     * @param {String} attrName The attribute name to install the binding under
     *     in the receiver.
     * @param {String} attrValue The attribute value to analyse to produce the
     *     proper binding expression.
     * @param {Array} scopeVals The list of scope values to use to qualify the
     *     binding expression.
     * @param {String} direction The binding 'direction' (i.e. which way to
     *     establish the binding connection from the data source to the
     *     receiver). Possible values here are: TP.IN, TP.OUT, TP.IO.
     * @param {Boolean} [refreshImmediately=false] Whether or not to refresh the
     *     receiver immediately after the bind is established.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var obsURIs,

        expandedExpr,

        exprParts,
        exprWithBrackets,

        exprToExecute,

        splitURI,

        allVals,
        primaryURIPath,

        obsURI,

        transformFunc,
        newVal,

        repeatScopeVal,
        repeatScopeValIndex,
        repeatIndex,
        repeatScopeURIPath,
        repeatScopeURI,

        i;

    obsURIs = TP.ac();

    //  Grab the 'expanded expression here' - we'll expand it further below.
    expandedExpr = attrValue;

    //  While we can still extract binding expressions from the value, keep
    //  looping. This allows us to have multiple expressions in a single value
    //  (i.e. 'foo [[bar]] is called: [[baz]]')
    TP.regex.BINDING_STATEMENT_EXTRACT.lastIndex = 0;
    while (TP.isValid(exprParts =
            TP.regex.BINDING_STATEMENT_EXTRACT.exec(attrValue))) {

        //  We want the expression both with and without the surrounding
        //  brackets ([[...]])
        exprWithBrackets = exprParts.first();
        exprToExecute = exprParts.last();

        //  If the expression to execute is a path that contains variables, then
        //  we just set up an observation on the 'value' of the URI and leverage
        //  the transformation function installed below to form a final value.
        if (TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(exprToExecute)) {

            //  If the expression to execute is a fully-formed URI, then we
            //  don't take the scope values into consideration. We build a
            //  primaryURIPath consisting of the URI's primary href with a
            //  '#tibet(...)' XPointer that will return the source object
            //  itself. This is important in the transformation function when we
            //  run the 'transform' call, because the expression is going to
            //  expect to run against the core source object itself. We then
            //  reset the expression to execute to be just the fragment text.
            if (TP.isURI(exprToExecute)) {

                splitURI = TP.uc(exprToExecute);

                primaryURIPath = splitURI.getPrimaryHref() + '#tibet(.)';
                exprToExecute = splitURI.getFragmentExpr();
            } else {
                //  Use the scope values array and join all of the values
                //  together into a URI path.
                primaryURIPath = TP.uriJoinFragments.apply(TP, scopeVals);
            }
        } else {

            //  Since the expression to execute didn't contain any variables, we
            //  can use it as part of the URI to observe (thereby getting finer
            //  grained control).

            //  If the expression to execute is a fully-formed URI, then we
            //  don't take the scope values into consideration. We build a
            //  primaryURIPath consisting of the expression to execute.
            if (TP.isURI(exprToExecute)) {
                primaryURIPath = exprToExecute;
            } else {
                //  Concatenate the expression to execute onto the scope values
                //  array and join all of the values together into a URI path.
                allVals = scopeVals.concat(exprToExecute);
                primaryURIPath = TP.uriJoinFragments.apply(TP, allVals);
            }

            //  If the expression to execute (surrounded by '[['...']]') is the
            //  same as the whole attribute value, that means that there's not
            //  any surrounding literal content, so we just set the expanded
            //  expression to null and just install a simple transformation
            //  function below.
            if ('[[' + exprToExecute + ']]' === attrValue) {
                expandedExpr = null;
            } else {
                exprToExecute = primaryURIPath;
            }
        }

        //  Make sure that, if there is an expanded expression, to replace that
        //  expression in the expression to execute with a 'formatting
        //  expression', so that the templating function below will work.
        if (TP.isValid(expandedExpr)) {
            expandedExpr = expandedExpr.replace(
                            exprWithBrackets,
                            '{{' + exprToExecute + '}}');
            expandedExpr = expandedExpr.unquoted();
        }

        //  Make sure to trim off any format before using this as the URI - note
        //  how we need to append a ')' onto the end, since it's an XPointer and
        //  we will have sliced off the trailing ')'.
        if (TP.regex.ACP_FORMAT.test(primaryURIPath)) {
            primaryURIPath = primaryURIPath.slice(
                                0,
                                primaryURIPath.indexOf('.%')).trim() + ')';
        }

        //  Create a URI from the primary path.
        obsURI = TP.uc(primaryURIPath);

        //  Push it onto the list of URIs that will be observed to update the
        //  overall expression.
        obsURIs.push(obsURI);
    }

    //  If the receiver is under a 'bind:repeat', then we need to set up the
    //  index, etc. properly.
    if (TP.isValid(this.getFirstAncestorByAttribute('bind:repeat'))) {

        //  Grab all of the scoping values that we computed earlier and
        //  filter out the ones that are 'simple numeric paths' (i.e.
        //  '[2]').
        /* eslint-disable no-loop-func */
        repeatScopeVal = scopeVals.select(
            function(item) {
                return TP.regex.SIMPLE_NUMERIC_PATH.test(item);
            }).last();
        /* eslint-enable no-loop-func */

        //  Find the index to the *last* simple numeric scoping value and
        //  slice off the '[' ']' and convert that to a Number. That will
        //  become our '$INDEX' value.
        repeatScopeValIndex = scopeVals.lastIndexOf(repeatScopeVal);
        repeatIndex = repeatScopeVal.slice(1, -1).asNumber();

        //  Now we join together a 'scoping path' that will be the path to
        //  the *collection* that will act as our '$INPUT'. This is done by
        //  slicing all scoping values to just before the index where we
        //  found our simple numeric scoping value.
        repeatScopeURIPath = TP.uriJoinFragments.apply(
                                TP, scopeVals.slice(0, repeatScopeValIndex));

        //  Compute a URI for that that will be used to retrieve the
        //  '$INPUT' resource.
        repeatScopeURI = TP.uc(repeatScopeURIPath);
    }

    //  If there is a valid expanded expression, then we install a
    //  transformation Function that will tranform the data before handing it to
    //  the setter.
    if (TP.isValid(expandedExpr)) {

        transformFunc = function(source, val) {
            var expr,

                wrappedVal,

                index,
                params,

                repeatResourceResult,
                last,

                retVal;

            expr = transformFunc.$$expandedExpr;

            wrappedVal = TP.wrap(val);

            if (TP.isNumber(index = transformFunc.$$repeatIndex)) {

                //  NB: We assume 'async' of false here.
                repeatResourceResult =
                    transformFunc.$$repeatInputURI.getResource().get('result');

                last = repeatResourceResult.getSize() - 1;

                //  Iterating context
                params = TP.hc(
                    '$REQUEST', null,
                    '$TAG', this,
                    '$TARGET', this.getDocument(),
                    '$_', wrappedVal,
                    '$INPUT', repeatResourceResult,
                    '$INDEX', index,
                    '$FIRST', index === 0,
                    '$MIDDLE', index > 0 && index < last,
                    '$LAST', index !== last,
                    '$EVEN', index % 2 === 0,
                    '$ODD', index % 2 !== 0,
                    '$#', index);
            } else {
                //  Non-iterating context
                params = TP.hc(
                    '$REQUEST', null,
                    '$TAG', this,
                    '$TARGET', this.getDocument(),
                    '$_', wrappedVal,
                    '$INPUT', val);
            }

            retVal = expr.transform(val, params);

            return retVal;
        }.bind(this);

        transformFunc.$$expandedExpr = expandedExpr;

        //  Capture 'repeat' data if it is available (because this expression is
        //  inside a 'bind:repeat')
        if (TP.isURI(repeatScopeURI)) {
            transformFunc.$$repeatIndex = repeatIndex;
            transformFunc.$$repeatInputURI = repeatScopeURI;
        }
    } else {

        //  Otherwise, we install a simple transformation Function that will
        //  just return the 'reduced value'. This is necessary especially for
        //  XML where val will be an Element, but we want the text value of
        //  the Element.
        transformFunc = function(source, val) {
            return TP.val(val);
        };
    }

    for (i = 0; i < obsURIs.getSize(); i++) {

        /*
        console.log('URI: ' + obsURIs.at(i).getLocation() +
                    '    ATTRVAL: ' + attrValue +
                    '   EXPR: ' + expandedExpr);
        */

        //  If we setting up a bind for either 'IN' or 'IO', then define the
        //  binding from the data model to this object.
        if (direction === TP.IN || direction === TP.IO) {

            if (TP.isCallable(transformFunc)) {
                this.defineBinding(
                    '@' + attrName, obsURIs.at(i),
                    'value', TP.ALL,
                    transformFunc);

                //  NB: We assume 'async' of false here.
                if (refreshImmediately) {
                    newVal = transformFunc(
                    obsURIs.at(i).getPrimaryURI().getResource().get('result'),
                    obsURIs.at(i).getResource().get('result'));
                }
            } else {
                this.defineBinding(
                    '@' + attrName, obsURIs.at(i),
                    'value', TP.ALL);

                //  NB: We assume 'async' of false here.
                if (refreshImmediately) {
                    newVal = obsURIs.at(i).getResource().get('result');
                }
            }

            if (refreshImmediately) {
                //  Manually refresh the binding. This is necessary because the
                //  binding has just been established and the resource won't
                //  know that it has to signal change.
                this.set('value', newVal, false);
            }
        }

        //  If we are setting up a bind for either 'OUT' or 'IO', then we have
        //  to establish a bind back the other way - from this object to the
        //  data model.
        if (direction === TP.OUT || direction === TP.IO) {
            obsURIs.at(i).defineBinding('value', this, attrName);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('destroyBindingsUsing',
function(attrName, attrValue, scopeVals, direction, unregisterURIs) {

    /**
     * @method destroyBindingsUsing
     * @summary Destroys any binding between the data source as described in the
     *     supplied attribute value and the receiver.
     * @param {String} attrName The attribute name to use to remove the binding
     *     from in the receiver.
     * @param {String} attrValue The attribute value to analyse to produce the
     *     proper binding expression.
     * @param {Array} scopeVals The list of scope values to use to qualify the
     *     binding expression.
     * @param {String} direction The binding 'direction' (i.e. which way the
     *     original binding connection was established from the data source to
     *     the receiver). Possible values here are: TP.IN, TP.OUT, TP.IO.
     * @param {Boolean} unregisterURIs
     * @returns {TP.core.ElementNode} The receiver.
     */

    var exprParts,

        exprToExecute,

        splitURI,

        allVals,
        primaryURIPath,

        obsURI;

    //  While we can still extract binding expressions from the value, keep
    //  looping. This allows us to have multiple expressions in a single value
    //  (i.e. 'foo [[bar]] is called: [[baz]]')
    TP.regex.BINDING_STATEMENT_EXTRACT.lastIndex = 0;
    while (TP.isValid(exprParts =
            TP.regex.BINDING_STATEMENT_EXTRACT.exec(attrValue))) {

        //  We only need the expression without the surrounding brackets
        //  ([[...]])
        exprToExecute = exprParts.last();

        //  If the expression to execute is a path that contains variables, then
        //  we will have set up an observation on the 'value' of the URI in the
        //  'defineBindingsUsing' method that we need to undo here.
        if (TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(exprToExecute)) {

            //  If the expression to execute is a fully-formed URI, then we
            //  don't take the scope values into consideration. We build a
            //  primaryURIPath consisting of the URI's primary href and a
            //  'value' TIBET XPointer that will just return the value. We then
            //  reset the expression to execute to be just the fragment text.
            if (TP.isURI(exprToExecute)) {
                splitURI = TP.uc(exprToExecute);
                primaryURIPath = splitURI.getPrimaryHref() +
                                    '#tibet(value)';
                exprToExecute = splitURI.getFragmentExpr();
                if (unregisterURIs) {
                    splitURI.unregister();
                }
            } else {
                //  Concatenate a simple 'value' expression onto the scope
                //  values array (thereby creating a new Array) and use it
                //  to join all of the values together.
                allVals = scopeVals.concat('value');
                primaryURIPath = TP.uriJoinFragments.apply(TP, allVals);
            }
        } else {
            //  Since the expression to execute didn't contain any variables, we
            //  can use it as part of the URI to ignore (thereby getting finer
            //  grained control).
            allVals = scopeVals.concat(exprToExecute);
            primaryURIPath = TP.uriJoinFragments.apply(TP, allVals);
        }

        //  Make sure to trim off any format before using this as the URI
        if (TP.regex.ACP_FORMAT.test(primaryURIPath)) {
            primaryURIPath = primaryURIPath.slice(
                            0, primaryURIPath.indexOf('.%')).trim();
        }

        //  Create a URI from the primary path.
        obsURI = TP.uc(primaryURIPath);

        //  If we tearing down a bind for either 'IN' or 'IO', then destroy the
        //  binding from the data model to this object.
        if (direction === TP.IN || direction === TP.IO) {
            this.destroyBinding('@' + attrName, obsURI, 'value', TP.ALL);
        }

        //  If we are tearing down a bind for either 'OUT' or 'IO', then we
        //  have to destroy the binding that we set up the other way - from this
        //  object to the data model.
        if (direction === TP.OUT || direction === TP.IO) {
            obsURI.destroyBinding('value', this, attrName);
        }

        if (unregisterURIs) {
            obsURI.unregister();
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineHandler('DOMRebuild',
function(aSignal) {

    /**
     * @method handleDOMRebuild
     * @summary Rebuilds the receiver's binding expressions.
     * @param {TP.sig.DOMRebuild} aSignal The signal instance which triggered
     *     this handler.
     */

    this.rebuild(aSignal);

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineHandler('DOMRefresh',
function(aSignal) {

    /**
     * @method handleDOMRefresh
     * @summary Refreshes the receiver's bound data.
     * @param {TP.sig.DOMRefresh} aSignal The signal instance which triggered
     *     this handler.
     */

    this.refresh(aSignal);

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getBindingInfoFrom',
function(attributeName, wantsFullScope) {

    /**
     * @method getBindingInfoFrom
     * @summary Gets binding information from the attribute named by the
     *     supplied attribute name on the receiver.
     * @param {String} attributeName The *local* name of the attribute to obtain
     *     the binding information from.
     * @param {Boolean} [wantsFullScope=false] Whether or not to return 'fully
           scoped values'.
     * @returns {TP.core.Hash} A hash of binding information keyed by the
     *     binding target name.
     */

    var elem,

        attrNodes,
        attrVal,

        entryStr,

        bindEntries,

        scopeVals,
        fullyScopedEntries;

    elem = this.getNativeNode();

    //  If there are no attributes on the receiver that belong to the
    //  TP.w3.Xmlns.BIND namespace, then just return an empty hash here - there
    //  is no reason to compute a bind scope chain for an element that doesn't
    //  have any binding.

    if (TP.isEmpty(attrNodes = TP.elementGetAttributeNodesInNS(
                        elem, '*:' + attributeName, TP.w3.Xmlns.BIND))) {
        return TP.hc();
    } else {
        //  Otherwise, grab the value and parse out each name: value pair using
        //  this global RegExp.
        attrVal = attrNodes[0].value;

        //  First, try to get the attribute as a JSON string. This allows for
        //  attribute values like:
        //
        //      {value: urn:tibet:fluffy}
        //
        //      which are converted to:
        //
        //      {"value": "urn:tibet:fluffy"}
        entryStr = TP.reformatJSToJSON(attrVal);

        //  If we couldn't get a JSON String, try to default it to
        //  {"value":"..."}
        if (!TP.isJSONString(entryStr)) {
            entryStr = '{"value":"' + attrVal + '"}';
        }

        //  Try to parse the entry string into a TP.core.Hash.
        bindEntries = TP.json2js(entryStr);

        if (TP.isEmpty(bindEntries)) {
            return this.raise('TP.sig.InvalidBinding',
                                'Source Element: ' + TP.str(elem) +
                                ' Generated bindings: ' + entryStr);
        }
    }

    if (TP.notTrue(wantsFullScope)) {
        return bindEntries;
    }

    //  Obtain the binding scope values by walking the DOM tree.
    scopeVals = this.getBindingScopeValues();

    fullyScopedEntries = TP.hc();

    //  Iterate over all of the binding entries and qualify them with the values
    //  from the scope values array.
    bindEntries.perform(
        function(bindEntry) {

            var bindName,
                bindVal,

                allVals,
                fullyExpandedVal;

            bindName = bindEntry.first();
            bindVal = bindEntry.last();

            if (TP.notEmpty(scopeVals)) {
                //  Concatenate the binding value onto the scope values array
                //  (thereby creating a new Array) and use it to join all of the
                //  values together.
                allVals = scopeVals.concat(bindVal);
                fullyExpandedVal = TP.uriJoinFragments.apply(TP, allVals);

                //  If we weren't able to compute a real URI from the fully
                //  expanded URI value, then raise an exception and return here.
                if (!TP.isURI(fullyExpandedVal)) {
                    this.raise('TP.sig.InvalidURI');

                    return TP.BREAK;
                }

                fullyScopedEntries.atPut(bindName, fullyExpandedVal);
            } else {
                //  Scope values is empty - this is (hopefully) a fully
                //  qualified binding expression.

                //  If we weren't able to compute a real URI from the fully
                //  expanded URI value, then raise an exception and return here.
                if (!TP.isURI(bindVal = TP.trim(bindVal))) {
                    this.raise('TP.sig.InvalidURI');

                    return TP.BREAK;
                }

                fullyScopedEntries.atPut(bindName, bindVal);
            }
        }.bind(this));

    return fullyScopedEntries;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getBindingScopeValues',
function() {

    /**
     * @method getBindingScopeValues
     * @summary Returns the binding scope values by starting at the receiver
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
    //  itself. This will be used to qualify any expressions on the element
    //  itself.
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

                //  First, check to see if there's a 'bind:repeat' attribute. If
                //  so, we want to use it's value first.
                scopeAttrNodes = TP.elementGetAttributeNodesInNS(
                                aNode, 'repeat', TP.w3.Xmlns.BIND);

                if (TP.notEmpty(scopeAttrNodes)) {
                    scopeVals.push(scopeAttrNodes[0].value);
                }

                //  Then, check to see if there's a 'bind:scope' attribute. If
                //  so, we want to use it's value next.
                scopeAttrNodes = TP.elementGetAttributeNodesInNS(
                                aNode, 'scope', TP.w3.Xmlns.BIND);

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

TP.core.ElementNode.Inst.defineMethod('getBoundChildren',
function() {

    /**
     * @method getBoundChildren
     * @summary Returns the children of the receiver that have data bindings.
     * @returns {Array} An Array of the *children* that are bound (i.e. a
     *     shallow query).
     */

    var query,
        result;

    //  Note that this gives us the bound *children*, not descendants (i.e. this
    //  is a shallow query).

    query = './*[@*[namespace-uri() = "' + TP.w3.Xmlns.BIND + '" and ' +
                '(' +
                ' local-name() = "in"' +
                ' or local-name() = "out"' +
                ' or local-name() = "io"' +
                ' or local-name() = "repeat"' +
                ')' +
                ']]' +
            ' | ' +
            './*[@*[contains(., "[[")]]';

    result = TP.wrap(
                TP.nodeEvaluateXPath(this.getNativeNode(), query, TP.NODESET));

    return result;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getBoundDescendants',
function() {

    /**
     * @method getBoundDescendants
     * @summary Returns the descendants of the receiver that have data bindings.
     * @returns {Array} An Array of the *descendants* that are bound (i.e. a
     *     deep query).
     */

    var query,
        result;

    //  Note that this gives us the bound *descendants* (i.e. this is a deep
    //  query).

    query = './/*[@*[namespace-uri() = "' + TP.w3.Xmlns.BIND + '" and ' +
                '(' +
                ' local-name() = "in"' +
                ' or local-name() = "out"' +
                ' or local-name() = "io"' +
                ' or local-name() = "repeat"' +
                ')' +
                ']]' +
            ' | ' +
            './/*[@*[contains(., "[[")]]';

    result = TP.wrap(
                TP.nodeEvaluateXPath(this.getNativeNode(), query, TP.NODESET));

    return result;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('isBoundElement',
function() {

    /**
     * @method isBoundElement
     * @summary Whether or not the receiver is a bound element.
     * @returns {Boolean} Whether or not the receiver is bound.
     */

    var bindAttrNodes;

    //  We look for either 'in', 'out', 'io' or 'target' here to determine if
    //  the receiver is bound. The 'scope' attribute doesn't indicate that it is
    //  bound.
    bindAttrNodes = TP.elementGetAttributeNodesInNS(
            this.getNativeNode(), /.*:(in|out|io|repeat)/, TP.w3.Xmlns.BIND);

    if (TP.notEmpty(bindAttrNodes)) {
        return true;
    }

    if (TP.isAttributeNode(
            TP.nodeEvaluateXPath(this.getNativeNode(),
                                    '@*[contains(., "[[")]',
                                    TP.FIRST_NODE))) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('isRepeatElement',
function() {

    /**
     * @method isRepeatElement
     * @summary Whether or not the receiver is a repeat element for binding.
     * @returns {Boolean} Whether or not the receiver is a repeat element
     */

    var bindAttrNodes;

    //  We look for either 'in', 'out', or 'io' here to determine if the
    //  receiver is bound. The 'scope' attribute doesn't indicate that it is
    //  bound.
    bindAttrNodes = TP.elementGetAttributeNodesInNS(
                    this.getNativeNode(), '*:repeat', TP.w3.Xmlns.BIND);

    return TP.notEmpty(bindAttrNodes);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('rebuild',
function(aSignalOrHash) {

    /**
     * @method rebuild
     * @summary Rebuilds any bindings for the receiver.
     * @param {TP.sig.DOMRebuild|TP.core.Hash} aSignalOrHash An optional signal
     *     which triggered this action or hash supplied by the caller. This
     *     object should include the following keys:
     *          'deep'              ->  a value of true causes all descendant
     *                                  nodes to rebuild their bindings. If this
     *                                  value isn't supplied, this method
     *                                  defaults this setting to true.
     *          'shouldDefine'      ->  a value of true causes this method to
     *                                  define bindings when rebuilding them. If
     *                                  this value isn't supplied, this method
     *                                  defaults this setting to true.
     *          'shouldDestroy'     ->  a value of true causes this method to
     *                                  destroy bindings when rebuilding them.
     *                                  If this value isn't supplied, this
     *                                  method defaults this setting to true.
     *          'unregisterURIs'    ->
     * @returns {TP.core.ElementNode} The receiver.
     */

    var repeatAttrs,

        info,

        shouldDefine,
        shouldDestroy,
        unregisterURIs,

        nonBindAttrNodes,

        scopeVals,
        bidiAttrs,

        bindingInfos,
        bindingInfo;

    //  First, check to see if this is a repeat element. If it is, we handle
    //  rebuilding it quite differently.
    repeatAttrs = TP.elementGetAttributeNodesInNS(
                        this.getNativeNode(), '*:repeat', TP.w3.Xmlns.BIND);

    if (TP.notEmpty(repeatAttrs)) {

        //  It's a repeat - rebuild it's dependencies and return.
        this.rebuildRepeat(aSignalOrHash);

        return this;
    }

    info = TP.isValid(aSignalOrHash) ? aSignalOrHash : TP.hc();

    shouldDefine = info.atIfInvalid('shouldDefine', true);
    shouldDestroy = info.atIfInvalid('shouldDestroy', true);
    unregisterURIs = info.atIfInvalid('unregisterURIs', true);

    //  If there isn't an overall 'binding information' dictionary defined on
    //  the receiver, then define one.
    if (TP.notValid(bindingInfos = this.get('bindInfos'))) {
        bindingInfos = TP.hc();
        this.set('bindInfos', bindingInfos);
    }

    //  Grab all of the attribute nodes on the receiver that are *not* in the
    //  TP.w3.Xmlns.BIND namespace but have bind sugar syntax ('[['...']]') as
    //  part of their value.
    nonBindAttrNodes = TP.nodeEvaluateXPath(
                    this.getNativeNode(),
                    '@*[namespace-uri() != "' + TP.w3.Xmlns.BIND + '"' +
                    ' and ' +
                    'contains(., "[[")]',
                    TP.NODESET);

    //  Obtain the binding scope values by walking the DOM tree.
    scopeVals = this.getBindingScopeValues();

    //  Obtain the names of any attributes that allow bi-directional binding.
    bidiAttrs = this.getType().get('bidiAttrs');

    //  If the caller wants us to destroy bindings, then we do so here.
    if (shouldDestroy) {

        //  bind:in

        //  Read the binding information from any 'bind:in' attribute.
        if (TP.notEmpty(bindingInfo = bindingInfos.at('in'))) {

            bindingInfo.perform(
                function(kvPair) {

                    var attrName,
                        attrVal;

                    attrName = kvPair.first();
                    attrVal = kvPair.last();

                    if (!TP.regex.BINDING_STATEMENT_EXTRACT.test(attrVal)) {
                        attrVal = '[[' + attrVal + ']]';
                    }

                    this.destroyBindingsUsing(
                            attrName,
                            attrVal,
                            scopeVals,
                            TP.IN,
                            unregisterURIs);

                }.bind(this));
        }

        //  bind:io

        //  Read the binding information from any 'bind:io' attribute.
        if (TP.notEmpty(bindingInfo = bindingInfos.at('io'))) {

            bindingInfo.perform(
                function(kvPair) {

                    var attrName,
                        attrVal,

                        isBidi;

                    attrName = kvPair.first();
                    attrVal = kvPair.last();

                    if (!TP.regex.BINDING_STATEMENT_EXTRACT.test(attrVal)) {
                        attrVal = '[[' + attrVal + ']]';
                    }

                    isBidi = bidiAttrs.contains(attrName);

                    this.destroyBindingsUsing(
                            attrName,
                            attrVal,
                            scopeVals,
                            isBidi ? TP.IO : TP.IN,
                            unregisterURIs);

                }.bind(this));
        }

        //  bind:out

        //  Read the binding information from any 'bind:out' attribute.
        if (TP.notEmpty(bindingInfo = bindingInfos.at('out'))) {

            bindingInfo.perform(
                function(kvPair) {

                    var attrName,
                        attrVal;

                    attrName = kvPair.first();
                    attrVal = kvPair.last();

                    if (!TP.regex.BINDING_STATEMENT_EXTRACT.test(attrVal)) {
                        attrVal = '[[' + attrVal + ']]';
                    }

                    this.destroyBindingsUsing(
                            attrName,
                            attrVal,
                            scopeVals,
                            TP.OUT,
                            unregisterURIs);

                }.bind(this));
        }

        //  'sugared' attribute values

        (function() {
            var i,

                attrName,
                attrValue,

                isBidi;

            for (i = 0; i < nonBindAttrNodes.getSize(); i++) {

                attrName = nonBindAttrNodes.at(i).name;
                attrValue = nonBindAttrNodes.at(i).value;

                isBidi = bidiAttrs.contains(attrName);

                this.destroyBindingsUsing(
                        attrName,
                        attrValue,
                        scopeVals,
                        isBidi ? TP.IO : TP.IN,
                        unregisterURIs);
            }
        }.bind(this)());
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
                        attrVal;

                    attrName = kvPair.first();
                    attrVal = kvPair.last();

                    if (!TP.regex.BINDING_STATEMENT_EXTRACT.test(attrVal)) {
                        attrVal = '[[' + attrVal + ']]';
                    }

                    this.defineBindingsUsing(
                            attrName,
                            attrVal,
                            scopeVals,
                            TP.IN,
                            aSignalOrHash.at('refreshImmediately'));

                }.bind(this));

            bindingInfos.atPut('in', bindingInfo);
        }

        //  bind:io

        //  Read the binding information from any 'bind:io' attribute.
        if (TP.notEmpty(bindingInfo = this.getBindingInfoFrom('io'))) {

            bindingInfo.perform(
                function(kvPair) {

                    var attrName,
                        attrVal,

                        isBidi;

                    attrName = kvPair.first();
                    attrVal = kvPair.last();

                    if (!TP.regex.BINDING_STATEMENT_EXTRACT.test(attrVal)) {
                        attrVal = '[[' + attrVal + ']]';
                    }

                    isBidi = bidiAttrs.contains(attrName);

                    this.defineBindingsUsing(
                            attrName,
                            attrVal,
                            scopeVals,
                            isBidi ? TP.IO : TP.IN,
                            aSignalOrHash.at('refreshImmediately'));

                }.bind(this));

            bindingInfos.atPut('io', bindingInfo);
        }

        //  bind:out

        //  Read the binding information from any 'bind:out' attribute.
        if (TP.notEmpty(bindingInfo = this.getBindingInfoFrom('out'))) {

            bindingInfo.perform(
                function(kvPair) {

                    var attrName,
                        attrVal;

                    attrName = kvPair.first();
                    attrVal = kvPair.last();

                    if (!TP.regex.BINDING_STATEMENT_EXTRACT.test(attrVal)) {
                        attrVal = '[[' + attrVal + ']]';
                    }

                    this.defineBindingsUsing(
                            attrName,
                            attrVal,
                            scopeVals,
                            TP.OUT,
                            aSignalOrHash.at('refreshImmediately'));

                }.bind(this));

            bindingInfos.atPut('out', bindingInfo);
        }

        //  'sugared' attribute values

        (function() {
            var i,

                attrName,
                attrValue,

                isBidi;

            for (i = 0; i < nonBindAttrNodes.getSize(); i++) {

                attrName = nonBindAttrNodes.at(i).name;
                attrValue = nonBindAttrNodes.at(i).value;

                isBidi = bidiAttrs.contains(attrName);

                this.defineBindingsUsing(
                        attrName,
                        attrValue,
                        scopeVals,
                        isBidi ? TP.IO : TP.IN,
                        aSignalOrHash.at('refreshImmediately'));
            }
        }.bind(this)());
    }

    if (TP.isTrue(info.at('deep'))) {
        //  TODO: Send 'rebuild' to *shallow children* elements with 'bind:'
        //  attributes if the 'deep' flag is specified.
        void 0;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('rebuildRepeat',
function(aSignalOrHash) {

    /**
     * @method rebuildRepeat
     * @summary Rebuilds any bindings for the receiver's descendant content
     *     that is bound.
     * @param {TP.sig.DOMRebuild|TP.core.Hash} aSignalOrHash An optional signal
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

    var info,
        shouldDefine,
        shouldDestroy,

        oldObsLoc,
        oldObsURI,

        elem,
        elemChildElements,
        i,
        childTPElem,

        childrenFragment,

        repeatAttrs,

        scopeVals,
        repeatVal,
        allVals,
        fullyExpandedVal,

        obsURI,
        resp,
        result;

    info = TP.isValid(aSignalOrHash) ? aSignalOrHash : TP.hc();

    shouldDefine = info.atIfInvalid('shouldDefine', true);
    shouldDestroy = info.atIfInvalid('shouldDestroy', true);

    oldObsLoc = this.getAttribute('oldObsLoc');

    if (shouldDestroy) {

        elem = this.getNativeNode();

        //  Grab the child *Elements* under the receiver - there might already
        //  be some drawn by a previous refresh of this element.
        elemChildElements = TP.nodeGetChildElements(elem);

        for (i = 0; i < elemChildElements.getSize(); i++) {
            childTPElem = TP.wrap(elemChildElements.at(i));

            //  Obviously, only destroy the binding if the child is a bound
            //  element.
            if (childTPElem.isBoundElement()) {
                childTPElem.rebuild(
                        TP.hc('shouldDefine', false, 'shouldDestroy', true));
            }
        }

        //  Destroy the binding for the overall repeatValue
        if (TP.notEmpty(oldObsLoc)) {
            oldObsURI = TP.uc(oldObsLoc);
            this.destroyBinding('repeatValue', oldObsURI, 'value');
            oldObsURI.unregister();
        }

        //  If we're configured to be 'editable', then ignore the double click
        //  signal on ourself, effectively turning off editing.
        if (this.getAttribute('bind:editable') === 'true') {
            this.ignore(this, 'TP.sig.DOMDblClick');
        }
    }

    if (shouldDefine) {

        //  If there is no children content already captured, then capture it.
        if (TP.notValid(childrenFragment = this.get('repeatContent'))) {

            //  Grab the childNodes of the receiver as a DocumentFragment.
            //  NOTE: This *removes* these child nodes from the receiver.
            childrenFragment = TP.nodeListAsFragment(
                                    this.getNativeNode().childNodes);

            //  Make sure to define the attribute or TIBET will warn ;-).
            this.defineAttribute('repeatContent');

            //  Store our repeat content away for use later.
            this.set('repeatContent', childrenFragment);
        }

        repeatAttrs = TP.elementGetAttributeNodesInNS(
                            this.getNativeNode(), '*:repeat', TP.w3.Xmlns.BIND);

        //  Obtain the binding scope values by walking the DOM tree.
        scopeVals = this.getBindingScopeValues();

        //  Start with the value of our 'bind:repeat' attribute, concatenate
        //  that onto the Array of scope values and expand them. This should
        //  produce a valid URI that represents the collection of data that we,
        //  as a repeat, represent.
        repeatVal = repeatAttrs[0].value;
        allVals = scopeVals.concat(repeatVal);
        fullyExpandedVal = TP.uriJoinFragments.apply(TP, allVals);

        //  Create a URI from that fully expanded value.
        obsURI = TP.uc(fullyExpandedVal);

        //  If we weren't able to compute a real URI from the fully expanded URI
        //  value, then raise an exception and return here.
        if (!TP.isURI(fullyExpandedVal)) {
            this.raise('TP.sig.InvalidURI');

            return this;
        }

        //  Now, define a binding that binds that URI's 'value' to our
        //  'repeatValue' aspect. When that collection changes, we will get
        //  notified by the binding machinery calling 'set("repeatValue", ...)'
        //  on us, thereby invoking our 'setRepeatValue()' method below.
        this.defineBinding('repeatValue', obsURI, 'value');

        this.setAttribute('oldObsLoc', obsURI.asString());

        //  If we have real resource result data and either had an old URI or
        //  we're not a primary URI, then we won't have gotten notified from the
        //  main URI since it didn't change, but we did, so we need to manually
        //  call refresh.

        //  NB: We assume 'async' of false here.
        resp = obsURI.getResource();
        if (TP.notEmpty(result = resp.get('result')) &&
            (TP.notEmpty(oldObsLoc) || !obsURI.isPrimaryURI())) {

            this.updateRepeat(result);
        }

        //  If we're configured to be 'editable', then observe the double click
        //  signal on ourself, effectively turning on editing.
        if (this.getAttribute('bind:editable') === 'true') {
            this.observe(this, 'TP.sig.DOMDblClick');
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineHandler('DOMDblClick',
function(aSignal) {

    /**
     * @method handleDOMDblClick
     * @summary Causes the element to set up an editor on an element and to edit
     *      it's text content. This text content must've been placed there by
     *      the repeat machinery.
     * @param {TP.sig.DOMDblClick} aSignal The signal instance which triggered
     *     this handler.
     */

    var target,
        textNode,

        template,
        updatePath,
        updateAspect,
        index,
        repeatResourceResult,

        thisArg,

        editor,

        handler;

    target = aSignal.getTarget();
    if (TP.isTextNode(target)) {
        textNode = target;
        target = target.parentNode;
    } else {
        textNode = target.firstChild;
    }

    //  If there is no updatePath on the textNode, then just exit. It's not a
    //  text node that was generated by the repeat machinery.
    if (TP.isEmpty(updatePath = textNode.updatePath)) {
        return;
    }

    //  Copy the rest of the expandos placed on the text node by the repeat
    //  machinery.
    updateAspect = textNode.updateAspect;
    template = textNode.template;
    index = textNode.index;
    repeatResourceResult = textNode.repeatResourceResult;

    thisArg = this;

    //  Replace the text node with an editor.
    editor = TP.nodeReplaceTextWithEditor(textNode);
    editor.style.width = '100%';
    editor.style.height = '100%';

    //  Set up a 'change' handler on the editor.
    editor.addEventListener('change',
            handler = function() {
                var newText,
                    resourceResult,
                    params,

                    newTextNode;

                newText = editor.value;

                //  Remove the 'change' listener handler.
                this.removeEventListener('change', handler, false);

                //  Update the underlying text value in the model

                //  NB: We assume 'async' of false here.
                resourceResult = TP.uc(updatePath).getResource().get('result');
                resourceResult.set(updateAspect, newText);

                //  If there was a template, then execute it against the model.
                //  This will produce a 'new' new text value that we can use for
                //  our text node value.
                if (template) {

                    //  Iterating context
                    params = TP.hc(
                        '$REQUEST', null,
                        '$TAG', thisArg,
                        '$TARGET', thisArg.getDocument(),
                        '$_', newText,
                        '$INPUT', repeatResourceResult,
                        '$INDEX', index,
                        '$#', index);

                    newText = template.transform(resourceResult, params);
                }

                newTextNode = editor.ownerDocument.createTextNode(newText);

                //  Cache values from the old text node
                newTextNode.template = template;
                newTextNode.updatePath = updatePath;
                newTextNode.updateAspect = updateAspect;
                newTextNode.index = index;
                newTextNode.repeatResourceResult = repeatResourceResult;

                //  Replace the editor with the newly generated text node
                TP.nodeReplaceChild(editor.parentNode,
                                    newTextNode,
                                    editor,
                                    false);
            },
            false);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('updateRepeat',
function(aResource) {

    /**
     * @method updateRepeat
     * @summary Refreshes the repeat and it's children content from the
     *     supplied resource.
     * @param {Object} aResource The object that will be used as the repeat
     *     value. This object should be a collection.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var repeatAttrVal,
        repeatURI,

        elem,

        repeatResourceResult,
        resourceLength,
        isXMLResource,

        repeatContent,
        elemChildElements,
        repeatChildElements,

        startIndex,
        repeatSize,
        endIndex,
        totalDisplaySize,
        scopeNum,
        scopedDescendants,
        groupSize,
        boundCount,

        scopeVals,
        vals,

        i,
        childTPElem,
        bodyFragment,
        newNode,
        index,
        elemsWithIds,
        newChildElements,

        j,

        query,
        isBound;

    repeatAttrVal = this.getAttribute('bind:repeat');

    //  If we weren't handed a resource, then try to see if we can form a URI
    //  from either our 'bind:repeat' attribute or 'oldObsLoc' attribute and use
    //  that.
    if (TP.notValid(repeatResourceResult = aResource)) {
        if (TP.notEmpty(repeatAttrVal)) {
            if (TP.isURI(repeatURI = TP.uc(repeatAttrVal))) {

                //  NB: We assume 'async' of false here.
                repeatResourceResult = repeatURI.getResource().get('result');
            }
        } else if (TP.notEmpty(repeatAttrVal =
                                this.getAttribute('oldObsLoc'))) {
            if (TP.isURI(repeatURI = TP.uc(repeatAttrVal))) {

                //  NB: We assume 'async' of false here.
                repeatResourceResult = repeatURI.getResource().get('result');
            }
        }
    }

    //  If we still couldn't get a valid resource, then just log a warning and
    //  return.
    if (TP.notValid(repeatResourceResult)) {
        TP.ifWarn() ?
                TP.warn('Could not obtain a repeating resource') : 0;

        return this;
    }

    //  If the resource we were handed wasn't an Array, then wrap the resource
    //  we were handed into an Array.
    if (!TP.isArray(repeatResourceResult)) {
        repeatResourceResult = TP.ac(repeatResourceResult);
    }

    resourceLength = repeatResourceResult.getSize();
    isXMLResource = TP.isXMLNode(TP.unwrap(repeatResourceResult.first()));

    elem = this.getNativeNode();

    //  This will be a DocumentFragment that we stuffed away when the receiver
    //  was rebuilt.
    repeatContent = this.get('repeatContent');

    //  Grab the child *Elements* under the receiver - there might already be
    //  some drawn by a previous refresh of this element.
    elemChildElements = TP.nodeGetChildElements(elem);

    //  Grab the child *Elements* in the repeat content.
    repeatChildElements = TP.nodeGetChildElements(repeatContent);

    //  If we have a 'bind:repeatindex', then we can compute a starting index
    //  from it.
    if (this.hasAttribute('bind:repeatindex')) {
        if (TP.isNumber(startIndex =
                        this.getAttribute('bind:repeatindex').asNumber())) {

            //  This is so that we can treat everything from here down as
            //  0-based for simplicity.
            if (isXMLResource) {
                startIndex = startIndex - 1;
            }
        }

        //  If we have a 'bind:repeatsize', then we can compute an ending index
        //  from that and the startIndex
        if (TP.isNumber(repeatSize =
                        this.getAttribute('bind:repeatsize').asNumber())) {
            endIndex = startIndex + repeatSize;
        } else {
            endIndex = resourceLength - startIndex;
        }
    }

    //  If we don't have a startIndex, then we don't have either - default them
    //  to 0 and the size of the resource.
    if (!TP.isNumber(startIndex)) {
        startIndex = 0;
        endIndex = resourceLength;
    }

    totalDisplaySize = endIndex - startIndex;

    //  If we've already built all of the repeating elements, we can just rebind
    //  the individual elements here.
    if (elemChildElements.getSize() !==
        repeatChildElements.getSize() * totalDisplaySize) {

        //  Empty out whatever content we used to have.
        this.empty();

        bodyFragment = TP.nodeGetDocument(elem).createDocumentFragment();

        //  Iterate over the resource and build out a chunk of markup for each
        //  item in the resource.
        for (i = startIndex; i < endIndex; i++) {

            //  Make sure to clone the content.
            newNode = TP.nodeCloneNode(repeatContent);

            //  If the resource is XML, then we need to adjust the index (XPaths
            //  are 1-based).
            if (isXMLResource) {
                index = i + 1;
            } else {
                index = i;
            }

            //  If there are elements inside of the new chunk we're building
            //  that have 'ids', we need to adjust them.
            //  TODO: We might not want to do this - it's presumptuous.
            elemsWithIds = TP.nodeGetDescendantElementsByAttribute(
                                                            newNode, 'id');
            /* eslint-disable no-loop-func */
            elemsWithIds.perform(
                    function(anElem) {
                        TP.elementSetAttribute(
                            anElem,
                            'id',
                            TP.elementGetAttribute(anElem, 'id') + index);
                    });
            /* eslint-enable no-loop-func */

            //  Grab the child *Elements* in the new content (the cloned repeat
            //  content).
            newChildElements = TP.nodeGetChildElements(newNode);

            //  Iterate over them and, if they're bound, then add a 'bind:scope'
            //  to them.
            for (j = 0; j < newChildElements.getSize(); j++) {

                query = '@*[namespace-uri() = "' + TP.w3.Xmlns.BIND + '" and ' +
                            '(' +
                            ' local-name() = "in"' +
                            ' or local-name() = "out"' +
                            ' or local-name() = "io"' +
                            ' or local-name() = "repeat"' +
                            ')' +
                            ']' +
                        ' or ' +
                        '@*[contains(., "[[")]';

                //  NB: This returns a Boolean result.
                isBound = TP.nodeEvaluateXPath(
                                        newChildElements.at(j),
                                        query,
                                        TP.NODESET);

                if (isBound) {

                    //  Make sure the element doesn't already have 'bind:scope'
                    //  on it.
                    if (!TP.elementHasAttribute(
                                newChildElements.at(j), 'bind:scope', true)) {
                        TP.elementSetAttributeInNS(
                                        newChildElements.at(j),
                                        'bind:scope',
                                        '[' + index + ']',
                                        TP.w3.Xmlns.BIND);
                    }
                }
            }

            //  Append this new chunk of markup to the document fragment we're
            //  building up and then loop to the top to do it again.
            bodyFragment.appendChild(newNode);
        }

        //  Finally, append the whole fragment under the receiver element
        TP.nodeAppendChild(elem, bodyFragment, false);

        //  Bubble any xmlns attributes upward to avoid markup clutter.
        TP.elementBubbleXMLNSAttributes(elem);

        //  Grab all of the elements with a 'bind scope' attribute and rebuild
        //  them.
        TP.byCSSPath('[bind|scope]', elem, false, false).perform(
                function(anElem) {
                    TP.wrap(anElem).rebuild(
                            TP.hc('shouldDefine', true,
                                    'shouldDestroy', false,
                                    'refreshImmediately', true));
                });

        //  Requery for child elements that we can refresh. This should now
        //  contain all of the child elements that we need.
        elemChildElements = TP.nodeGetChildElements(elem);
    }

    //  We subtract 1 from the startIndex because the first time through the
    //  loop below, when the mod succeeds, it will kick it by 1.
    scopeNum = startIndex - 1;

    //  This expression gets all of the child descendants that have a
    //  'bind:scope' attribute on them, but *not* if they're under an
    //  element that has a 'bind:repeat' - we're only interested in our
    //  descendants, not any nested repeat's descendants.
    scopedDescendants = TP.byCSSPath(
                        '> *[bind|scope], *:not(*[bind|repeat]) *[bind|scope]',
                        this.getNativeNode(),
                        false,
                        false);

    //  The grouping size is the number of *scoped* descendants we have
    //  divided by the totalDisplaySize.
    groupSize = scopedDescendants.getSize() / totalDisplaySize;

    boundCount = 0;

    for (i = 0; i < elemChildElements.getSize(); i++) {
        childTPElem = TP.wrap(elemChildElements.at(i));

        //  Obviously, only rebind if the child is a bound element.
        if (childTPElem.isBoundElement()) {

            //  If we've reached our group size, kick the scope number once.
            if (boundCount % groupSize === 0) {
                scopeNum++;
            }

            //  Have the child destroy it's current bindings (before we
            //  change its scope).
            childTPElem.rebuild(
                    TP.hc('shouldDefine', false, 'shouldDestroy', true,
                            'unregisterURIs', false));

            //  Have to adjust for the fact that XPaths are 1-based.
            if (isXMLResource) {
                childTPElem.setAttribute(
                                'bind:scope', '[' + (scopeNum + 1) + ']');
            } else {
                childTPElem.setAttribute(
                                'bind:scope', '[' + scopeNum + ']');
            }

            //  Have the child define it's bindings now that its scope has
            //  been changed.
            childTPElem.rebuild(
                    TP.hc('shouldDefine', true, 'shouldDestroy', false));

            //  Bubble any xmlns attributes upward to avoid markup clutter.
            TP.elementBubbleXMLNSAttributes(elemChildElements.at(i));

            boundCount++;
        }
    }

    if (boundCount > 0) {
        this.$triggerRepeatURIChanged();
    }

    scopeVals = this.getBindingScopeValues();

    for (i = 0; i < resourceLength; i++) {
        vals = scopeVals.concat(
                    repeatAttrVal,
                    '[' + (i + startIndex) + ']');

        this.$updateRepeatingTextNodes(
                elemChildElements.at(i),
                repeatResourceResult.at(i),
                vals,
                i,
                resourceLength,
                repeatResourceResult);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$updateRepeatingTextNodes',
function(aNode, aResource, pathValues, anIndex, numTotalValues, repeatResourceResult) {

    /**
     * @method $updateRepeatingTextNodes
     * @returns {TP.core.ElementNode} The receiver.
     */

    var allTextNodes,
        isXMLResource,

        index,
        last,

        params,

        j,

        textNode,
        text,

        parts,

        template,

        vals,

        tagNode,

        path,

        value;

    allTextNodes = TP.nodeGetDescendantsByType(aNode, Node.TEXT_NODE);

    isXMLResource = TP.isXMLNode(TP.unwrap(aResource));

    index = isXMLResource ? anIndex + 1 : anIndex;
    last = numTotalValues - 1;

    //  Iterating context
    params = TP.hc(
        '$REQUEST', null,
        '$TAG', this,
        '$TARGET', this.getDocument(),
        '$_', aResource,
        '$INPUT', repeatResourceResult,
        '$INDEX', index,
        '$FIRST', index === 0,
        '$MIDDLE', index > 0 && index < last,
        '$LAST', index !== last,
        '$EVEN', index % 2 === 0,
        '$ODD', index % 2 !== 0,
        '$#', index);

    for (j = 0; j < allTextNodes.length; j++) {
        textNode = allTextNodes[j];
        if (!TP.isTextNode(textNode)) {
            continue;
        }

        text = TP.nodeGetTextContent(textNode);

        TP.regex.BINDING_STATEMENT_EXTRACT.lastIndex = 0;
        parts = TP.regex.BINDING_STATEMENT_EXTRACT.exec(text);

        if (TP.notEmpty(parts) && parts.getSize() > 1) {

            template = '{{' + parts.at(1) + '}}';

            if (!TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(template) &&
                isXMLResource &&
                !template.startsWith('{{./')) {

                vals = pathValues.concat(template.slice(2, -2));
                template = '{{(./' + template.slice(2, -2) + ').value}}';
            } else {
                vals = pathValues;

                if (/\$TAG/.test(template)) {
                    tagNode = TP.nodeCloneNode(textNode.parentNode);
                    params.atPut('$TAG', TP.wrap(tagNode));
                }
            }

            path = TP.uriJoinFragments.apply(TP, vals);

            //  Cache values used by a possible editor
            textNode.template = template;
            textNode.updatePath = path;
            textNode.updateAspect = parts.at(1);
            textNode.index = index;
            textNode.repeatResourceResult = repeatResourceResult;

            value = template.transform(aResource, params);
            TP.nodeSetTextContent(textNode, value);

        } else if (TP.isString(template = textNode.template)) {
            value = template.transform(aResource, params);
            TP.nodeSetTextContent(textNode, value);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('refresh',
function(aSignalOrHash) {

    /**
     * @method refresh
     * @summary Updates the receiver to reflect the current value of any data
     *     binding it may have. If the signal or hash payload specifies a
     *     'deep' refresh then descendant elements that are bound are also
     *     updated.
     * @description For bound elements there are really two "values", the
     *     element's internal value such as its text value (what we call its
     *     "display" value) and the element's bound value which is the value
     *     found by evaluating its binding aspect against its source. This
     *     method is used to update the former from the latter, typically in
     *     response to a Change notification from the underlying bound content.
     * @param {TP.sig.DOMRefresh|TP.core.Hash} aSignalOrHash An optional signal
     *     which triggered this action or a hash.
     *     This signal or hash should include a key of 'deep' and a value
     *     of true to cause a deep refresh that updates all nodes.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var bindingInfos,
        infoEntries,

        scopeVals,

        boundDescendants;

    //  If our binding information is not empty, then try to refresh our
    //  bindings.
    if (TP.notEmpty(bindingInfos = this.get('bindInfos'))) {

        //  Obtain the binding scope values by walking the DOM tree.
        scopeVals = this.getBindingScopeValues();

        //  Iterate over each binding entry, join paths to give us a full URI,
        //  and then send a 'change' from that URI

        //  First, process the 'in' bindings
        if (TP.notEmpty(infoEntries = bindingInfos.at('in'))) {
            infoEntries.perform(
                function(kvPair) {
                    var bindingVal,
                        allVals,

                        uriPath,
                        uri;

                    bindingVal = kvPair.last();

                    allVals = scopeVals.concat(bindingVal);
                    uriPath = TP.uriJoinFragments.apply(TP, allVals);
                    uri = TP.uc(uriPath);

                    //  NB: An explicit test for TP.core.URI here - we want to
                    //  make sure we have that type of object, not just a
                    //  String.
                    if (TP.isKindOf(uri, TP.core.URI)) {
                        uri.$changed();
                    }
                });
        }

        //  Then, process the 'io' bindings
        if (TP.notEmpty(infoEntries = bindingInfos.at('io'))) {
            infoEntries.perform(
                function(kvPair) {
                    var bindingVal,
                        allVals,

                        uriPath,
                        uri;

                    bindingVal = kvPair.last();

                    allVals = scopeVals.concat(bindingVal);
                    uriPath = TP.uriJoinFragments.apply(TP, allVals);
                    uri = TP.uc(uriPath);

                    //  NB: An explicit test for TP.core.URI here - we want to
                    //  make sure we have that type of object, not just a
                    //  String.
                    if (TP.isKindOf(uri, TP.core.URI)) {
                        uri.$changed();
                    }
                });
        }
    }

    //  NB: We don't process 'out' bindings here - we don't refresh from them
    //  ;-).

    if (TP.isValid(aSignalOrHash) && TP.isTrue(aSignalOrHash.at('deep'))) {

        //  Get the bound descendants and refresh them.
        boundDescendants = this.getBoundDescendants();

        //  *Make sure to set the 'deep' flag to false* - otherwise, we'll do a
        //  lot of extra work in our descendants as they traverse.
        aSignalOrHash.atPut('deep', false);

        boundDescendants.perform(
                function(aTPElement) {
                    aTPElement.refresh(aSignalOrHash);
                });

        aSignalOrHash.atPut('deep', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setAttrBindRepeatindex',
function(index) {

    /**
     * @method setAttrBindRepeatindex
     * @summary Sets the repeat index that the receiver will use to start
     *     repeating from.
     * @param {Number} index The index to start repeating from.
     */

    this.$setAttribute('bind:repeatindex', index);

    this.updateRepeat();

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setAttrBindRepeatsize',
function(size) {

    /**
     * @method setAttrBindRepeatsize
     * @summary Sets the repeat size that the receiver will use to display
     *     'pages' of repeating data.
     * @param {Number} size The size of the data 'page'.
     */

    this.$setAttribute('bind:repeatsize', size);

    this.updateRepeat();

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setRepeatValue',
function(aResource) {

    /**
     * @method setRepeatValue
     * @summary Sets the repeat value (the collection) for the receiver (if
     *     it's an element that has a 'bind:repeat' on it).
     * @param {Object} aResource The object that will be used as the repeat
     *     value. This object should be a collection.
     * @returns {TP.core.ElementNode} The receiver.
     */

    if (this.isRepeatElement()) {
        this.updateRepeat(aResource);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$triggerRepeatURIChanged',
function() {

    /**
     * @method $triggerRepeatURIChanged
     * @returns {TP.core.ElementNode} The receiver.
     */

    var repeatAttrVal,

        refreshURI,
        refreshScopeVals,
        refreshURIPath;

    repeatAttrVal = this.getAttribute('bind:repeat');

    if (TP.notValid(refreshURI = TP.uc(repeatAttrVal))) {
        refreshScopeVals = this.getBindingScopeValues();
        refreshScopeVals.push(repeatAttrVal);
        refreshURIPath = TP.uriJoinFragments.apply(TP, refreshScopeVals);
        refreshURI = TP.uc(refreshURIPath);
    }

    refreshURI.$changed();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
