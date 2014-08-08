//  ========================================================================
/*
NAME:   TP.sherpa.logview.js
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
 * @type {TP.sherpa.logview}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:logview');

TP.sherpa.logview.Inst.defineAttribute(
        'body',
        {'value': TP.cpc('.body', true)});

TP.sherpa.logview.Inst.defineAttribute(
        'entryList',
        {'value': TP.cpc('#entryList', true)});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.logview.Type.defineMethod('tagAttachDOM',
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

TP.sherpa.logview.Inst.defineMethod('setup',
function() {

    /**
     * @name setup
     */

    this.setProcessedContent('<ul id="entryList"></ul>');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.logview.Inst.defineMethod('addLogEntry',
function(dataRecord) {

    var cssClass,
        content;

    cssClass = TP.ifInvalid(dataRecord.at('cssClass'), ''); 

    content = '<li><span class="' + cssClass + '">' +
                dataRecord.at('output') +
                '</span></li>';

    return this.get('entryList').addProcessedContent(content);
});

//  ------------------------------------------------------------------------

TP.sherpa.logview.Inst.defineMethod('addProcessedContent',
function(newContent, aRequest) {

    return this.get('body').addProcessedContent(newContent, aRequest);
});

//  ------------------------------------------------------------------------

TP.sherpa.logview.Inst.defineMethod('setProcessedContent',
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
