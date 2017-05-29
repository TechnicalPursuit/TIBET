/**
 * @overview Sample route which accepts input, performs some form of validation
 *     and pre-submission checks on that input, and then optionally submits a
 *     job to the TIBET Workflow System (TWS).
 */

(function(root) {

    'use strict';

    var nano,
        Promise,
        router;

    nano = require('nano');
    Promise = require('bluebird');
    router = require('express').Router();

    module.exports = function(options) {
        var app,
            connection,
            logger,
            TDS,
            dbParams,
            db,
            dbInsert,
            db_url,
            db_name,
            validate;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        logger.system(
            TDS.colorize('loading route ', 'dim') +
            //  TODO: adjust 'jobrequest' to match desired route name.
            TDS.colorize('POST /{{filename}}/jobrequest', 'route'));

        //  ---
        //  CouchDB support for the route.
        //  ---

        dbParams = TDS.getCouchParameters({
            db_name: TDS.cfg('tds.tasks.db_name')
        });
        db_url = dbParams.db_url;
        db_name = dbParams.db_name;

        connection = nano(db_url);
        db = connection.use(db_name);

        dbInsert = Promise.promisify(db.insert);

        //  ---
        //  Helpers
        //  ---

        /**
         * A simple helper stub for validating form input. Adjust this to meet
         * your needs.
         */
        validate = function(data) {
            //  TODO:   do the real work of validating the request input.
            return true;
        };

        //  ---
        //  Route(s)
        //  ---

        //  TODO: rename 'jobrequest' to match desired route name.
        router.post('/jobrequest', function(req, res) {
            var job,
                valid,
                flow,
                owner,
                params;

            //  ---
            //  Validate
            //  ---

            logger.debug('body is: ' + TDS.beautify(req.body));

            if (!req.body) {
                res.status(400);    // Bad Request
                res.send({
                    ok: false
                });

                return;
            }

            valid = validate(req.body);

            if (!valid) {
                res.status(400);    // Bad Request
                res.send({
                    ok: false
                });

                return;
            }

            //  ---
            //  Submit
            //  ---

            //  TODO: assemble the required data for flow, owner, and params.


            job = {
                type: 'job',
                flow: flow,
                owner: owner,
                params: params
            };

            logger.debug('submitting job data: ' + TDS.beautify(job));

            dbInsert(job).catch(
                function(err) {
                    logger.error(err);
                    res.status(500);    // Server Error
                    res.send({
                        ok: false,
                        message: 'Server error.'
                    });
                });
        });

        //  Return the router instance. The server will see this and
        //  automatically app.use({{filename}}, router) on startup.
        return router;
    };

}(this));
