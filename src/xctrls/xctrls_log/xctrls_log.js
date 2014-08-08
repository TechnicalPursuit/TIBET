//  ========================================================================
/*
NAME:   xctrls_log.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.2, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.1
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.log}
 * @synopsis Manages log XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:log');

TP.xctrls.log.addTraitsFrom(TP.xctrls.Element,
                            TP.xctrls.MultiItemElement,
                            TP.core.TemplatedNode);
TP.xctrls.log.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.log.executeTraitResolution();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.log.Inst.defineAttribute(
        'body',
        {'value': TP.cpc('*[tibet|pelem="body"]', true)});

TP.xctrls.log.Inst.defineAttribute(
        'firstTransform',
        {'value': TP.xpc('.//tsh:transform[1]', true)});

TP.xctrls.log.Inst.defineAttribute(
        'transformWithName',
        {'value': TP.xpc('.//tsh:transform/tsh:template[@tsh:name = "{{1}}"]/..', true)});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.log.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    //  When multiple inheritance is fixed, we should be able to do away
    //  with this (and mixin TP.core.EmbeddedTemplateNode properly).
    TP.xctrls.Element.tagAttachDOM.call(this, aRequest);
    TP.core.EmbeddedTemplateNode.tagAttachDOM.call(this, aRequest);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.log.Inst.defineMethod('handleChange',
function(aSignal) {

    /**
     * @name handleChange
     * @synopsis Handles any TP.sig.Change signals by logging information to the
     *     receiver.
     * @param {TP.sig.Change} aSignal The signal that caused this handler to
     *     trip.
     */

    var aspect,
        obj,

        val;

    aspect = aSignal.get('aspect');
    obj = TP.wrap(aSignal.getOrigin());

    val = obj.get(aspect);

    this.logData(TP.join('The "', aspect, '" aspect',
                            ' of: "', obj.getID(), '"',
                            ' changed to: "', val, '"'));

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.log.Inst.defineMethod('logData',
function(aData) {

    /**
     * @name logData
     * @synopsis Logs the supplied data to the receiver by executing the
     *     receiver's template.
     * @param {Object} aData The data to log to the receiver.
     */

    var bodyElem;

    this.addItem(TP.hc('itemData', aData));

    bodyElem = this.get('body');
    bodyElem.scrollTop = bodyElem.scrollHeight;

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
