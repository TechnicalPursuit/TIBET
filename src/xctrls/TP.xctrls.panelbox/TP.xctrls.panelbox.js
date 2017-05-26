//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.panelbox}
 * @summary Manages panelbox XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:panelbox');

TP.xctrls.panelbox.addTraits(TP.xctrls.SwitchableElement);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.panelbox.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineAttribute('subitems',
    TP.cpc('> xctrls|panel', TP.hc('shouldCollapse', false)));

TP.xctrls.panelbox.Inst.defineAttribute('selectedItem',
    TP.cpc('> xctrls|panel[pclass|selected]', TP.hc('shouldCollapse', true)));

TP.xctrls.panelbox.Inst.defineAttribute('itemWithValue',
    TP.xpc('./xctrls:panel/xctrls:value[text() = "{{0}}"]/..',
        TP.hc('shouldCollapse', true)));

TP.xctrls.panelbox.Inst.defineAttribute('selectedValue',
    TP.xpc('string(./xctrls:panel' +
            '[@pclass:selected = "true"]/xctrls:value)',
        TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the value of the receiver or adds the supplied content as
     *     another panel if the panel matching the value cannot be found.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.xctrls.panel} The xctrls:panel matching the value or the
     *     newly added panel.
     */

    var request,

        contentKey,
        panelTPElem,

        handler;

    request = TP.request(aRequest);

    contentKey = request.at('contentKey');

    //  If there is a valid content key, then try to find an existing panel
    //  whose 'value' matches that key.
    if (TP.isValid(contentKey)) {
        panelTPElem = this.get('itemWithValue', contentKey);
    }

    //  Build a panel with an 'xctrls:value' containing the unique key. That
    //  will allow us to find it later.
    if (TP.isEmpty(panelTPElem)) {
        panelTPElem = this.addRawContent(
                        '<xctrls:panel><xctrls:value>' +
                        contentKey +
                        '</xctrls:value></xctrls:panel>');

        //  NB: We don't need the result here - just ensuring that that new
        //  panel has an ID (hence the 'true' supplied here).
        panelTPElem.getLocalName(true);

        //  Observe the new panel when it gets attached to the DOM. When it
        //  does, refresh its bound data.
        handler = function() {

            //  Make sure to ignore here - otherwise, we'll fill up the signal
            //  map.
            handler.ignore(panelTPElem, 'TP.sig.AttachComplete');

            panelTPElem.refresh();
        };

        handler.observe(panelTPElem, 'TP.sig.AttachComplete');

        //  Note 'addContent' here to avoid blowing away the 'xctrls:value' tag
        //  holding our key.
        panelTPElem.addContent(aContentObject);
    }

    this.setValue(contentKey);

    return panelTPElem;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
