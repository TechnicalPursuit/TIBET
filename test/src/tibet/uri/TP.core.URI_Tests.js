//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/* global Q:true
*/

//  ========================================================================
//  URI
//  ========================================================================

TP.core.TIBETURL.Inst.describe('getLocation',
function() {

    this.it('TIBETURL: URL with virtual URI', function(test, options) {

        this.assert.isEqualTo(
            TP.uc('tibet:///~').getLocation(),
            TP.uc('~').getLocation(),
            TP.sc('tibet:///~ and ~ should be equivalent paths.'));

        this.assert.isEqualTo(
            TP.uc('tibet:///~').getLocation(),
            TP.sys.getAppRoot(),
            TP.sc('tibet:///~ and app root should be equivalent paths.'));

        this.assert.isEqualTo(
            TP.uc('tibet:///~tibet').getLocation(),
            TP.uc('~tibet').getLocation(),
            TP.sc('tibet:///~tibet and ~tibet should be equivalent paths.'));

        this.assert.isEqualTo(
            TP.uc('tibet:///~tibet').getLocation(),
            TP.sys.getLibRoot(),
            TP.sc('tibet:///~tibet and lib root should be equivalent paths.'));

        this.assert.isEqualTo(
            TP.uc('tibet:///~app_lib').getLocation(),
            TP.uc('~app_lib').getLocation(),
            TP.sc('tibet:///~app_lib and ~app_lib should be' +
                    ' equivalent paths.'));
    });
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.describe('getResource',
function() {

    var params;

    this.before(
        function() {
            var win,
                doc,

                backgroundElem,
                childElem;

            //  Set up a temporary reference to the top-level window name
            TP.$$topWindowName = TP.sys.cfg('tibet.uibuffer');

            win = TP.win(TP.$$topWindowName + '.UIROOT');

            //  Make sure there's a window named 'UIROOT' under a window named
            //  by the name in TP.$$topWindowName
            if (!TP.isWindow(win)) {
                //  Couldn't find the window - fail the request and return
                this.fail(
                    TP.sc('Couldn\'t find window named "',
                            TP.$$topWindowName,
                            '.UIROOT"'));

                return;
            }

            doc = win.document;

            backgroundElem = TP.elem('<div id="top_background"></div>');
            backgroundElem = TP.nodeAppendChild(
                                doc.documentElement, backgroundElem, false);

            childElem = TP.elem(
                            '<h1 id="uri_test_child">A test child</h1>');
            TP.nodeAppendChild(backgroundElem, childElem, false);

        }.bind(this));

    this.beforeEach(
        function() {
            //  NB: The default of TIBETURNs is that they fetch their resources
            //  synchronously, so we don't need to specify that here.
            params = TP.request('refresh', true, 'async', false);
        });

    //  ---

    this.it('TIBETURL: Retrieve global objects', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet:///urn:tibet:TP').getResource(params),
            TP,
            TP.sc('tibet:///urn:tibet:TP should find the named instance "TP".'));

        this.assert.isIdenticalTo(
            TP.uc('tibet:///javascript:TP').getResource(params),
            TP,
            TP.sc('tibet:///javascript:TP should find the named instance "TP".'));
    });

    //  ---

    this.it('TIBETURL: Retrieve type object', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet:///urn:tibet:TP.sig.Signal').getResource(params),
            TP.sig.Signal,
            TP.sc('tibet:///urn:tibet:TP.sig.Signal should find the named' +
                                                    ' type TP.sig.Signal.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve registered object', function(test, options) {

        var foo;

        foo = TP.ac(1,2,3);
        TP.sys.registerObject(foo, 'FOO', true);

        this.assert.isIdenticalTo(
            TP.uc('tibet:///urn:tibet:FOO').getResource(params),
            foo,
            TP.sc('tibet:///urn:tibet:FOO should refer to the FOO object' +
                    ' in top.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve object nested in iframe', function(test, options) {

        this.assert.isEqualTo(
            TP.uc('tibet:///javascript:top.UIROOT.$$globalID').getResource(
                                                                    params),
            TP.$$topWindowName + '.UIROOT',
            TP.sc('tibet:///javascript:top.UIROOT.$$globalID should find the',
                    ' object at "', TP.$$topWindowName,
                    '".UIROOT.$$globalID".'));

        this.assert.isEqualTo(
            TP.uc('tibet://top.UIROOT/javascript:$$globalID').getResource(
                                                                    params),
            TP.$$topWindowName + '.UIROOT',
            TP.sc('tibet://top.UIROOT/javascript:$$globalID should find',
                    ' the object at "', TP.$$topWindowName,
                    '.UIROOT.$$globalID".'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.Window of the top-level window', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://top/').getResource(params),
            TP.byOID('top'),
            TP.sc('tibet://top/ should find the top-level Window.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://top').getResource(params),
            TP.byOID('top'),
            TP.sc('tibet://top should find the top-level Window.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.HTMLDocumentNode of the top-level window', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://top/#document').getResource(params),
            TP.byOID('top').getDocument(),
            TP.sc('tibet://top/#document should find the document of the' +
                    ' top-level Window.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://top#document').getResource(params),
            TP.byOID('top').getDocument(),
            TP.sc('tibet://top#document should find the document of the' +
                    ' top-level Window.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve nested TP.html.iframe in top-level window', function(test, options) {

        //  Get the <iframe> element that has an id of UIROOT
        this.assert.isIdenticalTo(
            TP.uc('tibet://top/#UIROOT').getResource(params).getNativeNode(),
            TP.byId('UIROOT', TP.win('top')),
            TP.sc('tibet://top/#UIROOT should find the iframe element with' +
                    ' id "UIROOT" in the top-level window\'s document.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://top#UIROOT').getResource(params).getNativeNode(),
            TP.byId('UIROOT', TP.win('top')),
            TP.sc('tibet://top/#UIROOT should find the iframe element with' +
                    ' id "UIROOT" in the top-level window\'s document.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.Window of UIROOT', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://UIROOT/').getResource(params),
            TP.core.Window.construct('UIROOT'),
            TP.sc('tibet://UIROOT/ should find the Window named "UIROOT".'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://UIROOT').getResource(params),
            TP.core.Window.construct('UIROOT'),
            TP.sc('tibet://UIROOT should find the Window named "UIROOT".'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.HTMLDocumentNode of UIROOT', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://UIROOT/#document').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT/#document should find the' +
                    ' document of the Window named "UIROOT".'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://UIROOT#document').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT#document should find the' +
                    ' document of the Window named "UIROOT".'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.Window of named window', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://top.UIROOT/').getResource(params),
            TP.core.Window.construct('top.UIROOT'),
            TP.sc('tibet://top.UIROOT/ should find the Window named' +
                    ' "UIROOT".'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://top.UIROOT').getResource(params),
            TP.core.Window.construct('top.UIROOT'),
            TP.sc('tibet://top.UIROOT should find the Window named' +
                    ' "UIROOT".'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.HTMLDocumentNode of named window #1', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://top.UIROOT/#document').getResource(params),
            TP.core.Window.construct('top.UIROOT').getDocument(),
            TP.sc('tibet://top.UIROOT/#document should find the' +
                    ' document of the Window named "UIROOT".'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://top.UIROOT#document').getResource(params),
            TP.core.Window.construct('top.UIROOT').getDocument(),
            TP.sc('tibet://top.UIROOT#document should find the' +
                    ' document of the Window named "UIROOT".'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.HTMLDocumentNode of named window #2', function(test, options) {

        //  'future_path' could be a document that will be loaded in the future.
        //  This will return the document that's currently loaded in 'UIROOT'.
        this.assert.isIdenticalTo(
            TP.uc('tibet://UIROOT/future_path/').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT/future_path/ should find the document of' +
                    ' the Window named "UIROOT".'));

        //  The last slash should be optional

        //  'future_path' could be a document that will be loaded in the future.
        //  This will return the document that's currently loaded in 'UIROOT'.
        this.assert.isIdenticalTo(
            TP.uc('tibet://UIROOT/future_path').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT/future_path should find the document of' +
                    ' the Window named "UIROOT".'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.HTMLDocumentNode of named window #3', function(test, options) {

        //  'future_path' could be a document that will be loaded in the future.
        //  This will return the document that's currently loaded in 'UIROOT'.
        this.assert.isIdenticalTo(
            TP.uc('tibet://UIROOT/future_path/#document').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT/future_path/#document should find the ' +
                    'document of the Window named "UIROOT".'));

        //  The last slash should be optional

        //  'future_path' could be a document that will be loaded in the future.
        //  This will return the document that's currently loaded in 'UIROOT'.
        this.assert.isIdenticalTo(
            TP.uc('tibet://UIROOT/future_path#document').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT/future_path#document should find the ' +
                    'document of the Window named "UIROOT".'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.Window of the current UI canvas', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/').getResource(params),
            TP.sys.getUICanvas(),
            TP.sc('tibet://uicanvas/ should find the current UI canvas Window.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas').getResource(params),
            TP.sys.getUICanvas(),
            TP.sc('tibet://uicanvas should find the current UI canvas Window.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.HTMLDocumentNode of the current UI canvas', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#document').getResource(params),
            TP.sys.getUICanvas().getDocument(),
            TP.sc('tibet://uicanvas/#document should find the document of the' +
                    ' current UI canvas Window.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#document').getResource(params),
            TP.sys.getUICanvas().getDocument(),
            TP.sc('tibet://uicanvas#document should find the document of the' +
                    ' current UI canvas Window.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#document').getResource(params),
            TP.sys.getUICanvas().getDocument(),
            TP.sc('#document should find the document of the' +
                    ' current UI canvas Window.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.ElementNode using XPointer barename', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#top_background').getResource(params).getNativeNode(),
            TP.byId('top_background'),
            TP.sc('tibet://uicanvas/#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#top_background').getResource(params).getNativeNode(),
            TP.byId('top_background'),
            TP.sc('tibet://uicanvas#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#top_background').getResource(params).getNativeNode(),
            TP.byId('top_background'),
            TP.sc('#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve Element using XPointer barename and TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#top_background').getResource(newParams),
            TP.byId('top_background'),
            TP.sc('tibet://uicanvas/#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#top_background').getResource(newParams),
            TP.byId('top_background'),
            TP.sc('tibet://uicanvas#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#top_background').getResource(newParams),
            TP.byId('top_background'),
            TP.sc('#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.ElementNode using XPointer element() scheme', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#element(/1/2)').getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#element(/1/2)').getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#element(/1/2)').getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve Element using XPointer element() scheme and TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#element(/1/2)').getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#element(/1/2)').getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#element(/1/2)').getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.ElementNode using XPointer element() scheme with ID', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#element(top_background/1)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas/#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#element(top_background/1)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#element(top_background/1)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve Element using XPointer element() scheme with ID and TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#element(top_background/1)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas/#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#element(top_background/1)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#element(top_background/1)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.ElementNode using XPointer xpath1() scheme', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#xpath1(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#xpath1(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#xpath1(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve Element using XPointer xpath1() scheme with TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#xpath1(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#xpath1(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#xpath1(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.ElementNode using XPointer xpointer() scheme', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#xpointer(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#xpointer(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#xpointer(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve Element using XPointer xpointer() scheme with TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#xpointer(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#xpointer(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#xpointer(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve TP.core.ElementNode using TIBET-extension XPointer css() scheme', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#css(#top_background > *:first-child)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas/#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#css(#top_background > *:first-child)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#css(#top_background > *:first-child)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Retrieve Element using TIBET-extension XPointer css() scheme with TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas/#css(#top_background > *:first-child)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas/#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.isIdenticalTo(
            TP.uc('tibet://uicanvas#css(#top_background > *:first-child)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.isIdenticalTo(
            TP.uc('#css(#top_background > *:first-child)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));
    });

    //  ---

    this.it('TIBETURL: Try to retrieve TP.core.Window of a bogus window', function(test, options) {

        this.refute.isDefined(
            TP.uc('tibet://fluffy/').getResource(params),
            TP.sc('tibet://fluffy/ should return undefined.'));

        //  The last slash should be optional

        this.refute.isDefined(
            TP.uc('tibet://fluffy').getResource(params),
            TP.sc('tibet://fluffy should return undefined.'));
    });

    //  ---

    this.it('TIBETURL: Trying to retrieve TP.core.ElementNode of bogus element in top-level window using an XPointer barename', function(test, options) {

        this.assert.isEmpty(
            TP.uc('tibet://top/#fluffy').getResource(params),
            TP.sc('tibet://top/#fluffy should return null.'));

        //  The last slash should be optional

        this.assert.isEmpty(
            TP.uc('tibet://top#fluffy').getResource(params),
            TP.sc('tibet://top#fluffy should return null.'));
    });

    //  ---

    this.it('TIBETURL: Trying to retrieve TP.core.ElementNode of bogus element in top-level window using an XPointer xpath1() query', function(test, options) {

        this.assert.isEmpty(
            TP.uc('tibet://top/#xpath1(fluffy)').getResource(params),
            TP.sc('tibet://top/#xpath1(fluffy) should return the empty Array.'));

        //  The last slash should be optional

        this.assert.isEmpty(
            TP.uc('tibet://top#xpath1(fluffy)').getResource(params),
            TP.sc('tibet://top#xpath1(fluffy) should return the empty Array.'));
    });

    //  ---

    this.it('TIBETURL: Trying to retrieve TP.core.ElementNode of bogus element in top-level window using an XPointer element() query', function(test, options) {

        this.assert.isEmpty(
            TP.uc('tibet://top/#element(fluffy)').getResource(params),
            TP.sc('tibet://top/#element(fluffy) should return the empty Array.'));

        //  The last slash should be optional

        this.assert.isEmpty(
            TP.uc('tibet://top#element(fluffy)').getResource(params),
            TP.sc('tibet://top#element(fluffy) should return the empty Array.'));
    });

    //  ---

    this.it('TIBETURL: Trying to retrieve TP.core.ElementNode of bogus element in top-level window using an XPointer css() query', function(test, options) {

        this.assert.isEmpty(
            TP.uc('tibet://top/#css(fluffy)').getResource(params),
            TP.sc('tibet://top/#css(fluffy) should return the empty Array.'));

        //  The last slash should be optional

        this.assert.isEmpty(
            TP.uc('tibet://top#css(fluffy)').getResource(params),
            TP.sc('tibet://top#css(fluffy) should return the empty Array.'));
    });

    //  ---

    this.after(
        function() {
            var backgroundElem;

            //  Set up a temporary reference to the top-level window name
            delete TP.$$topWindowName;

            backgroundElem = TP.byId('top_background');
            TP.nodeDetach(backgroundElem);
        });
});

//  ------------------------------------------------------------------------

TP.core.TIBETURN.Inst.describe('getResource',
function() {

    var params;

    //  NB: The default of TIBETURNs is that they fetch their resources
    //  synchronously, so we don't need to specify that here.
    params = TP.request('refresh', true, 'async', false);

    this.it('TIBETURN: Retrieve global objects', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('urn:tibet:TP').getResource(params),
            TP,
            TP.sc('urn:tibet:TP should find the named instance "TP".'));
    });

    //  ---

    this.it('TIBETURN: Retrieve type object', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('urn:tibet:TP.sig.Signal').getResource(params),
            TP.sig.Signal,
            TP.sc('urn:tibet:TP.sig.Signal should find the named type' +
                                                    ' TP.sig.Signal.'));
    });

    //  ---

    this.it('TIBETURN: Retrieve registered object', function(test, options) {

        var foo;

        foo = TP.ac(1,2,3);
        TP.sys.registerObject(foo, 'FOO', true);

        this.assert.isIdenticalTo(
            TP.uc('urn:tibet:FOO').getResource(params),
            foo,
            TP.sc('urn:tibet:FOO should refer to the FOO object in top.'));
    });
});

//  ------------------------------------------------------------------------

TP.core.JSURI.Inst.describe('getResource',
function() {

    var params;

    //  NB: The default of TIBETURNs is that they fetch their resources
    //  synchronously, so we don't need to specify that here.
    params = TP.request('refresh', true);

    this.before(
        function() {
            //  Set up a temporary reference to the top-level window name
            TP.$$topWindowName = TP.sys.cfg('tibet.uibuffer');
        });

    //  ---

    this.it('JSURI: Retrieve global objects', function(test, options) {

        this.assert.isIdenticalTo(
            TP.uc('javascript:TP').getResource(params),
            TP,
            TP.sc('javascript:TP should find the named instance "TP".'));

        this.assert.isIdenticalTo(
            TP.uc('javascript:TP.sys').getResource(params),
            TP.sys,
            TP.sc('javascript:TP.sys should find the named instance' +
                    ' "TP.sys".'));
    });

    //  ---

    this.it('JSURI: Retrieve object nested in iframe', function(test, options) {

        this.assert.isEqualTo(
            TP.uc('javascript:top.UIROOT.$$globalID').getResource(params),
            TP.$$topWindowName + '.UIROOT',
            TP.sc('javascript:top.UIROOT.$$globalID should find the',
                    ' object at "', TP.$$topWindowName,
                    '".UIROOT.$$globalID".'));
    });

    //  ---

    this.after(
        function() {
            //  Set up a temporary reference to the top-level window name
            delete TP.$$topWindowName;
        });
});

//  ------------------------------------------------------------------------

TP.core.HTTPURL.Inst.describe('getResource',
function() {

    var params,
        locStr,
        resultElem,

        server;

    params = TP.request('refresh', true, 'async', true, 'resultType', TP.WRAP);
    locStr = '/TIBET_endpoints/HTTP_GET_TEST';
    resultElem = TP.wrap(TP.xhtmlnode('<html><body>Hi there</body></html>'));

    this.before(
        function() {
            server = TP.test.fakeServer.create();
        });

    //  ---

    this.it('HTTPURL: Retrieve resource asynchronously', function(test, options) {
        var url,
            request;

        server.respondWith(
            TP.HTTP_GET,
            locStr,
            [
                200,
                {
                    'Content-Type': TP.XML_ENCODED,
                },
                resultElem.asString(),
            ]);

        url = TP.uc(locStr);

        //  Mark the URL as 'not loaded' to ensure that it will try to reload
        //  from the underlying source.
        url.isLoaded(false);

        request = TP.request(params);
        request.defineMethod('completeJob',
            function(aResult)
            {
                test.assert.isEqualTo(
                        aResult.get('html|body').at(0),
                        resultElem.get('html|body').at(0));
            });

        url.getResource(request);

        server.respond();
    });

    //  ---

    this.it('HTTPURL: Retrieve resource synchronously', function(test, options) {
    });

    //  ---

    this.after(
        function() {
            server.restore();
        });
});

//  ------------------------------------------------------------------------

TP.core.JSONPURL.Inst.describe('getResource',
function() {

    var params,
        locStr,

        stub;

    params = TP.request('refresh', true, 'async', true);
    locStr = 'jsonp://ajax.googleapis.com/ajax/services/search/web?' +
                'v=1.0&q=football&start=10';

    this.before(
        function() {
            stub = TP.jsonpCall.asStub();
        });

    //  ---

    this.it('JSONPURL: Retrieve resource asynchronously', function(test, options) {
        var url,
            request;

        stub.callsArgWith(1, '{"foo":"bar"}');

        url = TP.uc(locStr);

        //  Mark the URL as 'not loaded' to ensure that it will try to reload
        //  from the underlying source.
        url.isLoaded(false);

        request = TP.request(params);
        request.defineMethod('completeJob',
            function(aResult)
            {
                test.assert.isValid(
                    aResult,
                    TP.sc('Expected valid result but got none.'));
            });

        url.getResource(request);
    });

    //  ---

    this.after(
        function() {
            stub.restore();
        });
});

//  ------------------------------------------------------------------------

TP.core.LocalDBURL.Inst.describe('getResource',
function() {

    var storage;

    //  Make sure there's an entry for 'localdb://' URL testing
    storage = TP.core.LocalStorage.construct();

    this.before(
        function() {
            var storageStr;

            storageStr = TP.js2json(
                    {
                        'local_test' :
                            {
                                'author_info' :
                                    {
                                        '_id' : 'author_info',
                                        '_date_created' : TP.dc(),
                                        '_date_modified' : TP.dc(),
                                        '_body' :
                                            {
                                                'firstName' : 'Bill',
                                                'lastName' : 'Edney'
                                            }
                                    }
                            }
                    });

            storage.atPut(TP.LOCALSTORAGE_DB_NAME, storageStr);
        });

    //  ---

    this.it('LocalDBURL: Retrieve resource', function(test, options) {

        var url,
            obj;

        //  A GET request here using the ID causes a RETRIEVE

        url = TP.uc('localdb://local_test/author_info');

        //  Mark the URL as 'not loaded' to ensure that it will try to reload
        //  from the underlying source.
        url.isLoaded(false);

        //  Implied verb here is TP.HTTP_GET. Also, by default, localdb:// URLs
        //  are synchronous and configure their request to 'refresh'
        //  automatically.
        obj = url.getResource().at('_body');

        this.assert.isTrue(
            obj.hasKey('firstName'),
            TP.sc('Expected that result would have a key of \'firstName\' and',
                    ' it doesn\'t'));

        this.assert.isEqualTo(
                obj.at('firstName'),
                'Bill',
                TP.sc('Expected: ', '"Bill"',
                        ' and got instead: ', obj.at('firstName'), '.'));

        this.assert.isTrue(
            obj.hasKey('lastName'),
            TP.sc('Expected that result would have a key of \'lastName\' and',
                    ' it doesn\'t'));

        this.assert.isEqualTo(
                obj.at('lastName'),
                'Edney',
                TP.sc('Expected: ', '"Edney"',
                        ' and got instead: ', obj.at('lastName'), '.'));
    });

    //  ---

    this.it('LocalDBURL: Retrieve resource info', function(test, options) {

        var url,
            obj;

        //  A HEAD request here causes a RETRIEVE of '_date_created' and
        //  '_date_modified'.

        url = TP.uc('localdb://local_test/author_info');

        //  Mark the URL as 'not loaded' to ensure that it will try to reload
        //  from the underlying source.
        url.isLoaded(false);

        //  By default, localdb:// URLs are synchronous and configure their
        //  request to 'refresh' automatically.
        obj = url.getResource(TP.hc('verb', TP.HTTP_HEAD));

        this.assert.isTrue(
            obj.hasKey('_date_created'),
            TP.sc('Expected that result would have a key of \'_date_created\'',
                    ' and it doesn\'t'));

        this.assert.isTrue(
            obj.hasKey('_date_modified'),
            TP.sc('Expected that result would have a key of \'_date_modified\'',
                    ' and it doesn\'t'));
    });

    //  ---

    this.it('LocalDBURL: Retrieve listing of all documents in db', function(test, options) {

        var url,
            obj;

        //  A GET request here using an ID of '_all_docs" causes a RETRIEVE of
        //  all documents in the DB

        url = TP.uc('localdb://local_test/_all_docs');

        //  Mark the URL as 'not loaded' to ensure that it will try to reload
        //  from the underlying source.
        url.isLoaded(false);

        //  Implied verb here is TP.HTTP_GET. Also, by default, localdb:// URLs
        //  are synchronous and configure their request to 'refresh'
        //  automatically.
        obj = url.getResource();

        this.assert.isTrue(
            obj.hasKey('total_rows'),
            TP.sc('Expected that result would have a key of \'total_rows\' and',
                    ' it doesn\'t'));

        this.assert.isEqualTo(
            obj.at('total_rows'),
            1,
            TP.sc('Expected: ', '1',
                    ' and got instead: ', obj.at('total_rows'), '.'));

        this.assert.isTrue(
            obj.hasKey('rows'),
            TP.sc('Expected that result would have a key of \'rows\' and',
                    ' it doesn\'t'));
    });

    //  ---

    this.after(
        function() {
            storage.removeKey(TP.LOCALSTORAGE_DB_NAME);
        });
});

//  ------------------------------------------------------------------------

TP.core.PouchDBURL.Inst.describe('getResource',
function() {

    var testDb;

    this.before(
        function(suite, options) {

            this.then(
                function() {
                    var now,

                        pouchPromise,
                        qPromise;

                    now = Date.now();

                    testDb = new TP.extern.PouchDB('pouch_test');

                    pouchPromise = testDb.put(
                        {
                            '_id' : 'author_info',
                            'date_created' : now,
                            'date_modified' : now,
                            'body' :
                                {
                                    'firstName' : 'Bill',
                                    'lastName' : 'Edney'
                                }
                        });

                    qPromise = new Q(pouchPromise);

                    return qPromise;
                });
        });

    //  ---

    this.it('PouchDBURL: Retrieve resource', function(test, options) {

            var url;

            //  A GET request here using the ID causes a RETRIEVE
            url = TP.uc('pouchdb://pouch_test/author_info');

            //  Mark the URL as 'not loaded' to ensure that it will try
            //  to reload from the underlying source.
            url.isLoaded(false);

            this.thenPromise(
                function(resolver, rejector) {
                    var pouchRequest;

                    //  Implied verb here is TP.HTTP_GET. Also, pouchdb://
                    //  URLs are asynchronous and configure their request to
                    //  'refresh' automatically.
                    pouchRequest = TP.request(TP.hc('uri', url));

                    pouchRequest.defineMethod('handleRequestSucceeded',
                        function(aResponse) {

                            var result;

                            result = aResponse.getResult().at('body');

                            test.assert.isTrue(
                                result.hasKey('firstName'),
                                TP.sc('Expected that result would have a key of',
                                        ' \'firstName\' and it doesn\'t'));

                            test.assert.isEqualTo(
                                    result.at('firstName'),
                                    'Bill',
                                    TP.sc('Expected: ', '"Bill"',
                                            ' and got instead: ',
                                            result.at('firstName'), '.'));

                            test.assert.isTrue(
                                result.hasKey('lastName'),
                                TP.sc('Expected that result would have a key of',
                                        ' \'lastName\' and it doesn\'t'));

                            test.assert.isEqualTo(
                                    result.at('lastName'),
                                    'Edney',
                                    TP.sc('Expected: ', '"Edney"',
                                            ' and got instead: ',
                                            result.at('lastName'), '.'));

                            resolver();
                        });

                    url.getResource(pouchRequest);
                });
        });

    //  ---

    this.it('PouchDBURL: Retrieve resource info', function(test, options) {

            var url;

            //  A GET request here using the ID causes a RETRIEVE
            url = TP.uc('pouchdb://pouch_test/author_info');

            //  Mark the URL as 'not loaded' to ensure that it will try
            //  to reload from the underlying source.
            url.isLoaded(false);

            this.thenPromise(
                function(resolver, rejector) {
                    var pouchRequest;

                    //  Implied verb here is TP.HTTP_GET, which means we need to
                    //  specify TP.HTTP_HEAD to be the *info*. Also, pouchdb://
                    //  URLs are asynchronous and configure their request to
                    //  'refresh' automatically.
                    pouchRequest = TP.request(TP.hc('uri', url,
                                                    'verb', TP.HTTP_HEAD));

                    pouchRequest.defineMethod('handleRequestSucceeded',
                        function(aResponse) {

                            var result;

                            result = aResponse.getResult();

                            test.assert.isTrue(
                                result.hasKey('date_created'),
                                TP.sc('Expected that result would have a key of',
                                        ' \'date_created\' and it doesn\'t'));

                            test.assert.isTrue(
                                result.hasKey('date_modified'),
                                TP.sc('Expected that result would have a key of',
                                        ' \'date_modified\' and it doesn\'t'));

                            resolver();
                        });

                    url.getResource(pouchRequest);
                });
        });

    //  ---

    this.it('PouchDBURL: Retrieve listing of all documents in db', function(test, options) {

            var url;

            //  A GET request here using an ID of '_all_docs" causes a RETRIEVE
            //  of all documents in the DB
            url = TP.uc('pouchdb://pouch_test/_all_docs');

            //  Mark the URL as 'not loaded' to ensure that it will try
            //  to reload from the underlying source.
            url.isLoaded(false);

            this.thenPromise(
                function(resolver, rejector) {
                    var pouchRequest;

                    //  Implied verb here is TP.HTTP_GET, which means we need to
                    //  specify TP.HTTP_HEAD to be the *info*. Also, pouchdb://
                    //  URLs are asynchronous and configure their request to
                    //  'refresh' automatically.
                    pouchRequest = TP.request(TP.hc('uri', url));

                    pouchRequest.defineMethod('handleRequestSucceeded',
                        function(aResponse) {

                            var result;

                            result = aResponse.getResult();

                            test.assert.isTrue(
                                result.hasKey('total_rows'),
                                TP.sc('Expected that result would have a key of \'total_rows\' and',
                                        ' it doesn\'t'));

                            test.assert.isEqualTo(
                                    result.at('total_rows'),
                                    1,
                                    TP.sc('Expected: ', '1',
                                            ' and got instead: ', result.at('total_rows'), '.'));

                            test.assert.isTrue(
                                result.hasKey('rows'),
                                TP.sc('Expected that result would have a key of \'rows\' and',
                                        ' it doesn\'t'));

                            resolver();
                        });

                    url.getResource(pouchRequest);
                });
        });

    //  ---

    this.after(
        function(suite, options) {
            this.then(
                function() {
                    var pouchPromise,
                        qPromise;

                    pouchPromise = TP.extern.PouchDB.destroy('pouch_test');

                    qPromise = new Q(pouchPromise);

                    return qPromise;
                });
        });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.core.TIBETURN.Inst.describe('setResource',
function() {

    this.it('TIBETURN: Set resource to object with pre-existing ID', function(test, options) {
        var url,
            val,
            obj;

        obj = TP.ac(1, 2, 3);

        //  For now, the ID and OID of the source object should be the same
        this.assert.isEqualTo(
                val = obj.getID(),
                obj.$getOID(),
                TP.sc('Expected: ', '"', val, '"',
                        ' and got instead: ', obj.$getOID(), '.'));

        val = 'testData';

        //  Now, we set the ID of the source object
        obj.setID(val);

        this.assert.isEqualTo(
                obj.getID(),
                val,
                TP.sc('Expected: ', '"', val, '"',
                        ' and got instead: ', obj.getID(), '.'));

        //  Create a TIBET URN and set it's resource to the source object
        url = TP.uc(TP.TIBET_URN_PREFIX + 'theData');
        url.setResource(obj);

        obj = url.getResource();

        //  At this point, the ID of the source object (since it was set
        //  *before* it was handed to the URN) should be different than the URN
        //  identifier.
        this.refute.isEqualTo(
                obj.getID(),
                'theData',
                TP.sc('Expected: ', '"', obj.getID(), '"',
                        ' and got instead: ', 'theData', '.'));
    });

    this.it('TIBETURN: Set resource to object with not pre-existing ID', function(test, options) {
        var url,
            val,
            obj;

        obj = TP.ac(1, 2, 3);

        //  For now, the ID and OID of the source object should be the same
        this.assert.isEqualTo(
                val = obj.getID(),
                obj.$getOID(),
                TP.sc('Expected: ', '"', val, '"',
                        ' and got instead: ', obj.$getOID(), '.'));

        //  Create a TIBET URN and set it's resource to the source object
        url = TP.uc(TP.TIBET_URN_PREFIX + 'theData');
        url.setResource(obj);

        obj = url.getResource();

        //  The object's ID should still be the same as it's OID - the URN shouldn't
        //  have altered it
        this.assert.isEqualTo(
                val = obj.getID(),
                obj.$getOID(),
                TP.sc('Expected: ', '"', obj.$getOID(), '"',
                        ' and got instead: ', val, '.'));
    });
});

//  ------------------------------------------------------------------------

TP.core.HTTPURL.Inst.describe('setResource',
function() {

    var params,
        getStatusCode,
        getResponseText,

        server;

    params = TP.hc('refresh', true, 'async', true);

    //  TODO: Replace this mechanism to get the status information when the
    //  child joins code gets changed
    getStatusCode = function(aRequest) {
        return aRequest.getChildJoins(TP.AND).first().getResponse().getResponseStatusCode();
    };

    getResponseText = function(aRequest) {
        return aRequest.getChildJoins(TP.AND).first().getResponse().getResponseText();
    };

    //  ---

    this.before(
        function() {
            server = TP.test.fakeServer.create();
        });

    //  ---

    this.it('HTTPURL: Set resource to object with virtual URI', function(test, options) {

        var url,
            obj;

        url = TP.uc('~app_tsh/xml_test.tsh');
        url.setResource('foo');

        obj = url.getResource();

        this.assert.isEqualTo(
                obj,
                'foo',
                TP.sc('Expected: ', '"foo"',
                        ' and got instead: ', obj, '.'));
    });

    //  ---

    this.it('HTTPURL: Set resource using PUT', function(test, options) {

        var locStr,
            testBody,

            url;

        locStr = '/TIBET_endpoints/HTTP_PUT_TEST';
        testBody = 'PUT test content';

        server.respondWith(
            TP.HTTP_PUT,
            locStr,
            function(req) {

                test.assert.isEqualTo(req.requestBody, testBody);

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED,
                    },
                    'OK from PUT');
            });

        url = TP.uc(locStr);

        this.thenPromise(
            function(resolver, rejector) {
                var putParams,
                    putRequest;

                putParams = params.copy().atPut('verb', TP.HTTP_PUT);
                putRequest = url.constructRequest(putParams);

                putRequest.defineMethod('handleRequestSucceeded',
                    function(aResponse) {

                        test.assert.isEqualTo(
                                getStatusCode(this), 200);
                        test.assert.isEqualTo(
                                getResponseText(this), 'OK from PUT');

                        resolver();
                    });

                url.setResource(testBody);
                url.save(putRequest);
            });

        server.respond();
    });

    //  ---

    this.it('HTTPURL: Set resource using POST', function(test, options) {

        var locStr,
            testBody,

            url;

        locStr = '/TIBET_endpoints/HTTP_POST_TEST';
        testBody = 'POST test content';

        server.respondWith(
            TP.HTTP_POST,
            locStr,
            function(req) {

                test.assert.isEqualTo(req.requestBody, testBody);

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED,
                    },
                    'OK from POST');
            });

        url = TP.uc(locStr);

        this.thenPromise(
            function(resolver, rejector) {
                var postRequest;

                postRequest = url.constructRequest(params);

                postRequest.defineMethod('handleRequestSucceeded',
                    function(aResponse) {

                        test.assert.isEqualTo(
                                getStatusCode(this), 200);
                        test.assert.isEqualTo(
                                getResponseText(this), 'OK from POST');

                        resolver();
                    });

                url.setResource(testBody);
                url.save(postRequest);
            });

        server.respond();
    });

    //  ---

    this.it('HTTPURL: Set resource using FORM POST', function(test, options) {

        var locStr,
            testBody,

            url;

        locStr = '/TIBET_endpoints/HTTP_FORM_POST_TEST';
        testBody = TP.hc('foo', 'bar', 'baz', 'goo');

        server.respondWith(
            TP.HTTP_POST,
            locStr,
            function(req) {

                test.assert.isEqualTo(req.requestBody, 'foo=bar&baz=goo');

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED,
                    },
                    'OK from FORM POST');
            });

        url = TP.uc(locStr);

        this.thenPromise(
            function(resolver, rejector) {
                var postParams,
                    postRequest;

                postParams = params.copy().atPut('mimetype', TP.URL_ENCODED);
                postRequest = url.constructRequest(postParams);

                postRequest.defineMethod('handleRequestSucceeded',
                    function(aResponse) {

                        test.assert.isEqualTo(
                                getStatusCode(this), 200);
                        test.assert.isEqualTo(
                                getResponseText(this), 'OK from FORM POST');

                        resolver();
                    });

                url.setResource(testBody);
                url.save(postRequest);
            });

        server.respond();
    });

    //  ---

    this.it('HTTPURL: Set resource using MULTIPART FORM POST - TEXT', function(test, options) {

        var locStr,
            testBody,

            url;

        locStr = '/TIBET_endpoints/HTTP_MULTIPART_FORM_POST_TEXT_TEST';
        testBody = TP.hc('foo', 'bar', 'baz', 'goo');

        server.respondWith(
            TP.HTTP_POST,
            locStr,
            function(req) {

                test.assert.matches(req.requestBody, /Content-disposition: form-data; name="foo"/);
                test.assert.matches(req.requestBody, /Content-disposition: form-data; name="baz"/);

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED,
                    },
                    'OK from MULTIPART FORM TEXT POST');
            });

        url = TP.uc(locStr);

        this.thenPromise(
            function(resolver, rejector) {
                var postParams,
                    postRequest;

                postParams = params.copy().atPut('mimetype',
                                TP.MP_FORMDATA_ENCODED);
                postRequest = url.constructRequest(postParams);

                postRequest.defineMethod('handleRequestSucceeded',
                    function(aResponse) {

                        test.assert.isEqualTo(
                                getStatusCode(this), 200);
                        test.assert.isEqualTo(
                                getResponseText(this), 'OK from MULTIPART FORM TEXT POST');

                        resolver();
                    });

                url.setResource(testBody);
                url.save(postRequest);
            });

        server.respond();
    });

    //  ---

    this.it('HTTPURL: Set resource using MULTIPART FORM POST - XML', function(test, options) {

        var locStr,
            testBody,

            url;

        locStr = '/TIBET_endpoints/HTTP_MULTIPART_FORM_POST_XML_TEST';
        testBody = TP.elem(TP.xmlstr(TP.hc('foo','bar','baz','goo')));

        server.respondWith(
            TP.HTTP_POST,
            locStr,
            function(req) {

                test.assert.matches(req.requestBody, /Content-disposition: form-data; name="foo"/);
                test.assert.matches(req.requestBody, /Content-disposition: form-data; name="baz"/);

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED,
                    },
                    'OK from MULTIPART FORM XML POST');
            });

        url = TP.uc(locStr);

        this.thenPromise(
            function(resolver, rejector) {
                var postParams,
                    postRequest;

                postParams = params.copy().atPut('mimetype',
                                TP.MP_FORMDATA_ENCODED);
                postRequest = url.constructRequest(postParams);

                postRequest.defineMethod('handleRequestSucceeded',
                    function(aResponse) {

                        test.assert.isEqualTo(
                                getStatusCode(this), 200);
                        test.assert.isEqualTo(
                                getResponseText(this), 'OK from MULTIPART FORM XML POST');

                        resolver();
                    });

                url.setResource(testBody);
                url.save(postRequest);
            });

        server.respond();
    });

    //  ---

    this.it('HTTPURL: Set resource using MULTIPART RELATED POST - MIXED', function(test, options) {

        var locStr,
            testBody,

            url;

        locStr = '/TIBET_endpoints/HTTP_MULTIPART_RELATED_POST_MIXED_TEST';
        testBody = TP.ac(
                        TP.hc('body', 'Content chunk 1'),
                        TP.hc('body', 'Content chunk 2'),
                        TP.hc('body', TP.elem('<content>Content chunk 3</content>')));

        server.respondWith(
            TP.HTTP_POST,
            locStr,
            function(req) {

                test.assert.matches(req.requestBody, /Content-ID: 0\s+Content chunk 1/);
                test.assert.matches(req.requestBody, /Content-ID: 1\s+Content chunk 2/);
                test.assert.matches(req.requestBody, /Content-ID: 2\s+<content>Content chunk 3<\/content>/);

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED,
                    },
                    'OK from MULTIPART RELATED MIXED POST');
            });

        url = TP.uc(locStr);

        this.thenPromise(
            function(resolver, rejector) {
                var postParams,
                    postRequest;

                postParams = params.copy().atPut('mimetype',
                                TP.MP_RELATED_ENCODED);
                postRequest = url.constructRequest(postParams);

                postRequest.defineMethod('handleRequestSucceeded',
                    function(aResponse) {

                        test.assert.isEqualTo(
                                getStatusCode(this), 200);
                        test.assert.isEqualTo(
                                getResponseText(this), 'OK from MULTIPART RELATED MIXED POST');

                        resolver();
                    });

                url.setResource(testBody);
                url.save(postRequest);
            });

        server.respond();
    });

    //  ---

    this.it('HTTPURL: Delete resource using DELETE', function(test, options) {

        var locStr,

            url;

        locStr = '/TIBET_endpoints/HTTP_DELETE_TEST';

        server.respondWith(
            TP.HTTP_DELETE,
            locStr,
            function(req) {

                req.respond(
                    200,
                    {
                        'Content-Type': TP.PLAIN_TEXT_ENCODED,
                    },
                    'OK from DELETE');
            });

        url = TP.uc(locStr);

        this.thenPromise(
            function(resolver, rejector) {
                var deleteRequest;

                deleteRequest = url.constructRequest(params);

                deleteRequest.defineMethod('handleRequestSucceeded',
                    function(aResponse) {

                        test.assert.isEqualTo(
                                getStatusCode(this), 200);
                        test.assert.isEqualTo(
                                getResponseText(this), 'OK from DELETE');

                        resolver();
                    });

                url.nuke(deleteRequest);
            });

        server.respond();
    });

    //  ---

    this.after(
        function() {
            server.restore();
        });
}).skip(!TP.sys.isHTTPBased());

//  ------------------------------------------------------------------------

TP.core.LocalDBURL.Inst.describe('setResource',
function() {

    this.it('LocalDBURL: Set resource using PUT (supplied id means UPDATE if found)', function(test, options) {

        var url,

            saveResult,

            obj;

        //  A PUT request here using the ID causes an UPDATE

        url = TP.uc('localdb://local_test/author_info');

        //  By default, localdb:// URLs are synchronous and configure their
        //  request to 'refresh' automatically.

        url.setResource(TP.hc('firstName', 'Scott', 'lastName', 'Shattuck'));
        saveResult = url.save(TP.hc('verb', TP.HTTP_PUT)).get('result');

        this.assert.isValid(
            saveResult.at('ok'),
            TP.sc('Expected a result with an \'ok\' property'));

        //  Mark the URL as 'not loaded' to ensure that it will try to reload
        //  from the underlying source.
        url.isLoaded(false);

        obj = url.getResource().at('_body');

        this.assert.isTrue(
            obj.hasKey('firstName'),
            TP.sc('Expected that result would have a key of \'firstName\' and',
                    ' it doesn\'t'));

        this.assert.isEqualTo(
                obj.at('firstName'),
                'Scott',
                TP.sc('Expected: ', '"Scott"',
                        ' and got instead: ', obj.at('firstName'), '.'));

        this.assert.isTrue(
            obj.hasKey('lastName'),
            TP.sc('Expected that result would have a key of \'lastName\' and',
                    ' it doesn\'t'));

        this.assert.isEqualTo(
                obj.at('lastName'),
                'Shattuck',
                TP.sc('Expected: ', '"Shattuck"',
                        ' and got instead: ', obj.at('lastName'), '.'));
    });

    this.it('LocalDBURL: Set resource using POST (computed id means CREATE)', function(test, options) {

        var url,
            saveResult,
            obj;

        //  A POST request here without the ID causes a CREATE and an
        //  auto-generated ID

        url = TP.uc('localdb://local_test/');

        //  Implied verb here is TP.HTTP_POST. Also, by default, localdb:// URLs
        //  are synchronous and configure their request to 'refresh'
        //  automatically.

        url.setResource(TP.hc('firstName', 'Sylvia', 'lastName', 'Hacker'));
        saveResult = url.save().get('result');

        this.assert.isValid(
            saveResult.at('ok'),
            TP.sc('Expected a result with an \'ok\' property'));

        //  Compute a URL using the '_id' that was generated
        url = TP.uc('localdb://local_test/' + saveResult.at('_id'));

        obj = url.getResource().at('_body');

        this.assert.isTrue(
            obj.hasKey('firstName'),
            TP.sc('Expected that result would have a key of \'firstName\' and',
                    ' it doesn\'t'));

        this.assert.isEqualTo(
                obj.at('firstName'),
                'Sylvia',
                TP.sc('Expected: ', '"Sylvia"',
                        ' and got instead: ', obj.at('firstName'), '.'));

        this.assert.isTrue(
            obj.hasKey('lastName'),
            TP.sc('Expected that result would have a key of \'lastName\' and',
                    ' it doesn\'t'));

        this.assert.isEqualTo(
                obj.at('lastName'),
                'Hacker',
                TP.sc('Expected: ', '"Hacker"',
                        ' and got instead: ', obj.at('lastName'), '.'));
    });

    this.it('LocalDBURL: Delete resource using DELETE (supplied id means DELETE if found)', function(test, options) {

        var url,

            nukeResult,

            obj;

        //  A DELETE request here with the ID causes a DELETE

        url = TP.uc('localdb://local_test/author_info');

        //  By default, localdb:// URLs are synchronous and configure their
        //  request to 'refresh'.

        url.setResource(null);
        nukeResult = url.nuke(TP.hc('verb', TP.HTTP_DELETE)).get('result');

        this.assert.isValid(
            nukeResult.at('ok'),
            TP.sc('Expected a result with an \'ok\' property'));

        //  Mark the URL as 'not loaded' to ensure that it will try to reload
        //  from the underlying source.
        url.isLoaded(false);

        obj = url.getResource();

        this.refute.isValid(
            obj,
            TP.sc('Expected that result would not be valid'));
    });

    this.it('LocalDBURL: Delete all documents in db using DELETE (no supplied id means DELETE entire db)', function(test, options) {
        var url,

            nukeResult,

            obj;

        //  A DELETE request here without the ID causes a DELETE (of the whole
        //  DB)

        url = TP.uc('localdb://local_test');

        //  By default, localdb:// URLs are synchronous and configure their
        //  request to 'refresh'.

        url.setResource(null);
        nukeResult = url.nuke(TP.hc('verb', TP.HTTP_DELETE)).get('result');

        this.assert.isValid(
            nukeResult.at('ok'),
            TP.sc('Expected a result with an \'ok\' property'));

        //  Mark the URL as 'not loaded' to ensure that it will try to reload
        //  from the underlying source.
        url.isLoaded(false);

        obj = url.getResource();

        this.refute.isValid(
            obj,
            TP.sc('Expected that result would not be valid'));
    });
});

//  ------------------------------------------------------------------------

TP.core.PouchDBURL.Inst.describe('setResource',
function() {

    var testDb;

    this.before(
        function(suite, options) {

            this.then(
                function() {
                    var now,

                        pouchPromise,
                        qPromise;

                    now = Date.now();

                    testDb = new TP.extern.PouchDB('pouch_test');

                    pouchPromise = testDb.put(
                        {
                            '_id' : 'author_info',
                            'date_created' : now,
                            'date_modified' : now,
                            'body' :
                                {
                                    'firstName' : 'Bill',
                                    'lastName' : 'Edney'
                                }
                        });

                    qPromise = new Q(pouchPromise);

                    return qPromise;
                });
        });

    //  ---

    this.it('PouchDBURL: Set resource using PUT (supplied id means UPDATE if found)', function(test, options) {

        var url,
            pouchRequest;

            //  A PUT request here using the ID causes an UPDATE

            url = TP.uc('pouchdb://pouch_test/author_info');

            //  pouchdb:// URLs are asynchronous
            pouchRequest = TP.request(TP.hc('uri', url, 'verb', TP.HTTP_PUT));

            url.setResource(TP.hc('firstName', 'Scott', 'lastName', 'Shattuck'));

            pouchRequest.defineMethod('handleRequestSucceeded',
                function (aResponse) {

                    var result;

                    result = aResponse.getResult();

                    test.assert.isValid(
                        result.at('ok'),
                        TP.sc('Expected a result with an \'ok\' property'));
                });

            url.save(pouchRequest);
        });

    //  ---

    this.it('PouchDBURL: Set resource using POST (computed id means CREATE)', function(test, options) {

        var url,
            pouchRequest;

            //  A POST request here without the ID causes a CREATE and an
            //  auto-generated ID

            url = TP.uc('pouchdb://pouch_test');

            //  pouchdb:// URLs are asynchronous
            pouchRequest = TP.request(TP.hc('uri', url, 'verb', TP.HTTP_POST));

            url.setResource(TP.hc('firstName', 'Sylvia', 'lastName', 'Hacker'));

            pouchRequest.defineMethod('handleRequestSucceeded',
                function (aResponse) {

                    var result;

                    result = aResponse.getResult();

                    test.assert.isValid(
                        result.at('ok'),
                        TP.sc('Expected a result with an \'ok\' property'));
                });

            url.save(pouchRequest);
        });

    //  ---

    this.it('PouchDBURL: Delete resource using DELETE (supplied id means DELETE if found)', function(test, options) {

            var url,
                pouchRequest;

            //  A DELETE request here with the ID causes a DELETE

            url = TP.uc('pouchdb://pouch_test/author_info');

            //  pouchdb:// URLs are asynchronous
            pouchRequest = TP.request(TP.hc('uri', url, 'verb', TP.HTTP_DELETE));

            url.setResource(null);

            pouchRequest.defineMethod('handleRequestSucceeded',
                function (aResponse) {

                    var result;

                    result = aResponse.getResult();

                    test.assert.isValid(
                        result.at('ok'),
                        TP.sc('Expected a result with an \'ok\' property'));

                });

            url.nuke(pouchRequest);
        });

    //  ---

    this.it('PouchDBURL: Delete all documents in db using DELETE (no supplied id means DELETE entire db)', function(test, options) {

            var url,
                pouchRequest;

            //  A DELETE request here without the ID causes a DELETE (of the
            //  whole DB)

            url = TP.uc('pouchdb://pouch_test');

            //  pouchdb:// URLs are asynchronous
            pouchRequest = TP.request(TP.hc('uri', url, 'verb', TP.HTTP_DELETE));

            url.setResource(null);

            pouchRequest.defineMethod('handleRequestSucceeded',
                function (aResponse) {

                    var result;

                    result = aResponse.getResult();

                    test.assert.isValid(
                        result.at('ok'),
                        TP.sc('Expected a result with an \'ok\' property'));
                });

            url.nuke(pouchRequest);
        });

    //  ---

    this.after(
        function(suite, options) {
            this.then(
                function() {
                    var pouchPromise,
                        qPromise;

                    pouchPromise = TP.extern.PouchDB.destroy('pouch_test');

                    qPromise = new Q(pouchPromise);

                    return qPromise;
                });
        });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.core.TIBETURN.Inst.describe('observe',
function() {

    this.it('JSON data test', function(test, options) {
        var handlers,

            modelObj,

            jsonURI1,
            uriObsValueFunction1,
            uriObsStructureFunction1,

            jsonURI2,
            uriObsFunction2,

            jsonURI3,
            uriObsValueFunction3,
            uriObsStructureFunction3,

            jsonPath,
            val;

        handlers = TP.hc();

        modelObj = TP.json2js('{"foo":["1st","2nd",{"hi":"there"}]}');
        modelObj.setID('jsonData');

        //  ---

        jsonURI1 = TP.uc('urn:tibet:jsonData');
        jsonURI1.setResource(modelObj);

        uriObsValueFunction1 = function (aSig) {
            handlers.atPut('handler1_value', true);
        };
        uriObsValueFunction1.observe(jsonURI1, 'TP.sig.ValueChange');

        uriObsStructureFunction1 = function (aSig) {
            handlers.atPut('handler1_structure', true);
        };
        uriObsStructureFunction1.observe(jsonURI1, 'TP.sig.StructureChange');

        jsonURI2 = TP.uc('urn:tibet:jsonData#tibet(foo.1)');

        uriObsFunction2 = function (aSig) {
            handlers.atPut('handler2', true);
        };
        uriObsFunction2.observe(jsonURI2, 'TP.sig.ValueChange');

        jsonURI3 = TP.uc('urn:tibet:jsonData#tibet(foo.2)');

        uriObsValueFunction3 = function (aSig) {
            handlers.atPut('handler3_value', true);
        };
        uriObsValueFunction3.observe(jsonURI3, 'TP.sig.ValueChange');

        uriObsStructureFunction3 = function (aSig) {
            handlers.atPut('handler3_structure', true);
        };
        uriObsStructureFunction3.observe(jsonURI3, 'TP.sig.StructureChange');

        //  ---

        jsonPath = TP.apc('foo.1');

        //  Note that we do not need to pass 'true' as the 3rd parameter here,
        //  since the model object will have configured itself to signal *Change
        //  when it was observed for Change signals.
        jsonPath.executeSet(modelObj, '3rd');

        //  The handler hash should have a 'true' flag for handler1_value
        test.assert.contains(handlers, 'handler1_value');

        //  But not for handler1_structure (no structure was changed);
        test.refute.contains(handlers, 'handler1_structure');

        //  The handler hash should have a 'true' flag for handler2
        test.assert.contains(handlers, 'handler2');

        //  But *not* for handler3_value or handler3_structure (it's observing
        //  at a similar level in the chain, but on a different branch)
        test.refute.contains(handlers, 'handler3_value');
        test.refute.contains(handlers, 'handler3_structure');

        val = jsonPath.executeGet(modelObj);

        this.assert.isEqualTo(val, '3rd');

        //  ---

        handlers.empty();

        //  ---

        jsonPath = TP.apc('foo.2');

        //  Note that we do not need to pass 'true' as the 3rd parameter here,
        //  since the model object will have configured itself to signal *Change
        //  when it was observed for Change signals.
        jsonPath.executeSet(modelObj, 'something else');

        //  The handler hash should have a 'true' flag for handler1_value
        test.assert.contains(handlers, 'handler1_value');

        //  The handler hash should have a 'true' flag for handler1_structure
        test.assert.contains(handlers, 'handler1_structure');

        //  But it should *not* for handler2 (it's observing at a similar level
        //  in observing at a similar level in the chain, but on a different
        //  branch)
        test.refute.contains(handlers, 'handler2');

        //  But it *should* for handler3_value and handler3_structure
        test.assert.contains(handlers, 'handler3_value');
        test.assert.contains(handlers, 'handler3_structure');

        val = jsonPath.executeGet(modelObj);

        this.assert.isEqualTo(val, 'something else');
    });

    this.it('XML data test', function(test, options) {
        var handlers,

            modelObj,

            xmlURI1,
            uriObsValueFunction1,
            uriObsStructureFunction1,

            xmlURI2,
            uriObsFunction2,

            xmlURI3,
            uriObsValueFunction3,
            uriObsStructureFunction3,

            xmlPath,
            result,
            val;

        handlers = TP.hc();

        modelObj = TP.tpdoc('<emp><lname>Edney</lname></emp>');
        modelObj.setID('xmlData');

        //  ---

        xmlURI1 = TP.uc('urn:tibet:xmlData');
        xmlURI1.setResource(modelObj);

        uriObsValueFunction1 = function (aSig) {
            handlers.atPut('handler1_value', true);
        };
        uriObsValueFunction1.observe(xmlURI1, 'TP.sig.ValueChange');

        uriObsStructureFunction1 = function (aSig) {
            handlers.atPut('handler1_structure', true);
        };
        uriObsStructureFunction1.observe(xmlURI1, 'TP.sig.StructureChange');

        xmlURI2 = TP.uc('urn:tibet:xmlData#xpath1(/emp/lname)');

        uriObsFunction2 = function (aSig) {
            handlers.atPut('handler2', true);
        };
        uriObsFunction2.observe(xmlURI2, 'TP.sig.ValueChange');

        xmlURI3 = TP.uc('urn:tibet:xmlData#xpath1(/emp/fname)');

        uriObsValueFunction3 = function (aSig) {
            handlers.atPut('handler3_value', true);
        };
        uriObsValueFunction3.observe(xmlURI3, 'TP.sig.ValueChange');

        uriObsStructureFunction3 = function (aSig) {
            handlers.atPut('handler3_structure', true);
        };
        uriObsStructureFunction3.observe(xmlURI3, 'TP.sig.StructureChange');

        //  ---

        xmlPath = TP.apc('/emp/lname').set('shouldCollapse', true);

        //  Note that we do not need to pass 'true' as the 3rd parameter here,
        //  since the model object will have configured itself to signal *Change
        //  when it was observed for Change signals.
        xmlPath.executeSet(modelObj, 'Smith');

        //  The handler hash should have a 'true' flag for handler1_value
        this.assert.contains(handlers, 'handler1_value');

        //  But not for handler1_structure (no structure was changed);
        test.refute.contains(handlers, 'handler1_structure');

        //  The handler hash should have a 'true' flag for handler2
        this.assert.contains(handlers, 'handler2');

        //  But *not* for handler3_value or handler3_structure (it's observing
        //  at a similar level in the chain, but on a different branch)
        test.refute.contains(handlers, 'handler3_value');
        test.refute.contains(handlers, 'handler3_structure');

        //  This will return a single native Element
        result = xmlPath.executeGet(modelObj);

        //  This will return its text value
        val = TP.val(result);

        this.assert.isEqualTo(val, 'Smith');

        //  ---

        handlers.empty();

        //  ---

        xmlPath = TP.apc('/emp/fname').set('shouldCollapse', true);

        //  Make sure to turn structure creation on
        xmlPath.set('shouldMake', true);

        //  Note that we do not need to pass 'true' as the 3rd parameter here,
        //  since the model object will have configured itself to signal *Change
        //  when it was observed for Change signals.
        xmlPath.executeSet(modelObj, 'Mike');

        //  The handler hash should have a 'true' flag for handler1_value
        this.assert.contains(handlers, 'handler1_value');

        //  The handler hash should have a 'true' flag for handler1_structure
        test.assert.contains(handlers, 'handler1_structure');

        //  But it should *not* for handler2 (it's observing at a similar level
        //  in observing at a similar level in the chain, but on a different
        //  branch)
        test.refute.contains(handlers, 'handler2');

        //  But it *should* for handler3_value and handler3_structure
        test.assert.contains(handlers, 'handler3_value');
        test.assert.contains(handlers, 'handler3_structure');

        //  This will return a single native Element
        result = xmlPath.executeGet(modelObj);

        //  This will return its text value
        val = TP.val(result);

        this.assert.isEqualTo(val, 'Mike');
    });
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.core.TIBETURL.Inst.runTestSuites();
TP.core.TIBETURN.Inst.runTestSuites();
TP.core.JSURI.Inst.runTestSuites();
TP.core.HTTPURL.Inst.runTestSuites();
TP.core.JSONPURL.Inst.runTestSuites();
TP.core.LocalDBURL.Inst.runTestSuites();
TP.core.PouchDBURL.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
