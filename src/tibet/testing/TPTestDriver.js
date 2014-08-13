//  ========================================================================
/**
 * @file TPTestDriver.js
 * @overview Support for define/it style API testing within TIBET.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */
//  ------------------------------------------------------------------------

/**
 */

/* global Q:true
*/

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.Driver');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Driver.Inst.defineMethod('byClassName',
function(className) {

    /**
     */

    return this.byCSS('.' + className);
});

//  ------------------------------------------------------------------------

TP.test.Driver.Inst.defineMethod('byCSS',
function(cssExpr) {

    /**
     */

    var context,
    
        result;

    context = this.getWindowContext();

    result = TP.byCSS(cssExpr, context, true);

    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.test.Driver.Inst.defineMethod('byId',
function(anID) {

    /**
     */

    var context,
    
        result;

    context = this.getWindowContext();

    result = TP.byId(anID, context);

    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.test.Driver.Inst.defineMethod('byJS',
function(aFunc) {

    /**
     */

    var result;

    if (!TP.isCallable(aFunc)) {
        return null;
    }

    if (TP.isEmpty(result = aFunc())) {
        return null;
    }

    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.test.Driver.Inst.defineMethod('byLinkText',
function(text) {

    /**
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.test.Driver.Inst.defineMethod('byName',
function(aName) {

    /**
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.test.Driver.Inst.defineMethod('byPartialLinkText',
function(text) {

    /**
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.test.Driver.Inst.defineMethod('byTagName',
function(aName) {

    /**
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.test.Driver.Inst.defineMethod('byXPath',
function(aPath) {

    /**
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.test.Driver.Inst.defineMethod('fetchResource',
function(aURI, resultType) {

    var newPromise;

    newPromise = Q.Promise(
            function(resolver, rejector) {
                var subrequest;

                subrequest = TP.request(
                                TP.hc('resultType', resultType));

                subrequest.defineMethod(
                    'handleRequestSucceeded',
                    function(aResponse) {
                        resolver(aResponse.getResult());
                    });

                subrequest.defineMethod(
                    'handleRequestFailed',
                    function(aResponse) {
                        rejector(aResponse.getResult());
                    });

                aURI.getResource(subrequest);
            });

    return newPromise;
});

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.Sequence');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Sequence.Inst.defineMethod('init',
function(realObj) {

    /**
     */

    this.callNextMethod();

    this.set('actions', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Sequence.Inst.defineMethod('click',
function(aNode) {

    /**
     * @name click
     * @synopsis
     * @returns
     * @todo
     */

    var node,

        hash,
        evt;

    node = TP.unwrap(aNode);

    hash = TP.hc(
            'target', null,

            'type', 'click',

            'timeStamp', (new Date()).getTime(),

            'view', this.getNativeWindow(),

            'keyCode', 0,

            'button', 0,

            'bubbles', true,
            'cancelable', true
            );

    evt = TP.documentCreateEvent(null, hash);

    node.dispatchEvent(evt);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
