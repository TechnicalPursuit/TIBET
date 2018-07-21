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

        setcfg('path.tds_file', '~/tds.json');
        setcfg('path.tds_plugins', '~/plugins');
        setcfg('path.tds_tasks', '~tds_plugins/tasks');
        setcfg('path.tds_templates', '~tds_tasks/templates');

        setcfg('path.user_file', '~/users.json');

        //  paths specific to definitions used to push "couchapp" content
        setcfg('path.tds_couch_defs', '~/couch/app');
        setcfg('path.couchapp', '~/couch/tws');

        //  paths specific to definitions used to push TWS documents
        setcfg('path.tds_task_defs', '~/couch/tws');
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

        //  true will cause the server to start with HTTPS server/port info.
        setcfg('tds.https', false);

        setcfg('tds.host', '127.0.0.1');

        //  true will cause redirection in some environments when HTTPS is off.
        setcfg('tds.secure_requests', false);

        //  NOTE we don't set this here but provide it as a reminder that you
        //  can choose to map https TDS operations to a non-priviledged port
        setcfg('tds.https_port', null);

        setcfg('tds.log.transports', ['file']);
        setcfg('tds.log.color', true);
        setcfg('tds.log.count', 5);
        setcfg('tds.log.file', '~app_log/tds-{{env}}.log');
        setcfg('tds.log.format', 'dev');
        setcfg('tds.log.level', 'info');
        setcfg('tds.log.routes', false);
        setcfg('tds.log.size', 5242880); // 5MB

        setcfg('tds.max_bodysize', '5mb');

        //  NOTE we do _not_ default this here so env.PORT etc can be used when
        //  the parameter isn't being explicitly set. 1407 is hardcoded in
        //  server.js.
        setcfg('tds.port', null);

        //  How long before connections normally time out (15 minutes)
        setcfg('tds.connection_timeout', 15 * 60 * 1000);

        //  How long before connections time out after a shutdown request.
        setcfg('tds.shutdown_timeout', 3000);

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

        setcfg('tds.cli.commands', ['type', 'build', 'deploy', 'package']);

        setcfg('tds.couch.db_app', 'tibet');
        setcfg('tds.couch.db_name', null);
        setcfg('tds.couch.host', '127.0.0.1');
        setcfg('tds.couch.port', '5984');
        setcfg('tds.couch.scheme', 'http');

        setcfg('tds.couch.watch.empty', '\n');
        setcfg('tds.couch.watch.feed', 'continuous');
        setcfg('tds.couch.watch.filter', '*');
        setcfg('tds.couch.watch.heartbeat', 500);
        setcfg('tds.couch.watch.inactivity_ms', null);
        setcfg('tds.couch.watch.initial_retry_delay', 1000);
        setcfg('tds.couch.watch.max_retry_seconds', 360);
        setcfg('tds.couch.watch.response_grace_time', 5000);
        setcfg('tds.couch.watch.root', '~app');

        setcfg('tds.couch.watch.couch2fs', true);
        setcfg('tds.couch.watch.fs2couch', true);

        setcfg('tds.patch.root', '~');

        setcfg('tds.pouch.name', 'tds');
        setcfg('tds.pouch.prefix', 'pouch'); // this is a directory name
        setcfg('tds.pouch.route', '/db');

        setcfg('tds.proxy.map', null);

        //  Optional array defining order for loading routes.
        setcfg('tds.route.order', []);

        setcfg('tds.static.private', []);

        setcfg('tds.tasks.db_app', 'tws');
        setcfg('tds.tasks.db_name', 'tasks');   //  often a suffix on proj db

        setcfg('tds.tasks.dryrun', false);

        setcfg('tds.tasks.watch.feed', 'continuous');
        setcfg('tds.tasks.watch.heartbeat', 500);
        setcfg('tds.tasks.watch.inactivity_ms', null);
        setcfg('tds.tasks.watch.initial_retry_delay', 1000);
        setcfg('tds.tasks.watch.max_retry_seconds', 360);
        setcfg('tds.tasks.watch.response_grace_time', 5000);

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
        //  tds.watch.include and tds.watch.exclude to include and exclude any
        //  specific subdirectories or files below the overall root. NOTE that
        //  those parameters are shared client/server so they're in tibet_cfg.
        setcfg('tds.watch.root', '~app');

        setcfg('tds.watch.heartbeat', 10000);

        setcfg('tds.webdav.mount', '/');
        setcfg('tds.webdav.root', '~app');
    };

    module.exports = Config;

}(this));
