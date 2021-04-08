//  ============================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ============================================================================

/**
 * @overview Server-side TDS configuration data. This file is loaded by the
 *     tds_base.js file and CLI but _NOT_ by the client code (tibet_loader.js).
 *     Content here consists of all TDS-related flags which should not be
 *     exposed to the client. There are a handful of TDS flags, primarily those
 *     which expose TDS URI endpoints, in the tibet_cfg.js file.
 */

(function(root) {
    'use strict';

    var Config;

    //  ---
    //  baseline
    //  ---

    /**
     * A configuration function that expects to be passed the setcfg call to
     * invoke. This will normally be either TDS.setcfg or TP.sys.setcfg.
     */
    Config = function(setcfg) {

        setcfg('couch.db_app', 'tibet');
        setcfg('couch.db_name', null);
        setcfg('couch.host', '127.0.0.1');
        setcfg('couch.port', '5984');
        setcfg('couch.scheme', 'http');

        setcfg('couch.watch.empty', '\n');
        setcfg('couch.watch.feed', 'continuous');
        setcfg('couch.watch.filter', '*');
        setcfg('couch.watch.heartbeat', 500);
        setcfg('couch.watch.inactivity_ms', null);
        setcfg('couch.watch.initial_retry_delay', 1000);
        setcfg('couch.watch.max_retry_seconds', 360);
        setcfg('couch.watch.response_grace_time', 5000);
        setcfg('couch.watch.root', '~app');

        setcfg('couch.watch.couch2fs', true);
        setcfg('couch.watch.fs2couch', true);


        setcfg('path.tds_file', '~/tds.json');
        setcfg('path.tds_plugins', '~/plugins');
        setcfg('path.tds_processors', '~tds_plugins/processors');
        setcfg('path.tds_tasks', '~tds_plugins/tasks');
        setcfg('path.tds_templates', '~tds_tasks/templates');

        setcfg('path.user_file', '~/users.json');

        //  paths specific to definitions used to push "couchapp" content
        setcfg('path.couch_defs', '~/couch/app');
        setcfg('path.couchapp', '~/couch/tws');

        //  paths specific to definitions used to push TWS documents
        setcfg('path.task_defs', '~/couch/tws');
        setcfg('path.tws', '~/couch/tws');

        //  Security-related keys. These start out null but will take on values
        //  during runtime based on environment variable settings. If there are
        //  no matching environment variable settings the server will a) log a
        //  large warning stating the server is not secure, b) may not be able
        //  to authenticate users or operate correctly due to mismatched crypto.
        setcfg('tibet.crypto.cipher', null);    //  cipher algorithm (aes-256-ctr)
        setcfg('tibet.crypto.hash', null);      //  hash algorithm (sha256)
        setcfg('tibet.crypto.keylen', 32);      //  target key length
        setcfg('tibet.crypto.saltlen', 16);     //  target salt length

        //  ---
        //  SECURITY / CSP
        //  ---

        //  Default in security.js plugin is strict-origin-when-cross-origin
        //  so this setting is slightly more typical for "normal operation".
        setcfg('tds.security.referrerPolicy', 'same-origin');

        //  Non-directive CSP configuration values.
        setcfg('tds.csp.browserSniff', true);
        setcfg('tds.csp.disableAndroid', false);
        setcfg('tds.csp.loose', false);
        setcfg('tds.csp.reportOnly', true);
        setcfg('tds.csp.sandbox', ['allow-forms', 'allow-scripts']);
        setcfg('tds.csp.setAllHeaders', false);
        setcfg('tds.csp.upgradeInsecureRequests', true);

        //  The list of directives which are valid in a CSP declaration.
        //  NOTE the '_' here so directives are not part of tds.csp object.
        setcfg('tds.csp_directives', {
            reportUri: '/report-csp',

            defaultSrc: ['self'],
            imgSrc: ['self'],
            scriptSrc: ['self'],
            styleSrc: ['self'],
            fontSrc: ['self'],
            connectSrc: ['self'],

            objectSrc: ['none'],
            mediaSrc: ['none'],
            frameSrc: ['none'],
            childSrc: ['none'],

            baseUri: ['none']
        });

        //  The list of keywords which must be treated specially (quoted) within
        //  a CSP directive string.
        //  NOTE the '_' here so keywords are not part of tds.csp object.
        setcfg('tds.csp_keywords', [
            'self',
            'none',
            'unsafe-inline',
            'unsafe-eval',
            'strict-dynamic',
            'unsafe-hashes',
            'report-sample',
            'unsafe-allow-redirects'
        ]);

        // HSTS Strict-Transport-Security configuration block values.
        setcfg('tds.use_hsts', false);
        setcfg('tds.hsts.maxAge', 10886400);    // Google requires min 18 weeks
        setcfg('tds.hsts.includeSubDomains', true); //  Google requirement
        setcfg('tds.hsts.preload', true);
        setcfg('tds.hsts.force', true);

        //  ---
        //  HTTP(S)
        //  ---

        //  true will cause the server to start with HTTPS server/port info.
        setcfg('tds.https', false);

        setcfg('tds.host', '127.0.0.1');

        //  true will cause redirection in some environments when HTTPS is off.
        setcfg('tds.secure_requests', false);

        //  NOTE we don't set this here but provide it as a reminder that you
        //  can choose to map https TDS operations to a non-priviledged port
        setcfg('tds.https_port', null);

        //  NOTE we do _not_ default this here so env.PORT etc can be used when
        //  the parameter isn't being explicitly set. 1407 is hardcoded in
        //  server.js.
        setcfg('tds.port', null);

        //  ---
        //  LOGGING
        //  ---

        setcfg('tds.log.transports', ['file']);
        setcfg('tds.log.color', true);
        setcfg('tds.log.count', 5);
        setcfg('tds.log.file', '~app_log/tds-{{env}}.log');
        setcfg('tds.log.format', 'dev');
        setcfg('tds.log.level', 'info');
        setcfg('tds.log.routes', false);
        setcfg('tds.log.size', 5242880); // 5MB

        setcfg('tds.max_bodysize', '5mb');

        //  How long before connections normally time out (15 minutes)
        setcfg('tds.connection_timeout', 15 * 60 * 1000);

        //  How long before process.exit after a shutdown request.
        setcfg('tds.shutdown_timeout', 3000);

        //  For shutdown processing how long to timeout connections?
        setcfg('tds.shutdown_connections', 100);

        setcfg('tds.session.store', 'memory');

        setcfg('tds.stop_onerror', true);

        setcfg('tds.vcard_root', '~app_dat');

        //  ---
        //  plugins
        //  ---

        //  Null here will cause default list (hardcoded in server.js) to load.
        //  Normally that's fine. Alterations are done via tds.json.
        setcfg('tds.plugins.core', null);

        //  Null here will cause them all to load (as will '*'). Otherwise the
        //  set is defined in tds.json in most cases.
        setcfg('tds.plugins.tds', null);

        //  Path admin routes are rooted from.
        setcfg('tds.admin.root', '_tds');

        setcfg('tds.auth.strategy', 'tds');

        setcfg('tds.cli.commands', ['type', 'build', 'deploy', 'package',
            'open']);

        setcfg('tds.patch.root', '~');

        setcfg('tds.pouch.name', 'tds');
        setcfg('tds.pouch.prefix', 'pouch'); // this is a directory name
        setcfg('tds.pouch.route', '/db');

        setcfg('tds.proxy.map', null);

        //  Optional array defining order for loading routes.
        setcfg('tds.route.order', []);

        setcfg('tds.static.private', []);

        //  NOTE these are off here. We want to force them to be turned on via
        //  the tds.json file which will enforce an environment-based setting.
        setcfg('tds.use_admin', false);
        setcfg('tds.use_cli', false);
        setcfg('tds.use_couch', false);
        setcfg('tds.use_mocks', false);
        setcfg('tds.use_proxy', false);
        setcfg('tds.use_tasks', false);

        //  top-level dir used in the TDS watch plugin to determine where to set
        //  up the cwd for the watcher. This should almost always be left as
        //  ~app to ensure the watcher's set up to cover all app resources. Use
        //  uri.watch.include and uri.watch.exclude to include and exclude any
        //  specific subdirectories or files below the overall root. NOTE that
        //  uri.source.* parameters are shared client/server so they're in
        //  tibet_cfg rather than this TDS-only config file.
        setcfg('tds.watch.root', '~app');

        setcfg('tds.watch.heartbeat', 10000);   //  aka sse-heartbeat
        setcfg('tds.watch.retry', 3000);        //  aka sse.retry cfg

        setcfg('tds.webdav.mount', '/');
        setcfg('tds.webdav.root', '~app');

        //  ---
        //  tws
        //  ---

        setcfg('tds.tws.db_app', 'tws');
        setcfg('tds.tws.db_name', 'tasks');   //  often a suffix on proj db
        setcfg('tds.tws.host', '127.0.0.1');
        setcfg('tds.tws.port', '5984');
        setcfg('tds.tws.scheme', 'http');

        setcfg('tds.tws.dryrun', false);

        setcfg('tds.tws.watch.feed', 'continuous');
        setcfg('tds.tws.watch.heartbeat', 500);
        setcfg('tds.tws.watch.inactivity_ms', null);
        setcfg('tds.tws.watch.initial_retry_delay', 1000);
        setcfg('tds.tws.watch.max_retry_seconds', 360);
        setcfg('tds.tws.watch.response_grace_time', 5000);
    };

    module.exports = Config;

}(this));
