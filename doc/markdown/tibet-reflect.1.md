{{topic}}({{section}}) -- reflects on TIBET objects and methods
=============================================

## SYNOPSIS

tibet reflect [target] [--interface <interface>]
    [--filter <filter>] [--types] [--methods] [--owners] [--slots]

## DESCRIPTION

Runs the TSH :reflect command to show object or system reflection data.

You can list all of TIBET's types via `tibet reflect --types` or list all
methods via `tibet reflect --methods`. You can combine these flags along
with --slots to create collections of results. Without a target object this
approach lets you view a wide range of content from the TIBET system.

The [target] parameter can be any object reference TIBET can resolve
using TIBET's getObjectById() function. That means any namespace, type,
method, or publicly registed object such as window or a TIBET URI.

For objects which support it the --interface option lets you restrict
the results to a specific interface of the object. The values here must
be found in the TP.SLOT\_FILTERS object as used by TP.interface(). Some
interesting options are `known`, `public`, and `unique`.

Note that not all flags will work for every target object type. Namespace
objects don't support --owners for example. When a flag is ignored it is
not typically reported since working combinations are so target-dependant.
The best thing to do is experiment a little and see what reflect finds.

The --filter option allows you to refine your result data by checking the
keys returned against either a regular expression or string. The filter value
is always used as a RegExp if one can be created from the string. Full RegExp
syntax is possible to the extent your shell will allow it. For example, using
`--filter '/example/i'` will filter for example in a case-insensitive fashion.

## OPTIONS

  * `target` :
    An optional target, usually a type name, to check.

  * `--filter` :
    An optional regular expression, expressed in /foo/ig form. This filter will
be applied to fully-qualified method names.

  * `--interface` :
    An interface value from the `TP.SLOT_FILTERS` list in TIBET.

  * `--methods` :
    Signify that the search should work against methods. This can list all
methods (or a subset by combining with `--filter`) or just the methods of a
particular target.

  * `--owners` :
    Signify the search should produce owners. This flag is primarily useful only
when reflecting on a function. In that case it should return a list of the
owners (implementers) of the function. You can also use this flag alone to list
all known `owners` of methods in the system.

  * `--slots` :
    Focus the search on attributes if no other flags are provided. Otherwise
focus on all keys on the target object, not just methods etc.

  * `--types` :
    Normally used to list all types, or to filter types in conjunction with the
`--filter` option.

## EXAMPLES

### List all types in the system

    $ tibet reflect --types

    Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 15:14:36 MDT
    TIBET loaded in 3867 ms. Starting execution.
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

    Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 15:14:36 MDT
    TIBET loaded in 3867 ms. Starting execution.
    APP.hello.Application
    APP.hello.app

    Finished in 3762 ms w/TSH exec time of 201 ms.

### List all methods in the system

    $ tibet reflect --methods

    TIBET loaded in 3632 ms. Starting execution.
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

    Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 15:13:25 MDT
    TIBET loaded in 3597 ms. Starting execution.
    TP.Primitive.$$elementPreserveIFrameContent
    TP.Primitive.$$elementRestoreIFrameContent
    TP.Primitive.$elementCSSFlush
    TP.Primitive.$elementGetBusyLayer
    TP.Primitive.$elementGetOffsetParent
    ...
    ...
    TP.xctrls.SwitchableElement.Inst.setDisplayValue
    TP.xctrls.SwitchableElement.Inst.setValue
    TP.xmpp.Error.Inst.getErrorElement
    TP.xmpp.Node.Inst.getErrorElement
    TP.xs.XMLSchemaComplexCompositeType.Type.validateElements

### List all methods For a specific target

    $ tibet reflect --methods TP.log.Manager.Type

    Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 15:11:37 MDT
    TIBET loaded in 3560 ms. Starting execution.
    exists
    getLogger
    getLoggerFactory
    getLoggers
    getRootLogger
    initialize
    registerLogger
    removeLogger

    Finished in 3630 ms w/TSH exec time of 70 ms.


## SEE ALSO

  * apropos(1)
  * help(1)
