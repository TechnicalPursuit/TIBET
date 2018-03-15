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
 * @type {TP.sherpa.statusbar}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('statusbar');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.statusbar.Inst.defineAttribute('statusbarValue',
    TP.cpc('> .value', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.statusbar.Inst.defineMethod('getContent',
function(aRequest) {

    /**
     * @method getContent
     * @summary Returns the receiver's content.
     * @param {TP.sig.Request|TP.core.Hash} aRequest Optional control
     *     parameters.
     * @returns {String} The text content of the native node.
     */

    return this.get('statusbarValue').getContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.sherpa.statusbar.Inst.defineMethod('setContent',
function(newContent, aRequest, stdinContent) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM statusbarerpart to
     *     the content supplied.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @param {Object} stdinContent Content to set as the 'stdin' when executing
     *     the supplied content. Note that if this parameter is supplied, the
     *     content is 'executed', as well as processed, by the shell.
     * @returns {TP.dom.Node} The result of setting the content of the
     *     receiver.
     */

    return this.get('statusbarValue').setContent(
                                    newContent, aRequest, stdinContent);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
