//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview Utility methods used to help commands manage/update TIBET package
 *     files. Examples include the 'tag' and 'resources' commands which update
 *     package information as part of their operation.
 */
//  ========================================================================

(function() {

    'use strict';

    var helpers,
        crypto;

    crypto = require('crypto');

    /**
     * Canonical `helper` object for internal utility functions.
     */
    helpers = {};

    /**
     * The default cipher algorithm to use for encrypt/decrypt processing.
     * Overridden by any configuration value for 'tibet.crypto.cipher'.
     * @type {String}
     */
    helpers.CRYPTO_CIPHER = 'aes-256-ctr';

    /**
     * Decrypts a block of text. The algoritm and encryption key are read from
     * the environment and if not found an exception is raised. NOTE that the
     * CLI must be configured to use the same parameters or operation may fail.
     * @param {String} text The text to encrypt.
     * @param {Object} requestor An object which must provide isEmpty, notValid,
     *     getcfg, and rpad functionality to the helper function. Usually TDS or
     *     CLI object passed by invoking wrapper calls.
     * @returns {String} The decrypted value.
     */
    helpers.decrypt = function(text, requestor) {
        var key,
            keylen,
            alg,
            cipher,
            str,
            parts,
            salt,
            decrypted;

        if (requestor.isEmpty(text)) {
            throw new Error('No text to decrypt.');
        }
        str = text.trim();

        //  The encrypt call will put salt on the front and separate with ':' so
        //  reverse that to get the one-time salt back so we can decrypt.
        parts = str.split(':');
        salt = Buffer.from(parts.shift(), 'hex');
        str = Buffer.from(parts.join(':'), 'hex');

        //  Capture key and normalize it to keylen bytes.
        key = process.env.TIBET_CRYPTO_KEY;
        if (requestor.isEmpty(key)) {
            throw new Error(
                'No secret key for encryption. $ export' +
                ' TIBET_CRYPTO_KEY="{{secret}}"');
        }
        keylen = process.env.TIBET_CRYPTO_KEYLEN ||
            requestor.getcfg('tibet.crypto.keylen', 32);
        key = Buffer.from(requestor.rpad(key, keylen, '.'));
        key = key.slice(0, keylen);

        //  Get the target algorithm. This will ultimately default via getcfg
        //  here.
        alg = process.env.TIBET_CRYPTO_CIPHER ||
            requestor.getcfg('tibet.crypto.cipher', 'aes-256-ctr');

        cipher = crypto.createDecipheriv(alg, key, salt);

        decrypted = cipher.update(str);
        decrypted = Buffer.concat([decrypted, cipher.final()]);

        return decrypted.toString();
    };

    /**
     * Encrypts a block of text. The algorithm and encryption key are read from
     * the environment and if not found an exception is raised. NOTE that the
     * CLI must be configured to use the same parameters or operation may fail.
     * @param {String} text The text to encrypt.
     * @param {Buffer} [salt] Optional salt used when encrypting to determine a
     *     match with a prior encrypted value.
     * @param {Object} requestor An object which must provide isEmpty, getcfg,
     *     and rpad functionality to the helper function.
     * @returns {String} The encrypted value.
     */
    helpers.encrypt = function(text, salt, requestor) {
        var key,
            keylen,
            saltval,
            saltlen,
            alg,
            cipher,
            str,
            encrypted;

        if (requestor.isEmpty(text)) {
            throw new Error('No text to encrypt.');
        }
        str = text.trim();

        //  Capture key and normalize it to keylen bytes. This typically has to
        //  match up with salt length for the targeted cipher algorithm.
        key = process.env.TIBET_CRYPTO_KEY;
        if (requestor.isEmpty(key)) {
            throw new Error(
                'No secret key for encryption. $ export' +
                ' TIBET_CRYPTO_KEY="{{secret}}"');
        }
        keylen = process.env.TIBET_CRYPTO_KEYLEN ||
            requestor.getcfg('tibet.crypto.keylen', 32);
        key = Buffer.from(requestor.rpad(key, keylen, '.'));
        key = key.slice(0, keylen);

        if (requestor.notValid(salt)) {
            //  Generate a random salt value. See discussion at the OWASP site:
            //  https://www.owasp.org/index.php/Password_Storage_Cheat_Sheet
            saltlen = process.env.TIBET_CRYPTO_SALTLEN ||
                requestor.getcfg('tibet.crypto.saltlen', 16);
            saltval = Buffer.from(crypto.randomBytes(saltlen));
        } else {
            saltval = salt;
        }

        //  Get the target algorithm. This will ultimately default via getcfg
        //  here.
        alg = process.env.TIBET_CRYPTO_CIPHER ||
            requestor.getcfg('tibet.crypto.cipher', 'aes-256-ctr');

        cipher = crypto.createCipheriv(alg, key, saltval);

        encrypted = cipher.update(str);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        //  Always include the salt (since it's random) as part of the final
        //  value, otherwise it's impossible to decrypt :).
        return saltval.toString('hex') + ':' + encrypted.toString('hex');
    };

    module.exports = helpers;

}(this));
