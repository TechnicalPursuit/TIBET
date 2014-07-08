/**
 * Sample TIBET-style makefile. Target functions are converted to promise
 * objects so you can use then() to chain tasks easily.
 */

(function() {

    'use strict';

    var CLI = require('tibet/src/tibet/cli/_cli');
    var sh = require('shelljs');


    /*
     * Uncomment to run node_modules-based utilities.
    var nodeCLI = require('shelljs-nodecli');
    */

    /*
     * Uncomment to include TIBET's default make helper routines.
    var helpers = require('tibet/src/tibet/cli/_make_helpers');
    */

    //  ---
    //  targets
    //  ---

    /**
     * Canonical `targets` object for exporting the various target functions.
     */
    var targets = {};

    /**
     * Database targets.
     */
    targets.createdb = function(make) {
        make.log('creating CouchDB database: ' + make.getProjectName());

        // TODO: pull command line arguments if they're here. We need to support
        // changing the database url and the database name.

        var db_url = 'http://127.0.0.1:5984';
        var nano = require('nano')(db_url);

        nano.db.create(make.getProjectName(),
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
     * Database targets.
     */
    targets.pushdb = function(make) {

        var result;
        var sh = require('shelljs');
        var db_url = 'http://127.0.0.1:5984';
        var db_name = make.getProjectName();

        make.log('pushing to CouchDB database: ' + db_name);

        // TODO: pull command line arguments if they're here. We need to support
        // changing the database url and the database name.

        // TODO: copy the tibet.json from the top level into the attachments
        // directory but remove 'attachments' from the app.inf reference and any
        // other paths which might include attachments.

        result = sh.exec('couchapp push app.js ' + db_url + '/' + db_name, {
          silent: (CLI.options.silent !== true)
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
     * Remove the database whose name matches the current project.
     */
    targets.removedb = function(make) {
        make.log('deleting CouchDB database: ' + make.getProjectName());

        // TODO: pull command line arguments if they're here. We need to support
        // changing the database url and the database name.

        var db_url = 'http://127.0.0.1:5984';
        var nano = require('nano')(db_url);

        nano.db.destroy(make.getProjectName(),
            function(error) {
              if (error) {
                targets.removedb.reject(error);
                return;
              }

              make.log('database removed.');
              targets.removedb.resolve();
            });
    };

    /**
     * Canonical test target.
     */
    targets.test = function(make) {
        var result;

        make.log('checking for lint...');

        result = sh.exec('tibet lint');
        if (result.code !== 0) {
            targets.test.reject();
            return;
        }

        make.log('running unit tests...');
        make.warn('add some tests... ;)');
        targets.test.resolve();
    };


    //  ---
    //  export
    //  ---

    module.exports = targets;

}());
