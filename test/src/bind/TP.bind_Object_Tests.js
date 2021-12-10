//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ------------------------------------------------------------------------
//  Test Tag Types
//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('test:elem');
TP.test.elem.defineAttribute('styleURI', TP.NO_RESULT);
TP.test.elem.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Inbound Binds
//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('inbound bind info',
function() {

    this.it('uses explicit attribute value', function(test, options) {
        var tpElem,
            info;

        tpElem = TP.tpelem(`
<test:elem xmlns:bind="http://www.technicalpursuit.com/2005/binding"
    foo="[[attr]]"
/>
`);
        test.assert.isValid(tpElem, 'element not valid');

        info = tpElem.getInboundAspectEntry('foo');
        test.assert.isValid(info, 'info not valid');

        test.assert.isEqualTo(info.at('dataExprs').first(), 'attr');
    });


    this.it('uses explicit attribute value before bind:in', function(test, options) {
        var tpElem,
            info;

        tpElem = TP.tpelem(`
<test:elem xmlns:bind="http://www.technicalpursuit.com/2005/binding"
    foo="[[attr]]"
    bind:in="{foo: bindin, bar: bar}"
/>
`);
        test.assert.isValid(tpElem, 'element not valid');

        info = tpElem.getInboundAspectEntry('foo');
        test.assert.isValid(info, 'info not valid');

        test.assert.isEqualTo(info.at('dataExprs').first(), 'attr');
    });


    this.it('uses explicit attribute value before bind:io', function(test, options) {
        var tpElem,
            info;

        tpElem = TP.tpelem(`
<test:elem xmlns:bind="http://www.technicalpursuit.com/2005/binding"
    foo="[[attr]]"
    bind:io="{foo: bindio, bar: bar}"
/>
`);
        test.assert.isValid(tpElem, 'element not valid');

        info = tpElem.getInboundAspectEntry('foo');
        test.assert.isValid(info, 'info not valid');

        test.assert.isEqualTo(info.at('dataExprs').first(), 'attr');
    });


    this.it('uses bind:in attribute value before bind:io', function(test, options) {
        var tpElem,
            info;

        tpElem = TP.tpelem(`
<test:elem xmlns:bind="http://www.technicalpursuit.com/2005/binding"
    bind:in="{foo: bindin, bar: bar}"
    bind:io="{foo: bindio, bar: bar}"
/>
`);
        test.assert.isValid(tpElem, 'element not valid');

        info = tpElem.getInboundAspectEntry('foo');
        test.assert.isValid(info, 'info not valid');

        test.assert.isEqualTo(info.at('dataExprs').first(), 'bindin');
    });


    this.it('uses bind:io if nothing else overrides it', function(test, options) {
        var tpElem,
            info;

        tpElem = TP.tpelem(`
<test:elem xmlns:bind="http://www.technicalpursuit.com/2005/binding"
    bind:io="{foo: bindio, bar: bar}"
/>
`);
        test.assert.isValid(tpElem, 'element not valid');

        info = tpElem.getInboundAspectEntry('foo');
        test.assert.isValid(info, 'info not valid');

        test.assert.isEqualTo(info.at('dataExprs').first(), 'bindio');
    });
});

//  ------------------------------------------------------------------------
//  Outbound Binds
//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.describe('outbound bind info',
function() {

    this.before(function() {
        TP.test.elem.set('bidiAttrs', TP.ac('foo'));
    });

    this.after(function() {
        TP.test.elem.set('bidiAttrs', null);
    });

    this.it('uses explicit attribute value before bind:out', function(test, options) {
        var tpElem,
            info;

        tpElem = TP.tpelem(`
<test:elem xmlns:bind="http://www.technicalpursuit.com/2005/binding"
    foo="[[foo]]"
    bind:out="{foo: bindout, bar: bar}"
/>
`);
        test.assert.isValid(tpElem, 'element not valid');

        info = tpElem.getOutboundAspectEntry('foo');
        test.assert.isValid(info, 'info not valid');

        test.assert.isEqualTo(info.at('dataExprs').first(), 'foo');
    });


    this.it('uses explicit attribute value before bind:io', function(test, options) {
        var tpElem,
            info;

        tpElem = TP.tpelem(`
<test:elem xmlns:bind="http://www.technicalpursuit.com/2005/binding"
    foo="[[foo]]"
    bind:io="{foo: bindio, bar: bar}"
/>
`);
        test.assert.isValid(tpElem, 'element not valid');

        info = tpElem.getOutboundAspectEntry('foo');
        test.assert.isValid(info, 'info not valid');

        test.assert.isEqualTo(info.at('dataExprs').first(), 'foo');
    });


    this.it('uses bind:out attribute value before bind:io', function(test, options) {
        var tpElem,
            info;

        tpElem = TP.tpelem(`
<test:elem xmlns:bind="http://www.technicalpursuit.com/2005/binding"
    bind:out="{foo: bindin, bar: bar}"
    bind:io="{foo: bindio, bar: bar}"
/>
`);
        test.assert.isValid(tpElem, 'element not valid');

        info = tpElem.getOutboundAspectEntry('foo');
        test.assert.isValid(info, 'info not valid');

        test.assert.isEqualTo(info.at('dataExprs').first(), 'bindin');
    });


    this.it('uses bind:io if nothing else overrides it', function(test, options) {
        var tpElem,
            info;

        tpElem = TP.tpelem(`
<test:elem xmlns:bind="http://www.technicalpursuit.com/2005/binding"
    bind:io="{foo: bindio, bar: bar}"
/>
`);
        test.assert.isValid(tpElem, 'element not valid');

        info = tpElem.getOutboundAspectEntry('foo');
        test.assert.isValid(info, 'info not valid');

        test.assert.isEqualTo(info.at('dataExprs').first(), 'bindio');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
