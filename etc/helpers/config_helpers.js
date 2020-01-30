//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview Utility methods used to help commands manage/update TIBET package
 *     files. Examples include the 'tag' and 'resources' commands which update
 *     package information as part of their operation.
 */
//  ========================================================================

(function() {
    'use strict';

    var $$packages;

    //  Cache of package nodes read keyed by their package file names.
    $$packages = {};

    module.exports = {

        extend: function(Cmd, CLI) {
            var sh;

            sh = require('shelljs');

            /**
             * Appends optional prefix, content, and suffix items to a node.
             * @param {Element} node The node to add child content to.
             * @param {String|Node} [prefix] Optional prefix text or node. If
             *     provided in string form creates a text node.
             * @param {String|Node} [content] Content markup or Node. If
             *     provided as a string the string is parsed for DOM conversion.
             * @param {String|Node} [suffix] Optional suffix text or node. If
             *     provided in string form creates a text node.
             * @returns {Node} The newly created content node, if any.
             */
            Cmd.prototype.addXMLEntry = function(
                    node, prefix, content, suffix) {
                var doc,
                    parser,
                    newElem;

                doc = node.ownerDocument;

                //  We want new entries to be on a line by themselves...
                if (!node.lastChild || node.lastChild.nodeType !== 3 ||
                    node.lastChild.data !== '\n') {
                    node.appendChild(doc.createTextNode('\n'));
                }

                //  prefix

                if (typeof prefix === 'string') {
                    node.appendChild(doc.createTextNode(prefix));
                } else if (prefix && prefix.nodeType !== undefined) {
                    node.appendChild(prefix);
                } else if (prefix !== null && prefix !== undefined) {
                    this.error('Invalid prefix. Must be string or Node.');
                    throw new Error();
                }

                //  content

                if (typeof content === 'string') {
                    parser = this.getXMLParser();

                    doc = parser.parseFromString(content, 'text/xml');
                    if (!doc ||
                        CLI.isValid(doc.getElementsByTagName('parsererror')[0])) {
                        this.error(
                            'Error parsing ' + content + '. Not well-formed?');
                        throw new Error();
                    }
                    newElem = doc.documentElement;

                    newElem = node.appendChild(newElem);
                    newElem.ownerDocument = node.ownerDocument;
                } else if (content && content.nodeType !== undefined) {
                    newElem = node.appendChild(content);
                } else if (content !== undefined) {
                    this.error('Invalid prefix. Must be string or Node.');
                    throw new Error();
                }

                //  suffix

                if (typeof suffix === 'string') {
                    node.appendChild(doc.createTextNode(suffix));
                } else if (suffix && suffix.nodeType !== undefined) {
                    node.appendChild(suffix);
                } else if (suffix !== undefined) {
                    this.error('Invalid suffix. Must be string or Node.');
                    throw new Error();
                }

                //  We want new entries to be on a line by themselves...
                if (!node.lastChild || node.lastChild.nodeType !== 3 ||
                    node.lastChild.data !== '\n') {
                    node.appendChild(doc.createTextNode('\n'));
                }

                return newElem;
            };


            /**
             * Appends literal text (as a text node) to a node.
             * @param {Element} node The node to add child content to.
             * @param {String|Node} text Content text to add.
             * @returns {Node} The newly created node.
             */
            Cmd.prototype.addXMLLiteral = function(node, text) {
                var doc;

                doc = node.ownerDocument;

                return node.appendChild(doc.createTextNode(text));
            };


            /**
             * Creates and returns an instance of DOMParser for use in parsing
             * node content strings.
             * @returns {DOMParser} The new DOM parser.
             */
            Cmd.prototype.getXMLParser = function() {
                var dom;

                dom = require('xmldom');

                if (!this.parser) {
                    this.parser = new dom.DOMParser({
                        locator: {},
                        errorHandler: {
                            error: function(msg) {
                                this.error('Error parsing XML: ' + msg);
                            },
                            warn: function(msg) {
                                if (!this.options.quiet) {
                                    this.warn('Warning parsing XML: ' + msg);
                                }
                            }
                        }
                    });
                }

                return this.parser;
            };


            /**
             * Checks whether a particular configuration entry is found within
             * the child nodes of the original node provided.
             * @param {Node} node The node whose content is to be checked.
             * @param {String} tagName The tag name: 'script', 'resource', etc
             *     which identifies the entry type being checked.
             * @param {String} attrName The attribute name to check for.
             * @param {String} attrValue The attribute value to check for.
             * @returns {Boolean} True if the tag/attribute configuration is
             *     found.
             */
            Cmd.prototype.hasXMLEntry = function(
                    node, tagName, attrName, attrValue) {
                var children;

                children = Array.prototype.slice.call(node.childNodes, 0);

                return children.some(function(child) {
                    if (child.tagName === tagName) {
                        return child.getAttribute(attrName) === attrValue;
                    }
                    return false;
                });
            };


            /**
             * Reads a specific configuration node from the package provided.
             * The package can be passed as either a filename or package node.
             * @param {Node|String} pkg The package (or package node) to query.
             * @param {String} cfgname The name of the config node to read.
             * @param {Boolean} buildIfAbsent True to force construction of the
             *     config node if it isn't found.
             * @returns {Node} The config node that was read or built.
             */
            Cmd.prototype.readConfigNode = function(
                    pkg, cfgname, buildIfAbsent) {
                var pkgfile,
                    doc,
                    config,
                    packageNode,
                    defaultCfgName;

                if (typeof pkg === 'string') {
                    packageNode = this.readPackageNode(pkg);
                    pkgfile = pkg;
                } else if (pkg && pkg.nodeType !== undefined) {
                    packageNode = pkg;
                    pkgfile = 'unspecified.file';
                } else {
                    throw new Error('Invalid package parameter: ' + pkg);
                }

                if (!packageNode) {
                    throw new Error('Invalid package: ' + pkg);
                }

                doc = packageNode.ownerDocument;

                if (!(config = doc.getElementById(cfgname))) {
                    this.warn('Could not find <config> id: ' + cfgname +
                        ' in: ' + pkgfile);

                    if (!(packageNode = doc.getElementsByTagName('package')[0])) {
                        this.error('Malformed package file.' +
                            ' Cannot find top-level <package> in: ' +
                            pkgfile);
                        return null;
                    }

                    defaultCfgName = packageNode.getAttribute('default');
                    if (!defaultCfgName || defaultCfgName === '') {
                        this.error('Cannot find <package> default attribute ' +
                            ' in: ' + pkgfile);
                        return null;
                    }

                    if (!doc.getElementById(defaultCfgName)) {
                        this.error('Cannot find default <config> id: ' +
                            defaultCfgName +
                            ' in: ' + pkgfile);
                        return null;
                    }

                    if (buildIfAbsent !== true) {
                        return null;
                    }

                    this.info('Adding <config> id: ' + cfgname +
                        ' to: ' + pkgfile);
                    this.warn('<config> id: ' + cfgname +
                        ' content will require <config ref="' +
                        cfgname + '"/> to load.');

                    this.addXMLEntry(
                        packageNode,
                        '',
                        '<config id="' + cfgname + '"/>',
                        '\n\n');

                    if (!(config = doc.getElementById(cfgname))) {
                        this.error('Cannot find <config> id: ' +
                            defaultCfgName + ' after creation attempt.');
                        return null;
                    }
                }

                return config;
            };


            /*
             * @private
             * Reads the text content of a package file and returns it.
             * @param {String} pkgfile The path to the package file to be read.
             * @returns {String} The text content of the target package.
             */
            Cmd.prototype.$readPackageFile = function(pkgfile) {
                var file,
                    text;

                this.trace('reading package file:' + pkgfile);

                file = CLI.expandPath(pkgfile);

                text = sh.cat(file);
                if (sh.error()) {
                    this.error('Error reading package file: \'' + pkgfile +
                                '\': ' + text.stderr);
                    return null;
                }

                return text.toString();
            };


            /**
             * Reads a package file and returns the root package node found.
             * @param {String} pkgfile The package file reference to be read.
             * @returns {Node} The root package node for the package file.
             */
            Cmd.prototype.readPackageNode = function(pkgfile) {
                var packageNode,
                    filename,
                    pkgtext,
                    parser,
                    doc;

                if (!pkgfile) {
                    this.error('Invalid package file parameter.');
                    throw new Error();
                }

                filename = CLI.getVirtualPath(pkgfile);

                //  Check the cache for the normalized file name.
                packageNode = $$packages[filename];
                if (packageNode) {
                    return packageNode;
                }

                pkgtext = this.$readPackageFile(pkgfile);
                if (!pkgtext) {
                    return null;
                }

                parser = this.getXMLParser();

                doc = parser.parseFromString(pkgtext);
                if (!doc ||
                    CLI.isValid(doc.getElementsByTagName('parsererror')[0])) {
                    this.error('Error parsing package. Not well-formed?');
                    throw new Error();
                }

                if (!(packageNode = doc.getElementsByTagName('package')[0])) {
                    this.error('Malformed package file.' +
                        ' Cannot find top-level <package> in: ' +
                        pkgfile);
                    return null;
                }

                //  Cache node so we share across calls as much as possible.
                $$packages[filename] = packageNode;

                return packageNode;
            };


            /**
             * Removes any child nodes matching the criteria given.
             * @param {Node} node The node whose content is to be adjusted.
             * @param {String} tagName The tag name: 'script', 'resource', etc
             *     which identifies the entry type being checked.
             * @param {String} attrName The attribute name to check for.
             * @param {String} attrValue The attribute value to check for.
             * @returns {Number} The number of nodes removed, if any.
             */
            Cmd.prototype.removeXMLEntry = function(
                    node, tagName, attrName, attrValue) {
                var children,
                    count;

                count = 0;
                children = Array.prototype.slice.call(node.childNodes, 0);

                children.forEach(function(child) {
                    if (child.tagName === tagName &&
                            child.getAttribute(attrName) === attrValue) {
                        node.removeChild(child);
                        count += 1;
                    }
                });

                return count;
            };


            /**
             * Produces a serialized text version of a node.
             * @param {Node} node The node to serialize.
             * @returns {String} The serialized node text.
             */
            Cmd.prototype.serializeNode = function(node) {
                var dom,
                    str;

                dom = require('xmldom');
                str = (new dom.XMLSerializer()).serializeToString(node);

                return str;
            };


            /**
             * Writes a string to a package file as the content of that package.
             * @param {String} pkgfile The package file to save content to.
             * @param {String} pkgdata The string content to be written.
             * @returns {Boolean} True for success, false for failure.
             */
            Cmd.prototype.writePackageData = function(pkgfile, pkgdata) {
                var file,
                    data;

                this.trace('writing package file:' + pkgfile);

                if (!pkgdata || typeof pkgdata !== 'string') {
                    this.error('Invalid/empty package data.');
                    return false;
                }
                data = pkgdata.trim();

                file = CLI.expandPath(pkgfile);

                //  Ensure we get a valid XML header. If the data came from node
                //  serialization (which is typical) the header will be missing.
                if (data.indexOf('<?xml') !== 0) {
                    data = '<?xml version="1.0"?>\n' + data;
                }

                try {
                    //  'to' is a shelljs extension to String - we're assuming
                    //  that shelljs is loaded here.
                    (new sh.ShellString(data)).to(file);
                } catch (e) {
                    this.error('Unable to save package data: ' + e.message);
                    return false;
                }

                //  Clear any cached version of the package's node data.
                delete $$packages[file];

                return true;
            };


            /**
             * Writes a package node to a package file as the new content node
             * for that package.
             * @param {String} pkgfile The package file to save content to.
             * @param {Node} pkgnode The node content to be written.
             * @returns {Boolean} True for success, false for failure.
             */
            Cmd.prototype.writePackageNode = function(pkgfile, pkgnode) {
                var str;

                str = this.serializeNode(pkgnode);

                return this.writePackageData(pkgfile, str);
            };
        }
    };

}());
