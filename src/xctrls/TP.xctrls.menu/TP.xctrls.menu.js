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
 * @type {TP.xctrls.menu}
 */

//  ------------------------------------------------------------------------

TP.xctrls.itemset.defineSubtype('xctrls:menu');

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.menu.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.menu.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIActivate',
            'TP.sig.UIDeactivate',

            'TP.sig.UIDeselect',
            'TP.sig.UISelect',

            'TP.sig.UIDisabled',
            'TP.sig.UIEnabled'
            ));

/**
 * The tag name of the tag to use for each item if there is no template.
 * @type {String}
 */
TP.xctrls.menu.Type.defineAttribute('defaultItemTagName', 'xctrls:textitem');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
