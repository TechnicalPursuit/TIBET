//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet package' command. Front-end to the Package object found
 *     in _Package.js which provides utilities for processing TIBET package
 *     files and their contents. This command also serves as a supertype for
 *     other commands whose operations focus on processing file lists produced
 *     from TIBET packages such as 'tibet rollup' and 'tibet lint'.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

/*
 * STANDARD OPTIONS:
 *
 *      package     The path of the top-level package to begin processing with.
 *                  The default is ~app_cfg/main.xml for application content.
 *      config      The name of the top-level package config to process.
 *                  Defaults to the default config for the package.
 *      all         True to expand all configs in the package. Default is false.
 *                  If this is true then config is ignored since all configs in
 *                  the package (and descendant packages) will be processed.
 *      silent      Silence normal logging. Defaults to the value set for
 *                  'all'. If 'all' is true we default this to true to
 *                  suppress warnings about duplicate assets.
 *      phase       Package phase? Default depends on context (app vs. lib)
 *      context     alias for phase in this command (app, lib, all)
 *
 * OTHER OPTIONS:
 *
 *      Note that other options are passed through to the Package instance which
 *      does the actual expand/list processing. See tibet_package.js for more
 *      info on the options available through that component.
 */

(function() {

'use strict';

var CLI,
    path,
    find,
    dom,
    helpers,
    serializer,
    Cmd;


CLI = require('./_cli');
path = require('path');
find = require('findit');
dom = require('xmldom');
serializer = new dom.XMLSerializer();
helpers = require('../../../etc/helpers/config_helpers');


//  ---
//  Type Construction
//  ---

Cmd = function() {
    //  empty
};
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();

//  Augment our prototype with XML config methods.
helpers.extend(Cmd, CLI);

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
Cmd.NAME = 'package';

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
        'boolean': ['all', 'scripts', 'resources', 'images', 'nodes',
            'unresolved', 'inlined', 'unlisted'],
        'string': ['package', 'config', 'include', 'exclude', 'phase',
            'profile', 'add', 'remove'],
        default: {
            scripts: true,
            resources: true,
            images: true,
            add: false,
            remove: false,
            fix: false,
            unresolved: false,
            unlisted: false
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet package [[--profile ] <profile> | [--package <package>] [--config <cfg>]]\n' +
    '\t[--phase <app|lib|all>] [--unresolved] [--unlisted]\n' +
    '\t[--add <file_list>] [--remove <file_list>]\n' +
    '\t[--include <asset names>] [--exclude <asset names>]\n' +
    '\t[--scripts] [--resources] [--images] [--nodes]';

/**
 * List of any assets that need to be removed from the package during
 * remove/fix processing.
 * @type {Array}
 */
Cmd.prototype.deletes = null;

/**
 * List of any assets that need to be added to the package during add/fix
 * processing.
 * @type {Array}
 */
Cmd.prototype.inserts = null;

/**
 * The package instance which this instance is using to process package data.
 * @type {Package}
 */
Cmd.prototype.package = null;


/**
 * The final options used to drive the underlying Package object.
 * @type {Object}
 */
Cmd.prototype.pkgOpts = null;


//  ---
//  Instance Methods
//  ---

/**
 * Check arguments and configure default values prior to running prereqs.
 * @returns {Object} An options object usable by the command.
 */
Cmd.prototype.configure = function() {
    var arg0,
        parts,
        cmd;

    //  If we have an arg0 value (unqualified via flag) it should be the profile
    //  value, which then overrides any package/config data.
    arg0 = this.getArgument(0);
    if (arg0) {
        this.options.profile = arg0;
    }

    if (this.options.profile) {
        parts = this.options.profile.split('@');
        this.options.package = parts[0];
        this.options.config = parts[1];
    }

    //  Process boot.* properties in particular since they can drive how we
    //  resolve package if/unless flags at runtime. The issue here is that the
    //  default command line parsing won't process these correctly if not
    //  mentioned specifically as "boolean" but we want to make sure they are.
    if (this.options.boot) {
        cmd = this;
        Object.keys(this.options.boot).forEach(function(key) {
            var value;

            value = cmd.options.boot[key];
            if (value === 'true') {
                cmd.options.boot[key] = true;
            } else if (value === 'false') {
                cmd.options.boot[key] = false;
            }
        });
    }

    return this.options;
};


/**
 * Process inbound configuration flags and provide for adjustment via the
 * finalizePackageOptions call. On completion of this routine the receiver's
 * package options are fully configured.
 * @returns {Object} The package options after being fully configured.
 */
Cmd.prototype.configurePackageOptions = function() {

    this.pkgOpts = this.options;

    // If we're doing add, remove, unlisted or unresolved operations we need to
    // override/assign values to the other parameters to ensure we get a full
    // list of known assets from the package being scanned.
    if (this.options.add || this.options.remove ||
            this.options.unresolved || this.options.unlisted) {
        this.info('scanning for unresolved/unlisted files...');
        this.options.images = true;
        this.options.scripts = true;
        this.options.resources = true;
        this.options.phase = 'all';
        this.options.include = null;
        this.options.exclude = null;

        //  When working with a specific config focus on that config, otherwise
        //  when only looking at a package we try to find everything in the
        //  package that might be unresolved.
        if (CLI.isEmpty(this.options.config)) {
            this.options.all = true;
        } else {
            this.options.all = false;
        }
    }

    // If silent isn't explicitly set but we're doing a full expansion turn
    // silent on so we skip duplicate resource warnings.
    if (CLI.notValid(this.options.silent) && this.options.all) {
        this.pkgOpts.silent = true;
    }

    //  Default the context based on project vs. library.
    if (CLI.notValid(this.pkgOpts.context)) {
        if (CLI.inProject()) {
            this.pkgOpts.context = 'app';
        } else if (CLI.inLibrary()) {
            this.pkgOpts.context = 'lib';
        }
    }

    //  Default the phase based on context.
    if (CLI.notValid(this.pkgOpts.phase)) {
        this.pkgOpts.phase = this.pkgOpts.context;
    }

    // Set boot phase defaults. If we don't manage these then most app package
    // runs will quietly filter out all their content nodes.
    this.pkgOpts.boot = this.pkgOpts.boot || {};
    switch (this.options.phase) {
        case 'lib':
        case 'one':
            this.pkgOpts.boot.phase_one = true;
            this.pkgOpts.boot.phase_two = false;
            break;
        case 'app':
        case 'two':
            this.pkgOpts.boot.phase_one = false;
            this.pkgOpts.boot.phase_two = true;
            break;
        default:
            this.pkgOpts.boot.phase_one = true;
            this.pkgOpts.boot.phase_two = true;
            break;
    }

    if (CLI.notValid(this.pkgOpts.boot.inlined)) {
        this.pkgOpts.boot.inlined = this.options.inlined || false;
    }

    // Give subtypes a hook to make any specific adjustments to
    // the package options they need.
    this.finalizePackageOptions();

    return this.pkgOpts;
};


/**
 * Top-level processing of the package to produce an asset list. For this type
 * and subtypes of the package command you should look to the "executeForEach"
 * method for the actual node-by-node processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var list;       // The result list of asset references.

    this.configurePackageOptions();

    list = this.getPackageAssetList();

    this.executeForEach(list);

    return 0;
};


/**
 * Processes a list of package asset nodes. The specific processing is often
 * overridden by subtypes such as rollup and lint to iterate on the list
 * produced by the 'execute' method. The default behavior is to simply output
 * the node text to the log.
 * @param {Array.<Node>} list An array of package nodes.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeForEach = function(list) {
    var cmd,
        finder,
        code,
        root,
        excludeDirs,
        excludeFiles,
        pouch,
        attrs,
        files,
        unresolved,
        unlisted;

    cmd = this;

    //  ---
    //  standard listing
    //  ---

    //  No flags that would cause potential alteration of the package means we
    //  can simply list the data and return.
    if (!this.options.add && !this.options.remove && !this.options.fix &&
            !this.options.unlisted && !this.options.unresolved) {
        list.forEach(function(item) {
            if (cmd.pkgOpts.nodes) {
                attrs = Array.prototype.slice.call(item.attributes);
                attrs.forEach(function(attr) {
                    item.setAttribute(attr.name,
                        CLI.getVirtualPath(attr.value));
                });
                cmd.info(serializer.serializeToString(item));
            } else {
                cmd.info(CLI.getVirtualPath(item));
            }
        });
        return;
    }

    //  ---
    //  unresolved file check
    //  ---

    if (this.options.unresolved) {

        //  Simple...just verify every path mentioned in package is real...
        unresolved = list.filter(function(item) {
            return !CLI.sh.test('-e', item);
        });

        if (unresolved.length > 0) {
            unresolved.forEach(function(item) {
                cmd.warn('Package entry not found: ' + item);
            });

            this.error('' + unresolved.length +
                ' package referenced files unresolved.');
        } else {
            this.info(
                'All package-referenced files found in project.');
        }

        //  If we're being asked to fix things then unresolved files should be
        //  removed...add them to the deletes list.
        if (this.options.fix) {
            this.deletes = unresolved;
        }
    }

    //  Are we done? No need to scan file system if we're just running a
    //  unresolved check without add/remove/fix.
    if (!this.options.add && !this.options.remove && !this.options.fix &&
            !this.options.unlisted) {
        if (unresolved.length > 0) {
            throw new Error();
        } else {
            return 0;
        }
    }

    //  ---
    //  unlisted
    //  ---

    /*
     * A bit more complicated. We need to scan the file system to come up with a
     * list of files that seem like they should be listed in the application
     * package for it to boot/roll up properly. Then we compare that to the list
     * of actual entries in the package.
     */

    if (this.options.unlisted) {

        excludeDirs = [];
        excludeDirs.push(/\/\..*/);
        excludeDirs.push(/node_modules/);

        excludeFiles = [];
        excludeFiles.push(/\/\..*/);
        excludeFiles.push(/\.css$/);
        excludeFiles.push(/\.less$/);
        excludeFiles.push(/\.sass$/);
        excludeFiles.push(/\.scss$/);
        excludeFiles.push(/\.xhtml$/);

        if (CLI.inProject()) {
            root = CLI.expandPath('~app');

            excludeDirs.push(/~app_build/);
            excludeDirs.push(/~lib/);
            excludeDirs.push(/~app_boot/);
            excludeDirs.push(/~app_cfg/);
            excludeDirs.push(/~app_cmd/);
            excludeDirs.push(/~app_log/);

            pouch = CLI.cfg('tds.pouch.prefix') || 'pouch';
            excludeDirs.push(new RegExp(pouch));

        } else {
            root = CLI.expandPath('~lib');

            excludeDirs.push(/~lib_boot/);
            excludeDirs.push(/~lib_cli/);
            excludeDirs.push(/~lib_cmd/);
            excludeDirs.push(/~lib_dna/);
            excludeDirs.push(/~lib_cfg/);
            excludeDirs.push(/~lib_etc/);
            excludeDirs.push(/~lib_deps/);
        }

        code = 0;
        files = [];

        finder = find(root);

        finder.on('error', function(e) {
            cmd.error('Error processing project files: ' + e);
            code = 1;
        });

        // Ignore links. (There shouldn't be any...but just in case.).
        finder.on('link', function(link) {
            cmd.warn('Ignoring link: ' + link);
        });

        // Ignore hidden directories and the node_modules directory.
        finder.on('directory', function(dir, stat, stop) {
            var fulldir,
                base,
                virtual;

            fulldir = CLI.expandPath(dir);
            base = path.basename(fulldir);
            if (base.charAt(0) === '.' || base === 'node_modules') {
                stop();
                return;
            }

            if (CLI.notEmpty(excludeDirs)) {
                virtual = CLI.getVirtualPath(fulldir);
                excludeDirs.forEach(function(exclusion) {
                    if (exclusion.test(base) || exclusion.test(virtual)) {
                        stop();
                    }
                });
            }
        });

        finder.on('file', function(file) {
            var virtual,
                stop;

            if (!file.match(/\.(js|jscript)$/)) {
                return;
            }

            stop = false;

            if (CLI.notEmpty(excludeFiles)) {
                virtual = CLI.getVirtualPath(file);
                excludeFiles.forEach(function(exclusion) {
                    if (exclusion.test(file) || exclusion.test(virtual)) {
                        stop = true;
                    }
                });
            }

            if (stop) {
                return;
            }

            files.push(file);
        });

        finder.on('end', function() {
            var packaged;

            if (code !== 0) {
                throw new Error();
            }

            //  File lists and package entries come in fully-expanded form but
            //  that makes comparisons harder from a filtering perspective
            //  (easier to filter out ~lib_build than some hard-coded root
            //  path).
            files = files.map(function(file) {
                return CLI.getVirtualPath(file);
            });

            packaged = list.map(function(file) {
                return CLI.getVirtualPath(file);
            });

            unlisted = files.filter(function(item) {
                return packaged.indexOf(item) === -1;
            });

            if (unlisted.length > 0) {

                if (cmd.options.verbose) {
                    unlisted.forEach(function(item) {
                        cmd.log('Unlisted file found: ' + item);
                    });
                }

                cmd.info('' + unlisted.length +
                    ' files not referenced in package.');
            } else {
                cmd.info(
                    'All files referenced at least once in package.');
            }

            if (cmd.options.fix) {
                cmd.inserts = unlisted;
            }

            cmd.processDeltas();
        });

    } else {
        //  Not doing unlisted scan, but may have add/remove information.
        this.processDeltas();
    }
};


/**
 * Perform any last-minute changes to the package options before creation of the
 * internal Package instance. Intended to be overridden but custom subcommands.
 */
Cmd.prototype.finalizePackageOptions = function() {

    //  Tell the package helper our config should win.
    this.pkgOpts.forceConfig = true;

    if (!this.pkgOpts.package) {
        if (this.options.profile) {
            this.pkgOpts.package = this.options.profile.split('@')[0];
            this.pkgOpts.config = this.options.profile.split('@')[1];
        } else {
            this.pkgOpts.package = CLI.getcfg('boot.package') ||
                CLI.getcfg('boot.default_package') ||
                CLI.PACKAGE_FILE;
        }
    }

    this.debug('pkgOpts: ' + CLI.beautify(JSON.stringify(this.pkgOpts)));
};


/**
 * Return the list of assets for the receiver based on its current package
 * options. The package options are determined by configurePackageOptions and
 * the finalizePackageOptions call it invokes.
 * @returns {Array} The package options.
 */
Cmd.prototype.getPackageAssetList = function() {

    var Package,    // The tibet_package.js export.
        list;       // The result list of asset references.

    Package = require('../../../etc/common/tibet_package.js');
    this.package = new Package(this.pkgOpts);

    if (this.pkgOpts.all) {
        this.package.expandAll();
        list = this.package.listAllAssets();
    } else {
        this.package.expandPackage();
        list = this.package.listPackageAssets();
    }

    return list;
};


/**
 */
Cmd.prototype.processDeltas = function() {
    var inserts,
        deletes,
        cmd,
        pkgName,
        pkgNode,
        cfgName,
        cfgNode,
        dirty,
        code;

    if (!this.options.add && !this.options.remove && !this.options.fix) {
        //  We weren't asked to patch changes so quietly exit.
        return 0;
    }

    //  Must have a package. We can allow 'default config' to be used for
    //  config but not for package. That cannot be defaulted.
    if (!this.options.package) {
        this.error('No package definition available for updating.');
        return 1;
    }

    cmd = this;

    //  Unlisted and unresolved (if enabled) will have pre-populated the lists
    //  of assets to add/remove.
    deletes = this.deletes || [];
    inserts = this.inserts || [];

    if (this.options.add) {
        inserts = inserts.concat(this.options.add.split(' '));
        inserts = inserts.map(function(item) {
            return CLI.getVirtualPath(CLI.expandPath(item));
        });
    }

    if (this.options.remove) {
        deletes = deletes.concat(this.options.remove.split(' '));
        deletes = deletes.map(function(item) {
            return CLI.getVirtualPath(CLI.expandPath(item));
        });
    }

    if (CLI.isEmpty(inserts) && CLI.isEmpty(deletes)) {
        return 0;
    }


    pkgName = this.options.package;
    cfgName = this.options.config;

    if (pkgName.charAt(0) !== '~') {
        if (CLI.inProject()) {
            pkgName = path.join('~app_cfg', pkgName);
        } else {
            pkgName = path.join('~lib_cfg', pkgName);
        }
    }

    if (!/.xml$/.test(pkgName)) {
        pkgName = pkgName + '.xml';
    }

    pkgNode = this.readPackageNode(pkgName);
    if (!pkgNode) {
        throw new Error('Unable to read ' + pkgName + '.');
    }

    cfgNode = this.readConfigNode(pkgNode, cfgName, false);
    if (!cfgNode) {
        throw new Error('Unable to find ' + pkgName + '@' + cfgName + '.');
    }

    //  Set a flag we can check to determine if we need to write package.
    dirty = false;

    deletes.forEach(function(item) {
        var result;

        result = cmd.removeXMLEntry(cfgNode, 'script', 'src', item);
        if (result === 0) {
            cmd.warn('- ' + item + ' (not found)');
        } else {
            cmd.log('- ' + item + ' (removed)');
            dirty = true;
        }
    });


    //  Set 0 for return code. We'll increment with each error we encounter
    //  during attempts to insert.
    code = 0;

    inserts.forEach(function(item) {
        var tag,
            str;

        tag = 'script';
        str = '<' + tag + ' src="' + item + '"/>';

        try {
            if (cmd.hasXMLEntry(cfgNode, 'script', 'src', item)) {
                cmd.warn('+ ' + item + ' (duplicate)');
            } else {
                cmd.addXMLEntry(cfgNode, '    ', str, '');
                cmd.log('+ ' + item + ' (inserted)');
                dirty = true;
            }
        } catch (e) {
            cmd.error(e.message);
            if (cmd.options.stack) {
                cmd.error(e.stack);
            }
            code += 1;
        }
    });

    //  Only write out configuration if there were no errors during processing.
    if (code === 0 && dirty) {
        cmd.writePackageNode(pkgName, pkgNode);

        this.warn('New configuration entries created. Review/Rebuild as needed.');
    }

    return code;
};


module.exports = Cmd;

}());
