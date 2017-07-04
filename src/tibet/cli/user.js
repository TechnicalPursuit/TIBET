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

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    crypto,
    path,
    hb,
    Cmd;

CLI = require('./_cli');
crypto = require('crypto');
path = require('path');
hb = require('handlebars');

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
Cmd.CONTEXT = CLI.CONTEXTS.PROJECT;

/**
 * Where are the dna templates we should clone from? This value will be joined
 * with the current file's load path to create the absolute root path.
 * @type {string}
 */
Cmd.prototype.DNA_ROOT = '../dna/user';

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'user';

//  ---
//  Instance Attributes
//  ---

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'string': ['pass', 'env', 'role', 'org', 'unit'],
        'default': {
            'env': 'development'
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet user <username> [--pass <password>] ' +
    '[--env <env>] [--role <role>] [--org <org>] [--unit unit]';


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
        salt,
        user,
        users,
        fullpath;

    if (this.options._.length !== 2) {
        return this.usage();
    }

    if (this.options._.length > 1) {
        user = this.options._[1];
    }

    file = CLI.expandPath('~user_file');
    json = require(file);
    if (!json) {
        this.error('Unable to load tds config file: ' + file);
        return 1;
    }

    //  Drill down into the environment provided. All TDS settings are intended
    //  to reside below either 'default' or an environment-specific root.
    env = json[this.options.env];
    if (!env) {
        env = {};
        json[this.options.env] = env;
    }

    pass = this.options.pass;

    users = env;

    if (CLI.isEmpty(pass)) {
        //  User lookup.
        data = users[user];
        if (CLI.isValid(data)) {
            this.info('User was found.');
        } else {
            this.error('User not found.');
        }

        //  Check on vcard info
        fullpath = path.join(CLI.expandPath(
            CLI.getcfg('tds.vcard_root', '~app_dat')), user + '_vcard.xml');

        if (CLI.sh.test('-e', fullpath)) {
            this.info('User vcard found in ' + fullpath);
        } else {
            this.warn('User vcard not found in ' + fullpath);
            this.generateDefaultVCard(user, fullpath);
        }

        return 0;
    } else {

        salt = process.env.TDS_CRYPTO_SALT || CLI.getcfg('tds.crypto.salt');
        if (!salt) {
            this.warn('Missing TDS_CRYPTO_SALT or tds.crypto.salt');
            this.warn('Defaulting to encryption salt default value');
            salt = 'mmm...salty';
        }

        //  Password update.
        hex = crypto.createHash('sha256').update(pass + salt).digest('hex');

        //  Check on vcard info
        fullpath = path.join(CLI.expandPath(
            CLI.getcfg('tds.vcard_root', '~app_dat')), user + '_vcard.xml');

        if (CLI.sh.test('-e', fullpath)) {
            this.info('User vcard found in ' + fullpath);
        } else {
            this.generateDefaultVCard(user, fullpath);
        }

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

        //  Write out the changes from the top-level json object.
        CLI.beautify(JSON.stringify(json)).to(file);
    }

    return 0;
};


/**
 */
Cmd.prototype.generateDefaultVCard = function(user, fullpath) {
    var file,
        data,
        template,
        content;

    this.info('Creating default ' + user + ' vcard in ' + fullpath);

    file = path.join(module.filename, this.DNA_ROOT, 'vcard.xml.hb');
    data = CLI.sh.cat(file);
    try {
        template = hb.compile(data);
        if (!template) {
            throw new Error('InvalidTemplate');
        }
    } catch (e) {
        this.error('Error compiling template ' + fullpath + ': ' +
            e.message);
        return 1;
    }

    try {
        content = template({
            username: user,
            role: this.options.role || '',
            org: this.options.org || '',
            unit: this.options.unit || ''
        });
        if (!content) {
            throw new Error('InvalidContent');
        }
    } catch (e) {
        this.error('Error injecting template data in ' + fullpath +
            ': ' + e.message);
        return 1;
    }

    content.to(fullpath);
};

module.exports = Cmd;

}());
