//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================


TP.core.AccessPath.Type.describe('TP.core.AccessPath getConcreteType TIBET Paths',
function() {

    var path;

    this.it('Simple TIBET path', function(test, options) {
        path = TP.apc('foo');
        test.assert.isKindOf(path, TP.core.SimpleTIBETPath);

        path = TP.apc('1');
        test.assert.isKindOf(path, TP.core.SimpleTIBETPath);
    });

    this.it('Complex TIBET path', function(test, options) {
        path = TP.apc('foo.hi');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('foo.hi.boo');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('2.1');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('2.1.2');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('foo.hi[boo,moo]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('foo.hi[boo,moo].gar');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('2[1,2]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('[0:2]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('[:2]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('[2:]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('[:-2]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('[2:-1]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('[1:6:2]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('[6:1:-2]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('foo.1');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('[0,2].fname');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('0.aliases[1:2]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('0.aliases[:-1]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('3.1[1:4]');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);
    });
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.describe('TP.core.AccessPath getConcreteType Simple XML Paths',
function() {

    var path;

    this.it('Simple XML path', function(test, options) {
        path = TP.apc('@foo');
        test.assert.isKindOf(path, TP.core.SimpleXMLPath);
    });
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.describe('TP.core.AccessPath getConcreteType XPath Paths',
function() {

    var path;

    this.it('XPath path', function(test, options) {
        path = TP.apc('/author');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('./author');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('/author/lname');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('/author/lname|/author/fname');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('/author/lname@foo');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('/author/lname@foo|/author/fname@baz');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('//*');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('//author');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('.//author');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('book[/bookstore/@specialty=@style]');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('author/*');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('author/first-name');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('bookstore//title');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('bookstore/*/title');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('*/*');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('/bookstore//book/excerpt//author');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('./*[@foo]');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('./@foo');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('bookstore/@foo');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('bookstore/@foo/bar');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('./bookstore[name][2]');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('@*');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('@foo:*');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('*/bar[@foo]');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('/goo/bar[@foo]');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('/goo/bar[@foo="baz"]');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('//foo[text()=../../following-sibling::*//foo/text()]');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('./foo:*');
        test.assert.isKindOf(path, TP.core.XPathPath);
    });
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.describe('TP.core.AccessPath getConcreteType CSS Paths',
function() {

    var path;

    this.it('CSSPath path', function(test, options) {
        path = TP.apc('*');
        test.assert.isKindOf(path, TP.core.CSSPath);

        /*
        Won't work because of 'barename path' check (although it produces the
        same result)

        path = TP.apc('#id');
        test.assert.isKindOf(path, TP.core.CSSPath);
        */

        /*
        Won't work because of 'TIBET path' check

        path = TP.apc('mytag');
        test.assert.isKindOf(path, TP.core.CSSPath);
        */

        path = TP.apc('.myclass');
        test.assert.isKindOf(path, TP.core.CSSPath);

        /*
        Won't work because of 'barename path' check (although it produces the
        same result)

        path = TP.apc('#id.myclass');
        test.assert.isKindOf(path, TP.core.CSSPath);
        */

        /*
        Won't work because of 'TIBET path' check

        path = TP.apc('mytag.myclass');
        test.assert.isKindOf(path, TP.core.CSSPath);
        */

        path = TP.apc('mytag mytag');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('myns|*');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('myns|mytag');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('.myclass .myclass');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('.myclass.myclass');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag:visited');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag + mysibling');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('myparent > mytag');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag ~ mysibling');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag[myattr]');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag[myattr="myval"]');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag[myattr*="myval"]');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag[myattr^="myval"]');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag[myattr$="myval"]');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag[myattr~="myval"]');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag[myattr|="myval"]');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag:not([myattr])');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('mytag[myattr="myval"][myattr^="myval"]');
        test.assert.isKindOf(path, TP.core.CSSPath);

        path = TP.apc('myparent > *, #myid');
        test.assert.isKindOf(path, TP.core.CSSPath);
    });
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.describe('TP.core.AccessPath getConcreteType JSON Paths',
function() {

    var path;

    this.it('JSON path', function(test, options) {

        path = TP.apc('$.store.book[*].author');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..author');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$.store.*');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$.store..price');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$.store..price.^');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..book[2]');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..book[(@.length-1)]');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..book[:-1]');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..book[:2]');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..book[1:2]');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..book[-2:]');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..book[2:]');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..book[?(@.isbn)]');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..book[?(@.price < 10)]');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..book[?(@.isbn && @.price < 10)]');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..book[?(@.isbn || @.price < 10)]');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$..*');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$.store');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$.children[0].^');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('$.store.book[*].reviews[?(@.nyt == @.cst)].^.title');
        test.assert.isKindOf(path, TP.core.JSONPath);
    });
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.describe('TP.core.AccessPath getConcreteType composite Paths',
function() {

    var path;

    this.it('Composite path with TIBET Simple Paths', function(test, options) {
        path = TP.apc('foo.(bar).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('(bar).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(bar)');
        test.assert.isKindOf(path, TP.core.CompositePath);
    });

    this.it('Composite path with TIBET Simple paths and embedded TIBET Complex Paths', function(test, options) {
        path = TP.apc('foo.(foo.hi).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(2.1).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(foo.hi[boo,moo]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(foo.hi[boo,moo].gar).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(2[1,2]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.([0:2]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.([0:]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.([:2]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.([-1:]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.([:-1]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.([0:2].fname).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(0.aliases[:-1]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);
    });

    this.it('Composite path with TIBET Simple paths and embedded XPath Paths', function(test, options) {
        path = TP.apc('foo.(/author).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(./author).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(/author/lname).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(/author/lname|author/fname).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(/author/lname@foo).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(/author/lname@foo|/author/fname@foo).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(//*).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(//author).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(.//author).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(book[/bookstore/@specialty=@style]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(author/*).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(author/first-name).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(bookstore//title).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(bookstore/*/title).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(*/*).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(/bookstore//book/excerpt//author).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(./*[@foo]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(./@foo).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(bookstore/@foo).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(bookstore/@foo/bar).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(./bookstore[name][2]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(@*).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(@foo:*).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(*/bar[@foo]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(/goo/bar[@foo]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(/goo/bar[@foo="baz"]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(//foo[text()=../../following-sibling::*//foo/text()]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(./foo:*).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);
    });

    this.it('Composite path with TIBET Simple paths and embedded CSS Paths', function(test, options) {
        path = TP.apc('foo.(.myclass).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag mytag).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(myns|mytag).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(.myclass .myclass).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(.myclass.myclass).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag:visited).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag + mysibling).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(myparent > mytag).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag ~ mysibling).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag[myattr]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag[myattr="myval"]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag[myattr*="myval"]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag[myattr^="myval"]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag[myattr$="myval"]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag[myattr~="myval"]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag[myattr|="myval"]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag:not([myattr])).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(mytag[myattr="myval"][myattr^="myval"]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.(myparent > *, #myid).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);
    });

    this.it('Composite path with TIBET Simple paths and embedded JSON Paths', function(test, options) {
        path = TP.apc('foo.($.store.book[*].author).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..author).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($.store.*).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($.store..price).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($.store..price.^).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..book[2]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..book[(@.length-1)]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..book[:-1]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..book[:2]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..book[1:2]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..book[-2:]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..book[2:]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..book[?(@.isbn)]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..book[?(@.price < 10)]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..book[?(@.isbn && @.price < 10)]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..book[?(@.isbn || @.price < 10)]).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($..*).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($.store).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($.children[0].^).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('foo.($.store.book[*].reviews[?(@.nyt == @.cst)].^.title).baz');
        test.assert.isKindOf(path, TP.core.CompositePath);
    });
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.describe('TP.core.AccessPath getConcreteType TIBET Paths emdedded in XPointers',
function() {

    var path;

    this.it('Simple TIBET path', function(test, options) {

        path = TP.apc('#tibet(foo)');
        test.assert.isKindOf(path, TP.core.SimpleTIBETPath);

        path = TP.apc('#tibet(1)');
        test.assert.isKindOf(path, TP.core.SimpleTIBETPath);
    });

    this.it('Complex TIBET path', function(test, options) {

        path = TP.apc('#tibet(foo.hi)');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('#tibet(foo.hi.boo)');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('#tibet(2.1)');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);

        path = TP.apc('#tibet(2.1.2)');
        test.assert.isKindOf(path, TP.core.ComplexTIBETPath);
    });
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.describe('TP.core.AccessPath getConcreteType XPath Paths emdedded in XPointers',
function() {

    var path;

    this.it('XPath path', function(test, options) {

        path = TP.apc('#xpath1(/emp)');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('#xpath1(./emp)');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('#xpath1(/emp/lname)');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('#xpath1(/emp/lname|/emp/fname)');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('#xpath1(/emp/lname@foo)');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('#xpath1(/emp/lname@foo|/emp/fname@baz)');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('#xpath1(//*)');
        test.assert.isKindOf(path, TP.core.XPathPath);

        path = TP.apc('#xpath1(@foo)');
        test.assert.isKindOf(path, TP.core.XPathPath);
    });
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.describe('TP.core.AccessPath getConcreteType CSS Paths emdedded in XPointers',
function() {

    var path;

    this.it('CSS path', function(test, options) {

        path = TP.apc('#css(*)');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(.myclass)');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag mytag)');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(myns|*)');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(myns|mytag)');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(.myclass .myclass)');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag:visited)');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag + mysibling)');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(myparent > mytag)');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag ~ mysibling)');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag[myattr])');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag[myattr="myval"])');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag[myattr*="myval"])');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag[myattr^="myval"])');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag[myattr$="myval"])');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag[myattr~="myval"])');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag[myattr|="myval"])');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag:not([myattr]))');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(mytag[myattr="myval"][myattr^="myval"])');
        test.assert.isKindOf(path, TP.core.XTensionPath);

        path = TP.apc('#css(myparent > *, #myid)');
        test.assert.isKindOf(path, TP.core.XTensionPath);
    });
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.describe('TP.core.AccessPath getConcreteType JSON Paths emdedded in XPointers',
function() {

    var path;

    this.it('JSON path', function(test, options) {

        path = TP.apc('#json($.store.book[*].author)');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..author)');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($.store.*)');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($.store..price)');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($.store..price.^)');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..book[2])');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..book[(@.length-1)])');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..book[:-1])');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..book[:2])');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..book[1:2])');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..book[-2:])');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..book[2:])');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..book[?(@.isbn)])');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..book[?(@.price < 10)])');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..book[?(@.isbn && @.price < 10)])');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..book[?(@.isbn || @.price < 10)])');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($..*)');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($)');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($.store)');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($.children[0].^)');
        test.assert.isKindOf(path, TP.core.JSONPath);

        path = TP.apc('#json($.store.book[*].reviews[?(@.nyt == @.cst)].^.title)');
        test.assert.isKindOf(path, TP.core.JSONPath);
    });
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.describe('TP.core.AccessPath getConcreteType composite Paths emdedded in XPointers',
function() {

    var path;

    this.it('Composite path with TIBET Simple Paths', function(test, options) {

        path = TP.apc('#tibet(foo.(bar).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet((bar).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(bar))');
        test.assert.isKindOf(path, TP.core.CompositePath);
    });

    this.it('Composite path with TIBET Simple Paths', function(test, options) {

        path = TP.apc('#tibet(foo.(foo.hi).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(2.1).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(foo.hi[boo,moo]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(foo.hi[boo,moo].gar).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(2[1,2]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([0:2]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([0:]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([:2]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([-1:]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([:-1]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([0:2].fname).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(0.aliases[:-1]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);
    });

    this.it('Composite path with TIBET Simple paths and embedded TIBET Complex Paths', function(test, options) {

        path = TP.apc('#tibet(foo.(foo.hi).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(2.1).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(foo.hi[boo,moo]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(foo.hi[boo,moo].gar).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(2[1,2]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([0:2]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([0:]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([:2]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([-1:]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([:-1]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.([0:2].fname).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(0.aliases[:-1]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);
    });

    this.it('Composite path with TIBET Simple paths and embedded XPath Paths', function(test, options) {

        path = TP.apc('#tibet(foo.(/author).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(./author).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(/author/lname).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(/author/lname|author/fname).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(/author/lname@foo).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(/author/lname@foo|/author/fname@foo).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(//*).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(//author).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(.//author).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(book[/bookstore/@specialty=@style]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(author/*).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(author/first-name).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(bookstore//title).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(bookstore/*/title).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(*/*).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(/bookstore//book/excerpt//author).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(./*[@foo]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(./@foo).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(bookstore/@foo).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(bookstore/@foo/bar).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(./bookstore[name][2]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(@*).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(@foo:*).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(*/bar[@foo]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(/goo/bar[@foo]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(/goo/bar[@foo="baz"]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(//foo[text()=../../following-sibling::*//foo/text()]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(./foo:*).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);
    });

    this.it('Composite path with TIBET Simple paths and embedded CSS Paths', function(test, options) {

        path = TP.apc('#tibet(foo.(.myclass).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag mytag).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(myns|mytag).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(.myclass .myclass).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(.myclass.myclass).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag:visited).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag + mysibling).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(myparent > mytag).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag ~ mysibling).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag[myattr]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag[myattr="myval"]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag[myattr*="myval"]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag[myattr^="myval"]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag[myattr$="myval"]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag[myattr~="myval"]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag[myattr|="myval"]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag:not([myattr])).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(mytag[myattr="myval"][myattr^="myval"]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.(myparent > *, #myid).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);
    });

    this.it('Composite path with TIBET Simple paths and embedded JSON Paths', function(test, options) {

        path = TP.apc('#tibet(foo.($.store.book[*].author).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..author).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($.store.*).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($.store..price).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($.store..price.^).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..book[2]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..book[(@.length-1)]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..book[:-1]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..book[:2]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..book[1:2]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..book[-2:]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..book[2:]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..book[?(@.isbn)]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..book[?(@.price < 10)]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..book[?(@.isbn && @.price < 10)]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..book[?(@.isbn || @.price < 10)]).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($..*).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($.store).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($.children[0].^).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);

        path = TP.apc('#tibet(foo.($.store.book[*].reviews[?(@.nyt == @.cst)].^.title).baz)');
        test.assert.isKindOf(path, TP.core.CompositePath);
    });
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.describe('TP.core.AccessPath JSON Path transformations',
function() {

    var path;

    this.it('JSON path', function(test, options) {

        path = TP.jpc('$.store.book[*].author').asXPath();
        test.assert.isEqualTo(path, '/store//book/author');

        path = TP.jpc('$..author').asXPath();
        test.assert.isEqualTo(path, '//author');

        path = TP.jpc('$.store.*').asXPath();
        test.assert.isEqualTo(path, '/store/*');

        path = TP.jpc('$.store..price').asXPath();
        test.assert.isEqualTo(path, '/store//price');

        path = TP.jpc('$.store..price.^').asXPath();
        test.assert.isEqualTo(path, '/store//price/..');

        //  ---

        path = TP.jpc('$.book[2]').asXPath();
        test.assert.isEqualTo(path, '/book/*[position() = 3]');

        path = TP.jpc('$.book[-2,2]').asXPath();
        test.assert.isEqualTo(path, '/book/*[position() = -1 or position() = 3]');

        path = TP.jpc('$.book[-1:]').asXPath();
        test.assert.isEqualTo(path, '/book/*[position() >= last() + 0]');

        path = TP.jpc('$.book[:2]').asXPath();
        test.assert.isEqualTo(path, '/book/*[position() < 3]');

        path = TP.jpc('$.book[1:2]').asXPath();
        test.assert.isEqualTo(path, '/book/*[position() >= 2 and position() < 3]');

        path = TP.jpc('$.book[-2:]').asXPath();
        test.assert.isEqualTo(path, '/book/*[position() >= last() + -1]');

        path = TP.jpc('$.book[2:]').asXPath();
        test.assert.isEqualTo(path, '/book/*[position() >= 3]');

        //  ---

        path = TP.jpc('$.book[(@.length-1)]').asXPath();
        test.assert.isEqualTo(path, '/book/*[position() = last() + 1-1]');

        path = TP.jpc('$.book[?(@.isbn)]').asXPath();
        test.assert.isEqualTo(path, '/book/*[./isbn]');

        path = TP.jpc('$.book[?(@.price < 10)]').asXPath();
        test.assert.isEqualTo(path, '/book/*[./price < 10]');

        path = TP.jpc('$.book[?(@.isbn && @.price < 10)]').asXPath();
        test.assert.isEqualTo(path, '/book/*[./isbn and ./price < 10]');

        path = TP.jpc('$.book[?(@.isbn || @.price < 10)]').asXPath();
        test.assert.isEqualTo(path, '/book/*[./isbn or ./price < 10]');

        //  ---

        path = TP.jpc('$..book[2]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][position() = 3]');

        path = TP.jpc('$..book[-2,2]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][position() = -1 or position() = 3]');

        path = TP.jpc('$..book[-1:]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][position() >= last() + 0]');

        path = TP.jpc('$..book[:2]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][position() < 3]');

        path = TP.jpc('$..book[1:2]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][position() >= 2 and position() < 3]');

        path = TP.jpc('$..book[-2:]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][position() >= last() + -1]');

        path = TP.jpc('$..book[2:]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][position() >= 3]');

        //  ---

        path = TP.jpc('$..book[(@.length-1)]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][position() = last() + 1-1]');

        path = TP.jpc('$..book[?(@.isbn)]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][./isbn]');

        path = TP.jpc('$..book[?(@.price < 10)]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][./price < 10]');

        path = TP.jpc('$..book[?(@.isbn && @.price < 10)]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][./isbn and ./price < 10]');

        path = TP.jpc('$..book[?(@.isbn || @.price < 10)]').asXPath();
        test.assert.isEqualTo(path, '//book[not(@type="array")][./isbn or ./price < 10]');

        //  ---

        path = TP.jpc('$..*').asXPath();
        test.assert.isEqualTo(path, '//*');

        path = TP.jpc('$').asXPath();
        test.assert.isEqualTo(path, '//*');

        path = TP.jpc('$.store').asXPath();
        test.assert.isEqualTo(path, '/store');

        //  ---

        path = TP.jpc('$.children[0].^').asXPath();
        test.assert.isEqualTo(path, '/children/*[position() = 1]/..');

        path = TP.jpc('$.store.book[*].reviews[?(@.nyt == @.cst)].^.title').asXPath();
        test.assert.isEqualTo(path, '/store//book/reviews/*[./nyt = ./cst]/../title');
    });
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst simple value Hash traversal',
function() {

    var singleLevelModel,
        singleLevelPath,

        multiLevelModel,
        multiLevelPath;

    this.before(function() {
        singleLevelModel = TP.json2js('{"foo":{"hi":"there"}}');
        singleLevelPath = TP.apc('foo.hi');

        multiLevelModel =
            TP.json2js('{"foo":{"hi":{"boo":"goo","moo":"too"}}}');
        multiLevelPath = TP.apc('foo.hi.boo');
    });

    this.it('single level get', function(test, options) {
        var val;

        val = singleLevelPath.executeGet(singleLevelModel);

        test.assert.isEqualTo(val, 'there');
    });

    this.it('single level set', function(test, options) {
        var val;

        singleLevelPath.executeSet(singleLevelModel, 'folks', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = singleLevelModel.at('foo').at('hi');

        test.assert.isEqualTo(val, 'folks');
    });

    this.it('multiple level get', function(test, options) {
        var val;

        val = multiLevelPath.executeGet(multiLevelModel);

        test.assert.isEqualTo(val, 'goo');
    });

    this.it('multiple level set', function(test, options) {
        var val;

        multiLevelPath.executeSet(multiLevelModel, 'foofy', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = multiLevelModel.at('foo').at('hi').at('boo');

        test.assert.isEqualTo(val, 'foofy');
    });
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst simple value Array traversal',
function() {

    var singleLevelModel,
        singleLevelPath,

        multiLevelModel,
        multiLevelPath;

    this.before(function() {
        singleLevelModel = TP.json2js('["one", "two", ["a", "b", "c"]]');
        singleLevelPath = TP.apc('2.1');

        multiLevelModel =
            TP.json2js('["one", "two", ["a", ["6", "7", "8"], "c"]]');
        multiLevelPath = TP.apc('2.1.2');
    });

    this.it('single level get', function(test, options) {
        var val;

        val = singleLevelPath.executeGet(singleLevelModel);

        test.assert.isEqualTo(val, 'b');
    });

    this.it('single level set', function(test, options) {
        var val;

        singleLevelPath.executeSet(singleLevelModel, 'z', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = singleLevelModel.at(2).at(1);

        test.assert.isEqualTo(val, 'z');
    });

    this.it('multiple level get', function(test, options) {
        var val;

        val = multiLevelPath.executeGet(multiLevelModel);

        test.assert.isEqualTo(val, '8');
    });

    this.it('multiple level set', function(test, options) {
        var val;

        multiLevelPath.executeSet(multiLevelModel, '9', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = multiLevelModel.at(2).at(1).at(2);

        test.assert.isEqualTo(val, '9');
    });
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst complex value Hash traversal',
function() {

    var tailResultsModel,
        tailResultsPath,

        middleResultsModel,
        middleResultsPath;

    this.before(function() {
        tailResultsModel = TP.json2js(
            '{"foo":{"hi":{"boo":"goo","moo":"too"}}}');
        tailResultsPath = TP.apc('foo.hi[boo,moo]');

        middleResultsModel = TP.json2js(
            '{"foo":{"hi":{"boo":{"gar":"bar"},"moo":{"gar":"tar"}}}}');
        middleResultsPath = TP.apc('foo.hi[boo,moo].gar');
    });

    this.it('tail results get', function(test, options) {
        var val;

        val = tailResultsPath.executeGet(tailResultsModel);

        test.assert.isEqualTo(val, TP.ac('goo', 'too'));
    });

    this.it('tail results set', function(test, options) {
        var val;

        tailResultsPath.executeSet(tailResultsModel, TP.hc('roo', 'coo'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = tailResultsModel.at('foo').at('hi').at('boo');

        test.assert.isEqualTo(val, TP.hc('roo', 'coo'));

        val = tailResultsModel.at('foo').at('hi').at('moo');

        test.assert.isEqualTo(val, TP.hc('roo', 'coo'));
    });

    this.it('middle results get', function(test, options) {
        var val;

        val = middleResultsPath.executeGet(middleResultsModel);

        test.assert.isEqualTo(val, TP.ac('bar', 'tar'));
    });

    this.it('middle results set', function(test, options) {
        var val;

        middleResultsPath.executeSet(middleResultsModel, 'car', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = middleResultsModel.at('foo').at('hi').at('boo').at('gar');

        test.assert.isEqualTo(val, 'car');

        val = middleResultsModel.at('foo').at('hi').at('moo').at('gar');

        test.assert.isEqualTo(val, 'car');
    });
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst complex value Array traversal',
function() {

    var tailResultsModel,
        tailResultsPath,

        middleResultsModel,
        middleResultsPath;

    this.before(function() {
        tailResultsModel = TP.json2js(
            '["one", "two", ["a", ["6", "7", "8"], "c"]]');
        tailResultsPath = TP.apc('2[1,2]');

        middleResultsModel = tailResultsModel;
        middleResultsPath = TP.apc('2[1,2].2');
    });

    this.it('tail results get', function(test, options) {
        var val;

        val = tailResultsPath.executeGet(tailResultsModel);

        test.assert.isEqualTo(val, TP.ac(TP.ac('6', '7', '8'), 'c'));
    });

    this.it('tail results set', function(test, options) {
        var val;

        tailResultsPath.executeSet(
            tailResultsModel, TP.ac('4', '5', '6'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = tailResultsModel.at(2).at(1);

        test.assert.isEqualTo(val, TP.ac('4', '5', '6'));

        val = tailResultsModel.at(2).at(2);

        test.assert.isEqualTo(val, TP.ac('4', '5', '6'));
    });

    this.it('middle results get', function(test, options) {
        var val;

        val = middleResultsPath.executeGet(middleResultsModel);

        test.assert.isEqualTo(val, TP.ac('6', '6'));
    });

    this.it('middle results set', function(test, options) {
        var val;

        middleResultsPath.executeSet(middleResultsModel, 'hi', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = middleResultsModel.at(2).at(1).at(2);

        test.assert.isEqualTo(val, 'hi');

        val = middleResultsModel.at(2).at(2).at(2);

        test.assert.isEqualTo(val, 'hi');
    });
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst slicing Array traversal',
function() {

    var slicingResultsModel;

    this.before(function() {
        slicingResultsModel =
            TP.json2js('["one", "two", ["a", ["6", "7", "8"], "c"], 37, "hi"]');
    });

    this.it('slicing get #1', function(test, options) {
        var val,
            path;

        path = TP.apc('[0:2]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac('one', 'two'));
    });

    this.it('slicing get #2', function(test, options) {
        var val,
            path;

        path = TP.apc('[:2]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac('one', 'two'));
    });

    this.it('slicing get #3', function(test, options) {
        var val,
            path;

        path = TP.apc('[2:]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac(TP.ac('a', TP.ac('6', '7', '8'), 'c'), 37, 'hi'));
    });

    this.it('slicing get #4', function(test, options) {
        var val,
            path;

        path = TP.apc('[-2:]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac(37, 'hi'));
    });

    this.it('slicing get #5', function(test, options) {
        var val,
            path;

        path = TP.apc('[:-2]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac('one', 'two', TP.ac('a', TP.ac('6', '7', '8'), 'c')));
    });

    this.it('slicing get #6', function(test, options) {
        var val,
            path;

        path = TP.apc('[2:-1]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac(TP.ac('a', TP.ac('6', '7', '8'), 'c'), 37));
    });

    this.it('slicing get #7', function(test, options) {
        var val,
            path;

        path = TP.apc('[1:6:2]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac('two', 37));
    });

    this.it('slicing get #8', function(test, options) {
        var val,
            path;

        path = TP.apc('[6:1:-2]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac(undefined, 37));
    });
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst simple value Array and Hash traversal',
function() {

    var singleLevelModel,
        singleLevelPath,

        multiLevelModel,
        multiLevelPath;

    this.before(function() {
        singleLevelModel = TP.json2js('{"foo":["1st","2nd",{"hi":"there"}]}');
        singleLevelPath = TP.apc('foo.1');

        multiLevelModel = singleLevelModel;
        multiLevelPath = TP.apc('foo.2.hi');
    });

    this.it('single level get', function(test, options) {
        var val;

        val = singleLevelPath.executeGet(singleLevelModel);

        test.assert.isEqualTo(val, '2nd');
    });

    this.it('single level set', function(test, options) {
        var val;

        singleLevelPath.executeSet(singleLevelModel, '3rd', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = singleLevelModel.at('foo').at(1);

        test.assert.isEqualTo(val, '3rd');
    });

    this.it('multiple level get', function(test, options) {
        var val;

        val = multiLevelPath.executeGet(multiLevelModel);

        test.assert.isEqualTo(val, 'there');
    });

    this.it('multiple level set', function(test, options) {
        var val;

        multiLevelPath.executeSet(multiLevelModel, 'boo boo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = multiLevelModel.at('foo').at('2').at('hi');

        test.assert.isEqualTo(val, 'boo boo');
    });
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst complex value Array and Hash traversal',
function() {

    var model1,

        path1,
        path2,
        path3,
        path4;

    this.before(
        function() {
            model1 = TP.json2js(
                '[' +
                    '{"fname":"bill", "lname":"edney", "aliases":["billy", "willy", "eds"]},' +
                    '{"fname":"scott", "lname":"shattuck"},' +
                    '{"fname":"jim", "lname":"bowery"},' +
                    '{"fname":"another", "lname":"hacker"}' +
                ']');

            path1 = TP.apc('0.fname');
            path2 = TP.apc('[0,2].fname');
            path3 = TP.apc('0.aliases[1:2]');
            path4 = TP.apc('0.aliases[:-1]');
        });

    this.after(
        function() {
            model1 = null;

            path1 = null;
            path2 = null;
            path3 = null;
            path4 = null;
        });

    this.it('tail results get', function(test, options) {
        var val;

        val = path1.executeGet(model1);

        test.assert.isEqualTo(val, 'bill');
    });

    this.it('tail results set', function(test, options) {
        var val;

        path1.executeSet(model1, 'William', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = model1.at('0').at('fname');

        test.assert.isEqualTo(val, 'William');
    });

    this.it('middle results get', function(test, options) {
        var val;

        val = path2.executeGet(model1);

        test.assert.isEqualTo(val, TP.ac('William', 'jim'));
    });

    this.it('middle results single value set', function(test, options) {
        var val;

        path2.executeSet(model1, 'William', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = model1.at(0).at('fname');

        test.assert.isEqualTo(val, 'William');

        val = model1.at(2).at('fname');

        test.assert.isEqualTo(val, 'William');
    });

    this.it('middle results multi value set', function(test, options) {
        var val;

        path2.executeSet(model1, TP.ac('Willy', 'Jimmy'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = model1.at(0).at('fname');

        test.assert.isEqualTo(val, TP.ac('Willy', 'Jimmy'));

        val = model1.at(2).at('fname');

        test.assert.isEqualTo(val, TP.ac('Willy', 'Jimmy'));
    });

    this.it('tail results slicing get', function(test, options) {
        var val;

        val = path3.executeGet(model1);

        test.assert.isEqualTo(val, 'willy');
    });

    this.it('tail results slicing set', function(test, options) {
        var val;

        path3.executeSet(model1, TP.ac('willy', 'jimmy'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = model1.at('0').at('aliases').at(1);

        test.assert.isEqualTo(val, TP.ac('willy', 'jimmy'));
    });

    this.it('tail results multi-value slicing get', function(test, options) {
        var val;

        val = path4.executeGet(model1);

        test.assert.isEqualTo(val, TP.ac('billy', TP.ac('willy', 'jimmy')));
    });

    this.it('tail results multi-value slicing set', function(test, options) {
        var val;

        path4.executeSet(model1, TP.ac('bobby', 'jimmy'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = model1.at('0').at('aliases').at(0);

        test.assert.isEqualTo(val, TP.ac('bobby', 'jimmy'));

        val = model1.at('0').at('aliases').at(1);

        test.assert.isEqualTo(val, TP.ac('bobby', 'jimmy'));
    });
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst complex value Hash traversal with creation',
function() {

    var model1,
        path1,
        path2;

    this.before(function() {
        model1 = TP.json2js('{"foo":{"hi":"there"}}');
        path1 = TP.apc('bar.moo');
        path2 = TP.apc('bar[moo,too].noo');
    });

    this.it('single level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path1.executeSet(model1, 'goo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('bar');

        this.refute.isDefined(val);
    });

    this.it('single level set with creation', function(test, options) {
        var val;

        path1.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path1.executeSet(model1, 'goo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('bar').at('moo');

        test.assert.isEqualTo(val, 'goo');
    });

    this.it('multi level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path2.executeSet(model1, 'boo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  Note - there is a value at 'moo' - it's old value. But structure
        //  building wasn't enabled, which means that the path couldn't traverse
        //  to 'noo', thereby not creating an Object and blowing away 'moo's old
        //  value.
        //  This also means there will be no value at 'too'.

        val = model1.at('bar').at('moo');

        test.assert.isEqualTo(val, 'goo');

        val = model1.at('bar').at('too');

        this.refute.isDefined(val);
    });

    this.it('multi level set with creation', function(test, options) {
        var val;

        path2.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path2.executeSet(model1, 'boo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('bar').at('moo').at('noo');

        test.assert.isEqualTo(val, 'boo');
    });
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst complex value Array traversal with creation',
function() {

    var model1,
        path1,
        path2,
        path3;

    this.before(function() {
        model1 = TP.json2js('["one", "two", ["a", "b", "c"]]');
        path1 = TP.apc('3.1');
        path2 = TP.apc('3.1[0,4]');
        path3 = TP.apc('3.1[1:4]');
    });

    this.it('single level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path1.executeSet(model1, 'four', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at(3);

        this.refute.isDefined(val);
    });

    this.it('single level set with creation', function(test, options) {
        var val;

        path1.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path1.executeSet(model1, 'four', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at(3).at(1);

        test.assert.isEqualTo(val, 'four');
    });

    this.it('multi level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path2.executeSet(model1, 'stuff', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  Note - there is a value at 0 - the 'f' from the word 'four' that we
        //  set above.

        val = model1.at(3).at(1).at(0);

        test.assert.isEqualTo(val, 'f');

        val = model1.at(3).at(1).at(4);

        test.assert.isEmpty(val);
    });

    this.it('multi level set with creation', function(test, options) {
        var val;

        path2.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path2.executeSet(model1, 'stuff', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at(3).at(1).at(0);

        test.assert.isEqualTo(val, 'stuff');

        val = model1.at(3).at(1).at(4);

        test.assert.isEqualTo(val, 'stuff');
    });

    this.it('slicing results set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path3.executeSet(model1, 'foofy', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  Note - there is a value at 0 - the 'f' from the word 'four' that we
        //  set above.

        //  Even though we have creation turned off, the call above did not
        //  require 'structure creating' - the values should have been set.
        val = model1.at(3).at(1).at(1);

        test.assert.isEqualTo(val, 'foofy');

        val = model1.at(3).at(1).at(2);

        test.assert.isEqualTo(val, 'foofy');

        val = model1.at(3).at(1).at(3);

        test.assert.isEqualTo(val, 'foofy');

        //  This value should still be 'stuff' - the '1:4' range means items
        //  1-3.
        val = model1.at(3).at(1).at(4);

        test.assert.isEqualTo(val, 'stuff');
    });

    this.it('slicing results set with creation', function(test, options) {
        this.todo();
    });
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst complex value Array and Hash traversal with creation',
function() {

    var model1,
        path1,
        path2;

    this.before(function() {
        model1 = TP.json2js('{"foo":["1st","2nd",{"hi":"there"}]}');
        path1 = TP.apc('foo.3.bar');
        path2 = TP.apc('foo.3[bar,moo,too].roo');
    });

    this.it('single level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path1.executeSet(model1, 'goo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('foo').at(3);

        this.refute.isDefined(val);
    });

    this.it('single level set with creation', function(test, options) {
        var val;

        path1.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path1.executeSet(model1, 'goo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('foo').at(3).at('bar');

        test.assert.isEqualTo(val, 'goo');
    });

    this.it('multi level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path2.executeSet(model1, TP.ac(), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  Note - there is a value at 'bar' - it was set above, but there
        //  shouldn't be one at 'moo' or 'too'.
        val = model1.at('foo').at(3).at('bar');

        test.assert.isEqualTo(val, 'goo');

        val = model1.at('foo').at(3).at('moo');

        this.refute.isDefined(val);

        val = model1.at('foo').at(3).at('too');

        this.refute.isDefined(val);
    });

    this.it('multi level set with creation', function(test, options) {
        var val;

        path2.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path2.executeSet(model1, TP.ac(), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('foo').at(3).at('bar').at('roo');

        test.assert.isArray(val);

        val = model1.at('foo').at(3).at('moo').at('roo');

        test.assert.isArray(val);

        val = model1.at('foo').at(3).at('too').at('roo');

        test.assert.isArray(val);
    });
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.describe('TP.core.ComplexTIBETPath Inst parameterized path traversal',
function() {

    var model1,
        path1,
        path2,
        path3,
        path4;

    this.before(function() {
        model1 = TP.json2js(
            '{"foo":["1st","2nd","3rd","4th",["A","B","C"],["X","Y","Z"]]}');
        path1 = TP.apc('foo.{{0}}');
        path2 = TP.apc('foo[{{0}}:{{1}}]');
        path3 = TP.apc('foo.{{0}}.{{1}}');
        path4 = TP.apc('foo[{{0}}:{{1}}].{{2}}');
    });

    this.it('single level get', function(test, options) {
        var val;

        val = path1.executeGet(model1, 1);

        test.assert.isEqualTo(val, '2nd');
    });

    this.it('single level get slice', function(test, options) {
        var val;

        val = path2.executeGet(model1, 1, 4);

        test.assert.isEqualTo(val, TP.ac('2nd', '3rd', '4th'));
    });

    this.it('multi level get', function(test, options) {
        var val;

        val = path3.executeGet(model1, 4, 0);

        test.assert.isEqualTo(val, 'A');
    });

    this.it('multi level get slice', function(test, options) {
        var val;

        val = path4.executeGet(model1, 4, 6, 0);

        test.assert.isEqualTo(val, TP.ac('A', 'X'));
    });

    this.it('single level set', function(test, options) {
        var val;

        //  Note here how it's model, value, shouldSignal, parameter1ToPath
        path1.executeSet(model1, 'boo', false, 1);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('foo').at(1);

        test.assert.isEqualTo(val, 'boo');
    });

    this.it('single level set slice', function(test, options) {
        var val;

        //  Note here how it's model, value, shouldSignal, parameter1ToPath,
        //  parameter2ToPath
        path2.executeSet(model1, 'bar', false, 1, 3);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('foo').at(1);

        test.assert.isEqualTo(val, 'bar');

        val = model1.at('foo').at(2);

        test.assert.isEqualTo(val, 'bar');
    });

    this.it('multi level set', function(test, options) {
        var val;

        //  Note here how it's model, value, shouldSignal, parameter1ToPath,
        //  parameter2ToPath
        path3.executeSet(model1, 'baz', false, 4, 0);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('foo').at(4).at(0);

        test.assert.isEqualTo(val, 'baz');
    });

    this.it('multi level get slice', function(test, options) {
        var val;

        //  Note here how it's model, value, shouldSignal, parameter1ToPath,
        //  parameter2ToPath
        path4.executeSet(model1, 'goo', false, 4, 6, 0);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('foo').at(4).at(0);

        test.assert.isEqualTo(val, 'goo');

        val = model1.at('foo').at(5).at(0);

        test.assert.isEqualTo(val, 'goo');
    });
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.describe('TP.core.XPathPath Inst simple value XML traversal',
function() {

    var model1,
        path1,

        model2,
        path2;

    this.before(function() {
        model1 = TP.tpdoc('<emp><lname>Edney</lname></emp>');
        path1 = TP.apc('/emp/lname').set('shouldCollapse', true);

        model2 = TP.tpdoc('<emp><lname>Edney</lname><age>47</age></emp>');
        path2 = TP.apc('/emp/lname|/emp/age').set('shouldCollapse', true);
    });

    this.it('single value get', function(test, options) {
        var result,
            val;

        result = path1.executeGet(model1);

        //  This will return the node's text value
        val = TP.val(result);

        test.assert.isEqualTo(val, 'Edney');
    });

    this.it('single value set', function(test, options) {
        var result,
            val;

        path1.executeSet(model1, 'Smith', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return a single native Element
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/lname', null, true);

        //  This will return the node's text value
        val = TP.val(result);

        test.assert.isEqualTo(val, 'Smith');
    });

    this.it('multiple value get', function(test, options) {
        var result,
            val;

        result = path2.executeGet(model2);

        //  This will return the node's text value
        val = TP.val(result.at(0));

        test.assert.isEqualTo(val, 'Edney');

        val = TP.val(result.at(1));

        test.assert.isEqualTo(val, '47');
    });

    this.it('multiple value set', function(test, options) {
        var result,
            val;

        path2.executeSet(model2, 'fluffy', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return a single native Element
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model2), '/emp/lname|/emp/age', null, true);

        //  This will return the node's text value
        val = TP.val(result.at(0));

        test.assert.isEqualTo(val, 'fluffy');

        val = TP.val(result.at(1));

        test.assert.isEqualTo(val, 'fluffy');
    });
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.describe('TP.core.XPathPath Inst complex value XML traversal',
function() {

    var model1,
        path1,

        setPath,

        model2,
        path2;

    this.before(function() {
        model1 = TP.tpdoc('<emp><lname>Edney</lname></emp>');
        path1 = TP.apc('/emp/lname').set('shouldCollapse', true);

        setPath = TP.apc('/emp').set('shouldCollapse', true);

        model2 = TP.tpdoc('<emp><lname>Edney</lname><age>47</age></emp>');
        path2 = TP.apc('/emp/lname|/emp/age').set('shouldCollapse', true);
    });

    this.it('single value get', function(test, options) {
        var val;

        val = path1.executeGet(model1);

        test.assert.isEqualTo(val, TP.elem('<lname>Edney</lname>'));
    });

    this.it('single value set', function(test, options) {
        var val;

        setPath.executeSet(model1, TP.elem('<fooname>Foodney</fooname>'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return a single native Element
        val = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/fooname', null, true);

        test.assert.isEqualTo(val, TP.elem('<fooname>Foodney</fooname>'));
    });

    this.it('multiple value get', function(test, options) {
        var val;

        val = path2.executeGet(model2);

        test.assert.isEqualTo(val.at(0), TP.elem('<lname>Edney</lname>'));

        test.assert.isEqualTo(val.at(1), TP.elem('<age>47</age>'));
    });

    this.it('multiple value set', function(test, options) {
        var val;

        setPath.executeSet(model2, TP.frag('<barname>Bardney</barname><barage>470</barage>'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return a single native Element
        val = TP.nodeEvaluatePath(
                    TP.unwrap(model2), '/emp/barname|/emp/barage', null, true);

        test.assert.isEqualTo(val.at(0), TP.elem('<barname>Bardney</barname>'));

        test.assert.isEqualTo(val.at(1), TP.elem('<barage>470</barage>'));
    });
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.describe('TP.core.XPathPath Inst simple value XML traversal with creation',
function() {

    var model1,
        path1,

        path2;

    this.before(function() {
        model1 = TP.tpdoc('<emp><lname>Edney</lname><age>47</age></emp>');
        path1 = TP.apc('/emp/fname');

        path2 = TP.apc('/emp/fname|/emp/nickname');
    });

    this.it('single value set', function(test, options) {
        var oldLogLevel,

            result,
            val;

        //  Turn off logging of WARN and below for now - otherwise, the fact
        //  that we don't have creation turned on will log to the console
        oldLogLevel = TP.getLogLevel();
        TP.setLogLevel(TP.ERROR);

        //  Shouldn't create - by default, we have creation turned off
        path1.executeSet(model1, 'William', true);

        //  Put log level back to what it was
        TP.setLogLevel(oldLogLevel);

        //  NB: We use a manual mechanism to get to the value to get
        //  independent validation of 'path' execution code.

        //  This will return a null
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/fname', null, true);

        //  This will return its text value - a null
        val = TP.val(result);

        test.assert.isNull(val);

        //  Turn ON creation
        path1.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path1.executeSet(model1, 'William', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return a single native Element
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/fname', null, true);

        //  This will return its text value
        val = TP.val(result);

        test.assert.isEqualTo(val, 'William');
    });

    this.it('multiple value set', function(test, options) {

        var oldLogLevel,

            result,
            val;

        //  Turn off logging of WARN and below for now - otherwise, the fact
        //  that we don't have creation turned on will log to the console
        oldLogLevel = TP.getLogLevel();
        TP.setLogLevel(TP.ERROR);

        //  Shouldn't create - by default, we have creation turned off
        path2.executeSet(model1, 'Bill', true);

        //  Put log level back to what it was
        TP.setLogLevel(oldLogLevel);

        //  Note - there is a value at '/emp/fname' - the new value set in the
        //  test case above. But structure building wasn't enabled for this
        //  path, which means that there will be no value at '/emp/nickname'.

        //  NB: We use a manual mechanism to get to the value to get
        //  independent validation of 'path' execution code.

        //  This will return a single native Element
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/fname', null, true);

        //  This will return the text value for '/emp/fname'
        val = TP.val(result);

        test.assert.isEqualTo(val, 'Bill');

        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/nickname', null, true);

        //  This will return the text value for '/emp/nickname' - a null
        val = TP.val(result);

        test.assert.isNull(val);

        //  Turn ON creation
        path2.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path2.executeSet(model1, 'Bill', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return an Array of native Elements
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/fname|/emp/nickname', null, true);

        //  This will return the text value for '/emp/fname'
        val = TP.val(result.at(0));

        test.assert.isEqualTo(val, 'Bill');

        //  This will return the text value for '/emp/nickname'
        val = TP.val(result.at(1));

        test.assert.isEqualTo(val, 'Bill');
    });
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.describe('TP.core.XPathPath Inst complex value XML traversal with creation',
function() {

    var model1,
        path1,

        path2;

    this.before(function() {
        model1 = TP.tpdoc('<emp><lname>Edney</lname><age>47</age></emp>');
        path1 = TP.apc('/emp/vitals');

        path2 = TP.apc('/emp/billingaddress|/emp/shippingaddress');
    });

    this.it('single value set', function(test, options) {
        var oldLogLevel,

            result,
            val;

        //  Turn off logging of WARN and below for now - otherwise, the fact
        //  that we don't have creation turned on will log to the console
        oldLogLevel = TP.getLogLevel();
        TP.setLogLevel(TP.ERROR);

        //  Shouldn't create - by default, we have creation turned off
        path1.executeSet(model1, TP.elem('<bp>110/70</bp>'), true);

        //  Put log level back to what it was
        TP.setLogLevel(oldLogLevel);

        //  NB: We use a manual mechanism to get to the value to get
        //  independent validation of 'path' execution code.

        //  This will return a null
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/vitals/bp', null, true);

        //  This will return its text value - a null
        val = TP.val(result);

        test.assert.isNull(val);

        //  Turn ON creation
        path1.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path1.executeSet(model1, TP.elem('<bp>110/70</bp>'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return a single native Element
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/vitals/bp', null, true);

        test.assert.isEqualTo(result, TP.elem('<bp>110/70</bp>'));
    });

    this.it('multiple value set', function(test, options) {

        var oldLogLevel,

            newFrag,
            testFrag,

            result,
            val;

        //  Turn off logging of WARN and below for now - otherwise, the fact
        //  that we don't have creation turned on will log to the console
        oldLogLevel = TP.getLogLevel();
        TP.setLogLevel(TP.ERROR);

        newFrag = TP.frag('<street>111 Main St.</street><city>Anytown</city><state>intoxication</state><postalcode>11111-1111</postalcode>');

        testFrag = TP.nodeCloneNode(newFrag, true);

        //  Shouldn't create - by default, we have creation turned off
        path2.executeSet(model1, newFrag, true);

        //  Put log level back to what it was
        TP.setLogLevel(oldLogLevel);

        //  Note - there is a value at '/emp/fname' - the new value set in the
        //  test case above. But structure building wasn't enabled for this
        //  path, which means that there will be no value at '/emp/nickname'.

        //  NB: We use a manual mechanism to get to the value to get
        //  independent validation of 'path' execution code.

        //  This will return the value for billing address - a null
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/billingaddress', null, true);

        val = result;

        test.assert.isNull(val);

        //  This will return the value for shipping address - a null
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/shippingaddress', null, true);

        val = result;

        test.assert.isNull(val);

        //  Turn ON creation
        path2.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path2.executeSet(model1, newFrag, true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return an Array of native Elements
        result = TP.nodeEvaluatePath(
            TP.unwrap(model1),
            '/emp/billingaddress|/emp/shippingaddress',
            null,
            true);

        val = TP.nodeListAsFragment(result.at(0).childNodes);

        test.assert.isEqualTo(val, testFrag);

        val = TP.nodeListAsFragment(result.at(1).childNodes);

        test.assert.isEqualTo(val, testFrag);
    });
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.describe('TP.core.XPathPath Inst attribute value XML traversal',
function() {

    var model1,
        path1,
        path2;

    this.before(function() {
        model1 = TP.tpdoc('<emp><lname foo="bar">Edney</lname><age baz="goo">47</age></emp>');
        path1 = TP.apc('/emp/lname/@foo').set('shouldCollapse', true);
        path2 = TP.apc('/emp/lname/@foo|/emp/age/@baz').set('shouldCollapse', true);
    });

    this.it('single value get', function(test, options) {
        var result,
            val;

        //  This will return a native Attribute node.
        result = path1.executeGet(model1);

        //  This will return the node's text value
        val = TP.val(result);

        test.assert.isEqualTo(val, 'bar');
    });

    this.it('single value set', function(test, options) {
        var result,
            val;

        path1.executeSet(model1, 'fluffy', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return a single native Attribute node
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/lname/@foo', null, true);

        //  This will return the node's text value
        val = TP.val(result);

        test.assert.isEqualTo(val, 'fluffy');
    });

    this.it('multiple value get', function(test, options) {
        var result,
            val;

        result = path2.executeGet(model1);

        //  This will return the node's text value
        val = TP.val(result.at(0));

        test.assert.isEqualTo(val, 'fluffy');

        val = TP.val(result.at(1));

        test.assert.isEqualTo(val, 'goo');
    });

    this.it('multiple value set', function(test, options) {
        var result,
            val;

        path2.executeSet(model1, 'barfy', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return a single native Element
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1),
                    '/emp/lname/@foo|/emp/age/@baz',
                    null,
                    true);

        //  This will return the node's text value
        val = TP.val(result.at(0));

        test.assert.isEqualTo(val, 'barfy');

        val = TP.val(result.at(1));

        test.assert.isEqualTo(val, 'barfy');
    });
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.describe('TP.core.XPathPath Inst attribute value XML traversal with creation',
function() {

    var model1,
        path1,

        model2,
        path2;

    this.before(function() {
        model1 = TP.tpdoc('<emp><lname>Edney</lname><age>47</age></emp>');
        path1 = TP.apc('/emp/fname/@foo');

        model2 = TP.tpdoc('<emp><lname>Edney</lname><age>47</age></emp>');
        path2 = TP.apc('/emp/lname/@foo|/emp/age/@bar');
    });

    this.it('single value set', function(test, options) {
        var oldLogLevel,

            result,
            val;

        //  Turn off logging of WARN and below for now - otherwise, the fact
        //  that we don't have creation turned on will log to the console
        oldLogLevel = TP.getLogLevel();
        TP.setLogLevel(TP.ERROR);

        //  Shouldn't create - by default, we have creation turned off
        path1.executeSet(model1, 'moo', true);

        //  Put log level back to what it was
        TP.setLogLevel(oldLogLevel);

        //  NB: We use a manual mechanism to get to the value to get
        //  independent validation of 'path' execution code.

        //  This will return a null
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/fname/@foo', null, true);

        //  This will return its text value - a null
        val = TP.val(result);

        test.assert.isNull(val);

        //  Turn ON creation
        path1.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path1.executeSet(model1, 'moo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return a single native Attribute node
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/fname/@foo', null, true);

        //  This will return its text value
        val = TP.val(result);

        test.assert.isEqualTo(val, 'moo');
    });

    this.it('multiple value set', function(test, options) {

        var oldLogLevel,

            result,
            val;

        //  Turn off logging of WARN and below for now - otherwise, the fact
        //  that we don't have creation turned on will log to the console
        oldLogLevel = TP.getLogLevel();
        TP.setLogLevel(TP.ERROR);

        //  Shouldn't create - by default, we have creation turned off
        path2.executeSet(model2, 'goo', true);

        //  Put log level back to what it was
        TP.setLogLevel(oldLogLevel);

        //  Note - there is a value at '/emp/fname' - the new value set in the
        //  test case above. But structure building wasn't enabled for this
        //  path, which means that there will be no value at '/emp/nickname'.

        //  NB: We use a manual mechanism to get to the value to get
        //  independent validation of 'path' execution code.

        //  This will return a single native Element
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model2), '/emp/fname/@foo', null, true);

        //  This will return the text value for '/emp/fname/@foo' - a null
        val = TP.val(result);

        test.assert.isNull(val);

        result = TP.nodeEvaluatePath(
                    TP.unwrap(model2), '/emp/age/@bar', null, true);

        //  This will return the text value for '/emp/age/@bar' - a null
        val = TP.val(result);

        test.assert.isNull(val);

        //  path2 = TP.apc('/emp/fname/@foo|/emp/age/@bar');

        //  Turn ON creation
        path2.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path2.executeSet(model2, 'goo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return an Array of native Elements
        result = TP.nodeEvaluatePath(
                    TP.unwrap(model2),
                    '/emp/lname/@foo|/emp/age/@bar',
                    null,
                    true);

        //  This will return the text value for '/emp/fname'
        val = TP.val(result.at(0));

        test.assert.isEqualTo(val, 'goo');

        //  This will return the text value for '/emp/nickname'
        val = TP.val(result.at(1));

        test.assert.isEqualTo(val, 'goo');
    });
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.describe('TP.core.XPathPath Inst parameterized path traversal',
function() {

    var model1,
        path1,

        setPath,

        model2,
        path2;

    this.before(function() {
        model1 = TP.tpdoc('<emp><lname>Edney</lname></emp>');
        path1 = TP.apc('/emp/{{0}}').set('shouldCollapse', true);

        setPath = TP.apc('/{{0}}').set('shouldCollapse', true);

        model2 = TP.tpdoc('<emp><lname>Edney</lname><age>47</age></emp>');
        path2 = TP.apc('/emp/{{0}}|/emp/{{1}}').set('shouldCollapse', true);
    });

    this.it('single value get', function(test, options) {
        var val;

        val = path1.executeGet(model1, 'lname');

        test.assert.isEqualTo(val, TP.elem('<lname>Edney</lname>'));
    });

    this.it('single value set', function(test, options) {
        var val;

        setPath.executeSet(model1, TP.elem('<fooname>Foodney</fooname>'),
                            true, 'emp');

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return a single native Element
        val = TP.nodeEvaluatePath(
                    TP.unwrap(model1), '/emp/fooname', null, true);

        test.assert.isEqualTo(val, TP.elem('<fooname>Foodney</fooname>'));
    });

    this.it('multiple value get', function(test, options) {
        var val;

        val = path2.executeGet(model2, 'lname', 'age');

        test.assert.isEqualTo(val.at(0), TP.elem('<lname>Edney</lname>'));

        test.assert.isEqualTo(val.at(1), TP.elem('<age>47</age>'));
    });

    this.it('multiple value set', function(test, options) {
        var val;

        setPath.executeSet(
            model2,
            TP.frag('<barname>Bardney</barname><barage>470</barage>'),
            true,
            'lname',
            'age');

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  This will return a single native Element
        val = TP.nodeEvaluatePath(
                    TP.unwrap(model2), '/emp/barname|/emp/barage', null, true);

        test.assert.isEqualTo(val.at(0), TP.elem('<barname>Bardney</barname>'));

        test.assert.isEqualTo(val.at(1), TP.elem('<barage>470</barage>'));
    });
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath Inst simple value Hash traversal',
function() {

    var singleLevelModel,
        singleLevelPath,

        multiLevelModel,
        multiLevelPath;

    this.before(function() {
        singleLevelModel = TP.core.JSONContent.construct('{"foo":{"hi":"there"}}');
        singleLevelPath = TP.apc('$.foo.hi');

        multiLevelModel =
            TP.core.JSONContent.construct('{"foo":{"hi":{"boo":"goo","moo":"too"}}}');
        multiLevelPath = TP.apc('$.foo.hi.boo');
    });

    this.it('single level get', function(test, options) {
        var val;

        val = singleLevelPath.executeGet(singleLevelModel);

        test.assert.isEqualTo(val, 'there');
    });

    this.it('single level set', function(test, options) {
        var val;

        singleLevelPath.executeSet(singleLevelModel, 'folks', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = singleLevelModel.get('data').foo.hi;

        test.assert.isEqualTo(val, 'folks');
    });

    this.it('multiple level get', function(test, options) {
        var val;

        val = multiLevelPath.executeGet(multiLevelModel);

        test.assert.isEqualTo(val, 'goo');
    });

    this.it('multiple level set', function(test, options) {
        var val;

        multiLevelPath.executeSet(multiLevelModel, 'foofy', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = multiLevelModel.get('data').foo.hi.boo;

        test.assert.isEqualTo(val, 'foofy');
    });
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath Inst simple value Array traversal',
function() {

    var singleLevelModel,
        singleLevelPath,

        multiLevelModel,
        multiLevelPath;

    this.before(function() {
        singleLevelModel = TP.core.JSONContent.construct('{"value":["one", "two", ["a", "b", "c"]]}');
        singleLevelPath = TP.apc('$.value[2][1]');

        multiLevelModel =
            TP.core.JSONContent.construct('{"value":["one", "two", ["a", ["6", "7", "8"], "c"]]}');
        multiLevelPath = TP.apc('$.value[2][1][2]');
    });

    this.it('single level get', function(test, options) {
        var val;

        val = singleLevelPath.executeGet(singleLevelModel);

        test.assert.isEqualTo(val, 'b');
    });

    this.it('single level set', function(test, options) {
        var val;

        singleLevelPath.executeSet(singleLevelModel, 'z', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = singleLevelModel.get('data').value[2][1];

        test.assert.isEqualTo(val, 'z');
    });

    this.it('multiple level get', function(test, options) {
        var val;

        val = multiLevelPath.executeGet(multiLevelModel);

        test.assert.isEqualTo(val, '8');
    });

    this.it('multiple level set', function(test, options) {
        var val;

        multiLevelPath.executeSet(multiLevelModel, '9', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = multiLevelModel.get('data').value[2][1][2];

        test.assert.isEqualTo(val, '9');
    });
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath Inst complex value Hash traversal',
function() {

    var tailResultsModel,
        tailResultsPath,

        middleResultsModel,
        middleResultsPath;

    this.before(function() {
        tailResultsModel = TP.core.JSONContent.construct(
            '{"foo":{"hi":{"boo":"goo","moo":"too"}}}');
        tailResultsPath = TP.apc('$.foo.hi[boo,moo]');

        middleResultsModel = TP.core.JSONContent.construct(
            '{"foo":{"hi":{"boo":{"gar":"bar"},"moo":{"gar":"tar"}}}}');
        middleResultsPath = TP.apc('$.foo.hi[boo,moo].gar');
    });

    this.it('tail results get', function(test, options) {
        var val;

        val = tailResultsPath.executeGet(tailResultsModel);

        test.assert.isEqualTo(val, TP.ac('goo', 'too'));
    });

    this.it('tail results set', function(test, options) {
        var val;

        tailResultsPath.executeSet(tailResultsModel, {roo: 'coo'}, true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = tailResultsModel.get('data').foo.hi.boo;

        test.assert.isEqualTo(val, {roo: 'coo'});

        val = tailResultsModel.get('data').foo.hi.moo;

        test.assert.isEqualTo(val, {roo: 'coo'});
    });

    this.it('middle results get', function(test, options) {
        var val;

        val = middleResultsPath.executeGet(middleResultsModel);

        test.assert.isEqualTo(val, TP.ac('bar', 'tar'));
    });

    this.it('middle results set', function(test, options) {
        var val;

        middleResultsPath.executeSet(middleResultsModel, 'car', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = middleResultsModel.get('data').foo.hi.boo.gar;

        test.assert.isEqualTo(val, 'car');

        val = middleResultsModel.get('data').foo.hi.moo.gar;

        test.assert.isEqualTo(val, 'car');
    });
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath Inst complex value Array traversal',
function() {

    var tailResultsModel,
        tailResultsPath,

        middleResultsModel,
        middleResultsPath;

    this.before(function() {
        tailResultsModel = TP.core.JSONContent.construct(
            '{"value": ["one", "two", ["a", ["6", "7", "8"], "c"]]}');
        tailResultsPath = TP.apc('$.value[2][1,2]');

        middleResultsModel = tailResultsModel;
        middleResultsPath = TP.apc('$.value[2][1,2][2]');
    });

    this.it('tail results get', function(test, options) {
        var val;

        val = tailResultsPath.executeGet(tailResultsModel);

        test.assert.isEqualTo(val, TP.ac(TP.ac('6', '7', '8'), 'c'));
    });

    this.it('tail results set', function(test, options) {
        var val;

        tailResultsPath.executeSet(
            tailResultsModel, TP.ac('4', '5', '6'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = tailResultsModel.get('data').value[2][1];

        test.assert.isEqualTo(val, TP.ac('4', '5', '6'));

        val = tailResultsModel.get('data').value[2][2];

        test.assert.isEqualTo(val, TP.ac('4', '5', '6'));
    });

    this.it('middle results get', function(test, options) {
        var val;

        val = middleResultsPath.executeGet(middleResultsModel);

        test.assert.isEqualTo(val, TP.ac('6', '6'));
    });

    this.it('middle results set', function(test, options) {
        var val;

        middleResultsPath.executeSet(middleResultsModel, 'hi', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = middleResultsModel.get('data').value[2][1][2];

        test.assert.isEqualTo(val, 'hi');

        val = middleResultsModel.get('data').value[2][2][2];

        test.assert.isEqualTo(val, 'hi');
    });
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath Inst slicing Array traversal',
function() {

    var slicingResultsModel;

    this.before(function() {
        slicingResultsModel =
            TP.core.JSONContent.construct('{"value": ["one", "two", ["a", ["6", "7", "8"], "c"], 37, "hi"]}');
    });

    this.it('slicing get #1', function(test, options) {
        var val,
            path;

        path = TP.apc('$.value[0:2]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac('one', 'two'));
    });

    this.it('slicing get #2', function(test, options) {
        var val,
            path;

        path = TP.apc('$.value[:2]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac('one', 'two'));
    });

    this.it('slicing get #3', function(test, options) {
        var val,
            path;

        path = TP.apc('$.value[2:]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac(TP.ac('a', TP.ac('6', '7', '8'), 'c'), 37, 'hi'));
    });

    this.it('slicing get #4', function(test, options) {
        var val,
            path;

        path = TP.apc('$.value[-2:]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac(37, 'hi'));
    });

    this.it('slicing get #5', function(test, options) {
        var val,
            path;

        path = TP.apc('$.value[:-2]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac('one', 'two', TP.ac('a', TP.ac('6', '7', '8'), 'c')));
    });

    this.it('slicing get #6', function(test, options) {
        var val,
            path;

        path = TP.apc('$.value[2:-1]');
        val = path.executeGet(slicingResultsModel);

        test.assert.isEqualTo(val, TP.ac(TP.ac('a', TP.ac('6', '7', '8'), 'c'), 37));
    });
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath Inst simple value Array and Hash traversal',
function() {

    var singleLevelModel,
        singleLevelPath,

        multiLevelModel,
        multiLevelPath;

    this.before(function() {
        singleLevelModel = TP.core.JSONContent.construct('{"foo":["1st","2nd",{"hi":"there"}]}');
        singleLevelPath = TP.apc('$.foo[1]');

        multiLevelModel = singleLevelModel;
        multiLevelPath = TP.apc('$.foo[2].hi');
    });

    this.it('single level get', function(test, options) {
        var val;

        val = singleLevelPath.executeGet(singleLevelModel);

        test.assert.isEqualTo(val, '2nd');
    });

    this.it('single level set', function(test, options) {
        var val;

        singleLevelPath.executeSet(singleLevelModel, '3rd', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = singleLevelModel.get('data').foo[1];

        test.assert.isEqualTo(val, '3rd');
    });

    this.it('multiple level get', function(test, options) {
        var val;

        val = multiLevelPath.executeGet(multiLevelModel);

        test.assert.isEqualTo(val, 'there');
    });

    this.it('multiple level set', function(test, options) {
        var val;

        multiLevelPath.executeSet(multiLevelModel, 'boo boo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = multiLevelModel.get('data').foo[2].hi;

        test.assert.isEqualTo(val, 'boo boo');
    });
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath Inst complex value Array and Hash traversal',
function() {

    var model1,

        path1,
        path2,
        path3,
        path4;

    this.before(
        function() {
            model1 = TP.core.JSONContent.construct(
                '{"value":[' +
                    '{"fname":"bill", "lname":"edney", "aliases":["billy", "willy", "eds"]},' +
                    '{"fname":"scott", "lname":"shattuck"},' +
                    '{"fname":"jim", "lname":"bowery"},' +
                    '{"fname":"another", "lname":"hacker"}' +
                ']}');

            path1 = TP.apc('$.value[0].fname');
            path2 = TP.apc('$.value[0,2].fname');
            path3 = TP.apc('$.value[0].aliases[1:2]');
            path4 = TP.apc('$.value[0].aliases[:-1]');
        });

    this.after(
        function() {
            model1 = null;

            path1 = null;
            path2 = null;
            path3 = null;
            path4 = null;
        });

    this.it('tail results get', function(test, options) {
        var val;

        val = path1.executeGet(model1);

        test.assert.isEqualTo(val, 'bill');
    });

    this.it('tail results set', function(test, options) {
        var val;

        path1.executeSet(model1, 'William', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = model1.get('data').value[0].fname;

        test.assert.isEqualTo(val, 'William');
    });

    this.it('middle results get', function(test, options) {
        var val;

        val = path2.executeGet(model1);

        test.assert.isEqualTo(val, TP.ac('William', 'jim'));
    });

    this.it('middle results single value set', function(test, options) {
        var val;

        path2.executeSet(model1, 'William', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = model1.get('data').value[0].fname;

        test.assert.isEqualTo(val, 'William');

        val = model1.get('data').value[2].fname;

        test.assert.isEqualTo(val, 'William');
    });

    this.it('middle results multi value set', function(test, options) {
        var val;

        path2.executeSet(model1, TP.ac('Willy', 'Jimmy'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = model1.get('data').value[0].fname;

        test.assert.isEqualTo(val, TP.ac('Willy', 'Jimmy'));

        val = model1.get('data').value[2].fname;

        test.assert.isEqualTo(val, TP.ac('Willy', 'Jimmy'));
    });

    this.it('tail results slicing get', function(test, options) {
        var val;

        val = path3.executeGet(model1);

        test.assert.isEqualTo(val, 'willy');
    });

    this.it('tail results slicing set', function(test, options) {
        var val;

        path3.executeSet(model1, TP.ac('willy', 'jimmy'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = model1.get('data').value[0].aliases[1];

        test.assert.isEqualTo(val, TP.ac('willy', 'jimmy'));
    });

    this.it('tail results multi-value slicing get', function(test, options) {
        var val;

        val = path4.executeGet(model1);

        test.assert.isEqualTo(val, TP.ac('billy', TP.ac('willy', 'jimmy')));
    });

    this.it('tail results multi-value slicing set', function(test, options) {
        var val;

        path4.executeSet(model1, TP.ac('bobby', 'jimmy'), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.
        val = model1.get('data').value[0].aliases[0];

        test.assert.isEqualTo(val, TP.ac('bobby', 'jimmy'));

        val = model1.get('data').value[0].aliases[1];

        test.assert.isEqualTo(val, TP.ac('bobby', 'jimmy'));
    });
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath Inst complex value Hash traversal with creation',
function() {

    var model1,
        path1,
        path2;

    this.before(function() {
        model1 = TP.core.JSONContent.construct('{"foo":{"hi":"there"}}');
        path1 = TP.apc('$.bar.moo');
        path2 = TP.apc('$.bar[moo,too].noo');
    });

    this.it('single level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path1.executeSet(model1, 'goo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.get('data').bar;

        this.refute.isDefined(val);
    });

    this.it('single level set with creation', function(test, options) {
        var val;

        path1.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path1.executeSet(model1, 'goo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.get('data').bar.moo;

        test.assert.isEqualTo(val, 'goo');
    });

    this.it('multi level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path2.executeSet(model1, 'boo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  Note - there is a value at 'moo' - it's old value. But structure
        //  building wasn't enabled, which means that the path couldn't traverse
        //  to 'noo', thereby not creating an Object and blowing away 'moo's old
        //  value.
        //  This also means there will be no value at 'too'.

        val = model1.get('data').bar.moo;

        test.assert.isEqualTo(val, 'goo');

        val = model1.get('data').bar.too;

        this.refute.isDefined(val);
    });

    this.it('multi level set with creation', function(test, options) {
        var val;

        path2.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path2.executeSet(model1, 'boo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.get('data').bar.moo.noo;

        test.assert.isEqualTo(val, 'boo');
    });
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath Inst complex value Array traversal with creation',
function() {

    var model1,
        path1,
        path2,
        path3;

    this.before(function() {
        model1 = TP.core.JSONContent.construct('{"value": ["one", "two", ["a", "b", "c"]]}');
        path1 = TP.apc('$.value[3][1]');
        path2 = TP.apc('$.value[3][1][0,4]');
        path3 = TP.apc('$.value[3][1][1:4]');
    });

    this.it('single level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path1.executeSet(model1, 'four', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.get('data').value[3];

        this.refute.isDefined(val);
    });

    this.it('single level set with creation', function(test, options) {
        var val;

        path1.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path1.executeSet(model1, 'four', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.get('data').value[3][1];

        test.assert.isEqualTo(val, 'four');
    });

    this.it('multi level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path2.executeSet(model1, 'stuff', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  Note - there is a value at 0 - the 'f' from the word 'four' that we
        //  set above.

        val = model1.get('data').value[3][1][0];

        test.assert.isEqualTo(val, 'f');

        val = model1.get('data').value[3][1][4];

        test.assert.isEmpty(val);
    });

    this.it('multi level set with creation', function(test, options) {
        var val;

        path2.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path2.executeSet(model1, 'stuff', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.get('data').value[3][1][0];

        test.assert.isEqualTo(val, 'stuff');

        val = model1.get('data').value[3][1][4];

        test.assert.isEqualTo(val, 'stuff');
    });

    this.it('slicing results set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path3.executeSet(model1, 'foofy', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  Note - there is a value at 0 - the 'f' from the word 'four' that we
        //  set above.

        //  Even though we have creation turned off, the call above did not
        //  require 'structure creating' - the values should have been set.
        val = model1.get('data').value[3][1][1];

        test.assert.isEqualTo(val, 'foofy');

        val = model1.get('data').value[3][1][2];

        test.assert.isEqualTo(val, 'foofy');

        val = model1.get('data').value[3][1][3];

        test.assert.isEqualTo(val, 'foofy');

        //  This value should still be 'stuff' - the '1:4' range means items
        //  1-3.
        val = model1.get('data').value[3][1][4];

        test.assert.isEqualTo(val, 'stuff');
    });

    this.it('slicing results set with creation', function(test, options) {
    }).todo();
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath Inst complex value Array and Hash traversal with creation',
function() {

    var model1,
        path1,
        path2;

    this.before(function() {
        model1 = TP.core.JSONContent.construct('{"foo":["1st","2nd",{"hi":"there"}]}');
        path1 = TP.apc('$.foo[3].bar');
        path2 = TP.apc('$.foo[3][bar,moo,too].roo');
    });

    this.it('single level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path1.executeSet(model1, 'goo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.get('data').foo[3];

        this.refute.isDefined(val);
    });

    this.it('single level set with creation', function(test, options) {
        var val;

        path1.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path1.executeSet(model1, 'goo', true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.get('data').foo[3].bar;

        test.assert.isEqualTo(val, 'goo');
    });

    this.it('multi level set without creation', function(test, options) {
        var val;

        //  Shouldn't create - by default, we have creation turned off
        path2.executeSet(model1, TP.ac(), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        //  Note - there is a value at 'bar' - it was set above, but there
        //  shouldn't be one at 'moo' or 'too'.
        val = model1.get('data').foo[3].bar;

        test.assert.isEqualTo(val, 'goo');

        val = model1.get('data').foo[3].moo;

        this.refute.isDefined(val);

        val = model1.get('data').foo[3].too;

        this.refute.isDefined(val);
    });

    this.it('multi level set with creation', function(test, options) {
        var val;

        path2.set('shouldMakeStructures', true);

        //  Should create - we just turned it on
        path2.executeSet(model1, TP.ac(), true);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.get('data').foo[3].bar.roo;

        test.assert.isArray(val);

        val = model1.get('data').foo[3].moo.roo;

        test.assert.isArray(val);

        val = model1.get('data').foo[3].too.roo;

        test.assert.isArray(val);
    });
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath Inst parameterized path traversal',
function() {

    var model1,
        path1,
        path2,
        path3,
        path4;

    this.before(function() {
        model1 = TP.core.JSONContent.construct(
            '{"foo":["1st","2nd","3rd","4th",["A","B","C"],["X","Y","Z"]]}');
        path1 = TP.apc('foo.{{0}}');
        path2 = TP.apc('foo[{{0}}:{{1}}]');
        path3 = TP.apc('foo.{{0}}.{{1}}');
        path4 = TP.apc('foo[{{0}}:{{1}}].{{2}}');
    });

    this.it('single level get', function(test, options) {
        var val;

        val = path1.executeGet(model1, 1);

        test.assert.isEqualTo(val, '2nd');
    });

    this.it('single level get slice', function(test, options) {
        var val;

        val = path2.executeGet(model1, 1, 4);

        test.assert.isEqualTo(val, TP.ac('2nd', '3rd', '4th'));
    });

    this.it('multi level get', function(test, options) {
        var val;

        val = path3.executeGet(model1, 4, 0);

        test.assert.isEqualTo(val, 'A');
    });

    this.it('multi level get slice', function(test, options) {
        var val;

        val = path4.executeGet(model1, 4, 6, 0);

        test.assert.isEqualTo(val, TP.ac('A', 'X'));
    });

    this.it('single level set', function(test, options) {
        var val;

        //  Note here how it's model, value, shouldSignal, parameter1ToPath
        path1.executeSet(model1, 'boo', false, 1);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('foo').at(1);

        test.assert.isEqualTo(val, 'boo');
    });

    this.it('single level set slice', function(test, options) {
        var val;

        //  Note here how it's model, value, shouldSignal, parameter1ToPath,
        //  parameter2ToPath
        path2.executeSet(model1, 'bar', false, 1, 3);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('foo').at(1);

        test.assert.isEqualTo(val, 'bar');

        val = model1.at('foo').at(2);

        test.assert.isEqualTo(val, 'bar');
    });

    this.it('multi level set', function(test, options) {
        var val;

        //  Note here how it's model, value, shouldSignal, parameter1ToPath,
        //  parameter2ToPath
        path3.executeSet(model1, 'baz', false, 4, 0);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('foo').at(4).at(0);

        test.assert.isEqualTo(val, 'baz');
    });

    this.it('multi level get slice', function(test, options) {
        var val;

        //  Note here how it's model, value, shouldSignal, parameter1ToPath,
        //  parameter2ToPath
        path4.executeSet(model1, 'goo', false, 4, 6, 0);

        //  NB: We use a manual mechanism to get to the value to get independent
        //  validation of 'path' execution code.

        val = model1.at('foo').at(4).at(0);

        test.assert.isEqualTo(val, 'goo');

        val = model1.at('foo').at(5).at(0);

        test.assert.isEqualTo(val, 'goo');
    });
}).skip();

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.describe('TP.core.JSONPath results',
function() {

    var jsonContent;

    this.before(function() {
        jsonContent =
            TP.core.JSONContent.construct('{ "store": { "book": [ { "category": "reference", "author": "Nigel Rees", "title": "Sayings of the Century", "price": 8.95 }, { "category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99 }, { "category": "fiction", "author": "Herman Melville", "title": "Moby Dick", "isbn": "0-553-21311-3", "price": 8.99 }, { "category": "fiction", "author": "J. R. R. Tolkien", "title": "The Lord of the Rings", "isbn": "0-395-19395-8", "price": 22.99 } ], "bicycle": { "color": "red", "price": 19.95 } } }');
    });

    this.it('specific path to named items', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$.store.book[*].author');
        val = queryPath.executeGet(jsonContent);

        test.assert.isEqualTo(val, TP.ac('Nigel Rees', 'Evelyn Waugh', 'Herman Melville', 'J. R. R. Tolkien'));
    });

    this.it('recursive descent', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..author');
        val = queryPath.executeGet(jsonContent);

        test.assert.isEqualTo(val, TP.ac('Nigel Rees', 'Evelyn Waugh', 'Herman Melville', 'J. R. R. Tolkien'));
    });

    this.it('specific path to all items', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$.store.*');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, TP.ac(TP.ac({"category":"reference","author":"Nigel Rees","title":"Sayings of the Century","price":8.95}, {"category":"fiction","author":"Evelyn Waugh","title":"Sword of Honour","price":12.99}, {"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99}, {"category":"fiction","author":"J. R. R. Tolkien","title":"The Lord of the Rings","isbn":"0-395-19395-8","price":22.99}), {"color":"red","price":19.95}));
        /* eslint-enable */
    });

    this.it('specific path to named items followed by recursive descent', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$.store..price');
        val = queryPath.executeGet(jsonContent);

        test.assert.isEqualTo(val, TP.ac(8.95, 12.99, 8.99, 22.99, 19.95));
    });

    this.it('recursive descent to named items to parent', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$.store..price.^');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val,TP.ac({"category":"reference","author":"Nigel Rees","title":"Sayings of the Century","price":8.95}, {"category":"fiction","author":"Evelyn Waugh","title":"Sword of Honour","price":12.99}, {"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99}, {"category":"fiction","author":"J. R. R. Tolkien","title":"The Lord of the Rings","isbn":"0-395-19395-8","price":22.99}, {"color":"red","price":19.95}));
        /* eslint-enable */
    });

    this.it('recursive descent to indexed item', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..book[2]');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, {"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99});
        /* eslint-enable */
    });

    this.it('recursive descent to predicate tested item', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..book[(@.length-1)]');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, {"category":"fiction","author":"J. R. R. Tolkien","title":"The Lord of the Rings","isbn":"0-395-19395-8","price":22.99});
        /* eslint-enable */
    });

    this.it('recursive descent to negative end sliced item', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..book[:-1]');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, TP.ac({"category":"reference","author":"Nigel Rees","title":"Sayings of the Century","price":8.95}, {"category":"fiction","author":"Evelyn Waugh","title":"Sword of Honour","price":12.99}, {"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99}));
        /* eslint-enable */
    });

    this.it('recursive descent to positive end sliced item', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..book[:2]');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, TP.ac({"category":"reference","author":"Nigel Rees","title":"Sayings of the Century","price":8.95}, {"category":"fiction","author":"Evelyn Waugh","title":"Sword of Honour","price":12.99}));
        /* eslint-enable */
    });

    this.it('recursive descent to positive start and end sliced item', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..book[1:2]');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, {"category":"fiction","author":"Evelyn Waugh","title":"Sword of Honour","price":12.99});
        /* eslint-enable */
    });

    this.it('recursive descent to negative start sliced item', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..book[-2:]');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, TP.ac({"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99}, {"category":"fiction","author":"J. R. R. Tolkien","title":"The Lord of the Rings","isbn":"0-395-19395-8","price":22.99}));
        /* eslint-enable */
    });

    this.it('recursive descent to positive start sliced item', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..book[2:]');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, TP.ac({"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99}, {"category":"fiction","author":"J. R. R. Tolkien","title":"The Lord of the Rings","isbn":"0-395-19395-8","price":22.99}));
        /* eslint-enable */
    });

    this.it('recursive descent with existence predicate', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..book[?(@.isbn)]');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, TP.ac({"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99}, {"category":"fiction","author":"J. R. R. Tolkien","title":"The Lord of the Rings","isbn":"0-395-19395-8","price":22.99}));
        /* eslint-enable */
    });

    this.it('recursive descent with comparison predicate', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..book[?(@.price < 10)]');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, TP.ac({"category":"reference","author":"Nigel Rees","title":"Sayings of the Century","price":8.95}, {"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99}));
        /* eslint-enable */
    });

    this.it('recursive descent with existence predicate ANDed with comparison predicate', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..book[?(@.isbn && @.price < 10)]');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, {"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99});
        /* eslint-enable */
    });

    this.it('recursive descent with existence predicate ORed with comparison predicate', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$..book[?(@.isbn || @.price < 10)]');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, TP.ac({"category":"reference","author":"Nigel Rees","title":"Sayings of the Century","price":8.95}, {"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99}, {"category":"fiction","author":"J. R. R. Tolkien","title":"The Lord of the Rings","isbn":"0-395-19395-8","price":22.99}));
        /* eslint-enable */
    });

    this.it('recursive descent returning all items', function(test, options) {
        /* eslint-disable */
        var queryPath,
            val;

        queryPath = TP.apc('$..*');
        val = queryPath.executeGet(jsonContent);

        //  TODO: This doesn't return quite the correct results
        /* eslint-enable */
    }).todo();

    this.it('recursive descent returning all items - root only', function(test, options) {
        /* eslint-disable */
        var queryPath,
            val;

        queryPath = TP.apc('$');
        val = queryPath.executeGet(jsonContent);

        //  TODO: This doesn't return quite the correct results
        /* eslint-enable */
    }).todo();

    this.it('specific path returning all subitems', function(test, options) {
        var queryPath,
            val;

        queryPath = TP.apc('$.store');
        val = queryPath.executeGet(jsonContent);

        /* eslint-disable */
        test.assert.isEqualTo(val, {"book":[{"category":"reference","author":"Nigel Rees","title":"Sayings of the Century","price":8.95},{"category":"fiction","author":"Evelyn Waugh","title":"Sword of Honour","price":12.99},{"category":"fiction","author":"Herman Melville","title":"Moby Dick","isbn":"0-553-21311-3","price":8.99},{"category":"fiction","author":"J. R. R. Tolkien","title":"The Lord of the Rings","isbn":"0-395-19395-8","price":22.99}],"bicycle":{"color":"red","price":19.95}});
        /* eslint-enable */
    });
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.core.AccessPath.Type.runTestSuites();
TP.core.ComplexTIBETPath.Inst.runTestSuites();
TP.core.XPathPath.Inst.runTestSuites();
TP.core.JSONPath.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
