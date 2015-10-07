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

//  ------------------------------------------------------------------------

TP.xctrls.panelbox.addTraits(TP.xctrls.SwitchableElement);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineAttribute(
    'subitems',
    {
        value: TP.cpc('xctrls|panel',
                       TP.hc('shouldCollapse', false))
    });

TP.xctrls.panelbox.Inst.defineAttribute(
    'selectedItem',
    {
        value: TP.cpc('xctrls|panel[pclass|selected]',
                       TP.hc('shouldCollapse', true))
    });

TP.xctrls.panelbox.Inst.defineAttribute(
    'itemWithValue',
    {
        value: TP.xpc('./xctrls:panel/xctrls:value[text() = "{{0}}"]/..',
                       TP.hc('shouldCollapse', true))
    });

TP.xctrls.panelbox.Inst.defineAttribute(
    'selectedValue',
    {
        value: TP.xpc('string(./xctrls:panel' +
                    '[@pclass:selected = "true"]/xctrls:value)',
                       TP.hc('shouldCollapse', true))
    });

TP.xctrls.panelbox.Type.defineAttribute('opaqueSignalNames', null);

//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the value supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {null}
     */

    var request,
        uniqueSetting,
        uniqueKey,

        sourceType,
        tpElem,

        newItem;

    request = TP.request(aRequest);

    uniqueSetting = this.getAttribute('uniqueBy');
    uniqueKey = null;

    switch (uniqueSetting) {

        case 'sourceType':

            sourceType = request.at('sourceType');
            if (!TP.isType(sourceType)) {
                tpElem = TP.tpelem(aContentObject);
                if (TP.isKindOf(tpElem, TP.core.ElementNode)) {
                    sourceType = tpElem.getType();
                }
            }

            if (TP.isType(sourceType)) {
                uniqueKey = sourceType.getName();
            }

            break;

        default:
            break;
    }

    if (TP.notValid(uniqueKey)) {
        //  TODO: Log a warning.
        return null;
    }

    newItem = this.get('itemWithValue', uniqueKey);

    if (TP.notValid(newItem)) {
        newItem = this.addContent(
                        '<xctrls:panel><xctrls:value>' +
                        uniqueKey +
                        '</xctrls:value></xctrls:panel>');

        //  Note 'addContent' here to avoid blowing away the 'xctrls:value' tag
        //  holding our key.
        newItem.addContent(aContentObject, aRequest);
    }

    this.setValue(uniqueKey);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
