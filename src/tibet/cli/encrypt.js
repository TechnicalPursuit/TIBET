//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet encrypt' command. Used to perform the same encryption
 *     done by the TDS for security-related operations.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    crypto;

CLI = require('./_cli');
crypto = require('crypto');

//  ---
//  Type Construction
//  ---

Cmd = function() {
    //  empty
};
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.ANY;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'encrypt';

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'string': ['text']
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet encrypt <string>';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    var key,
        keylen,
        salt,
        saltlen,
        alg,
        cipher,
        text,
        encrypted;

    //  NOTE argv[0] is the command name.
    text = this.options.text || this.getArgv()[1];
    if (CLI.isEmpty(text)) {
        throw new Error('No text to encrypt.');
    }
    text = text.trim();

    //  Capture key and normalize it to keylen bytes. This typically has to
    //  match up with salt length for the targeted cipher algorithm.
    key = process.env.TIBET_CRYPTO_KEY;
    if (CLI.isEmpty(key)) {
        throw new Error(
            'No secret key for encryption. $ export TIBET_CRYPTO_KEY="{{secret}}"');
    }
    keylen = process.env.TIBET_CRYPTO_KEYLEN ||
        CLI.getcfg('tibet.crypto.keylen', 32);
    key = new Buffer(CLI.rpad(key, keylen, '.'));
    key = key.slice(0, keylen);

    //  Generate a random salt value. See discussion at the OWASP site:
    //  https://www.owasp.org/index.php/Password_Storage_Cheat_Sheet
    saltlen = process.env.TIBET_CRYPTO_SALTLEN || CLI.getcfg('tibet.crypto.saltlen', 16);
    salt = new Buffer(crypto.randomBytes(saltlen));

    //  Get the target algorithm. This will ultimately default via getcfg here.
    alg = process.env.TIBET_CRYPTO_CIPHER ||
        CLI.getcfg('tibet.crypto.cipher', 'aes-256-ctr');

    cipher = crypto.createCipheriv(alg, key, salt);

    encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    //  Always include the salt (since it's random) as part of the final value,
    //  otherwise it's impossible to decrypt :).
    this.info(salt.toString('hex') + ':' + encrypted.toString('hex'));

    return 0;
};


module.exports = Cmd;

}());
