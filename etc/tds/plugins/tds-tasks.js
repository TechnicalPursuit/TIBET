/**
 * @overview Functionality specific to running one or more "tasks" in response
 *     to a trigger. One example is change notifications coming into the TDS
 *     CouchDB module which can choose to activate a task in response.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    //  ---
    //  Formsanity Task Runner
    //  ---

    /**
     *
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            beautify,
            files,
            loggedIn,
            logger,
            name,
            path,
            sh,
            taskdir,
            tasks,
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
        logger.debug('Activating TDS TaskRunner plugin.');

        //  ---
        //  Requires
        //  ---

        beautify = require('js-beautify');
        path = require('path');
        sh = require('shelljs');

        //  Ensure we have default option slotting for this plugin.
        options.tds_tasks = options.tds_tasks || {};


        //  ---
        //  Task Engine
        //  ---

        /**
         *
         */
        TDS.taskrunner = function(json) {
            var job,
                nano,
                testdb;

            //  Only process objects representing 'jobs'
            if (!json || json.type !== 'job') {
                return;
            }
            job = json;

            //  Make sure we have work to do. We'll get notified of completion
            //  due to change feed activity etc.
            if (job.status === 'complete') {
                logger.debug('TDS TaskRunner received completion notice.');
                return;
            }

            logger.debug('TDS TaskRunner processing request: ' +
                beautify(JSON.stringify(job)));

            //  Query for the specification for the form_id in question.

            //  TODO:   cache the specs as we get them so we don't have to keep
            //  querying in real time for multiple jobs (and then allow change
            //  notification from spec documents to update that cache.

            //  TODO:   don't hardcode these values ;)
            nano = require('nano')('http://127.0.0.1:5984');
            testdb = nano.use('d2d');

            //  TODO:   make the job spec field configurable (form_id).
            testdb.view('app', 'test', {keys: [json.form_id]}, function(err, body) {
                var spec,
                    completed,
                    tasklist,
                    next,
                    runner;

                if (err) {
                    //  TODO: Job status update?
                    console.log('View error: ' + err);
                    return;
                }

                //logger.debug('View result: ' +
                 //   beautify(JSON.stringify(body)));

                //  Body here should include 'rows'. We want the item in that
                //  list of type "spec".
                body.rows.forEach(function(row) {
                    if (row.value.type === 'spec') {
                        spec = row;
                        return;
                    }
                });

                if (!spec) {
                    logger.error('Unable to locate task specification: ' +
                        json.form_id);
                    //  TODO:   probably need to "fail" the job in this case.
                    return;
                }

                tasklist = spec.value.tasks;
                logger.debug('Task specification: ' + tasklist);

                //  Get the list of tasks done so far. We can essentially use
                //  the length here to trim out what we need to do next.
                completed = job.task_results;
                tasklist = tasklist.slice(completed.length);

                next = tasklist[0];
                logger.debug('Next task: ' + next);

                runner = TDS.taskrunner.tasks[next];
                if (!runner) {
                    logger.error('Unable to locate task runner for: ' + next);
                    //  TODO:   probably need to "fail" the job in this case.
                    return;
                }

                runner(json);
            });
        };


        /**
         * Simple dictionary of loaded task handlers by name.
         */
        TDS.taskrunner.tasks = {};


        //  ---
        //  Task Loading
        //  ---

        taskdir = path.join(TDS.expandPath('~'), 'tasks');

        if (sh.test('-d', taskdir)) {
            files = sh.ls(taskdir);
            files.sort().forEach(function(file) {

                name = file.slice(0, file.lastIndexOf('.'));

                logger.debug('Loading TaskRunner for ' + name);

                TDS.taskrunner.tasks[name] =
                    require(path.join(taskdir, file))(options);
            });
        }
    };

}());
