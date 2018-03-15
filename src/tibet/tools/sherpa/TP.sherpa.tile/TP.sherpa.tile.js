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
 * @type {TP.sherpa.tile}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('tile');

TP.sherpa.tile.Inst.defineAttribute('header',
    TP.cpc('> .header', TP.hc('shouldCollapse', true)));

TP.sherpa.tile.Inst.defineAttribute('headerText',
    TP.cpc('> .header > .header_text', TP.hc('shouldCollapse', true)));

TP.sherpa.tile.Inst.defineAttribute('minimizeMark',
    TP.cpc('> .header > .minimize_mark', TP.hc('shouldCollapse', true)));

TP.sherpa.tile.Inst.defineAttribute('closeMark',
    TP.cpc('> .header > .close_mark', TP.hc('shouldCollapse', true)));

TP.sherpa.tile.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.sherpa.tile.Inst.defineAttribute('footer',
    TP.cpc('> .footer', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.tile.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.signal('TileDidOpen');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.tile.Inst.defineHandler('MinimizeTile',
function(aSignal) {

    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.tile.Inst.defineHandler('CloseTile',
function(aSignal) {

    var detachOnClose;

    this.setAttribute('hidden', true);

    if (this.hasAttribute('detachOnClose')) {

        detachOnClose = TP.bc(this.getAttribute('detachonclose'));

        if (TP.isTrue(detachOnClose)) {
            this.signal('TileWillDetach');

            this.detach();
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.tile.Inst.defineMethod('getName',
function(newContent, aRequest) {

    return this.get('headerText').getTextContent();
});

//  ------------------------------------------------------------------------

TP.sherpa.tile.Inst.defineMethod('setHeaderText',
function(newContent, aRequest) {

    return this.get('headerText').setTextContent(newContent);
});

//  ------------------------------------------------------------------------

TP.sherpa.tile.Inst.defineMethod('setModal',
function(isModal) {

    if (isModal) {
        this.addClass('modal');
        this.addClass('ALERT_TIER');
    } else {
        this.removeClass('modal');
        this.removeClass('ALERT_TIER');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.tile.Inst.defineMethod('setRawContent',
function(newContent, aRequest) {

    /**
     * @method setRawContent
     * @summary Sets the content of the receiver to the content provided
     *     without performing any content processing on it.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @returns {TP.dom.Node} The result of setting the content of the
     *     receiver.
     */

    return this.get('body').setRawContent(newContent, aRequest);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
