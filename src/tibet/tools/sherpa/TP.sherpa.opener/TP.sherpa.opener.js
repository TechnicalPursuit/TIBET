//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.sherpa.opener}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('opener');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.opener.Type.defineMethod('tagCompile',
function(aRequest) {

    var elem,
        newElem;

    //  Get the initiating element.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    TP.elementSetAttribute(elem, 'on:click', 'Toggle', true);

    newElem = TP.xhtmlnode('<span class="icon" title="' +
                            TP.elementGetAttribute(elem, 'title', true) +
                            '"/>');

    TP.nodeAppendChild(elem, newElem, false);

    return elem;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
