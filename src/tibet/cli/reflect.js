//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet reflect' command. Runs the client-side ':reflect'
 *     command via TIBET's headless processing.
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
Cmd.Parent = require('./_tsh');
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---


/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'reflect';

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend({
    boolean: ['owners', 'types', 'subtypes', 'methods', 'attributes',
                'known', 'hidden',
                'unique', 'inherited', 'introduced', 'local', 'overridden',
                'verbose'],
    string: ['context', 'target', 'filter', 'interface'],
    default: {
        context: 'app'
    }
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE =
    'tibet reflect [[--target] <target>] [--filter <filter>] ' +
        '[--owners] [--types] [--subtypes] [--methods] [--attributes]' +
        '[--known] [--hidden]' +
        '[--unique] [--inherited] [--introduced] [--local] [--overridden]' +
        '[--context=[\'app\'|\'lib\'|\'all\']] [--interface <interface>]' +
        '[--verbose]';

//  ---
//  Instance Methods
//  ---

/**
 * Returns a list of options/flags/parameters suitable for command completion.
 * @returns {Array.<string>} The list of options for this command.
 */
Cmd.prototype.getCompletionOptions = function() {
    var list,
        plist;

        list = Cmd.Parent.prototype.getCompletionOptions.call(this);
        plist = Cmd.Parent.prototype.getCompletionOptions();

        return CLI.subtract(plist, list);
};


/**
 * Returns the default boot config to use when launching this command.
 * @Returns {String} The config value to use if no other is provided.
 */
Cmd.prototype.getDefaultBootConfig = function() {
    return 'reflection';
};


/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {
    var cmd,
        target,
        prefix,
        script,
        interf,
        count,
        cwd,
        scope;

    cmd = this;

    if (CLI.notEmpty(this.options.target)) {
        target = this.options.target;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name. [1] should be the "target" to run.
        target = this.options._[1];
    }

    //  Validate the command options. Some conflict with each other.
    if (this.options.hidden && this.options.known) {
        this.error('Incompatible options: hidden + known.');
        throw new Error();
    }

    //  Can't ask for owners if there's no target, it only applies to methods.
    if (this.options.owners && CLI.isEmpty(target)) {
        this.error('Invalid options: --owners with no target.');
        throw new Error();
    }

    if (this.options.owners &&
            (this.options.types ||
             this.options.subtypes ||
             this.options.methods ||
             this.options.attributes)) {
        this.error('Invalid options: --owners + --types|--subtypes|--methods|--attributes.');
        throw new Error();
    }

    //  Can't ask for an interface if there's no target.
    if (this.options.interface && CLI.isEmpty(target)) {
        this.error('Invalid options: --interface with no target.');
        throw new Error();
    }

    //  Defining both of these means you want all slots, which is what we get if
    //  there are no flags defined so clear them both.
    if (this.options.methods && this.options.attributes) {
        this.options.methods = false;
        this.options.attributes = false;
    }

    //  We only allow one of the alternatives for "slices" of properties.
    count = 0;
    ['interface', 'unique', 'inherited', 'introduced', 'overridden', 'local'
    ].forEach(function(name) {
        if (cmd.options[name]) {
            count++;
        }
    });

    if (count > 1) {
        this.error('Incompatible options: more than one of: ' +
            'interface, unique, inherited, introduced, overridden, and local.');
        throw new Error();
    }

    //  Client command requires either a target or a 'top level metadata' name.
    //  If we don't see anything else we default to listing APP and/or LIB.
    if (CLI.isEmpty(target) && !this.options.types &&
            !this.options.methods && !this.options.attributes) {
        //  Default to dumping the type list but filtered to APP and LIB.
        this.options.types = true;
        if (!this.options.filter) {
            if (this.options.context === 'all') {
            /* eslint-disable no-useless-escape */
            this.options.filter = '/^(TP|APP)\./';
            /* eslint-enable no-useless-escape */
            } else if (this.options.context === 'app') {
                this.options.filter = '/^APP\./';
            } else if (this.options.context === 'lib') {
                this.options.filter = '/^TP\./';
            } else {
                throw new Error('InvalidContext');
            }
        }
    }

    prefix = ':reflect ';

    target = target || '';
    if (target.length > 0 && target.indexOf(prefix) !== 0) {
        //  Quote the target since it can contain separators etc.
        script = prefix + '\'' + target + '\'';
    } else {
        script = prefix;
    }

    if (this.options.interface) {
        //  Quote the interface since it may contain spaces etc.
        script += ' --interface=\'' + this.options.interface + '\'';
    } else if (CLI.notEmpty(target)) {
        //  Target but no interface. Build one from the available flags,
        //  essentially assembling the target slot filter.
        interf = [];

        //  Visibility
        if (this.options.hidden) {
            interf.push('hidden');
        } else if (this.options.known) {
            interf.push('known');
        }

        //  Scope
        if (this.options.inherited) {
            scope = 'inherited';
        } else if (this.options.introduced) {
            scope = 'introduced';
        } else if (this.options.overridden) {
            scope = 'overridden';
        } else if (this.options.local) {
            scope = 'local';
        } else if (this.options.unique) {
            scope = 'unique';
        }

        if (scope) {
            interf.push(scope);
        }

        if (this.options.methods) {
            if (!scope) {
                interf.push('unique');
            }
            interf.push('methods');
        } else if (this.options.attributes) {
            if (!scope) {
                interf.push('unique');
            }
            interf.push('attributes');
        }

        if (interf.length > 0) {
            script += ' --interface=\'' + interf.join('_') + '\'';
        }
    }

    //  Add the baseline boolean flags the client-side command knows about.
    if (script.indexOf('--interface') === -1) {
        ['owners', 'types', 'subtypes', 'methods', 'attributes'].forEach(
            function(name) {
                if (cmd.options[name]) {
                    script += ' --' + name;
                }
            });
    }

    if (this.options.filter) {
        //  Quote the filter since it may contain spaces etc.
        script += ' --filter=\'' + this.options.filter + '\'';
    }

    cwd = CLI.getCurrentDirectory();

    //  Add current directory path. This allows the output to show the file path
    //  relative to the user's current location for easy cut/paste.
    script += ' --pwd=\'' + cwd + '\'';

    if (this.options.verbose) {
        this.log(script);
    }

    return script;
};


module.exports = Cmd;

}());
