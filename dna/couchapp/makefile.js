/**
 * @overview TIBET + CouchDB makefile.js
 */

(function() {

'use strict';

var sh = require('shelljs');
var nodecli = require('shelljs-nodecli');
var helpers = require('tibet/src/tibet/cli/_make_helpers');

// Uncomment to run node_modules-based utilities via shelljs.
// var nodeCLI = require('shelljs-nodecli');

// Uncomment to include TIBET's make helper routines for rollups.
// var helpers = require('tibet/src/tibet/cli/_make_helpers');


/**
 * A helper function to handle prompting the user for common database
 * parameters. The make parameter should be provided to grant access to the
 * currently running task object.
 * @param {Object} make The make command instance.
 * @return {Object} An object containing db_url and db_name keys.
 */
var getDatabaseParameters = function(make) {
    var db_url;
    var db_name;
    var result;

    if (!make) {
        throw new Error('Invalid call to helper function. No task provided.');
    }

    db_url = 'http://0.0.0.0:5984';
    db_name = make.getProjectName();

    result = make.prompt.question('Database url [' + db_url + '] ? ');
    if (result && result.length > 0) {
        db_url = result;
    }
    make.log('using database url \'' + db_url + '\'.');

    result = make.prompt.question('Database name [' + db_name + '] ? ');
    if (result && result.length > 0) {
        db_name = result;
    }

    return {db_url: db_url, db_name: db_name};
};

/**
 * Canonical `targets` object for exporting the various target functions.
 */
var targets = {};

/**
 */
targets.build = function(make) {
    make.log('building app...');

    targets.clean().then(
        targets.rollup).then(
        function() {
            targets.build.resolve();
        },
        function() {
            targets.build.reject();
        });
};

/**
 */
targets.clean = function(make) {
    make.log('cleaning...');

    if (sh.test('-d', './build')) {
        sh.rm('-rf', './build/*');
    }

    targets.clean.resolve();
};

/**
 */
targets.rollup = function(make) {
    make.log('rolling up assets...');

    if (!sh.test('-d', './build')) {
        sh.mkdir('./build');
    }

    helpers.rollup(make, {
        pkg: '~app_cfg/app.xml',
        config: 'base',
        dir: './build',
        prefix: 'app_',
        headers: true,
        minify: false,
        promise: targets.rollup
    });

    helpers.rollup(make, {
        pkg: '~app_cfg/app.xml',
        config: 'base',
        dir: './build',
        prefix: 'app_',
        headers: true,
        minify: true,
        promise: targets.rollup
    });
};

/**
 * Create a new CouchDB database.
 */
targets.createdb = function(make) {
    var params;
    var db_url;
    var db_name;
    var nano;

    params = getDatabaseParameters(make);
    db_url = params.db_url;
    db_name = params.db_name;

    make.log('creating database: ' + db_url + '/' + db_name);

    nano = require('nano')(db_url);
    nano.db.create(db_name,
        function(error) {
          if (error) {
            targets.createdb.reject(error);
            return;
          }

          make.log('database created.');
          targets.createdb.resolve();
        });
};

/**
 * Push the current app.js and attachments content to CouchDB.
 */
targets.pushdb = function(make) {
    var params;
    var db_url;
    var db_name;
    var result;

    params = getDatabaseParameters(make);
    db_url = params.db_url;
    db_name = params.db_name;

    make.log('pushing to database: ' + db_url + '/' + db_name);

    // TODO: copy the tibet.json from the top level into the attachments
    // directory but remove 'attachments' from the app.inf reference and any
    // other paths which might include attachments.

    result = nodecli.exec('couchapp',
        'push', 'app.js', db_url + '/' + db_name, {
      silent: (make.options.silent !== true)
    });

    if (result.code !== 0) {
      make.log('push failed.');
      targets.pushdb.reject(result.output);
      return;
    }

    make.log('push complete.');
    targets.pushdb.resolve();
};

/**
 * Remove the current CouchDB database.
 */
targets.removedb = function(make) {
    var params;
    var db_url;
    var db_name;
    var result;
    var nano;

    params = getDatabaseParameters(make);
    db_url = params.db_url;
    db_name = params.db_name;

    result = make.prompt.question(
        'Delete database [' + db_url + '/' + db_name + '] ? Enter \'yes\' to confirm: ');
    if (!result || result.trim().toLowerCase() !== 'yes') {
        make.log('database removal cancelled.');
        targets.removedb.resolve();
        return;
    }

    make.log('deleting database: ' + db_url + '/' + db_name);

    nano = require('nano')(db_url);
    nano.db.destroy(db_name,
        function(error) {
          if (error) {
            targets.removedb.reject(error);
            return;
          }

          make.log('database removed.');
          targets.removedb.resolve();
        });
};

module.exports = targets;

}());
