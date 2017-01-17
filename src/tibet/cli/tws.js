//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet tws' command. Provides simple utilities
 */
//  ========================================================================

/* eslint indent:0, object-curly-newline:0, consistent-this:0 */
/* global emit */

(function() {

'use strict';

var CLI,
    Cmd,
    couch,
    minimist;

CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

Cmd = function() {
    //  empty
};
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();

couch = require('../../../etc/helpers/couch_helpers');
minimist = require('minimist');

//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.ANY;

/**
 * The command name for this type.
 * @type {String}
 */
Cmd.NAME = 'tws';


/**
 * The required list of core views for the TWS to operate.
 * @type {Object}
 */
Cmd.VIEWS = {
    flows: {
        map: function(doc) {
            if (doc.type === 'flow') {
                emit(doc.name + '::' + doc.owner, doc);
            }
        }.toString()
    },
    jobs: {
        map: function(doc) {
            if (doc.type === 'job') {
                emit(doc.flow + '::' + doc.owner, doc);
            }
        }.toString()
    },
    jobs_running: {
        map: function(doc) {
            if (doc.type === 'job' && doc.state !== '$$complete') {
                emit(doc.state, doc);
            }
        }.toString()
    },
    tasks: {
        map: function(doc) {
            if (doc.type === 'task') {
                emit(doc.name, doc);
            }
        }.toString()
    }
};

//  ---
//  Instance Attributes
//  ---

//  NOTE the parse options here are just for the 'tws' command itself.
//  Subcommands need to parse via their own set of options.

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['init'],
        'string': [],
        'default': {}
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet tws [<cmd> [<flags>]] [--init]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    var args,
        subcmd;

    args = this.getArglist();

    //  NOTE argv[0] is the command name so we want [1] for any subcommand.
    subcmd = args[1];
    if (subcmd.charAt(0) === '-') {
        //  initial flag, not a command choice.
        if (!this.options.init) {
            this.usage();
            return;
        } else {
            this.executeSubcommand('init');
        }
    } else {
        this.executeSubcommand(subcmd);
    }
};


/**
 */
Cmd.prototype.executeSubcommand = function(cmd) {
    var name;

    //  TODO:   eventually add an 'enable' option. that will require a better
    //  way to read/update/save tds.json from the CLI.
    if (!CLI.getcfg('tds.use_tasks')) {
        this.warn(
            'TWS is not currently enabled. Enable it via `tibet config tds.use_tasks true`');
    }

    name = 'execute' + cmd.charAt(0).toUpperCase() + cmd.slice(1);
    if (typeof this[name] !== 'function') {
        throw new Error('Unknown subcommand: ' + cmd);
    }

    return this[name]();
};


/**
 * Subcommand to manage flow documents in the TWS.
 */
Cmd.prototype.executeFlow = function() {
    var argv;

    argv = this.reparse({
        boolean: ['list', 'push'],
        default: {
            list: true
        }
    });

    //  TODO:   list

    //  TODO:   push

    return;
};


/**
 */
Cmd.prototype.executeInit = function() {
    var cmd,
        params,
        db_url,
        db_name,
        db_app,
        nano,
        db,
        dbCreateTaskDb,
        dbGetDesignDoc,
        dbGetTaskViews,
        dbInsertDesignDoc,
        dbInsertTaskViews;

    cmd = this;

    params = couch.getCouchParameters({
        requestor: CLI,
        confirm: false,
        cfg_root: 'tds.tasks'
    });

    db_url = params.db_url;
    db_name = params.db_name;
    db_app = params.db_app;

    if (!db_url || !db_name || !db_app) {
        this.error('Unable to determine CouchDB parameters for TWS.');
        return;
    }

    nano = require('nano')(db_url);
    db = nano.use(db_name);


    dbCreateTaskDb = function() {
        cmd.log('creating TWS database');
        nano.db.create(db_name, function(err, result) {
            if (err) {
                cmd.error('unable to create TWS database');
                cmd.error(err.message);
                return;
            }

            //  trigger the next step in the init sequence
            dbGetDesignDoc();
        });
    };


    dbGetDesignDoc = function() {
        cmd.log('confirming TWS design doc');
        db.get('_design/' + db_app, function(err, result) {
            if (err) {
                //  If missing trap that and do the insert.
                if (err.statusCode === 404) {
                    dbInsertDesignDoc();
                    return;
                }
                cmd.error('unable to verify design doc');
                cmd.error(err.message);
                return;
            }

            //  trigger the next step in the init sequence
            dbGetTaskViews(result);
        });
    };


    dbInsertDesignDoc = function() {
        cmd.log('inserting TWS design doc');
        db.insert({_id: '_design/' + db_app}, function(err, result) {
            if (err) {
                cmd.error('unable to insert design doc');
                cmd.error(err.message);
                return;
            }

            //  trigger the next step in the init sequence
            dbGetTaskViews();
        });
    };


    dbGetTaskViews = function() {
        var required,
            stored,
            missing;

        cmd.log('confirming TWS views');

        db.get('_design/' + db_app, function(err, result) {
            if (err) {
                cmd.error('unable to fetch design doc');
                cmd.error(err.message);
                return;
            }

            //  If doc has no views we can insert in a block.
            if (!result.views) {
                cmd.log('inserting TWS view block');

                //  Inject the entire structure and save.
                result.views = Cmd.VIEWS;
                db.insert(result, function(err2, result2) {
                    if (err2) {
                        cmd.error('unable to insert TWS view block');
                        cmd.error(err2.message);
                        return;
                    }

                    cmd.info('TWS initialized');
                });

                return;
            }

            //  Compute the missing views for update.
            required = Object.keys(Cmd.VIEWS);
            missing = [];
            stored = Object.keys(result.views);
            required.forEach(function(key) {
                if (stored.indexOf(key) === -1) {
                    missing.push(key);
                }
            });

            if (missing.length === 0) {
                cmd.info('TWS initialized');
                return;
            }

            dbInsertTaskViews(result, missing);
            return;
        });
    };


    dbInsertTaskViews = function(result, missing) {

        missing.forEach(function(key) {
            result.views[key] = Cmd.VIEWS[key];
            cmd.log('inserting TWS ' + key + ' view');
        });

        db.insert(result, function(err, result2) {
            if (err) {
                cmd.error('unable to insert TWS core views');
                cmd.error(err.message);
                return;
            }

            cmd.info('TWS initialized');
        });

        return;
    };


    //  Activate the sequence by querying for current database list.
    cmd.log('confirming TWS database');
    nano.db.list(function(err, result) {
        if (err) {
            cmd.error(CLI.beautify(err));
            return;
        }

        if (result.indexOf(db_name) === -1) {
            dbCreateTaskDb();
        } else {
            dbGetDesignDoc();
        }
    });
};


/**
 * Subcommand to manage job documents in the TWS.
 */
Cmd.prototype.executeJob = function() {
    var argv;

    argv = this.reparse({
        boolean: ['list', 'push'],
        default: {
            list: true
        }
    });

    //  TODO:   list

    //  TODO:   push

    return;
};


/**
 * Subcommand to manage documents in the TWS.
 */
Cmd.prototype.executePush = function() {
    var argv;

    argv = this.reparse({
        boolean: ['', 'push'],
        default: {
        }
    });

    //  TODO:   push

    return;
};


/**
 * Subcommand to manage task documents in the TWS.
 */
Cmd.prototype.executeTask = function() {
    var argv;

    argv = this.reparse({
        boolean: ['list', 'push'],
        default: {
            list: true
        }
    });

    //  TODO:   list

    //  TODO:   push

    return;
};


/**
 * Subcommand to manage views in the TWS.
 */
Cmd.prototype.executeView = function() {
    var argv;

    argv = this.reparse({
        boolean: ['init', 'list', 'push'],
        default: {
            list: true
        }
    });

    //  --init here is an alias for initializing the general TWS (since that's
    //  all about ensuring the core views are in place).
    if (argv.indexOf('--init') !== -1) {
        return this.executeInit();
    }

    //  TODO:   list

    //  TODO:   push

    return;
};


/**
 * Reparses the command line arguments using the parse options provided.
 * @param {Object} options A minimist-compatible set of parse options.
 * @return {Array} The arglist after reparsing.
 */
Cmd.prototype.reparse = function(options) {
    var opts;

    opts = options || {};

    //  Reparse to get options parsed specifically for our subcommand.
    this.options = minimist(this.getArgv(),
        CLI.blend(opts, CLI.PARSE_OPTIONS)
    );

    return this.getArglist();
};


module.exports = Cmd;

}());
