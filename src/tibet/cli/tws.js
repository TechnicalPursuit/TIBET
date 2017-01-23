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
    path,
    minimist,
    sh,
    Promise;

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
path = require('path');
minimist = require('minimist');
Promise = require('bluebird');
sh = require('shelljs');

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
    jobs_active: {
        map: function(doc) {
            if (doc.type === 'job' &&
                    (doc.state === '$$active' || doc.state === '$$ready')) {
                emit(doc.state, doc);
            }
        }.toString()
    },
    jobs_cancelled: {
        map: function(doc) {
            if (doc.type === 'job' && doc.state === '$$cancelled') {
                emit(doc.state, doc);
            }
        }.toString()
    },
    jobs_failed: {
        map: function(doc) {
            if (doc.type === 'job' &&
                    (doc.state === '$$error' || doc.state === '$$timeout')) {
                emit(doc.state, doc);
            }
        }.toString()
    },
    jobs_complete: {
        map: function(doc) {
            if (doc.type === 'job' && doc.state === '$$complete') {
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
Cmd.prototype.PARSE_OPTIONS = CLI.blend({}, Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet tws <command> [<flags>]';


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
        this.usage();
    } else {
        this.executeSubcommand(subcmd);
    }

    return;
};


/**
 */
Cmd.prototype.executeSubcommand = function(cmd) {
    var name;

    name = 'execute' + cmd.charAt(0).toUpperCase() + cmd.slice(1);
    if (typeof this[name] !== 'function') {
        throw new Error('Unknown subcommand: ' + cmd);
    }

    return this[name]();
};

//  ---
//  Enable/Disable
//  ---

/**
 */
Cmd.prototype.executeDisable = function() {
    var file,
        json,
        env,
        enabled;

    this.reparse({
        string: ['env'],
        default: {
            env: 'development'
        }
    });

    file = CLI.expandPath('~tds_file');
    json = require(file);
    if (!json) {
        this.error('Unable to load tds config file: ' + file);
        return 1;
    }

    //  Drill down into the environment provided. All TDS settings are intended
    //  to reside below either 'default' or an environment-specific root.
    env = json[this.options.env];
    if (!env) {
        env = {};
        json[this.options.env] = env;
    }

    enabled = env.use_tasks;
    if (enabled) {
        env.use_tasks = false;

        this.log('Updating ' + this.options.env + ' configuration.');
        CLI.beautify(JSON.stringify(json)).to(file);
    }

    this.info('TWS disabled in ' + this.options.env + '.');

    return;
};


/**
 */
Cmd.prototype.executeEnable = function() {
    var file,
        json,
        env,
        enabled;

    this.reparse({
        string: ['env'],
        default: {
            env: 'development'
        }
    });

    file = CLI.expandPath('~tds_file');
    json = require(file);
    if (!json) {
        this.error('Unable to load tds config file: ' + file);
        return 1;
    }

    //  Drill down into the environment provided. All TDS settings are intended
    //  to reside below either 'default' or an environment-specific root.
    env = json[this.options.env];
    if (!env) {
        env = {};
        json[this.options.env] = env;
    }

    enabled = env.use_tasks;
    if (!enabled) {
        env.use_tasks = true;

        this.log('Updating ' + this.options.env + ' configuration.');
        CLI.beautify(JSON.stringify(json)).to(file);
    }

    this.info('TWS enabled in ' + this.options.env + '.');

    return;
};


//  ---
//  Init/Push
//  ---

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
        dbPopulateDesignDoc,
        dbInsertDesignDoc,
        dbInsertTaskViews;

    cmd = this;

    params = couch.getCouchParameters({
        requestor: CLI,
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

    dbPopulateDesignDoc = function(obj) {
        var doc,
            fullpath;

        doc = obj || {};
        doc._id = doc._id || '_design/' + db_app;

        //  Need to get any views, shows, lists, etc. for the app in question
        //  and load them into the design doc if they're missing. We don't
        //  delete anything from the doc during init processing.
        fullpath = CLI.expandPath(CLI.getcfg('path.tds_task_defs'));
        if (CLI.sh.test('-e', fullpath)) {
            doc = couch.populateDesignDoc(doc, fullpath, params, true);
        }

        return doc;
    };

    dbInsertDesignDoc = function() {
        var doc;

        cmd.log('inserting TWS design doc');

        doc = dbPopulateDesignDoc();

        db.insert(doc, function(err, result) {
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

        cmd.log('confirming TWS core views');

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
 * Pushes all design document content from the local environment into the
 * database, updating any pre-existing content to match the local drive.
 */
Cmd.prototype.executePush = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


//  ---
//  Flows
//  ---

/**
 * Subcommand to manage flow documents in the TWS.
 */
Cmd.prototype.executeFlow = function() {
    this.redispatch('flow', ['list', 'push', 'remove', 'enable', 'disable']);
};


/**
 */
Cmd.prototype.executeFlowDisable = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


/**
 */
Cmd.prototype.executeFlowEnable = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


/**
 */
Cmd.prototype.executeFlowList = function() {
    var thisref;

    thisref = this;

    this.dbView('flows').then(function(result) {
        if (thisref.options.verbose) {
            thisref.log(CLI.beautify(result));
        } else {
            result.forEach(function(item) {
                thisref.log(item.name + '::' + item.owner + ' => ' +
                    JSON.stringify(item.tasks.sequence) +
                    thisref.colorize(' (' + item._id + ')', 'gray'));
            });
        }
    }).catch(function(err) {
        thisref.error(err);
    });
};


/**
 */
Cmd.prototype.executeFlowPush = function() {
    return this.push('flow');
};


/**
 */
Cmd.prototype.executeFlowPushAll = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


/**
 */
Cmd.prototype.executeFlowRemove = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;

};


//  ---
//  Jobs
//  ---

/**
 * Subcommand to manage job documents in the TWS.
 */
Cmd.prototype.executeJob = function() {
    this.redispatch('job',
        ['list', 'push', 'cancel', 'restart', 'retry']);
};


/**
 */
Cmd.prototype.executeJobCancel = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


/**
 */
Cmd.prototype.executeJobList = function() {
    var thisref,
        subset,
        viewname;

    thisref = this;

    //  Check for additional flag defining which job slice to look at. NOTE we
    //  alias 'complete' as 'completed' since other flags are often past tense
    //  and the trailing 'd' is habit-forming.
    subset = this.whichOne(
        ['active', 'all', 'cancelled', 'complete', 'completed', 'failed']);
    subset = subset || 'active';

    //  Deal with synonym(s) so we get the right view names.
    if (subset === 'all') {
        viewname = 'jobs';
    } else {
        if (subset === 'completed') {
            subset = 'complete';
        }
        viewname = 'jobs_' + subset;
    }

    this.dbView(viewname).then(function(result) {
        if (thisref.options.verbose) {
            thisref.log(CLI.beautify(result));
        } else {
            result.forEach(function(item) {
                thisref.log(item.flow + '::' + item.owner + ' => ' +
                    (item.state || '$$undefined') +
                    thisref.colorize(' (' + item._id + ')', 'gray'));
            });
        }
    }).catch(function(err) {
        thisref.error(err);
    });
};


/**
 */
Cmd.prototype.executeJobPush = function() {
    return this.push('job');
};


/**
 */
Cmd.prototype.executeJobRestart = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


/**
 */
Cmd.prototype.executeJobRetry = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


//  ---
//  Tasks
//  ---

/**
 * Subcommand to manage task documents in the TWS.
 */
Cmd.prototype.executeTask = function() {
    this.redispatch('task', ['list', 'push', 'remove']);
};


/**
 */
Cmd.prototype.executeTaskList = function() {
    var thisref;

    thisref = this;

    this.dbView('tasks').then(function(result) {
        if (thisref.options.verbose) {
            thisref.log(CLI.beautify(result));
        } else {
            result.forEach(function(item) {
                var plugin;

                //  TODO:   eventually check item.flow and if it references a
                //          separate flow we need to point that out rather than
                //          a plugin (which won't be there when flow is valid.
                plugin = item.plugin || item.name;

                //  TODO:   add owner when ready
                thisref.log(item.name + ' => ' + plugin +
                    thisref.colorize(' (' + item._id + ')', 'gray'));
            });
        }
    }).catch(function(err) {
        thisref.error(err);
    });
};


/**
 */
Cmd.prototype.executeTaskPush = function() {
    return this.push('task');
};


/**
 */
Cmd.prototype.executeTaskPushAll = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


/**
 */
Cmd.prototype.executeTaskRemove = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;

};


//  ---
//  Views
//  ---

/**
 * Subcommand to manage view definitions in the TWS.
 */
Cmd.prototype.executeView = function() {
    this.redispatch('view', ['list', 'push', 'remove']);
};


/**
 */
Cmd.prototype.executeViewList = function() {
    var thisref,
        params;

    thisref = this;

    params = couch.getCouchParameters({
        requestor: CLI,
        confirm: false,
        cfg_root: 'tds.tasks'
    });

    this.dbGet('_design/' + params.db_app).then(function(result) {
        var names;

        if (result.views) {
            names = Object.keys(result.views);
        } else {
            names = [];
        }

        names.forEach(function(name) {
            thisref.log(name);
        });

    }).catch(function(err) {
        thisref.error(err);
    });
};


/**
 */
Cmd.prototype.executeViewPush = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


/**
 */
Cmd.prototype.executeViewRemove = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;

};


//  ---
//  Utilities
//  ---

/**
 * Low-level listing routine for displaying results of running a view.
 * @param {String} viewname The view to execute to produce results.
 */
Cmd.prototype.dbGet = function(doc, options) {
    var nano,
        db,
        db_url,
        db_name,
        db_app,
        params;

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

    return new Promise(function(resolve, reject) {

        db.get(doc, options, function(err, body) {
            if (err) {
                return reject(err);
            }

            return resolve(body);
        });
    });
};


/**
 * Low-level listing routine for displaying results of running a view.
 * @param {String} viewname The view to execute to produce results.
 */
Cmd.prototype.dbView = function(viewname, options) {
    var nano,
        db,
        db_url,
        db_name,
        db_app,
        params;

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

    return new Promise(function(resolve, reject) {

        db.view(db_app, viewname, options, function(err, body) {
            var values;

            if (err) {
                return reject(err);
            }

            values = body.rows.map(function(row) {
                return row.value;
            });
            return resolve(values);
        });
    });
};


/**
 * Verifies that of the list of flags provided only one was supplied on the
 * command line.
 * @param {Array.<String>} flags An array of flags which should be unique with
 *     respect to command line usage.
 * @throws InvalidFlags
 */
Cmd.prototype.onlyOne = function(flags) {
    var found,
        argv;

    argv = this.getArgv();

    found = flags.filter(function(flag) {
        return argv.indexOf('--' + flag) !== -1;
    });

    if (found.length > 1) {
        throw new Error('Incompatible command options: ' + found.join(', '));
    }

    return;
};


/**
 *
 */
Cmd.prototype.push = function(kind) {
    var name,
        fname,
        fullpath,
        dat,
        doc;

    //  If a specific value on command line should be a doc name, otherwise
    //  it's a request to push them all.
    name = this.options._[2];
    if (!name) {
        fname = this.specialize('execute', kind, 'PushAll');
        if (this.canInvoke(fname)) {
            return this[fname]();
        } else {
            this.error('No specific definition and no \'push all\' option.');
            return;
        }
    }

    //  Find task with the name provided and push it.
    fullpath = path.join(CLI.expandPath(CLI.getcfg('path.tds_task_defs')),
        kind + 's',     //  pluralize for directory name(s)
        name + '.json');
    if (!CLI.sh.test('-e', fullpath)) {
        this.error('Unable to find definition for ' + name);
        return;
    }

    dat = sh.cat(fullpath);
    if (!dat) {
        this.error('No content read for file: ' + fullpath);
    }

    try {
        doc = JSON.parse(dat);
    } catch (e) {
        this.error('Error parsing definition: ' + e.message);
        return;
    }

    this.pushOne(fullpath, doc);
};


/**
 */
Cmd.prototype.pushOne = function(fullpath, doc) {
    var params,
        db_url,
        db_name,
        nano,
        db,
        thisref;

    thisref = this;

    params = couch.getCouchParameters({
        requestor: CLI,
        cfg_root: 'tds.tasks'
    });

    db_url = params.db_url;
    db_name = params.db_name;

    if (!db_url || !db_name) {
        this.error('Unable to determine CouchDB parameters for TWS.');
        return;
    }

    nano = require('nano')(db_url);
    db = nano.use(db_name);

    if (doc._id) {
        //  Have to fetch to get the proper _rev to update...
        db.get(doc._id, function(err, response) {
            if (err) {
                //  TODO:   most common error will be 'missing'
                thisref.error(err);
                return;
            }

            doc._rev = response._rev;

            db.insert(doc, function(err2, response2) {
                if (err2) {
                    thisref.error(err2);
                    return;
                }

                thisref.log(CLI.beautify(response2));

                //  Set the document ID to the response ID so we know it.
                doc._id = response2.id;
                doc._rev = response2.rev;
                CLI.beautify(doc).to(fullpath);
            });

        });
    } else {
        //  No clue...appears to be first time we've inserted this doc.
        db.insert(doc, function(err, response) {
            if (err) {
                thisref.error(err);
                return;
            }

            thisref.log(CLI.beautify(response));

            //  Set the document ID to the response ID so we know it.
            doc._id = response.id;
            doc._rev = response.rev;
            CLI.beautify(doc).to(fullpath);
        });
    }

    return;
};


/**
 */
Cmd.prototype.redispatch = function(root, flags) {
    var subcmd,
        fname;

    this.reparse({
        boolean: flags.slice(0),    // slice to copy
        default: {
            list: true
        }
    });

    //  Get the subcommand operation (which is specified via flag)
    subcmd = this.whichOne(flags);
    if (!subcmd) {
        throw new Error('Unspecified operation.');
    }

    fname = this.specialize('execute', root, subcmd);
    if (this.canInvoke(fname)) {
        return this[fname]();
    }

    throw new Error('Unknown operation: ' + fname);
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


/**
 * Combines a root method name with a subcommand to produce a more specialized
 * method name for invocation.
 * @param {String} root The root method name such as 'executeJob'.
 * @param {String} subcmd The subcommand used to specialize the operation.
 * @return {String} The specialized command name.
 */
Cmd.prototype.specialize = function(root, command, subcmd) {
    return root +
        command.charAt(0).toUpperCase() + command.slice(1) +
        subcmd.charAt(0).toUpperCase() + subcmd.slice(1);
};


/**
 * Returns the flag which was actually passed from a list of possible flags.
 * Note that this method will throw an exception if more than one flag is found.
 * @param {Array.<String>} flags The list of flags to check and filter.
 * @throws {Error} Incompatible command options.
 * @return {String} The flag provided, if only one is found.
 */
Cmd.prototype.whichOne = function(flags) {
    var found,
        argv;

    argv = this.getArgv();

    found = flags.filter(function(flag) {
        return argv.indexOf('--' + flag) !== -1;
    });

    if (found.length > 1) {
        throw new Error('Incompatible command options: ' + found.join(', '));
    }

    return found[0];
};


module.exports = Cmd;

}());
