/**
 * @overview Trivial memory store constructor for default TDS sessions.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var MemoryStore,
        session;

    session = require('express-session');
    MemoryStore = session.MemoryStore;

    module.exports = function(options) {
        return new MemoryStore();
    }
}())
