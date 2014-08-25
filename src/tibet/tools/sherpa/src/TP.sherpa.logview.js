//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
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
