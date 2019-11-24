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
 * @type {TP.sherpa.bookmarkMenuContent}
 */

//  ------------------------------------------------------------------------

TP.sherpa.menucontent.defineSubtype('bookmarkMenuContent');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.bookmarkMenuContent.Inst.defineAttribute('menuContent',
    TP.cpc('> .body > ul', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.bookmarkMenuContent.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    /**
     * @method handleSelectMenuItem
     * @summary Handles notifications of a menu selection happening.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.bookmarkMenuContent} The receiver.
     */

    var cmdVal;

    //  Grab the value of the 'data-cmd' attribute. This will be the inspector
    //  path to navigate to.
    cmdVal = aSignal.getDOMTarget().getAttribute('data-cmd');

    if (TP.isEmpty(cmdVal)) {
        return this;
    }

    //  Use the value as the path in an ':inspect' statement.
    cmdVal = ':inspect --path=\'' + cmdVal + '\'';

    //  Send the command to execute on to the Sherpa' console service.
    (function() {
        TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);
    }).queueAfterNextRepaint(this.getNativeWindow());

    //  Send a signal that an item has been selected.
    this.signal('TP.sig.UISelect');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bookmarkMenuContent.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.sherpa.bookmarkMenuContent} The receiver.
     */

    var bookmarks,
        str,

        menuContentTPElem;

    bookmarks = this.get('data');

    //  No valid bookmark data - empty the menu content list and exit.
    if (TP.isEmpty(bookmarks)) {
        this.get('menuContent').empty();

        return this;
    }

    //  Iterate over all of bookmarks. It is an Array of pairs. The bookmarked
    //  path itself will be in the first item of the pair and the description
    //  will be in the second item of the pair.
    str = '';

    bookmarks.forEach(
                function(pairArr, index) {
                    str += '<li data-cmd="' + pairArr.first() + '">' +
                            index + '.&#160;' +
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
