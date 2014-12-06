/**
 * @overview TIBET platform makefile. Key targets here focus on packaging the
 *     various portions of the platform for inclusion in TIBET applications.
 * @author Scott Shattuck (ss), William J. Edney (wje)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     source code privacy waivers to keep your TIBET-based source code private.
 */

(function() {

'use strict';

var sh,
    path,
    nodecli,
    helpers,
    targets;

sh = require('shelljs');
path = require('path');
nodecli = require('shelljs-nodecli');
helpers = require('./src/tibet/cli/_make_helpers');

//  ---
//  targets
//  ---

/**
 * Canonical `targets` object for exporting the various target functions.
 */
targets = {};

/**
 */
targets.build = function(make) {
    make.log('building tibet...');

    if (!sh.test('-d', './lib/src')) {
        sh.mkdir('./lib/src');
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
    make.log('building all packages...');

    if (!sh.test('-d', './lib/src')) {
        sh.mkdir('./lib/src');
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
targets.build_all.timeout = 60000;  // Task-specific timout.

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
    make.log('removing build artifacts...');

    if (sh.test('-d', './lib/src')) {
        sh.rm('-rf', './lib/src/*');
    }

    targets.clean.resolve();
};

// ---
// Externals
// ---

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
        targets.rollup_d3).then(
        targets.rollup_diff).then(
        targets.rollup_forge).then(
        targets.rollup_jquery).then(
        targets.rollup_pouchdb).then(
        targets.rollup_q).then(
        targets.rollup_sinon).then(
        targets.rollup_syn).then(
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
targets.rollup_pouchdb = function(make) {
    var npmdir;

    sh.exec('npm update pouchdb');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'pouchdb'));
    sh.exec('npm install -d');
    sh.exec('cp -f dist/pouchdb.js ../../deps/pouchdb-tpi.js');
    sh.exec('cp -f dist/pouchdb.min.js ../../deps/pouchdb-tpi.min.js');

    targets.rollup_pouchdb.resolve();
};

/**
 */
targets.rollup_q = function(make) {
    var npmdir;

    sh.exec('npm update q');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'q'));
    sh.exec('npm install -d');
    sh.exec('cp -f q.js  ../../deps/q-tpi.js');
    sh.exec('cp -f q.min.js  ../../deps/q-tpi.min.js');

    targets.rollup_q.resolve();
};

/**
 */
targets.rollup_sinon = function(make) {
    var npmdir;

    sh.exec('npm update sinon');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'sinon'));
    sh.exec('npm install -d');
    sh.exec('./build');
    sh.exec('cp -f ./pkg/sinon.js ../../deps/sinon-tpi.js');

    targets.rollup_sinon.resolve();
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
targets.rollup_xpath = function(make) {
    var npmdir;

    sh.exec('npm update xpath');

    npmdir = path.join(__dirname, 'node_modules');
    sh.cd(path.join(npmdir, 'xpath'));
    sh.exec('cp -f xpath.js ../../deps/xpath-tpi.js');

    targets.rollup_xpath.resolve();
};

//  ---
//  TIBET
//  ---

/**
 */
targets.build_tibet = function(make) {
    make.log('building TIBET packages...');

    if (!sh.test('-d', './lib/src')) {
        sh.mkdir('./lib/src');
    }

    targets.rollup_init().then(
        targets.rollup_hook).then(
        targets.rollup_base).then(
        targets.rollup_full).then(
        targets.rollup_developer).then(
        function() {
            targets.build_tibet.resolve();
        },
        function() {
            targets.build_tibet.reject();
        });
};

/**
 * NOTE that if you change the 'init' here so the final file name changes
 * from tibet_init you need to update tibet_cfg.js to have the new value for
 * the 'tibetinit' flag. Also adjust the offset if the file target moves.
 */
targets.rollup_init = function(make) {
    helpers.rollup(make, {
        pkg: '~lib_cfg/TIBET.xml',
        config: 'init',
        dir: './lib/src',
        prefix: 'tibet_',
        headers: false,
        minify: false,
        zip: true
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'init',
            dir: './lib/src',
            prefix: 'tibet_',
            headers: false,
            minify: true,
            zip: true
        });
    }).then(
    function() {
        targets.rollup_init.resolve();
    },
    function() {
        targets.rollup_init.reject();
    });
};

/**
 */
targets.rollup_hook = function(make) {
    helpers.rollup(make, {
        pkg: '~lib_cfg/TIBET.xml',
        config: 'hook',
        dir: './lib/src',
        prefix: 'tibet_',
        headers: false,
        minify: false,
        zip: true
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'hook',
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
 */
targets.rollup_base = function(make) {
    helpers.rollup(make, {
        pkg: '~lib_cfg/TIBET.xml',
        config: 'base',
        dir: './lib/src',
        prefix: 'tibet_',
        headers: false,
        minify: false,
        zip: true
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'base',
            dir: './lib/src',
            prefix: 'tibet_',
            headers: false,
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
        dir: './lib/src',
        prefix: 'tibet_',
        headers: false,
        minify: false,
        zip: true
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'developer',
            dir: './lib/src',
            prefix: 'tibet_',
            headers: false,
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
        dir: './lib/src',
        prefix: 'tibet_',
        headers: false,
        minify: false,
        zip: true
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'full',
            dir: './lib/src',
            prefix: 'tibet_',
            headers: false,
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
targets.test_cli = function(make) {
    var result;

    make.log('starting mocha...');
    result = nodecli.exec('mocha', '--ui bdd', '--reporter dot',
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

//  ---
//  Export
//  ---

module.exports = targets;

}());
