/**
 * @overview Sample route returning an Express 'Router' which handles one or
 *     more paths below the root defined by this file's name. For example, if
 *     you rename this file 'router' and retain the post to /forminput you
 *     will be able to POST to /router/forminput. To support responding to
 *     /router simply add a get/post registration for '/' in this file.
 */

(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS,
            meta,
            path,
            router,
            list;

        //  Default references we'll need.
        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        path = require('path');

        //  Router instance that will handle routes below this root location.
        router = require('express').Router();

        //  Meta information used by logger to identify component etc.
        meta = {type: 'route', name: 'docs'};

        //  Announce the loading/config of this route.
        logger.system(
            TDS.colorize('loading route ', 'dim') +
            TDS.colorize('GET /docs', 'route'), meta);

        //  First locate all HTML files below the doc directory, no matter how
        //  deep they might be.
        list = TDS.shell.find(TDS.expandPath('~app/docs')).filter(
        function(fname) {
            return path.basename(fname).match(/\.html$/);
        });


        //  ---
        //  Route(s)
        //  ---

        router.get('/docs/*', function(req, res) {
            var url;

            url = req.params[0];

            //  If we get a bare path redirect to the full html file.
            if (url && !/\.(x){0,1}html$/.test(url)) {
                res.redirect(301, '/docs' + url + '.html');
            }

            //  Anything else should have been a static page by now so if not
            //  found all we can do is 404.
            res.render('404', {layout: 'main',
                error: {
                    status: 404,
                    message: '/docs' + req.url + ' not found.'
                }
            });
        });

        //  Return the router instance. The server will see this and
        //  automatically app.use({{filename}}, router) on startup.
        return router;
    };

}(this));
