//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */

/*
 * TP.xctrls:menuitem top-level tests.
 */

//  ------------------------------------------------------------------------

TP.xctrls.menuitem.Type.describe('TP.xctrls:menuitem',
function() {

    this.it('Is a TP.xctrls.Element tag', function(test, options) {
        test.assert.isKindOf(TP.xctrls.menuitem,
            'TP.xctrls.Element');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
