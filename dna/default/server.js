/**
 * @overview A baseline web server leveraging Connect.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

var Connect = require('connect');
var gzipStatic = require('connect-gzip-static');
var opt = require('optimist');
var argv = opt.argv;
var port = argv.port ||
    process.env.npm_package_config_port ||
    process.env.PORT ||
    1407;

Connect.createServer(
  Connect.logger(),
  gzipStatic(__dirname)
).listen(port);

}());
