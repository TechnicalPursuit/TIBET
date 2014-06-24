//  ========================================================================
/*
NAME:   TP.core.DeviceStorage.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
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
 * @type {TP.core.DeviceStorage}
 * @synopsis A common supertype for all objects handling client-side storage
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
     * @name at
     * @synopsis Retrieves the value stored under the key in the receiver.
     * @param {String} aKey The key to find the data to be retrieved.
     * @returns {Object} The object stored under the key in the receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.DeviceStorage.Inst.defineMethod('atEncrypted',
function(aKey, aPassword) {

    /**
     * @name atEncrypted
     * @synopsis Retrieves the value stored under the key in the receiver.
     * @param {String} aKey The key to find the data to be retrieved.
     * @param {String} aPassword The password to use to decrypt the data that
     *     was retrieved.
     * @raises TP.sig.InvalidString
     * @returns {Object} The object stored under the key in the receiver.
     */

    var recordStr,
        value;
    
    if (!TP.isString(aKey) || !TP.isString(aPassword)) {
        return this.raise('TP.sig.InvalidString', arguments);
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
     * @name atPut
     * @synopsis Sets the value stored under the key in the receiver.
     * @param {String} aKey The key to use to set the data to be stored.
     * @param {String} aValue The data to store under the supplied key.
     * @returns {TP.core.DeviceStorage} The receiver.
     * @todo
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.DeviceStorage.Inst.defineMethod('atPutEncrypted',
function(aKey, aValue, aPassword) {

    /**
     * @name atPutEncrypted
     * @synopsis Sets the value stored under the key in the receiver.
     * @param {String} aKey The key to use to set the data to be stored.
     * @param {String} aValue The data to store under the supplied key.
     * @param {String} aPassword The password to use to encrypt the data that
     *     is being stored.
     * @raises TP.sig.InvalidString
     * @returns {TP.core.DeviceStorage} The receiver.
     */

    var recordStr;

    if (!TP.isString(aKey) || !TP.isString(aValue) || !TP.isString(aPassword)) {
        return this.raise('TP.sig.InvalidString', arguments);
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
     * @name empty
     * @synopsis Removes all of the values stored in the receiver.
     * @returns {TP.core.DeviceStorage} The receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.DeviceStorage.Inst.defineMethod('removeKey',
function(aKey) {

    /**
     * @name removeKey
     * @synopsis Removes the value stored under the key in the receiver.
     * @param {String} aKey The key to find the data to be removed.
     * @returns {Boolean} True if the value was successfully removed, false
     *     otherwise.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
