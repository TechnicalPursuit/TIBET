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
 * @type {TP.xmpp.XDataField}
 * @summary A wrapper for field elements that are children of X_DATA
 *     namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.XPayload.defineSubtype('XDataField');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  Field types
TP.xmpp.XDataField.Type.defineConstant('BOOLEAN', 'boolean');
TP.xmpp.XDataField.Type.defineConstant('FIXED', 'fixed');
TP.xmpp.XDataField.Type.defineConstant('HIDDEN', 'hidden');
TP.xmpp.XDataField.Type.defineConstant('JID-MULTI', 'jid-multi');
TP.xmpp.XDataField.Type.defineConstant('JID-SINGLE', 'jid-single');
TP.xmpp.XDataField.Type.defineConstant('LIST-MULTI', 'list-multi');
TP.xmpp.XDataField.Type.defineConstant('LIST-SINGLE', 'list-single');
TP.xmpp.XDataField.Type.defineConstant('TEXT-MULTI', 'text-multi');
TP.xmpp.XDataField.Type.defineConstant('TEXT-PRIVATE', 'text-private');
TP.xmpp.XDataField.Type.defineConstant('TEXT-SINGLE', 'text-single');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.XDataField.set('namespace', TP.xmpp.XMLNS.X_DATA);

TP.xmpp.XDataField.set('tagname', 'field');
TP.xmpp.XDataField.set('childTags', TP.ac('desc', 'required'));

TP.xmpp.XDataField.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.XDataField.Inst.defineMethod('addValue',
function(aValue) {

    /**
     * @method addValue
     * @summary Adds a form value to the receiver.
     * @param {String} aValue The data value to add to the receiver.
     * @returns {TP.xmpp.XDataField} The receiver.
     */

    var valueElem;

    //  TODO: Limit this based on field type. Only list-multi, jid-multi,
    //  text-multi and hidden can contain multiple values

    valueElem = TP.elementFromString(
                    TP.join('<value xmlns="', TP.xmpp.XMLNS.X_DATA, '">',
                            aValue,
                            '</value>'));

    TP.nodeAppendChild(this.getNativeNode(), valueElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.XDataField.Inst.defineMethod('addOption',
function(anOptionValue) {

    /**
     * @method addOption
     * @summary Adds a form option to the receiver.
     * @param {String} anOptionValue The form option value to add to the
     *     receiver.
     * @returns {TP.xmpp.XDataField} The receiver.
     */

    var optionElem;

    //  TODO: Limit this based on field type. Only list-multi and
    //  list-single can contain options

    optionElem = TP.elementFromString(
            TP.join('<option xmlns="', TP.xmpp.XMLNS.X_DATA, '">',
                        '<value>', anOptionValue, '</value>',
                    '</option>'));

    TP.nodeAppendChild(this.getNativeNode(), optionElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.XDataField.Inst.defineMethod('setLabel',
function(aLabel) {

    /**
     * @method setLabel
     * @summary Sets the field label of the data field.
     * @param {String} aLabel The field label of the data field.
     * @returns {TP.xmpp.XDataField} The receiver.
     */

    this.setAttribute('label', aLabel);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.XDataField.Inst.defineMethod('setName',
function(aName) {

    /**
     * @method setName
     * @summary Sets the field name of the data field.
     * @param {String} aName The field name of the data field.
     * @returns {TP.xmpp.XDataField} The receiver.
     */

    this.setAttribute('var', aName);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.XDataField.Inst.defineMethod('setRequired',
function(isRequired) {

    /**
     * @method setRequired
     * @summary Sets whether or not the receiver is a required field.
     * @param {Boolean} isRequired Whether or not the receiver is required.
     * @returns {TP.xmpp.XDataField} The receiver.
     */

    var requiredElem;

    if (isRequired) {
        //  If a 'required' Element isn't already present.
        if (TP.notValid(requiredElem =
                TP.unwrap(this.getElementsByTagName('required').first()))) {
            requiredElem = TP.documentCreateElement(
                                this.getNativeDocument(),
                                'required',
                                TP.xmpp.XMLNS.X_DATA);

            TP.nodeAppendChild(this.getNativeNode(), requiredElem);
        }
    } else {
        if (TP.isElement(requiredElem =
                TP.unwrap(this.getElementsByTagName('required').first()))) {
            TP.nodeDetach(requiredElem);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.XDataField.Inst.defineMethod('setType',
function(aType) {

    /**
     * @method setType
     * @summary Sets the field type of the data packet.
     * @param {String} aType The field type of the data field. This should be
     *     one of the following constant values:.
     *
     *     TP.xmpp.XDataField.BOOLEAN TP.xmpp.XDataField.FIXED
     *     TP.xmpp.XDataField.HIDDEN TP.xmpp.XDataField.JID-MULTI
     *     TP.xmpp.XDataField.JID-SINGLE TP.xmpp.XDataField.LIST-MULTI
     *     TP.xmpp.XDataField.LIST-SINGLE TP.xmpp.XDataField.TEXT-MULTI
     *     TP.xmpp.XDataField.TEXT-PRIVATE TP.xmpp.XDataField.TEXT-SINGLE
     * @returns {TP.xmpp.XDataField} The receiver.
     */

    this.setAttribute('type', aType);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
