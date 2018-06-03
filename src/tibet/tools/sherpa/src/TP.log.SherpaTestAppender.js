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
 * @type {TP.log.SherpaTestAppender}
 */

//  ----------------------------------------------------------------------------

TP.log.Appender.defineSubtype('SherpaTestAppender');

//  ----------------------------------------------------------------------------
//  Type Attributes
//  ----------------------------------------------------------------------------

TP.log.SherpaTestAppender.Type.$set('defaultLayoutType',
                                    'TP.log.SherpaTestLogLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.SherpaTestAppender.Inst.defineMethod('append',
function(anEntry) {

    /**
     * @method append
     * @summary Formats the entry data using the receiver's layout and writes
     *     it to the console using the best console API method possible.
     * @param {TP.log.Entry} anEntry The log entry to format and append.
     * @returns {TP.log.SherpaTestAppender} The receiver.
     */

    var name,

        layout,
        results,
        content,
        cmdID,
        stdio,

        rootRequest;

    //  Try to find a matching console API method to our level name. If we find
    //  it we'll use that to output the message content.
    name = anEntry.getLevel().get('name').toLowerCase();
    switch (name) {
        case 'warn':
            stdio = 'stdout';
            break;
        case 'error':
        case 'fatal':
            stdio = 'stderr';
            break;
        default:
            //  trace, debug, info, system, all
            stdio = 'stdout';
            break;
    }

    //  TODO:
    //  If the entry contains multiple parts and we have access to a
    //  group/groupEnd api via the console we'll group our output to help show
    //  that it's all the result of a single logging call...

    //  Format the little critter...
    layout = this.getLayout();

    results = layout.layout(anEntry);
    content = results.at('content').asEscapedXML();

    rootRequest = TP.test.Suite.get('$rootRequest');
    if (TP.isValid(rootRequest)) {
        cmdID = rootRequest.getRootID();
    }

    //  Set the 'cmdTAP' flage here indicating that the content is going to be
    //  in TAP (i.e. test) format and always set 'cmdAsIs' to be true, since we
    //  don't want any formatting via any pretty printer to format this content.
    TP[stdio](content, TP.hc('cmdTAP', true, 'cmdAsIs', true, 'cmdID', cmdID));

    return this;
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
