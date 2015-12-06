//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet user' command. Lists known users, or adds a user, or
 *     updates a user password. This is a simple convenience method to let you
 *     have a small set of user data stored in the tds.json file. For serious
 *     user administration you should rely on authentication strategies other
 *     than the simple default provided with the TDS.
 */
//  ========================================================================

/*eslint indent:0*/

(function() {

'use strict';

var CLI,
    beautify,
    crypto,
    Parent,
    Cmd;

CLI = require('./_cli');

beautify = require('js-beautify').js_beautify;
crypto = require('crypto');


//  ---
//  Type Construction
//  ---

Parent = require('./_cmd');

Cmd = function() {};
Cmd.prototype = new Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.PROJECT;


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Manages and/or displays current TIBET user configuration data.\n\n' +

'The TIBET Data Server (TDS) uses a simple default authentication model\n' +
'which relies on usernames and hashed passwords stored in the tds.json\n' +
'file loaded by the server when it starts. While this is clearly not a\n' +
'production-capable approach it does allow you to experiment with logins.\n\n' +

'This command lets you list, add, or update user data stored in tds.json\n' +
'such that the resulting data will work properly with default authenticate\n' +
'logic from the TDS plugin catalog.\n\n' +

'NOTE that if you use this command to set values it will rewrite tds.json\n' +
'by using the beautify npm module to process the stringified JSON content.\n' +
'As a result your file may not retain its appearance after updates.\n';

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'string': ['pass', 'env'],
        'default': {
            'env': 'development'
        }
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet user <username> [--pass <password>] [--env <env>]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    var data,
        env,
        file,
        hex,
        json,
        pass,
        user,
        users;

    if (this.options._.length !== 2) {
        return this.usage();
    }

    if (this.options._.length > 1) {
        user = this.options._[1];
    }

    file = CLI.expandPath('~tds_file');
    json = require(file);
    if (!json) {
        this.error('Unable to load: ' + file);
        return 1;
    }

    //  Drill down into the environment provided. All TDS settings are intended
    //  to reside below either 'default' or an environment-specific root.
    json = json[this.options.env];
    if (!json) {
        this.error('Unable to load: ' + env);
        return 1;
    }

    pass = this.options.pass;

    users = json.users;
    if (CLI.notValid(users)) {
        users = {};
        json.users = users;
    }

    if (CLI.isEmpty(pass)) {
        //  User lookup.
        data = users[user];
        if (CLI.isValid(data)) {
            this.info('User was found.');
        } else {
            this.error('User not found.');
        }
        return;
    } else {
        //  Password update.
        hex = crypto.createHash('md5').update(pass).digest('hex');

        data = users[user];
        if (CLI.isValid(data)) {
            //  Update
            users[user] = hex;
            this.info('User updated.');
        } else {
            //  Insert
            users[user] = hex;
            this.info('User added.');
        }

        //  Write out the changes.
        beautify(JSON.stringify(json)).to(file);
    }
};

module.exports = Cmd;

}());
