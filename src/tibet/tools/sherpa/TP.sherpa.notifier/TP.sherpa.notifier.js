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
 * @type {TP.sherpa.notifier}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('notifier');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.notifier.Inst.defineAttribute(
    'contentArea',
    {
        value: TP.cpc('> .content', TP.hc('shouldCollapse', true))
    });

//  ------------------------------------------------------------------------

TP.sherpa.notifier.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the value supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {null}
     */

    var elem;

    this.get('contentArea').setContent(aContentObject, aRequest);

    this.setAttribute('active', true);

    elem = this.getNativeNode();
    TP.elementGetStyleObj(elem).display = 'block';

    (function() {

        var msgFinishFunc;

        (msgFinishFunc = function() {
            msgFinishFunc.ignore(elem, 'TP.sig.DOMTransitionEnd');
            TP.elementGetStyleObj(elem).display = '';
        }).observe(elem, 'TP.sig.DOMTransitionEnd');

        this.setAttribute('active', false);

    }.bind(this)).fork(100);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
