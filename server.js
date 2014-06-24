/**
 * @overview A baseline web server leveraging Connect.
 * @author Scott Shattuck (ss), William J. Edney (wje)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

var http = require('http');
var connect = require('connect');
var morgan = require('morgan');
var gzipStatic = require('connect-gzip-static');
var minimist = require('minimist');
var watch = require('watch');
var path = require('path');
var argv = minimist(process.argv.slice(2));
var port = argv.port ||
    process.env.npm_package_config_port ||
    process.env.PORT ||
    1407;

//  ------------------------------------------------------------------------
//  FILE WATCH CAPABILITY
//  ------------------------------------------------------------------------

var pathToWatch = path.resolve(__dirname, './src');
var changedFileName = '';

var fileWatcher = function (req, res, next) {
    var writeSSEHead,
        writeSSEData;

    writeSSEHead = function (req, res, cb) {
        res.writeHead(
            200,
            {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

        res.write('retry: 1000\n');

        if (cb) {
            return cb(req, res);
        }
    };

    writeSSEData = function (req, res, eventName, eventData, cb) {
        var id;

        id = (new Date()).toLocaleTimeString();

        res.write('id: ' + id + '\n');
        res.write('event: ' + eventName + '\n');
        res.write('data: ' + JSON.stringify(eventData) + '\n\n');

        if (cb) {
            return cb(req, res);
        }
    };

    if (req.headers.accept &&
        req.headers.accept === 'text/event-stream' &&
        req.url.match('/fileWatcher')) {

        var eventName;

        if (changedFileName !== '') {
            eventName = 'fileChanged';
        } else {
            eventName = '';
        }

        //  Write the SSE HEAD and then in that method's callback, write the SSE
        //  data.
        writeSSEHead(
            req, res,
            function(req, res) {
                writeSSEData(
                    req, res, eventName, changedFileName,
                    function(req, res) {

                        if (changedFileName !== '') {
                            changedFileName = '';
                        }

                        res.end();
                    });
        });
    }

    next();
};

//  This requires the following npm module:
//  npm install watch

watch.watchTree(
    pathToWatch,
    function (fileName, curr, prev) {
        if (typeof fileName === 'object' && prev === null && curr === null) {
            // Finished walking the tree
        } else if (prev === null) {
            // fileName is a new file
        } else if (curr.nlink === 0) {
            // fileName was removed
        } else {
            //console.log('the file changed: ' + fileName);
            // fileName was changed
            changedFileName = fileName;
        }
    });

//  ------------------------------------------------------------------------
//  SERVER EXECUTION
//  ------------------------------------------------------------------------

var app = connect();

app.use(fileWatcher);
app.use(morgan());
app.use(gzipStatic(__dirname));

http.createServer(app).listen(port);

}());
