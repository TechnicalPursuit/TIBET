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

    this.it('remaps a CouchDB uri to the CouchDB handler', function(test, options) {
        uri = TP.uriExpandPath('http://127.0.0.1:5984/_design/app/tibet.json');
        handler = TP.core.URIMapper.Type.remap(uri);

        test.assert.isIdenticalTo(handler, TP.uri.CouchDBURLHandler);
    });

    this.it('remaps exact matches to their defined handler', function(test, options) {
        TP.sys.setcfg('uri.map.exactly.pattern',
            'http://localhost/exactly.xhtml');
        TP.sys.setcfg('uri.map.exactly.urihandler', 'TP.core.URIHandler');
        uri = TP.uriExpandPath('http://localhost/exactly.xhtml');
        handler = TP.core.URIMapper.Type.remap(uri);

        test.assert.isIdenticalTo(handler, TP.core.URIHandler);
    });

    this.it('remaps localhost to configured http handler', function(test, options) {
        var result;

        uri = TP.uriExpandPath('http://localhost/foo.xhtml');
        handler = TP.core.URIMapper.Type.remap(uri);

        result = TP.sys.cfg('uri.handler.http') === 'TP.uri.TDSURLHandler' ?
            TP.uri.TDSURLHandler : TP.core.HTTPURLHandler;
        test.assert.isIdenticalTo(handler, result);
    });

    this.it('remaps 127.0.0.1 to configured http handler', function(test, options) {
        var result;

        uri = TP.uriExpandPath('http://127.0.0.1:1407');
        handler = TP.core.URIMapper.Type.remap(uri);

        result = TP.sys.cfg('uri.handler.http') === 'TP.uri.TDSURLHandler' ?
            TP.uri.TDSURLHandler : TP.core.HTTPURLHandler;
        test.assert.isIdenticalTo(handler, result);
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
