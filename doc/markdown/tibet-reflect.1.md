{{topic}}({{section}}) -- reflects on TIBET objects and methods
=============================================

## SYNOPSIS

`tibet reflect [[--target] <target>] [--filter <filter>]
    [--owners] [--types] [--subtypes] [--methods] [--attributes]
    [--known] [--hidden]
    [--unique] [--inherited] [--introduced] [--local] [--overridden]
    [--context=['app'|'lib'|'all']] [--interface <interface>]
    [--verbose]`

## DESCRIPTION

Runs the TSH :reflect command to show object or system reflection data.

You can list all of TIBET's types via `tibet reflect --types` or list all
methods via `tibet reflect --methods`. Without a target object this
approach lets you view the top-most metadata collections in TIBET.

The [target] parameter can be any object reference TIBET can resolve
using TIBET's getObjectById() function. That means any namespace, type,
method, or publicly registed object such as window or a TIBET URI.

For objects which support it the --interface option lets you restrict
the results to a specific interface of the object. The values here must
be found in the TP.SLOT\_FILTERS object as used by TP.interface(). Some
interesting options are `known`, `public`, and `unique` which have their own
flags to help you set your intention clearly.

Note that not all flags will work for every target object type. Namespace
objects don't support --owners for example. When a flag is ignored it is
not typically reported since working combinations are so target-dependant.
The best thing to do is experiment a little and see what reflect finds. The
`getInterface` call in TIBET is ultimately the routine being invoked so see the
documentation on that method for more.

The --filter option allows you to refine your result data by checking the
keys returned against either a regular expression or string. The filter value
is always used as a RegExp if one can be created from the string. Full RegExp
syntax is possible to the extent your shell will allow it. For example, using
`--filter '/example/i'` will filter for example in a case-insensitive fashion.

## OPTIONS

  * `target` :
    An optional target, usually a type name, to check.

  * `--target` :
    An alternate way to provide the target, usually a type name, to check.

  * `--attributes` :
    Signify that the search should work against attributes. This can list all
attributes (or a subset by combining with `--filter`) or just the attributes of
a particular target.

  * `--context` :

  * `--filter` :
    An optional regular expression, expressed in /foo/ig form. This filter will
be applied to fully-qualified method names.

  * `--known` :

    Filter only slots that are known (see the TIBET Inheritance system).

  * `--hidden` :

    Filter for slots that are hidden (see the TIBET Inheritance system).

  * `--unique` :

    Filter for slots that are unique (see the TIBET Inheritance system).

  * `--inherited` :

    Filter for slots that are inherited (see the TIBET Inheritance system).

  * `--introduced` :

    Filter for slots that are introduced (see the TIBET Inheritance system).

  * `--local` :

    Filter for slots that are local (see the TIBET Inheritance system).

  * `--overridden` :

    Filter for slots that are overridden (see the TIBET Inheritance system).

  * `--interface` :
    An interface value from the `TP.SLOT_FILTERS` list in TIBET. Note that not
all combinations make sense. Experiment to get familiar with these.

  * `--methods` :
    Signify that the search should work against methods. This can list all
methods (or a subset by combining with `--filter`) or just the methods of a
particular target.

  * `--owners` :
    Signify the search should produce owners. This flag is primarily useful only
when reflecting on a function. In that case it should return a list of the
owners (implementers) of the function. You can also use this flag alone to list
all known `owners` of methods in the system.

  * `--types` :
    Normally used to list all types, or to filter types in conjunction with the
`--filter` option.

  * `--types` :
    List all subtypes of the target. This will list *all* subtypes, recursively.

  * `--verbose` :
    Whether or not to log the script that has been generated to feed to the
reflection machinery.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### List all types in the system

    $ tibet reflect --types

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    APP.hello.Application
    APP.hello.app
    Array
    ArrayBuffer
    ArrayBufferView
    Attr
    ...
    ...
    XPathException
    XPathExpression
    XPathResult
    XSLTProcessor

### List all types in the APP namespace

    $ tibet reflect --types --filter /APP/

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    APP.hello.Application
    APP.hello.app

    Finished in 3762 ms w/TSH exec time of 201 ms.

### List all methods in the system

    $ tibet reflect --methods

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    APP.hello.Application.Inst.handleAppDidInitializeFromANYWhenANY
    Array.Inst.$$isCollection
    Array.Inst.$$isMemberOf
    Array.Inst.$$isPair
    Array.Inst.$get
    Array.Inst.$getEqualityValue
    Array.Inst.$set
    Array.Inst.$sortIfNeeded
    Array.Inst.add
    Array.Inst.addAfter
    Array.Inst.addAll
    Array.Inst.addAllAfter
    ...
    ...
    Window.Inst.getTypeName
    Window.Inst.setID
    Window.Type.getName

### List all methods that include 'element' in their names

    $ tibet reflect --methods --filter /element/i

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    TP.$$elementPreserveIFrameContent
    TP.$$elementRestoreIFrameContent
    TP.$elementCSSFlush
    TP.$elementGetBusyLayer
    TP.$elementGetOffsetParent
    ...
    ...
    TP.xctrls.SwitchableElement.Inst.setDisplayValue
    TP.xctrls.SwitchableElement.Inst.setValue
    TP.xmpp.Error.Inst.getErrorElement
    TP.xmpp.Node.Inst.getErrorElement
    TP.xs.XMLSchemaComplexCompositeType.Type.validateElements

### List all methods For a specific target

    $ tibet reflect --methods TP.log.Manager.Type

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    exists
    getLogger
    getLoggerFactory
    getLoggers
    getRootLogger
    initialize
    registerLogger
    removeLogger

    Finished in 3630 ms w/TSH exec time of 70 ms.

### View reflection data for a specific method

    $ tibet reflect TP.log.Manager.Type.getLoggers

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    TP.log.Manager.Type.getLoggers

    /**
     * @method getLoggers
     * @summary Returns the dictionary of all known loggers. The keys of this
     *     dictionary are the logger names converted to lowercase to normalize
     *     them. The entries are the logger instances themselves.
     * @returns {TP.core.Hash} The logger dictionary.
     */

    ~lib_src/tibet/kernel/TIBETLogging.js

### View reflection data for a TIBET Primitive

    $ tibet reflect json2xml

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    TP.json2xml

    /**
     * @method json2xml
     * @summary Transforms a JSON-formatted string into roughly equivalent XML.
     * @description The transformation is in two steps, first to JS and then
     *     into simple XML where keys are element names and values are content
     *     text nodes.
     * @param {String} aString A JSON-formatted string.
     * @returns {Node} An XML node representing the same data structures found
     *     in the JSON string.
     */

    ~lib_src/tibet/kernel/TIBETContentPrimitives.js

## TROUBLESHOOTING

### You may need to escape certain values for your shell

    $ tibet reflect TP.boot.$uitime

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    TP.boot. not found.

    Finished in 4304 ms w/TSH exec time of 68 ms.

    $ tibet reflect 'TP.boot.$uitime'

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    "2016-07-02T04:09:25.148Z"

## TIBET SHELL

This command marshals arguments which it then passes to the client-side
`:reflect` command. That command invokes TIBET's getInterface mechanisms to
reflect on the various aspects of the system you've requested.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-apropos(1)
  * tibet-help(1)
