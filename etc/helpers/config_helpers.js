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

    module.exports = {

        extend: function(Cmd, CLI) {

            Cmd.prototype.addXMLEntry = function(
                    node, prefix, content, suffix) {
                var doc,
                    parser,
                    newElem;

                doc = node.ownerDocument;
                node.appendChild(doc.createTextNode(prefix));

                parser = this.getXMLParser();

                doc = parser.parseFromString(content, 'text/xml');
                if (!doc ||
                    CLI.isValid(doc.getElementsByTagName('parsererror')[0])) {
                    this.error(
                        'Error parsing ' + content + '. Not well-formed?');
                    throw new Error();
                }

                newElem = doc.documentElement;
                node.appendChild(newElem);
                newElem.ownerDocument = node.ownerDocument;

                return node.appendChild(doc.createTextNode(suffix));
            };

            //  ---

            Cmd.prototype.addXMLLiteral = function(node, text) {
                var doc;

                doc = node.ownerDocument;
                return node.appendChild(doc.createTextNode(text));
            };

            //  ---

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

            //  ---

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

            //  ---

            Cmd.prototype.readConfigData = function(pkgfile) {
                var file,
                    sh,
                    text,
                    err;

                this.trace('reading package file:' + pkgfile);

                file = CLI.expandPath(pkgfile);

                sh = require('shelljs');
                text = sh.cat(file);
                err = sh.error();
                if (err) {
                    this.error('Error reading package file: ' + pkgfile);
                    return null;
                }

                return text;
            };

            //  ---

            Cmd.prototype.readConfigNode = function(
                    pkgfile, cfgname, buildIfAbsent) {
                var pkgtext,
                    parser,
                    doc,
                    config,
                    packageNode,
                    defaultCfgName;

                pkgtext = this.readConfigData(pkgfile);
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

                    this.writeConfigNode(pkgfile, packageNode);

                    if (!(config = doc.getElementById(cfgname))) {
                        this.error('Cannot find <config> id: ' +
                            defaultCfgName + ' after creation attempt.');
                        return null;
                    }
                }

                return config;
            };

            //  ---

            Cmd.prototype.readPackageNode = function(pkgfile) {
                var pkgtext,
                    parser,
                    doc,
                    packageNode;

                pkgtext = this.readConfigData(pkgfile);
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

                return packageNode;
            };

            //  ---

            Cmd.prototype.serializeNode = function(node) {
                var dom,
                    str;

                dom = require('xmldom');
                str = (new dom.XMLSerializer()).serializeToString(node);

                return str;
            };

            //  ---

            Cmd.prototype.writeConfigData = function(pkgfile, cfgdata) {
                var file,
                    text;

                this.trace('writing package file:' + pkgfile);

                file = CLI.expandPath(pkgfile);

                //  'to' is a shelljs extension to String - we're assuming that
                //  shelljs is loaded here.
                cfgdata.to(file);

                return text;
            };

            //  ---

            Cmd.prototype.writeConfigNode = function(pkgfile, config) {
                var str;

                str = this.serializeNode(config.ownerDocument);

                this.writeConfigData(pkgfile, str);
            };

            //  ---

            Cmd.prototype.writePackageNode = function(pkgfile, package) {
                var str;

                str = this.serializeNode(package);

                this.writeConfigData(pkgfile, str);
            };
        }
    };

}());
