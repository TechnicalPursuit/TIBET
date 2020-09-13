//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet tag' command. This command builds a `type type` command
 *     which will create the new tag. Essentially this command simply defaults
 *     some of the common parameters used by the type command in a fashion
 *     that's specific to building new tags.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd;

CLI = require('./_cli');

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
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'tag';

//  ---
//  Instance Attributes
//  ---

/**
 * The name of the default dna to use for new tags.
 * @type {String}
 */
Cmd.prototype.DEFAULT_DNA = 'templatedtag';

/*
 * Add command line options. NOTE that in this case the tag command does _NOT_
 * inherit from the `type` or `_dna` commands so it needs to list all the
 * options the type command requires (along with its own custom flags).
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend({
    string: ['name', 'dir', 'dna', 'xmlns', 'supertype', 'package', 'config'],
    boolean: ['action', 'computed', 'info', 'templated']
},
Cmd.Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet tag [[--name] [<root>.][<namespace>(.|:)]]<typename> [--action|--compiled|--info|--templated] [--supertype <typename>] [--dna <template>] [--dir <dirname>] [--package <package>] [--config <cfgname>]';

//  ---
//  Instance Methods
//  ---

/**
 * Check arguments and configure default values prior to running prereqs.
 * @returns {Object}
 */
Cmd.prototype.configure = function() {
    var options,
        name,
        parts,
        inProj;

    options = this.options;

    name = options._[1] || options.name || '';

    inProj = CLI.inProject();

    options.appname = options.appname ||
        inProj ? CLI.getTIBETProjectName() : '';

    parts = name.split(/[\.:]/g);
    switch (parts.length) {
        case 3:
            options.nsroot = parts[0];
            options.nsname = parts[1];
            options.name = parts[2];
            break;

        case 2:
            options.nsroot = inProj ? 'APP' : 'TP';
            options.nsname = parts[0];
            options.name = parts[1];
            break;

        case 1:
            options.nsroot = inProj ? 'APP' : 'TP';
            if (inProj) {
                options.nsname = options.appname;
            } else {
                this.error('Cannot default namespace for lib tag: ' + name);
                return null;
            }
            options.name = parts[0];
            break;

        default:
            break;
    }

    options.dna = options.dna || this.configureDNA();
    options.supertype = options.supertype || this.configureSupertype();
    options.xmlns = options.xmlns || this.configureXMLNS();

    this.trace('configure:\n' + CLI.beautify(JSON.stringify(options)));

    return options;
};


/**
 * Scans the command-line flags to determine the tag DNA to be used.
 * @returns {String} The dna name appropriate for the options.
 */
Cmd.prototype.configureDNA = function() {
    var options;

    options = this.options;

    if (options.dna) {
        return options.dna;
    }

    if (options.action) {
        return 'actiontag';
    }

    if (options.compiled) {
        return 'compiledtag';
    }

    if (options.info) {
        return 'infotag';
    }

    if (options.templated) {
        return 'templatedtag';
    }

    return this.DEFAULT_DNA;
};


/**
 */
Cmd.prototype.configureSupertype = function() {
    var options,
        dna;

    options = this.options;

    if (options.supertype) {
        return options.supertype;
    }

    dna = this.configureDNA();

    if (dna === 'actiontag') {
        return 'TP.tag.ActionTag';
    }

    if (dna === 'compiledtag') {
        return 'TP.tag.CompiledTag';
    }

    if (dna === 'infotag') {
        return 'TP.tag.InfoTag';
    }

    if (dna === 'templatedtag') {
        return 'TP.tag.TemplatedTag';
    }

    return 'TP.tag.TemplatedTag';
};


/**
 * Return a valid XMLNS uri value based on command line input and default values
 * which respect whether you are in a project or the library.
 * @param {String} appname The application name to use (defaults to --name or the
 *     current TIBET project name.
 * @returns {String} The xmlns URI.
 */
Cmd.prototype.configureXMLNS = function(appname) {
    var xmlns;

    //  Define an XMLNS value. This is used for CSS url() sections as well as
    //  any tag-related definitions. NOTE the value for lib is set to the value
    //  we use for 'tibet:' prefixes elsewhere in the library.
    xmlns = this.options.xmlns || CLI.getcfg('tibet.xmlns');
    if (CLI.notEmpty(xmlns)) {
        return xmlns;
    }

    return CLI.inProject() ?
            'urn:app:' + (appname || this.options.appname || this.options.name) :
            'http://www.technicalpursuit.com/1999/tibet';
};


/**
 * Runs the specific command in question.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    var options,
        args,
        cmd;

    options = this.options;
    args = [];

    if (!options.name) {
        return this.usage();
    }

    //  APP.tag.foo for example...
    args.push(options.nsroot + '.' + options.nsname + '.' + options.name);

    args.push('--dna', options.dna);
    args.push('--supertype', options.supertype);
    args.push('--xmlns', options.xmlns);

    if (options.dir) {
        args.push('--dir', options.dir);
    }

    if (options.package) {
        args.push('--package', options.package);
    }

    if (options.config) {
        args.push('--config', options.config);
    }

    cmd = 'type' + (args ? ' ' + args.join(' ') : '');

    this.verbose('Delegating to \'tibet ' + cmd + '\'');

    // Delegate to the same runCommand used for all other common commands.
    // NOTE there's an "extra" 'type' on the front here to convince the type
    // command's parser that it got the right positional argument list.
    return CLI.runCommand('type ' + cmd, CLI.joinPaths(__dirname, 'type.js'));
};

module.exports = Cmd;

}());
