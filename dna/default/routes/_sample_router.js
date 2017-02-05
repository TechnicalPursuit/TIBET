/**
 * @overview Sample route returning an Express 'Router' which handles one or
 *     more paths below the root defined by this file's name. For example, if
 *     you rename this file 'sample' and retain the post to /forminput you
 *     will be able to POST to /sample/forminput. To support responding to
 *     /sample simply add a get/post registration for '/' in this file.
 */

(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS,
            router;

        //  Default references we'll need.
        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  Router instance that will handle routes below this root location.
        router = require('express').Router();

        //  Announce the loading/config of this route.
        logger.system(
            TDS.colorize('loading route ', 'dim') +
            TDS.colorize('POST /{{filename}}/forminput', 'route'));

        //  ---
        //  Route(s)
        //  ---

        /*
         test via curl using variations (adjust port etc) of:

            curl -XPOST http://127.0.0.1:1407/{{filename}}/forminput \
                --header "Content-Type: application/json" \
                --data "@../mocks/mockjson_post.json"

            curl -XPOST http://127.0.0.1:1407/{{filename}}/forminput \
                --header "Content-Type: application/json" \
                --data "@../mocks/mockjson_post.json"
         */
        router.post('/forminput', function(req, res) {

            //  Replace this with "real work" for the route.
            logger.info(TDS.beautify(req.body));

            //  Replace with real response for the route.
            res.json({ok: true});
        });

        //  Return the router instance. The server will see this and
        //  automatically app.use('{{filename}}', router) on startup.
        return router;
    };

}(this));
