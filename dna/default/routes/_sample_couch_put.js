/**
 * @overview Sample route which accepts input, performs some form of validation
 *     and pre-submission checks on that input, and then saves the resulting
 *     document to CouchDB.
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
            TDS.colorize('PUT /couch', 'route'));

        //  TODO: add db_name etc. here to control which database to use.
        //  NOTE: this uses exported COUCH_DATABASE value by default.
        db = TDS.getCouchDatabase({
            cfg_root: 'couch'
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

        /*
         test via curl:

            curl -XPUT http://127.0.0.1:1407/couch \
                --header "Content-Type: application/json" \
                --data "@mocks/mockjson_post.json"
        */

        app.put('/couch', options.parsers.json, function(req, res) {
            var valid;

            //  ---
            //  Validate
            //  ---

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
            //  Store
            //  ---

            TDS.ifDebug() ?
                logger.debug('storing data: ' + TDS.beautify(req.body)) : 0;

            db.insertAsync(req.body).then(function() {
                res.status(200).send({ok: true});
            }).catch(function(err) {
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
