//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet decrypt' command. Used to perform the same decryption
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
Cmd.NAME = 'decrypt';

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
Cmd.prototype.USAGE = 'tibet decrypt <string>';


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
        alg,
        cipher,
        text,
        parts,
        salt,
        decrypted;

    //  NOTE argv[0] is the command name.
    text = this.options.text || this.getArgv()[1];
    if (CLI.isEmpty(text)) {
        throw new Error('No text to decrypt.');
    }
    text = text.trim();

    //  The encrypt call will put salt on the front and separate with ':' so
    //  reverse that to get the one-time salt back so we can decrypt.
    parts = text.split(':');
    salt = new Buffer(parts.shift(), 'hex');
    text = new Buffer(parts.join(':'), 'hex');

    //  Capture key and normalize it to keylen bytes.
    key = process.env.TIBET_CRYPTO_KEY;
    if (CLI.isEmpty(key)) {
        throw new Error(
            'No secret key for encryption. $ export TIBET_CRYPTO_KEY="{{secret}}"');
    }
    keylen = process.env.TIBET_CRYPTO_KEYLEN ||
        CLI.getcfg('tibet.crypto.keylen', 32);
    key = new Buffer(CLI.rpad(key, keylen, '.'));
    key = key.slice(0, keylen);

    //  Get the target algorithm. This will ultimately default via getcfg here.
    alg = process.env.TIBET_CRYPTO_CIPHER ||
        CLI.getcfg('tibet.crypto.cipher', 'aes-256-ctr');

    cipher = crypto.createDecipheriv(alg, key, salt);

    decrypted = cipher.update(text);
    decrypted = Buffer.concat([decrypted, cipher.final()]);

    this.info(decrypted.toString());

    return 0;
};


module.exports = Cmd;

}());
