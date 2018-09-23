/**
 * @overview Functionality specific to running one or more tasks in response
 *     to a trigger. One example is change notifications coming into the TDS
 *     CouchDB module which can choose to activate a task in response.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

//  TODO    add quiet param to dbSave to say ignore errors
//  TODO    how to time out the entire job after 60000 or whatever
//  TODO    capture task runner results as appropriate.
//  TODO    add machine/node name to pid capture
//  TODO    add scan for timed out job documents

(function(root) {

    'use strict';

    /**
     *
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            acceptNextTask,
            acceptTask,
            cleanupJob,
            cleanupTask,
            getCurrentTasks,
            getNextTasks,
            isTaskComplete,
            shouldTaskTimeOut,
            isJobComplete,
            loggedInOrLocalDev,
            failJob,
            failTask,
            remapStdioParams,
            retrieveFlow,
            retrieveTask,
            prepareParams,
            processOwnedTasks,
            refreshTaskState,
            isJobInitialized,
            isOnTaskBoundary,
            dbParams,
            retryTask,
            retryJob,
            canRetry,
            couch,
            db,
            dbGet,
            dbSave,
            dbView,
            db_app,
            // db_config,
            db_host,
            db_name,
            db_port,
            db_scheme,
            db_url,
            doc_name,
            dbError,
            feed,
            feedopts,
            follow,
            processDocumentChange,
            lastSeq,
            files,
            initializeJob,
            logger,
            name,
            meta,
            path,
            Promise,
            server,
            sh,
            taskdir,
            TDS,
            TWS;

        app = options.app;
        TDS = app.TDS;

        loggedInOrLocalDev = options.loggedInOrLocalDev;
        logger = options.logger;

        meta = {
            comp: 'TWS',
            type: 'plugin',
            name: 'tasks'
        };

        //  Even when loaded we need explicit configuration to activate the TWS.
        if (!TDS.cfg('tds.use_tasks')) {
            logger.warn('tds tasks plugin disabled', meta);
            return;
        }

        logger = logger.getContextualLogger(meta);

        //  Specialize the logger methods we provide so they can process jobs as
        //  a first parameter.
        ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'system'
        ].forEach(function(key) {
            var current;

            current = logger[key];
            logger[key] = function() {
                var args,
                    job;

                switch (arguments.length) {
                    case 2:
                        //  Possibly job + message or message + meta
                        job = arguments[0];
                        if (job._id && job.owner && job.flow) {
                            args = [
                                TDS.colorize(job._id, 'dim') + ' ' +
                                    job.flow + '::' + job.owner + ' ' +
                            arguments[1], meta];
                        } else {
                            args = arguments;
                        }
                        break;
                    case 3:
                        //  job + message + meta
                        job = arguments[0];
                        args = [
                            TDS.colorize(job._id, 'dim') + ' ' +
                            job.flow + '::' + job.owner + ' ' +
                        arguments[1], arguments[2]];
                        break;
                    default:
                        args = arguments;
                        break;
                }

                //  Check initial argument for a job object. If found we want to
                //  convert that to an ID and make it part of the message.
                current.apply(TDS.logger, args);
            };
        });

        //  For TWS we need to ensure TDS.encrypt/decrypt will operate.
        try {
            TDS.encrypt('testencryptingthis');
        } catch (e) {
            //  If it failed we'll forward along the message stating the user
            //  needs to export the TIBET_CRYPTO_* variables necessary.
            logger.error(e.message);
            return;
        }

        //  ---
        //  Requires
        //  ---

        path = require('path');
        sh = require('shelljs');
        Promise = require('bluebird');
        follow = require('follow');

        //  Load the TWS surrogate (via the task_helpers module). NOTE this
        //  should only be done once to ensure we keep a unique reference.
        app.TWS = require('../../etc/helpers/task_helpers')(options);
        TWS = app.TWS;

        couch = require('../../etc/helpers/couch_helpers');

        //  ---
        //  Variables
        //  ---

        //  Ensure we have default option slotting for this plugin.
        options.tds_tasks = options.tds_tasks || {};

        dbParams = TDS.getCouchParameters();
        db_url = dbParams.db_url;

        db_name = TDS.cfg('tds.tasks.db_name') || dbParams.db_name;
        db_app = TDS.cfg('tds.tasks.db_app') || dbParams.db_app;
        doc_name = '_design/' + db_app;

        //  ---
        //  CouchDB Helpers
        //  ---

        server = couch.server(db_url);
        db = server.use(db_name);

        /**
         * Common error logging routine to avoid duplication.
         */
        dbError = function(err) {
            var str;

            if (/ECONNREFUSED/.test(JSON.stringify(err))) {
                logger.error('CouchDB connection refused. Check DB at URL: ' +
                    TDS.maskCouchAuth(db_url));
            } else {
                if (err) {
                    try {
                        str = JSON.stringify(err);
                    } catch (err2) {
                        str = '' + err;
                    }
                    logger.error(TDS.beautify(str));
                } else {
                    logger.error('Unspecified CouchDB error.');
                }
            }
        };

        /**
         */
        dbGet = Promise.promisify(db.get);

        /**
         *
         */
        dbSave = function(doc, params) {
            if (TDS.notEmpty(doc._id)) {
                return dbGet(doc._id).then(function(result) {
                    //  ensure we have the latest rev for update.
                    doc._rev = result._rev;
                    return db.insertAsync(doc, params);
                }).catch(function(err) {
                    logger.error('Document update error: ' + err.message);
                    logger.debug(err);
                });
            } else {
                return db.insertAsync(doc, params).catch(function(err) {
                    logger.error('Document insert error: ' + err.message);
                    logger.debug(err);
                });
            }
        };

        /**
         *
         */
        dbView = function(appname, view, params) {
            var promise,
                opts;

            opts = params || {};
            opts.include_docs = true;

            promise = new Promise(function(resolve, reject) {

                db.view(appname, view, opts, function(err, body) {
                    var docs;

                    if (err) {
                        return reject(err);
                    }

                    docs = body.rows.map(function(row) {
                        return row.doc;
                    });
                    return resolve(docs);
                });

            });

            return promise;
        };

        //  ---
        //  Task Helpers
        //  ---

        /*
         */
        acceptNextTask = function(job) {
            var tasks,
                taskdef,
                taskname,
                fullname;

            tasks = getNextTasks(job);

            taskdef = tasks[0];
            if (taskdef) {
                taskname = taskdef.task;
                fullname = taskname + '::' + job.owner;
                //  NOTE we do NOT pass 'fullname' here, just task name. This
                //  lets us search for default/shared implementations in
                //  addition to any owner-specific task.
                retrieveTask(job, taskname, job.owner).then(function(task) {
                    var blended;

                    if (!task) {
                        logger.error(job,
                            'missing task: ' + fullname);
                        failJob(job, 'Missing task ' + fullname);
                        return;
                    }

                    //  Create a properly configured task entry that uses the
                    //  flow taskdef as the baseline and then anything new from
                    //  the task instance (flow params etc. override task).
                    blended = {};
                    blended.task_index = tasks.task_index;
                    blended = TDS.blend(blended, taskdef);
                    blended = TDS.blend(blended, task);

                    acceptTask(job, blended);
                }).catch(function(err) {
                    logger.error(job,
                        'error: ' + err.message +
                        ' fetching/accepting task: ' + fullname);
                    logger.debug(err);
                });
            } else if (!isJobComplete(job)) {
                //  No next task or last task failed so we have an empty Array.
                //  If last task failed, the job will have already been
                //  completed during cleanupTask processing.
                cleanupJob(job);
            }
        };

        /*
         */
        acceptTask = function(job, task) {
            var step,
                plugin,
                runner,
                state;

            //  See if the task uses a different plugin for require().
            plugin = task.plugin || task.name;

            //  Verify we have the named plugin available, otherwise we can't
            //  process this particular task (which is ok..not an error).
            runner = TDS.workflow.tasks[plugin];
            if (!runner) {
                logger.error(job, 'task runner not found: ' +
                    plugin);
                return;
            }

            //  Accepting a task means copying it into the steps list and
            //  putting our process.pid on it along with state info as needed.
            try {
                step = JSON.parse(JSON.stringify(task));
            } catch (e) {
                logger.error(job, 'error copying task: ' +
                    e.message);
                logger.debug(e);
                return;
            }
            step.pid = process.pid;
            step.start = Date.now();
            step.index = job.steps.length;

            job.state = task.name + '-' + job.steps.length;

            step.params = prepareParams(job, step, task);
            //  If the task has a guard expression we need to evaluate that.
            //  When it's true we continue processing with a status of ready but
            //  when it's false we set the status to skipped for that task.
            state = '$$ready';
            if (task.guards) {
                task.guards.some(function(guard) {
                    if (TDS.notEmpty(guard.test)) {
                        if (!TWS.Evaluator.evaluate(guard.test,
                                {
                                    job: job,
                                    step: step,
                                    params: step.params
                                })) {

                            state = guard.state || '$$skipped';
                            return true;
                        }
                    }
                    return false;
                });
            }
            step.state = state;

            //  If guard set the step to a finished state (skipped, failed, etc.)
            //  then we want to ensure we set an end timestamp.
            if (isTaskComplete(job, step)) {
                step.end = Date.now();
            }
            job.steps.push(step);

            dbSave(job);
        };

        /*
         */
        canRetry = function(obj) {
            return obj && obj.retry !== undefined && obj.retry > 0;
        };

        /*
         */
        cleanupJob = function(job, state) {
            var status,
                failed,
                code,
                errname;

            //  Determine state. If we were provided one that's great but if not
            //  we need to scan the last task/step to see its state.
            status = state || job.steps[job.steps.length - 1].state;

            switch (status) {
                case '$$timeout':
                    failed = true;
                    code = 1;
                    break;
                case '$$error':
                    failed = true;
                    code = 2;
                    break;
                case '$$failed':
                    failed = true;
                    code = 2;
                    break;
                default:
                    code = 0;
                    break;
            }

            //  If there's error tasking we can try to run that as a
            //  cleanup/notification step.
            if (failed && job.error) {
                errname = job.error + '::' + job.owner;
                //  NOTE job.error is a task reference.
                retrieveTask(job, job.error, job.owner).then(function(errtask) {
                    if (!errtask) {
                        logger.error(job,
                            'missing task: ' + errname);
                        failJob(job, 'Missing task ' + errname);
                        return;
                    }
                    acceptTask(job, errtask);
                }).catch(function(err) {
                    logger.error(job,
                        'error: ' + err.message +
                        ' fetching task: ' + errname);
                });
                return;
            }

            //  No job-level error tasks. We're truly done. Need to update final
            //  state to stop processing for this job. The exit slot is used to
            //  signify final success/failure code.
            job.state = failed ? '$$failed' : '$$complete';
            job.exit = code;
            job.end = Date.now();

            logger.debug(job, TDS.beautify(job));

            dbSave(job);
        };

        /*
         */
        cleanupTask = function(job, task) {
            var errname;

            //  Task is "done" in that it's either timed out or errored out and
            //  it can't be retried (or it did retry but is out of chances now).

            //  If there's error tasking we can try to run that as a
            //  cleanup/notification step.
            if (task.error) {
                errname = task.error + '::' + job.owner;
                retrieveTask(job, task.error, job.owner).then(function(errtask) {
                    if (!errtask) {
                        logger.error(job,
                            'missing task: ' + errname);
                        failJob(job, 'Missing task ' + errname);
                        return;
                    }

                    //  NOTE since task.error is a task reference if we end up
                    //  with the same task name and owner we're going to recurse
                    if (errtask.name === task.name &&
                            errtask.owner === task.owner) {
                        logger.error(job,
                            'recursive task error definition: ' + errname);
                        failJob(job, 'Recursive task error definition ' +
                            errname);
                        return;
                    }

                    acceptTask(job, errtask);
                }).catch(function(err) {
                    logger.error(job,
                        'error: ' + err +
                        ' fetching task: ' + errname);
                });
                return;
            }

            //  No task-level error handler so promote to job level.
            if (canRetry(job)) {
                retryJob(job);
            } else {
                //  NOTE we pass task state here to simplify update of job.
                cleanupJob(job, task.state);
            }
        };

        /*
         */
        failJob = function(job, reason) {
            logger.error(job, 'failed: ' + reason);

            job.state = '$$failed';
            job.result = reason;
            job.end = Date.now();

            dbSave(job);
        };

        /*
         */
        failTask = function(job, task, reason, taskMeta) {
            logger.error(job,
                job.state + ' failed: ' + reason,
                taskMeta);

            task.state = '$$error';
            task.result = reason || 'Unspecified error';
            task.end = Date.now();

            dbSave(job);
        };

        /*
         * Returns an array of all task steps for the job which are not yet
         * complete. Note that steps which are timed out or which have errored
         * out are considered 'complete' in that no more work (or state changes)
         * will occur on those particular steps. Retry and/or error handling
         * causes new steps to be created so the audit trail for the job shows
         * every step (including those that failed and restarted/were handled).
         * @param {Job} job The job data to query for active steps.
         * @returns {Array.<step>} An array of step entries.
         */
        getCurrentTasks = function(job) {
            var steps;

            steps = job.steps;
            if (!steps) {
                return [];
            }

            return steps.filter(function(step) {
                return !isTaskComplete(job, step);
            });
        };

        /*
         * Computes which task or tasks should be processed next for the job.
         * The current version really only does a single sequence structure so
         * the array will contain at most 1 entry...for now. Future versions may
         * add support for async parallel tasks from a sequence or state
         * machine structure.
         * @param {Job} The job to analyze for task work.
         * @returns {Array} The list of available tasks to be processed next.
         */
        getNextTasks = function(job) {
            var tasks,
                steps,
                found,
                size,
                last,
                next,
                list,
                i,
                len,
                arr;

            //  Make a copy here...we don't want to change it.
            steps = job.steps.slice(0);
            arr = [];

            tasks = job.tasks;
            switch (tasks.structure) {

                case 'sequence':
                    //  Sequence means simple array of items...however it gets
                    //  tricky in that we have to consider things like states of
                    //  $$error, $$timeout, and retry or error task sequencing.
                    size = steps.length;
                    last = steps[size - 1];

                    //  No steps so far? First task in the list :)
                    if (!last) {
                        arr.task_index = 0;
                        arr.push(tasks.sequence[0]);
                        return arr;
                    }

                    switch (last.state) {

                        case '$$ready':
                            //  Not started. New task not supported until we
                            //  add support for parallel tasks.
                            break;

                        case '$$active':
                            //  Still running. New task not supported until we
                            //  add support for parallel tasks.
                            break;

                        case '$$timeout':

                            //  We will get either a task retry step, a task
                            //  error step, a job retry step, a job error step,
                            //  or a propogation of failure to the job level.
                            if (canRetry(last)) {
                                retryTask(job, last);
                            } else {
                                cleanupTask(job, last);
                            }
                            break;

                        case '$$error':

                            //  We will get either a task retry step, a task
                            //  error step, a job retry step, a job error step,
                            //  or a propogation of failure to the job level.
                            if (canRetry(last)) {
                                retryTask(job, last);
                            } else {
                                cleanupTask(job, last);
                            }
                            break;

                        case '$$failed':

                            //  NOTE no retry attempt here.
                            cleanupTask(job, last);
                            break;

                        case '$$skipped':
                            //  Fall through. Skipped at the task level is
                            //  equivalent to complete for this check.
                            /* eslint-disable no-fallthrough */
                            void 0;
                            /* eslint-enable no-fallthrough */
                        case '$$complete':
                            //  Last task has completed so we need next one.
                            //  Which task we pluck depends on how many we've
                            //  done that weren't retries or error handlers.

                            //  If there's any step in state '$$error' the main
                            //  task list is no longer relevant and error
                            //  process takes care of that.
                            found = steps.some(function(step) {
                                return step.state === '$$error';
                            });

                            if (found) {
                                break;
                            }

                            len = steps.length;

                            list = tasks.sequence.slice(0);

                            //  For each $$complete found we throw away a task.
                            //  Whatever's the first one in the list once we're
                            //  out of previously run steps (if there are
                            //  any) is the next task to run.
                            for (i = 0; i < len; i++) {
                                if (steps[i].state === '$$complete' ||
                                    steps[i].state === '$$skipped') {
                                    list.shift();
                                }
                            }

                            next = list[0];
                            if (next !== undefined) {
                                arr.task_index = i;
                                arr.push(next);
                            }
                            break;

                        default:

                            //  Something unexpected.
                            logger.error(job,
                                'unexpected task state: ' +
                                last.name + ' -> ' + last.state);
                            break;
                    }

                    break;
                default:
                    logger.error(job,
                        'unsupported task structure: ' + tasks.structure);
                    break;
            }

            return arr;
        };

        /*
         */
        initializeJob = function(job) {

            logger.debug(job, 'initializing');

            //  Get the job's flow document. We need to copy the current task
            //  definition for the flow into the job instance.
            retrieveFlow(job, job.flow, job.owner).then(function(flow) {

                if (!flow) {
                    logger.error(job,
                        'references missing flow: ' +
                        job.flow + '::' + job.owner);
                    failJob(job, 'Missing flow ' + job.flow + '::' + job.owner);
                    return;
                }

                if (flow.enabled === false) {
                    logger.error(job,
                        'references disabled flow: ' +
                        job.flow + '::' + job.owner);
                    failJob(job, 'Disabled flow ' + job.flow + '::' + job.owner);
                    return;
                }

                //  Snapshot the flow properties. This ensures we don't allow
                //  job submissions to alter the configured nature of the flow
                //  except with respect to things in the params block.
                job.tasks = flow.tasks;
                job.error = flow.error;
                job.retry = flow.retry;
                job.timeout = flow.timeout;

                //  Map any flow parameter defaults into the job. Additional
                //  params processing will occur as steps are processed.
                if (flow.params) {
                    if (job.params) {
                        TDS.blend(job.params, flow.params);
                    } else {
                        job.params = TDS.blend({}, flow.params);
                    }
                }

                job.state = '$$ready';
                job.start = Date.now();
                job.steps = [];

                dbSave(job);

            }).catch(function(err) {
                logger.error(job,
                    'error: ' + err.message);
            });
        };

        isJobComplete = function(job) {
            return job.state === '$$complete' || job.state === '$$failed';
        };

        /*
         */
        isJobInitialized = function(job) {
            return job.state !== undefined && job.start !== undefined;
        };

        /*
         */
        isOnTaskBoundary = function(job) {
            var actives;

            //  Not initialized? Not ready for work yet.
            if (!isJobInitialized(job)) {
                return false;
            }

            //  Waiting for first task, current task has timed out so a retry
            //  task is potentially in the works, or errored out so an error
            //  task is potentially going to be run. In all cases we allow all
            //  processes to compete for whatever work comes next.
            if (['$$ready', '$$timeout', '$$error', '$$failed'].indexOf(job.state) !== -1) {
                return true;
            }

            //  Job status isn't sufficient to determine the answer, have to
            //  explore the state of the current tasks/steps being processed.
            actives = getCurrentTasks(job);

            return actives.length === 0;
        };

        /*
         */
        isTaskComplete = function(job, task) {
            //  Tasks don't proceed after being set to an error or timeout, they
            //  can retry but that creates a new task, it doesn't continue using
            //  the one that errored or timed out.
            return ['$$skipped', '$$complete', '$$timeout', '$$error', '$$failed'].indexOf(
                task.state) !== -1;
        };

        /*
         */
        shouldTaskTimeOut = function(job, task) {
            //  States like $$ready and $$active could wait forever, but other
            //  concrete states imply the task is finished in some form and can
            //  not be timed out (it might already be..but that's different).
            if (['$$skipped', '$$complete', '$$error', '$$failed', '$$timeout'].indexOf(
                    task.state) !== -1) {
                return false;
            }

            //  Ended, or never started? Not timed out.
            if (task.end || !task.start) {
                return false;
            }

            //  TODO    where to look up this timeout default?
            return Date.now() - task.start > (task.timeout || 15000);
        };

        /*
         */
        prepareParams = function(job, step, task) {

            var params,
                result,
                index,
                structure,
                block,
                text,
                template,
                output;

            //  Blend any task-specific parameters from the job into the
            //  step logic. The step data ultimately drives task runners. NOTE
            //  the order here matters since TDS.blend will _not_ replace
            //  existing values, so we want to put in job values first, then any
            //  task values so they act as defaults for missing values only.

            //  We connect step output to step input via 'stdio' mappings
            //  optionally provided in the task and/or flow definitions.
            //  NOTE: do this first so stdout is in params before templating
            //  or other parameter assignment operations below.
            params = remapStdioParams(job, step, {});

            index = step.index;
            structure = job.tasks.structure;

            switch (structure) {
                case 'sequence':

                    //  Essentially looking for the same structure pattern here
                    //  as the one used in 'flow' docs. Job should match flow.
                    if (job.params && job.params.tasks) {
                        if (job.params.tasks.structure) {
                            if (job.params.tasks.structure === structure) {
                                //  For sequence we expect a block with a task
                                //  key and params key. the task should match.
                                block = job.params.tasks[structure][index];
                                if (!block) {
                                    throw new Error(
                                        'Job param sequence missing index ' +
                                        index);
                                } else if (block.task === task.name) {
                                    TDS.blend(params, block.params);
                                } else {
                                    throw new Error(
                                        'Job param sequence out of order.' +
                                        block.task + ' !== ' + task.name + '.');
                                }
                            } else {
                                throw new Error(
                                    'Job task/param structure mismatch');
                            }
                        } else {
                            //  Not using a structure in params block is how
                            //  older versions worked...
                            throw new Error('Invalid job params block.' +
                                ' No \'structure\' key present.');
                        }
                    }

                    break;
                default:
                    throw new Error('Unsupported task structure: ' + structure);
            }

            //  Blend in anything not specified by job/flow parameters.
            if (task.params) {
                TDS.blend(params, task.params);
            }

            //  Remap again to process anything dependent on full param list.
            params = remapStdioParams(job, step, params);

            //  Now, we interpolate any parameter values that we find, using
            //  job, step and params as objects that can be referenced in those
            //  values.

            text = JSON.stringify(params);

            try {
                template = TDS.template.compile(text);
            } catch (e) {
                logger.error('Error compiling job parameter template:\n\n' +
                    text + '\n');
                logger.error(e.message);
                throw e;
            }

            try {
                result = template({
                    job: job,
                    step: step,
                    params: params
                });
            } catch (e) {
                logger.error('Error invoking job parameter template:\n\n' +
                    template + '\n');
                logger.error(e.message);
                throw e;
            }

            //  Embedded newlines in the template can cause JSON.parse to have
            //  issues so make sure we don't have any after template execution.
            result = result.replace(/\n/g, '\\n');

            //  Note here that we allow embedded templates, but because of
            //  escaping issues with JSON and Handlebars, we require these
            //  to be written with double square brackets ('[[...]]')
            //  and we need to replace them with double curly brackets
            //  ('{{...}}') before sending them to the task runners.
            output = result.replace(/\[\[(.+?)\]\]/g, '{{$1}}');

            try {
                params = JSON.parse(output);
            } catch (e) {
                logger.error('Error parsing job parameter template:\n\n' + output);
                logger.error(e.message);

                //  Having JSON.parse problems? Dump the string.
                if (/Unexpected token/i.test(e.message)) {
                    output.split('').forEach(function(char, ndx) {
                        logger.error(ndx + ' => ' + char);
                    });
                }

                throw e;
            }

            return params;
        };

        /**
         * Handles document changes in the CouchDB change feed which are NOT
         * related to the project's design document.
         * @param {Object} change The follow library change descriptor.
         */
        processDocumentChange = function(change) {
            logger.trace('CouchDB change:\n' + TDS.beautify(change));

            process.nextTick(function() {
                TDS.workflow(change.doc);
            });

            return;
        };

        /*
         */
        processOwnedTasks = function(job) {
            var steps,
                pid,
                plugin,
                runner,
                params,
                timeout,
                stepMeta,
                step;

            pid = process.pid;
            steps = job.steps;
            steps = steps.filter(function(item) {
                return item.pid === pid && !isTaskComplete(job, item);
            });

            step = steps[0];
            if (!step) {
                return;
            }

            stepMeta = {
                comp: 'TWS',
                type: 'task',
                name: job.state
            };

            plugin = step.plugin || step.name;

            runner = TDS.workflow.tasks[plugin];
            if (!runner) {
                logger.error(job,
                    'process ' + process.pid +
                    ' unable to find runner for: ' + step.name, stepMeta);
                failTask(job, step, 'Unable to locate task runner: ' +
                    runner, stepMeta);
                return;
            }

            //  Ensure plugins know which DB params etc. to use.
            params = {
                db_scheme: db_scheme,
                db_host: db_host,
                db_port: db_port,
                db_url: db_url,
                db_name: db_name,
                db_app: db_app
            };

            //  Blend in step parameters (which already include job and flow
            //  params that fill in any gaps) so we have a single block.
            params = TDS.blend(params, step.params);

            //  TODO    where to look up this timeout default?
            timeout = step.timeout || 15000;

            try {
                runner(job, step, params).timeout(timeout).then(
                function(result) {
                    logger.debug(job,
                        'step succeeded', stepMeta);
                }).catch(
                function(err) {
                    logger.error(job,
                        'step failed', stepMeta);
                    throw err;
                }).then(
                function() {

                    step.end = Date.now();
                    step.state = '$$complete';

                    db.insert(job, function(err, body) {
                        if (err) {
                            logger.error(job,
                                'db update failed: ' +
                                err.message, stepMeta);
                            logger.debug(job, 'step complete', stepMeta);
                            return;
                        }

                        logger.debug(job, 'db update succeeded', stepMeta);
                        logger.debug(job, 'step complete', stepMeta);
                    });

                }).catch(Promise.TimeoutError, function(err) {
                    logger.warn(job,
                        'timed out', stepMeta);
                    step.state = '$$timeout';
                    dbSave(job);
                }).catch(function(err) {
                    failTask(job, step, err.message, stepMeta);
                });
            } catch (e) {
                //  Invalid runner...likely failed to return a promise.
                failTask(job, step, e.message, stepMeta);
            }
        };

        /*
         */
        refreshTaskState = function(job) {
            var steps;

            //  If we find tasks with incorrect state (they've timed out
            //  basically) we update and save, returning true to tell callers
            //  they should stop and wait for updates to propogate.

            steps = job.steps;
            steps = steps.filter(function(step) {
                return shouldTaskTimeOut(job, step);
            });

            if (steps.length > 0) {
                logger.warn(job,
                    'found timed out tasks: ' +
                    '[' +
                        steps.map(
                            function(step) {
                                return step.name;
                            }).join(', ') +
                    ']');

                steps.forEach(function(step) {
                    step.state = '$$timeout';
                });

                dbSave(job);

                return true;
            }

            return false;
        };

        /*
         */
        remapStdioParams = function(job, step, params) {
            var stdout,
                prior,
                map,
                keys;

            map = step.stdio;
            if (!map) {
                return params;
            }

            //  Either use stdout from prior step or the top-level job params as
            //  stdout/stdin for the first step.
            prior = job.steps[job.steps.length - 1];
            if (!prior || !prior.stdout) {
                stdout = job.params;
            } else {
                stdout = prior.stdout;
            }

            //  For each key in the map take any stdout data for that key and
            //  place it in the remapped target location in params.
            keys = Object.keys(map);
            keys.forEach(function(src) {
                var obj,
                    target,
                    parts,
                    tail,
                    len,
                    i,
                    key,
                    val;

                //  Remappings from job.params need to use a different target
                if (/^job\./.test(src) || src === 'job') {
                    val = {job: job};
                } else if (/^step\./.test(src) || src === 'step') {
                    val = {step: step};
                } else if (/^params\./.test(src) || src === 'params') {
                    val = {params: params};
                } else {
                    val = stdout;
                }

                //  See if there's a target mapped for that key...if not then
                //  the key isn't really mapped or is masked off.
                target = map[src];
                if (target === null || target === undefined || target === '') {
                    return;
                }

                //  Search the 'val' object for the value of the source key.
                //  If we find it we have something to map.
                parts = src.split('.');
                len = parts.length;
                for (i = 0; i < len; i++) {
                    key = parts[i];
                    if (val !== null && val !== undefined &&
                            val.hasOwnProperty(key)) {
                        val = val[key];
                    } else {
                        //  not found, nothing to map for this key.
                        return;
                    }
                }

                //  If final value was undefined there's nothing to map. Other
                //  values like null, '', etc. are still considered mappable.
                if (val === undefined) {
                    return;
                }

                //  Based on the target key we alter the target location for the
                //  mapping. This allows you to map from stdout/params up into
                //  the job or step for example.
                if (/^job\.params\./.test(target)) {
                    target = target.slice('job.params.'.length);
                    obj = job.params;
                } else if (/^step\.params\./.test(target)) {
                    target = target.slice('step.params.'.length);
                    obj = step.params;
                } else if (/^params\./.test(target)) {
                    target = target.slice('params.'.length);
                    obj = params;
                } else {
                    //  NOTE not stdout here...
                    obj = params;
                }

                //  We'll be traversing down into 'obj', building as we go
                //  through the target path, then placing 'val' at that slot.
                parts = target.split('.');
                tail = parts[parts.length - 1];
                parts = parts.slice(0, -1);
                len = parts.length;

                for (i = 0; i < len; i++) {
                    key = parts[i];
                    if (obj.hasOwnProperty(key)) {
                        obj = obj[key];
                    } else {
                        obj[key] = {};
                        obj = obj[key];
                    }
                }

                if (obj) {
                    obj[tail] = val;
                }
            });

            //  NOTE we do NOT return 'obj' here. It might be anything including
            //  the job object. We want to return only the true params object.
            return params;
        };

        /*
         */
        retrieveFlow = function(job, flow, owner) {

            return dbView(db_app, 'flows', {keys: [flow + '::' + owner]}).then(
            function(result) {
                //  Result should be the docs from the db.view call.
                //  There should be only one so pass first one along.
                return result[0];
            }).catch(function(err) {
                logger.error(job,
                    'error: ' + err +
                    ' fetching flow: ' + flow + '::' + owner);
                return;
            });
        };

        /*
         */
        retrieveTask = function(job, task, owner) {
            return dbView(db_app, 'tasks',
                {keys: [task + '::' + owner, task + '::DEFAULT']}).then(
            function(result) {
                //  Result should be the docs from the db.view call.
                //  If there are two docs then there is a specifically owned
                //  version as well as a DEFAULT version.
                switch (result.length) {
                    case 0:
                        return;
                    case 1:
                        return result[0];
                    default:
                        if (result[0].owner === 'DEFAULT') {
                            return result[1];
                        } else {
                            return result[0];
                        }
                }
            }).catch(function(err) {
                logger.error(job,
                    'error: ' + err +
                    ' fetching task: ' + task + '::' + owner);
                return;
            });
        };

        /*
         */
        retryJob = function(job) {
            //  TODO
            logger.debug(job,
                'retryJob');

            return;
        };

        /*
         */
        retryTask = function(job, task) {
            var count,
                retryStep;

            count = task.retry;
            if (count === undefined || count <= 0) {
                return cleanupTask(job, task);
            }

            //  Create a new step instance, clearing any state etc. and dropping
            //  the retry count by 1.
            try {
                retryStep = JSON.parse(JSON.stringify(task));
            } catch (e) {
                logger.error(job, 'error copying task: ' +
                    e.message);

                return;
            }
            retryStep.state = '$$ready';
            retryStep.start = Date.now();
            retryStep.end = undefined;
            retryStep.retry = count - 1;

            retryStep.index = job.steps.length;
            job.state = task.name + '-' + retryStep.index;

            retryStep.params = prepareParams(job, retryStep, task);

            job.steps.push(retryStep);

            //  Saving the job with the new step in place should trigger a
            //  process to pick it up and try to run with it :)
            dbSave(job);
        };

        //  ---
        //  Workflow Engine
        //  ---

        /**
         *
         */
        TDS.workflow = function(json) {
            var job;

            //  Only process objects representing 'jobs'
            if (!json || json.type !== 'job') {
                return;
            }
            job = json;

            //  Notify any subscribers that activity has occurred on this job.
            TWS.Job.notify(job);

            switch (job.state) {
                case '$$ready':
                    //  No tasks running yet but ready for first one. Competing
                    //  with other processes to accept next available task.
                    acceptNextTask(job);
                    break;
                case '$$timeout':
                    //  Job timed out. Retry if possible, else clean up.
                    if (canRetry(job)) {
                        retryJob(job);
                    } else {
                        cleanupJob(job, job.state);
                    }
                    break;
                case '$$error':
                    //  Job errored out. Retry if possible, else clean up.
                    if (canRetry(job)) {
                        retryJob(job);
                    } else {
                        cleanupJob(job, job.state);
                    }
                    break;
                case '$$cancelled':
                    //  No work to do, job cancelled.
                    logger.warn(job, 'cancelled');
                    break;
                case '$$paused':
                    //  No work to do..at present. Job is paused. Needs state
                    //  change to trigger a new review and job continuation.
                    logger.warn(job, 'paused');
                    break;
                case '$$failed':
                    //  Failed means missing task or error handler, or a
                    //  timeout/error for that last task. Either way no retry.
                    logger.error(job, 'failed');
                    break;
                case '$$complete':
                    logger.info(job, 'complete');
                    break;
                case '$$undefined':
                    //  fallthrough
                case undefined:
                    if (!isJobInitialized(job)) {
                        initializeJob(job);
                    } else {
                        logger.error(job,
                            'undefined job state');
                    }
                    break;
                default:

                    //  Time out any overdue tasks. This may affect whether we
                    //  then consider the job to be on a task boundary. The
                    //  return value from this operation will tell us if any
                    //  were updated, and if so we just wait for next cycle.
                    if (refreshTaskState(job)) {
                        return;
                    }

                    //  Active at a task level, have to check task(s) status.
                    if (isOnTaskBoundary(job)) {
                        //  Compete with other processes to accept next task.
                        return acceptNextTask(job);
                    }

                    //  Not on a boundary, do appropriate work for tasks we own.
                    processOwnedTasks(job);
            }

            return;
        };

        /**
         * Simple dictionary of loaded task handlers by name.
         */
        TDS.workflow.tasks = {};


        //  ---
        //  Task Loading
        //  ---

        taskdir = TDS.expandPath('~tds_tasks');

        if (sh.test('-d', taskdir)) {
            files = sh.ls(taskdir);
            files.sort().forEach(function(file) {
                var taskMeta;

                //  Ignore directories
                if (TDS.shell.test('-d', path.join(taskdir, file))) {
                    return;
                }

                //  Ignore files that aren't js source
                if (!/\./.test(file)) {
                    return;
                }

                name = file.slice(0, file.lastIndexOf('.'));

                //  Ignore hidden or 'sample/helper' files.
                if (name.match(/^(\.|_)/) ||
                        name.match(/~$/) ||            //  tilde files for vi etc.
                        name.match(/\.sw(.{1})$/) ||   //  swap files for vi etc.
                        sh.test('-d', file)) {
                    return;
                }

                taskMeta = {
                    comp: 'TWS',
                    type: 'task',
                    name: name
                };

                logger.system('loading task', taskMeta);

                options.logger = logger.getContextualLogger(taskMeta);

                try {
                    TDS.workflow.tasks[name] =
                        require(path.join(taskdir, file))(options);
                } catch (e) {
                    logger.error('Error loading task: ' + name);
                    logger.error(e.message);
                    logger.debug(e.stack);
                    return;
                }
            });
        }

        //  ---
        //  Task DB Change Feed
        //  ---

        feedopts = {
            db: db_url + '/' + db_name,
        //    feed: TDS.getcfg('tds.tasks.watch.feed') || 'continuous',
            heartbeat: TDS.getcfg('tds.tasks.watch.heartbeat') || 1000,
            confirm_timeout: TDS.getcfg('tds.tasks.watch.confirm_timeout') || 5000,
        //    inactivity_ms: TDS.getcfg('tds.tasks.watch.inactivity_ms') || null,
        //    initial_retry_delay: TDS.getcfg('tds.tasks.watch.initial_retry_delay') || 1000,
        //    max_retry_seconds: TDS.getcfg('tds.tasks.watch.max_retry_seconds') || 360,
        //    response_grace_time: TDS.getcfg('tds.tasks.watch.response_grace_time') || 5000,
            since: 'now'
        };

        feed = new follow.Feed(feedopts);

        //  Capture the 'seq' so we can test numerically
        lastSeq = parseInt(feedopts.since, 10);
        if (isNaN(lastSeq)) {
            lastSeq = 0;
        }

        /**
         * Filters potential changes feed entries before triggering on(change).
         * @param {Object} doc The CouchDB document to potentially filter.
         */
        feed.filter = function(doc) {
            var filter,
                escaper,
                regex,
                result;

            /**
             * Helper function for escaping regex metacharacters for patterns.
             * NOTE that we need to take "ignore format" things like path/* and
             * make it path/.* or the regex will fail.
             */
            escaper = function(str) {
                return str.replace(
                    /\*/g, '.*').replace(
                    /\./g, '\\.').replace(
                    /\//g, '\\/');
            };

            filter = TDS.cfg('tds.tasks.watch.filter');
            if (filter) {
                regex = new RegExp(escaper(filter));
                if (regex) {
                    result = regex.test(doc._id);
                    if (!result) {
                        logger.debug('Filtering change: ' + TDS.beautify(doc));
                    }
                    return result;
                }
            }

            return true;
        };


        /**
         * Responds to notifications that the change feed has caught up and that
         * no unprocessed changes remain.
         */
        feed.on('catchup', function(seq) {
            return;
        });


        /**
         * Responds to change notifications from the CouchDB changes feed. The
         * data is checked against the last known change and the delta is
         * computed to determine a set of added, removed, renamed, and updated
         * attachments which may need attention. The resulting changes are then
         * made to the local file system to maintain synchronization between the
         * file system and CouchDB.
         * @param {Object} change The follow library change descriptor.
         */
        feed.on('change', function(change) {
            var design;

            design = change.doc._id === doc_name;
            if (design) {
                return;
            }

            return processDocumentChange(change);
        });


        /**
         * Responds to notification that the feed has confirmed the database to
         * be watched and operation can continue.
         */
        feed.on('confirm', function() {
            logger.system(TDS.maskCouchAuth(feedopts.db) +
                ' database connection confirmed.');
            return;
        });


        /**
         * Responds to notifications of an error in the CouchDB changes feed
         * processing.
         * @param {Error} err The error that triggered this handler.
         */
        feed.on('error', function(err) {
            var str;

            //  A common problem, especially on Macs, is an error due to running
            //  out of open file handles. Try to help clarify that one here.
            str = JSON.stringify(err);
            if (/EMFILE/.test(str)) {
                logger.error('Too many files open. Try increasing ulimit.');
            } else {
                dbError(err);
            }

            return true;
        });


        /**
         */
        feed.on('retry', function(info) {
            return;
        });


        /**
         * Responds to notifications to stop operation. We check this to see if
         * the database confirmation was successful and if not we try
         * restarting.
         */
        feed.on('stop', function(change) {
            return;
        });


        /**
         */
        feed.on('timeout', function(info) {
            return;
        });

        //  Activate the database changes feed follower.
        try {
            logger.system('TWS CouchDB interface watching ' +
                TDS.maskCouchAuth(feedopts.db) +
                ' changes > ' + feedopts.since);

            feed.follow();
        } catch (e) {
            dbError(e);
        }

        //  ---
        //  Shutdown
        //  ---

        TDS.addShutdownHook(function(serv) {
            var msg;

            msg = 'shutting down TWS change feed follower';
            meta.style = 'error';

            serv.logger.system(msg, meta);
            if (!TDS.hasConsole()) {
                process.stdout.write(TDS.colorize(msg, 'error'));
            }
        });


        //  ---
        //  Middleware
        //  ---

        TDS.workflow.job = function(req, res, next) {

            var body,
                job;

            body = req.body;
            switch (typeof body) {
                case 'string':
                    //  Could be bad header (text not json)
                    try {
                        job = JSON.parse(body);
                    } catch (e) {
                        res.status(400).send(e.message);

                        //  Having JSON.parse problems? Dump the string.
                        if (/Unexpected token/i.test(e.message)) {
                            body.split('').forEach(function(char, ndx) {
                                logger.error(ndx + ' => ' + char);
                            });
                        }

                        return;
                    }
                    break;
                case 'undefined':
                    //  Something went wrong in request.
                    res.status(400).send('Undefined request body.');
                    return;
                default:
                    //  Should be a json-parsed object.
                    job = body;
                    break;
            }

            dbSave(job).then(function(result) {
                res.status(201).end();    //  created :)
            },
            function(err) {
                //  TODO:   refine error code here based on actual error.
                res.status(500).send(err);
            });

            return;
        };

        //  ---
        //  Routes
        //  ---

        app.post(TDS.cfg('tds.tasks.job.uri'), loggedInOrLocalDev,
            options.parsers.json, TDS.workflow.job);
    };

}(this));

