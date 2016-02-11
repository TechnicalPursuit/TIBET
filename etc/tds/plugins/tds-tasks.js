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

//  TODO    ensure params work for a job (and tasks in job by key)
//  TODO    add quiet param to dbSave to say ignore errors
//  TODO    ensure catch() blocks for all promises, esp. dbSave.
//  TODO    how to time out the entire job after 60000 or whatever
//  TODO    test error processing
//  TODO    clean up logging around pid, task/step name, etc.
//  TODO    capture task runner results as appropriate.
//  TODO    add machine/node name to pid capture
//  TODO    add $$cancelled state to support job cancellation
//  TODO    add $$paused state to support pause at next step
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
            expandParams,
            getCurrentTasks,
            getNextTasks,
            isTaskComplete,
            shouldTaskTimeOut,
            isJobComplete,
            loggedIn,
            failTask,
            retrieveFlow,
            retrieveTask,
            processOwnedTasks,
            refreshTaskState,
            isJobInitialized,
            isOnTaskBoundary,
            retryTask,
            retryJob,
            canRetry,
            db,
            dbGet,
            dbSave,
            dbView,
            db_app,
            db_config,
            db_host,
            db_name,
            db_port,
            db_scheme,
            db_url,
            doc_name,
            files,
            initializeJob,
            //loggedIn,
            logger,
            name,
            nano,
            path,
            Promise,
            sh,
            taskdir,
            TDS;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        loggedIn = options.loggedIn;
        logger = options.logger;
        TDS = app.TDS;

        if (TDS.cfg('tds.use.tasks') !== true) {
            return;
        }
        logger.debug('Integrating TDS workflow system.');

        //  ---
        //  Requires
        //  ---

        path = require('path');
        sh = require('shelljs');
        Promise = require('bluebird');

        //  ---
        //  Variables
        //  ---

        //  Ensure we have default option slotting for this plugin.
        options.tds_tasks = options.tds_tasks || {};

        //  Build up from config or defaults as needed.
        db_scheme = TDS.getcfg('couch.scheme') || 'http';
        db_host = TDS.getcfg('couch.host') || '127.0.0.1';
        db_port = TDS.getcfg('couch.port') || '5984';

        db_url = db_scheme + '://' + db_host + ':' + db_port;

        db_name = TDS.getcfg('couch.db_name') || TDS.getcfg('npm.name');
        db_app = TDS.getcfg('couch.app_name') || 'app';

        doc_name = '_design/' + db_app;

        //  ---
        //  CouchDB Helpers
        //  ---

        nano = require('nano')(db_url);
        db = nano.use(db_name);

        dbGet = Promise.promisify(db.get);

        /**
         *
         */
        dbSave = function(doc, params) {
            var promise;

            promise = new Promise(function(resolve, reject) {

                db.insert(doc, params, function(err, body) {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(body);
                });

            });

            return promise;
        };

        /**
         *
         */
        dbView = function(appname, view, params) {
            var promise;

            promise = new Promise(function(resolve, reject) {

                db.view(appname, view, params, function(err, body) {
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

            return promise;
        };

        //  ---
        //  Task Helpers
        //  ---

        /*
         */
        acceptNextTask = function(job) {
            var tasks,
                taskname;

            logger.debug('TDS workflow acceptNextTask: ' + job._id);

            tasks = getNextTasks(job);
            logger.debug(TDS.beautify(JSON.stringify(tasks)));

            taskname = tasks[0];
            if (taskname) {
                //  NOTE the task here is just a task name...we now need to
                //  fetch the actual task specification and work from there.
                retrieveTask(taskname).then(function(task) {
                    acceptTask(job, task);
                });
            }
        };

        /*
         */
        acceptTask = function(job, task) {
            var step,
                plugin,
                runner;

            logger.debug('TDS workflow acceptTask: ' +
                job._id + ' (' + task.name + ')');

            //  See if the task uses a different plugin for require().
            if (task.plugin) {
                plugin = task.plugin;
            } else {
                plugin = task.name;
            }

            //  Verify we have the named plugin available, otherwise we can't
            //  process this particular task (which is ok..not an error).
            runner = TDS.workflow.tasks[plugin];
            if (!runner) {
                return;
            }

            //  Accepting a task means copying it into the steps list and
            //  putting our process.pid on it along with state info as needed.
            step = JSON.parse(JSON.stringify(task));
            step.pid = process.pid;
            step.start = Date.now();
            step.state = '$$ready';
            job.steps.push(step);

            job.state = task.name + '-' + job.steps.length;

            dbSave(job);
        };

        /*
         */
        canRetry = function(obj) {

            logger.debug('TDS workflow canRetry: ' + (obj._id || obj.name));

            return obj && obj.retry !== undefined && obj.retry > 0;
        };

        /*
         */
        cleanupJob = function(job) {
            var code;

            logger.debug('TDS workflow cleanupJob: ' + job._id);

            //  Job is "done" in that it's either timed out or errored out and
            //  it can't be retried (or it did retry but is out of chances now).

            //  If there's error tasking we can try to run that as a
            //  cleanup/notification step.
            if (job.error) {
                retrieveTask(job.error).then(function(errtask) {
                    acceptTask(job, errtask);
                }).catch(function(err) {
                    logger.error('TDS workflow missing error task: ' + job.error);
                });
                return;
            }

            //  No job-level error tasks. We're truly done. Need to update final
            //  state to $$complete to stop processing for this job. The exit
            //  slot is used to signify success/failure and specific reason.
            switch(job.steps[job.steps.length - 1].state) {
                case '$$timeout':
                    code = 1;
                    break;
                case '$$error':
                    code = 2;
                    break;
                default:
                    code = -1;
                    break;
            }

            job.state = '$$complete';
            job.exit = code;
            job.end = Date.now();

            dbSave(job);
        };

        /*
         */
        cleanupTask = function(job, task) {

            logger.debug('TDS workflow cleanupTask: ' +
                job._id + ' (' + task.name + ')');

            //  Task is "done" in that it's either timed out or errored out and
            //  it can't be retried (or it did retry but is out of chances now).

            //  If there's error tasking we can try to run that as a
            //  cleanup/notification step.
            if (task.error) {
                retrieveTask(task.error).then(function(errtask) {
                    acceptTask(job, errtask);
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
        expandParams = function(target, source) {

            if (!target.params) {
                target.params = source.params;
                return target;
            }

            if (!source.params) {
                return target;
            }

            TDS.blend(target.params, source.params);
            return target;
        };

        /*
         */
        failTask = function(job, task, reason) {

            logger.debug('TDS workflow failTask: ' +
                job._id + ' (' + task.name + ')');

            task.state = '$$error';
            task.result = reason;

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
         * @return {Array.<step>} An array of step entries.
         */
        getCurrentTasks = function(job) {
            var steps;

            logger.debug('TDS workflow getCurrentTasks: ' + job._id);

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
         * @return {Array} The list of available tasks to be processed next.
         */
        getNextTasks = function(job) {
            var tasks,
                steps,
                found,
                size,
                last,
                next,
                list,
                arr;

            logger.debug('TDS workflow getNextTasks: ' + job._id);

            steps = job.steps;
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
                        return [tasks.sequence[0]];
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

                        case '$$complete':
                            //  Which task we pluck depends on how many we've
                            //  done that weren't retries or error handlers.

                            //  If there's any step in state '$$error' the main
                            //  task list is no longer relevant and error
                            //  process takes care of that.
                            found = steps.some(function(step) {
                                return step.state === '$$error';
                            })
                            if (found) {
                                break;
                            }

                            //  Scan the list we need to complete and find the
                            //  first one that we don't have a complete for.
                            list = tasks.sequence;
                            list.some(function(taskname, index) {
                                var complete;

                                complete = steps.some(function(step) {
                                    return step.name === taskname &&
                                        step.state === '$$complete';
                                });

                                if (!complete) {
                                    next = index;
                                    return true;
                                }

                                return false;
                            });


                            if (next !== undefined) {
                                arr.push(list[next]);
                            }
                            break;

                        default:

                            //  Something unexpected.
                            logger.error('TWS workflow unexpected task state: ' +
                                job._id + ' (' + last.name + ' )' + ' -> ' +
                                last.state);
                            break;
                    }

                    break;
                default:
                    logger.error('TWS workflow unsupported task structure: ' +
                        tasks.structure);
                    break;
            }

            return arr;
        };

        /*
         */
        initializeJob = function(job) {

            logger.debug('TDS workflow initializeJob: ' + job._id);

            //  Get the job's flow document. We need to copy the current task
            //  definition for the flow into the job instance.
            retrieveFlow(job.flow, job.owner).then(function(flow) {

                //  Snapshot the flow properties. This ensures we don't allow
                //  job submissions to alter the configured nature of the flow
                //  except with respect to things in the params block.
                job.tasks = flow.tasks;
                job.error = flow.error;
                job.retry = flow.retry;
                job.timeout = flow.timeout;

                //  Expand any initial parameters along with any flow defaults.
                expandParams(job, flow);

                job.state = '$$ready';
                job.start = Date.now();
                job.steps = [];

                dbSave(job);

            }).catch(function(err) {
                logger.error('TDS workflow error for job ' +
                    job._id + ': ' + err);
            });
        };

        /*
         */
        isJobComplete = function(job) {

            logger.debug('TDS workflow isJobComplete: ' + job._id);

            return job.state === '$$complete';
        };

        /*
         */
        isJobInitialized = function(job) {

            logger.debug('TDS workflow isJobInitialized: ' + job._id);

            return job.state !== undefined && job.start !== undefined;
        }

        /*
         */
        isOnTaskBoundary = function(job) {
            var actives;

            logger.debug('TDS workflow isOnTaskBoundary: ' + job._id);

            //  Not initialized? Not ready for work yet.
            if (!isJobInitialized(job)) {
                return false;
            }

            //  Waiting for first task, current task has timed out so a retry
            //  task is potentially in the works, or errored out so an error
            //  task is potentially going to be run. In all cases we allow all
            //  processes to compete for whatever work comes next.
            if (['$$ready', '$$timeout', '$$error'].indexOf(job.state) !== -1) {
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

            logger.debug('TDS workflow isTaskComplete: ' +
                job._id + ' (' + task.name + ')');

            //  Tasks don't proceed after being set to an error or timeout, they
            //  can retry but that creates a new task, it doesn't continue using
            //  the one that errored or timed out.
            return ['$$complete', '$$timeout', '$$error'].indexOf(
                task.state) !== -1;
        };

        /*
         */
        shouldTaskTimeOut = function(job, task) {

            logger.debug('TDS workflow shouldTaskTimeOut: ' +
                job._id + ' (' + task.name + ')');

            //  States like $$ready and $$active could wait forever, but other
            //  concrete states imply the task is finished in some form and can
            //  not be timed out (it might already be..but that's different).
            if (['$$complete', '$$error', '$$timeout'].indexOf(task.state) !== -1) {
                return false;
            }

            //  Ended, or never started? Not timed out.
            if (task.end || !task.start) {
                return false;
            }

            //  TODO    where to look up this timeout default?
            return (Date.now() - task.start) > (task.timeout || 15000);
        };

        /*
         */
        processOwnedTasks = function(job) {
            var steps,
                pid;

            logger.debug('TDS workflow processOwnedTasks: ' + job._id +
                ' (' + process.pid + ')');

            pid = process.pid;

            steps = job.steps;
            steps = steps.filter(function(step) {
                return step.pid === pid && !isTaskComplete(job, step);
            });

            steps.forEach(function(step) {
                var runner,
                    params,
                    timeout;

                runner = TDS.workflow.tasks[step.name];
                if (!runner) {
                    logger.error('TDS workflow ' + process.pid +
                        ' unable to locate runner for: ' + step.name);
                    failTask(job, step, 'Unable to locate task runner.');
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

                //  TODO    where to look up this timeout default?
                timeout = step.timeout || 15000;

                //  Set up a timeout job that will trigger a timeout state
                //  change if the runner doesn't finish in time. The timer is
                //  passed in with other params to let the runner clear it.
                params.timer = setTimeout(function() {
                    step.state = '$$timeout';
                    dbSave(job);
                }, timeout);

                try {
                    runner(job, step, params);
                } catch (e) {
                    failTask(job, step, e.message);
                }
            });
        };

        /*
         */
        refreshTaskState = function(job) {
            var steps;

            logger.debug('TDS workflow refreshTaskState: ' + job._id);

            //  If we find tasks with incorrect state (they've timed out
            //  basically) we update and save, returning true to tell callers
            //  they should stop and wait for updates to propogate.

            steps = job.steps;
            steps = steps.filter(function(step) {
                return shouldTaskTimeOut(job, step);
            });

            if (steps.length > 0) {
                logger.debug('TDS workflow found timed out tasks: ' + job._id +
                    ' (' +
                    steps.map(function(step) { return step.name }).join(', ') +
                    ')');

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
        retrieveFlow = function(flow, owner) {

            logger.debug('TDS workflow retrieveFlow: ' + flow + '::' + owner);

            return dbView(db_app, 'flows', {keys: [flow + '::' + owner]}).then(
            function(result) {
                //  Result should be the rows object from the db.view call.
                //  There should be only one so pass first one along.
                return result[0];
            }).catch(function(err) {
                return err;
            });
        };

        /*
         */
        retrieveTask = function(taskname) {

            logger.debug('TDS workflow retrieveTask: ' + taskname);

            return dbView(db_app, 'tasks', {keys: [taskname]}).then(
            function(result) {
                //  Result should be the rows object from the db.view call.
                //  There should be only one so pass first one along.
                return result[0];
            }).catch(function(err) {
                return err;
            });
        };

        /*
         */
        retryJob = function(job) {
            //  TODO
            logger.debug('TDS workflow retryJob: ' + job._id);


        };

        /*
         */
        retryTask = function(job, task) {
            var count,
                retryStep;

            logger.debug('TDS workflow retryTask: ' +
                job._id + ' (' + task.name + ')');

            count = task.retry;
            if (count === undefined || count <= 0) {
                return cleanupTask(job, task);
            }

            //  Create a new step instance, clearing any state etc. and dropping
            //  the retry count by 1.
            retryStep = JSON.parse(JSON.stringify(task));
            retryStep.state = '$$ready';
            retryStep.start = Date.now();
            retryStep.end = undefined;
            retryStep.retry = count - 1;

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

            logger.debug('TDS workflow processing request: ' +
                TDS.beautify(JSON.stringify(job)));

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
                        cleanupJob(job);
                    }
                    break;
                case '$$error':
                    //  Job errored out. Retry if possible, else clean up.
                    if (canRetry(job)) {
                        retryJob(job);
                    } else {
                        cleanupJob(job);
                    }
                    break;
                case '$$complete':
                    logger.debug('TDS workflow received completion notice.');
                    break;
                case undefined:
                    if (!isJobInitialized(job)) {
                        initializeJob(job);
                    } else {
                        logger.error('TDS workflow invalid job state: ' +
                            job._id);
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

                name = file.slice(0, file.lastIndexOf('.'));

                logger.debug('Loading workflow for ' + name);

                TDS.workflow.tasks[name] =
                    require(path.join(taskdir, file))(options);
            });
        }

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

        app.post(TDS.cfg('tds.job.uri'), loggedIn, options.parsers.json, TDS.workflow.job);
    };

}(this));
