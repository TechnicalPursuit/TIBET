/**
 * @overview Sample form input route.
 */

(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS,
            meta,
            router;

        //  Default references we'll need.
        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  Router so we can apply our routes.
        router = require('express').Router();

        //  Meta information used by logger to identify component etc.
        meta = {type: 'route', name: 'forminput-sample'};

        //  Announce the loading/config of this route.
        logger.system(
            TDS.colorize('loading route ', 'dim') +
            TDS.colorize('POST /forminput', 'route'), meta);

        //  ---
        //  Route(s)
        //  ---

        /*
         * test via:
         * curl -XPOST http://127.0.0.1:1407/forminput --data "@../mocks/mockjson_post.json"
         * curl -XPOST -k https://127.0.0.1:1443/forminput --data "@../mocks/mockjson_post.json"
         */
        router.post('/forminput', function(req, res) {

            //  Replace this with "real work" for the route.
            logger.debug(TDS.beautify(req.body), meta);

            //  Replace with real response for the route.
            res.json({ok: true});
        });

        return router;
    };

}(this));
