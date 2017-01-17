//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet encrypt' command. Used to perform the same encryption
 *     done by the TDS to support generating encrypted passwords or api keys for
 *     storage in configuration or database storage.
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
 * The algorithm used for encryption. Should match TDS.CRYPTO_ALGORITHM
 * @type {String}
 */
Cmd.CRYPTO_ALGORITHM = 'aes-256-ctr';

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
        cipher,
        text,
        encrypted;

    //  NOTE argv[0] is the command name.
    text = this.options.text || this.getArgv()[1];
    if (CLI.isEmpty(text)) {
        throw new Error('No text to encrypt.');
    }

    key = process.env.TDS_CRYPTO_KEY;
    if (CLI.isEmpty(key)) {
        throw new Error('No TDS_CRYPTO_KEY found for encryption.');
    }

    cipher = crypto.createCipher(Cmd.CRYPTO_ALGORITHM, key);

    encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    this.info(encrypted);
};


module.exports = Cmd;

}());
