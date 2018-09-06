//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

TP.describe('uriJoinFragments',
function() {

    this.it('URI path/pointer joining tests - single pointer', function(test, options) {
        var uri,
            pointerOrPath1,
            result;

        //  URI without any fragment, pointer with scheme.
        uri = 'urn:tibet:foo';
        pointerOrPath1 = '#bar(bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#bar(bar)');

        //  URI without any fragment, pointer without any scheme (autodetect
        //  path type and, therefore, scheme).
        uri = 'urn:tibet:foo';
        pointerOrPath1 = 'bar';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar)');

        //  Fully formed URI with existing fragment, pointer with scheme, but
        //  differing schemes.
        uri = 'urn:tibet:foo#foo(foo)';
        pointerOrPath1 = '#bar(bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#foo(foo)');

        //  Fully formed URI with existing fragment, pointer with scheme, and
        //  same schemes.
        uri = 'urn:tibet:foo#tibet(foo)';
        pointerOrPath1 = '#tibet(bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(foo.bar)');

        //  Partially formed URI - has scheme but no path, pointer without any
        //  scheme, therefore fragment will take scheme from path (the 'foo'
        //  scheme doesn't have a default separator character, which is why the
        //  result will be 'barbar')
        uri = 'urn:tibet:foo#foo(bar)';
        pointerOrPath1 = 'bar';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#foo(barbar)');

        //  Partially formed URI - has scheme but no path, pointer with scheme,
        //  but differing schemes.
        uri = 'urn:tibet:foo#foo()';
        pointerOrPath1 = '#bar(bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#foo()');

        //  Partially formed URI - has scheme but no path, pointer with scheme,
        //  and same schemes.
        uri = 'urn:tibet:foo#foo()';
        pointerOrPath1 = '#foo(bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#foo(bar)');

        //  Partially formed URI - has scheme but no path, pointer without any
        //  scheme, but derived scheme will be 'tibet' and path scheme is
        //  'tibet', this will succeed.
        uri = 'urn:tibet:foo#tibet()';
        pointerOrPath1 = 'bar';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar)');

        //  URI with a barename fragment - any pointer is irrelevant at this
        //  point
        uri = 'urn:tibet:foo#foo';
        pointerOrPath1 = '#bar(bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#foo');

    });

    this.it('URI path/pointer joining tests - multiple pointers', function(test, options) {
        var uri,
            pointerOrPath1,
            pointerOrPath2,
            result;

        //  URI without any fragment, both pointers with scheme.
        uri = 'urn:tibet:foo';
        pointerOrPath1 = '#tibet(bar)';
        pointerOrPath2 = '#tibet(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar.baz)');

        //  URI without any fragment, both pointers without any scheme
        //  (autodetect path type and, therefore, scheme).
        uri = 'urn:tibet:foo';
        pointerOrPath1 = 'bar';
        pointerOrPath2 = 'baz';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar.baz)');

        //  URI without any fragment, both pointers without any scheme
        //  (autodetect path type and, therefore, scheme). Conflicting computed
        //  path types, therefore we take the first one.
        uri = 'urn:tibet:foo';
        pointerOrPath1 = 'bar';
        pointerOrPath2 = './/baz';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar.//baz)');

        //  Fully formed URI with existing fragment, pointers with scheme, but
        //  differing schemes (raises TP.sig.InvalidPath).
        uri = 'urn:tibet:foo#foo(foo)';
        pointerOrPath1 = '#bar(bar)';
        pointerOrPath2 = '#bar(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#foo(foo)');

        //  Fully formed URI with existing fragment, pointers with scheme, and
        //  same schemes.
        uri = 'urn:tibet:foo#tibet(foo)';
        pointerOrPath1 = '#tibet(bar)';
        pointerOrPath2 = '#tibet(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(foo.bar.baz)');

        //  Partially formed URI - has scheme but no path, pointers without any
        //  scheme.
        uri = 'urn:tibet:foo#tibet()';
        pointerOrPath1 = 'bar';
        pointerOrPath2 = 'baz';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar.baz)');

        //  Partially formed URI - has scheme but no path, pointers with scheme,
        //  but at least one has a different scheme. Conflicting schemes,
        //  therefore we take the one that has a compatible scheme.
        uri = 'urn:tibet:foo#foo()';
        pointerOrPath1 = '#bar(bar)';
        pointerOrPath2 = '#foo(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#foo(baz)');

        //  Partially formed URI - has scheme and path, pointers with scheme,
        //  but at least one has a different scheme. Conflicting schemes,
        //  therefore we take the one that has a compatible scheme.
        uri = 'urn:tibet:foo#foo(foo)';
        pointerOrPath1 = '#bar(bar)';
        pointerOrPath2 = '#foo(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        //  NB: The 'foo' scheme is unknown, so the join character is ''.
        test.assert.isEqualTo(result, 'urn:tibet:foo#foo(foobaz)');

        //  Partially formed URI - has scheme but no path, pointer with scheme,
        //  and same schemes.
        uri = 'urn:tibet:foo#tibet()';
        pointerOrPath1 = '#tibet(bar)';
        pointerOrPath2 = '#tibet(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar.baz)');
    });

    this.it('URI path/pointer joining tests - TIBET pointers', function(test, options) {
        var uri,
            pointerOrPath1,
            pointerOrPath2,
            result;

        //  URI without any fragment, pointer with scheme.
        uri = 'urn:tibet:foo';
        pointerOrPath1 = '#tibet(bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar)');

        //  URI without any fragment, pointer without any scheme (autodetect
        //  path type and, therefore, scheme).
        uri = 'urn:tibet:foo';
        pointerOrPath1 = 'bar';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar)');

        //  Fully formed URI with existing fragment, pointer with scheme.
        uri = 'urn:tibet:foo#tibet(foo)';
        pointerOrPath1 = '#tibet(bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(foo.bar)');

        //  Partially formed URI - has scheme but no path, pointer with scheme.
        uri = 'urn:tibet:foo#tibet()';
        pointerOrPath1 = '#tibet(bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar)');

        //  Partially formed URI - has scheme but no path, pointer without any
        //  scheme, but the fragment scheme will pick up the scheme from the
        //  path.
        uri = 'urn:tibet:foo#tibet()';
        pointerOrPath1 = 'bar';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar)');

        //  URI without any fragment, both pointers with scheme.
        uri = 'urn:tibet:foo';
        pointerOrPath1 = '#tibet(bar)';
        pointerOrPath2 = '#tibet(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar.baz)');

        //  URI without any fragment, both pointers without any scheme
        //  (autodetect path type and, therefore, scheme).
        uri = 'urn:tibet:foo';
        pointerOrPath1 = 'bar';
        pointerOrPath2 = 'baz';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar.baz)');

        //  Fully formed URI with existing fragment, pointers with scheme.
        uri = 'urn:tibet:foo#tibet(foo)';
        pointerOrPath1 = '#tibet(bar)';
        pointerOrPath2 = '#tibet(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(foo.bar.baz)');

        //  Partially formed URI - has scheme but no path, pointers without any
        //  scheme, but the fragment schemes will pick up the scheme from the
        //  path.
        uri = 'urn:tibet:foo#tibet()';
        pointerOrPath1 = 'bar';
        pointerOrPath2 = 'baz';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar.baz)');

        //  Partially formed URI - has scheme but no path, pointer with scheme.
        uri = 'urn:tibet:foo#tibet()';
        pointerOrPath1 = '#tibet(bar)';
        pointerOrPath2 = '#tibet(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#tibet(bar.baz)');
    });

    this.it('URI path/pointer joining tests - XPath pointers', function(test, options) {
        var uri,
            pointerOrPath1,
            pointerOrPath2,
            result;

        //  URI without any fragment, pointer with scheme.
        uri = 'urn:tibet:foo';
        pointerOrPath1 = '#xpath1(bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(bar)');

        //  URI without any fragment, pointer without any scheme (autodetect
        //  path type and, therefore, scheme).
        uri = 'urn:tibet:foo';
        pointerOrPath1 = './bar';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(./bar)');

        //  Fully formed URI with existing fragment, pointer with scheme.
        uri = 'urn:tibet:foo#xpath1(foo)';
        pointerOrPath1 = '#xpath1(./bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(foo/./bar)');

        //  Partially formed URI - has scheme but no path, pointer with scheme.
        uri = 'urn:tibet:foo#xpath1()';
        pointerOrPath1 = '#xpath1(bar)';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(bar)');

        //  Partially formed URI - has scheme but no path, pointer without any
        //  scheme, but derived scheme will be 'xpath1' and path scheme is
        //  'xpath1', this will succeed.
        uri = 'urn:tibet:foo#xpath1()';
        pointerOrPath1 = './bar';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(./bar)');

        //  Partially formed URI - has scheme but no path, pointer without any
        //  scheme, but the fragment scheme will pick up the scheme from the
        //  path.
        uri = 'urn:tibet:foo#xpath1()';
        pointerOrPath1 = 'bar';
        result = TP.uriJoinFragments(uri, pointerOrPath1);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(bar)');

        //  URI without any fragment, both pointers with scheme.
        uri = 'urn:tibet:foo';
        pointerOrPath1 = '#xpath1(bar)';
        pointerOrPath2 = '#xpath1(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(bar/baz)');

        //  URI without any fragment, both pointers without any scheme
        //  (autodetect path type and, therefore, scheme).
        uri = 'urn:tibet:foo';
        pointerOrPath1 = './bar';
        pointerOrPath2 = './baz';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(./bar/./baz)');

        //  Fully formed URI with existing fragment, pointers with scheme.
        uri = 'urn:tibet:foo#xpath1(foo)';
        pointerOrPath1 = '#xpath1(bar)';
        pointerOrPath2 = '#xpath1(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(foo/bar/baz)');

        //  Partially formed URI - has scheme but no path, pointers without any
        //  scheme.
        uri = 'urn:tibet:foo#xpath1()';
        pointerOrPath1 = './bar';
        pointerOrPath2 = '/baz';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(/baz)');

        //  Partially formed URI - has scheme but no path, pointers without any
        //  scheme, but the fragment schemes will pick up the scheme from the
        //  path.
        uri = 'urn:tibet:foo#xpath1()';
        pointerOrPath1 = 'bar';
        pointerOrPath2 = 'baz';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(bar/baz)');

        //  Partially formed URI - has scheme but no path, pointer with scheme.
        uri = 'urn:tibet:foo#xpath1()';
        pointerOrPath1 = '#xpath1(bar)';
        pointerOrPath2 = '#xpath1(baz)';
        result = TP.uriJoinFragments(uri, pointerOrPath1, pointerOrPath2);
        test.assert.isEqualTo(result, 'urn:tibet:foo#xpath1(bar/baz)');
    });
});

TP.describe('uriResolvePaths',
function() {
    var path1,
        path2,
        result;

    this.beforeEach(function() {
        path1 = null;
        path2 = null;
        result = null;
    });

    this.it('joins file paths properly', function(test, options) {
        path1 = 'file:///dev/fluffy/TIBET-INF/boot/xhtml/';
        path2 = '../../../styles/app.css';
        result = TP.uriResolvePaths(path1, path2);
        test.assert.isEqualTo(result,
            'file:///dev/fluffy/styles/app.css');
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
