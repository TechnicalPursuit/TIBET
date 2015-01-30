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
 * @type {TP.core.DeviceStorage}
 * @summary A common supertype for all objects handling client-side storage
 *      mechanisms in TIBET.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:DeviceStorage');

//  This type is abstract
TP.core.DeviceStorage.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.DeviceStorage.Inst.defineMethod('at',
function(aKey) {

    /**
     * @method at
     * @summary Retrieves the value stored under the key in the receiver.
     * @param {String} aKey The key to find the data to be retrieved.
     * @returns {Object} The object stored under the key in the receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.DeviceStorage.Inst.defineMethod('atEncrypted',
function(aKey, aPassword) {

    /**
     * @method atEncrypted
     * @summary Retrieves the value stored under the key in the receiver.
     * @param {String} aKey The key to find the data to be retrieved.
     * @param {String} aPassword The password to use to decrypt the data that
     *     was retrieved.
     * @exception TP.sig.InvalidString
     * @returns {Object} The object stored under the key in the receiver.
     */

    var recordStr,
        value;

    if (!TP.isString(aKey) || !TP.isString(aPassword)) {
        return this.raise('TP.sig.InvalidString');
    }

    //  See if there is a 'record' value (a JSON String) at the key. This should
    //  contain the 'salt' used to create the password, the encrypted value and
    //  the 'iv' value used to encrypt the value.
    if (TP.isEmpty(recordStr = this.at(aKey))) {
        return null;
    }

    value = TP.decryptStorageValue(recordStr, aPassword);

    return value;
});

//  ------------------------------------------------------------------------

TP.core.DeviceStorage.Inst.defineMethod('atPut',
function(aKey, aValue) {

    /**
     * @method atPut
     * @summary Sets the value stored under the key in the receiver.
     * @param {String} aKey The key to use to set the data to be stored.
     * @param {String} aValue The data to store under the supplied key.
     * @returns {TP.core.DeviceStorage} The receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.DeviceStorage.Inst.defineMethod('atPutEncrypted',
function(aKey, aValue, aPassword) {

    /**
     * @method atPutEncrypted
     * @summary Sets the value stored under the key in the receiver.
     * @param {String} aKey The key to use to set the data to be stored.
     * @param {String} aValue The data to store under the supplied key.
     * @param {String} aPassword The password to use to encrypt the data that
     *     is being stored.
     * @exception TP.sig.InvalidString
     * @returns {TP.core.DeviceStorage} The receiver.
     */

    var recordStr;

    if (!TP.isString(aKey) || !TP.isString(aValue) || !TP.isString(aPassword)) {
        return this.raise('TP.sig.InvalidString');
    }

    recordStr = TP.encryptStorageValue(aValue, aPassword);

    //  Put this overall value into the storage using the supplied key.
    this.atPut(aKey, recordStr);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DeviceStorage.Inst.defineMethod('empty',
function() {

    /**
     * @method empty
     * @summary Removes all of the values stored in the receiver.
     * @returns {TP.core.DeviceStorage} The receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.DeviceStorage.Inst.defineMethod('removeKey',
function(aKey) {

    /**
     * @method removeKey
     * @summary Removes the value stored under the key in the receiver.
     * @param {String} aKey The key to find the data to be removed.
     * @returns {Boolean} True if the value was successfully removed, false
     *     otherwise.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
