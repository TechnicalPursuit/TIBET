//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
General-purpose support for data binding.

//  ---
//  overview
//  ---

A core design goal for TIBET has always been to support existing or emerging
web standards whenever possible. With respect to data binding in particular
that's been a challenge. First of all, there really aren't any independent
open standards for data binding. And the one data binding model that is part
of a W3 specification, the data binding model found in XForms, isn't well
suited to the level of functionality required by TIBET applications.

We had to abandon a pure XForms data binding model for several reasons. In
particular we wanted to be able to several things it can't support:

    - bind to non-XML data like JSON and its derivatives,
    - use non-XPath query syntaxes like CSS selector syntax,
    - bind to properties of a control other than its value,
    - bind to non-UI elements such as action tags,
    - provide for both bidirectional and one-way binds,
    - support deferred initialization of bound elements,
    - minimize new constructs for TIBET developers to learn.

The last of those concerns led us to examine how data binding and the TIBET
Shell (TSH) might work together. The result of that exploration was the
realization that we could leverage the shell's inherent STDIO capacity as a
data binding mechanism.

Taking the concept of STDIO and applying it to the concept of data binding
might seem a little strange at first. The thing to keep in mind is that, to
TIBET at least, markup is simply source code for the shell. Each chunk of
markup you provide to a page is literally run as a script to produce what
you see on the page. Providing standard input to one or more tags is
therefore equivalent to binding those tags -- when each tag is executed it
has access to the intended data to use as appropriate for that tag.

As an example, think about the <html:input type="text"/> tag. When that tag
is run (not rendered) by TIBET its tshExecute method is invoked. Most html:
UI elements respond to that method by checking for input and using that
input as their 'value', precisely what you'd want in most cases for data
binding support. By observing the input data source for changes the
remaining requirements of data binding can be met, ensuring that change
notifications trigger running the tag's segment of input pipe.

Of course, not all tags have the same requirements. Adding custom behavior
for binding is easy however, you simply override the proper methods in your
tag type and perform whatever logic is necessary for your control/widget. By
factoring things in this way there's really no limit to what you can build
in terms of a custom control while leveraging the full power of the shell.

Another side effect of using the more general STDIO model for binding is
that we quickly move from a single bidirectional binding model to a model in
which input, output, and error content can be separately handled. This can
be really powerful when you consider that you can bind input to a shell
script embedded in an ev:script element and direct that script's output to a
UI control or some other location within your application. Error output can
similarly be directed via the same mechanisms.

So how do you define stdin, stdout, and stderr for your tags? You make use
of another central object in TIBET development -- a URI.

//  ---
//  resource references
//  ---

URIs are the focal point for much of TIBET development and data management.
Most everything in TIBET has a URI (whether registered or not) which could
potentially be used to reference that object. This applies to remote data on
a server, local data in the file system and browser-hosted database, and to
JavaScript objects within your application.

As you may know, TIBET supports standard http:, https:, and webdav: URI
formats for accessing data on a remote server using any of those protocols.
A TIBET extension, the xmpp: scheme, allows you to access data on a remote
XMPP server (the same base protocol underlying Google Talk and Google Wave).
An additional extension, the jsonp: scheme, tells TIBET you're accessing
data using the JSONP "protocol" as opposed to fetching JSON via HTTP or
HTTPS.

For local (offline) storage you can use file: URIs to access data on the
local file system subject to browser-specific security considerations.
You can also use a localdb: URI, a TIBET-specific extension, to read and
write data to and from any HTML5-compliant browser database (or to access
IE's built-in database which TIBET wraps for compatibility).

The often-overlooked urn: (Universal Resource Name) format is leveraged by
TIBET to allow you to register any object in your application under a public
name that TIBET can locate on request. TIBET types are accessible in this
fashion automatically, as are a few other common objects within TIBET. For
example, you can access the TP.core.URI type itself via the TIBET-specific
URI of urn:tibet:TP.core.URI.

A final TIBET extension, the tibet: scheme, allows you to use what we call
"virtual URIs", URIs whose value is resolved at runtime based on your
current application's environment and configuration parameters. A common use
of this is to avoid defining whether a resource is local or remote. Instead
TIBET can resolve the "root" of the URI when needed. A leading ~ is a form
of convenient shorthand for many tibet: URIs including ~app/... and ~lib/...
which represent your application's root directory and the TIBET library your
application is using respectively.

Obviously there's a lot of power lurking in the TP.core.URI type and its various
subtypes, including a number of shorthand "sugars" which allow you to refer
to data without too much syntactic overhead.

The following are all valid TIBET resource references:

    //  within the current $CANVAS (the active window)
    #an_element_id
    #element(/1/1/3)        // the 3rd child of the 1st child of the root
    #xpointer(//*[@foo])    // all elements with a foo attribute
    #css(.foo)              // all elements with a foo class

    //  on a remote server...
    http://www.teamtibet.com/tibet/TeamTIBET.rss

    //  in the local file system
    file:///usr/local/src/tibet/trunk/cfg/tibet_kernel.xml

    //  wherever the current application stores its configuration data
    ~app_cfg/development.js

    //  in JavaScript memory
    urn:tibet:TIBET#customTypes

Additional variations are possible, the full scope of TIBET URI syntax is
too broad to cover here. Suffice it to say that by combining the right
primary resource (the portion of the URI before the '#' octothorpe) with the
right secondary resource (what URI syntax calls the 'fragment') you can
reach any object likely to be useful to your application.

//  ---
//  "aspect" references
//  ---

The previous paragraph needs a little extra discussion before the full
syntax of TIBET URIs becomes clear, particularly as they relate to data
binding and the TIBET shell.

According to the URI specification the fragment portion of a URI is _not_
part of the server-side resource resolution process. Instead, the fragment
is a form of client-side indirect referencing which is processed after the
server has resolved the resource reference in front of the fragment. If you
think about the typical use, as an "anchor reference" in an HTML document,
you'll see this is true. The server returns the entire page to the client,
then your browser navigates you to the anchor. This is in contrast to having
the server return just the subset of the DOM referenced by the ID you've
provided. (See http://labs.apache.org/webarch/uri/rfc/rfc3986.html#fragment
for more information.)

The implication of the previous paragraph is that when you construct a URI
in TIBET you're really telling the system two things: what "primary" data
resource to use, and what fragment or "aspect" of that data source. As it
turns out this is precisely what's needed to define useful data bindings
which can go beyond simple references to an object's "value" property and
express bindings to other properties or attributes of the resource.

//  ---
//  binding attributes
//  ---

TIBET's functional attributes for binding are tsh:in, tsh:out, and tsh:err.
An optional tsh:io attribute sugars authoring for bi-directional binds
where a repetitive tsh:in and tsh:out pair would otherwise be required. An
additional sugar is the use of a tsh:base attribute which provides a way to
define partial URI paths so that leaf elements can use scoped relative URIs.
Think of the tsh:base attribute as xml:base for data bindings.

Pre-processing of binding attributes happens during the tshFinalize phase,
when all tag expansion has already occurred. During this phase each element
with a binding attribute is processed to expand that reference so it can be
used with minimal runtime overhead.

The expansion of binding attribute values is a key aspect of making it as
easy as possible to author complex binds with minimal markup. In particular,
binding attributes "inherit" their resource context from ancestor elements
with tsh:base attributes much like they do within the XForms binding model.

To make things concrete let's look at some sample markup which provides a
master/detail display of TIBET's current VCard data from vcards.xml.

<html>
<head>

    <!-- define a data source to load once the document is ready. NOTE
    that this is bound only to output, it's a one-way data source. -->
    <tsh:uri href="~app_dat/vcards.xml" out="urn:tibet:VCARDS"
        ev:event="TP.sig.DOMContentLoaded" ev:target="#document"/>

    <!-- define some inline JavaScript object data we'll bind to below.
    NOTE we're still using the tsh:uri tag, now using inline content -->
    <tsh:uri out="urn:tibet:HASH" ev:event="TP.sig.DOMContentLoaded"
        ev:target="#document"/>
    <![CDATA[
        TP.hc('title', 'Available VCard Data');
    ]]>
    </tsh:uri>

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
    Note the leading $ for the variable name here is required. -->
    <hello:world tsh:in="urn:tibet:TSH#$EFFECTIVE_USERNAME" />

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
                ${item |* vcard_row}    <!-- interpolate via row template -->
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
    <fieldset name="detail" tsh:base="urn:tibet:TSH#$CURRENT_RECORD">
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

//  ---
//  model item properties
//  ---

An additional binding concept embodied in XForms binds are model item
properties. In XForms the readonly, required, relevant, and constraint
attributes define rules regarding the state of what TIBET considers to be
metadata variables: readonly, required, relevant, and valid. These variables
tell you something about the data, but are not part of the data itself.

An additional 'calculate' attribute defines what is, in effect, an action
taken when the result of that attribute's XPath expression changes. When
a relevant data change occurs for a calculate attribute a new value is
computed by executing the calculate expression and the result is sent where
the bind directs. It's not hard to see how that pattern might be useful in
other contexts. That's precisely how TIBET manages XForms' model item
property attributes -- as <tsh:compute/> actions with optional bindings.

For example:

    ...here's an action to set relevancy for the bind based on an xpath...
    <tsh:compute base="instance_id" in="xpath"
                        out="#element_id@relevant" />


*/

//  ------------------------------------------------------------------------
//  Type Methods
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
        this.raise('TP.sig.InvalidElement');
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
});

//  ------------------------------------------------------------------------

// TODO: this creates a GLOBAL...why?
TP.sys.defineGlobal('isBound', TP.core.ElementNode.isBoundElement);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  STATE TESTING
//  ------------------------------------------------------------------------

    //  TODO:   move this function to TIBETDOMTypes.js

TP.core.ElementNode.Inst.defineMethod('isReadonly',
function() {

    /**
     * @name isReadonly
     * @synopsis Returns true if the receiver is currently readonly, meaning
     *     that it should reject efforts to change its value. Readonly state can
     *     be explicit due to the receiver's attributes or binding information,
     *     or it can be implicit if the receiver has a readonly ancestor.
     * @returns {Boolean} Whether or not the receiver is readonly.
     */

    var ancestor,
        val;

    //  non-bound elements use an attribute check up the ancestor chain.
    //  NOTE that this can't be cached effectively so we always iterate

    ancestor = this.getNativeNode();    //  start with this element's node
    while (TP.isElement(ancestor) && (ancestor.nodeType !== Node.DOCUMENT_NODE)) {
        //  explicit authoring can define this without a bind
        val = TP.elementGetAttribute(ancestor, 'xctrls:readonly');
        if (TP.notEmpty(val)) {
            //  a value of false still won't force...any ancestor marked
            //  readonly makes all of its children readonly regardless of
            //  their individual settings
            if (val === 'true') {
                return true;
            }
        }

        ancestor = ancestor.parentNode;
    }

    return false;
});

//  ------------------------------------------------------------------------
//  BIND TESTING
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
//  STDIO
//  ------------------------------------------------------------------------

/*
The methods in this section are general purpose methods for all of the
STDIO processing done by getBoundInput, setBoundOutput, and setBoundError.
*/

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$getBoundSTDIO',
function(aDirection) {

    /**
     * @name $getBoundSTDIO
     * @returns {Array} A triple containing a TP.core.URI, the bound script
     *     source, and a boolean which is true when the script represents a TSH
     *     pipe segment.
     * @todo
     */

    var fname,
        script,
        parts,
        loc,
        pipe,

        win,
        window_name,
        window_path,

        url;

    //  get the IO "script" for the direction specified. it shouldn't be
    //  empty since we should be bound for that direction if we got this
    //  far, but just in case we'll simply return if we can't find it.
    if (TP.isEmpty(script = this.$getBoundSTDIOScript(aDirection))) {
        return;
    }

    //  stdio references can basically be short pipes to include formatters,
    //  filters, and other processing of the data...so we have to check for
    //  that and split off the source or sink end of the pipe to get URI.
    if (TP.regex.TSH_PIPE.test(script)) {
        parts = script.split(TP.regex.TSH_PIPE);
        fname = (aDirection === TP.STDIN) ? 'first' : 'last';
        loc = parts[fname]().trim();
        pipe = true;
    } else {
        //  should be a well-formed url then.
        loc = script.trim();
    }

    //  two options here...we allow for a shorthand using barenames and so
    //  we may be looking at a local ID or a full URI
    if (loc.indexOf('#') === 0) {
        //  we could let the TP.uc() call default the window but since we're
        //  working with an element-qualified barename we can be sure of
        //  things by adding our window name and/or document source path.
        win = TP.nodeGetWindow(this.getNativeNode()) || window;
        window_name = TP.isWindow(win) ? win.name : '$CANVAS';
        window_path = TP.documentGetLocation(win.document) || '';

        //  construct the best reference URI we can from the window name and
        //  document path.
        loc = 'tibet://' + window_name + '/' + window_path + loc;
    }

    url = TP.uc(loc);
    if (TP.notValid(url)) {
        //  TODO:   binding exception, bad input URI
        return;
    }

    //  return our component data for the consumer to process
    return TP.ac(url, script, pipe);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$getBoundSTDIOScript',
function(aDirection) {

    /**
     * @name $getBoundSTDIOScript
     * @synopsis Attempts to locate a TSH script which represents the pipe
     *     processing for aDirection (TP.STDIN, TP.STDOUT, TP.STDERR).
     * @param {Constant} aDirection TP.STDIN, TP.STDOUT, or TP.STDERR.
     * @returns {String} A string of TSH source which represents the pipe used
     *     to process the receiver's bound error.
     */

    var ancestor;

    switch (aDirection) {
        //  TODO:   stdin/stdout both need to follow the base io paths
        //  upward when they have any portion of their binding attribute.
        case TP.STDIN:
            return this.getAttribute('tsh:in');

        case TP.STDOUT:
            return this.getAttribute('tsh:out');

        case TP.STDERR:
            //  start with a local check, even an empty attribute is valid
            //  for this attribute as a way of turning off ancestor
            //  settings.
            if (this.hasAttribute('tsh:err')) {
                return this.getAttribute('tsh:err');
            }

            //  work up the tree to find any enclosing error handler
            //  assignment.
            ancestor = TP.nodeDetectAncestor(this.getNativeNode(),
                function(item) {

                    return TP.elementHasAttribute(item, 'tsh:err');
                });

            //  if we found one that's great, but don't forget it's a native
            //  node ;)
            if (TP.isElement(ancestor)) {
                return TP.elementGetAttribute(ancestor, 'tsh:err');
            }

            break;

        default:
            //  TODO:   raise?
            break;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$setBoundSTDIO',
function(aDirection, aValue, shouldSignal) {

    /**
     * @name $setBoundSTDIO
     * @param {Constant} aDirection TP.STDOUT or TP.STDERR.
     * @param {Object} aValue The value to set.
     * @param {Boolean} shouldSignal Should changes be notified. Defaults to the
     *     return value of this.shouldSignalChange().
     * @returns {TP.core.ElementNode} The receiver.
     * @todo
     */

    var triplet,
        url,
        script,
        pipe,

        request,
        shell,
        response;

    //  process any binding data and produce the parts we need.
    if (TP.notValid(triplet = this.$getBoundSTDIO(aDirection))) {
        return;
    }

    //  unroll our triplet return values
    url = triplet.at(0);
    script = triplet.at(1);
    pipe = triplet.at(2);

    //  no pipe? then we can just set the URI's value without shell overhead.
    if (TP.notValid(pipe)) {
        url.setContent(aValue);
        return this;
    }

    //  we can remove the URI from the first phase of the script and
    //  just provided the content data as TP.STDIN to the remainder.
    request = TP.sig.ShellRequest.construct(
        TP.hc('cmd', script,
            'cmdExecute', true,
            'cmdPhases', 'nocache',
            'cmdSilent', true,
            TP.STDIN, aValue
        ));

    //  NOTE that this presumes the shell script doesn't include any
    //  portions which are going to require async processing.
    shell = TP.core.TSH.getDefaultInstance();
    response = shell.handleShellRequest(request);

    //  TODO:   add success/error completion hooks

    return this;
});

//  ------------------------------------------------------------------------
//  STDIN
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getBoundInput',
function(aRequest) {

    /**
     * @name getBoundInput
     * @synopsis Returns the value of the receiver's bound input content.
     * @description This method can return different results based on the nature
     *     of both the receiver and the bound content. For example, controls
     *     that bind to scalars may request a scalar value whereas controls
     *     which bind to nodelists may simply return the nodelist as the value.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {Object} The value, scalar or otherwise, bound to this element.
     * @todo
     */

    var triplet,
        url,
        script,
        pipe,

        input,

        request,
        shell,
        response,

        value,
        arr,
        len,
        i;

    TP.stop('break.bind_stdin');

    //  check for any input-related binding references. if we don't have any
    //  then we won't try to return our bound input default value, we'll
    //  return undefined since the element isn't bound.
    if (!this.isBoundElement(TP.STDIN)) {
        return;
    }

    //  process any binding data and produce the parts we need.
    if (TP.notValid(triplet = this.$getBoundSTDIO(TP.STDIN))) {
        return this.$getBoundInputDefault();
    }

    //  unroll our triplet return values
    url = triplet.at(0);
    script = triplet.at(1);
    pipe = triplet.at(2);

    //  fetch the data from the source URI using our request parameter to
    //  provide the fetch with parameters; we'll worry about any pipeline
    //  formatters/validators in a moment...
    input = url.getResource(aRequest);

    //  reduce the content so we're not dealing with an array when we're
    //  single-valued...no point in either observing too much or in
    //  running it all through a formatting pipeline when we only want
    //  one value.
    if (this.isSingleValued()) {
        input = this.$reduceBoundInput(input, aRequest);
    }

    //  make sure we observe our input whenever it might have changed.
    //  NOTE that we observe the content prior to any pipe processing,
    //  we're interested in the URI's content, not what
    //  formatting/filtering does.
    this.$observeBoundInput(url, input);

    //  now that we've observed the source we can finally run the script
    //  or resolve the URI to get our input data.
    if (pipe) {
        //  slice the URI off the front of the script and replace it
        //  with a reference to STDIN's default value.
        script = '$_ ' + script.slice(
            TP.regex.TSH_PIPE.match(script).index);

        //  we can remove the URI from the first phase of the script and
        //  just provided the content data as TP.STDIN to the remainder.
        request = TP.sig.ShellRequest.construct(
            TP.hc('cmd', script,
                'cmdExecute', true,
                'cmdPhases', 'nocache',
                'cmdSilent', true,
                TP.STDIN, input
            ));

        //  NOTE that this presumes the shell script doesn't include any
        //  portions which are going to require async processing.
        shell = TP.core.TSH.getDefaultInstance();
        response = shell.handleShellRequest(request);
        input = response.getResult();

        //  just in case the pipe did something to alter the shape of the
        //  output let's reduce to a single object again
        if (this.isSingleValued()) {
            input = this.$reduceBoundInput(input, aRequest);
        }
    }

    //  NOTE that single-valued resolution happens in the $getBoundSTDIO
    //  method so we don't need to deal with it here.

    //  if we're scalar-valued we can't process nodes as values, we need to
    //  convert them into a proper scalar value. the same is true for any
    //  collection of input, we've got to convert it into a collection of
    //  scalar values rather than a collection of more complex objects
    if (this.isScalarValued()) {
        if (TP.isNode(input)) {
            value = TP.val(input);
        } else if (TP.isNodeList(input)) {
            //  since we're scalar-valued we want nodelists to be converted
            //  to arrays of the node "values" in text form
            arr = TP.ac();
            len = input.length;
            for (i = 0; i < len; i++) {
                arr.atPut(i, TP.val(input[i]));
            }
            value = arr;
        } else if (TP.isArray(input)) {
            //  for arrays that aren't nodelists we'll ask for the value via
            //  a more general-purpose routine
            arr = TP.ac();
            len = input.getSize();
            for (i = 0; i < len; i++) {
                arr.atPut(i, TP.val(input.at(i)));
            }
            value = arr;
        } else {
            //  anything else we'll try to convert using our general purpose
            //  value routine, which quite often returns the string value
            value = TP.val(input);
        }
    } else {
        value = input;
    }

    //  NOTE that we don't adjust this value or restrict it based on XML
    //  Schema type information that may be on the binding or element. this
    //  is done for XForms compatibility where even an invalid value will be
    //  returned (the node will simply be flagged as invalid)

    return value;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$getBoundInputDefault',
function() {

    /**
     * @name $getBoundInputDefault
     * @synopsis Returns the value this element considers to be an appropriate
     *     default when a binding doesn't resolve to a non-null value. For
     *     non-UI nodes this is typically null.
     * @returns {Object} An appropriate default value. The type of this object
     *     may vary by control.
     * @todo
     */

    //  default is array for collections since it's a stand-in for nodelist
    return this.isSingleValued() ? null : TP.ac();
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('handleBoundInputChange',
function(aSignal) {

    /**
     * @name handleBoundInputChange
     * @synopsis Responds to notifications of change events affecting a bound
     *     value. This signal is thrown by data under the control of an
     *     xforms:instance (aka xctrls:instance).
     * @param {Change} aSignal The signal which triggered this handler.
     */

    //  TODO:   test to see if this is one we care about...there may be
    //  fine-grained tuning possible.

    this.refresh(aSignal, true);

    return;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$hasObservedBoundInput',
function(aFlag) {

    /**
     * @name $hasObservedBoundInput
     * @synopsis Combined setter/getter for the receiver's "has observed" flag.
     *     This is a private flag used to manage observation of the content
     *     which defines the receiver's bound value.
     * @param {Boolean} aFlag True to flag the receiver as having configured its
     *     observations of bound content.
     * @returns {Boolean} The current flag value.
     */

    if (TP.isDefined(aFlag)) {
        this.$setCachedValue('tsh:in_observed', aFlag);
    }

    return TP.isTrue(this.$getCachedValue('tsh:in_observed', false));
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$observeBoundInput',
function(sourceURI, theContent) {

    /**
     * @name $observeBoundInput
     * @synopsis Sets up observations designed to ensure that the receiver will
     *     be notified of any changes in the bound content which drives its
     *     value.
     * @param {TP.core.URI} sourceURI The URI whose content has been accessed.
     * @param {Object} theContent The content returned from the URI
     *     resolution/access process.
     * @returns {TP.core.ElementNode} The receiver.
     * @todo
     */

    var handler,
        loc,
        len,
        i,
        list;

    //  if we've never gotten our content before now's a good time to set
    //  up our observations. since they're based on position rather than
    //  identity we should be able to do this just once provided that the
    //  source doesn't signal a structure change
    if (!this.$hasObservedBoundInput()) {
        handler = this.handleBoundInputChange.bind(this);

        //  pull the location from our URI minus whatever fragment got us
        //  here. We're going to have to observe the nodes further up the
        //  tree in any case.
        loc = sourceURI.getLocation().split('#').first();

        //  XML makes it somewhat easier since you can always normalize a
        //  node's ID to a URI of the form scheme:...#element(/1/...).
        if (TP.isNodeList(theContent)) {
            len = theContent.length;
            for (i = 0; i < len; i++) {
                //  we've got a list of nodes we're iterating over, but each
                //  one of those has a list of ancestor positions we have to
                //  observe to be fully aware of potential changes...
                list = TP.nodeGetAncestorPositions(theContent[i],
                                                    true,
                                                    loc,
                                                    '_');
            }
        } else if (TP.isElement(theContent)) {
            list = TP.nodeGetAncestorPositions(theContent, true, loc, '_');
        }

        //  if we successfully built up a list of origins go ahead and
        //  create the observation
        if (TP.notEmpty(list)) {
            list.isOriginSet(true);
            this.observe(list, 'ContentChange', handler);
        }

        //  we'll observe the URI itself in all cases
        this.observe(sourceURI, 'ContentChange', handler);

        this.$hasObservedBoundInput(true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$reduceBoundInput',
function(theContent, aRequest) {

    /**
     * @name $reduceBoundInput
     * @synopsis When the receiver isSingleValued this method will return a
     *     single object from a content result set (a nodelist or Array). The
     *     result set must be an ordered collection for this method to operate
     *     correctly. In all other cases the original content object is
     *     returned.
     * @description The supplied request parameter can contain the following
     *     data:
     *
     *     repeatIndex Number An index for the current iteration of a repeat.
     *
     *
     * @param {Object} theContent The original content object.
     * @returns {Object} The original data, or the proper "single object" from
     *     that collection.
     */

    var result,
        len,
        index;

    result = theContent;
    index = TP.ifKeyInvalid(aRequest, 'repeatIndex', 0);

    //  we would have run any XPath with 1-based indexing during the initial
    //  content acquisition phase. if we still got back a nodelist or other
    //  collection we're after the first entry in that list, and it'll be
    //  using 0-based indexing
    if (TP.canInvoke(result, TP.ac('at', 'getSize'))) {
        len = result.getSize();

        //  NB: We use 'native' syntax here as 'result' might be a NodeList
        if (index > len) {
            result = result.at(len - 1);
        } else if (index < 0) {
            result = result.at(0);
        } else {
            result = result.at(index);
        }
    } else if (TP.isArray(result) || TP.isNodeList(result)) {
        len = result.length;

        try {
            if (index > len) {
                result = result[len - 1];
            } else if (index < 0) {
                result = result[0];
            } else {
                result = result[index];
            }
        } catch (e) {
            result = undefined;
        }
    }

    return result;
});

//  ------------------------------------------------------------------------
//  STDOUT
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setBoundOutput',
function(aValue, shouldSignal) {

    /**
     * @name setBoundOutput
     * @synopsis Updates the receiver's bound output value to reflect aValue.
     *     This call is typically invoked by user interface controls whose
     *     values have been changed via user action. The value provided is
     *     almost always a string or array of strings coming from a common HTML
     *     UI control.
     * @param {Object} aValue The value to set for the bound source's aspect
     *     value. Almost always a string being provided from the UI.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.core.ElementNode} The receiver.
     * @todo
     */

    var newval,
        oldval;

    TP.stop('break.bind_stdout');

    //  this method may be triggered automatically by low-level change
    //  handlers so we want to filter out extra work when we're not bound.
    if (!this.isBoundElement(TP.STDOUT)) {
        return this;
    }

    //  for stdout we need to see if we are bidirectional so we don't do
    //  work that's not going to change the target value.
    if (this.isBoundBidi()) {
        newval = aValue;
        oldval = this.getBoundInput();

        if (TP.equal(oldval, newval)) {
            //  no change in storage value relative to UI, we're fine. this
            //  could happen even when the UI is changing if the change is
            //  "normalized" by the binding script.
            return this;
        }
    }

    this.$setBoundSTDIO(TP.STDOUT, aValue, shouldSignal);

    return this;
});

//  ------------------------------------------------------------------------
//  STDERR
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('setBoundError',
function(anError) {

    /**
     * @name setBoundError
     * @param {Object} anError The value to set as the error resource's aspect
     *     value.
     * @returns {TP.core.ElementNode} The receiver.
     */

    TP.stop('break.bind_stderr');

    //  this method may be triggered automatically by low-level change
    //  handlers so we want to filter out extra work when we're not bound.
    if (!this.isBoundElement(TP.STDOUT)) {
        return this;
    }

    return this.$setBoundSTDIO(TP.STDERR, anError, false);
});

//  ------------------------------------------------------------------------
//  REFRESH PROCESSING
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

    TP.stop('break.bind_refresh');

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
                TP.LOG) : 0;

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
//  OBJECT-REFERENCE CACHES
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$clearValueCaches',
function() {

    /**
     * @name $clearValueCaches
     * @synopsis Clears both local instance variables and any cache-related
     *     attributes on the receiver's native element. This helps the
     *     development process by making it easy to reset an element. You won't
     *     normally call this in application code.
     * @returns {TP.core.ElementNode} The receiver.
     */

    //  TODO:   replace with iteration over a list built by the
    //  setCachedValue method and cleared by the clearCachedValue calls so
    //  we don't have to worry about messing up this list

    this.$clearCachedValue('tsh:in_url');
    this.$clearCachedValue('tsh:in_get');

    this.$clearCachedValue('tsh:out_url');
    this.$clearCachedValue('tsh:out_set');

    this.$clearCachedValue('tsh:err_url');
    this.$clearCachedValue('tsh:err_set');

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$clearCachedValue',
function(cacheName) {

    /**
     * @name $clearCachedValue
     * @synopsis Clears any cache for the named slot provided.
     * @param {String} cacheName The attribute/slot name to use.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var node;

    node = this.getNativeNode();
    if (TP.isHTMLNode(node)) {
        try {
            //  doesn't completely delete, but we're not worried about a few
            //  extra nulls here and delete can be very touchy on IE
            node[cacheName.strip(':')] = null;
        } catch (e) {
            node.removeAttribute(cacheName);
        }
    } else {
        node.removeAttribute(cacheName);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$getCachedValue',
function(cacheName, isID, useGOBI) {

    /**
     * @name $getCachedValue
     * @synopsis Returns a cached value from the receiver if possible.
     * @description Due to differences between XML and HTML nodes across
     *     browsers some cached entries can be found directly on the node while
     *     others are found by locating an ID in an attribute and reacquiring
     *     the object by ID.
     * @param {String} cacheName The attribute/slot name to use.
     * @param {Boolean} isID Should the value be considered an ID? If so then an
     *     attempt is made to resolve the ID.
     * @param {Boolean} useGOBI True to use TP.sys.getObjectById as a fallback
     *     for ID lookup. Default is false so IDs are only checked inside the
     *     local document.
     * @returns {Object} The cached value, if any. NOTE that the return value is
     *     often a native element.
     * @todo
     */

    var node,
        isHTML,

        val,
        attr,
        doc;

    node = this.getNativeNode();
    isHTML = TP.isHTMLNode(node);

    //  HTML allows expando properties which are faster than trying to find
    //  things via IDs stored away in attributes
    if (isHTML) {
        if (TP.isValid(val = node[cacheName.strip(':')])) {
            return val;
        }
    }

    if (TP.isEmpty(attr = TP.elementGetAttribute(node, cacheName))) {
        return null;
    }

    //  if the slot doesn't represent an ID value we can skip further lookup
    //  overhead.
    if (TP.notTrue(isID)) {
        //  if the string appears to be true or false then convert to a
        //  Boolean instance.
        if (TP.regex.BOOLEAN_ID.test(attr)) {
            return (attr === 'true');
        }

        return attr;
    }

    //  TP.gid() is usually a full URI so we check with TIBET around object
    //  registrations first when we're allowed by the useGOBI flag.
    if (useGOBI) {
        val = TP.sys.getObjectById(attr, true);
    }

    if (TP.notValid(val)) {
        //  remaining IDs are typically barenames so the next check is for
        //  a document-specific element.
        doc = TP.nodeGetDocument(node);
        val = TP.nodeGetElementById(doc, attr);
    }

    //  XML source documents will have attribute value caches, but once
    //  we push that source into the HTML we can lazily convert those ID
    //  references into direct object references by saving the object
    if (TP.isValid(val) && isHTML) {
        try {
            node[cacheName.strip(':')] = val;
        } catch (e) {
        }
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$setCachedValue',
function(cacheName, cacheValue, cacheID) {

    /**
     * @name $setCachedValue
     * @synopsis Stores a cached value with the receiver if possible. Due to
     *     differences between XML and HTML nodes across browsers some cached
     *     entries can be stored directly on the node while others are stored by
     *     placing an ID in an attribute for later lookup.
     * @param {String} cacheName The attribute/slot name to use.
     * @param {Object} cacheValue The object to cache. Note that when the cache
     *     can only be stored in attribute form the TP.gid() of the object is
     *     cached.
     * @returns {TP.core.ElementNode} The receiver.
     * @todo
     */

    var node;

    node = this.getNativeNode();
    if (TP.isHTMLNode(node)) {
        try {
            node[cacheName.strip(':')] = cacheValue;
        } catch (e) {
            TP.elementSetAttribute(node,
                                    cacheName,
                                    TP.ifEmpty(cacheID,
                                                TP.gid(cacheValue)));
        }
    } else {
        TP.elementSetAttribute(node,
                                cacheName,
                                TP.ifEmpty(cacheID, TP.gid(cacheValue)),
                                true);
    }

    //  TODO:   push the cacheName on a list to clear

    return this;
});

//  ------------------------------------------------------------------------
//  DE-SUGARING / EXPANSION
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('$createBindingCaches',
function(aRequest) {

    /**
     * @name $createBindingCaches
     * @synopsis Populates all bind-related information related to the receiver
     *     in the various bind information cache locations.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     containing parameters.
     * @signals bind-binding-exception
     * @todo
     */

    var val,
        request,
        arr,
        context,
        contexts,
        bind,
        root,
        path,
        parts,
        doc,
        instID,
        inst,
        sourceID,
        source,
        modelID,
        model,
        delimiter,
        len,
        i,
        ctx,
        contextCached;

    //  skip unless the request's refresh flag is true
    if (TP.notEmpty(val = this.$getCachedObject('bind:cached', false))) {
        //  cached...but request can override via refresh flag
        if (TP.isTrue(val)) {
            if (TP.ifKeyInvalid(aRequest, 'refresh', false)) {
                this.$clearValueCaches(aRequest);
            } else {
                return;
            }
        }
    }

    if (!this.isBoundElement()) {
        return;
    }

    request = TP.request(aRequest);

    //  we set the delimiter to TP.JOIN and then replace that the first time
    //  through getBoundGet(). This allows us to defer determining the
    //  actual type of data (and therefore the delimiter) until the actual
    //  data is to be referenced for updating purposes.
    delimiter = TP.JOIN;

    //  ---
    //  traversal
    //  ---

    //  work upward, stopping at each context level to see if we've got an
    //  absolute path or a source reference. the first one of either will
    //  terminate the traversal

    //  we'll keep "get path" parts in an array and join at the end
    arr = TP.ac();

    //  track the contexts we followed to get our data
    contexts = TP.ac();

    context = this;
    while (context) {
        //  each viable context is added to the list we've made use of. NOTE
        //  that the "initial element" is the first entry in the list
        contexts.push(context);

        //  any element that has a bind reference on it (other than a bind
        //  itself due to a TIBET extension to avoid nesting requirements)
        //  can't provide data since the bind overrides any local values. as
        //  a result we update the context to reference the bind
        if (!context.isBinding() && TP.isValid(bind = context.getBinding())) {
            context = bind;
            continue;
        }

        //  if the get path has already been cached at this level then the
        //  rest of the data has been as well
        path = context.$getCachedObject('bind:boundget', false);
        if (TP.notEmpty(path)) {
            //  apparently the context has been processed before which means
            //  we can leverage all of it's cache information
            instID = context.$getCachedObject('bind:instanceid', false);
            inst = context.$getCachedObject('bind:boundinstance',
                                                true, true);

            modelID = context.$getCachedObject('bind:modelid', false);
            model = context.$getCachedObject('bind:boundmodel',
                                                true, true);

            sourceID = context.$getCachedObject('bind:sourceid', false);
            source = context.$getCachedObject('bind:boundsource',
                                                true, true);

            arr.unshift(path);

            //  flag that we found the data we want so we don't recompute
            contextCached = true;

            break;
        }

        if (context.hasAttribute('bind:get', true)) {
            //  if the context has a get attribute, that implies at least
            //  part of the path
            path = context.getAttribute('bind:get', true);

            //  when the path starts off with instance('blah') that instance
            //  is the source, and the remaining portion of the path is our
            //  entire get path...we've reached the end of the search
            if (TP.regex.BOUND_INSTANCE.test(path)) {
                //  run again, but with match this time so we can pull
                //  apart
                parts = path.match(TP.regex.BOUND_INSTANCE);

                //  update the path to remove the instance(blah)/ portion
                //  and place it on the front of our list of path parts
                path = parts.at(2);
                arr.unshift(path);

                //  now we want to take advantage of our knowledge about
                //  the source (the explicit instance) to cache the source
                //  as well

                //  be sure to remove quotes so we have just the ID value
                instID = parts.at(1).unquoted();

                break;
            } else {
                arr.unshift(path);

                if (context.hasAttribute('bind:source', true)) {
                    //  while we're here we may as well capture the source
                    sourceID = context.getAttribute('bind:source', true);

                    break;
                } else if (context.hasAttribute('bind:model', true)) {
                    //  XForms can define a model which implies the model's
                    //  first instance in the absence of a specific instance
                    modelID = context.getAttribute('bind:model', true);

                    break;
                } else if (path.startsWith('/')) {
                    //  XForms states that paths beginning with / are
                    //  absolute paths and are independent of the context
                    //  node, meaning they target the in-scope instance. We
                    //  won't go quite that far, we'll say they target the
                    //  in-scope "source" whatever that might be for this
                    //  node...
                    if (context.isBinding()) {
                        model = context.getNativeNode().parentNode;
                        if (TP.qname(model) !== 'xctrls:model') {
                            TP.ifWarn() ?
                                TP.warn(
                                    TP.boot.$annotate(
                                        this,
                                        'bind-binding-exception: Unable' +
                                        ' to find model.'),
                                    TP.LOG) : 0;

                            this.dispatch('bind-binding-exception',
                                            this.getNativeNode());

                            return;
                        }
                        modelID = TP.lid(model, true);
                    } else {
                        instID = TP.DEFAULT_INSTANCE;
                    }

                    break;
                } else {
                    //  non-terminal path, drop through and update context
                    //  so we keep looping upward. presumably we'll
                    //  terminate at either an absolute path or a source...
                }
            }
        } else {
            //  edge case here is that we may have a local source, but no
            //  get, meaning we want to use '' as our get. If we don't have
            //  a local source then our get path is questionable since we
            //  don't appear to be bound from a getter perspective
            if (context.hasAttribute('bind:source', true)) {
                //  while we're here we may as well capture the source
                sourceID = context.getAttribute('bind:source', true);

                //  in the absence of a get path we presume the entire
                //  source...but if there are already aspects of the path in
                //  our path array that's not really going to happen
                break;
            } else if (context.hasAttribute('bind:model', true)) {
                //  XForms can define a model which implies the model's
                //  first instance in the absence of a specific instance
                modelID = context.getAttribute('bind:model', true);

                //  in the absence of a get path we presume the entire
                //  source...but if there are already aspects of the path in
                //  our path array that's not really going to happen
                break;
            } else {
                //  no local source, no local get? not bound for get.
                //  question then is how'd we get here since we had to get
                //  past the isBound test...must have a bind:info reference
                //  so we'll fall through and let the next context element
                //  provide more information
            }
        }

        context = context.getBoundContext();
    }

    //  common loop length for context list iterations below
    len = contexts.getSize();

    //  if we ran until we couldn't find a context then the 'last context'
    //  is the one that provides our final information. if we broke out of
    //  the loop early the context in force at the time will be preserved
    context = context || contexts.last();

    //  if we found a cached object in our context search then we can copy
    //  that data now and be done with it
    if (contextCached) {
        path = arr.join(delimiter) || this.$getBoundGetDefault();
        this.$setCachedObject('bind:boundget', path);

        //  from the originating element up to the object which cached data
        //  we want to fill in any gaps with cache information
        for (i = 0; i < len; i++) {
            ctx = contexts.at(i);

            ctx.$setCachedObject('bind:instanceid', instID);
            ctx.$setCachedObject('bind:boundinstance', inst, instID);
            ctx.$setCachedObject('bind:modelid', modelID);
            ctx.$setCachedObject('bind:boundmodel', model, modelID);
            ctx.$setCachedObject('bind:sourceid', sourceID);
            ctx.$setCachedObject('bind:boundsource', source, sourceID);
        }

        //  update the request as well so it can also serve data
        request.atPut('boundGet', path);
        request.atPut('boundSource', source);

        return;
    }

    //  ---
    //  caching
    //  ---

    //  using the context and any IDs we found during our traversal, build
    //  the various cache entries that will help keep overhead minimized

    //  if we found either an instance ID or a source ID then we have an
    //  explicit data source, otherwise we may have an implied data source
    //  if we have an XForms model specification
    if (TP.isEmpty(instID) && TP.isEmpty(sourceID)) {
        //  model id implies first instance in that model
        if (TP.notEmpty(modelID)) {
            //  may have found model node first, then acquired ID, so don't
            //  waste time in that case
            if (TP.notValid(model)) {
                //  XForms requires local document for instance content
                doc = TP.ifKeyInvalid(request, 'nativeDocument',
                                            this.getNativeDocument());
                request.atPutIfAbsent('nativeDocument', doc);
                model = TP.nodeGetElementById(doc, modelID, false);
            }

            //  still no model node? that's a binding exception at this
            //  point
            if (TP.notValid(model)) {
                TP.ifWarn() ?
                    TP.warn(TP.boot.$annotate(
                                this,
                                'bind-binding-exception: Unable to' +
                                ' find model ' +
                                modelID),
                            TP.LOG) : 0;

                this.dispatch('bind-binding-exception',
                                this.getNativeNode());

                return;
            }

            //  found the model, the instance we want is the first instance
            //  in that model
            inst = TP.nodeDetectChildNode(
                model,
                function(elem) {

                    return TP.qname(elem) === 'xctrls:instance';
                });

            if (TP.notValid(inst)) {
                //  LAZY AUTHORING RULE...BUILD IT
                //  TODO:
                return;
            } else {
                //  if the instance doesn't have a local ID then give it one
                //  and remember it
                instID = TP.lid(inst, true);
            }
        } else {
            //  no instance, no source, no model? then we're talking about
            //  the default instance...the first one in the document unless
            //  our context is a bind in which case its' the model
            //  containing that bind
            if (context.isBinding()) {
                model = context.getNativeNode().parentNode;

                if (TP.qname(model) !== 'xctrls:model') {
                    TP.ifWarn() ?
                        TP.warn(TP.boot.$annotate(
                                    this,
                                    'bind-binding-exception: Unable to' +
                                    ' find model ' +
                                    modelID),
                                TP.LOG) : 0;

                    this.dispatch('bind-binding-exception',
                                    this.getNativeNode());

                    return;
                }

                modelID = TP.lid(model, true);

                //  found the model, the instance we want is the first
                //  instance in that model
                inst = TP.nodeDetectChildNode(
                    model,
                    function(elem) {

                        return TP.qname(elem) === 'xctrls:instance';
                    });

                if (TP.notValid(inst)) {
                    //  LAZY AUTHORING RULE...BUILD IT
                    //  TODO:
                    return;
                } else {
                    //  if the instance doesn't have a local ID then give it
                    //  one and remember it
                    instID = TP.lid(inst, true);
                }
            } else {
                instID = TP.DEFAULT_INSTANCE;
            }
        }
    }

    //  if we tripped over an instance ID along the way cache it now :)
    if (TP.notEmpty(instID)) {
        //  if the instance ID we're looking at is the default instance
        //  marker then we have to resolve that to a concrete ID
        if (instID === TP.DEFAULT_INSTANCE) {
            doc = TP.ifKeyInvalid(request,
                            'nativeDocument',
                            this.getNativeDocument());

            request.atPutIfAbsent('nativeDocument', doc);

            //  first instance in the first model...aka the first instance
            //  in the document. if the node has been processed this will be
            //  in the body, otherwise it should be in the head
            if (TP.nodeHasReachedPhase(doc, 'Compile')) {
                root = TP.nodeGetElementsByTagName(doc, 'body').at(0);
            } else {
                root = TP.nodeGetElementsByTagName(doc, 'head').at(0);
            }

            model = TP.nodeDetectChildNode(
                root,
                function(elem) {

                    return TP.qname(elem) === 'xctrls:model';
                });

            if (TP.notValid(model)) {
                TP.ifWarn() ?
                    TP.warn(TP.boot.$annotate(
                                this,
                                'bind-binding-exception: Unable to' +
                                ' find model ' +
                                modelID),
                            TP.LOG) : 0;

                this.dispatch('bind-binding-exception',
                                this.getNativeNode());

                return;
            } else {
                modelID = TP.lid(model, true);
            }

            inst = TP.nodeDetectChildNode(
                model,
                function(elem) {

                    return TP.qname(elem) === 'xctrls:instance';
                });

            if (TP.notValid(inst)) {
                //  LAZY AUTHORING RULE...BUILD IT
                //  TODO:
                return;
            } else {
                //  if the instance doesn't have a local ID then give it
                //  one and remember it
                instID = TP.lid(inst, true);
            }
        }

        for (i = 0; i < len; i++) {
            contexts.at(i).$setCachedObject('bind:instanceid', instID);
        }

        //  if we worked from a modelID above we'll have the instance node,
        //  otherwise we'll need to track it down in the document via ID
        if (TP.notValid(inst)) {
            doc = TP.ifKeyInvalid(request,
                            'nativeDocument',
                            this.getNativeDocument());

            request.atPutIfAbsent('nativeDocument', doc);
            inst = TP.nodeGetElementById(doc, instID, false);
        }

        if (TP.notValid(inst)) {
            //  LAZY AUTHORING RULE...BUILD IT
            //  TODO:
            return;
        } else {
            if (TP.notValid(model)) {
                //  instances live inside their model elements, at least in
                //  conforming XForms, so the parent node is the model.
                //  cache it for XForms usage...the model is often an event
                //  "target"
                model = inst.parentNode;
            }
            model = 'xctrls:model'.asType().construct(model);

            if (TP.isValid(model)) {
                modelID = modelID || TP.lid(model, true);

                for (i = 0; i < len; i++) {
                    ctx = contexts.at(i);
                    ctx.$setCachedObject('bind:modelid', modelID);
                    ctx.$setCachedObject('bind:boundmodel', model, modelID);
                }
            }

            //  now construct and store the instance as our actual source
            inst = 'xctrls:instance'.asType().construct(inst);
            if (TP.isValid(inst)) {
                instID = instID || TP.lid(inst, true);
                for (i = 0; i < len; i++) {
                    ctx = contexts.at(i);

                    ctx.$setCachedObject('bind:sourceid', instID);
                    ctx.$setCachedObject('bind:boundsource', inst, instID);

                    ctx.$setCachedObject('bind:instanceid', instID);
                    ctx.$setCachedObject('bind:boundinstance', inst, instID);
                }
            }
        }
    } else if (TP.notEmpty(sourceID)) {
        doc = TP.ifKeyInvalid(request, 'nativeDocument',
            this.getNativeDocument());
        request.atPutIfAbsent('nativeDocument', doc);
        source = TP.nodeGetElementById(doc, sourceID, false);

        //  source IDs don't have to refer to the local document but it's
        //  typically that or a full URI
        if (TP.isValid(source)) {
            source = TP.wrap(source);
        } else {
            source = TP.uc(sourceID);
            if (TP.notValid(source)) {
                source = TP.sys.getObjectById(sourceID, true);
            }
        }

        for (i = 0; i < len; i++) {
            ctx = contexts.at(i);
            ctx.$setCachedObject('bind:sourceid', sourceID);
            ctx.$setCachedObject('bind:boundsource', source, sourceID);
        }
    }

    path = arr.join(delimiter) || this.$getBoundGetDefault();
    this.$setCachedObject('bind:boundget', path);

    //  update the request as well so it can also serve data
    request.atPut('boundGet', path);
    request.atPut('boundSource', source);

    for (i = 0; i < len; i++) {
        contexts.at(i).$setCachedObject('bind:cached', true);
    }

    return path;
});

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
//  end
//  ========================================================================
