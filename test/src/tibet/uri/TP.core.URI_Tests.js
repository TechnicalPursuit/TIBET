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

    this.it('URL with virtual URI', function(test, options) {

        this.assert.equalTo(
            TP.uc('tibet:///~').getLocation(),
            TP.uc('~').getLocation(),
            TP.sc('tibet:///~ and ~ should be equivalent paths.'));

        this.assert.equalTo(
            TP.uc('tibet:///~').getLocation(),
            TP.sys.getAppRoot(),
            TP.sc('tibet:///~ and app root should be equivalent paths.'));

        this.assert.equalTo(
            TP.uc('tibet:///~tibet').getLocation(),
            TP.uc('~tibet').getLocation(),
            TP.sc('tibet:///~tibet and ~tibet should be equivalent paths.'));

        this.assert.equalTo(
            TP.uc('tibet:///~tibet').getLocation(),
            TP.sys.getLibRoot(),
            TP.sc('tibet:///~tibet and lib root should be equivalent paths.'));

        this.assert.equalTo(
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

    this.beforeEach(
        function() {
            //  NB: The default of TIBETURNs is that they fetch their resources
            //  synchronously, so we don't need to specify that here.
            params = TP.request('refresh', true, 'async', false);
        });

    this.before(
        function() {
            var win,
                doc,

                backgroundElem,
                childElem;

            //  Set up a temporary reference to the top-level window name
            TP.$$topWindowName = TP.sys.cfg('tibet.uibuffer');

            win = TP.win(TP.$$topWindowName + '.UIROOT');

            //  Make sure there's a window named 'screen_0' under a window named
            //  'UIROOT' under a window named by the name in TP.$$topWindowName
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

    //  ---

    this.it('Retrieve global objects', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet:///urn:tibet:TP').getResource(params),
            TP,
            TP.sc('tibet:///urn:tibet:TP should find the named instance "TP".'));

        this.assert.identicalTo(
            TP.uc('tibet:///urn:tibet:TP.sys').getResource(params),
            TP.sys,
            TP.sc('tibet:///urn:tibet:TP.sys should find the named instance' +
                    ' "TP.sys".'));

        this.assert.identicalTo(
            TP.uc('tibet:///javascript:TP').getResource(params),
            TP,
            TP.sc('tibet:///javascript:TP should find the named instance "TP".'));

        this.assert.identicalTo(
            TP.uc('tibet:///javascript:TP.sys').getResource(params),
            TP.sys,
            TP.sc('tibet:///javascript:TP.sys should find the named instance' +
                    ' "TP.sys".'));
    });

    //  ---

    this.it('Retrieve type object', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet:///urn:tibet:TP.sig.Signal').getResource(params),
            TP.sig.Signal,
            TP.sc('tibet:///urn:tibet:TP.sig.Signal should find the named' +
                                                    ' type TP.sig.Signal.'));
    });

    //  ---

    this.it('Retrieve registered object', function(test, options) {

        var foo;

        foo = TP.ac(1,2,3);
        TP.sys.registerObject(foo, 'FOO', true);

        this.assert.identicalTo(
            TP.uc('tibet:///urn:tibet:FOO').getResource(params),
            foo,
            TP.sc('tibet:///urn:tibet:FOO should refer to the FOO object' +
                    ' in top.'));
    });

    //  ---

    this.it('Retrieve object nested in iframe', function(test, options) {

        this.assert.equalTo(
            TP.uc('tibet:///javascript:top.UIROOT.$$globalID').getResource(
                                                                    params),
            TP.$$topWindowName + '.UIROOT',
            TP.sc('tibet:///javascript:top.UIROOT.$$globalID should find the',
                    ' object at "', TP.$$topWindowName,
                    '".UIROOT.$$globalID".'));

        this.assert.equalTo(
            TP.uc('tibet://top.UIROOT/javascript:$$globalID').getResource(
                                                                    params),
            TP.$$topWindowName + '.UIROOT',
            TP.sc('tibet://top.UIROOT/javascript:$$globalID should find',
                    ' the object at "', TP.$$topWindowName,
                    '.UIROOT.screen_0.$$globalID".'));
    });

    //  ---

    this.it('Retrieve TP.core.Window of the top-level window', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://top/').getResource(params),
            TP.byOID('top'),
            TP.sc('tibet://top/ should find the top-level Window.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://top').getResource(params),
            TP.byOID('top'),
            TP.sc('tibet://top should find the top-level Window.'));
    });

    //  ---

    this.it('Retrieve TP.core.HTMLDocumentNode of the top-level window', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://top/#document').getResource(params),
            TP.byOID('top').getDocument(),
            TP.sc('tibet://top/#document should find the document of the' +
                    ' top-level Window.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://top#document').getResource(params),
            TP.byOID('top').getDocument(),
            TP.sc('tibet://top#document should find the document of the' +
                    ' top-level Window.'));
    });

    //  ---

    this.it('Retrieve nested TP.html.iframe in top-level window', function(test, options) {

        //  Get the <iframe> element that has an id of UIROOT
        this.assert.identicalTo(
            TP.uc('tibet://top/#UIROOT').getResource(params).getNativeNode(),
            TP.byId('UIROOT', TP.win('top')),
            TP.sc('tibet://top/#UIROOT should find the iframe element with' +
                    ' id "UIROOT" in the top-level window\'s document.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://top#UIROOT').getResource(params).getNativeNode(),
            TP.byId('UIROOT', TP.win('top')),
            TP.sc('tibet://top/#UIROOT should find the iframe element with' +
                    ' id "UIROOT" in the top-level window\'s document.'));
    });

    //  ---

    this.it('Retrieve TP.core.Window of UIROOT', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://UIROOT/').getResource(params),
            TP.core.Window.construct('UIROOT'),
            TP.sc('tibet://UIROOT/ should find the Window named "UIROOT".'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://UIROOT').getResource(params),
            TP.core.Window.construct('UIROOT'),
            TP.sc('tibet://UIROOT should find the Window named "UIROOT".'));
    });

    //  ---

    this.it('Retrieve TP.core.HTMLDocumentNode of UIROOT', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://UIROOT/#document').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT/#document should find the' +
                    ' document of the Window named "UIROOT".'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://UIROOT#document').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT#document should find the' +
                    ' document of the Window named "UIROOT".'));
    });

    //  ---

    this.it('Retrieve TP.core.Window of named window', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://top.UIROOT/').getResource(params),
            TP.core.Window.construct('top.UIROOT'),
            TP.sc('tibet://top.UIROOT/ should find the Window named' +
                    ' "UIROOT".'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://top.UIROOT').getResource(params),
            TP.core.Window.construct('top.UIROOT'),
            TP.sc('tibet://top.UIROOT should find the Window named' +
                    ' "UIROOT".'));
    });

    //  ---

    this.it('Retrieve TP.core.HTMLDocumentNode of named window #1', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://top.UIROOT/#document').getResource(params),
            TP.core.Window.construct('top.UIROOT').getDocument(),
            TP.sc('tibet://top.UIROOT/#document should find the' +
                    ' document of the Window named "UIROOT".'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://top.UIROOT#document').getResource(params),
            TP.core.Window.construct('top.UIROOT').getDocument(),
            TP.sc('tibet://top.UIROOT#document should find the' +
                    ' document of the Window named "UIROOT".'));
    });

    //  ---

    this.it('Retrieve TP.core.HTMLDocumentNode of named window #2', function(test, options) {

        //  'future_path' could be a document that will be loaded in the future.
        //  This will return the document that's currently loaded in 'UIROOT'.
        this.assert.identicalTo(
            TP.uc('tibet://UIROOT/future_path/').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT/future_path/ should find the document of' +
                    ' the Window named "UIROOT".'));

        //  The last slash should be optional

        //  'future_path' could be a document that will be loaded in the future.
        //  This will return the document that's currently loaded in 'UIROOT'.
        this.assert.identicalTo(
            TP.uc('tibet://UIROOT/future_path').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT/future_path should find the document of' +
                    ' the Window named "UIROOT".'));
    });

    //  ---

    this.it('Retrieve TP.core.HTMLDocumentNode of named window #3', function(test, options) {

        //  'future_path' could be a document that will be loaded in the future.
        //  This will return the document that's currently loaded in 'UIROOT'.
        this.assert.identicalTo(
            TP.uc('tibet://UIROOT/future_path/#document').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT/future_path/#document should find the ' +
                    'document of the Window named "UIROOT".'));

        //  The last slash should be optional

        //  'future_path' could be a document that will be loaded in the future.
        //  This will return the document that's currently loaded in 'UIROOT'.
        this.assert.identicalTo(
            TP.uc('tibet://UIROOT/future_path#document').getResource(params),
            TP.core.Window.construct('UIROOT').getDocument(),
            TP.sc('tibet://UIROOT/future_path#document should find the ' +
                    'document of the Window named "UIROOT".'));
    });

    //  ---

    this.it('Retrieve TP.core.Window of the current UI canvas', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/').getResource(params),
            TP.sys.getUICanvas(),
            TP.sc('tibet://uicanvas/ should find the current UI canvas Window.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas').getResource(params),
            TP.sys.getUICanvas(),
            TP.sc('tibet://uicanvas should find the current UI canvas Window.'));
    });

    //  ---

    this.it('Retrieve TP.core.HTMLDocumentNode of the current UI canvas', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#document').getResource(params),
            TP.sys.getUICanvas().getDocument(),
            TP.sc('tibet://uicanvas/#document should find the document of the' +
                    ' current UI canvas Window.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#document').getResource(params),
            TP.sys.getUICanvas().getDocument(),
            TP.sc('tibet://uicanvas#document should find the document of the' +
                    ' current UI canvas Window.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#document').getResource(params),
            TP.sys.getUICanvas().getDocument(),
            TP.sc('#document should find the document of the' +
                    ' current UI canvas Window.'));
    });

    //  ---

    this.it('Retrieve TP.core.ElementNode using XPointer barename', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#top_background').getResource(params).getNativeNode(),
            TP.byId('top_background'),
            TP.sc('tibet://uicanvas/#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#top_background').getResource(params).getNativeNode(),
            TP.byId('top_background'),
            TP.sc('tibet://uicanvas#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#top_background').getResource(params).getNativeNode(),
            TP.byId('top_background'),
            TP.sc('#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));
    });

    //  ---

    this.it('Retrieve Element using XPointer barename and TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#top_background').getResource(newParams),
            TP.byId('top_background'),
            TP.sc('tibet://uicanvas/#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#top_background').getResource(newParams),
            TP.byId('top_background'),
            TP.sc('tibet://uicanvas#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#top_background').getResource(newParams),
            TP.byId('top_background'),
            TP.sc('#top_background should find the element with' +
                    ' id "top_background" in the current UI canvas.'));
    });

    //  ---

    this.it('Retrieve TP.core.ElementNode using XPointer element() scheme', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#element(/1/2)').getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#element(/1/2)').getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#element(/1/2)').getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));
    });

    //  ---

    this.it('Retrieve Element using XPointer element() scheme and TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#element(/1/2)').getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#element(/1/2)').getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#element(/1/2)').getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#element(/1/2) should find the body element' +
                    ' in the document of the current UI canvas.'));
    });

    //  ---

    this.it('Retrieve TP.core.ElementNode using XPointer element() scheme with ID', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#element(top_background/1)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas/#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#element(top_background/1)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#element(top_background/1)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));
    });

    //  ---

    this.it('Retrieve Element using XPointer element() scheme with ID and TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#element(top_background/1)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas/#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#element(top_background/1)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#element(top_background/1)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('#element(top_background/1) should find the' +
                    ' first child of the body element in the document of the' +
                    ' current UI canvas.'));
    });

    //  ---

    this.it('Retrieve TP.core.ElementNode using XPointer xpath1() scheme', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#xpath1(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#xpath1(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#xpath1(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));
    });

    //  ---

    this.it('Retrieve Element using XPointer xpath1() scheme with TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#xpath1(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#xpath1(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#xpath1(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#xpath1(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));
    });

    //  ---

    this.it('Retrieve TP.core.ElementNode using XPointer xpointer() scheme', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#xpointer(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#xpointer(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#xpointer(/$def:html/$def:body)'
                    ).getResource(params).getNativeNode(),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));
    });

    //  ---

    this.it('Retrieve Element using XPointer xpointer() scheme with TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#xpointer(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas/#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#xpointer(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('tibet://uicanvas#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#xpointer(/$def:html/$def:body)'
                    ).getResource(newParams),
            TP.sys.getUICanvas().getNativeDocument().body,
            TP.sc('#xpointer(/$def:html/$def:body) should find ' +
                    'the body element in the document of the current UI canvas.'));
    });

    //  ---

    this.it('Retrieve TP.core.ElementNode using TIBET-extension XPointer css() scheme', function(test, options) {

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#css(#top_background > *:first-child)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas/#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#css(#top_background > *:first-child)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#css(#top_background > *:first-child)'
                    ).getResource(params).getNativeNode(),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));
    });

    //  ---

    this.it('Retrieve Element using TIBET-extension XPointer css() scheme with TP.DOM result type', function(test, options) {

        var newParams;

        newParams = params.copy();
        newParams.atPut('resultType', TP.DOM);

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas/#css(#top_background > *:first-child)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas/#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));

        //  The last slash should be optional

        this.assert.identicalTo(
            TP.uc('tibet://uicanvas#css(#top_background > *:first-child)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('tibet://uicanvas#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));

        //  The 'tibet://uicanvas/' should be optional

        this.assert.identicalTo(
            TP.uc('#css(#top_background > *:first-child)'
                    ).getResource(newParams),
            TP.nodeGetChildElementAt(TP.byId('top_background'), 0),
            TP.sc('#css(#top_background > *:first-child) should' +
                    ' find any children of the element with id "top_background"' +
                    ' in the document of the current UI canvas.'));
    });

    //  ---

    this.it('Try to retrieve TP.core.Window of a bogus window', function(test, options) {

        this.refute.isDefined(
            TP.uc('tibet://fluffy/').getResource(params),
            TP.sc('tibet://fluffy/ should return undefined.'));

        //  The last slash should be optional

        this.refute.isDefined(
            TP.uc('tibet://fluffy').getResource(params),
            TP.sc('tibet://fluffy should return undefined.'));
    });

    //  ---

    this.it('Trying to retrieve TP.core.ElementNode of bogus element in top-level window using an XPointer barename', function(test, options) {

        this.assert.isEmpty(
            TP.uc('tibet://top/#fluffy').getResource(params),
            TP.sc('tibet://top/#fluffy should return null.'));

        //  The last slash should be optional

        this.assert.isEmpty(
            TP.uc('tibet://top#fluffy').getResource(params),
            TP.sc('tibet://top#fluffy should return null.'));
    });

    //  ---

    this.it('Trying to retrieve TP.core.ElementNode of bogus element in top-level window using an XPointer xpath1() query', function(test, options) {

        this.assert.isEmpty(
            TP.uc('tibet://top/#xpath1(fluffy)').getResource(params),
            TP.sc('tibet://top/#xpath1(fluffy) should return the empty Array.'));

        //  The last slash should be optional

        this.assert.isEmpty(
            TP.uc('tibet://top#xpath1(fluffy)').getResource(params),
            TP.sc('tibet://top#xpath1(fluffy) should return the empty Array.'));
    });

    //  ---

    this.it('Trying to retrieve TP.core.ElementNode of bogus element in top-level window using an XPointer element() query', function(test, options) {

        this.assert.isEmpty(
            TP.uc('tibet://top/#element(fluffy)').getResource(params),
            TP.sc('tibet://top/#element(fluffy) should return the empty Array.'));

        //  The last slash should be optional

        this.assert.isEmpty(
            TP.uc('tibet://top#element(fluffy)').getResource(params),
            TP.sc('tibet://top#element(fluffy) should return the empty Array.'));
    });

    //  ---

    this.it('Trying to retrieve TP.core.ElementNode of bogus element in top-level window using an XPointer css() query', function(test, options) {

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

    this.it('Retrieve global objects', function(test, options) {

        this.assert.identicalTo(
            TP.uc('urn:tibet:TP').getResource(params),
            TP,
            TP.sc('urn:tibet:TP should find the named instance "TP".'));

        this.assert.identicalTo(
            TP.uc('urn:tibet:TP.sys').getResource(params),
            TP.sys,
            TP.sc('urn:tibet:TP.sys should find the named instance "TP.sys".'));
    });

    //  ---

    this.it('Retrieve type object', function(test, options) {

        this.assert.identicalTo(
            TP.uc('urn:tibet:TP.sig.Signal').getResource(params),
            TP.sig.Signal,
            TP.sc('urn:tibet:TP.sig.Signal should find the named type' +
                                                    ' TP.sig.Signal.'));
    });

    //  ---

    this.it('Retrieve registered object', function(test, options) {

        var foo;

        foo = TP.ac(1,2,3);
        TP.sys.registerObject(foo, 'FOO', true);

        this.assert.identicalTo(
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

            //  Make sure there's a window named 'screen_0' under a window named
            //  'UIROOT' under a window named by the name in TP.$$topWindowName
            if (!TP.isWindow(TP.win(TP.$$topWindowName + '.UIROOT.screen_0'))) {
                //  Couldn't find the window - fail the request and return
                this.fail(
                    TP.sc('Couldn\'t find window named "',
                            TP.$$topWindowName,
                            '.UIROOT.screen_0"'));

                return;
            }
        }.bind(this));

    //  ---

    this.it('Retrieve global objects', function(test, options) {

        this.assert.identicalTo(
            TP.uc('javascript:TP').getResource(params),
            TP,
            TP.sc('javascript:TP should find the named instance "TP".'));

        this.assert.identicalTo(
            TP.uc('javascript:TP.sys').getResource(params),
            TP.sys,
            TP.sc('javascript:TP.sys should find the named instance' +
                    ' "TP.sys".'));
    });

    //  ---

    this.it('Retrieve object nested in iframe', function(test, options) {

        this.assert.equalTo(
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

    params = TP.request('refresh', true, 'async', true);
    locStr = '/TIBET_endpoints/Google_home_page.html';
    resultElem = TP.wrap(TP.xhtmlnode('<html><body>Hi there</body></html>'));

    server = TP.test.fakeServer.create();

    this.before(
        function() {
            server.respondWith(
                'GET',
                locStr,
                [
                    200,
                    {
                        'Content-Type': TP.XML_ENCODED,
                    },
                    resultElem.asString(),
                ]);
        });

    //  ---

    this.it('Retrieve resource asynchronously', function(test, options) {
        var url,
            request;

        url = TP.uc(locStr);

        //  Mark the URL as 'not loaded' to ensure that it will try to reload
        //  from the underlying source.
        url.isLoaded(false);

        request = TP.request(params);
        request.defineMethod('completeJob',
            function(aResult)
            {
                test.assert.equalTo(aResult.get('html|body').at(0),
                                    resultElem.get('html|body').at(0));
            });

        url.getResource(request);

        server.respond();
    });

    //  ---

    this.it('Retrieve resource synchronously', function(test, options) {
    }).skip();

    //  ---

    this.after(
        function() {
            server.restore();
        });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

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

    this.it('Retrieve resource asynchronously', function(test, options) {
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
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

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

    this.it('Retrieve resource', function(test, options) {

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

        this.assert.equalTo(
                obj.at('firstName'),
                'Bill',
                TP.sc('Expected: ', '"Bill"',
                        ' and got instead: ', obj.at('firstName'), '.'));

        this.assert.isTrue(
            obj.hasKey('lastName'),
            TP.sc('Expected that result would have a key of \'lastName\' and',
                    ' it doesn\'t'));

        this.assert.equalTo(
                obj.at('lastName'),
                'Edney',
                TP.sc('Expected: ', '"Edney"',
                        ' and got instead: ', obj.at('lastName'), '.'));
    });

    //  ---

    this.it('Retrieve resource info', function(test, options) {

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

    this.it('Retrieve listing of all documents in db', function(test, options) {

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

        this.assert.equalTo(
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
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ------------------------------------------------------------------------

TP.core.PouchDBURL.Inst.describe('getResource',
function() {

    var testDb;

    this.before(
        function(suite, options) {
            var now;

            now = Date.now();

            testDb = new TP.extern.PouchDB('pouch_test');

            this.then(
                function () {
                    var pouchPromise;

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

                    return new Q(pouchPromise);
                });
        });

    //  ---

    this.it('Retrieve resource', function(test, options) {

            var url,
                subrequest;

            //  A GET request here using the ID causes a RETRIEVE
            url = TP.uc('pouchdb://pouch_test/author_info');

            //  Mark the URL as 'not loaded' to ensure that it will try
            //  to reload from the underlying source.
            url.isLoaded(false);

            this.thenPromise(
                function(resolver, rejector) {
                    //  Implied verb here is TP.HTTP_GET. Also, pouchdb://
                    //  URLs are asynchronous and configure their request to
                    //  'refresh' automatically.
                    subrequest = TP.request(TP.hc('uri', url));

                    subrequest.defineMethod('handleRequestSucceeded',
                        function(aResponse) {

                            var result;

                            result = aResponse.getResult().at('body');

                            test.assert.isTrue(
                                result.hasKey('firstName'),
                                TP.sc('Expected that result would have a key of',
                                        ' \'firstName\' and it doesn\'t'));

                            test.assert.equalTo(
                                    result.at('firstName'),
                                    'Bill',
                                    TP.sc('Expected: ', '"Bill"',
                                            ' and got instead: ',
                                            result.at('firstName'), '.'));

                            test.assert.isTrue(
                                result.hasKey('lastName'),
                                TP.sc('Expected that result would have a key of',
                                        ' \'lastName\' and it doesn\'t'));

                            test.assert.equalTo(
                                    result.at('lastName'),
                                    'Edney',
                                    TP.sc('Expected: ', '"Edney"',
                                            ' and got instead: ',
                                            result.at('lastName'), '.'));

                            resolver();
                        });
                });

            url.getResource(subrequest);
        });

    //  ---

    this.it('Retrieve resource info', function(test, options) {

            var url,
                subrequest;

            //  A GET request here using the ID causes a RETRIEVE
            url = TP.uc('pouchdb://pouch_test/author_info');

            //  Mark the URL as 'not loaded' to ensure that it will try
            //  to reload from the underlying source.
            url.isLoaded(false);

            this.thenPromise(
                function(resolver, rejector) {
                    //  Implied verb here is TP.HTTP_GET, which means we need to
                    //  specify TP.HTTP_HEAD to be the *info*. Also, pouchdb://
                    //  URLs are asynchronous and configure their request to
                    //  'refresh' automatically.
                    subrequest = TP.request(TP.hc('uri', url,
                                                    'verb', TP.HTTP_HEAD));

                    subrequest.defineMethod('handleRequestSucceeded',
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
                });

            url.getResource(subrequest);
        });

    //  ---

    this.it('Retrieve resource info', function(test, options) {

            var url,
                subrequest;

            //  A GET request here using an ID of '_all_docs" causes a RETRIEVE
            //  of all documents in the DB
            url = TP.uc('pouchdb://pouch_test/_all_docs');

            //  Mark the URL as 'not loaded' to ensure that it will try
            //  to reload from the underlying source.
            url.isLoaded(false);

            this.thenPromise(
                function(resolver, rejector) {
                    //  Implied verb here is TP.HTTP_GET, which means we need to
                    //  specify TP.HTTP_HEAD to be the *info*. Also, pouchdb://
                    //  URLs are asynchronous and configure their request to
                    //  'refresh' automatically.
                    subrequest = TP.request(TP.hc('uri', url));

                    subrequest.defineMethod('handleRequestSucceeded',
                        function(aResponse) {

                            var result;

                            result = aResponse.getResult();

                            test.assert.isTrue(
                                result.hasKey('total_rows'),
                                TP.sc('Expected that result would have a key of \'total_rows\' and',
                                        ' it doesn\'t'));

                            test.assert.equalTo(
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
                });

            url.getResource(subrequest);
        });

    //  ---

    this.after(
        function(suite, options) {
            TP.extern.PouchDB.destroy('pouch_test');
        });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

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
