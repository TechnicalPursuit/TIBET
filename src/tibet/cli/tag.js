//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet tag' command. This command copies tibet tag source files
 *     into a target directory, creating the directory if necessary. Files
 *     containing handlebars templates are processed with an object containing
 *     the tagname and any other argument values for the command. It also
 *     updates a project's (or the TIBET core library's) manifest to contain
 *     entries for the newly added tags.
 */
//  ========================================================================

/*eslint indent:0*/

(function() {

'use strict';

var CLI,
    Parent,
    Cmd;

CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

Parent = require('./_cmd');

Cmd = function() {};
Cmd.prototype = new Parent();

//  ---
//  Instance Attributes
//  ---

/**
 * The command execution context. 'tag' can only be done inside of the TIBET
 * library or a project.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


/**
 * Where are the tag source templates we should clone from? This value will be
 * joined with the current file's load path to create the absolute root path.
 * @type {string}
 */
Cmd.prototype.TEMPLATED_TAG_ROOT = '../templates/templatedtag/';
Cmd.prototype.COMPILED_TAG_ROOT = '../templates/compiledtag/';


/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Creates a new TIBET tag using the supplied tag name and parameters.\n\n' +

'Tag names can supply one, two or three \'parts\', separated by \'.\' or\n' +
'\':\'. If three parts are supplied, they are used as the root namespace,\n' +
'the tag type namespace and the tag name, respectively. If two parts are\n' +
'supplied, they are used for the tag type namespace and the tag name and\n' +
'the root namespace is defaulted to either \'APP\' or \'TP\', depending\n' +
'on whether this command is being executed in an application project or\n' +
'the TIBET library. If one part is supplied, and this command is being\n' +
'executed in an application project, the tag type namespace is defaulted\n' +
'to the application project name and the root namespace is defaulted as\n' +
'it is when two parts are supplied. It is not a valid operation to execute\n' +
'this command with one part when executed inside of the TIBET library.\n\n' +

'The --package optional parameter is used to determine the cfg package\n' +
'file that will be updated with entries to load the new tag type and\n' +
'configure it. If this parameter is not supplied, the default for a tag\n' +
'being created in a project is \'~app_cfg/{{appname}}.xml\'. For a tag\n' +
'created in the TIBET library it\'s \'lib_cfg/lib_namespaces.xml\'.\n\n' +

'The --config optional parameter is used as the name of the \'config\'\n' +
'package in the cfg package file that the new tag will be made a part of.\n' +
'If this parameter is not supplied, the default for a tag being created\n' +
'in a project is \'app_img\' and for a tag being created in the TIBET\n' +
'library is the same as the tag namespace name.\n\n' +

'The --dir optional parameter is used as the destination directory for\n' +
'the newly created source code files representing the tag. If this\n' +
'parameter is not supplied, the default for a tag being created in a\n' +
'project is \'~app_src/tags\' and for a tag being created in the TIBET\n' +
'library is \'~lib_src/{{tag_nsname}}\'.\n\n' +

'The --compiled optional flag is used to determine whether to create a\n' +
'\'templated\' tag or a \'compiled\' tag. A templated tag uses an\n' +
'external template (by default an .xhtml file) to render itself into\n' +
'an application, whereas a compiled tag overrides the \'tagCompile\'\n' +
'and manually manipulates the browser\'s DOM. The default for this\n' +
'flag is false.\n\n' +

'The --template optional parameter is used to configure the system\'s\n' +
'\'cfg\' parameter that points to this tag type\'s template. If this\n' +
'parameter is not supplied, this defaults to null as, if the tag is\n' +
'a templated (i.e. not compiled) one, the system will automatically\n' +
'associate a similarly-named .xhtml file with the tag\'s template (this\n' +
'parameter is not used for compiled tags at all). It will assume that\n' +
'this file is in the same directory as the tag\'s source .js file.\n' +
'Supply a value here if the template file you wish to use for the\n' +
'tag is in a different directory, is of a different name or is of a\n' +
'different type (i.e. a .svg file). This is highly recommended to\n' +
'use a virtual URI here (i.e. a URI with a leading \'~\').\n\n' +

'The --style optional parameter is used to determine the style sheet\n' +
'configuration for the tag. By default each tag gets a specific style\n' +
'sheet in the same directory with tag type and optional template. If\n' +
'you want no style associated you can use the special value NO_RESULT.\n' +
'Supply a value here if the tag you are defining has CSS or LESS style\n' +
'associated with it. This is highly recommended to use a virtual URI\n' +
' here (i.e. a URI with a leading \'~\').\n\n';


/*
 * The defaults for various parameters are as follows
 *
 * name             application             library
 * ----             -----------             -------
 * nsroot           'APP'                   'TP'
 * nsname           appname                 cannot default
 * tagname          cannot default          cannot default
 *
 * package          '~app_cfg/{{appname}}.xml'   '~lib_cfg/lib_namespaces.xml'
 * config           'app_img'               '<nsname>'
 * dir              '~app_src/tags'        '~lib_src/<nsname>'
 * compiled         false                   false
 * template         ''                      ''
 * style            '~app_src/tags/.'      '~lib/styles'
*/

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['compiled'],
        'string': ['package', 'config', 'dir', 'template', 'style'],
        'default': {
            compiled: false,
            template: ''
        }
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet tag [[<root>.]<namespace>:]<tagname> [--package <pkgname>] [--config <cfgname>] [--dir <dirname>] [--compiled] [--template <uri>] [--style <uri>|NO_RESULT]';


//  ---
//  Instance Methods
//  ---

/**
 * Processes the command line options and maps the proper settings into their
 * corresponding eslint command arguments.
 * @returns {Object} The options specific to running eslint.
 */
Cmd.prototype.configureOptions = function() {

    var opts,
        inProj,

        tagname,
        tnparts;

    opts = {};

    tagname = this.options._[1];    //  Command is at 0, tagname should be [1].

    //  Have to get at least one non-option argument (the tagname).
    if (!tagname) {
        return null;
    }

    if (CLI.inProject()) {
        inProj = true;
    } else {
        inProj = false;
    }

    CLI.blend(opts, this.options);

    tnparts = tagname.split(/[\.:]/g);
    switch (tnparts.length) {
        case 3:
            opts.nsroot = tnparts[0];
            opts.nsname = tnparts[1];
            opts.tagname = tnparts[2];
            break;

        case 2:
            opts.nsroot = inProj ? 'APP' : 'TP';
            opts.nsname = tnparts[0];
            opts.tagname = tnparts[1];
            break;

        case 1:
            opts.nsroot = inProj ? 'APP' : 'TP';
            if (inProj) {
                opts.nsname = this.options.appname;
            } else {
                this.error('Cannot default namespace for lib tag: ' + tagname);
                return null;
            }
            opts.tagname = tnparts[0];
            break;

        default:
            break;
    }

    //  Note that, if the original property exists on the 'this.options' object,
    //  we remove it from 'opts' (it got copied over in the 'blend' above) to
    //  avoid confusion.

    if (!(opts.pkgname = this.options.package)) {
        opts.pkgname = inProj ?
                        '~app_cfg/' + CLI.getcfg('npm.name') + '.xml' :
                        '~lib_cfg/lib_namespaces.xml';
    } else {
        delete opts.package;
    }

    if (!(opts.cfgname = this.options.config)) {
        opts.cfgname = inProj ? 'app_img' : opts.nsname;
    } else {
        delete opts.config;
    }

    if (!(opts.dirname = this.options.dir)) {
        opts.dirname = inProj ? '~app_src/tags' : '~lib_src/' + opts.nsname;
    } else {
        delete opts.dir;
    }

    //  'compiled' is default by the config machinery
    //  'template' is default by the config machinery
    //  'style' is default by the config machinery

    return opts;
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

Cmd.prototype.addXMLEntry = function(node, prefix, content, suffix) {

    var doc,
        parser,

        newElem;

    doc = node.ownerDocument;
    parser = this.getXMLParser();

    node.appendChild(doc.createTextNode(prefix));

    doc = parser.parseFromString(content, 'text/xml');
    if (!doc || CLI.isValid(doc.getElementsByTagName('parsererror')[0])) {
        this.error('Error parsing ' + content + '. Not well-formed?');
        throw new Error();
    }

    newElem = doc.documentElement;
    node.appendChild(newElem);
    newElem.ownerDocument = node.ownerDocument;

    node.appendChild(doc.createTextNode(suffix));

    return;
};

//  ---

Cmd.prototype.addXMLLiteral = function(node, text) {

    var doc;

    doc = node.ownerDocument;
    node.appendChild(doc.createTextNode(text));

    return;
};

//  ---

Cmd.prototype.readConfigData = function(pkgfile) {
    var file,
        sh,
        text,
        err;

    this.verbose('reading package file:' + pkgfile);

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

Cmd.prototype.writeConfigData = function(pkgfile, cfgdata) {

    var file,
        text;

    this.verbose('writing package file:' + pkgfile);

    file = CLI.expandPath(pkgfile);

    //  'to' is a shelljs extension to String - we're assuming that shelljs is
    //  loaded here.
    cfgdata.to(file);

    return text;
};

//  ---

Cmd.prototype.readConfigNode = function(pkgfile, cfgname) {

    var pkgtext,

        parser,
        doc,

        config,

        packageNode,
        defaultCfgName,
        defaultCfgNode;

    pkgtext = this.readConfigData(pkgfile);
    if (!pkgtext) {
        return null;
    }

    parser = this.getXMLParser();

    doc = parser.parseFromString(pkgtext);
    if (!doc || CLI.isValid(doc.getElementsByTagName('parsererror')[0])) {
        this.error('Error parsing package text. Not well-formed?');
        throw new Error();
    }

    if (!(config = doc.getElementById(cfgname))) {
        this.warn('Could not find config named: ' + cfgname +
                    ' in package file: ' + pkgfile +
                    '. Creating and adding to default config for package.');

        if (!(packageNode = doc.getElementsByTagName('package')[0])) {
            this.error('Malformed config file.' +
                        ' Cannot find top-level "package" element in: ' +
                        pkgfile);
            return null;
        }

        defaultCfgName = packageNode.getAttribute('default');
        if (!defaultCfgName || defaultCfgName === '') {
            this.error('Cannot find the "default" config attribute on the' +
                        ' top-level "package" element in: ' + pkgfile);
            return null;
        }

        if (!(defaultCfgNode = doc.getElementById(defaultCfgName))) {
            this.error('Cannot find "config" element for config named: ' +
                        defaultCfgName);
            return null;
        }

        this.addXMLEntry(
                defaultCfgNode,
                '    ',
                '<config ref="' + cfgname + '"/>',
                '\n');

        this.addXMLEntry(
                packageNode,
                '',
                '<config id="' + cfgname + '"/>',
                '\n\n');

        if (!(config = doc.getElementById(cfgname))) {
            this.error('Cannot find "config" element for config named: ' +
                        defaultCfgName + ' after attempting to create it.');
            return null;
        }
    }

    return config;
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

Cmd.prototype.writeConfigNode = function(pkgfile, config) {

    var str;

    str = this.serializeNode(config.ownerDocument);

    this.writeConfigData(pkgfile, str);
};

//  ---

Cmd.prototype.updateConfigFile = function(opts) {

    var cfgNode,
        fqtagname;

    cfgNode = this.readConfigNode(opts.pkgname, opts.cfgname);

    if (!cfgNode) {
        return null;
    }

    fqtagname = opts.nsroot + '.' + opts.nsname + '.' + opts.tagname;

    this.addXMLEntry(
            cfgNode,
            '\n    ',
            '<script src="' + opts.dirname + '/' + fqtagname + '.js"/>',
            '');

    if (opts.style) {
        this.addXMLEntry(
            cfgNode,
            '\n    ',
            '<property name="path.' + fqtagname + '.style"' +
                        ' value="' + opts.style + '"/>',
            '');
    }

    if (opts.template) {
        this.addXMLEntry(
            cfgNode,
            '\n    ',
            '<property name="path.' + fqtagname + '.template"' +
                        ' value="' + opts.template + '"/>',
            '');
    }

    this.addXMLLiteral(cfgNode, '\n');

    this.writeConfigNode(opts.pkgname, cfgNode);

    return true;
};

/**
 * Runs the specific command in question.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var fs,         // The file system module.
        hb,         // The handlebars module. Used to inject data in dna files.
        find,       // The findit module. Used to traverse and process files.
        path,       // The path utilities module.
        sh,         // The shelljs module. Used for cloning dna etc.
        cmd,        // Closure'd variable for this references.

        appname,    // The application name we're adding the tag to.

        opts,

        code,       // Result code. Set if an error occurs in nested callbacks.
        src,        // The directory to the tag template we're using.
        err,        // Error string returned by shelljs.error() test function.
        finder,     // The find event emitter we'll handle find events on.
        target,     // The target directory name (based on appname).

        oldFile,
        newFile;

    cmd = this;

    if (CLI.inProject()) {
        //  Compute the appname first - it is used when configuring our opts, etc.
        appname = CLI.expandPath('~app');
        appname = appname.slice(appname.lastIndexOf('/') + 1);
        //console.log('appname: ' + appname);
    } else {
        //  outside of a project, appname means nothing.
        appname = null;
    }

    this.options.appname = appname;

    //  Compute opts based on the supplied options (stored in this.options) and
    //  intelligent defaults depending on whether we're in an app or a lib.
    opts = this.configureOptions();
    if (!opts) {
        return 1;
    }
    //console.log('options: ' + JSON.stringify(opts));

    //  ---
    //  Update the cfg file based on the computed opts
    //  ---

    if (!this.updateConfigFile(opts)) {
        return 1;
    }

    //  ---
    //  Clone to the target directory.
    //  ---

    fs = require('fs');
    path = require('path');
    sh = require('shelljs');

    if (opts.compiled) {
        src = path.join(module.filename, this.COMPILED_TAG_ROOT);
    } else {
        src = path.join(module.filename, this.TEMPLATED_TAG_ROOT);
    }
    //console.log('source directory: ' + src);

    target = CLI.expandPath(opts.dirname);
    //console.log('destination directory: ' + target);

    if (!fs.existsSync(target)) {
        sh.mkdir(target);
        err = sh.error();
        if (err) {
            this.error('Error creating target directory: ' + err);
            return 1;
        }
    }

    //  NOTE: a trailing slash says to copy source content, not source directory.
    sh.cp('-r', src + '/', target);
    err = sh.error();
    if (err) {
        this.error('Error cloning tag source files: ' + err);
        return 1;
    }

    //  ---
    //  Process templated content to inject appname.
    //  ---

    find = require('findit');
    hb = require('handlebars');

    finder = find(target);
    code = 0;

    finder.on('file', function(file) {

        var content,  // File content after template injection.
            data,     // File data.
            template; // The compiled template content.

        if (/__nsroot__/.test(file)) {

            cmd.verbose('Processing file: ' + file);
            if (opts.style && path.extname(file) === '.css') {
                cmd.verbose('Removing unused style: ' + file);
                sh.rm('-f', file);
                return;
            }

            try {
                data = fs.readFileSync(file, {encoding: 'utf8'});
                if (!data) {
                    throw new Error('Empty');
                }
            } catch (e) {
                cmd.error('Error reading ' + file + ': ' + e.message);
                code = 1;
                return;
            }

            try {
                template = hb.compile(data);
                if (!template) {
                    throw new Error('InvalidTemplate');
                }
            } catch (e) {
                cmd.error('Error compiling template ' + file + ': ' +
                    e.message);
                code = 1;
                return;
            }

            try {
                content = template(opts);
                if (!content) {
                    throw new Error('InvalidContent');
                }
            } catch (e) {
                cmd.error('Error injecting template data in ' + file +
                    ': ' + e.message);
                code = 1;
                return;
            }

            if (data === content) {
                cmd.verbose('Ignoring static file: ' + file);
            } else {
                cmd.verbose('Updating file: ' + file);
                try {
                    fs.writeFileSync(file, content);
                } catch (e) {
                    cmd.error('Error writing file ' + file + ': ' + e.message);
                    code = 1;
                    return;
                }
            }
        }

        // Rename the file if it also has a name which matches our
        // appname that's templated.
        try {

            oldFile = file;

            if (/__nsroot__/.test(oldFile)) {
                newFile = oldFile.replace(/__nsroot__/g, opts.nsroot);
                sh.mv(oldFile, newFile);
                oldFile = newFile;
            }
            if (/__nsname__/.test(oldFile)) {
                newFile = oldFile.replace(/__nsname__/g, opts.nsname);
                sh.mv(oldFile, newFile);
                oldFile = newFile;
            }
            if (/__tagname__/.test(oldFile)) {
                newFile = oldFile.replace(/__tagname__/g, opts.tagname);
                sh.mv(oldFile, newFile);
                oldFile = newFile;
            }
        } catch (e) {
            cmd.error('Error renaming template ' + file + ': ' + e.message);
            code = 1;
            return;
        }
    });

    finder.on('end', function() {
        if (code === 0) {
            cmd.info('New TIBET tag: \'' +
                (opts.nsroot + '.' + opts.nsname + '.' + opts.tagname) +
                '\' added to project: \'' + appname + '\'.');
        }
    });
};

module.exports = Cmd;

}());
