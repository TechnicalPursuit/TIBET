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
 * @type {TP.sherpa.snippetMenuContent}
 */

//  ------------------------------------------------------------------------

TP.sherpa.menucontent.defineSubtype('snippetMenuContent');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.snippetMenuContent.Inst.defineAttribute('bodyContent',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.sherpa.snippetMenuContent.Inst.defineAttribute('menuContent',
    TP.cpc('> .body > ul', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.snippetMenuContent.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    /**
     * @method handleSelectMenuItem
     * @summary Handles notifications of a menu selection happening.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.snippetMenuContent} The receiver.
     */

    var cmdVal;

    //  Grab the value of the 'data-cmd' attribute. This will be the command to
    //  execute.
    cmdVal = aSignal.getDOMTarget().getAttribute('data-cmd');

    if (TP.isEmpty(cmdVal)) {
        return this;
    }

    //  Send the command to execute on to the Sherpa' console service.
    (function() {
        TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);
    }).queueForNextRepaint(this.getNativeWindow());

    //  Send a signal that an item has been selected.
    this.signal('TP.sig.UISelect');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.snippetMenuContent.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.sherpa.snippetMenuContent} The receiver.
     */

    var snippets,
        str,

        menuContentTPElem;

    snippets = this.get('data');

    //  No valid snippet data - empty the menu content list and exit.
    if (TP.isEmpty(snippets)) {
        this.get('menuContent').empty();

        return this;
    }

    //  Iterate over all of snippets. It is an Array of pairs. The TSH command
    //  itself will be in the first item of the pair and the description will be
    //  in the second item of the pair.
    str = '';

    snippets.forEach(
                function(pairArr, index) {
                    str += '<li data-cmd="' + pairArr.first() + '">' +
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
    }).queueForNextRepaint(this.getNativeWindow());

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
