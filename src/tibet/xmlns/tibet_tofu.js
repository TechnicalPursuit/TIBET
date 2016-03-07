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
 * @type {TP.tibet.tofu}
 * @summary Bland and easily flavored :-)
 */

//  ------------------------------------------------------------------------

TP.core.CustomTag.defineSubtype('tibet:tofu');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.tofu.Inst.defineHandler('TagAssist',
function(aSignal) {

    /**
     * @method TagAssist
     * @summary
     * @param {TP.sig.TagAssist} aSignal The signal that caused this handler to
     *     trip.
     */

    var newTagName,

        newTagContentSection,
        newTagContent;

    newTagName = this.getAttribute('proxyfor');

    newTagContentSection = this.getFirstDescendantByType(Node.CDATA_SECTION_NODE);
    newTagContent = newTagContentSection.getTextContent();

    //  Fire a 'ConsoleCommand' with a ':tag' command, supplying the name and
    //  the template.
    TP.signal(null,
                'ConsoleCommand',
                TP.hc('cmdText',
                        ':tag --assist' +
                        ' --name=\'' + newTagName + '\'' +
                        ' --template=\'' + newTagContent + '\''));

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
