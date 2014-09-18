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
*/

TP.core.TSH.Type.describe('Shell options expansion',
function() {

    var shellDriver;

    this.before(function(suite, options) {
        shellDriver = TP.tsh.Driver.construct();
        this.get('drivers').atPut('shell', shellDriver);
    });

    this.it('simple expansion', function(test, options) {

        var inputVal,
            correctResults;

        inputVal = ':testCmd -first --second --third=\'foo\'';
        correctResults =
            TP.hc(
                'tsh:first',
                TP.hc('Original value tname', 'String',
                        'Original value', 'true',
                        'Expanded value tname', 'Boolean',
                        'Expanded value', true,
                        'Resolved value tname', 'Boolean',
                        'Resolved value', true),
                'tsh:second',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'second\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'second\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'second'),
                'tsh:third',
                TP.hc('Original value tname', 'String',
                        'Original value', '\'foo\'',
                        'Expanded value tname', 'String',
                        'Expanded value', '\'foo\'',
                        'Resolved value tname', 'String',
                        'Resolved value', 'foo')
            );

        shellDriver.execOutputTest(test, inputVal, correctResults);
    });

	return;
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.core.TSH.Type.runTestSuites();
*/

//	------------------------------------------------------------------------
//	end
//	========================================================================
