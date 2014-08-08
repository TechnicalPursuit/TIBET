//  ========================================================================
/*
NAME:   TP.sherpa.tile.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        The contents of this file are subject to the terms and conditions of
        the Technical Pursuit License ("TPL") Version 1.5, or subsequent
        versions as allowed by the TPL, and You may not copy or use this
        file in either source code or executable form, except in compliance
        with the terms and conditions of the TPL.  You may obtain a copy of
        the TPL (the "License") from Technical Pursuit Inc. at
        http://www.technicalpursuit.com.

        All software distributed under the License is provided strictly on
        an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR
        IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS ALL SUCH
        WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT,
        OR NON-INFRINGEMENT. See the License for specific language governing
        rights and limitations under the License.
*/
//  ========================================================================

/**
 * @type {TP.sherpa.tile}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:tile');

TP.sherpa.tile.Inst.defineAttribute(
        'header',
        {'value': TP.cpc('.header', true)});

TP.sherpa.tile.Inst.defineAttribute(
        'headerText',
        {'value': TP.cpc('.header_text', true)});

TP.sherpa.tile.Inst.defineAttribute(
        'closeMark',
        {'value': TP.cpc('.close_mark', true)});

TP.sherpa.tile.Inst.defineAttribute(
        'body',
        {'value': TP.cpc('.body', true)});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.tile.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('node'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.tile.Inst.defineMethod('init',
function() {

    this.callNextMethod();

    //this.observe(this.get('closeMark'), 'TP.sig.DOMClick');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.tile.Inst.defineMethod('handleTP_sig_DOMClick',
function(aSignal) {

    var natNode,
        ourParent;

    this.ignore(aSignal.getSignalOrigin(), aSignal.getSignalName);

    natNode = this.getNativeNode();
    ourParent = natNode.parentNode;

    TP.wrap(ourParent).removeChild(natNode);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.tile.Inst.defineMethod('setHeader',
function(newContent, aRequest) {

    return this.get('headerText').setTextContent(newContent);
});

//  ------------------------------------------------------------------------

TP.sherpa.tile.Inst.defineMethod('setProcessedContent',
function(newContent, aRequest) {

    /**
     * @name setProcessedContent
     * @synopsis Sets the content of the receiver to the content provided
     *     without performing any content processing on it.
     * @param {Object} newContent The content to write into the receiver. This
     *     can be a String, a Node, or an Object capable of being converted into
     *     one of those forms.
     * @param {TP.sig.Request} aRequest An optional request object which defines
     *     further parameters.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    return this.get('body').setProcessedContent(newContent, aRequest);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
