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
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.notifier.Inst.defineHandler('DismissNotifier',
function(aSignal) {

    var elem,
        styleObj;

    this.ignore(elem, 'TP.sig.DOMTransitionEnd');

    elem = this.getNativeNode();

    styleObj = TP.elementGetStyleObj(elem);

    styleObj.transition = '';
    styleObj.display = '';

    this.setAttribute('active', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.notifier.Inst.defineHandler('DOMTransitionEnd',
function(aSignal) {

    var elem;

    elem = this.getNativeNode();

    this.ignore(elem, 'TP.sig.DOMTransitionEnd');
    TP.elementGetStyleObj(elem).display = '';

    return this;
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
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var retVal,

        elem,
        styleObj;

    retVal = this.get('contentArea').setContent(aContentObject, aRequest);

    elem = this.getNativeNode();

    styleObj = TP.elementGetStyleObj(elem);

    styleObj.transition =
        'width 0.25s, margin 0.25s, opacity ' +
            TP.sys.cfg('sherpa.notifier_fadeout_duration', 5000) + 'ms';

    styleObj.display = 'block';

    (function() {

        this.observe(elem, 'TP.sig.DOMTransitionEnd');
        this.setAttribute('active', false);

    }.bind(this)).fork(
        TP.sys.cfg('sherpa.notifier_fadeout_delay', 5000));

    this.setAttribute('active', true);

    return retVal;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
