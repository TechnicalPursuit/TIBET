/**
 * @overview The command logic for the 'tibet pack' command.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

//  ---
//  Configure command type.
//  ---

var parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new parent();

//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet pack [manifest]';

//  ---
//  Instance Methods
//  ---

/**
 * Runs the specific command in question.
 */
Cmd.prototype.process = function() {

    var fs;     // The file access module.
    var sh;     // The shelljs module.
    var dom;    // The xmldom module.
    var path;   // The path module.

    var file;   // The manifest file name to read.
    var config; // The config to expand from the manifest.
    var doc;    // The document object for the initial package/manifest.
    var parser; // The DOM parser instance used to parse XML.
    var list;   // The result list of asset references.

    this.fs = require('fs');
    this.sh = require('shelljs');
    this.dom = require('xmldom');
    this.path = require('path');

    this.parser = new this.dom.DOMParser();
    this.serializer = new this.dom.XMLSerializer();

    // Initialize local cache variables.
    this.PACKAGES = {};
    this.PATHS = {};

    this.loadTIBETPaths();

    file = this.argv.manifest || './TIBET-INF/tibet.xml';
    config = this.argv.config;

    doc = this.expandPackage(file, config);
    list = this.listPackageAssets(file, config);

    var my = this;
    var ug = require('uglify-js');
    list.forEach(function(file) {
        my.raw(ug.minify(file).code);
    });

    process.exit(0);
};


Cmd.prototype.isAbsolute = function(aPath) {
    if (aPath.indexOf('~') === 0) {
        return true;
    }

    if (/^[a-zA-Z]+:/.test(aPath)) {
        return true;
    }

    return false;
}


Cmd.prototype.expandPackage = function(aPath, aConfig) {

    var path;
    var xml;    // The xml string read from the top-level manifest.
    var doc;    // The xml DOM document object after parse.
    var package;    // The package tag used to locate a default config.
    var config;     // The ultimate config ID being used.
    var node;       // Result of searching for our config by ID.

    path = this.expandPath(aPath);

    doc = this.PACKAGES[path];
    if (!doc) {
        if (!this.sh.test('-e', path)) {
            this.error('Unable to find manifest: ' + path);
            process.exit(1);
        }

        xml = this.fs.readFileSync(path, {encoding: 'utf8'});
        if (!xml) {
            this.error('Unable to read manifest: ' + path);
            process.exit(1);
        }

        doc = this.parser.parseFromString(xml);
        if (!doc) {
            this.error('Error parsing: ' + path);
            process.exit(1);
        }

        this.PACKAGES[path] = doc;
    }

    config = this.getConfig(doc, aConfig);

    node = doc.getElementById(config);
    if (!node) {
        this.error('<config> not found: ' + config);
        process.exit(1);
    }

    this.expandConfig(node);

    return doc;
};


Cmd.prototype.expandConfig = function(aNode) {

    var my,
        list;

    my = this;

    list = Array.prototype.slice.call(aNode.childNodes, 0);
    list.forEach(function(child) {

        var ref,
            src,
            config;

        if (child.nodeType === 1) {
            switch (child.tagName) {
                case 'config':
                    ref = child.getAttribute('ref');
                    ref = my.expandReference(ref);
                    config = aNode.ownerDocument.getElementById(ref);
                    if (!config) {
                        my.error('<config> not found: ' + ref);
                        process.exit(1);
                    }
                    my.expandConfig(config);
                    break;
                case 'package':
                    src = child.getAttribute('src');
                    src = my.getFullPath(child, src);
                    child.setAttribute('src', src);

                    config = child.getAttribute('config');
                    config = my.expandReference(config);
                    child.setAttribute('config', config);

                    my.expandPackage(src, config);
                    break;
                case 'script':
                    src = child.getAttribute('src');
                    if (src) {
                        src = my.getFullPath(child, src);
                        child.setAttribute('src', src);
                    }
                    break;
                default:
                    break;
            }
        }
    });
};


Cmd.prototype.expandPath = function(aPath) {

    var path,
        parts,
        virtual;

    path = this.PATHS[aPath];
    if (path) {
        return path;
    }

    if (aPath.indexOf('~') === 0) {
        if (aPath === '~') {
            path = this.tibet.paths['app_root'];
        } else if (aPath === '~tibet') {
            path = this.tibet.paths['lib_root'];
        } else {
            parts = aPath.split('/');
            virtual = parts.shift();
            if (virtual === '~') {
                virtual = '~app_root';
            }
            path = this.tibet.paths[virtual.slice(1)];

            if (!path) {
                throw new Error('Virtual path not found: ' + virtual);
            }

            parts.unshift(path);
            path = parts.join('/');

            if (path.indexOf('~') === 0) {
                path = this.expandPath(path);
            }
        }
    } else {
        path = aPath;
    }

    this.PATHS[aPath] = path;

    return path;
};


Cmd.prototype.expandReference = function(aRef) {
    if (aRef && aRef.indexOf('{') === 0) {
        return this.tibet.cfg[aRef.slice(1, -1).replace(/\./g, '_')];
    } else {
        return aRef;
    }
};


Cmd.prototype.getConfig = function(aDoc, aConfig) {

    var package,
        config;

    if (!aConfig) {
        package = aDoc.getElementsByTagName('package')[0];
        if (!package) {
            this.error('<package> tag missing: ' + path);
            process.exit(1);
        }
        // TODO: rename to 'all' in config files etc?
        // TODO: make this default thing a constant.
        config = package.getAttribute('default') || 'full';
    } else {
        config = aConfig;
    }

    return config;
};


Cmd.prototype.getFullPath = function(aNode, aPath) {

    var node,
        parent,
        base;

    if (this.isVirtualPath(aPath)) {
        return this.expandPath(aPath);
    }

    if (this.isAbsolutePath(aPath)) {
        return aPath;
    }

    node = aNode;
    while (parent = node.parentNode) {
        base = parent.getAttribute('basedir');
        if (base) {
            // TODO: join paths via Node path module?
            return this.expandPath(this.path.join(base, aPath));
        }
        node = parent;
    }
};


Cmd.prototype.isAbsolutePath = function(aPath) {
    if (aPath.indexOf('~') === 0) {
        return true;
    }

    if (aPath.indexOf('/') === 0) {
        return true;
    }

    if (/^[a-z]+:/.test(aPath)) {
        return true;
    }

    return false;
};


Cmd.prototype.isVirtualPath = function(aPath) {
    return aPath.indexOf('~') === 0;
};


Cmd.prototype.listConfigAssets = function(aNode, aList) {

    var my,
        list,
        result;

    my = this;

    result = aList || [];

    list = Array.prototype.slice.call(aNode.childNodes, 0);
    list.forEach(function(child) {

        var ref,
            src,
            config,
            str;

        if (child.nodeType === 1) {
            switch (child.tagName) {
                case 'config':
                    ref = child.getAttribute('ref');

                    config = aNode.ownerDocument.getElementById(ref);
                    if (!config) {
                        my.error('<config> not found: ' + ref);
                        process.exit(1);
                    }
                    my.listConfigAssets(config, result);
                    break;
                case 'package':
                    src = child.getAttribute('src');
                    config = child.getAttribute('config');

                    my.listPackageAssets(src, config, result);
                    break;
                case 'echo':
                    // TODO: Have to rewrite these into $stdout() calls.
                    break;
                case 'script':
                    src = child.getAttribute('src');
                    if (src) {
                        result.push(src);
                    }
                    break;
                default:
                    my.raw(my.serializer.serializeToString(child));
                    break;
            }
        }
    });

    return result;
};


Cmd.prototype.listPackageAssets = function(aPath, aConfig, aList) {

    var path,
        config,
        doc,
        node,
        result;

    path = this.expandPath(aPath);

    doc = this.PACKAGES[path];
    if (!doc) {
        this.error('Unable to list unexpanded package: ' + aPath);
    }

    config = this.getConfig(doc, aConfig);

    node = doc.getElementById(config);
    if (!node) {
        this.error('<config> not found: ' + config);
        process.exit(1);
    }

    result = aList || [];
    this.listConfigAssets(node, result);

    return result;
};


Cmd.prototype.loadTIBETPaths = function() {

    var morepaths,
        my;

    this.tibet = require(this.path.join(this.options.app_root, 'tibet.json'));

    morepaths = require(
        this.path.join(this.options.app_root,
                       this.tibet.paths.lib_root,
                       'base/cfg/tibet_paths.json'));

    my = this;
    Object.keys(morepaths.paths).forEach(function(key) {
        if (!my.tibet.paths.hasOwnProperty(key)) {
            my.tibet.paths[key] = morepaths.paths[key];
        }
    });
};



//  ---
//  Export
//  ---

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Cmd;
    }
    exports.Cmd = Cmd;
} else {
    root.Cmd = Cmd;
}

}(this));
