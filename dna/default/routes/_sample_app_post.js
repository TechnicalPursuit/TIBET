/**
 * @overview Sample route which registers a single route with the app instance.
 */

(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS,
            meta;

        //  Default references we'll need.
        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  Meta information used by logger to identify component etc.
        meta = {type: 'route', name: '{{filename}}'};

        //  Announce the loading/config of this route.
        logger.system(
            TDS.colorize('loading route ', 'dim') +
            TDS.colorize('POST /forminput', 'route'), meta);

        //  ---
        //  Route(s)
        //  ---

        /*
         test via curl using variations (adjust port etc) of:

            curl -XPOST http://127.0.0.1:1407/forminput \
                --header "Content-Type: application/json" \
                --data "@../mocks/mockjson_post.json"

            curl -XPOST http://127.0.0.1:1407/forminput \
                --header "Content-Type: application/json" \
                --data "@../mocks/mockjson_post.json"
         */
        app.post('/forminput', function(req, res) {

            //  Replace this with "real work" for the route.
            logger.info(TDS.beautify(req.body), meta);

            //  Replace with real response for the route.
            res.json({ok: true});
        });
    };

}(this));
