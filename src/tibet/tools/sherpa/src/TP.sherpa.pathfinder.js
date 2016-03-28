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
 * @type {TP.sherpa.pathfinder}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('pathfinder');

//  ------------------------------------------------------------------------

TP.sherpa.pathfinder.Inst.defineMethod('setup',
function() {

    var workbenchContent,
        navlistTPElem;

    // data = TP.hc('items', TP.ac(1,2,3,4,5));
    // TP.uc('urn:tibet:pathfinder_data').setResource(data);

    workbenchContent = TP.byCSSPath('#SherpaWorkbench > .content',
                                    this.getNativeDocument(),
                                    true);

    navlistTPElem = TP.wrap(workbenchContent).addContent(
                    TP.sherpa.navlist.getResourceElement('template',
                        TP.ietf.Mime.XHTML));

    navlistTPElem.setup();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
