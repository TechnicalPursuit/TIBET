/**
 * @fileoverview A simulation of the Node.js require() command suitable for
 * supporting unit testing of common components in both client and server. This
 * file should be included along with any test harness code (such as mocha.js)
 * in the head of your test html files, before loading your test js file(s).
 * @author Scott Shattuck (ss)
 * Copyright 2013 Technical Pursuit Inc., All Rights Reserved.
 */

;(function(root) {

// TODO: actually we need a different approach here so we could test this even
// on the server where require() exists by exporting to something other than
// require().
if (window && typeof window.require === 'function') {
  return;
}

/**
 * Simulate the API of Node.js require().
 */
var require = function(path) {
};

/**
 * A cache of previously seen/loaded modules.
 */
require.cache = {};



/*
  var url = window.require.resolve(name);

  if (require.cache[url]) {

    // NOTE The callback should always be called asynchronously
    callback && setTimeout(function() {callback(require.cache[url])}, 0);
    return require.cache[url];
  }

  var exports = {};
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {

    if (this.readyState != 4)
      return;
    if (this.status != 200)
      throw 'Require() exception: GET ' +
        url + ' ' + this.status + ' (' + this.statusText + ')';

    if (window.require.cache[url]) {
      exports = window.require.cache[url];
    } else if (this.getResponseHeader('content-type').indexOf(
        'application/json') != -1) {
      exports = JSON.parse(this.responseText);
      window.require.cache[url] = exports;
    } else {
      window.require.cache[url] = exports;
      var source = this.responseText.match(
        /^\s*(?:(['"]use strict['"])(?:;\r?\n?|\r?\n))?\s*((?:.*\r?\n?)*)/);
      eval('(function() {' + source[1] +
        ';var exports=window.require.cache[\'' + url + '\'];\n\n' + source[2] +
        '\n})();\n//@ sourceURL=' + url + '\n');
    }

    callback && callback(window.require.cache[url]);
  };
  request.open('GET', url, !!callback);
  request.send();
  return exports;
};

window.require.resolve = function(name) {
  var r = name.match(/^(\.{0,2}\/)?([^\.]*)(\..*)?$/);
  return (r[1] ?
    r[1] :
    '/js_modules/') + r[2] + (
      r[3] ?
        r[3] :
        (r[2].match(/\/$/) ?
          'index.js' :
          '.js'
        )
    );
};
*/

window.require = require;

}.call(this));

