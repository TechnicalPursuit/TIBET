//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet user' command. Lists known users, or adds a user, or
 *     updates a user password. This is a simple convenience method to let you
 *     have a few development/test users stored in the users.json file. For
 *     serious user administration you should use authentication strategies
 *     other than the 'auth-tds' development sample provided with the TDS.
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
crypto = require('../../../etc/helpers/crypto_helpers');
path = require('path');
hb = require('handlebars');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
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
Cmd.prototype.DNA_ROOT = path.join('..', 'dna', 'user');

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
    '[--env <env>] [--role <role|roles>] [--org <org|orgs>] [--unit unit]';


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
        encrypted,
        json,
        pass,
        org,
        unit,
        role,
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

    users = env;

    org = this.options.org;
    unit = this.options.unit;
    role = this.options.role;
    pass = this.options.pass;

    //  Create vcard path for later checks/generation.
    fullpath = path.join(CLI.expandPath(
        CLI.getcfg('tds.vcard_root', '~app_dat')), user + '_vcard.xml');

    //  User lookup. If the user is found this will be an 'update' operation as
    //  opposed to an insert. NOTE that we only insert if we at least have a
    //  password value provided.
    data = users[user];
    if (CLI.isValid(data)) {

        //  No new data? Just a user check.
        if (!unit && !org && !role && !pass) {
            this.info('User found.');
            return 0;

        }

        this.info('User found. Updating user record.');

        //  Ensure all users have at least a default vcard created.
        if (CLI.sh.test('-e', fullpath)) {
            this.info('User vcard found in ' + fullpath);
        } else {
            this.generateDefaultVCard(user, data, fullpath);
        }

        org = this.options.org || data.org;
        unit = this.options.unit || data.unit;

        //  Password update?
        if (CLI.notEmpty(this.options.pass)) {
            if (this.options.pass === '*') {
                encrypted = this.options.pass;
            } else {
                //  NOTE leave salt undefined to force generation of a random value.
                encrypted = crypto.encrypt(this.options.pass, undefined, CLI);
            }
        } else {
            encrypted = data.pass;
        }

        //  Role update?
        if (this.options.role) {
            //  Convert any role input into an array of role names.
            role = this.options.role.split(',');
            role = role.map(function(item) {
                return item.trim();
            });
        } else {
            role = data.role;
        }

        //  org update?
        if (this.options.org) {
            //  Convert any org input into an array of org names.
            org = this.options.org.split(',');
            org = org.map(function(item) {
                return item.trim();
            });
        } else {
            org = data.org;
        }

        data.org = org;
        data.unit = unit;
        data.role = role;
        data.pass = encrypted;

        //  Write out the changes from the top-level json object.
        CLI.beautify(JSON.stringify(json)).to(file);

        this.info('User updated.');

    } else {

        if (CLI.isEmpty(pass)) {
            this.error('Cannot insert new user without a password value.');
            return 1;
        }

        this.info('New user id. Inserting user record.');

        data = {};
        users[user] = data;
        data.id = user;

        if (this.options.pass === '*') {
            encrypted = this.options.pass;
        } else {
            //  NOTE leave salt undefined to force generation of a random value.
            encrypted = crypto.encrypt(this.options.pass, undefined, CLI);
        }

        org = this.options.org || 'public';
        unit = this.options.unit || 'guest';

        if (this.options.role) {
            //  Convert any role input into an array of role names.
            role = this.options.role.split(',');
            role = role.map(function(item) {
                return item.trim();
            });
        } else {
            role = [];
        }

        if (this.options.org) {
            //  Convert any role input into an array of role names.
            org = this.options.org.split(',');
            org = org.map(function(item) {
                return item.trim();
            });
        } else {
            org = [];
        }

        data.org = org;
        data.unit = unit;
        data.role = role;
        data.pass = encrypted;

        this.generateDefaultVCard(user, data, fullpath);

        //  Write out the changes from the top-level json object.
        CLI.beautify(JSON.stringify(json)).to(file);

        this.info('User added.');
    }

    return 0;
};


/**
 */
Cmd.prototype.generateDefaultVCard = function(user, userData, fullpath) {
    var file,
        data,
        outdata,
        template,
        content;

    this.info('Generating vcard in ' + fullpath);

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

    outdata = {
        username: user,
        role: userData.role || '',
        org: userData.org || '',
        unit: userData.unit || ''
    };

    if (userData.role.length > 0) {
        outdata.role = userData.role[0];
        if (userData.role.length > 1) {
            outdata.otherroles = userData.role.slice(1);
        }
    }

    if (userData.org.length > 0) {
        outdata.org = userData.org[0];
        if (userData.org.length > 1) {
            outdata.otherorgs = userData.org.slice(1);
        }
    }

    try {
        content = template(outdata);

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
