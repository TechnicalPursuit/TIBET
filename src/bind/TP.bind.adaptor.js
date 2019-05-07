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
 * @type {TP.bind.adaptor}
 * @summary A subtype of TP.dom.ElementNode that implements a markup-based way
 *     of defining an aspect of a data model that will be derive its data from
 *     data bindings. Note that these can include data expressions.
 */

//  ------------------------------------------------------------------------

TP.dom.ElementNode.defineSubtype('bind:adaptor');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.bind.adaptor.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemTPNode,

        targetPath,
        fullPath,

        fullURI,
        primaryURI;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Get a handle to a TP.dom.Node representing an instance of this
    //  element type wrapped around elem. Note that this will both ensure a
    //  unique 'id' for the element and register it.
    elemTPNode = TP.tpnode(elem);

    //  Grab the target path. Note that this may not exist and the method for
    //  computing the full binding path below can handle that.
    targetPath = elemTPNode.getAttribute('target');

    //  Grab the full binding path from the element.
    fullPath = elemTPNode.getFullBindingPathFrom(targetPath);

    //  Create a URI from the full path and grab it's primary URI.
    fullURI = TP.uc(fullPath);
    primaryURI = fullURI.getPrimaryURI();

    elemTPNode.observe(primaryURI, 'TP.sig.ValueChange');

    return;
});

//  ------------------------------------------------------------------------

TP.bind.adaptor.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemTPNode,

        targetPath,
        fullPath,

        fullURI,
        primaryURI;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Get a handle to a TP.dom.Node representing an instance of this
    //  element type wrapped around elem. Note that this will both ensure a
    //  unique 'id' for the element and register it.
    elemTPNode = TP.tpnode(elem);

    //  Grab the target path. Note that this may not exist and the method for
    //  computing the full binding path below can handle that.
    targetPath = elemTPNode.getAttribute('target');

    //  Grab the full binding path from the element.
    fullPath = elemTPNode.getFullBindingPathFrom(targetPath);

    //  Create a URI from the full path and grab it's primary URI.
    fullURI = TP.uc(fullPath);
    primaryURI = fullURI.getPrimaryURI();

    elemTPNode.ignore(primaryURI, 'TP.sig.ValueChange');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.bind.adaptor.Inst.defineAttribute('$targetLocation');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.bind.adaptor.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when one of the aspects of the URI that the receiver is
     *     bound to changes.
     * @param {TP.sig.ValueChange} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.bind.adaptor} The receiver.
     */

    if (aSignal.at('aspect') === 'value') {
        this.installAccessorsOnResource(
                    aSignal.at(TP.NEWVAL),
                    aSignal.getOrigin());
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.bind.adaptor.Inst.defineMethod('installAccessorsOnResource',
function(aResource, aBoundURI) {

    /**
     * @method installAccessorsOnResource
     * @summary Installs specific 'get' and 'set' accessors on the supplied
     *     resource.
     * @param {Object} aResource The resource to install accessors on.
     * @param {TP.uri.URI} aBoundURI The URI that the resource is registered
     *     under.
     * @returns {TP.bind.adaptor} The receiver.
     */

    var primaryURI,

        name,
        targetPath,

        pathObj;

    //  Capture the location of the primary URI of the bound URI. We'll use this
    //  to obtain the resource in the various change notification methods.
    primaryURI = aBoundURI.getPrimaryURI();
    this.$set('$targetLocation', primaryURI.getLocation(), false);

    name = this.getAttribute('name');

    //  See if we have a target path for 'setting' the resultant value into the
    //  data model.
    targetPath = this.getAttribute('target');
    if (TP.notEmpty(targetPath)) {
        //  We had a valid path. Compute a path object for use in the getter
        //  and setter.
        pathObj = TP.apc(this.getFullBindingPathFrom(targetPath));
    } else {
        //  Otherwise, just define an attribute slot on the resource.
        aResource.defineAttribute(name);
    }

    //  Install the getter and setter

    aResource.defineMethod(
        'get' + name.asTitleCase(),
        function() {

            //  If there was no valid destination path, then just use '$get()'
            //  to get the slot value. Note that we can't use 'get()' here or
            //  we'll endlessly recurse.
            if (TP.notValid(pathObj)) {
                return this.$get(name);
            }

            return this.get(pathObj);
        });

    aResource.defineMethod(
        'set' + name.asTitleCase(),
        function(aValue) {
            var oldValue;

            //  If there was no valid destination path, then just use '$get()'
            //  to get the slot value. Note that we can't use 'get()' here or
            //  we'll endlessly recurse.
            if (TP.notValid(pathObj)) {
                oldValue = this.$get(name);
            } else {
                oldValue = this.get(pathObj);
            }

            //  If the values are equal, there's nothing to do here - bail out.
            if (TP.equal(TP.str(oldValue), TP.str(aValue))) {
                return false;
            }

            //  If there was no valid destination path, then just use '$set()'
            //  to set the slot value. Note that we can't use 'set()' here or
            //  we'll endlessly recurse.
            if (TP.notValid(pathObj)) {
                this.$set(name, aValue);
            } else {
                this.set(pathObj, aValue);
            }

            return true;
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.bind.adaptor.Inst.defineMethod('setReadonly',
function(aValue, shouldSignal) {

    /**
     * @method setReadonly
     * @summary Sets the readonly facet of the receiver.
     * @description Because the receiver is acting as an adaptor to an aspect on
     *     the data model, setting the readonly 'facet' of the receiver.actually
     *     sets the readonly facet of the aspect on the model.
     * @param {Object} aValue The value to set the 'readonly' facet of the
     *     aspect of the data model that we're adapting to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled.
     * @returns {Boolean} Whether or not the readonly facet was changed from the
     *     value it had before this method was called.
     */

    var targetLoc,
        targetURI,

        targetResource,

        aspectName,

        retVal;

    targetLoc = this.get('$targetLocation');
    targetURI = TP.uc(targetLoc);

    targetResource = targetURI.getResource().get('result');

    aspectName = this.getAttribute('name');

    retVal = targetResource.setFacet(
                    aspectName, 'readonly', aValue, shouldSignal);

    return retVal;
});

//  ------------------------------------------------------------------------

TP.bind.adaptor.Inst.defineMethod('setRelevant',
function(aValue, shouldSignal) {

    /**
     * @method setRelevant
     * @summary Sets the relevant facet of the receiver.
     * @description Because the receiver is acting as an adaptor to an aspect on
     *     the data model, setting the relevant 'facet' of the receiver.actually
     *     sets the relevant facet of the aspect on the model.
     * @param {Object} aValue The value to set the 'relevant' facet of the
     *     aspect of the data model that we're adapting to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled.
     * @returns {Boolean} Whether or not the relevant facet was changed from the
     *     value it had before this method was called.
     */

    var targetLoc,
        targetURI,

        targetResource,

        aspectName,

        retVal;

    targetLoc = this.get('$targetLocation');
    targetURI = TP.uc(targetLoc);

    targetResource = targetURI.getResource().get('result');

    aspectName = this.getAttribute('name');

    retVal = targetResource.setFacet(
                    aspectName, 'relevant', aValue, shouldSignal);

    return retVal;
});

//  ------------------------------------------------------------------------

TP.bind.adaptor.Inst.defineMethod('setRequired',
function(aValue, shouldSignal) {

    /**
     * @method setRequired
     * @summary Sets the required facet of the receiver.
     * @description Because the receiver is acting as an adaptor to an aspect on
     *     the data model, setting the required 'facet' of the receiver.actually
     *     sets the required facet of the aspect on the model.
     * @param {Object} aValue The value to set the 'required' facet of the
     *     aspect of the data model that we're adapting to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled.
     * @returns {Boolean} Whether or not the required facet was changed from the
     *     value it had before this method was called.
     */

    var targetLoc,
        targetURI,

        targetResource,

        aspectName,

        retVal;

    targetLoc = this.get('$targetLocation');
    targetURI = TP.uc(targetLoc);

    targetResource = targetURI.getResource().get('result');

    aspectName = this.getAttribute('name');

    retVal = targetResource.setFacet(
                    aspectName, 'required', aValue, shouldSignal);

    return retVal;
});

//  ------------------------------------------------------------------------

TP.bind.adaptor.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value facet of the receiver.
     * @description Because the receiver is acting as an adaptor to an aspect on
     *     the data model, setting the value 'facet' of the receiver.actually
     *     sets the value facet of the aspect on the model.
     * @param {Object} aValue The value to set the 'value' facet of the
     *     aspect of the data model that we're adapting to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled.
     * @returns {Boolean} Whether or not the value facet was changed from the
     *     value it had before this method was called.
     */

    var targetLoc,
        targetURI,

        targetResource,

        aspectName,

        retVal;

    targetLoc = this.get('$targetLocation');
    targetURI = TP.uc(targetLoc);

    targetResource = targetURI.getResource().get('result');

    aspectName = this.getAttribute('name');

    retVal = targetResource.set(aspectName, aValue, shouldSignal);

    return retVal;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
