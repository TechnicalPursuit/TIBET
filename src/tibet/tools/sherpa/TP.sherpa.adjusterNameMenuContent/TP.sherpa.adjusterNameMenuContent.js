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
 * @type {TP.sherpa.adjusterNameMenuContent}
 */

//  ------------------------------------------------------------------------

TP.sherpa.menucontent.defineSubtype('adjusterNameMenuContent');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.adjusterNameMenuContent.Inst.defineAttribute('menuContent',
    TP.cpc('> .body > ul', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.adjusterNameMenuContent.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    /**
     * @method handleSelectMenuItem
     * @summary Handles notifications of a menu selection happening.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.adjusterNameMenuContent} The receiver.
     */

    var val;

    //  Grab the value of the 'data-value' attribute.
    val = aSignal.getDOMTarget().getAttribute('data-value');

    if (TP.isEmpty(val)) {
        return this;
    }

    //  Open a window using that value.
    TP.open(val, '_blank');

    //  Send a signal that an item has been selected.
    this.signal('TP.sig.UISelect', TP.hc('value', val));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjusterNameMenuContent.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.sherpa.adjusterNameMenuContent} The receiver.
     */

    var data,
        str,

        menuContentTPElem;

    data = this.get('data');

    //  No valid snippet data - empty the menu content list and exit.
    if (TP.isEmpty(data)) {
        this.get('menuContent').empty();

        //  Signal to observers that this control has rendered.
        this.signal('TP.sig.DidRender');

        return this;
    }

    //  Iterate over all of data. It is an Array of pairs.
    str = '';

    data.forEach(
        function(pairArr, index) {
            str += '<li data-value="' + pairArr.first() + '">' +
                    pairArr.last() +
                    '</li>';
        });

    //  Grab the menuContent element (probably a '<ul>') and set it's content.
    //  Note here that we can use 'setRawContent()' since there won't be any
    //  compilation going on.
    menuContentTPElem = this.get('menuContent');
    menuContentTPElem.setRawContent(TP.xhtmlnode(str));

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    (function() {
        menuContentTPElem.scrollTo(TP.TOP);
    }).queueBeforeNextRepaint(this.getNativeWindow());

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
