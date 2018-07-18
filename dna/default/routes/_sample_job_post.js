/**
 * @overview Sample route which accepts input, performs data validation and
 *     pre-submission checks on that input, and then submits a job to the TWS.
 */

(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS,
            db,
            validate;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        logger.system(
            TDS.colorize('loading route ', 'dim') +
            //  TODO: adjust 'jobrequest' to match desired route name.
            TDS.colorize('POST /jobrequest', 'route'));

        //  Point to the configured TWS database for this project.
        db = TDS.getCouchDatabase({
            db_name: TDS.cfg('tds.tasks.db_name')
        });


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

        //  TODO: Rename the route here to match your requirements.
        app.post('/jobrequest', options.parsers.json, function(req, res) {
            var job,
                valid,
                flow,
                owner,
                params;

            //  ---
            //  Validate
            //  ---

            TDS.ifDebug() ?
                logger.debug('body is: ' + TDS.beautify(req.body)) : 0;

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

            //  TODO: assemble the required data for flow, owner, and params
            //  from data in the request body.
            flow = 'test';
            owner = 'test';
            params = {};        //  SEE DOCS FOR FORMAT OF THE JOB PARAMS BLOCK.

            job = {
                type: 'job',
                flow: flow,
                owner: owner,
                params: params
            };

            TDS.ifDebug() ?
                logger.debug('submitting job data: ' + TDS.beautify(job)) : 0;

            db.insertAsync(job).then(
            function(result) {
                //  Second block of result data includes the status code from
                //  Couch so use that for status and send back id/rev block.
                res.status(result[1].statusCode).send(result[0]);
            }).catch(
            function(err) {
                logger.error(err);
                res.status(500);    // Server Error
                res.send({
                    ok: false,
                    message: 'Server error.'
                });
            });
        });
    };

}(this));
