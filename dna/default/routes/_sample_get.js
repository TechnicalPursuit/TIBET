/**
 * @overview Sample route which registers a single route with the app instance.
 */

(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS,
            path,
            meta,
            fullpath,

        //  Default references we'll need.
        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        path = require('path');

        meta = {
            type: 'route',
            name: 'sample_get'
        };

        //  Announce the loading/config of this route.
        logger.system(
            TDS.colorize('loading route ', 'dim') +
            TDS.colorize('GET /mockget', 'route'));

        //  ---
        //  Route(s)
        //  ---

        /*
         * test via:
         * curl -XGET http://127.0.0.1:1407/mockget
         * curl -XGET -k https://127.0.0.1:1443/mockget
         */
        app.get('/mockget', function(req, res) {
            fullpath = path.join(__dirname, '..', 'mocks', 'mockjson_get.json');

            //  Log something nice for auditing and/or debugging later.
            logger.info('Sending ' + fullpath, meta);

            res.sendFile(fullpath);
        });
    };

}(this));
