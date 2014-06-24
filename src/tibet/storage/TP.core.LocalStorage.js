//  ========================================================================
/*
NAME:   TP.core.LocalStorage.js
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
 * @type {TP.core.LocalStorage}
 * @synopsis A subtype of TP.core.DeviceStorage for handling 'local storage'
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
     * @name canConstruct
     * @synopsis Returns true or false whether or not a storage object of this
     *     type can be constructed on the currently executing platform.
     * @returns {Boolean} Whether or not an instance can be constructed on this
     *     platform.
     */

    //  Webkit-based and Mozilla-based browsers actually support 'localStorage'
    //  when TIBET is booted from the 'file://' system, but IE doesn't support
    //  this.
    if (TP.boot.isUA('IE') && !TP.sys.isHTTPBased()) {
        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.LocalStorage.Inst.defineMethod('at',
function(aKey) {

    /**
     * @name at
     * @synopsis Retrieves the value stored under the key in the receiver.
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

    if (TP.isValid(window.localStorage)) {
        return window.localStorage.getItem(aKey);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.LocalStorage.Inst.defineMethod('atPut',
function(aKey, aValue) {

    /**
     * @name atPut
     * @synopsis Sets the value stored under the key in the receiver.
     * @param {String} aKey The key to use to set the data to be stored.
     * @param {String} aValue The data to store under the supplied key.
     * @returns {TP.core.LocalStorage} The receiver.
     * @todo
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

    if (TP.isValid(window.localStorage)) {
        return window.localStorage.setItem(aKey, aValue);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.LocalStorage.Inst.defineMethod('empty',
function() {

    /**
     * @name empty
     * @synopsis Removes all of the values stored in the receiver.
     * @returns {TP.core.LocalStorage} The receiver.
     */

    if (TP.isValid(window.localStorage)) {
        return window.localStorage.clear();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.LocalStorage.Inst.defineMethod('removeKey',
function(aKey) {

    /**
     * @name removeKey
     * @synopsis Removes the value stored under the key in the receiver.
     * @param {String} aKey The key to find the data to be removed.
     * @returns {TP.core.LocalStorage} The receiver.
     */

    if (TP.isValid(window.localStorage)) {
        return window.localStorage.removeItem(aKey);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
