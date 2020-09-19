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

/* global Components:false,
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
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     call parameters.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.InvalidOperation
         * @exception TP.sig.URIException
         * @returns {Boolean} True if the delete appears successful.
         */

        var path,
            msg,
            retVal,
            request;

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
                    TP.raise(this, 'TP.sig.URIException', TP.ec(e, message));

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
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     call parameters.
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
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     call parameters.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.InvalidOperation
         * @exception TP.sig.URIException
         * @returns {Boolean} True if the delete appears successful.
         */

        var request,

            path,
            fname,

            result,

            msg;

        if (!TP.isString(targetUrl)) {
            return TP.raise(this, 'TP.sig.InvalidURI');
        }

        request = TP.request(aRequest);

        //  expand to support virtual uri input
        path = TP.uriExpandPath(targetUrl);

        //  make sure that any fragments ('#' followed by word characters)
        //  is trimmed off
        if (/#/.test(path)) {
            path = path.slice(0, path.indexOf('#'));
        }

        if (TP.sys.cfg('boot.context') === 'electron' &&
                                                    !TP.sys.inExtension()) {
            //  following operation uses local name, not web format
            fname = TP.uriInLocalFormat(path);

            //  Call the external Electron utilities to delete the file
            result = TP.extern.electron_lib_utils.fileDelete(fname);

            if (result.ok === false) {
                TP.raise(this, 'TP.sig.IOFailed');

                msg = TP.sc('File could not be deleted: ', path,
                                '. Reason: ' + result.msg);
                request.fail(msg);

                return false;
            } else {
                request.complete(true);

                return true;
            }

        } else {
            TP.raise(this, 'TP.sig.UnsupportedOperation');
            request.fail('Unsupported operation.');
        }

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
         * @returns {Boolean} True if the file exists.
         */

        var path,
            httpObj,
            request;

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
         * @returns {Boolean} True if the file exists.
         */

        var path,
            request,
            httpObj;

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
         * @returns {Boolean} True if the file exists.
         */

        var path,

            request,

            fname,
            result,

            msg,

            httpObj;

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

        if (TP.sys.cfg('boot.context') === 'electron' &&
                                                    !TP.sys.inExtension()) {
            //  following operation uses local name, not web format
            fname = TP.uriInLocalFormat(path);

            //  Call the external Electron utilities to test the file for
            //  existence.
            result = TP.extern.electron_lib_utils.fileExists(fname);

            if (result.ok === false) {
                TP.raise(this, 'TP.sig.IOFailed');

                msg = TP.sc('File could not be tested for existence: ', path,
                            '. Reason: ' + result.msg);
                request.fail(msg);

                return false;
            } else {
                //  The file check completed successfully - complete the request
                //  with the value of the 'exists' field of the result.
                request.complete(result.exists);

                //  And return that value.
                return result.exists;
            }

        } else {

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

                //  The file didn't exist - complete the request with a value of
                //  false.
                request.complete(false);

                //  And return false.
                return false;
            }

            //  The file did exist - complete the request with a value of true.
            request.complete(true);

            //  And return true.
            return true;
        }
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
         * @summary Loads the content of targetUrl, returning data as text.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     call parameters.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.PrivilegeViolation
         * @exception TP.sig.IOException
         * @returns {String}
         */

        var request,
            path,
            text,
            httpObj,
            msg,

            FP,
            IOS,
            IS,

            file,
            fname,

            channel,
            stream;

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

        request.complete(text);

        return text;
    },
    'safari',
    function(targetUrl, aRequest) {

        /**
         * @method $fileLoad
         * @summary Loads the content of targetUrl, returning data as text.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     call parameters.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.PrivilegeViolation
         * @exception TP.sig.IOException
         * @returns {String}
         */

        var path,
            request,
            msg,
            text,
            httpObj;

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

        request.complete(text);

        return text;
    },
    'chrome',
    function(targetUrl, aRequest) {

        /**
         * @method $fileLoad
         * @summary Loads the content of targetUrl, returning data as text.
         * @param {String} targetUrl URL of the target file.
         * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
         *     call parameters.
         * @exception TP.sig.InvalidURI
         * @exception TP.sig.PrivilegeViolation
         * @exception TP.sig.IOException
         * @returns {String}
         */

        var path,
            request,
            fname,
            msg,
            text,
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

        if (TP.sys.cfg('boot.context') === 'electron' &&
                                                    !TP.sys.inExtension()) {
            //  following operation uses local name, not web format
            fname = TP.uriInLocalFormat(path);

            //  Call the external Electron utilities to load the file
            result = TP.extern.electron_lib_utils.fileLoad(fname);

            if (result.ok === false) {
                TP.raise(this, 'TP.sig.IOFailed');

                msg = TP.sc('File could not be loaded: ', path,
                            '. Reason: ' + result.msg);
                request.fail(msg);

                return;
            }

            text = result.content;

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
        }

        request.complete(text);

        return text;
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

        //  make sure that any fragments ('#' followed by word characters)
        //  is trimmed off
        if (/#/.test(path)) {
            path = path.slice(0, path.indexOf('#'));
        }

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

        var request,

            path,

            append,
            mode,

            body,

            fname,

            result,

            msg;

        request = TP.request(aRequest);

        //  expand to support virtual uri input
        path = TP.uriExpandPath(targetUrl);

        //  make sure that any fragments ('#' followed by word characters)
        //  is trimmed off
        if (/#/.test(path)) {
            path = path.slice(0, path.indexOf('#'));
        }

        //  default is to blow away old copy if any and create a new file
        append = TP.ifKeyInvalid(request, 'append', false);
        mode = append ? TP.APPEND : TP.WRITE;

        body = TP.ifKeyInvalid(request, 'body', '');

        if (TP.sys.cfg('boot.context') === 'electron' &&
                                                    !TP.sys.inExtension()) {
            //  following operation uses local name, not web format
            fname = TP.uriInLocalFormat(path);

            //  Call the external Electron utilities to save the file
            result = TP.extern.electron_lib_utils.fileSave(fname, body, mode);

            if (result.ok === false) {
                TP.raise(this, 'TP.sig.IOFailed');

                msg = TP.sc('File could not be saved: ', path,
                                '. Reason: ' + result.msg);
                request.fail(msg);

                return false;
            } else {
                request.complete(true);

                return true;
            }

        } else {
            TP.raise(this, 'TP.sig.UnsupportedOperation');
            request.fail('Unsupported operation.');
        }

        return false;
    }
));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
