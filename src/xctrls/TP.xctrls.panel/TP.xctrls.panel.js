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
 * @type {TP.xctrls.panel}
 * @summary Manages panel XControls.
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('xctrls:panel');

TP.xctrls.panel.addTraits(TP.xctrls.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.panel.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.panel.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIDeselect',
            'TP.sig.UISelect'
            ));

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.xctrls.panel.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.panel.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.panel.Inst.defineAttribute('contentElement',
    TP.cpc('> xctrls|content', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
