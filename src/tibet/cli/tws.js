//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet tws' command. Provides simple utilities for interacting
 *     with the TIBET Workflow System, which runs as a combination of CouchDB
 *     and TDS services.
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
 * The required list of core views for the TWS and this command to function.
 * These views are guaranteed to be inserted with `tws init` even if they have
 * no counterpart in the ~tds_task_defs directory.
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
Cmd.prototype.USAGE = 'tibet tws <cancel|disable|enable|init|list|push|remove|restart|retry|submit|validate> [<flags>]';


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
 * Dispatches a subcommand by searching for a method of the form
 * 'execute{Subcommand} to execute and dispatching to it.
 * @param {String} cmd The subcommand name.
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
//  Cancel
//  ---

/**
 * Cancels an active job. If the job has already completed in any form this
 * command has no effect. Also note that while the job itself will be marked
 * cancelled any currently running task(s) will run to completion since the TWS
 * has no control over external processes on potentially distributed nodes.
 */
Cmd.prototype.executeCancel = function() {
    var doc_id,
        thisref;

    thisref = this;

    //  Make sure our non-flag parameters (from _ array) contain a doc ID.
    doc_id = this.getArg(2);

    if (CLI.notEmpty(doc_id)) {
        this.dbGet(doc_id).then(function(result) {
            if (result.type !== 'job') {
                CLI.handleError(new Error('Invalid job'), 'tws', 'cancel');
                return;
            }

            if (thisref.isFinalState(result.state)) {
                thisref.info('Job ' + doc_id + ' already in final state.');
                return;
            }

            result.state = '$$cancelled';
            thisref.dbInsert(result).then(function(result2) {
                thisref.info(CLI.beautify(result2));
            }).catch(function(err) {
                CLI.handleError(err, 'tws', 'cancel');
            });
        }).catch(function(err) {
            CLI.handleError(err, 'tws', 'cancel');
        });
    } else {
        this.usage('tibet tws cancel <job_id>');
    }
};


//  ---
//  Disable
//  ---

/**
 * Disables the engine or a particular flow, if specified. If no flags are
 * provided usage information is output. To disable the entire engine use
 * --engine. To disable a particular flow use --flow and the document ID of the
 *  flow. You can get the document ID by running 'tibet tws list --flow'.
 */
Cmd.prototype.executeDisable = function() {
    this.redispatch('disable', ['engine', 'flow']);
};


/**
 * Disables the entire TWS by turning off the use_tasks flag in the current
 * environment (which defaults to 'development'). To change the environment you
 * must provide a --env flag and the environment name.
 */
Cmd.prototype.executeDisableEngine = function() {
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
 * Disables an individual workflow, ensuring no jobs targeting that flow will be
 * activated once the command has completed. Any existing jobs running that flow
 * will not be stopped or cancelled but will run to completion.
 */
Cmd.prototype.executeDisableFlow = function() {
    var doc_id,
        thisref;

    thisref = this;

    doc_id = this.getArg(2);

    if (CLI.notEmpty(doc_id)) {
        this.dbGet(doc_id).then(function(result) {
            if (result.type !== 'flow') {
                CLI.handleError(new Error('Invalid flow'), 'tws', 'enable');
                return;
            }

            if (result.enabled === false) {
                thisref.info('Flow ' + doc_id + ' already disabled.');
                return;
            }

            result.enabled = false;
            thisref.dbInsert(result).then(function(result2) {
                thisref.info(CLI.beautify(result2));
            }).catch(function(err) {
                CLI.handleError(err, 'tws', 'enable');
            });
        }).catch(function(err) {
            CLI.handleError(err, 'tws', 'enable');
        });
    } else {
        this.usage('tibet tws disable --flow <id>');
    }
};


/**
 * Displays usage information for the 'tibet tws disable' command.
 */
Cmd.prototype.executeDisableUsage = function() {
    this.usage('tibet tws disable [--engine|--flow <id>]');
};


//  ---
//  Enable
//  ---

/**
 * Enables the engine or a particular flow, if specified. If no flags are
 * provided usage information is output. To enable the entire engine use
 * --engine. To enable a particular flow use --flow and the document ID of the
 *  flow. You can get the document ID by running 'tibet tws list --flow'.
 */
Cmd.prototype.executeEnable = function() {
    this.redispatch('enable', ['engine', 'flow']);
};


/**
 * Enables the entire TWS by turning on the use_tasks flag in the current
 * environment (which defaults to 'development'). To change the environment you
 * must provide a --env flag and the environment name.
 */
Cmd.prototype.executeEnableEngine = function() {
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


/**
 * Enables an individual workflow, ensuring jobs targeting that flow will be
 * activated once the command has completed.
 */
Cmd.prototype.executeEnableFlow = function() {
    var doc_id,
        thisref;

    thisref = this;

    doc_id = this.getArg(2);

    if (CLI.notEmpty(doc_id)) {
        this.dbGet(doc_id).then(function(result) {
            if (result.type !== 'flow') {
                CLI.handleError(new Error('Invalid flow'), 'tws', 'enable');
                return;
            }

            if (result.enabled !== false) {
                thisref.info('Flow ' + doc_id + ' already enabled.');
                return;
            }

            result.enabled = true;
            thisref.dbInsert(result).then(function(result2) {
                thisref.info(CLI.beautify(result2));
            }).catch(function(err) {
                CLI.handleError(err, 'tws', 'enable');
            });
        }).catch(function(err) {
            CLI.handleError(err, 'tws', 'enable');
        });
    } else {
        this.usage('tibet tws enable --flow <id>');
    }
};


/**
 * Displays usage information for the 'tibet tws enable' command.
 */
Cmd.prototype.executeEnableUsage = function() {
    this.usage('tibet tws enable [--engine|--flow <id>]');
};


//  ---
//  Init
//  ---

/**
 * Initializes the TWS database in CouchDB. The database, design document, and
 * document views are all checked and created on demand as needed.
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
                CLI.handleError(err, 'tws', 'init');
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
                CLI.handleError(err, 'tws', 'init');
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
                CLI.handleError(err, 'tws', 'init');
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
                CLI.handleError(err, 'tws', 'init');
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
                        CLI.handleError(err2, 'tws', 'init');
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
                CLI.handleError(err, 'tws', 'init');
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
            CLI.handleError(err, 'tws', 'init');
            return;
        }

        if (result.indexOf(db_name) === -1) {
            dbCreateTaskDb();
        } else {
            dbGetDesignDoc();
        }
    });
};

//  ---
//  List
//  ---

/**
 * Lists information about one or more documents in the TWS database. If a
 * specific document ID is provided that document is fetched and displayed. If
 * no document ID is given then a flag specifying a subset of document types
 * must be provided such as --flows, --tasks, --views, or --jobs. Use the
 * --verbose flag along with a type flag to list the full document contents
 *  rather than a summary.
 */
Cmd.prototype.executeList = function() {
    var doc_id,
        thisref;

    thisref = this;

    doc_id = this.getArg(2);

    if (CLI.notEmpty(doc_id)) {
        this.dbGet(doc_id).then(function(result) {
            thisref.info(CLI.beautify(result));
        }).catch(function(err) {
            CLI.handleError(err, 'tws', 'list');
        });

        return;
    }

    this.redispatch('list', ['flows', 'jobs', 'tasks', 'views']);
};


/**
 * Lists all known flows in the TWS database in summary form, or in full
 * document form if the --verbose flag is provided.
 */
Cmd.prototype.executeListFlows = function() {
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
        CLI.handleError(err, 'tws', 'list');
    });
};


/**
 * Lists jobs in the TWS database in summary form, or in full document form if
 * the --verbose flag is provided. A secondary flag is required to define the
 * subset of jobs to list (since listing all jobs could be problematic in a
 * production environment). Options include active, cancelled, complete[d], and
 * failed.
 */
Cmd.prototype.executeListJobs = function() {
    var thisref,
        subset,
        viewname;

    thisref = this;

    //  Check for additional flag defining which job slice to look at. NOTE we
    //  alias 'complete' as 'completed' since other flags are often past tense
    //  and the trailing 'd' is habit-forming.
    subset = this.whichOne(
        ['active', 'cancelled', 'complete', 'completed', 'failed']);
    subset = subset || 'active';

    if (subset === 'completed') {
        subset = 'complete';
    }
    viewname = 'jobs_' + subset;

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
        CLI.handleError(err, 'tws', 'list');
    });
};


/**
 * Lists all known tasks in the TWS database in summary form, or in full
 * document form if the --verbose flag is provided.
 */
Cmd.prototype.executeListTasks = function() {
    var thisref;

    thisref = this;

    this.dbView('tasks').then(function(result) {
        if (thisref.options.verbose) {
            thisref.log(CLI.beautify(result));
        } else {
            result.forEach(function(item) {
                var target;

                if (item.flow) {
                    target = 'flow ' + item.flow;
                } else {
                   target = 'plugin ' + (item.plugin || item.name);
                }

                //  TODO:   add owner when ready
                thisref.log(item.name + ' => ' + target +
                    thisref.colorize(' (' + item._id + ')', 'gray'));
            });
        }
    }).catch(function(err) {
        CLI.handleError(err, 'tws', 'list');
    });
};


/**
 * Displays usage information for the 'tibet tws list' command.
 */
Cmd.prototype.executeListUsage = function() {
    this.usage('tibet tws list [<doc_id>|--flows|--tasks|--jobs|--views]');
};


/**
 * Lists all known views in the TWS database in summary form, or in full
 * document form if the --verbose flag is provided.
 */
Cmd.prototype.executeListViews = function() {
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
            if (thisref.options.verbose) {
                //  Views are stored in string form so we want to try and output
                //  them in a nicely formatted fashion (without '\n' etc) here.
                Object.keys(result.views).forEach(function(key) {
                    var str,
                        val;

                    val = result.views[key];
                    str = key + ' => {\n';
                    if (val.map) {
                        str += '\tmap: ' + val.map;
                    }
                    if (val.reduce) {
                        str += ',\n'; //  there's always a map so terminate it
                        str += '\treduce: ' + val.map;
                    }
                    str += '}';

                    thisref.log(str);
                });
                return;
            } else {
                names = Object.keys(result.views);
            }
        } else {
            names = [];
        }

        names.forEach(function(name) {
            thisref.log(name);
        });

    }).catch(function(err) {
        CLI.handleError(err, 'tws', 'list');
    });
};


//  ---
//  Push
//  ---

/**
 * Pushes content to the TWS database. You can push individual JSON documents,
 * directories containing JSON documents, or design document content from the
 * ~tds_task_defs directory depending on the flags and parameters you provide on
 * the command line.
 */
Cmd.prototype.executePush = function() {
    var flags,
        id,
        fullpath;

    flags = ['design', 'flows', 'map', 'tasks'];

    this.reparse({
        boolean: flags.slice(0),    // slice to copy. parse will modify.
        default: {}
    });

    id = this.getArg(2);

    if (CLI.notEmpty(id)) {
        fullpath = CLI.expandPath(id);
        if (!sh.test('-e', fullpath)) {
            this.error('Target path not found: ' + fullpath);
            return;
        }

        if (sh.test('-d', fullpath)) {
            return this.pushDir(fullpath);
        } else {
            //  Has to be a JSON document.
            if (path.extname(fullpath) !== '.json') {
                this.error('Can only push JSON documents.');
                return;
            }
            return this.pushFile(fullpath);
        }
    }

    this.redispatch('push', flags);
};


/**
 */
Cmd.prototype.executePushDesign = function() {
    var params,
        db_app,
        thisref;

    thisref = this;

    params = couch.getCouchParameters({
        requestor: CLI,
        confirm: false,
        cfg_root: 'tds.tasks'
    });

    db_app = params.db_app;

    this.dbGet('_design/' + db_app).then(function(result) {
        var fullpath,
            doc,
            resultStr,
            docStr;

        fullpath = CLI.expandPath(CLI.getcfg('path.tws'));
        if (CLI.sh.test('-e', fullpath)) {
            resultStr = JSON.stringify(result);
            doc = couch.populateDesignDoc(result, fullpath, params, true);
            docStr = JSON.stringify(doc);
        } else {
            thisref.error('Unable to find path.tws: ' + fullpath);
            return;
        }

        if (resultStr === docStr) {
            thisref.info('Design document is already up to date.');
            return;
        }

        thisref.dbInsert(doc).then(function(result2) {
            thisref.log(CLI.beautify(result2));
        }).catch(function(err) {
            CLI.handleError(err, 'push', 'design');
        });
    }).catch(function(err) {
        if (err.message === 'missing') {
            thisref.error('Design document not found. Did you `tibet tws init` yet?');
        } else {
            CLI.handleError(err, 'push', 'design');
        }
    });
};


/**
 */
Cmd.prototype.executePushFlows = function() {
    this.pushDir('~tws/flows');
};


/**
 */
Cmd.prototype.executePushMap = function() {
    this.pushDir('~tws/tasks');
    this.pushDir('~tws/flows');
};


/**
 */
Cmd.prototype.executePushTasks = function() {
    this.pushDir('~tws/tasks');
};


/**
 * Displays usage information for the 'tibet tws push' command.
 */
Cmd.prototype.executePushUsage = function() {
    this.usage('tibet tws push [<path>|--design|--flows|--map|--tasks]');
};


//  ---
//  Remove
//  ---

/**
 */
Cmd.prototype.executeRemove = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


//  ---
//  Restart
//  ---

/**
 */
Cmd.prototype.executeRestart = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


//  ---
//  Retry
//  ---

/**
 */
Cmd.prototype.executeRetry = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


//  ---
//  Submit
//  ---

/**
 * Submits a specific job template after optionally prompting for parameter
 * data. Prompting occurs if the job template provided contains handlebars
 * substitution values for any of the params content.
 */
Cmd.prototype.executeSubmit = function() {
    var file,
        fullpath,
        dat,
        doc,
        thisref,
        params,
        paramStr;

    thisref = this;

    file = this.getArg(2);

    if (CLI.isEmpty(file)) {
        this.usage('tibet tws submit <jobfile>');
        return;
    }

    //  Job submission can be done by simple name so we need to be sure we
    //  expand into a proper path.
    if (CLI.isEmpty(path.extname(file))) {
        file = file + '.json';
    }

    fullpath = CLI.expandPath(file);
    if (!sh.test('-e', fullpath)) {
        file = path.join('~tws', 'jobs', file);
        fullpath = CLI.expandPath(file);
        if (!sh.test('-e', fullpath)) {
            this.error('Target path not found: ' + fullpath);
            return;
        }
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

    params = doc.params;
    paramStr = JSON.stringify(params);

    //  Remove any newlines so we can do a simpler check for {{blah}} chunks.
    paramStr = paramStr.replace(/\n/g, '');

    paramStr = paramStr.replace(/\{\{[^}]*\}\}/g, function(match) {
        var value;

        value = CLI.prompt.question(match + ' ? ');
        value = value.replace(/"/g, '\\"');

        return value;
    });

    doc.params = CLI.beautify(paramStr);

    this.dbInsert(doc).then(function(result) {
        thisref.info(CLI.beautify(result));
    }).catch(function(err) {
        CLI.handleError(err, 'tws', 'submit');
    });
};


//  ---
//  Validate
//  ---

/**
 */
Cmd.prototype.executeValidate = function() {
    //  TODO
    this.warn('Sorry. This feature is not yet implemented. :(');
    return;
};


//  ---
//  View
//  ---

/**
 * Executes a specific TWS database view and outputs the results.
 */
Cmd.prototype.executeView = function() {
    var viewname,
        thisref;

    thisref = this;

    viewname = this.getArg(2);

    if (!viewname) {
        this.usage('tibet tws view <viewname>');
        return;
    }

    this.dbView(viewname).then(function(result) {
        //  TODO: in future could use a --list option to trigger calls
        //  to list function which refines the view results.

        //  NOTE we're basically always in '--verbose' mode here since we don't
        //  know the type of document in the result and don't want to ass_ume
        //  any particular schema per se.
        thisref.log(CLI.beautify(result));
    }).catch(function(err) {
        if (err.message === 'missing_named_view') {
            thisref.error('View not found: ' + viewname);
        } else {
            CLI.handleError(err, 'tws', 'list');
        }
    });
};


//  ---
//  Utilities
//  ---

/**
 * Low-level routine for fetching a document. The document object should be
 * provided along with any options which are proper for nano.db.get.
 * @param {String} id The document ID to retrieve from CouchDB.
 * @param {Object} [options] A nano-compatible db.get options object.
 * @return {Promise} A promise with 'then' and 'catch' options.
 */
Cmd.prototype.dbGet = function(id, options) {
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

        db.get(id, options, function(err, body) {
            if (err) {
                return reject(err);
            }

            return resolve(body);
        });
    });
};


/**
 * Low-level routine for inserting/updating a document.
 * @param {Object} doc The JavaScript object to be inserted.
 * @param {Object} [options] nano-compatible options db.insert.
 * @return {Promise} A promise with 'then' and 'catch' options.
 */
Cmd.prototype.dbInsert = function(doc, options) {
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

        db.insert(doc, options, function(err, body) {
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
 * @param {Object} [options] nano-compatible options db.view.
 * @return {Promise} A promise with 'then' and 'catch' options.
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
 * Checks a job state and returns true if that state is a 'final' state, meaning
 * the job's state should not be altered further.
 * @param {String} state The job state to check.
 * @return {Boolean} true if the state is a final state.
 */
Cmd.prototype.isFinalState = function(state) {
    switch (state) {
        case '$$cancelled':
        case '$$complete':
        case '$$failed':
            return true;
        default:
            return false;
    }
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
 * Pushes all JSON documents in a specified directory to the current TWS
 * database. Typically invoked by by executePush variants to load sets of data.
 * @param {String} dir The directory to load. Note that this call is _not_
 *     recursive so only documents in the top level are loaded. Also note this
 *     value will be run through the CLI's expandPath routine to expand any
 *     virtual path values.
 */
Cmd.prototype.pushDir = function(dir) {
    var fullpath,
        thisref;

    thisref = this;

    fullpath = CLI.expandPath(dir);
    if (!CLI.sh.test('-e', fullpath)) {
        this.error('Unable to find ' + fullpath);
        return;
    }

    if (!CLI.sh.test('-d', fullpath)) {
        this.error('Target is not a directory: ' + fullpath);
        return;
    }

    sh.ls(path.join(fullpath, '*.json')).forEach(function(file) {
        if (path.basename(file).charAt(0) === '_') {
            thisref.warn('skipping: ' + file);
            return;
        }

        thisref.pushFile(file);
    });
};


/**
 * Pushes a single JSON document into the current TWS database.
 * @param {String} file The file name to be loaded. Note that this will be run
 *     through the CLI's expandPath routine to handle any virtual paths.
 */
Cmd.prototype.pushFile = function(file) {
    var dat,
        doc,
        fullpath;

    fullpath = CLI.expandPath(file);

    if (!CLI.sh.test('-e', fullpath)) {
        this.error('Unable to find ' + fullpath);
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
 * Pushes an actual document object (JSON which has been parsed or a JavaScript
 * POJO) associated with a particular source file path. The path is necessary to
 * ensure that the document at that location is updated with the _id value
 * returned by CouchDB if the upload is successful, or that the _rev is updated.
 * @param {String} fullpath A full absolute path for the source of the document.
 * @param {Object} doc The javascript object to upload as a document.
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
        confirm: false,
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
        this.log('updating: ' + fullpath);

        //  Have to fetch to get the proper _rev to update...
        db.get(doc._id, function(err, response) {
            if (err) {
                //  most common error will be 'missing' document due to
                //  deletion, purge, etc.
                thisref.error(fullpath + ' =>');
                CLI.handleError(err, 'tws', 'push', false);
                return;
            }

            doc._rev = response._rev;

            db.insert(doc, function(err2, response2) {
                if (err2) {
                    thisref.error(fullpath + ' =>');
                    CLI.handleError(err2, 'tws', 'push', false);
                    return;
                }

                thisref.log(fullpath + ' =>\n' + CLI.beautify(response2));

                //  Set the document ID to the response ID so we know it.
                doc._id = response2.id;
                doc._rev = response2.rev;
                CLI.beautify(doc).to(fullpath);
            });

        });
    } else {

        this.log('uploading: ' + fullpath);

        //  No clue...appears to be first time we've inserted this doc.
        db.insert(doc, function(err, response) {
            if (err) {
                thisref.error(fullpath + ' =>');
                CLI.handleError(err, 'tws', 'push', false);
                return;
            }

            thisref.log(fullpath + ' =>\n' + CLI.beautify(response));

            //  Set the document ID to the response ID so we know it.
            doc._id = response.id;
            doc._rev = response.rev;
            CLI.beautify(doc).to(fullpath);
        });
    }

    return;
};


/**
 * Dispatches to a method based on a root and optional flags. For example, when
 * invoked with 'push' and a set of flags such as ['flows', 'tasks'] this method
 * will try to find executePushFlows or executePushTasks based on the command line.
 * @param {String} root The root command to base the search on such as 'push',
 *     'list', etc.
 * @param {Array.<String>} flags The list of flags which can specialize the
 *     root to create a more fine-grained method name.
 * @return {Object} The return value of the specialized method if found.
 */
Cmd.prototype.redispatch = function(root, flags) {
    var subcmd,
        fname;

    this.reparse({
        boolean: flags.slice(0),    // slice to copy. parse will modify.
        default: {}
    });

    //  Get the subcommand operation (which is specified via flag)
    subcmd = this.whichOne(flags);
    if (!subcmd) {
        subcmd = 'usage';
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
