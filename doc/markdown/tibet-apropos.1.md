{{topic}}({{section}}) -- list objects/methods related to one or more terms
=============================================

## SYNOPSIS

`tibet apropros <terms> [--comments] [--limit=N] [--ignorecase]`

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

  * `--ignorecase` :
    Use a case-insensitive search. Searches are normally case-insensitive to
improve the chances you will find appropriate suggestions in the result list.
You can use `--no-ignorecase` as an alternative to using `false` here.

  * `--limit` :
    Set a minimum match count for success. Items which don't match the search
term at least `--limit` number of times will be discarded. The default value is
2.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Search for methods whose name matches a regular expression:

    $ tibet apropos '/nodeGetFirst/'

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

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

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    # by name
    #
    TP.elementSetClipRect
    TP.elementGetClipRect

### Search with case-sensitivity:

    $ tibet apropos clip --no-ignorecase

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    # by name
    #

### Expand the case-insensitive search to include method comment text:

    $ tibet apropos clip --comments

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

    # by name
    #
    TP.elementSetClipRect (8)
    TP.elementGetClipRect (7)
    #
    # by comment
    #

### Expand that search to include method comments and lower match counts:

    $ tibet apropos clip --comments --limit 1

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms

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

### Reflect on a resulting method directly:

    $ tibet reflect TP.elementGetClipRect

    # Loading TIBET platform at 2019-08-03T17:11:29.832Z
    # TIBET reflection suite loaded and active in 5981ms

    TP.elementGetClipRect

    function elementGetClipRect(anElement)

    /**
     * @method elementGetClipRect
     * @summary Returns the element's clipping rectangle.
     * @description The clipping rectangle is assumed to be in pixels (something
     *     like 'rect(10px 10px 10px 10px)'). If the clipping rectangle is not a
     *     '4 valued' value, null is returned. Each individual value is
     *     processed and turned from its current value into pixels (i.e. the
     *     value might be '4em' - this is converted into pixels). If the value
     *     is 'auto', a null is placed into that position in the Array.
     * @param {HTMLElement} anElement The element to extract the clipping
     *     rectangle from.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidStyleDeclaration
     * @returns {Number[]} An Array of Numbers containing the element's clipping
     *     rectangle *expressed in number of pixels*. The numbers are arranged
     *     in the following order: top, right, bottom, left.
     */

    ./public/TIBET-INF/tibet/src/tibet/kernel/TIBETDHTMLPrimitivesPost.js

## TIBET SHELL

This command invokes the client-side `:apropos` command, passing all flags and
command line arguments to that command for processing.

Command invocation is done via the `tibet tsh` command machinery, which is
inherited by this command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-reflect(1)
  * tibet-tsh(1)

