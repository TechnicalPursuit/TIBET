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
 * @type {TP.sherpa.adjusterValueMenuContent}
 */

//  ------------------------------------------------------------------------

TP.sherpa.menucontent.defineSubtype('adjusterValueMenuContent');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.adjusterValueMenuContent.Inst.defineAttribute('menuContent',
    TP.cpc('> .body > ul', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.adjusterValueMenuContent.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    /**
     * @method handleSelectMenuItem
     * @summary Handles notifications of a menu selection happening.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.adjusterValueMenuContent} The receiver.
     */

    var val;

    //  Grab the value of the 'data-value' attribute.
    val = aSignal.getDOMTarget().getAttribute('data-value');

    if (TP.isEmpty(val)) {
        return this;
    }

    //  Send a signal that an item has been selected.
    this.signal('TP.sig.UISelect', TP.hc('value', val));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjusterValueMenuContent.Inst.defineHandler('ToggleHighlight',
function(aSignal) {

    /**
     * @method ToggleHighlight
     * @summary Responds to mouse over/out notifications by toggling a
     *     class on individual peer elements. The result is that as the user
     *     hovers over elements in the sidebar, signals are sent that notify the
     *     AdjusterMenuTarget of items being highlighted or unhighlighted.
     * @param {TP.sig.ToggleHighlight} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.adjusterValueMenuContent} The receiver.
     */

    var targetElem,
        val;

    //  If not even part of ourself is visible (the 'true' here allows for
    //  partial visiblity), then just return.
    if (!this.isVisible(true)) {
        return this;
    }

    //  Grab the new 'DOM target' element, which will be the lozenge that the
    //  user is highlighting.
    targetElem = aSignal.getDOMTarget();

    //  The peer on the lozenge will indicate which element in the UI canvas
    //  it is representing. If we don't have one, we exit.
    val = TP.elementGetAttribute(targetElem, 'data-value', true);
    if (TP.isEmpty(val)) {
        return this;
    }

    //  Send a signal that an item has been selected.
    this.signal('TP.sig.UIValueChange', TP.hc('value', val));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjusterValueMenuContent.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.sherpa.adjusterValueMenuContent} The receiver.
     */

    var data,
        str,

        menuContentTPElem;

    data = this.get('data');

    //  No valid snippet data - empty the menu content list and exit.
    if (TP.isEmpty(data)) {
        this.get('menuContent').empty();

        return this;
    }

    //  Iterate over all of data. It is an Array of pairs.
    str = '';

    data.forEach(
                function(pairArr, index) {
                    str += '<li data-value="' + pairArr.first() + '"' +
                            ' on:mouseover="ToggleHighlight"' +
                            ' on:mouseout="ToggleHighlight"' +
                            ' on:dragover="ToggleHighlight"' +
                            ' on:dragout="ToggleHighlight"' +
                            '>' +
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
