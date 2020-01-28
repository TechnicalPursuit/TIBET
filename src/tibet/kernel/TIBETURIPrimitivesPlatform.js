//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
Platform-specific functionality related to file access operations.
*/

/**
 * @File access primitives containing platform-specific coding.
 *
 *     Note that many of the Mozilla-based methods here have, over time, been
 *     converted to leverage HTTP requests to access either file or directory
 *     content rather than using the XPCOM calls. This was done to avoid
 *     permissionrequests that arise when trying to access file system data
 *     _even when webooted from that directory_.
 *
 *     IE doesn't do that, apparently it's ok with us asking about other files
 *     inthe directory we booted from.
 *
 *     Webkit-based browsers don't, in general, allow file-system access.
 */

/* global ActiveXObject:false,
          Components:false,
          netscape:false
*/

/* eslint-disable new-cap */

//  ------------------------------------------------------------------------
//  UTILITY METHODS
//  ------------------------------------------------------------------------

TP.definePrimitive('$fileIsDirectory',
TP.hc(
    TP.DEFAULT,
    function(targetUrl, aRequest) {

        //  NB: Other browsers don't need this call - just return.
        return;
    }
));

//  ------------------------------------------------------------------------
//  FILE DELETION
//  ------------------------------------------------------------------------

TP.definePrimitive('$fileDelete',
TP.hc(
    'test',
    TP.sys.getBrowser,
    'firefox',
    function(targetUrl, aRequest) {

        /**
         * @method $fileDelete
         * @summary Removes the targetUrl from the local file system, provided
         *     you have proper permissions. This method is rarely called
         *     directly, but it is used indirectly by the TP.$fileExecute() call
         *     to clean up temporary files.
         * @param {String} targetUrl The file URI to remove.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
         *     with call parameters.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.InvalidOperation
         * @exception TP.sig.URIException
         * @returns {Boolean} True if the delete appears successful.
         */

        var path,
            report,
            msg,
            retVal,
            request;

        if (!TP.isString(targetUrl)) {
            return TP.raise(this, 'TP.sig.InvalidURI');
        }

        //  expand to support virtual uri input
        path = TP.uriExpandPath(targetUrl);

        request = TP.request(aRequest);

        //  by default we fail silently
        report = TP.ifKeyInvalid(request, 'reportErrors', false);

        if (TP.regex.HTTP_SCHEME.test(path.toLowerCase())) {
            msg = TP.sc('Local file deletion not supported for HTTP URI ',
                        path);

            TP.raise(this, 'TP.sig.InvalidOperation', msg);
            request.fail(msg);

            return false;
        }

        //  We need to request privileges from Gecko to perform this
        //  operation. We don't bother trying this operation without
        //  privileges because we still need them, even if we were launched
        //  from the 'same domain' (i.e. the file system).

        retVal = false;

        TP.executePrivileged(
            TP.HOST_FILE_DELETE,
                TP.sc('This TIBET-based application would like to delete file: ', path),
                TP.sc('This TIBET-based application cannot delete file: ', path),
            false,      //  don't even attempt this without privileges
            function() {

                var fname,
                    FP,
                    file,
                    message;

                //  following operation uses local name, not web format
                fname = TP.uriInLocalFormat(path);

                try {
                    FP = new Components.Constructor(
                                '@mozilla.org/file/local;1',
                                'nsILocalFile',
                                'initWithPath');

                    file = new FP(fname);

                    //  pass false to avoid recursive delete
                    file.remove(false);
                } catch (e) {
                    message = TP.sc('Unable to delete ', fname);
                    if (report) {
                        TP.raise(this,
                                    'TP.sig.URIException',
                                    TP.ec(e, message));
                    }

                    retVal = false;
                    request.fail(message);

                    return;
                }

                retVal = true;
                request.complete(retVal);

                return;
            });

        return retVal;
    },
    'safari',
    function(targetUrl, aRequest) {

        /**
         * @method $fileDelete
         * @summary Removes the targetUrl from the local file system, provided
         *     you have proper permissions. This method is rarely called
         *     directly, but it is used indirectly by the TP.$fileExecute() call
         *     to clean up temporary files.
         * @param {String} targetUrl The file URI to remove.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
         *     with call parameters.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.InvalidOperation
         * @exception TP.sig.URIException
         * @returns {Boolean} True if the delete appears successful.
         */

        var request;

        request = TP.request(aRequest);

        TP.raise(this, 'TP.sig.UnsupportedOperation');
        request.fail('Unsupported operation.');

        return false;
    },
    'chrome',
    function(targetUrl, aRequest) {

        /**
         * @method $fileDelete
         * @summary Removes the targetUrl from the local file system, provided
         *     you have proper permissions. This method is rarely called
         *     directly, but it is used indirectly by the TP.$fileExecute() call
         *     to clean up temporary files.
         * @param {String} targetUrl The file URI to remove.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
         *     with call parameters.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.InvalidOperation
         * @exception TP.sig.URIException
         * @returns {Boolean} True if the delete appears successful.
         */

        var request;

        request = TP.request(aRequest);

        TP.raise(this, 'TP.sig.UnsupportedOperation');
        request.fail('Unsupported operation.');

        return false;
    }
));

//  ------------------------------------------------------------------------
//  FILE EXISTENCE
//  ------------------------------------------------------------------------

/*
Any time we are provided with a file name we check for its existence using
an appropriate mechanism.

Both Mozilla and IE provide utilities for this purpose at the file system
level. Likewise, both provide an HTTP interface which can be used to test
for file existence. This helps avoid uncaught 404's etc.

Webkit provides limited facilities for its browsers.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('$fileExists',
TP.hc(
    'test',
    TP.sys.getBrowser,
    'firefox',
    function(targetUrl, aRequest) {

        /**
         * @method $fileExists
         * @summary Returns true if targetUrl exists in the file system.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
         *     with call parameters.
         * @exception TP.sig.InvalidURI
         * @returns {Boolean}
         */

        var path,
            httpObj,
            request;

        if (!TP.isString(targetUrl)) {
            return TP.raise(this, 'TP.sig.InvalidURI');
        }

        //  expand to support virtual uri input
        path = TP.uriExpandPath(targetUrl);

        request = TP.request(aRequest);

        try {
            httpObj = TP.httpConstruct(path);
            if (TP.canInvoke(request, 'atPut')) {
                request.atPut('commObj', httpObj);
            }

            httpObj.open(TP.HTTP_GET, path, false);
            httpObj.send(null);
        } catch (e) {
            request.fail(e);

            return false;
        }

        //  NOTE the true here as our return value/completion value.
        request.complete(true);

        return true;
    },
    'safari',
    function(targetUrl, aRequest) {

        /**
         * @method $fileExists
         * @summary Returns true if targetUrl exists in the file system.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
         *     with call parameters.
         * @exception TP.sig.InvalidURI
         * @returns {Boolean}
         */

        var path,
            request,
            httpObj;

        if (!TP.isString(targetUrl)) {
            return TP.raise(this, 'TP.sig.InvalidURI');
        }

        //  expand to support virtual uri input
        path = TP.uriExpandPath(targetUrl);

        request = TP.request(aRequest);

        try {
            httpObj = TP.httpConstruct(path);
            if (TP.canInvoke(request, 'atPut')) {
                request.atPut('commObj', httpObj);
            }

            httpObj.open(TP.HTTP_GET, path, false);
            httpObj.send(null);
        } catch (e) {
            //  It threw an exception, which means that it definitely didn't
            //  find it so we always return false if we get here.
            request.fail(e);

            return false;
        }

        //  Webkit usually won't throw an exception if it can't find a URI,
        //  but will return a variety of status codes, depending on the
        //  exact browser (i.e. Safari or Chrome).

        //  Safari 4.X - all platforms
        if (httpObj.status === 404) {
            request.complete(false);

            return false;
        }

        //  Safari 4.X - Windows
        if (TP.sys.isWin() && httpObj.status === -1100) {
            request.complete(false);

            return false;
        }

        //  Safari 3.1 - Mac
        if (TP.sys.isMac() &&
            (httpObj.status === -1100 || httpObj.status === 400)) {
            request.complete(false);

            return false;
        }

        //  Safari 3.1 - Windows
        if (TP.sys.isWin() && httpObj.status === 1789378560) {
            request.complete(false);

            return false;
        }

        request.complete(true);

        return true;
    },
    'chrome',
    function(targetUrl, aRequest) {

        /**
         * @method $fileExists
         * @summary Returns true if targetUrl exists in the file system.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
         *     with call parameters.
         * @exception TP.sig.InvalidURI
         * @returns {Boolean}
         */

        var path,
            request,
            httpObj;

        if (!TP.isString(targetUrl)) {
            return TP.raise(this, 'TP.sig.InvalidURI');
        }

        //  expand to support virtual uri input
        path = TP.uriExpandPath(targetUrl);

        request = TP.request(aRequest);

        try {
            httpObj = TP.httpConstruct(path);
            if (TP.canInvoke(request, 'atPut')) {
                request.atPut('commObj', httpObj);
            }

            httpObj.open(TP.HTTP_GET, path, false);
            httpObj.send(null);
        } catch (e) {
            //  It threw an exception, which means that it definitely didn't
            //  find it so we always return false if we get here.
            request.fail(e);

            return false;
        }

        //  Webkit usually won't throw an exception if it can't find a URI,
        //  but will return a variety of status codes, depending on the
        //  exact browser (i.e. Safari or Chrome).

        //  Chrome workaround -- sigh.
        if (httpObj.status === 0 && httpObj.responseText === '') {
            request.complete(false);

            return false;
        }

        request.complete(true);

        return true;
    }
));

//  ------------------------------------------------------------------------
//  FILE LOAD
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('$fileLoad',
TP.hc(
    'test',
    TP.sys.getBrowser,
    'firefox',
    function(targetUrl, aRequest) {

        /**
         * @method $fileLoad
         * @summary Loads the content of targetUrl, returning data in the form
         *     defined by the 'resultType' property of aRequest.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     call parameters including: resultType String A node or text
         *     value. One of the following constants: TP.DOM TP.TEXT. The
         *     default is based on the probable data type of the URI based on
         *     its extension. shouldReport Boolean False to turn off exception
         *     reporting. This defaults to false.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.PrivilegeViolation
         * @exception TP.sig.IOException
         * @returns {XMLDocument|String|OrderedPair}
         */

        var request,
            path,
            text,
            resultType,
            report,
            httpObj,
            msg,

            FP,
            IOS,
            IS,

            file,
            fname,

            channel,
            stream,

            result;

        if (!TP.isString(targetUrl)) {
            return TP.raise(this, 'TP.sig.InvalidURI');
        }

        //  expand to support virtual uri input
        path = TP.uriExpandPath(targetUrl);

        //  make sure that any fragments ('#' followed by word characters)
        //  is trimmed off
        if (/#/.test(path)) {
            path = path.slice(0, path.indexOf('#'));
        }

        request = TP.request(aRequest);

        resultType = TP.ifKeyInvalid(request, 'resultType', null);
        resultType = TP.uriResultType(path, resultType);

        report = TP.ifKeyInvalid(request, 'shouldReport', false);

        //  NOTE this flag is set during boot if the system detects that the
        //  xpcom interface must be used for local file access
        if (TP.sys.cfg('boot.moz_xpcom')) {
            //  file system access in Mozilla requires UniversalXPConnect
            try {
                TP.ifInfo() && TP.sys.cfg('log.privilege_requests') ?
                    TP.info('Privilege request at TP.$fileLoad') : 0;

                netscape.security.PrivilegeManager.enablePrivilege(
                                                    'UniversalXPConnect');
            } catch (e) {
                msg = TP.sc('PrivilegeError. url: ', path);
                TP.raise(this, 'TP.sig.PrivilegeViolation',
                            TP.ec(e, msg));

                request.fail(msg);

                return;
            }

            try {
                //  mozilla-specific components, see Moz's FileUtils.js etc.
                FP = new Components.Constructor(
                            '@mozilla.org/file/local;1',
                            'nsILocalFile', 'initWithPath');

                IOS = Components.
                        classes['@mozilla.org/network/io-service;1'].getService(
                            Components.interfaces.nsIIOService);

                IS = new Components.Constructor(
                            '@mozilla.org/scriptableinputstream;1',
                            'nsIScriptableInputStream');
            } catch (e) {
                msg = TP.sc('FileComponentError. url: ', path);
                TP.raise(this, 'TP.sig.IOException',
                            TP.ec(e, msg));

                request.fail(msg);

                return;
            }

            //  adjust file name for platform and access path
            fname = TP.uriMinusFileScheme(TP.uriInLocalFormat(path));

            //  make sure that any spaces or other escaped characters in the
            //  file name get unescaped properly.
            fname = window.unescape(fname);

            //  now for the fun part, files and channels and streams, oh my!
            try {
                file = new FP(fname);
                if (file.exists()) {
                    channel = IOS.newChannelFromURI(IOS.newFileURI(file));
                    stream = new IS();

                    stream.init(channel.open());
                    text = stream.read(file.fileSize);
                    stream.close();
                }
            } catch (e) {
                msg = TP.sc('AccessViolation. url: ', path);
                TP.raise(this, 'TP.sig.PrivilegeViolation',
                            TP.ec(e, msg));

                request.fail(msg);

                return;
            }
        } else {
            try {
                httpObj = TP.httpConstruct(path);
                if (TP.canInvoke(request, 'atPut')) {
                    request.atPut('commObj', httpObj);
                }

                httpObj.open(TP.HTTP_GET, path, false);
                httpObj.send(null);

                text = httpObj.responseText;
            } catch (e) {
                msg = TP.sc('Unable to locate: ', path);
                TP.ifInfo() ? TP.info(msg) : 0;

                request.fail(msg);

                return null;
            }
        }

        result = TP.uriResult(text, resultType, report);
        request.complete(result);

        return result;
    },
    'safari',
    function(targetUrl, aRequest) {

        /**
         * @method $fileLoad
         * @summary Loads the content of targetUrl, returning data in the form
         *     defined by the 'resultType' property of aRequest.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     call parameters including: resultType String A node or text
         *     value. One of the following constants: TP.DOM TP.TEXT. The
         *     default is based on the probable data type of the URI based on
         *     its extension. shouldReport Boolean False to turn off exception
         *     reporting. This defaults to false.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.PrivilegeViolation
         * @exception TP.sig.IOException
         * @returns {XMLDocument|String|OrderedPair}
         */

        var path,
            request,
            msg,
            text,
            resultType,
            report,
            httpObj,
            result;

        if (!TP.isString(targetUrl)) {
            return TP.raise(this, 'TP.sig.InvalidURI');
        }

        //  expand to support virtual uri input
        path = TP.uriExpandPath(targetUrl);

        //  make sure that any fragments ('#' followed by word characters)
        //  is trimmed off
        if (/#/.test(path)) {
            path = path.slice(0, path.indexOf('#'));
        }

        request = TP.request(aRequest);

        resultType = TP.ifKeyInvalid(request, 'resultType', null);
        resultType = TP.uriResultType(path, resultType);

        report = TP.ifKeyInvalid(request, 'shouldReport', false);

        try {
            httpObj = TP.httpConstruct(path);
            if (TP.canInvoke(request, 'atPut')) {
                request.atPut('commObj', httpObj);
            }

            httpObj.open(TP.HTTP_GET, path, false);
            httpObj.send(null);

            text = httpObj.responseText;
        } catch (e) {
            //  It threw an exception, which means that it definitely didn't
            //  find it so we always return null if we get here.
            msg = TP.sc('Unable to locate: ', path);
            TP.ifInfo() ? TP.info(msg) : 0;

            request.fail(msg);

            return;
        }

        //  Webkit usually won't throw an exception if it can't find a URI,
        //  but will return a variety of status codes, depending on the
        //  exact browser (i.e. Safari or Chrome).

        //  Safari 4.X - all platforms
        if (httpObj.status === 404) {
            msg = TP.sc('Unable to locate: ', path);
            TP.ifInfo() ? TP.info(msg) : 0;

            request.fail(msg);

            return;
        }

        //  Safari 4.X - Windows
        if (TP.sys.isWin() && httpObj.status === -1100) {
            msg = TP.sc('Unable to locate: ', path);
            TP.ifInfo() ? TP.info(msg) : 0;

            request.fail(msg);

            return;
        }

        //  Safari 3.1 - Mac
        if (TP.sys.isMac() &&
            (httpObj.status === -1100 || httpObj.status === 400)) {
            msg = TP.sc('Unable to locate: ', path);
            TP.ifInfo() ? TP.info(msg) : 0;

            request.fail(msg);

            return;
        }

        //  Safari 3.1 - Windows
        if (TP.sys.isWin() && httpObj.status === 1789378560) {
            msg = TP.sc('Unable to locate: ', path);
            TP.ifInfo() ? TP.info(msg) : 0;

            request.fail(msg);

            return;
        }

        result = TP.uriResult(text, resultType, report);
        request.complete(result);

        return result;
    },
    'chrome',
    function(targetUrl, aRequest) {

        /**
         * @method $fileLoad
         * @summary Loads the content of targetUrl, returning data in the form
         *     defined by the 'resultType' property of aRequest.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     call parameters including: resultType String A node or text
         *     value. One of the following constants: TP.DOM TP.TEXT. The
         *     default is based on the probable data type of the URI based on
         *     its extension. shouldReport Boolean False to turn off exception
         *     reporting. This defaults to false.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.PrivilegeViolation
         * @exception TP.sig.IOException
         * @returns {XMLDocument|String|OrderedPair}
         */

        var path,
            request,
            msg,
            text,
            resultType,
            report,
            httpObj,
            result;

        if (!TP.isString(targetUrl)) {
            return TP.raise(this, 'TP.sig.InvalidURI');
        }

        //  expand to support virtual uri input
        path = TP.uriExpandPath(targetUrl);

        //  make sure that any fragments ('#' followed by word characters)
        //  is trimmed off
        if (/#/.test(path)) {
            path = path.slice(0, path.indexOf('#'));
        }

        request = TP.request(aRequest);

        resultType = TP.ifKeyInvalid(request, 'resultType', null);
        resultType = TP.uriResultType(path, resultType);

        report = TP.ifKeyInvalid(request, 'shouldReport', false);

        try {
            httpObj = TP.httpConstruct(path);
            if (TP.canInvoke(request, 'atPut')) {
                request.atPut('commObj', httpObj);
            }

            httpObj.open(TP.HTTP_GET, path, false);
            httpObj.send(null);

            text = httpObj.responseText;
        } catch (e) {
            //  It threw an exception, which means that it definitely didn't
            //  find it so we always return null if we get here.
            msg = TP.sc('Unable to locate: ', path);
            TP.ifInfo() ? TP.info(msg) : 0;

            request.fail(msg);

            return;
        }

        //  Webkit usually won't throw an exception if it can't find a URI,
        //  but will return a variety of status codes, depending on the
        //  exact browser (i.e. Safari or Chrome).

        //  Chrome workaround -- sigh.
        if (httpObj.status === 0 && httpObj.responseText === '') {
            msg = TP.sc('Unable to locate: ', path);
            TP.ifInfo() ? TP.info(msg) : 0;

            request.fail(msg);

            return;
        }

        result = TP.uriResult(text, resultType, report);
        request.complete(result);

        return result;
    }
));

//  ------------------------------------------------------------------------
//  FILE SAVE
//  ------------------------------------------------------------------------

/*
Primitive functions supporting file save operations. Note that the HTTP
versions require the assistance of the TIBET Data Server components or an
equivalent set of CGI scripts/Servlets on the server side while the FILE
versions require varying permissions.

Primitive functions supporting file save operations. Note that the HTTP
versions require the assistance of server-side components such as a WebDAV
capable server or a REST-based (Rails perhaps ;)) server with PUT support.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('$fileSave',
TP.hc(
    'test',
    TP.sys.getBrowser,
    'firefox',
    function(targetUrl, aRequest) {

        /**
         * @method $fileSave
         * @summary Saves content to the targetUrl provided using parameters
         *     and content taken from aRequest.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     parameters which control the operation including: body String The
         *     content of the file to save. append Boolean True to append to an
         *     existing file, otherwise the file will be created if needed and
         *     written to. backup Boolean True if a backup '~' file should be
         *     created. Ignored by the HTTP scheme versions. method String
         *     TP.HTTP_PUT or TP.HTTP_POST. Default is TP.HTTP_POST. permissions
         *     String A *NIX-style permission key such as '0755' or '0644'.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.URIException
         * @exception TP.sig.InvalidMode
         * @exception TP.sig.AccessViolation
         * @returns {Boolean} True on success, false on failure.
         */

        var path,
            fname,
            request,
            append,
            mode,
            body,

            permissions,
            retVal;

        if (!TP.isString(targetUrl)) {
            return TP.raise(this, 'TP.sig.InvalidURI');
        }

        //  expand to support virtual uri input
        path = TP.uriExpandPath(targetUrl);

        //  following operation uses local name, not web format
        fname = TP.uriInLocalFormat(targetUrl);

        request = TP.request(aRequest);

        //  default is to blow away old copy if any and create a new file
        append = TP.ifKeyInvalid(request, 'append', false);
        mode = append ? TP.APPEND : TP.WRITE;

        //  try to get a 'permissions mask' from the paramsHash, but default
        //  it if the paramsHash is empty (or not defined) or if there is no
        //  entry for permissions in the paramsHash. We default it to the
        //  standard Unix file permissions of 0644.
        /* eslint-disable no-octal */
        permissions = TP.ifKeyInvalid(request, 'permissions', 0644);
        /* eslint-enable no-octal */

        retVal = false;

        //  We need to request privileges from Mozilla to perform this
        //  operation. We don't bother trying this operation without
        //  privileges because we still need them, even if we were launched
        //  from the 'same domain' (i.e. the file system).

        TP.executePrivileged(
            TP.HOST_FILE_SAVE,
            TP.sc('This TIBET-based application would like to save file: ',
                    path),
            TP.sc('This TIBET-based application cannot save file: ', path),
            false,      //  don't even attempt this without privileges
            function() {

                var FP,
                    stream,
                    backup,
                    file,
                    currentData,
                    flags,
                    msg;

                //  mozilla-specific components, see Moz's FileUtils.js etc.
                try {
                    FP = new Components.Constructor(
                                '@mozilla.org/file/local;1',
                                'nsILocalFile', 'initWithPath');

                    stream = Components.classes[
                            '@mozilla.org/network/file-output-stream;1'
                            ].createInstance(
                                Components.interfaces.nsIFileOutputStream);
                } catch (e) {
                    msg = TP.sc('Unable to get component(s) for: ', path);
                    TP.raise(this, 'TP.sig.URIException',
                                TP.ec(e, msg));

                    retVal = false;
                    request.fail(msg);

                    return retVal;
                }

                try {
                    file = new FP(fname);

                    backup = TP.ifKeyInvalid(request, 'backup', true);
                    if (backup && file.exists()) {
                        try {
                            currentData = TP.$fileLoad(path);
                            TP.$fileSave(
                                path + '~',
                                TP.request('body', currentData,
                                            'backup', false));
                        } catch (e) {
                            //  can't create backup copy? then we're not
                            //  going to move ahead since a write would blow
                            //  away the old data and we've been told to
                            //  save it
                            msg = TP.sc(
                                    'Terminated save.',
                                    ' Unable to create backup copy of: ',
                                    path);
                            TP.raise(this,
                                        'TP.sig.URIException',
                                        TP.ec(e, msg));

                            retVal = false;
                            request.fail(msg);

                            return retVal;
                        }
                    }

                    body = TP.ifKeyInvalid(request, 'body', '');

                    if (mode === TP.WRITE) {
                        flags = TP.MOZ_FILE_CREATE |
                                TP.MOZ_FILE_TRUNCATE |
                                TP.MOZ_FILE_WRONLY;

                        stream.init(file, flags, permissions, null);
                        stream.write(body, body.getSize());
                        stream.flush();
                        stream.close();

                        retVal = true;
                        request.complete(retVal);

                        return retVal;
                    } else if (mode === TP.APPEND) {
                        if (file.exists()) {
                            flags = TP.MOZ_FILE_APPEND |
                                    TP.MOZ_FILE_SYNC |
                                    TP.MOZ_FILE_RDWR;

                            stream.init(file, flags, permissions, null);
                            stream.write(body, body.getSize());
                            stream.flush();
                            stream.close();

                            retVal = true;
                            request.complete(retVal);

                            return retVal;
                        } else {
                            //  TODO:   do we want a parameter to drive this
                            //  logic?

                            //  append, but if not there we'll just create
                            //  and move on
                            flags = TP.MOZ_FILE_CREATE |
                                    TP.MOZ_FILE_TRUNCATE |
                                    TP.MOZ_FILE_WRONLY;

                            stream.init(file, flags, permissions, null);
                            stream.write(body, body.getSize());
                            stream.flush();
                            stream.close();

                            retVal = true;
                            request.complete(retVal);

                            return retVal;
                        }
                    } else {
                        msg = TP.sc('Invalid file save mode ', mode,
                                    ' for ', fname);
                        TP.raise(this, 'InvalidMode', msg);

                        request.fail(msg);
                    }
                } catch (e) {
                    msg = TP.sc('Unable to access: ', fname);
                    TP.raise(this, 'AccessViolation', TP.ec(e, msg));

                    request.fail(msg);
                }

                retVal = false;

                return retVal;
            });

        return retVal;
    },
    'safari',
    function(targetUrl, aRequest) {

        /**
         * @method $fileSave
         * @summary Saves content to the targetUrl provided using parameters
         *     and content taken from aRequest.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     parameters which control the operation including: body String The
         *     content of the file to save. append Boolean True to append to an
         *     existing file, otherwise the file will be created if needed and
         *     written to. backup Boolean True if a backup '~' file should be
         *     created. Ignored by the HTTP scheme versions. method String
         *     TP.HTTP_PUT or TP.HTTP_POST. Default is TP.HTTP_POST. permissions
         *     String A *NIX-style permission key such as '0755' or '0644'.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.URIException
         * @exception TP.sig.InvalidMode
         * @exception TP.sig.AccessViolation
         * @returns {Boolean} True on success, false on failure.
         */

        var request;

        request = TP.request(aRequest);

        TP.raise(this, 'TP.sig.UnsupportedOperation');
        request.fail('Unsupported operation.');

        return false;
    },
    'chrome',
    function(targetUrl, aRequest) {

        /**
         * @method $fileSave
         * @summary Saves content to the targetUrl provided using parameters
         *     and content taken from aRequest.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     parameters which control the operation including: body String The
         *     content of the file to save. append Boolean True to append to an
         *     existing file, otherwise the file will be created if needed and
         *     written to. backup Boolean True if a backup '~' file should be
         *     created. Ignored by the HTTP scheme versions. method String
         *     TP.HTTP_PUT or TP.HTTP_POST. Default is TP.HTTP_POST. permissions
         *     String A *NIX-style permission key such as '0755' or '0644'.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.URIException
         * @exception TP.sig.InvalidMode
         * @exception TP.sig.AccessViolation
         * @returns {Boolean} True on success, false on failure.
         */

        var request;

        request = TP.request(aRequest);

        TP.raise(this, 'TP.sig.UnsupportedOperation');
        request.fail('Unsupported operation.');

        return false;
    }
));

//  ------------------------------------------------------------------------
//  FILE EXECUTION
//  ------------------------------------------------------------------------

TP.definePrimitive('$fileExecute',
TP.hc(
    'test',
    TP.sys.getBrowser,
    'firefox',
    function(shellUrl, aRequest) {

        /**
         * @method $fileExecute
         * @summary Executes a command (e.g. a file found on the current OS
         *     platform), passing it any command arguments provided. The command
         *     is executed by the shell provided where that shell is being
         *     invoked with any flags given by shellFlags.
         * @description The best way to think about this command is to imagine
         *     that you had a batch file or shell script on the local platform
         *     that was composed of the command line 'shell flags cmd args' in
         *     that order. (In point of fact, this is what TIBET builds for you
         *     during operation of this function for Windows).
         *
         *     The shell in this case is the first element of the command line,
         *     but not the "root shell" as it were. In other words, on Windows
         *     you're always starting from cmd.exe (or perhaps hstart.exe on
         *     Mozilla if available to avoid popup windows). On *NIX platforms
         *     you're always starting from /bin/sh.
         * @param {String} shellUrl URL of the command shell you want to use.
         *     Examples are file:///bin/bash or perhaps
         *     file:///c:/.../powershell.exe.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     keys which can/should include: shellFlags String One or more
         *     shell arguments or flags such as "/c" (cmd.exe), "-c" (bash),
         *     "-Command" (powershell), or "/NOWINDOW" (hstart.exe). These
         *     precede the command itself. commandName String The command name
         *     you want to run in the context of the shell. commandArgs Object
         *     An optional set of command arguments either in string, array or
         *     hash form. stdOut String A URI defining where output from the
         *     command should be placed. Defaults to a temp file used to provide
         *     access to result data. stdErr String A URI defining where to
         *     place error output. Defaults to a temp file used to capture
         *     errors. stdIn String A URI defining a file to use for standard
         *     input. No default. async Boolean True to run non-blocking.
         *     Default is false.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.InvalidShell
         * @exception TP.sig.ProcessException
         * @exception TP.sig.ExecutionException
         * @returns {Array<Number,String,String>} An array containing the result
         *     code (0 on success), the command output, and any error output, in
         *     string form.
         */

        var request,
            shellFlags,
            commandName,
            commandArgs,
            stdIn,
            stdOut,
            stdErr,
            async,

            shell,
            retVal,
            msg;

        if (!TP.isString(shellUrl)) {
            return TP.raise(this, 'TP.sig.InvalidURI');
        }

        request = TP.request(aRequest);

        shellFlags = request.at('shellFlags');
        commandName = request.at('commandName');
        commandArgs = request.at('commandArgs');

        stdIn = request.at('stdIn');
        stdOut = request.at('stdOut');
        stdErr = request.at('stdErr');

        async = request.atIfInvalid('async', false);

        //  command name is required or there's nothing to do
        if (!TP.isString(commandName)) {
            msg = TP.sc('Must supply a commandName to execute.');
            TP.raise(this, 'TP.sig.InvalidParameter', msg);

            request.fail(msg);

            return TP.ac(TP.FAILED, null, msg);
        }

        //  when not a real value we'll just default to an empty prefix value
        if (TP.sys.isWin()) {
            shell = TP.uriInLocalFormat(TP.ifInvalid(shellUrl, ''));
        } else {
            //  on *NIX we'll use the comspec, so we'll try to exec the same
            //  shell we'll be using for the overall process unless told
            //  otherwise
            shell = TP.uriInLocalFormat(
                    TP.ifInvalid(shellUrl, TP.sys.cfg('os.comspec_path')));
        }

        if (/ /.test(shell)) {
            if (TP.sys.isWin()) {
                //  on Windows we can quote the path
                shell = '"' + shell + '"';
            } else {
                //  on *NIX we escape via backslashed spaces
                shell = shell.replace(/ /g, '\\ ');
            }
        }

        //  We need to request privileges from Mozilla to perform this
        //  operation. We don't bother trying this operation without
        //  privileges because we still need them, even if we were launched
        //  from the 'same domain' (i.e. the file system).

        TP.executePrivileged(
            TP.HOST_CMD_EXEC,
            TP.sc('This TIBET-based application would like to execute ' +
                        'the following command on the host system: ',
                        commandName, ' ', commandArgs),
            TP.sc('This TIBET-based application cannot execute the ' +
                        'following command on the host system: ',
                        commandName, ' ', commandArgs),
            false,      //  don't even attempt this this without privileges
            function() {

                var flags,
                    cmd,
                    args,
                    message,

                    cmdline,
                    cmdext,
                    cmdarr,

                //  the batch file content and file s
                    cmdText,    //  content we'll write to the file
                    cmdFile,    //  generated batch file name
                    doneFile,   //  semaphore file for async calling
                    inFile,
                    errFile,
                    outFile,
                    loadFile,   //  file currently being read back in for
                                //  data

                //  processing
                    process,
                    result,

                //  results
                    output,
                    errors,

                //  sync/async support flag/functions
                    listen,
                    cleanup,
                    sig,
                    id,

                //  moz util/component elements
                    cls,
                    svc,
                    file,
                    pid,
                    params;

                //  note the "invalid" here, not "empty" to allow setting
                //  empty flags
                if (TP.sys.isWin()) {
                    flags = TP.ifInvalid(shellFlags, '');
                } else {
                    flags = TP.ifInvalid(shellFlags,
                                            TP.sys.cfg('os.comspec_flags'));
                }

                if (TP.isString(flags)) {
                    flags = flags.split(' ');
                }

                //  command name, normally not even a URI, but might be one,
                //  in which case we'll need to quote it if there are spaces
                //  in the path.
                //  NOTE that because of this you can't pass full commands
                //  with args in this fashion when the command itself has
                //  spaces in it.
                cmd = TP.uriInLocalFormat(commandName);
                if (/ /.test(cmd)) {
                    if (TP.sys.isWin()) {
                        cmd = '"' + cmd + '"';
                    } else {
                        cmd = cmd.replace(/ /g, '\\ ');
                    }
                }

                //  process the command arguments into something we can put
                //  on the end of the command name. NOTE that we don't
                //  attempt to process any of these for potential quoting
                //  issues so if they reference files it'll be up to the
                //  caller to manage that
                if (TP.isString(commandArgs)) {
                    args = commandArgs;
                } else if (TP.isArray(commandArgs)) {
                    args = commandArgs.join(' ');
                } else if (TP.isHash(commandArgs)) {
                    args = commandArgs.asArray().flatten().join(' ');
                } else {
                    args = '';
                }

                //  don't default input since that's very specific to a
                //  command
                if (TP.notEmpty(inFile = TP.ifInvalid(stdIn, ''))) {
                    inFile = TP.uriInLocalFormat(inFile);
                    if (/ /.test(inFile)) {
                        if (TP.sys.isWin()) {
                            inFile = '"' + inFile + '"';
                        } else {
                            inFile = inFile.replace(/ /g, '\\ ');
                        }
                    }
                }

                //  stderr and stdout have to be constructed if we're going
                //  to capture any of the response from the command. when
                //  overridden it means the user has something else in
                //  mind... and that'll be taken into account when we get to
                //  the delete stage
                errFile = TP.uriInLocalFormat(
                                TP.ifInvalid(stdErr, TP.uriTempFileName()));

                if (/ /.test(errFile)) {
                    if (TP.sys.isWin()) {
                        errFile = '"' + errFile + '"';
                    } else {
                        errFile = errFile.replace(/ /g, '\\ ');
                    }
                }

                outFile = TP.uriInLocalFormat(
                                TP.ifInvalid(stdOut, TP.uriTempFileName()));

                if (/ /.test(outFile)) {
                    if (TP.sys.isWin()) {
                        outFile = '"' + outFile + '"';
                    } else {
                        outFile = outFile.replace(/ /g, '\\ ');
                    }
                }

                //  all the parts are ready. now build a valid command line
                //  for the platform in question based on the various
                //  elements we've got
                cmdarr = TP.ac(shell, flags, cmd, args);

                if (TP.notEmpty(inFile)) {
                    cmdarr.push(
                        TP.sys.cfg('os.comspec_redirect_in') + inFile);
                }

                if (TP.notEmpty(outFile)) {
                    cmdarr.push(
                        TP.sys.cfg('os.comspec_redirect_out') + outFile);
                }

                if (TP.notEmpty(errFile)) {
                    cmdarr.push(
                        TP.sys.cfg('os.comspec_redirect_err') + errFile);
                }

                //  expand out the actual command line text
                cmdline = cmdarr.join(' ').trim();

                //  to help avoid problems with async we use a temp file
                //  name for our generated batch file as well
                cmdext = TP.sys.isWin() ? 'bat' : 'sh';
                cmdFile = TP.uriExpandPath(TP.uriTempFileName(
                                                null, null, cmdext));
                cmdFile = TP.uriInLocalFormat(cmdFile);

                if (TP.sys.isWin()) {
                    cmdText = TP.join('@echo off\n', cmdline);
                    if (async) {
                        //  when async we need a semaphore file 'touch' to
                        //  signal it, so we'll touch a file named the same
                        //  as the bat file, but with '.done' on the tail
                        doneFile = TP.join(cmdFile, '.done');
                        if (/ /.test(doneFile)) {
                            doneFile = TP.join('"', doneFile, '"');
                        }

                        //  echoing to our done file will create it and
                        //  trigger the callback
                        cmdText = TP.join(cmdText, '\necho "', cmdFile,
                                            ' done." >', doneFile);
                    }

                    cmdText = TP.join(cmdText, '\nexit /B\n');
                } else {
                    cmdText = TP.join('#!', TP.sys.cfg('os.comspec_path'),
                                        '\n', cmdline);
                    if (async) {
                        //  when async we need a semaphore file 'touch' to
                        //  signal it, so we'll touch a file named the same
                        //  as the bat file, but with '.done' on the tail
                        doneFile = TP.join(cmdFile, '.done');
                        if (/ /.test(doneFile)) {
                            doneFile = TP.join('"', doneFile, '"');
                        }

                        //  echoing to our done file will create it and
                        //  trigger the callback
                        cmdText = TP.join(cmdText, '\ntouch ', doneFile);
                    }
                }

                if (/ /.test(cmdFile)) {
                    if (TP.sys.isWin()) {
                        cmdFile = TP.join('"', cmdFile, '"');
                    } else {
                        cmdFile = cmdFile.replace(/ /g, '\\ ');
                    }
                }

                //  write out our batch file content
                /* eslint-disable no-octal */
                TP.$fileSave(TP.uriInWebFormat(cmdFile),
                                TP.hc('body', cmdText, 'permissions', 0755,
                                    'backup', false));
                /* eslint-enable no-octal */

                //  having built a batch file that contains our command line
                //  the batch file name now becomes our command line
                cmdline = cmdFile;

                //  we'll need to clean up all our files when we finish, but
                //  since we may be run async we want a function we can call
                //  from the callback wrapper we'll build below
                cleanup = function() {

                    try {
                        if (!TP.$$DEBUG) {
                            //  always remove the command file...it's part
                            //  of our internal machinery
                            setTimeout(
                                function() {

                                    TP.$fileDelete(
                                        TP.uriInWebFormat(cmdFile));
                                }, 10);

                            //  and any 'done' file that may also exist
                            if (TP.notEmpty(doneFile)) {
                                setTimeout(
                                    function() {

                                        TP.$fileDelete(
                                            TP.uriInWebFormat(doneFile));
                                    }, 10);
                            }

                            //  only remove the output file if we built it
                            //  as a temp
                            if (TP.isEmpty(stdOut)) {
                                setTimeout(
                                    function() {

                                        TP.$fileDelete(
                                            TP.uriInWebFormat(outFile));
                                    }, 10);
                            }

                            //  only remove the error file if we built it
                            //  as a temp
                            if (TP.isEmpty(stdErr)) {
                                setTimeout(
                                    function() {

                                        TP.$fileDelete(
                                            TP.uriInWebFormat(errFile));
                                    }, 10);
                            }
                        }
                    } catch (e) {
                        TP.ifError() ?
                            TP.error(
                                TP.ec(e, 'Error deleting file')) :
                            0;
                    }
                };

                //  get a local file instance representing the cmd
                try {
                    cls = '@mozilla.org/file/local;1';
                    svc = Components.interfaces.nsILocalFile;

                    file = Components.classes[cls].createInstance(svc);

                    //  NOTE that our "root shell" isn't provided in this
                    //  call, it's a configuration parameter that's set
                    //  once for the application.
                    //  This is typically either cmd.exe, or hstart.exe for
                    //  those willing to install it to avoid seeing window
                    //  popups
                    file.initWithPath(
                            TP.uriInLocalFormat(
                                TP.sys.cfg('os.comspec_path')));
                } catch (e) {
                    message = TP.sc('Unable to init shell file: ',
                                    TP.uriInLocalFormat(
                                        TP.sys.cfg('os.comspec_path')));

                    TP.raise(this, 'InvalidShell',
                                TP.ec(e, message));

                    request.fail(message);

                    retVal = TP.ac(TP.FAILED, null, message);

                    return retVal;
                }

                //  now get a process wrapper for the file
                try {
                    cls = '@mozilla.org/process/util;1';
                    svc = Components.interfaces.nsIProcess;

                    process = Components.classes[cls].createInstance(svc);
                    process.init(file);
                } catch (e) {
                    message = TP.sc('Unable to init process for: ',
                                TP.uriInLocalFormat(
                                    TP.sys.cfg('os.comspec_path')));

                    TP.raise(this, 'ProcessException',
                                TP.ec(e, message));

                    retVal = TP.ac(TP.FAILED, null, message);

                    return retVal;
                }

                //  sync or not we'll be invoking TP.sig.IOCompleted when
                //  done
                sig = TP.sig.Response.construct(request);
                sig.setSignalName('TP.sig.IOCompleted');
                id = request.getID();

                sig.atPut('cmdFile', TP.uriInWebFormat(cmdFile));
                sig.atPut('outFile', TP.uriInWebFormat(outFile));
                sig.atPut('errFile', TP.uriInWebFormat(errFile));

                if (async) {
                    //  when async we return the response object so there's
                    //  a handle to it
                    retVal = sig;

                    //  if we're not running sync we'll need to set up a
                    //  'listener' for the touch file we create in our batch
                    //  file. when that file appears we know the true
                    //  command has exited
                    listen = function() {

                        if (TP.$fileExists(TP.uriInWebFormat(doneFile))) {
                            try {
                                request.complete();
                                sig.fire(id);
                            } finally {
                                cleanup();
                            }

                            return;
                        }

                        //  TODO:   come up with better computations here
                        if (listen.$$count++ < TP.sys.cfg('os.exec_interval')) {
                            setTimeout(listen, TP.sys.cfg('os.exec_delay'));
                        }
                    };

                    listen.$$count = 0;

                    //  queue the callback listener
                    setTimeout(listen, 10);
                }

                pid = {};

                //  the Mozilla process API requires our root shell as the
                //  process's file and the flags to be passed in an array.
                //  NOTE: we have to pass each flag separately so we copy
                //  whatever array of flags was defined and simply add the
                //  command line pointing to our batch file
                params = TP.sys.cfg('os.comspec_flags').copy().add(
                                                        cmdFile.unquoted());
                try {
                    TP.ifTrace() && TP.$DEBUG && TP.$VERBOSE ?
                        TP.trace(
                            TP.join(
                                'Launching ',
                                TP.uriInLocalFormat(
                                    TP.sys.cfg('os.comspec_path')),
                                ' ',
                                TP.sys.cfg('os.comspec_flags').join(' '),
                                ' for command line: ',
                                cmdline),
                            TP.DEBUG) : 0;

                    //  TODO:   older versions use PID, what about newer?
                    //  run(blocking, args, arg size[, pidObj])
                    result = process.run(!async, params, params.getSize(),
                                            pid);

                    if (TP.notTrue(async)) {
                        //  at this point we should be able to read in the
                        //  output and error content, remove those files,
                        //  and return the overall results
                        loadFile = TP.uriInWebFormat(outFile);

                        TP.ifTrace() && TP.$DEBUG && TP.$VERBOSE ?
                            TP.trace('outFile: ' + loadFile) : 0;

                        output = TP.$fileLoad(loadFile);

                        loadFile = TP.uriInWebFormat(errFile);
                        TP.ifTrace() && TP.$DEBUG && TP.$VERBOSE ?
                            TP.trace('errFile: ' + loadFile) : 0;

                        errors = TP.$fileLoad(loadFile);
                    }
                } catch (e) {
                    message = TP.str(e);
                    TP.raise(this, 'ExecutionException',
                                TP.ec(e));

                    request.fail(message);

                    retVal = TP.ac(TP.FAILED, null, message);
                } finally {
                    if (TP.notTrue(async)) {
                        retVal = TP.ac(result, output, errors);
                        request.complete(retVal);
                        sig.fire(id);

                        cleanup();
                    }
                }
            });

        return retVal;
    },
    'safari',
    function(shellUrl, aRequest) {

        /**
         * @method $fileExecute
         * @summary Executes a command (e.g. a file found on the current OS
         *     platform), passing it any command arguments provided. The command
         *     is executed by the shell provided where that shell is being
         *     invoked with any flags given by shellFlags.
         * @description The best way to think about this command is to imagine
         *     that you had a batch file or shell script on the local platform
         *     that was composed of the command line 'shell flags cmd args' in
         *     that order. (In point of fact, this is what TIBET builds for you
         *     during operation of this function for Windows).
         *
         *     The shell in this case is the first element of the command line,
         *     but not the "root shell" as it were. In other words, on Windows
         *     you're always starting from cmd.exe (or perhaps hstart.exe on
         *     Mozilla if available to avoid popup windows). On *NIX platforms
         *     you're always starting from /bin/sh.
         * @param {String} shellUrl URL of the command shell you want to use.
         *     Examples are file:///bin/bash or perhaps
         *     file:///c:/.../powershell.exe.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     keys which can/should include: shellFlags String One or more
         *     shell arguments or flags such as "/c" (cmd.exe), "-c" (bash),
         *     "-Command" (powershell), or "/NOWINDOW" (hstart.exe). These
         *     precede the command itself. commandName String The command name
         *     you want to run in the context of the shell. commandArgs Object
         *     An optional set of command arguments either in string, array or
         *     hash form. stdOut String A URI defining where output from the
         *     command should be placed. Defaults to a temp file used to provide
         *     access to result data. stdErr String A URI defining where to
         *     place error output. Defaults to a temp file used to capture
         *     errors. stdIn String A URI defining a file to use for standard
         *     input. No default. async Boolean True to run non-blocking.
         *     Default is false.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.InvalidShell
         * @exception TP.sig.ProcessException
         * @exception TP.sig.ExecutionException
         * @returns {Array<Number,String,String>} An array containing the result
         *     code (0 on success), the command output, and any error output, in
         *     string form.
         */

        var request;

        request = TP.request(aRequest);

        TP.raise(this, 'TP.sig.UnsupportedOperation');
        request.fail('Unsupported operation.');

        return false;
    },
    'chrome',
    function(shellUrl, aRequest) {

        /**
         * @method $fileExecute
         * @summary Executes a command (e.g. a file found on the current OS
         *     platform), passing it any command arguments provided. The command
         *     is executed by the shell provided where that shell is being
         *     invoked with any flags given by shellFlags.
         * @description The best way to think about this command is to imagine
         *     that you had a batch file or shell script on the local platform
         *     that was composed of the command line 'shell flags cmd args' in
         *     that order. (In point of fact, this is what TIBET builds for you
         *     during operation of this function for Windows).
         *
         *     The shell in this case is the first element of the command line,
         *     but not the "root shell" as it were. In other words, on Windows
         *     you're always starting from cmd.exe (or perhaps hstart.exe on
         *     Mozilla if available to avoid popup windows). On *NIX platforms
         *     you're always starting from /bin/sh.
         * @param {String} shellUrl URL of the command shell you want to use.
         *     Examples are file:///bin/bash or perhaps
         *     file:///c:/.../powershell.exe.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     keys which can/should include: shellFlags String One or more
         *     shell arguments or flags such as "/c" (cmd.exe), "-c" (bash),
         *     "-Command" (powershell), or "/NOWINDOW" (hstart.exe). These
         *     precede the command itself. commandName String The command name
         *     you want to run in the context of the shell. commandArgs Object
         *     An optional set of command arguments either in string, array or
         *     hash form. stdOut String A URI defining where output from the
         *     command should be placed. Defaults to a temp file used to provide
         *     access to result data. stdErr String A URI defining where to
         *     place error output. Defaults to a temp file used to capture
         *     errors. stdIn String A URI defining a file to use for standard
         *     input. No default. async Boolean True to run non-blocking.
         *     Default is false.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.InvalidShell
         * @exception TP.sig.ProcessException
         * @exception TP.sig.ExecutionException
         * @returns {Array<Number,String,String>} An array containing the result
         *     code (0 on success), the command output, and any error output, in
         *     string form.
         */

        var request;

        request = TP.request(aRequest);

        TP.raise(this, 'TP.sig.UnsupportedOperation');
        request.fail('Unsupported operation.');

        return false;
    }
));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
