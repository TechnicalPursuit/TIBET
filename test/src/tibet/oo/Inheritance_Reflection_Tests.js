//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
 * Tests for inheritance and reflection methods.
 */

//  ------------------------------------------------------------------------

// Create a singleton object we can hang tests off since reflection and
// inheritance testing ranges across a broad range of objects including
// namespace objects (TP for example) which don't current inherit/support
// the testing API. This is an example of "detached test definition".

TP.OOTests = TP.lang.Object.construct();

//  ------------------------------------------------------------------------

TP.OOTests.describe('stuff',
function() {

    this.it('does stuff', function(test, options) {
        this.assert.isTrue(true);
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
