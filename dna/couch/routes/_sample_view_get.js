/**
 * @overview Sample route which invokes a CouchDB view and returns the results.
 * The result format is defined by a special parameter named 'row_format'. Values
 * for row_format are 'rows', 'docs', 'keys', and 'values'. The default is docs.
 */

(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS,
            db;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        logger.system(
            TDS.colorize('loading route ', 'dim') +
            TDS.colorize('GET /view', 'route'));

        /*
         test via curl:

            //  Create a file such as mocks/mockview_get.json:

            {
                "db_name": "fluffy",
                "db_app": "fluffy",
                "viewname": "sample",
                "include_docs": true
            }

            //   Execute th route passing view params in JSON:

            curl -XGET http://127.0.0.1:1407/view \
                --header "Content-Type: application/json" \
                --data "@mocks/mockview_get.json"
        */

        app.get('/view', options.parsers.json, function(req, res) {
            var query,
                params,
                format,
                appname,
                viewname;

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

            //  Use query to fetch defaulted couch parameters like db_app etc.
            query = TDS.blend({}, req.body);
            params = TDS.getCouchParameters(query);

            //  Remix so we get query values overlaid with default couch params.
            params = TDS.blend(query, params);

            viewname = params.viewname;
            appname = params.appname || params.db_app;

            if (!viewname || !appname) {
                res.status(400);    // Bad Request
                res.send({
                    ok: false,
                    message: 'Missing appname/db_app or viewname.'
                });

                return;
            }

            //  Values in parameter block for things like db_name, db_app, etc.
            //  work just as they would from the CLI. If those values aren't
            //  found the value exported for COUCH_DATABASE is used.
            db = TDS.getCouchDatabase(params);

            if (!db) {
                res.status(400);    // Bad Request
                res.send({
                    ok: false,
                    message: 'Database not specified.'
                });

                return;
            }

            format = params.row_format || 'docs';
            format = format.charAt(0).toUpperCase() + format.slice(1);

            if (typeof db['view' + format] !== 'function') {
                res.status(400);    // Bad Request
                res.send({
                    ok: false,
                    message: 'Invalid row_format.'
                });

                return;
            }

            //  ---
            //  Query
            //  ---

            //  Clear requestor, it's circular and will cause nano to choke.
            delete params.requestor;

            db['view' + format](appname, viewname, params).then(
            function(result) {
                res.status(200).send(result);
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
