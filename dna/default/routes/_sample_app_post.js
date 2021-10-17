/**
 * @overview Sample route which registers a single route with the app instance.
 */

(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS;

        //  Default references we'll need.
        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  Announce the loading/config of this route.
        logger.system(
            TDS.colorize('loading route ', 'dim') +
            TDS.colorize('POST /forminput', 'route'));

        //  ---
        //  Route(s)
        //  ---

        /*
         test via curl using variations (adjust port etc) of:

            curl -XPOST http://127.0.0.1:1407/forminput \
                --header "Content-Type: application/json" \
                --data "@../mocks/mockjson_post.json"

            curl -XPOST -k https://127.0.0.1:1443/forminput \
                --header "Content-Type: application/json" \
                --data "@../mocks/mockjson_post.json"
         */
        app.post('/forminput', options.parsers.json, function(req, res) {

            //  Replace this with "real work" for the route.
            logger.info(TDS.beautify(req.body));

            //  Replace with real response for the route.
            res.json({ok: true});
        });
    };

}(this));
