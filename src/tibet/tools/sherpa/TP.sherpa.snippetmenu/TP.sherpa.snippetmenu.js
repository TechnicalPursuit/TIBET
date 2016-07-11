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
 * @type {TP.sherpa.snippetmenu}
 */

//  ------------------------------------------------------------------------

TP.sherpa.menu.defineSubtype('snippetmenu');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.snippetmenu.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    var cmdVal;

    this.deactivate();

    cmdVal = aSignal.getDOMTarget().getAttribute('data-cmd');

    if (TP.isEmpty(cmdVal)) {
        return this;
    }

    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.snippetmenu.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary
     * @returns
     */

    var snippets,
        str;

    snippets = TP.ac(
                TP.ac(':history', 'History'),
                TP.ac(':help', 'Help'),
                TP.ac(':clear', 'Clear'),
                TP.ac(':flag', 'Config flags'),
                TP.ac(':doclint', 'Doclint'),
                TP.ac(':test', 'Run App Tests'),
                TP.ac(':toggleRemoteWatch', 'Toggle Remote Watch'),
                TP.ac(':listChangedRemotes', 'List Changed Remotes'),
                TP.ac('TP.sys.getBootLog()', 'Write Boot Log')
                );

    str = '<ul on:mouseup="SelectMenuItem">';

    snippets.perform(
                function(pairArr) {
                    str += '<li data-cmd="' + pairArr.first() + '">' +
                            pairArr.last() +
                            '</li>';
                });

    str += '</ul>';

    this.get('menuContent').setContent(TP.xhtmlnode(str));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
