/**
 * @overview TIBET platform "makefile". Targets here focus on packaging the
 *     various portions of the platform for inclusion in TIBET applications.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     source code privacy waivers to keep your TIBET-based source code private.
 */

/*eslint indent:0*/

(function() {

'use strict';

var hb,
    sh,
    path,
    nodecli,
    helpers,
    targets;

hb = require('handlebars');
sh = require('shelljs');
path = require('path');
nodecli = require('shelljs-nodecli');
helpers = require('./src/tibet/cli/_make_helpers');

//  ---
//  'build' targets
//  ---

/**
 * Canonical `targets` object for exporting the various target functions.
 */
targets = {};

/**
 */
targets.build = function(make) {
    var CLI,
        fullpath;

    make.log('building tibet...');

    CLI = make.CLI;
    fullpath = path.join(CLI.expandPath('~'), 'lib', 'src');
    if (!sh.test('-d', fullpath)) {
        sh.mkdir(fullpath);
    }

    targets.clean().then(
    targets.build_tibet).then(
    function() {
        targets.build.resolve();
    },
    function() {
        targets.build.reject();
    });
};

/**
 */
targets.build_all = function(make) {
    var CLI,
        fullpath;

    make.log('building all packages...');

    CLI = make.CLI;
    fullpath = path.join(CLI.expandPath('~'), 'lib', 'src');
    if (!sh.test('-d', fullpath)) {
        sh.mkdir(fullpath);
    }

    targets.clean().then(
    targets.build_deps).then(
    targets.build_tibet).then(
    function() {
        targets.build_all.resolve();
    },
    function() {
        targets.build_all.reject();
    });
};
targets.build_all.timeout = 900000;  // Task-specific timout.

/**
 */
targets.build_deps = function(make) {

    make.log('building dependency packages...');

    if (!sh.test('-d', './lib/src')) {
        sh.mkdir('./lib/src');
    }

    if (!sh.which('grunt')) {
        make.error('Building dependencies requires npm install -g grunt-cli.');
        targets.build_deps.reject();
        return;
    }

    targets.rollup_codemirror().then(
    targets.rollup_bluebird).then(
    targets.rollup_d3).then(
    targets.rollup_diff).then(
    targets.rollup_forge).then(
    targets.rollup_jjv).then(
    targets.rollup_jsdiff).then(
    targets.rollup_jquery).then(
    targets.rollup_jxon).then(
    targets.rollup_less).then(
    targets.rollup_pouchdb).then(
    targets.rollup_sinon).then(
    targets.rollup_sprintf).then(
    targets.rollup_syn).then(
    targets.rollup_jqueryxpath).then(
    targets.rollup_xpath).then(
    function() {
        targets.build_deps.resolve();
    },
    function() {
        targets.build_deps.reject();
    });
};

/**
 */
targets.build_docs = function(make) {

    make.log('building TIBET documentation...');

    targets.clean_docs().then(
    function() {
        var CLI,
            content,
            footer,
            genHtml,
            genMan,
            header,
            htmlpath,
            index,
            indexbody,
            indexpath,
            list,
            params,
            splitter,
            manpath,
            rootpath,
            srcpath,
            version,
            year;

        CLI = make.CLI;

        //  ---
        //  Verify Directories
        //  ---

        make.log('generating current documentation...');

        rootpath = path.join(CLI.expandPath('~'), 'doc');
        srcpath = path.join(rootpath, 'markdown');

        if (!sh.test('-d', srcpath)) {
            targets.build_docs.reject('Unable to find doc source directory.');
            return;
        }

        htmlpath = path.join(rootpath, 'html');
        if (!sh.test('-d', htmlpath)) {
            sh.mkdir(htmlpath);
        }

        manpath = path.join(rootpath, 'man');
        if (!sh.test('-d', manpath)) {
            sh.mkdir(manpath);
        }

        //  HTML generation uses common header/footer since output from the
        //  conversion process doesn't include html/body, just "content".
        header = sh.cat(path.join(rootpath, 'template', 'header.html'));
        header = hb.compile(header);
        footer = sh.cat(path.join(rootpath, 'template', 'footer.html'));
        footer = hb.compile(footer);

        //  ---
        //  Helpers
        //  ---

        genHtml = function(file, params) {
            var content,
                destdir,
                destfile,
                head,
                foot,
                result,
                srcfile;

            srcfile = path.join(srcpath, file + '.tmp');

            //  Compute the HTML target file path, removing .md extension.
            destfile = path.join(htmlpath, file);
            destfile = destfile.slice(0, destfile.lastIndexOf('.')) + '.html';

            //  Compute target directory value and make sure it exists.
            destdir = destfile.slice(0, destfile.lastIndexOf('/'));
            if (!sh.test('-d', destdir)) {
                sh.mkdir(destdir);
            }

            result = nodecli.exec('marked-man', '--breaks', '--format html',
                srcfile, {silent: true});

            if (result.code !== 0) {
                //  TODO:   oops
                return;
            }

            content = header(params) + result.output + footer(params);

            //  One last substitution is to look for variations on 'foo(n)'
            //  and convert them into links which point to the target page.
            content = content.replace(/([-_a-zA-Z]+)\((\d+)\)/g,
            function(match, topic, section) {
                if (topic === params.topic) {
                    return match;
                }

                return '<a class="crossref" href="./' + topic + '.' +
                    section + '.html">' + topic + '(' + section + ')' + '</a>';
            });

            content.to(destfile);
        };

        genMan = function(file, params) {
            var content,
                destdir,
                destfile,
                result,
                srcfile,
                template;

            srcfile = path.join(srcpath, file + '.tmp');

            //  Compute the manpage target file path, removing .md extension.
            destfile = path.join(manpath, 'man' + params.section, file);
            destfile = destfile.slice(0, destfile.lastIndexOf('.'));

            //  Compute target directory value and make sure it exists.
            destdir = path.join(manpath, 'man' + params.section);
            if (!sh.test('-d', destdir)) {
                sh.mkdir(destdir);
            }

            result = nodecli.exec('marked-man', '--breaks', '--roff',
                srcfile, {silent: true});

            if (result.code !== 0) {
                //  TODO:   oops
                return;
            }

            content = result.output;
            content.to(destfile);
        };

        //  ---
        //  Process Files
        //  ---

        //  File names in markdown directory should be of the form
        //  topic.section.md so we can extract and splice.
        splitter = /^(.*)\.(\d)\.md$/;

        //  We splice in year and version for copyright etc. so capture once.
        year = new Date().getFullYear();
        version = CLI.cfg('tibet.version');

        //  Create an array we can keep the list of content in.
        index = [];

        //  Markdown directory should be flat but just in case do a recursive
        //  listing. We'll filter out directories in the loop.
        list = sh.ls('-R', srcpath);

        //  Process each file, producing both a man page and HTML document.
        list.forEach(function(file) {
            var parts,
                section,
                srcfile,
                template,
                tempfile,
                topic;

            //  Skip directories, just process individual files.
            srcfile = path.join(srcpath, file);
            if (sh.test('-d', srcfile)) {
                return;
            }

            //  Pull file name apart. Should be topic.section.md.
            parts = splitter.exec(file);
            if (!parts) {
                make.warn('Filename ' + file + ' missing topic or section.');
                return;
            }
            topic = parts[1];
            section = parts[2];

            params = {
                topic: topic,
                section: section,
                version: version,
                year: year
            };

            try {
                tempfile = srcfile + '.tmp';
                content = sh.cat(srcfile);
                template = hb.compile(content);
                content = template(params);
                content.to(tempfile);

                //  NOTE this depends on first line being the # {{topic}} line.
                params.firstline = content.split('\n')[0];
                index.push(JSON.parse(JSON.stringify(params)));

                genMan(file, params);
                genHtml(file, params);
            } catch (e) {
                make.error('Error processing ' + file + ': ' + e.message);
            } finally {
                sh.rm('-f', tempfile);
            }
        });

        //  ---
        //  index.html
        //  ---

        indexpath = path.join(htmlpath, 'index.html');

        params = {
            topic: 'TIBET',
            section: 1,
            version: version,
            year: year
        };

        //  Sort alphabetically within sections.
        index.sort(function(paramA, paramB) {
            if (paramA.section < paramB.section) {
                return -1;
            } else if (paramA.section > paramB.section) {
                return 1;
            } else {
                if (paramA.topic < paramB.topic) {
                    return -1;
                } else if (paramA.topic > paramB.topic) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });

        //  Convert param form into markup. We use a DL to wrap below so we want
        //  each item returned here to be a dt/dd pair with a link to topic.
        indexbody = index.map(function(params) {
            var parts,
                str;

            parts = params.firstline.split('--');
            str = '<dt><a class="toc" href="./' +
                params.topic + '.' + params.section + '.html">' +
                parts[0] + '</a></dt><dd>-- ' + parts[1] + '</dd>';

            return str;
        });

        //  Assemble the final index.html page content by using the same
        //  header/footer as all other pages and our indexbody for content.
        (header(params) +
         '<dl class="toc">\n' +
         indexbody.join('<br/>') +
         '</dl>\n' +
         footer(params)).to(
            indexpath);

        //  ---
        //  manpage index
        //  ---

        //  TODO

        //  ---
        //  Wrapup
        //  ---

        targets.build_docs.resolve();

        return;
    }).catch(function(err) {
        targets.build_docs.reject(err);
    });

    return;
};

/**
 */
targets.build_tibet = function(make) {
    make.log('building TIBET packages...');

    if (!sh.test('-d', './lib/src')) {
        sh.mkdir('./lib/src');
    }

    targets.rollup_loader().then(
    targets.rollup_hook).then(
    targets.rollup_login).then(
    targets.rollup_base).then(
    targets.rollup_full).then(
    targets.rollup_developer).then(
    targets.build_docs).then(
    function() {
        targets.build_tibet.resolve();
    },
    function() {
        targets.build_tibet.reject();
    });
};

// ---
// 'rollups' (external dependencies)
// ---

/**
 */
targets.rollup_bluebird = function(make) {
    var npmdir;

    sh.exec('npm update bluebird');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'bluebird'));

    sh.exec('cp -f js/browser/bluebird.js  ../../deps/bluebird-tpi.js');
    sh.exec('cp -f js/browser/bluebird.min.js  ../../deps/bluebird-tpi.min.js');

    targets.rollup_bluebird.resolve();
};

/**
 */
targets.rollup_codemirror = function(make) {
    var npmdir;

    sh.exec('npm update codemirror');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'codemirror'));
    sh.exec('npm install -d');

    sh.exec('mkdir ../../deps/codemirror');
    sh.exec('cp -f -R lib ../../deps/codemirror/');

    sh.exec('mkdir ../../deps/codemirror/mode');
    sh.exec('cp -f -R mode/javascript ../../deps/codemirror/mode');
    sh.exec('cp -f -R mode/xml ../../deps/codemirror/mode');
    sh.exec('cp -f -R mode/css ../../deps/codemirror/mode');

    sh.exec('mkdir ../../deps/codemirror/addon');

    sh.exec('mkdir ../../deps/codemirror/addon/search');
    sh.exec('cp -f -R addon/search/searchcursor.js ' +
            '../../deps/codemirror/addon/search');

    sh.exec('mkdir ../../deps/codemirror/addon/runmode');
    sh.exec('cp -f -R addon/runmode/runmode.js ' +
            '../../deps/codemirror/addon/runmode');

    sh.exec('mkdir ../../deps/codemirror/addon/hint');
    sh.exec('cp -f -R addon/hint/show-hint.js ' +
            '../../deps/codemirror/addon/hint');
    sh.exec('cp -f -R addon/hint/show-hint.css ' +
            '../../deps/codemirror/addon/hint');

    targets.rollup_codemirror.resolve();
};

/**
 */
targets.rollup_d3 = function(make) {
    var npmdir;

    sh.exec('npm update d3');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'd3'));
    sh.exec('npm install -d');
    sh.exec('make');
    sh.exec('cp -f d3.js ../../deps/d3-tpi.js');
    sh.exec('cp -f d3.min.js ../../deps/d3-tpi.min.js');

    targets.rollup_d3.resolve();
};

/**
 */
targets.rollup_diff = function(make) {
    var npmdir;

    sh.exec('npm update diff');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'diff'));
    sh.exec('cp -f diff.js  ../../deps/diff-tpi.js');

    targets.rollup_diff.resolve();
};

/**
 */
targets.rollup_forge = function(make) {
    var npmdir;

    sh.exec('npm update forge');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'node-forge'));
    sh.exec('npm install -d');
    sh.exec('npm run minify');
    sh.exec('cp -f js/forge.min.js ../../deps/forge-tpi.min.js');

    targets.rollup_forge.resolve();
};

/**
 */
targets.rollup_jjv = function(make) {
    var npmdir;

    sh.exec('npm update jjv');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'jjv'));
    sh.exec('npm install -d');
    sh.exec('cp -f lib/jjv.js  ../../deps/jjv-tpi.js');
    sh.exec('cp -f build/jjv.min.js  ../../deps/jjv-tpi.min.js');

    targets.rollup_jjv.resolve();
};

/**
 */
targets.rollup_jsdiff = function(make) {
    var npmdir;

    sh.exec('npm update jsdiff');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'diff'));
    sh.exec('npm install -d');
    sh.exec('cp -f diff.js  ../../deps/diff-tpi.js');

    targets.rollup_jsdiff.resolve();
};

/**
 */
targets.rollup_jquery = function(make) {
    var npmdir;

    sh.exec('npm update jquery');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'jquery'));

    // TODO: build and copy jquery build output to the proper location(s)

    targets.rollup_jquery.resolve();
};

/**
 */
targets.rollup_jxon = function(make) {
    var npmdir;

    sh.exec('npm update jxon');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'jxon'));
    sh.exec('npm install -d');
    sh.exec('cp -f index.js  ../../deps/jxon-tpi.js');

    targets.rollup_jxon.resolve();
};

/**
 */
targets.rollup_less = function(make) {
    var npmdir;

    sh.exec('npm update less');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'less'));

    sh.exec('cp -f dist/less.js  ../../deps/less-tpi.js');
    sh.exec('cp -f dist/less.min.js  ../../deps/less-tpi.min.js');

    targets.rollup_less.resolve();
};

/**
 */
targets.rollup_pouchdb = function(make) {
    var npmdir;

    sh.exec('npm update pouchdb');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'pouchdb'));
    sh.exec('npm install -d');
    sh.exec('cp -f dist/pouchdb.js ../../deps/pouchdb-tpi.js');
    sh.exec('cp -f dist/pouchdb.min.js ../../deps/pouchdb-tpi.min.js');

    //  The PouchDB '_all_dbs' plugin

    sh.cd(path.join(npmdir, 'pouchdb'));

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'pouchdb-all-dbs'));
    sh.exec('npm install -d');
    sh.exec('cp -f dist/pouchdb.all-dbs.js ../../deps/pouchdb.all-dbs-tpi.js');
    sh.exec('cp -f dist/pouchdb.all-dbs.min.js ../../deps/pouchdb.all-dbs-tpi.min.js');

    targets.rollup_pouchdb.resolve();
};

/**
 */
targets.rollup_sinon = function(make) {
    var npmdir;

    sh.exec('npm update sinon');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'sinon'));
    sh.exec('npm install -d');
    sh.exec('cp -f ./pkg/sinon.js ../../deps/sinon-tpi.js');

    targets.rollup_sinon.resolve();
};

/**
 */
targets.rollup_sprintf = function(make) {
    var npmdir;

    sh.exec('npm update sprintf.js');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'sprintf-js'));
    sh.exec('npm install -d');
    sh.exec('grunt uglify');
    sh.exec('cp -f ./src/sprintf.js ../../deps/sprintf-tpi.js');
    sh.exec('cp -f ./dist/sprintf.min.js ../../deps/sprintf-tpi.min.js');

    //  (ss) commented out. Devtools lies about initiator when map file is
    //  present saying code loaded because of sprintf. Yeah right. 404 is less
    //  of an issue than failing to let you see the true source of file loads.
    //
    //  NOTE we copy the map file since it'll 404 on us otherwise. And don't use
    //  tpi in the name, the lookup ends up explicit to the original name.
    //sh.exec('cp -f ./dist/sprintf.min.js.map ../../deps/sprintf.min.js.map');
    //sh.exec('cp -f ./dist/sprintf.min.js.map ../../lib/src/sprintf.min.js.map');

    targets.rollup_sprintf.resolve();
};

/**
 */
targets.rollup_syn = function(make) {
    var npmdir;

    sh.exec('npm update syn');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'syn'));
    sh.exec('npm install -d');
    sh.exec('grunt build');
    sh.exec('cp -f ./dist/syn.js ../../deps/syn-tpi.js');
    sh.exec('cp -f ./dist/syn.min.js ../../deps/syn-tpi.min.js');

    targets.rollup_syn.resolve();
};

/**
 */
targets.rollup_jqueryxpath = function(make) {
    var npmdir;

    sh.exec('npm update jquery-xpath');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'jquery-xpath'));
    sh.exec('cp -f ./jquery.xpath.js ../../deps/jquery.xpath-tpi.js');
    sh.exec('cp -f ./jquery.xpath.min.js ../../deps/jquery.xpath-tpi.min.js');

    targets.rollup_jqueryxpath.resolve();
};

/**
 */
targets.rollup_xpath = function(make) {
    var npmdir;

    sh.exec('npm update xpath');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'xpath'));
    sh.exec('cp -f xpath.js ../../deps/xpath-tpi.js');

    targets.rollup_xpath.resolve();
};

// ---
// 'rollups' (TIBET)
// ---

/**
 */
targets.rollup_base = function(make) {
    helpers.rollup(make, {
        pkg: '~lib_cfg/TIBET.xml',
        config: 'base',
        phase: 'one',
        dir: './lib/src',
        prefix: 'tibet_',
        headers: true,
        minify: false,
        zip: true
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'base',
            phase: 'one',
            dir: './lib/src',
            prefix: 'tibet_',
            headers: true,
            minify: true,
            zip: true
        });
    }).then(
    function() {
        targets.rollup_base.resolve();
    },
    function() {
        targets.rollup_base.reject();
    });
};

/**
 */
targets.rollup_developer = function(make) {
    helpers.rollup(make, {
        pkg: '~lib_cfg/TIBET.xml',
        config: 'developer',
        phase: 'one',
        dir: './lib/src',
        prefix: 'tibet_',
        headers: true,
        minify: false,
        zip: true
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'developer',
            phase: 'one',
            dir: './lib/src',
            prefix: 'tibet_',
            headers: true,
            minify: true,
            zip: true
        });
    }).then(
    function() {
        targets.rollup_developer.resolve();
    },
    function() {
        targets.rollup_developer.reject();
    });
};

/**
 */
targets.rollup_full = function(make) {
    helpers.rollup(make, {
        pkg: '~lib_cfg/TIBET.xml',
        config: 'full',
        phase: 'one',
        dir: './lib/src',
        prefix: 'tibet_',
        headers: true,
        minify: false,
        zip: true
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'full',
            phase: 'one',
            dir: './lib/src',
            prefix: 'tibet_',
            headers: true,
            minify: true,
            zip: true
        });
    }).then(
    function() {
        targets.rollup_full.resolve();
    },
    function() {
        targets.rollup_full.reject();
    });
};

/**
 */
targets.rollup_hook = function(make) {
    helpers.rollup(make, {
        pkg: '~lib_cfg/TIBET.xml',
        config: 'hook',
        phase: 'one',
        dir: './lib/src',
        prefix: 'tibet_',
        headers: false,
        minify: false,
        zip: true
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'hook',
            phase: 'one',
            dir: './lib/src',
            prefix: 'tibet_',
            headers: false,
            minify: true,
            zip: true
        });
    }).then(
    function() {
        targets.rollup_hook.resolve();
    },
    function() {
        targets.rollup_hook.reject();
    });
};

/**
 * NOTE that if you change the 'loader' here so the final file name changes
 * from tibet_loader you need to update tibet_cfg.js to have the new value for
 * 'boot.tibet_loader'. Also adjust the offset if the file target moves.
 */
targets.rollup_loader = function(make) {
    var date,
        ts;

    date = new Date();
    ts = '' + date.getUTCFullYear() +
        ('0' + (date.getUTCMonth() + 1)).slice(-2) +
        ('0' + date.getUTCDate()).slice(-2);

    helpers.template(make, {
        source: '~lib_boot/tibet_loader_pre_template.js',
        target: '~lib_boot/tibet_loader_pre.js',
        data: {version: ts}
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'loader',
            phase: 'one',
            dir: './lib/src',
            prefix: 'tibet_',
            headers: false,
            minify: false,
            zip: true
        });
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'loader',
            phase: 'one',
            dir: './lib/src',
            prefix: 'tibet_',
            headers: false,
            minify: true,
            zip: true
        });
    }).then(
    function() {
        targets.rollup_loader.resolve();
    },
    function() {
        targets.rollup_loader.reject();
    });
};

/**
 */
targets.rollup_login = function(make) {
    helpers.rollup(make, {
        pkg: '~lib_cfg/TIBET.xml',
        config: 'login',
        phase: 'one',
        dir: './lib/src',
        prefix: 'tibet_',
        headers: false,
        minify: false,
        zip: true
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'login',
            phase: 'one',
            dir: './lib/src',
            prefix: 'tibet_',
            headers: false,
            minify: true,
            zip: true
        });
    }).then(
    function() {
        targets.rollup_login.resolve();
    },
    function() {
        targets.rollup_login.reject();
    });
};

//  ---
//  'task' targets
//  ---

/**
 * Run lint and test commands to verify the code is in good shape.
 */
targets.checkup = function(make) {
    var result;

    make.log('checking for lint...');

    result = sh.exec('tibet lint');
    if (result.code !== 0) {
        targets.checkup.reject();
        return;
    }

    make.log('running unit tests...');

    result = sh.exec('tibet test');
    if (result.code !== 0) {
        targets.checkup.reject();
        return;
    }

    targets.checkup.resolve();
};

/**
 */
targets.clean = function(make) {
    var CLI,
        fullpath;

    make.log('removing build artifacts...');

    targets.clean_docs().then(
    function() {
        CLI = make.CLI;

        fullpath = path.join(CLI.expandPath('~'), 'lib', 'src');
        if (sh.test('-d', fullpath)) {
            sh.rm('-rf', path.join(fullpath, '*'));
        }
    }).then(
    function() {
        targets.clean.resolve();
    },
    function() {
        targets.clean.reject();
    });
};

/**
 */
targets.clean_docs = function(make) {
    var CLI,
        fullpath;

    make.log('removing generated documentation...');

    CLI = make.CLI;

    fullpath = path.join(CLI.expandPath('~'), 'doc', 'html');
    if (sh.test('-d', fullpath)) {
        sh.rm('-rf', path.join(fullpath, '*'));
    }

    fullpath = path.join(CLI.expandPath('~'), 'doc', 'man');
    if (sh.test('-d', fullpath)) {
        sh.rm('-rf', path.join(fullpath, '*'));
    }

    targets.clean_docs.resolve();
};

//  ---
//  'tests'
//  ---

/**
 */
targets.test_cli = function(make) {
    var result;

    make.log('starting mocha...');
    result = nodecli.exec('mocha', '--ui bdd', '--reporter spec',
            './test/mocha/cli_test.js');

    if (result.code !== 0) {
        targets.test_cli.reject();
        return;
    }

    try {
        targets.test_cli.resolve();
    } catch (e) {
        targets.test_cli.reject(e);
    }
};

module.exports = targets;

}());
