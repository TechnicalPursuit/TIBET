//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.tsh.keys}
 * @summary Dumps a list of keyboard shortcuts for the Sherpa.
 */

//  ------------------------------------------------------------------------

TP.core.ActionTag.defineSubtype('tsh:keys');

TP.tsh.keys.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.keys.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. Common values are TP.CONTINUE, TP.DESCEND, and
     *     TP.BREAK.
     */

    var shell,
        keys,

        output;

    shell = aRequest.at('cmdShell');

    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    keys = TP.hc(
        'Alt-UpArrow', 'Show/Hide HUD',
        'Shift-Shift', 'Focus Input Cell',
        'Shift-Return', 'Execute',

        'Ctrl-U', 'Clears the input cell of content',
        'Ctrl-K', 'Clears the output area of all output cells',

        'Ctrl-DownArrow', 'Cycle output mode downward (will wrap)',
        'Ctrl-UpArrow', 'Cycle output mode upward (will wrap)',

        'Shift-DownArrow', 'Move to "next" history entry (will not wrap)',
        'Shift-UpArrow', 'Move to "last" history entry (will not wrap)',

        'DownArrow', 'Scroll last output cell down 1 line',
        'UpArrow', 'Scroll last output cell up 1 line',

        'PageDown', 'Scroll last output cell down 1 page',
        'PageUp', 'Scroll last output cell up 1 page',

        'Shift-Esc', 'Cancels a multi-prompt operations'
    );

    output = '<dl>';

    keys.perform(
        function(kvPair) {
            output += '<dt>' + kvPair.first() + '</dt>' +
                        '<dd>' + kvPair.last() + '</dd>';
        });

    output += '</dl>';

    aRequest.atPut('cmdAsIs', true);

    aRequest.complete(output);

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.addHelpTopic('keys',
    TP.tsh.keys.Type.getMethod('tshExecute'),
    'Lists keyboard shortcuts for the Sherpa toolset.',
    ':keys',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
