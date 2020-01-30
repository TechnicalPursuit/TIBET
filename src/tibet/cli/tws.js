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

/* eslint indent:0, consistent-this:0 */
/* global emit */

(function() {

'use strict';

var CLI,
    Cmd,
    couch,
    path,
    sh;

CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_couchdb'); // NOTE we inherit from 'couchdb' command.
Cmd.prototype = new Cmd.Parent();

couch = require('../../../etc/helpers/couch_helpers');
path = require('path');
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
                emit(doc.name + '::' + doc.owner);
            }
        }.toString()
    },
    jobs: {
        map: function(doc) {
            if (doc.type === 'job') {
                emit(doc.flow + '::' + doc.owner);
            }
        }.toString()
    },
    jobs_active: {
        map: function(doc) {
            if (doc.type === 'job' &&
                    (doc.state === '$$active' || doc.state === '$$ready')) {
                emit(doc.state);
            }
        }.toString()
    },
    jobs_cancelled: {
        map: function(doc) {
            if (doc.type === 'job' && doc.state === '$$cancelled') {
                emit(doc.state);
            }
        }.toString()
    },
    jobs_failed: {
        map: function(doc) {
            if (doc.type === 'job' && doc.state === '$$failed') {
                emit(doc.state);
            }
        }.toString()
    },
    jobs_complete: {
        map: function(doc) {
            if (doc.type === 'job' && doc.state === '$$complete') {
                emit(doc.state);
            }
        }.toString()
    },
    tasks: {
        map: function(doc) {
            if (doc.type === 'task') {
                emit(doc.name + '::' + doc.owner);
            }
        }.toString()
    }
};

//  ---
//  Instance Attributes
//  ---

//  NOTE the parse options here are just for the 'tws' command itself.
//  Subcommands need to parse via their own set of options.
Cmd.prototype.PARSE_OPTIONS = CLI.blend({}, Cmd.Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet tws <cancel|disable|enable|init|list|push|remove|restart|retry|submit|validate> [<flags>]';


//  ---
//  Instance Methods
//  ---

/**
 * Check arguments and configure default values prior to running prereqs.
 * @returns {Object} An options object usable by the command.
 */
Cmd.prototype.configure = function() {
    var confirm;

    //  Explicit flag always wins.
    if (this.hasArgument('confirm')) {
        this.options.confirm = this.getArgument('confirm');
        this.options;
    } else {
        //  Configuration flag value overrides 'defaults' in PARSE_OPTIONS.
        confirm = CLI.getcfg('cli.tws.confirm');
        if (CLI.isValid(confirm)) {
            this.options.confirm = confirm;
        }
    }

    return this.options;
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
    doc_id = this.getArgument(1);

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
                return;
            });
        }).catch(function(err) {
            CLI.handleError(err, 'tws', 'cancel');
            return;
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
        enabled,
        str;

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
        str = CLI.beautify(JSON.stringify(json));
        (new sh.ShellString(str)).to(file);
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

    doc_id = this.getArgument(1);

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
                return;
            });
        }).catch(function(err) {
            CLI.handleError(err, 'tws', 'enable');
            return;
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
        enabled,
        str;

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
        str = CLI.beautify(JSON.stringify(json));
        (new sh.ShellString(str)).to(file);
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

    doc_id = this.getArgument(1);

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
                return;
            });
        }).catch(function(err) {
            CLI.handleError(err, 'tws', 'enable');
            return;
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

    //  Query for parameters and force confirmation we're going to the correct
    //  target host, db, and app.
    params = couch.getCouchParameters({
        requestor: CLI,
        confirm: this.options.confirm,
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

    doc_id = this.getArgument(1);

    if (CLI.notEmpty(doc_id)) {
        this.dbGet(doc_id).then(function(result) {
            thisref.info(CLI.beautify(result));
        }).catch(function(err) {
            CLI.handleError(err, 'tws', 'list');
            return;
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

    this.dbView('flows', {include_docs: true}).then(function(result) {
        if (thisref.options.verbose) {
            thisref.log(CLI.beautify(result));
        } else {
            result.forEach(function(item) {
                thisref.log(item.doc.name + '::' + item.doc.owner + ' => ' +
                    JSON.stringify(item.doc.tasks.sequence) +
                    thisref.colorize(' (' + item.id + ')', 'gray'));
            });
        }
    }).catch(function(err) {
        CLI.handleError(err, 'tws', 'list');
        return;
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

    this.dbView(viewname, {include_docs: true}).then(function(result) {
        if (thisref.options.verbose) {
            thisref.log(CLI.beautify(result));
        } else {
            result.forEach(function(item) {
                thisref.log(item.doc.flow + '::' + item.doc.owner + ' => ' +
                    (item.doc.state || '$$undefined') +
                    thisref.colorize(' (' + item.id + ')', 'gray'));
            });
        }
    }).catch(function(err) {
        CLI.handleError(err, 'tws', 'list');
        return;
    });
};


/**
 * Lists all known tasks in the TWS database in summary form, or in full
 * document form if the --verbose flag is provided.
 */
Cmd.prototype.executeListTasks = function() {
    var thisref;

    thisref = this;

    this.dbView('tasks', {include_docs: true}).then(function(result) {
        if (thisref.options.verbose) {
            thisref.log(CLI.beautify(result));
        } else {
            result.forEach(function(item) {
                var target;

                if (item.doc.flow) {
                    target = 'flow ' + item.doc.flow;
                } else {
                   target = 'plugin ' + (item.doc.plugin || item.doc.name);
                }

                //  TODO:   add owner when ready
                thisref.log(item.doc.name + ' => ' + target +
                    thisref.colorize(' (' + item.id + ')', 'gray'));
            });
        }
    }).catch(function(err) {
        CLI.handleError(err, 'tws', 'list');
        return;
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

    //  Have to fetch parameters to get the app name for the design doc.
    params = couch.getCouchParameters({
        requestor: CLI,
        confirm: this.options.confirm,
        cfg_root: 'tds.tasks'
    });

    this.dbGet('_design/' + params.db_app, {}, params).then(function(result) {
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
        return;
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

    flags = ['design', 'flows', 'map', 'tasks', 'views'];

    this.reparse({
        boolean: flags.slice(0) // slice to copy since parse will modify.
    });

    id = this.getArgument(1);

    if (CLI.notEmpty(id)) {
        fullpath = CLI.expandPath(id);
        if (!sh.test('-e', fullpath)) {
            this.error('Source path not found: ' + fullpath);
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
        confirm: this.options.confirm,
        cfg_root: 'tds.tasks'
    });

    db_app = params.db_app;

    this.dbGet('_design/' + db_app, {}, params).then(function(result) {
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

        thisref.dbInsert(doc, {}, params).then(function(result2) {
            thisref.log(CLI.beautify(result2));
        }).catch(function(err) {
            CLI.handleError(err, 'push', 'design');
            return;
        });
    }).catch(function(err) {
        if (err.message === 'missing') {
            thisref.error('Design document not found. Did you `tibet tws init` yet?');
        } else {
            CLI.handleError(err, 'push', 'design');
            return;
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
    this.pushDir('~tws/flows', {confirm: false});   //  only confirm once
};


/**
 */
Cmd.prototype.executePushTasks = function() {
    this.pushDir('~tws/tasks');
};


/**
 */
Cmd.prototype.executePushViews = function() {
    return this.executePushDesign();
};


/**
 * Displays usage information for the 'tibet tws push' command.
 */
Cmd.prototype.executePushUsage = function() {
    this.usage('tibet tws push [<path>|--design|--flows|--map|--tasks|--views]');
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
 * substitution slots for any of the params content. There is also a generic
 * prompt to allow you to enter key/value pairs for unlisted parameters.
 */
Cmd.prototype.executeSubmit = function() {
    var file,
        fullpath,
        dat,
        doc,
        thisref,
        prompt,
        params;

    thisref = this;

    file = this.getArgument(1);

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
            this.error('Source path not found: ' + fullpath);
            return;
        }
    }

    dat = sh.cat(fullpath).toString();
    if (!dat) {
        this.error('No content read for file: ' + fullpath);
    }

    try {
        doc = JSON.parse(dat);
    } catch (e) {
        this.error('Error parsing ' + fullpath + ': ' + e.message);
        return;
    }


    //  Helper function to support recursive prompt capability.
    prompt = function(obj, root) {
        var keys;

        if (!CLI.isPlainObject(obj) && !Array.isArray(obj)) {
            return;
        }

        keys = Object.keys(obj);

        keys.forEach(function(key) {
            var val,
                fullkey,
                result;

            //  If the key is a number we have a bit of a hack to try and prompt
            //  by task name rather than task index since it's a common format.
            if (/^\d+$/.test(key) && obj[key].task) {
                fullkey = root !== undefined ?
                    root + '.' + obj[key].task : obj[key].task;
            } else {
                fullkey = root !== undefined ? root + '.' + key : key;
            }

            val = obj[key];
            if (CLI.isPlainObject(val) || Array.isArray(val)) {
                prompt(val, fullkey);
            } else if (typeof val === 'string') {

                result = val.replace(/\[\[[^\]]*\]\]/g, function(match) {
                    var value;

                    value = CLI.prompt.question(match.slice(2, -2) +
                        ' (' + fullkey + ') ? ');
                    value = value.replace(/"/g, '\\"');

                    //  If the value is empty return the original match (e.g. if
                    //  they just hit return without providing new data.
                    return value || match;
                });

                obj[key] = result;
            }
        });
    };

    params = doc.params;
    if (params) {
        //  Rely on helper function to recursively descend and prompt for any
        //  embedded parameter values.
        prompt(params);
    } else {
        doc.params = {};
    }

    //  Force check of database parameters with optional confirmation...

    this.dbInsert(doc).then(function(result) {
        thisref.info(CLI.beautify(result));
    }).catch(function(err) {
        CLI.handleError(err, 'tws', 'submit');
        return;
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
//  Utilities
//  ---

/**
 * Checks a job state and returns true if that state is a 'final' state, meaning
 * the job's state should not be altered further.
 * @param {String} state The job state to check.
 * @returns {Boolean} true if the state is a final state.
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


module.exports = Cmd;

}());
