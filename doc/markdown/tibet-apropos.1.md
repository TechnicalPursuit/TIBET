{{topic}}({{section}}) -- list objects/methods related to one or more terms
=============================================

## SYNOPSIS

    tibet apropros <terms> [--comments] [--limit=N] [--no-ignorecase]

## DESCRIPTION

Runs the TSH `:apropos` command to find methods related to one or more topics.

This is a good command to use when you know what you'd like to do conceptually
but are unsure of what options TIBET may offer to support your goals.

By default this command searches method names for matches to search terms.
The terms provided can be simple strings or JavaScript-style RegExp literals.
When you provide more than one term the terms are combined using `and` semantics
meaning that all terms must match a result for it to be presented. You can use
RegExp literal syntax with vertical bars (|) to create `or` conditions.

## OPTIONS

  * `terms` :
    A space-separated list of separate terms to match. Each term can be either a
simple string or a JavaScript RegExp literal.

  * `--comments` :
    Search comment text in addition to the method name. This will greatly expand
the set of returned values depending on the term in question.

  * `--limit` :
    Set a minimum match count for success. Items which don't match the search
term at least `--limit` number of times will be discarded. The default value is
2.

  * `--no-ignorecase` :
    Use a case-sensitive search. Searches are normally case-insensitive to
improve the chances you will find appropriate suggestions in the result list.

## EXAMPLES

### Search for methods whose name matches a regular expression:

    $ tibet apropos '/nodeGetFirst/'

    Loading TIBET via PhantomJS 2.0.0 at September 26, 2015 at 11:14:56 MDT
    TIBET loaded in 3516 ms. Starting execution.
    - by name

    TP_Primitive_nodeGetFirstAncestorByAttribute
    TP_Primitive_nodeGetFirstAncestorByTagName
    TP_Primitive_nodeGetFirstChildByType
    TP_Primitive_nodeGetFirstChildContentNode
    TP_Primitive_nodeGetFirstChildElement
    TP_Primitive_nodeGetFirstDescendantByType
    TP_Primitive_nodeGetFirstElementByAttribute
    TP_Primitive_nodeGetFirstElementByTagName
    TP_Primitive_nodeGetFirstElementChildByAttribute
    TP_Primitive_nodeGetFirstElementChildByTagName
    TP_Primitive_nodeGetFirstSiblingElement

### Search for methods whose name includes a particular string:

    $ tibet apropos clip

    Loading TIBET via PhantomJS 2.0.0 at September 26, 2015 at 11:14:56 MDT
    TIBET loaded in 3516 ms. Starting execution.
    - by name

    TP_Primitive_elementSetClipRect (8)
    TP_Primitive_elementGetClipRect (7)

### Expand that search to include method comment text:

    $ tibet apropos clip --comments --limit 1

    Loading TIBET via PhantomJS 2.0.0 at September 26, 2015 at 11:14:56 MDT
    TIBET loaded in 3516 ms. Starting execution.
    - by name

    TP_Primitive_elementSetClipRect (8)
    TP_Primitive_elementGetClipRect (7)

    - by comment

### Expand that search to include method comments and only 1 match:

    $ tibet apropos clip --comments --limit 1

    Loading TIBET via PhantomJS 2.0.0 at September 26, 2015 at 11:14:56 MDT
    TIBET loaded in 3516 ms. Starting execution.
    - by name

    TP_Primitive_elementSetClipRect (8)
    TP_Primitive_elementGetClipRect (7)

    - by comment

    TP.core.MultiTransition_Inst_step (1)
    TP.xctrls.clipbox_Inst_setDisplayValue (1)
    TP_Primitive_elementWrapToContent (1)

## ENVIRONMENT

## SEE ALSO

  * reflect(1)
