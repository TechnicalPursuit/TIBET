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
 * @type {TP.core.LocalStorage}
 * @summary A subtype of TP.core.DeviceStorage for handling 'local storage'
 *     persistence mechanisms.
 */

//  ------------------------------------------------------------------------

TP.core.DeviceStorage.defineSubtype('LocalStorage');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.LocalStorage.Type.defineMethod('canConstruct',
function() {

    /**
     * @method canConstruct
     * @summary Returns true or false whether or not a storage object of this
     *     type can be constructed on the currently executing platform.
     * @returns {Boolean} Whether or not an instance can be constructed on this
     *     platform.
     */

    return true;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.LocalStorage.Inst.defineMethod('at',
function(aKey) {

    /**
     * @method at
     * @summary Retrieves the value stored under the key in the receiver.
     * @param {String} aKey The key to find the data to be retrieved.
     * @returns {Object} The object stored under the key in the receiver.
     */

    //  If the key matches a local/instance slot on ourself, then just
    //  callNextMethod. Note we check TP.isDefined() here, since we don't
    //  care if it has a null value.
    if (TP.isDefined(this[aKey])) {
        //  This is basically TP.lang.Object's version of 'at', since our
        //  supertype has an 'TP.override()' call to force overriding.
        if (TP.canInvoke(this, 'get')) {
            return this.get(aKey);
        }

        return this[aKey];
    }

    if (TP.isValid(TP.global.localStorage)) {
        return TP.global.localStorage.getItem(aKey);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.LocalStorage.Inst.defineMethod('atPut',
function(aKey, aValue) {

    /**
     * @method atPut
     * @summary Sets the value stored under the key in the receiver.
     * @param {String} aKey The key to use to set the data to be stored.
     * @param {String} aValue The data to store under the supplied key.
     * @returns {TP.core.LocalStorage} The receiver.
     */

    //  If the key matches a local/instance slot on ourself, then just
    //  callNextMethod. Note we check TP.isDefined() here, since we don't
    //  care if it has a null value.
    if (TP.isDefined(this[aKey])) {
        //  This is basically TP.lang.Object's version of 'atPut', since our
        //  supertype has an 'TP.override()' call to force overriding.
        return this.$set(
                    aKey > 0 ? aKey : this.normalizeIndex(aKey),
                    aValue);
    }

    if (TP.isValid(TP.global.localStorage)) {
        return TP.global.localStorage.setItem(aKey, aValue);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.LocalStorage.Inst.defineMethod('empty',
function() {

    /**
     * @method empty
     * @summary Removes all of the values stored in the receiver.
     * @returns {TP.core.LocalStorage} The receiver.
     */

    if (TP.isValid(TP.global.localStorage)) {
        return TP.global.localStorage.clear();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.LocalStorage.Inst.defineMethod('removeKey',
function(aKey) {

    /**
     * @method removeKey
     * @summary Removes the value stored under the key in the receiver.
     * @param {String} aKey The key to find the data to be removed.
     * @returns {TP.core.LocalStorage} The receiver.
     */

    if (TP.isValid(TP.global.localStorage)) {
        return TP.global.localStorage.removeItem(aKey);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
