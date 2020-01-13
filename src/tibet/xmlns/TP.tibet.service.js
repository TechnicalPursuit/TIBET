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
 * @type {TP.tibet.service}
 * @summary A subtype of TP.dom.ElementNode that acts as an abstract supertype
 *     for tags that expose a remote service endpoint in markup.
 */

//  ------------------------------------------------------------------------

TP.dom.UIDataElement.defineSubtype('tibet.service');

//  can't construct concrete instances of this
TP.tibet.service.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineAttribute('isActivated');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('activate',
function() {

    /**
     * @method activate
     * @summary This method causes the receiver to perform it's 'action'. In
     *     this case, retrieving or sending data to a remote URI endpoint.
     *     Subtypes need to override this method and provide an implementation
     *     of real code to activate.
     * @returns {TP.tibet.service} The receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles notification of a change.
     * @description This is triggered if we're watching the remote resource
     *     referenced by our 'href'.
     * @param {TP.sig.Signal} aSignal The signal instance to respond to.
     * @returns {TP.tibet.service} The receiver.
     */

    var newContent;

    //  If the aspect isn't 'value', we're not interested.
    if (aSignal.at('aspect') !== 'value') {
        return this;
    }

    //  Grab the new value from the signal, copy it and use it to update the
    //  result URI. This will cause any data bindings that are using the result
    //  URI to update.
    newContent = aSignal.at(TP.NEWVAL);
    newContent = TP.copy(newContent);

    this.updateResultURI(newContent);

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For this node type
     *     this method triggers this tag to activate, thereby fetching data from
     *     the service.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    if (TP.isTrue(TP.$$settingFromBindMachinery)) {
        this.activate();
    }

    //  This node type never changes its 'value'.
    return false;
});

//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineMethod('updateResultURI',
function(aResult) {

    /**
     * @method updateResultURI
     * @summary Updates the result URI to the supplied object. This will cause
     *     any data-bound objects that are using the result URI to update
     * @param {Object} aResult The result object to set as the resource of the
     *     result URI.
     * @returns {TP.tibet.service} The receiver.
     */

    var href,
        resultURI,

        mimeType,
        contentType,

        isValid,

        newResource,
        strResource;

    //  See if a 'name' href is available and a URI can be created from it.
    if (TP.notEmpty(href = this.getAttribute('name'))) {
        if (!TP.isURI(resultURI = TP.uc(href))) {
            //  Raise an exception
            return this.raise('TP.sig.InvalidURI');
        }
    } else {
        //  We might have be 'send only' service tag.
        return this;
    }

    //  If the result URI's 'name' is already equal to what we're handing in,
    //  then exit here
    if (TP.equal(
            resultURI.getResource(TP.hc('refresh', false)).get('result'),
            aResult)) {
        return this;
    }

    //  If the result is a String, try to turn it into more
    if (TP.isString(aResult)) {

        //  Obtain a MIME type for the result and use it to obtain a
        //  result type.
        mimeType = TP.ietf.mime.guessMIMEType(aResult, this);

        contentType = this.getContentType(mimeType);

        //  If a result type couldn't be determined, then just use
        //  String.
        if (!TP.isType(contentType)) {
            contentType = String;
        }

        //  Make sure that it's valid for its container. Note that we
        //  pass 'false' as a second parameter here for content
        //  objects that do both trivial and full facet checks on
        //  their data. We only want trival checks here (i.e. is the
        //  XML inside of a TP.core.XMLContent really XML - same for
        //  JSON)
        isValid = contentType.validate(aResult, false);
        if (!isValid) {
            return this.raise('TP.sig.InvalidValue');
        }

        //  If the new resource result is a content object of some
        //  sort (highly likely) then we should initialize it with
        //  both the content String and the URI that it should be
        //  associated with. The content object type will convert it
        //  from a String to the proper type.
        if (TP.isSubtypeOf(contentType, TP.core.Content)) {
            newResource = contentType.construct(aResult, resultURI);
        } else {
            strResource = TP.str(aResult);
            if (contentType === String) {
                newResource = strResource;
            } else {
                newResource = contentType.from(strResource);
            }
        }
    } else if (TP.isNode(aResult)) {
        newResource = TP.wrap(aResult);
    } else {
        newResource = aResult;
    }

    //  Set the resource to the new resource (causing any observers
    //  of the URI to get notified of a change) and signal
    //  'TP.sig.UIDataConstruct'.
    resultURI.setResource(
        newResource,
        TP.hc('observeResource', true, 'signalChange', true));

    return this;
});

//  ------------------------------------------------------------------------
//  Action Event Handlers
//  ------------------------------------------------------------------------

TP.tibet.service.Inst.defineHandler('UIActivate',
function(aSignal) {

    /**
     * @method handleUIActivate
     * @summary Activates the receiver. For this type, that means interacting
     *     with the data store configured by its remote URL.
     * @param {TP.sig.UIActivate} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.tibet.service} The receiver.
     */

    this.activate();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
