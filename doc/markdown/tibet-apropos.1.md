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

Output from this command is produced in a format compatible with copy/paste into
a `tibet reflect` command to explore individual entries more deeply.

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

    # by name
    #
    TP.nodeGetFirstAncestorByAttribute
    TP.nodeGetFirstAncestorByTagName
    TP.nodeGetFirstChildByType
    TP.nodeGetFirstChildContentNode
    TP.nodeGetFirstChildElement
    TP.nodeGetFirstDescendantByType
    TP.nodeGetFirstElementByAttribute
    TP.nodeGetFirstElementByTagName
    TP.nodeGetFirstElementChildByAttribute
    TP.nodeGetFirstElementChildByTagName
    TP.nodeGetFirstSiblingElement

### Search for methods whose name includes a particular string:

    $ tibet apropos clip

    Loading TIBET via PhantomJS 2.0.0 at September 26, 2015 at 11:14:56 MDT
    TIBET loaded in 3516 ms. Starting execution.

    # by name
    #
    TP.elementSetClipRect
    TP.elementGetClipRect

### Expand that search to include method comment text:

    $ tibet apropos clip --comments

    Loading TIBET via PhantomJS 2.0.0 at September 26, 2015 at 11:14:56 MDT
    TIBET loaded in 3516 ms. Starting execution.

    # by name
    #
    TP.elementSetClipRect (8)
    TP.elementGetClipRect (7)
    #
    # by comment
    #

### Expand that search to include method comments and only 1 match:

    $ tibet apropos clip --comments --limit 1

    Loading TIBET via PhantomJS 2.0.0 at September 26, 2015 at 11:14:56 MDT
    TIBET loaded in 3516 ms. Starting execution.

    # by name
    #
    TP.elementSetClipRect (8)
    TP.elementGetClipRect (7)
    #
    # by comment
    #
    TP.gui.MultiTransition.Inst.step (1)
    TP.xctrls.clipbox.Inst.setDisplayValue (1)
    TP.elementWrapToContent (1)

### Reflect on one of the result items

    $ tibet reflect TP.elementSetClipRect

    Loading TIBET via PhantomJS 2.1.1 at July 1, 2016 at 20:16:59 MDT
    TIBET loaded in 3852 ms. Starting execution.

    TP.elementSetClipRect

    /**
     * @method elementSetClipRect
     * @summary Sets the element's clipping rectangle.
     * @description If a Number is supplied to top, right, bottom or left, a
     *     default unit of 'px' is assumed.
     * @param {HTMLElement} anElement The element to set the clip rect on.
     * @param {Number|String} top The value to set the top coordinate of the
     *     element's clipping rectangle to.
     * @param {Number|String} right The value to set the right coordinate of the
     *     element's clipping rectangle to.
     * @param {Number|String} bottom The value to set the bottom coordinate of
     *     the element's clipping rectangle to.
     * @param {Number|String} left The value to set the left coordinate of the
     *     element's clipping rectangle to.
     * @exception TP.sig.InvalidElement
     */

    ~lib_src/tibet/kernel/TIBETDHTMLPrimitivesPost.js


## SEE ALSO

  * tibet-reflect(1)
