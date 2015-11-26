//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.core.URIMapper
//  ========================================================================

TP.core.URIMapper.Type.describe('remap',
function() {

    var uri,
        handler;

    this.beforeEach(function() {
        uri = null;
        handler = null;
    });

    this.it('remaps localhost to a TDS handler', function(test, options) {
        uri = TP.uriExpandPath('http://localhost/foo.xhtml');
        handler = TP.core.URIMapper.Type.remap(uri);

        test.assert.isIdenticalTo(handler, TP.tds.TDSURLHandler);
    });
});

//  ========================================================================
//  TP.core.URIRewriter
//  ========================================================================

TP.core.URIRewriter.Type.describe('rewrite',
function() {

    var uri,
        rewrite;

    this.beforeEach(function() {
        uri = null;
        rewrite = null;
    });


    this.it('returns a uri from rewrite call', function(test, options) {
        uri = TP.uriExpandPath('http://localhost/foo.xhtml');
        rewrite = TP.core.URIRewriter.Type.rewrite(uri);

        test.assert.isEqualTo(uri, TP.str(rewrite));
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
