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
@file           TIBETPrimitivesGecko.js
@abstract       Platform-specific base primitives.
*/

/* JSHint checking */

/* global netscape:false
*/

//  ------------------------------------------------------------------------
//  TIBET - TYPE DICTIONARIES - NATIVE
//  ------------------------------------------------------------------------

TP.definePrimitive('isError',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(anObj) {

        /**
         * @name isError
         * @synopsis Returns true if the object provided is an Error object.
         * @param {Object} anObj The Object to test.
         * @returns {Boolean} Whether or not the supplied object is an Event
         *     object.
         */

        //  Gecko likes to throw component exceptions which don't respond
        //  correctly as instances of Error so we use a different check than
        //  the common routine.
        return (TP.isValid(anObj) &&
                anObj.message !== undefined &&
                (anObj.stack !== undefined ||
                    anObj.QueryInterface !== undefined));
    },
    TP.DEFAULT,
    function(anObj) {

        /**
         * @name isError
         * @synopsis Returns true if the object provided is an Error object.
         * @param {Object} anObj The Object to test.
         * @returns {Boolean} Whether or not the supplied object is an Event
         *     object.
         */

        if (TP.notValid(anObj)) {
            return false;
        }

        if (anObj instanceof Error) {
            return true;
        }

        return (TP.isValid(anObj) &&
                anObj.message !== undefined &&
                anObj.stack !== undefined);
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('isNamedNodeMap',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'trident',
    function(anObj) {

        /**
         * @name isNamedNodeMap
         * @synopsis Returns true if the object provided is a DOM named node
         *     map.
         * @description We need to supply a special version of this for IE
         *     because named node maps returned from the XML DOM are different
         *     from those returned from the HTML DOM.
         * @param {Object} anObj The Object to test.
         * @example Test what's a named node map and what's not:
         *     <code>
         *          TP.isNamedNodeMap(TP.documentGetBody(document).attributes);
         *          <samp>true</samp>
         *          TP.isNamedNodeMap(TP.documentGetBody(document).childNodes);
         *          <samp>false</samp>
         *     </code>
         * @returns {Boolean} Whether or not the supplied object is a named node
         *     map.
         * @todo
         */

        if (TP.notValid(anObj)) {
            return false;
        }

        //  For named node maps produced from XML documents in IE...

        //  If we even try to touch the 'getNamedItem' or 'setNamedItem'
        //  slots on a named node map that was produced from an XML document
        //  in IE, it throws an exception. But making the 'typeof' call on
        //  those slots returns a value of 'unknown', as opposed to
        //  'undefined', which is what they would be if they weren't defined
        //  at all. Sheesh...
        /* eslint-disable valid-typeof */
        if (typeof anObj.getNamedItem === 'unknown' &&
            typeof anObj.setNamedItem === 'unknown') {
            return true;
        }
        /* eslint-enable valid-typeof */

        if (TP.isValid(anObj.getNamedItem) &&
                TP.isValid(anObj.setNamedItem)) {
            return true;
        }

        return false;
    },
    TP.DEFAULT,
    function(anObj) {

        /**
         * @name isNamedNodeMap
         * @synopsis Returns true if the object provided is a DOM named node
         *     map.
         * @param {Object} anObj The Object to test.
         * @example Test what's a named node map and what's not:
         *     <code>
         *          TP.isNamedNodeMap(TP.documentGetBody(document).attributes);
         *          <samp>true</samp>
         *          TP.isNamedNodeMap(TP.documentGetBody(document).childNodes);
         *          <samp>false</samp>
         *     </code>
         * @returns {Boolean} Whether or not the supplied object is a named node
         *     map.
         * @todo
         */

        return TP.isValid(anObj) &&
                TP.isValid(anObj.getNamedItem) &&
                TP.isValid(anObj.setNamedItem);
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('isNodeList',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'trident',
    function(anObj) {

        /**
         * @name isNodeList
         * @synopsis Returns true if the object provided is a DOM node list (or
         *     an Array acting like one).
         * @description We need to supply a special version of this for IE
         *     because node lists returned from the XML DOM are different from
         *     those returned from the HTML DOM.
         * @param {Object} anObj The Object to test.
         * @returns {Boolean} Whether or not the supplied object is a node list.
         */

        if (TP.notValid(anObj)) {
            return false;
        }

        //  For node lists produced from XML documents in IE...

        //  Sometimes (i.e. the 'attributes' collection on elements), named
        //  node maps also think that they're node lists, so if this is a
        //  named node map, then return false
        if (TP.isNamedNodeMap(anObj)) {
            return false;
        }

        //  If we even try to touch the 'item' slot on a node list that was
        //  produced from an XML document in IE, it throws an exception. But
        //  making the 'typeof' call on that slot returns a value of
        //  'unknown', as opposed to 'undefined', which is what it would be
        //  if it wasn't defined at all. Sheesh...
        /* eslint-disable valid-typeof */
        if (typeof anObj.length === 'number' &&
            typeof anObj.item === 'unknown') {
            return true;
        }
        /* eslint-enable valid-typeof */

        if (TP.isArray(anObj)) {
            //  empty, or first element is a node? assume they all are
            if (anObj.length === 0 || TP.isNode(anObj[0])) {
                return true;
            }

            return false;
        }

        //  On IE, window objects have both a 'length' and a 'item' slot. We
        //  might mistake them for node lists, so we put an extra check to
        //  make sure anObj does *not* also have a 'frames' slot, which
        //  windows do.
        if (TP.isDefined(anObj.length) &&
            TP.isDefined(anObj.item) &&
            TP.notDefined(anObj.frames)) {
            return true;
        }

        return false;
    },
    TP.DEFAULT,
    function(anObj) {

        /**
         * @name isNodeList
         * @synopsis Returns true if the object provided is a DOM node list (or
         *     an Array acting like one).
         * @description We need to supply a special version of this for IE
         *     because node lists returned from the XML DOM are different from
         *     those returned from the HTML DOM.
         * @param {Object} anObj The Object to test.
         * @example Test what's a node list and what's not:
         *     <code>
         *          TP.isNodeList(TP.documentGetBody(document).childNodes);
         *          <samp>true</samp>
         *          TP.isNodeList(TP.documentGetBody(document).attributes);
         *          <samp>false</samp>
         *     </code>
         * @returns {Boolean} Whether or not the supplied object is a node list.
         * @todo
         */

        if (TP.notValid(anObj) || TP.isWindow(anObj)) {
            return false;
        }

        //  Sometimes (i.e. the 'attributes' collection on elements), named
        //  node maps also think that they're node lists, so if this is a
        //  named node map, then return false
        if (TP.isNamedNodeMap(anObj)) {
            return false;
        }

        //  some arrays double as NodeList objects and since we augment them
        //  them with an 'item' slot that test won't be sufficient
        if (TP.isArray(anObj)) {
            //  Missing the '.join' method? Assume we're a NodeList
            if (anObj.join === undefined) {
                return true;
            }

            return false;
        }

        //  have to watch out for other things with length, like strings and
        //  CSSStyleDeclarations
        return typeof(anObj) !== 'string' &&
                anObj.length !== undefined &&
                anObj.item !== undefined &&
                anObj.nodeType === undefined &&
                anObj.cssText === undefined;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('isXMLNode',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'trident',
    function(anObj) {

        /**
         * @name isXMLNode
         * @synopsis Returns true if the object provided is an XML node.
         * @param {Object} anObj The Object to test.
         * @example Test what's an xml element and what's not:
         *     <code>
         *          newXMLDoc = TP.doc('<foo/>');
         *          TP.isXMLNode(newXMLDoc.documentElement);
         *          <samp>true</samp>
         *          TP.isXMLNode(newXMLDoc);
         *          <samp>true</samp>
         *     </code>
         * @returns {Boolean} Whether or not the supplied object is an XML node.
         * @todo
         */

        return TP.isValid(anObj) &&
                typeof anObj.nodeType === 'number' &&
                (anObj.scopeName !== 'HTML' ||
                    !TP.isHTMLDocument(TP.nodeGetDocument(anObj)));
    },
    TP.DEFAULT,
    function(anObj) {

        /**
         * @name isXMLNode
         * @synopsis Returns true if the object provided is an XML node.
         * @param {Object} anObj The Object to test.
         * @example Test what's an xml element and what's not:
         *     <code>
         *          newXMLDoc = TP.doc('<foo/>');
         *          TP.isXMLNode(newXMLDoc.documentElement);
         *          <samp>true</samp>
         *          TP.isXMLNode(newXMLDoc);
         *          <samp>true</samp>
         *     </code>
         * @returns {Boolean} Whether or not the supplied object is an XML node.
         * @todo
         */

        var doc;

        //  Make sure its a node first.
        if (TP.notValid(anObj) || typeof anObj.nodeType !== 'number') {
            return false;
        }

        if (anObj.nodeType === Node.DOCUMENT_NODE) {
            return TP.isXMLDocument(anObj);
        }

        //  If the node isn't in a document anywhere, then about the only
        //  thing we can do is check to see if it has a tagName (i.e. it is
        //  a Node.ELEMENT_NODE), and if that tag name is one of the HTML
        //  ones. If so, we return false (since its really an HTML node - it
        //  may be an XHTML node, but we can't tell that here).
        if (TP.notValid(doc = anObj.ownerDocument)) {
            if (TP.isValid(anObj.tagName)) {
                return !TP.isValid(
                            TP.HTML_401_TAGS[anObj.tagName.toLowerCase()]);
            }

            return false;
        }

        //  If its document is an XML document, then its definitely an XML
        //  node.
        return TP.isXMLDocument(doc);
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('isXHR',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'trident',
    function(anObj) {

        /**
         * @name isXHR
         * @synopsis Returns true if the object appears to be an XMLHttpRequest
         *     instance. These are tricky little suckers that will throw
         *     exceptions if you don't treat them nicely so this is a good check
         *     to use when you suspect you might have an XHR.
         * @param {Object} anObj The object to interrogate.
         * @returns {Boolean} True if the object looks like an XHR.
         */

        try {
            return (TP.isValid(anObj) &&
                    TP.isProperty(anObj, 'responseText') &&
                    TP.isProperty(anObj, 'responseXML'));
        } catch (e) {
        }

        return false;
    },
    TP.DEFAULT,
    function(anObj) {

        /**
         * @name isXHR
         * @synopsis Returns true if the object appears to be an XMLHttpRequest
         *     instance. These are tricky little suckers that will throw
         *     exceptions if you don't treat them nicely so this is a good check
         *     to use when you suspect you might have an XHR.
         * @param {Object} anObj The object to interrogate.
         * @returns {Boolean} True if the object looks like an XHR.
         */

        try {
            return TP.isValid(anObj) &&
                    TP.isProperty(anObj, 'responseText') &&
                    typeof anObj.send === 'function';
        } catch (e) {
        }

        return false;
    }
));

//  ------------------------------------------------------------------------
//  COMMON UTILITY ROUTINES
//  ------------------------------------------------------------------------

TP.definePrimitive('executePrivileged',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(privilegedOp, reasonMsg, failureMsg, tryUnprivileged, privilegedFunction) {
        /**
         * @name executePrivileged
         * @synopsis Execute a function that requires some sort of special
         *     browser privileges, like reading data or a page in another domain
         *     or writing to the file system.
         * @param {String} privilegedOp One of the 'privileged operation'
         *     constants defined at the global level, such as
         *     TP.ACCESS_XDOMAIN_XMLHTTP.
         * @param {String} reasonMsg Message text describing to the user why a
         *     particular privilege is required.
         * @param {String} failureMsg Message text describing to the user the
         *     implications of failing to provide a particular privilege.
         * @param {Boolean} tryUnprivileged Whether or not to attempt to execute
         *     the privileged function in an unprivileged manner first.
         * @param {Function} privilegedFunction A Function containing the code
         *     that requires a particular set of privileges.
         * @returns {Boolean} Whether or not the privileged Function succeeded
         *     in obtaining permission to execute.
         * @todo
         */

        var dialogShownThreshold,

            permissionObtained,
            dialogShown,

            stopPrompting,
            continuePrompting,

            startTime,
            endTime;

        //  The number of milliseconds after which we determine a dialog was
        //  shown to the user.
        dialogShownThreshold = 250;

        //  First, determine whether we even need to ask for permission for
        //  this privilege

        //  If we should try an unprivileged execute, then go ahead and try
        //  it here. If it succeeds, we'll return true. Otherwise, we won't
        //  do anything in the catch block the exception. We'll try to
        //  obtain permission and try again.
        if (TP.isTrue(tryUnprivileged) || TP.sys.isExiting()) {
            try {
                privilegedFunction();

                return true;
            } catch (e) {
                if (TP.sys.isExiting()) {
                    return false;
                }
            }
        }

        //  Next, observe the TIBET flag as to whether to request permission
        //  for privileges.
        if (!TP.sys.shouldRequestPrivileges()) {
            TP.ifTrace() ? TP.sys.logSecurity(
                'TIBET not configured to request privileged code execution',
                TP.DEBUG) : 0;

            return false;
        }

        permissionObtained = false;
        dialogShown = false;

        //  If privilege is not configured, then we need to try to configure
        //  it.

        if (TP.notValid(TP.PRIVILEGE_FLAGS.at(privilegedOp))) {
            //  Privilege not configured with TIBET. TP.alert() saying that
            //  we're going to try to configure the privilege and including
            //  the reasonMsg.
            TP.alert(
                TP.sc('This application would like to request the following privileges:', '\n\n',
                TP.PRIVILEGE_DESCRIPTIONS.at(privilegedOp), '\n\n',
                'because:', '\n\n',
                reasonMsg, '\n\n',
                'Therefore, you may see a dialog asking for permission to activate these privileges.\n\nNote that if you deny this permission and click the \'Remember this decision\' checkbox, you may have to manually edit your browser\'s configuration in the future to allow this application to be fully functional.'));
        } else {
            switch (TP.PRIVILEGE_FLAGS.at(privilegedOp)) {
                case    'ENABLE':

                    //  No 'pre-prompt' here, since this privilege was
                    //  previously configured with TIBET as 'ENABLE'.

                break;

                case    'DISABLE':

                    //  No 'pre-prompt' here, since this privilege was
                    //  previously configured with TIBET as 'DISABLE'.

                    TP.raise(this,
                            'TP.sig.PrivilegeViolation',
                            TP.sc('Unable to obtain privileges for: '),
                                    privilegedOp);

                    //  Exit here, having failed to obtain permission.
                    return false;

                case    'PROMPT':

                    //  Privilege was configured as 'PROMPT' with TIBET.
                    //  TP.alert() saying that we're going to try to
                    //  configure the privilege and including the reasonMsg.
                    TP.alert(
                        TP.sc('This application would like to request the following privileges:', '\n\n',
                        TP.PRIVILEGE_DESCRIPTIONS.at(privilegedOp), '\n\n',
                        'because:', '\n\n',
                        reasonMsg, '\n\n',
                        'Therefore, you may see a dialog asking for permission to activate these privileges.'));

                break;
            }
        }

        //  Snapshot the time
        startTime = new Date();

        //  Now, we'll try to actually obtain permissions
        try {
            if (TP.sys.cfg('log.privilege_requests')) {
                TP.ifTrace() ? TP.sys.logSecurity('Privilege request at ' +
                            'executePrivileged',
                            TP.DEBUG) : 0;
            }

            //  Try to get all permissions. This will throw an exception if
            //  the permission is or has been denied.
            netscape.security.PrivilegeManager.enablePrivilege(
            'UniversalBrowserRead UniversalBrowserWrite UniversalXPConnect');

            //  Snapshot the time... if more than threshold, then a dialog
            //  was shown to the user.
            endTime = new Date();
            if ((endTime - startTime) > dialogShownThreshold) {
                dialogShown = true;
            }

            permissionObtained = true;

            //  If the privilege status is already ENABLE, then skip all of
            //  the rest of this and don't abuse the user with dialog boxes
            if (TP.PRIVILEGE_FLAGS.at(privilegedOp) === 'ENABLE') {
                void(0);
            } else {
                //  We obtained permission, but is it 'PROMPT' or 'ENABLE'??

                //  If a dialog didn't show, then it was definitely 'ENABLE'
                if (!dialogShown) {
                    //  Set the privilege status to 'ENABLE'
                    TP.$setPrivilegeFlag(privilegedOp, 'ENABLE');
                } else {
                    //  Otherwise, we ask the user whether or not to show
                    //  any more TIBET-based prompts.

                    //  TP.confirm() asking whether, since we obtained the
                    //  privilege but we're not sure whether the user
                    //  checked the 'Remember this decision' dialog box,
                    //  TIBET should continue to prompt the user.

                    stopPrompting = TP.confirm(
                        TP.sc('You have approved enhanced permissions.', '\n\n',
                        'You may have also checked the \'Remember this decision\' checkbox. Would you like your TIBET-based application to also remember this decision?', '\n\n',
                        'If you did not check the \'Remember this decision\' checkbox, you may still want your TIBET-based application to remember this decision so that you will only see browser dialogs from now on.', '\n\n',
                        'Click \'OK\' for your TIBET-based application to remember this decision or \'Cancel\' to not have it remember this decision.')
                        );

                    if (stopPrompting) {
                        //  Set the privilege status to 'ENABLE'
                        TP.$setPrivilegeFlag(privilegedOp, 'ENABLE');
                    } else {
                        //  Set the privilege status to 'PROMPT'
                        TP.$setPrivilegeFlag(privilegedOp, 'PROMPT');
                    }
                }
            }
        } catch (e) {
            //  Snapshot the time... if more than threshold, then a dialog
            //  was shown to the user.
            endTime = new Date();
            if ((endTime - startTime) > dialogShownThreshold) {
                dialogShown = true;
            }

            //  Permission couldn't be obtained.

            //  If the privilege status wasn't 'DISABLE', it was probably
            //  either non-existent or set to 'PROMPT'.
            if (TP.PRIVILEGE_FLAGS.at(privilegedOp) !== 'DISABLE') {
                //  If a dialog box wasn't shown, that means that we're not
                //  running in an environment that has even shown the dialog
                //  box. This must mean that we're running in an environment
                //  that:
                //      a)  Was not launched from a 'file://' URL
                //              OR
                //      b)  Has 'codebase principal' support turned off.
                //              OR
                //      c)  Is not being vended as a 'signed script'.
                //              OR
                //      d)  Already showed the user the dialog box and the
                //          user denied permission and clicked 'Remember
                //          this decision'.
                if (!dialogShown) {
                    //  TP.alert() a message saying that since we couldn't
                    //  show the user a dialog, they'll have to contact
                    //  their system administrator to rectify the situation.
                    //  It will be registered with TIBET as being in a state
                    //  of 'DISABLE' below and this prompt will *NOT* be
                    //  shown again.
                    TP.alert(TP.sc('Permission was denied to this application to perform the operation.\n\nThis means that EITHER:\n\n1. You were not given the opportunity to give it permission to perform this operation.\n\nOR\n\n2.  You previously denied this application to perform this operation and clicked \'Remember this decision\'.\n\nContact your system administrator to rectify this situation.\n\nThis panel will NOT be shown again during this application session.'));
                } else {
                    //  TP.confirm() asking whether, since we didn't obtain
                    //  the privilege but we're not sure whether the user
                    //  checked the 'Remember this decision' dialog box',
                    //  TIBET should continue to prompt the user.

                    continuePrompting = TP.confirm(
                        TP.sc('Because you denied this application the following privileges:\n\n',
                        TP.PRIVILEGE_DESCRIPTIONS.at(privilegedOp), '\n\n',
                        'the consequences are that:', '\n\n',
                        failureMsg, '\n\n',
                        'You may attempt to perform this operation again, but you must grant this application permission to complete the operation by clicking \'Allow\' in the browser\'s permission request panel when that panel presents itself.', '\n\n',
                        'If you checked \'Remember this decision\' you will not be given a chance to grant permission again. Contact your system administrator to rectify this situation. Otherwise, you can click \'OK\' below to try again or \'Cancel\' to not try again. If you choose \'Cancel\', this panel will NOT be shown again during this application session.'));

                    if (continuePrompting) {
                        //  Set the privilege status to 'PROMPT'
                        TP.$setPrivilegeFlag(privilegedOp, 'PROMPT');

                        //  Go ahead and try again by just returning the
                        //  execution of this function again.
                        return TP.executePrivileged(privilegedOp,
                                                    reasonMsg,
                                                    failureMsg,
                                                    tryUnprivileged,
                                                    privilegedFunction);
                    }
                }

                //  Set the privilege status to 'PROMPT'
                TP.$setPrivilegeFlag(privilegedOp, 'DISABLE');
            }

            //  Go ahead and raise a TIBET exception.
            TP.raise(this,
                    'TP.sig.PrivilegeViolation',
                    TP.ec(e, TP.join('Unable to obtain privileges for: ',
                                    privilegedOp)));
        }

        //  Whew! We made it all the way down here. We must have permission
        //  to actually do the deed.
        if (permissionObtained) {
            //  If we obtained permission, then go ahead and run the
            //  privileged function
            privilegedFunction();

            return true;
        }

        return false;
    },
    'trident',
    function(privilegedOp, reasonMsg, failureMsg, tryUnprivileged, privilegedFunction) {
        /**
         * @name executePrivileged
         * @synopsis Execute a function that requires some sort of special
         *     browser privileges, like reading data or a page in another domain
         *     or writing to the file system.
         * @param {String} privilegedOp One of the 'privileged operation'
         *     constants defined at the global level, such as
         *     TP.ACCESS_XDOMAIN_XMLHTTP.
         * @param {String} reasonMsg Message text describing to the user why a
         *     particular privilege is required.
         * @param {String} failureMsg Message text describing to the user the
         *     implications of failing to provide a particular privilege.
         * @param {Boolean} tryUnprivileged Whether or not to attempt to execute
         *     the privileged function in an unprivileged manner first.
         * @param {Function} privilegedFunction A Function containing the code
         *     that requires a particular set of privileges.
         * @returns {Boolean} Whether or not the privileged Function succeeded
         *     in obtaining permission to execute.
         * @todo
         */

        var dialogShownThreshold,

            permissionObtained,
            dialogShown,

            startTime,
            endTime;

        //  The number of milliseconds after which we determine a dialog was
        //  shown to the user.
        dialogShownThreshold = 250;

        //  First, determine whether we even need to ask for permission for
        //  this privilege.

        //  If we should try an unprivileged execute, then go ahead and try
        //  it here. If it succeeds, we'll return true. Otherwise, we won't
        //  do anything in the catch block the exception. We'll try to
        //  obtain permission and try again.
        if (TP.isTrue(tryUnprivileged)) {
            try {
                privilegedFunction();

                return true;
            } catch (e) {
            }
        }

        //  Next, observe the TIBET flag as to whether to request permission
        //  for privileges.
        if (!TP.sys.shouldRequestPrivileges()) {
            TP.ifError() ?
                TP.error(
                    'TIBET not configured to request privileged code' +
                    ' execution',
                    TP.SECURITY_LOG) : 0;

            return false;
        }

        permissionObtained = false;
        dialogShown = false;

        //  If privilege is not configured, then we need to try to
        //  configure it.

        if (TP.notValid(TP.PRIVILEGE_FLAGS.at(privilegedOp))) {
            //  Privilege not configured with TIBET. TP.alert() saying that
            //  we're going to try to configure the privilege and including
            //  the reasonMsg.
            TP.alert(
                TP.sc('This application would like to request the following privileges:', '\n\n',
                TP.PRIVILEGE_DESCRIPTIONS.at(privilegedOp), '\n\n',
                'because:', '\n\n',
                reasonMsg, '\n\n',
                'Therefore, you may see a dialog asking for permission to activate these privileges.'));
        } else {
            switch (TP.PRIVILEGE_FLAGS.at(privilegedOp)) {
                case    'ENABLE':

                    //  No 'pre-prompt' here, since this privilege was
                    //  previously configured with TIBET as 'ENABLE'.

                break;

                case    'DISABLE':

                    //  No 'pre-prompt' here, since this privilege was
                    //  previously configured with TIBET as 'DISABLE'.

                    TP.raise(this,
                            'TP.sig.PrivilegeViolation',
                            TP.sc('Unable to obtain privileges for: '),
                                    privilegedOp);

                    //  Exit here, having failed to obtain permission.
                    return false;

                case    'PROMPT':

                    //  Privilege was configured as 'PROMPT' with TIBET.
                    //  TP.alert() saying that we're going to try to
                    //  configure the privilege and including the reasonMsg.
                    TP.alert(
                        TP.sc('This application would like to request the following privileges:', '\n\n',
                        TP.PRIVILEGE_DESCRIPTIONS.at(privilegedOp), '\n\n',
                        'because:', '\n\n',
                        reasonMsg, '\n\n',
                        'Therefore, you may see a dialog asking for permission to activate these privileges.'));

                break;
            }
        }

        //  Snapshot the time
        startTime = new Date();

        //  Now, we'll try to actually run the privileged function, which on
        //  IE will cause the browser to try to obtain permissions
        try {
            if (TP.sys.cfg('log.privilege_requests')) {
                TP.ifTrace() ? TP.sys.logSecurity('Privilege request at ' +
                            'executePrivileged',
                            TP.DEBUG) : 0;
            }

            privilegedFunction();


            //  Snapshot the time... if more than threshold, then a dialog
            //  was shown to the user.
            endTime = new Date();
            if ((endTime - startTime) > dialogShownThreshold) {
                dialogShown = true;
            }

            permissionObtained = true;

            //  We obtained permission, and on IE, that means that we can
            //  just set it to be ENABLE, since the browser won't ask again.

            //  Set the privilege status to 'ENABLE'
            TP.$setPrivilegeFlag(privilegedOp, 'ENABLE');
        } catch (e) {
            //  If its not a security error, it won't have these error
            //  messages.
            if (!/Automation server/.test(TP.str(e)) &&
                !/Access denied/.test(TP.str(e))) {
                //  Therefore, we throw the exception back up to the caller.
                //  This should cause an exit from this routine without a
                //  'return' statement.
                throw e;
            }

            //  Snapshot the time... if more than threshold, then a dialog
            //  was shown to the user.
            endTime = new Date();
            if ((endTime - startTime) > dialogShownThreshold) {
                dialogShown = true;
            }

            //  Permission couldn't be obtained.

            //  If the privilege status wasn't 'DISABLE', it was probably
            //  either non-existent or set to 'PROMPT'.
            if (TP.PRIVILEGE_FLAGS.at(privilegedOp) !== 'DISABLE') {
                //  If a dialog box wasn't shown, that means that we're not
                //  running in an environment that has even shown the dialog
                //  box. This must mean that we're running in an environment
                //  that the user has switched off the permission by setting
                //  it to Disable.
                if (!dialogShown) {
                    //  TP.alert() a message saying that since we couldn't
                    //  show the user a dialog, they'll have to contact
                    //  their system administrator to rectify the situation.
                    //  It will be registered with TIBET as being in a state
                    //  of 'DISABLE' below and this prompt will *NOT* be
                    //  shown again.
                    TP.alert(TP.sc('Permission was denied to this application to perform the operation.\n\nThis means that the permission to do so has been set to \'Disable\' in the Security Preferences panel.\n\nContact your system administrator to rectify this situation.\n\nThis panel will NOT be shown again during this application session.'));
                } else {
                    TP.alert(
                        TP.sc('Because you denied this application the following privileges:\n\n',
                        TP.PRIVILEGE_DESCRIPTIONS.at(privilegedOp), '\n\n',
                        'the consequences are that:', '\n\n',
                        failureMsg, '\n\n',
                        'You cannot attempt to perform this operation again.  You must quit this application, restart it and try again.', '\n\n'));
                }

                //  Set the privilege status to 'DISABLE'
                TP.$setPrivilegeFlag(privilegedOp, 'DISABLE');
            }

            //  Go ahead and raise a TIBET exception.
            TP.raise(this,
                    'TP.sig.PrivilegeViolation',
                    TP.ec(e, TP.join('Unable to obtain privileges for: ',
                                    privilegedOp)));
        }

        return permissionObtained;
    },
    'webkit',
    function(privilegedOp, reasonMsg, failureMsg, tryUnprivileged, privilegedFunction) {
        /**
         * @name executePrivileged
         * @synopsis Execute a function that requires some sort of special
         *     browser privileges, like reading data or a page in another domain
         *     or writing to the file system.
         * @param {String} privilegedOp One of the 'privileged operation'
         *     constants defined at the global level, such as
         *     TP.ACCESS_XDOMAIN_XMLHTTP.
         * @param {String} reasonMsg Message text describing to the user why a
         *     particular privilege is required.
         * @param {String} failureMsg Message text describing to the user the
         *     implications of failing to provide a particular privilege.
         * @param {Boolean} tryUnprivileged Whether or not to attempt to execute
         *     the privileged function in an unprivileged manner first.
         * @param {Function} privilegedFunction A Function containing the code
         *     that requires a particular set of privileges.
         * @returns {Boolean} Whether or not the privileged Function succeeded
         *     in obtaining permission to execute.
         * @todo
         */

        //  On Webkit, this is a no-op.

        return false;
    }
));

//  ------------------------------------------------------------------------
//  COMMON UTILITY ROUTINES
//  ------------------------------------------------------------------------

TP.definePrimitive('errorAsString',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(errorObj) {

        /**
         * @name errorAsString
         * @synopsis Returns a String representation of the supplied Error
         *     object.
         * @param {Error} errorObj The Error object to obtain the String
         *     representation of.
         * @returns {String} A String representation of the supplied Error
         *     object.
         */

        var str,
            file;

        if (TP.notEmpty(str = errorObj.message)) {
            //  In addition to the standard property of 'message', Gecko
            //  also supports 'fileName' and 'lineNumber', or filename and
            //  lineNumber, or...well, you get the idea...it's Gecko
            //  quality.

            if (TP.notEmpty(errorObj.fileName)) {
                file = true;
                str += ' &#171; ' + errorObj.fileName;
            } else if (TP.notEmpty(errorObj.filename)) {
                str += ' &#171; ' + errorObj.filename;
            }

            if (TP.notEmpty(errorObj.lineNumber)) {
                str += '#line(' + errorObj.lineNumber + ')';
            }

            if (file) {
                str += ' &#187;';
            }
        } else {
            //  If there's no real message, just use '[object Error]'.
            return '[object ' + (errorObj.name || 'Error') + ']';
        }

        return str;
    },
    'trident',
    function(errorObj) {

        /**
         * @name errorAsString
         * @synopsis Returns a String representation of the supplied Error
         *     object.
         * @param {Error} errorObj The Error object to obtain the String
         *     representation of.
         * @returns {String} A String representation of the supplied Error
         *     object.
         */

        var str;

        if (TP.notEmpty(str = errorObj.message)) {
            //  In addition to the standard property of 'message', IE also
            //  supports 'number' (meaning an Error number). It also
            //  supports 'description', but that's the same as 'message',
            //  so we ignore it here.

            if (TP.notEmpty(errorObj.number)) {
                str += ' :: number: ' + errorObj.number;
            }
        } else {
            //  If there's no real message, just use '[object Error]'.
            return '[object ' + (errorObj.name || 'Error') + ']';
        }

        return str;
    },
    'webkit',
    function(errorObj) {

        /**
         * @name errorAsString
         * @synopsis Returns a String representation of the supplied Error
         *     object.
         * @param {Error} errorObj The Error object to obtain the String
         *     representation of.
         * @returns {String} A String representation of the supplied Error
         *     object.
         */

        var str,
            file,
            start;

        if (TP.notEmpty(str = errorObj.message)) {
            //  In addition to the standard property of 'message', Webkit
            //  also supports 'sourceURL' and 'line' (which we describe as
            //  'file' and 'line' to be consistent with Gecko)

            if (TP.notEmpty(errorObj.sourceURL)) {
                file = true;
                str += ' &#171; ' + errorObj.sourceURL;
            }

            if (TP.notEmpty(errorObj.line)) {
                str += '#line(' + errorObj.line + ')';
            }

            //  Webkit also supports line 'begin' and 'end' offsets
            if (TP.notEmpty(errorObj.expressionBeginOffset)) {
                start = true;
                str += '[' + errorObj.expressionBeginOffset + ':';
            }

            if (TP.notEmpty(errorObj.expressionEndOffset)) {
                str += errorObj.expressionEndOffset;
            }

            if (start) {
                str += ']';
            }

            if (file) {
                str += ' &#187;';
            }

        } else {
            //  If there's no real message, just use '[object Error]'.
            return '[object ' + (errorObj.name || 'Error') + ']';
        }

        return str;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('getStackInfo',
TP.hc(
    'test',
    TP.sys.getBrowser,
    'firefox',
    function(errorObj) {

        /**
         * @name getStackInfo
         * @synopsis Extracts stack information from the supplied Error object.
         * @description This method returns an Array of function names, file
         *     names and line numbers from stack information provided by the
         *     supplied Error object:
         *          [function name, file name, line number]
         * @param {Error} errorObj The Error object to obtain the stack
         *     information from.
         * @returns {Array} An Array of Strings containing stack information.
         */

        var entries,
            str,
            match,
            results,
            i;

        entries = null;

        if (TP.notEmpty(str = errorObj.stack)) {
            entries = str.
                replace(/(?:\n@:0)?\s+$/m, '').
                replace(/^(?:\((\S*)\))?@/gm, '{anonymous}($1)@').
                split('\n');
        }

        if (TP.notEmpty(entries)) {
            results = TP.ac();
            for (i = 0; i < entries.getSize(); i++) {
                //  Iterate over each 'entry' and split out the:
                //      function name
                //      file name where the function is found
                //      line number in the file where the function is found
                match = TP.regex.CALL_STACK_ENTRY_SPLITTER.exec(entries.at(i));
                if (TP.canInvoke(match, 'slice')) {
                    results.push(match.slice(1));
                }
            }
        }

        return results;
    },
    'ie',
    function(errorObj) {

        /**
         * @name getStackInfo
         * @synopsis Extracts stack information from the supplied Error object.
         * @description This method returns an Array of function names, file
         *     names and line numbers from stack information provided by the
         *     supplied Error object:
         *          [function name, file name, line number]
         * @param {Error} errorObj The Error object to obtain the stack
         *     information from.
         * @returns {Array} An Array of Strings containing stack information.
         */

        var entries,
            str,
            match,
            results,
            i;

        entries = null;

        if (TP.notEmpty(str = errorObj.stack)) {
            entries = str.
                replace(/^\s*at\s+(.*)$/gm, '$1').
                replace(/^Anonymous function\s+/gm, '{anonymous}() ').
                replace(/^(.+)\s+\((.+)\)$/gm, '$1@$2').
                split('\n').
                slice(1);
        }

        if (TP.notEmpty(entries)) {
            results = TP.ac();
            for (i = 0; i < entries.getSize(); i++) {
                //  Iterate over each 'entry' and split out the:
                //      function name
                //      file name where the function is found
                //      line number in the file where the function is found
                match = TP.regex.CALL_STACK_ENTRY_SPLITTER.exec(entries.at(i));
                if (TP.canInvoke(match, 'slice')) {
                    results.push(match.slice(1));
                }
            }
        }

        return results;
    },
    'safari',
    function(errorObj) {

        /**
         * @name getStackInfo
         * @synopsis Extracts stack information from the supplied Error object.
         * @description This method returns an Array of function names, file
         *     names and line numbers from stack information provided by the
         *     supplied Error object:
         *          [function name, file name, line number]
         * @param {Error} errorObj The Error object to obtain the stack
         *     information from.
         * @returns {Array} An Array of Strings containing stack information.
         */

        var entries,
            str,
            results,
            match,
            i;

        entries = null;

        if (TP.notEmpty(str = errorObj.stack)) {
            entries = str.
                replace(/\[native code\]\n/m, '').
                replace(/^(?=\w+Error\:).*$\n/m, '').
                replace(/^@/gm, '{anonymous}()@').
                split('\n');
        }

        if (TP.notEmpty(entries)) {
            results = TP.ac();
            for (i = 0; i < entries.getSize(); i++) {
                //  Iterate over each 'entry' and split out the:
                //      function name
                //      file name where the function is found
                //      line number in the file where the function is found
                match = TP.regex.CALL_STACK_ENTRY_SPLITTER.exec(entries.at(i));
                if (TP.canInvoke(match, 'slice')) {
                    results.push(match.slice(1));
                }
            }
        }

        return results;
    },
    'chrome',
    function(errorObj) {

        /**
         * @name getStackInfo
         * @synopsis Extracts stack information from the supplied Error object.
         * @description This method returns an Array of function names, file
         *     names and line numbers from stack information provided by the
         *     supplied Error object:
         *          [function name, file name, line number, character number]
         * @param {Error} errorObj The Error object to obtain the stack
         *     information from.
         * @returns {Array} An Array of Strings containing stack information.
         */

        var entries,
            str,

            results,
            i,

            entry;

        entries = null;

        if (TP.notEmpty(str = errorObj.stack)) {
            entries =
                (str + '\n').
                replace(/^[\s\S]+?\s+at\s+/, ' at ').   //  remove message
                replace(/^\s+(at eval )?at\s+/gm, '').  //  remove 'at' and
                                                        //  indentation
                replace(/^([^\(]+?)([\n$])/gm, '{anonymous}() ($1)$2').
                replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm,
                        '{anonymous}() ($1)').
                replace(/^(.+) \((.+)\)$/gm, '$1@$2').
                split('\n').
                slice(0, -1);
        }

        if (TP.notEmpty(entries)) {
            results = TP.ac();
            for (i = 0; i < entries.getSize(); i++) {
                //  Iterate over each 'entry' and split out the:
                //      function name
                //      file name where the function is found
                //      line number in the file where the function is found
                //      character number where the error occurred
                if (TP.notValid(entry = TP.regex.CALL_STACK_ENTRY_SPLITTER.exec(
                                                entries.at(i)))) {
                    results.push(TP.ac(entries.at(i)));
                    continue;
                }

                entry = entry.slice(1);

                //  Because of the RegExp used, the 'character number' entry
                //  will have a colon (':') prepended to it (if it exists).
                //  Strip that.
                if (TP.notEmpty(entry.at(3))) {
                    entry.atPut(3, entry.at(3).strip(/:/));
                }

                //  Push the entry
                results.push(entry);
            }
        }

        return results;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('$setPrivilegeFlag',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(setting) {

        /**
         * @name $setPrivilegeFlag
         * @synopsis Sets the privilege flag of the supplied privileged
         *     operation to the supplied setting.
         */

        //  On Mozilla, we ask for all permissions, so we set all privilege
        //  flags to the same settings.

        TP.PRIVILEGE_FLAGS.atPut(TP.SHOW_ABOUT, setting);

        TP.PRIVILEGE_FLAGS.atPut(TP.READ_HISTORY, setting);

        //  Reading and writing preferences actually requires capabilities
        //  that we don't ask for.
        //TP.PRIVILEGE_FLAGS.atPut(TP.READ_PREFERENCE, setting);
        //TP.PRIVILEGE_FLAGS.atPut(TP.WRITE_PREFERENCE, setting);

        TP.PRIVILEGE_FLAGS.atPut(TP.MANIPULATE_WINDOW, setting);
        TP.PRIVILEGE_FLAGS.atPut(TP.READ_EXECUTION_STACK, setting);
        TP.PRIVILEGE_FLAGS.atPut(TP.ACCESS_XDOMAIN_FRAME, setting);
        TP.PRIVILEGE_FLAGS.atPut(TP.ACCESS_DOM_INSPECT, setting);

        TP.PRIVILEGE_FLAGS.atPut(TP.ACCESS_XDOMAIN_XMLHTTP, setting);
        TP.PRIVILEGE_FLAGS.atPut(TP.HOST_XSLT_EXEC, setting);

        TP.PRIVILEGE_FLAGS.atPut(TP.HOST_FILE_DELETE, setting);
        TP.PRIVILEGE_FLAGS.atPut(TP.HOST_FILE_SAVE, setting);
        TP.PRIVILEGE_FLAGS.atPut(TP.HOST_FILE_ACCESS, setting);
        TP.PRIVILEGE_FLAGS.atPut(TP.HOST_CMD_EXEC, setting);

        return;
    },
    'trident',
    function(setting) {

        /**
         * @name $setPrivilegeFlag
         * @synopsis Sets the privilege flag of the supplied privileged
         *     operation to the supplied setting.
         */

        TP.PRIVILEGE_FLAGS.atPut(TP.HOST_FILE_DELETE, setting);
        TP.PRIVILEGE_FLAGS.atPut(TP.HOST_FILE_SAVE, setting);
        TP.PRIVILEGE_FLAGS.atPut(TP.HOST_FILE_ACCESS, setting);
        TP.PRIVILEGE_FLAGS.atPut(TP.HOST_CMD_EXEC, setting);
    },
    'webkit',
    function() {

        /**
         * @name $setPrivilegeFlag
         * @synopsis Sets the privilege flag of the supplied privileged
         *     operation to the supplied setting.
         */

        //  On Webkit, this is a no-op.

        return;
    }
));

//  ------------------------------------------------------------------------
//  COMMON UTILITY ROUTINES
//  ------------------------------------------------------------------------

TP.definePrimitive('$nodeToString',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function() {
        //  This is a no-op for Gecko.
    },
    'trident',
    function(aNode) {

        /**
         * @name $nodeToString
         * @synopsis Returns a 'representational' String of the supplied Node.
         * @description Because IE does such a poor job of printing a reasonable
         *     representation of Nodes (they aren't even JS objects that one can
         *     send toString() to), we take in Nodes here and produce the same
         *     String that Mozilla produces.
         * @param {Node} aNode The Node to produce a representational String
         *     for.
         * @returns {String} The representational String for the supplied Node.
         * @raise TP.sig.InvalidNode Raised when an invalid Node has been
         *     supplied to the method.
         * @todo
         */

        var str,
            domName;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode');
        }

        //  NB: This test is 'special-cased' as regular HTML documents test
        //  as 'true' for the TP.isNode() test and we'll get a 'less
        //  correct' String representation.
        if (TP.isHTMLDocument(aNode)) {
            return '[object HTMLDocument]';
        }

        str = '[object ';

        switch (aNode.nodeType) {
            case    Node.ELEMENT_NODE:

                    //  If its an element, try to see if its an HTML element
                    //  based on its tag name.
                    if (TP.isString(domName = TP.HTML_DOM_NAMES.at(
                            TP.elementGetLocalName(aNode).toLowerCase()))) {
                        str += domName;
                    } else {
                        str += 'Element';
                    }

                    break;

            case    Node.ATTRIBUTE_NODE:

                    str += 'Attr';
                    break;

            case    Node.DOCUMENT_NODE:

                    str += 'XMLDocument';
                    break;

            case    Node.TEXT_NODE:

                    str += 'Text';
                    break;

            case    Node.CDATA_SECTION_NODE:

                    str += 'CDATASection';
                    break;

            case    Node.ENTITY_REFERENCE_NODE:

                    str += 'EntityReference';
                    break;

            case    Node.ENTITY_NODE:

                    str += 'Entity';
                    break;

            case    Node.PROCESSING_INSTRUCTION_NODE:

                    str += 'ProcessingInstruction';
                    break;

            case    Node.COMMENT_NODE:

                    str += 'Comment';
                    break;

            case    Node.DOCUMENT_TYPE_NODE:

                    str += 'DocumentType';
                    break;

            case    Node.DOCUMENT_FRAGMENT_NODE:

                    str += 'DocumentFragment';
                    break;

            case    Node.NOTATION_NODE:

                    str += 'Notation';
                    break;

            default:

                    str += 'Node';
                    break;
        }

        str += ']';

        return str;
    },
    'webkit',
    function(aNode) {

        /**
         * @name $nodeToString
         * @synopsis Returns a 'representational' String of the supplied Node.
         * @description Because Webkit does such a poor job of printing a
         *     reasonable representation of Nodes, we take in Nodes here and
         *     produce the same String that Gecko produces.
         * @param {Node} aNode The Node to produce a representational String
         *     for.
         * @returns {String} The representational String for the supplied Node.
         * @raise TP.sig.InvalidNode Raised when an invalid Node has been
         *     supplied to the method.
         * @todo
         */

        var str,
            domName;

        if (!TP.isNode(aNode)) {
            return TP.raise(this, 'TP.sig.InvalidNode');
        }

        //  NB: This test is 'special-cased' as regular HTML documents test
        //  as 'true' for the TP.isNode() test and we'll get a 'less
        //  correct' String representation.
        if (TP.isHTMLDocument(aNode)) {
            return '[object HTMLDocument]';
        }

        str = '[object ';

        switch (aNode.nodeType) {
            case    Node.ELEMENT_NODE:

                    //  If its an element, try to see if its an HTML element
                    //  based on its tag name.
                    if (TP.isString(domName = TP.HTML_DOM_NAMES.at(
                            TP.elementGetLocalName(aNode).toLowerCase()))) {
                        str += domName;
                    } else {
                        str += 'Element';
                    }

                    break;

            case    Node.ATTRIBUTE_NODE:

                    str += 'Attr';
                    break;

            case    Node.DOCUMENT_NODE:

                    str += 'XMLDocument';
                    break;

            case    Node.TEXT_NODE:

                    str += 'Text';
                    break;

            case    Node.CDATA_SECTION_NODE:

                    str += 'CDATASection';
                    break;

            case    Node.ENTITY_REFERENCE_NODE:

                    str += 'EntityReference';
                    break;

            case    Node.ENTITY_NODE:

                    str += 'Entity';
                    break;

            case    Node.PROCESSING_INSTRUCTION_NODE:

                    str += 'ProcessingInstruction';
                    break;

            case    Node.COMMENT_NODE:

                    str += 'Comment';
                    break;

            case    Node.DOCUMENT_TYPE_NODE:

                    str += 'DocumentType';
                    break;

            case    Node.DOCUMENT_FRAGMENT_NODE:

                    str += 'DocumentFragment';
                    break;

            case    Node.NOTATION_NODE:

                    str += 'Notation';
                    break;

            default:

                    str += 'Node';
                    break;
        }

        str += ']';

        return str;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('objectToString',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(anObject) {

        /**
         * @name objectToString
         * @synopsis Returns a 'representational String' of anObject.
         * @description This function is mostly used when the object in question
         *     cannot respond to toString(). In IE, this happens quite often
         *     with DOM / XML objects because they're not real JavaScript
         *     objects, but ActiveX objects :-(. For most browsers this function
         *     rarely has to simulate a string since virtually everything is a
         *     valid JS Object instance.
         * @param {Object} anObject The object to return the representational
         *     String of.
         * @example Get the string representation for the object:
         *     <code>
         *          TP.objectToString('hi');
         *          <samp>hi</samp>
         *          TP.objectToString(42);
         *          <samp>42</samp>
         *          TP.objectToString(true);
         *          <samp>true</samp>
         *          TP.objectToString(TP.ac(1,2,3));
         *          <samp>1, 2, 3</samp>
         *          TP.objectToString(TP.dc());
         *          <samp></samp>
         *          TP.objectToString(TP.hc('lname', 'Smith'));
         *          <samp>TP.lang.Hash_11195e8e7fdcb31af18d399f</samp>
         *          TP.objectToString(window);
         *          <samp>[object DOMWindow]</samp>
         *          TP.objectToString(window.document);
         *          <samp>[object HTMLDocument]</samp>
         *          TP.objectToString(document.documentElement);
         *          <samp>[object HTMLHtmlElement]</samp>
         *          TP.objectToString(TP.documentGetBody(document).attributes);
         *          <samp>[object NamedNodeMap]</samp>
         *          TP.objectToString(TP.documentGetBody(document).childNodes);
         *          <samp>[object NodeList]</samp>
         *          TP.objectToString(TP.lang.Object.construct());
         *          <samp>TP.lang.Object_11195ea9ded7b7e55b8b5207</samp>
         *     </code>
         * @returns {String} The 'representational String' of the Object.
         * @todo
         */

        var str,
            match;

        if (TP.notDefined(anObject)) {
            return 'undefined';
        }

        if (TP.isNull(anObject)) {
            return 'null';
        }

        //  XMLHttpRequest can have permission issues, so check early
        if (TP.isXHR(anObject)) {
            return '[object XMLHttpRequest]';
        }

        //  error objects are a little special, can't always work with them
        //  as instrumented objects so we'll do it manually
        if (TP.isError(anObject)) {
            return '[object ' + (anObject.name || 'Error') + ']';
        }

        //  anchors are special, they don't output [object HTMLAnchorElement] as
        //  they should, they try to output their href
        if (TP.isElement(anObject) && anObject.tagName.toUpperCase() === 'A') {
            return '[object HTMLAnchorElement]';
        }

        if (TP.isWindow(anObject)) {
            return '[object DOMWindow]';
        }

        if (TP.isNodeList(anObject)) {
            return '[object NodeList]';
        }

        if (TP.isNamedNodeMap(anObject)) {
            return '[object NamedNodeMap]';
        }

        if (TP.isStyleDeclaration(anObject)) {
            return '[object CSSStyleDeclaration]';
        }

        if (TP.canInvoke(anObject, 'toString')) {
            str = anObject.toString();
            if (TP.regex.INSTANCE_OID.test(str)) {
                str = '[object ' + TP.tname(anObject) + ']';
            } else if (TP.regex.NATIVE_CODE.test(str)) {

                //  NB: Do *not* rewrite as "TP.name('anObject')" or this call
                //  will endlessly recurse.

                if ((match = str.match(/function (\w+)/))) {
                    str = match[1];
                }
            }

            return str;
        }

        //  Sometimes isNaN() will throw if it can't convert to a Number
        //  NB: DO NOT move this line above the 'toString()' line. NaN is a
        //  weird value and won't test properly.
        try {
            if (isNaN(anObject)) {
                return 'NaN';
            }
        } catch (e) {
        }

        //  if all else fails punt
        return '[object Object]';
    },
    'trident',
    function(anObject) {

        /**
         * @name objectToString
         * @synopsis Returns a 'representational string' of anObject that is
         *     consistent in format to the builtin toString method which, for
         *     some reason known only to the implementers of IE, doesn't
         *     actually work on all objects.
         * @description This function is mostly used when the object in question
         *     cannot respond to toString(). In IE, this happens in particular
         *     with DOM / XML objects because they're not real JS objects, but
         *     ActiveX objects :-(.
         * @param {Object} anObject The object to return the representational
         *     String of.
         * @example Get the string representation for the object:
         *     <code>
         *          TP.objectToString('hi');
         *          <samp>hi</samp>
         *          TP.objectToString(42);
         *          <samp>42</samp>
         *          TP.objectToString(true);
         *          <samp>true</samp>
         *          TP.objectToString(TP.ac(1,2,3));
         *          <samp>1,2,3</samp>
         *          TP.objectToString(TP.dc());
         *          <samp>Tue Mar 27 2007 18:17:27 GMT-0600 (MDT)</samp>
         *          TP.objectToString(TP.hc('lname', 'Smith'));
         *          <samp>TP.lang.Hash_11195e8e7fdcb31af18d399f</samp>
         *          TP.objectToString(window);
         *          <samp>[object DOMWindow]</samp>
         *          TP.objectToString(window.document);
         *          <samp>[object HTMLDocument]</samp>
         *          TP.objectToString(document.documentElement);
         *          <samp>[object HTMLHtmlElement]</samp>
         *          TP.objectToString(TP.documentGetBody(document).attributes);
         *          <samp>[object NamedNodeMap]</samp>
         *          TP.objectToString(TP.documentGetBody(document).childNodes);
         *          <samp>[object NodeList]</samp>
         *          TP.objectToString(TP.lang.Object.construct());
         *          <samp>TP.lang.Object_11195ea9ded7b7e55b8b5207</samp>
         *     </code>
         * @returns {String} The 'representational String' of the Object.
         * @todo
         */

        var str,
            match;

        if (TP.isNull(anObject)) {
            return 'null';
        }

        if (TP.notDefined(anObject)) {
            return 'undefined';
        }

        //  XMLHttpRequest can have permission issues, so check early
        if (TP.isXHR(anObject)) {
            return '[object XMLHttpRequest]';
        }

        //  NOTE that we test for documents before we move on to general nodes
        if (TP.isHTMLDocument(anObject)) {
            return '[object HTMLDocument]';
        }

        if (TP.isXMLDocument(anObject)) {
            return '[object XMLDocument]';
        }

        //  native nodes are the next-most likely object being passed to this
        //  routine, so we'll try to build up a proper string here
        if (TP.isNode(anObject)) {
            return TP.$nodeToString(anObject);
        }

        //  error objects are a little special, can't always work with them as
        //  instrumented objects so we'll do it manually
        if (TP.isError(anObject)) {
            return '[object ' + (anObject.name || 'Error') + ']';
        }

        //  anchors are special, they don't output [object HTMLAnchorElement]
        //  as they should, they try to output their href
        if (TP.isElement(anObject) && anObject.tagName.toUpperCase() === 'A') {
            return '[object HTMLAnchorElement]';
        }

        if (TP.isWindow(anObject)) {
            return '[object DOMWindow]';
        }

        if (TP.isNodeList(anObject)) {
            return '[object NodeList]';
        }

        if (TP.isNamedNodeMap(anObject)) {
            return '[object NamedNodeMap]';
        }

        if (TP.isStyleDeclaration(anObject)) {
            return '[object CSSStyleDeclaration]';
        }

        if (TP.canInvoke(anObject, 'toString')) {
            str = anObject.toString();
            if (TP.regex.INSTANCE_OID.test(str)) {
                str = '[object ' + TP.tname(anObject) + ']';
            } else if (TP.regex.NATIVE_CODE.test(str)) {

                //  NB: Do *not* rewrite as "TP.name('anObject')" or this call
                //  will endlessly recurse.

                if ((match = str.match(/function (\w+)/))) {
                    str = match[1];
                }
            }

            return str;
        }

        //  Sometimes isNaN() will throw if it can't convert to a Number
        //  NB: DO NOT move this line above the 'toString()' line. NaN is a
        //  weird value and won't test properly.
        try {
            if (isNaN(anObject)) {
                return 'NaN';
            }
        } catch (e) {
        }

        //  if all else fails punt
        return '[object Object]';
    },
    'webkit',
    function(anObject) {

        /**
         * @name objectToString
         * @synopsis Returns a 'representational String' of anObject.
         * @description This function is mostly used when the object in question
         *     cannot respond to toString(). In IE, this happens quite often
         *     with DOM / XML objects because they're not real JavaScript
         *     objects, but ActiveX objects :-(. For Webkit based browsers this
         *     function rarely has to simulate a string since virtually
         *     everything is a valid JS Object instance.
         * @param {Object} anObject The object to return the representational
         *     String of.
         * @example Get the string representation for the object:
         *     <code>
         *          TP.objectToString('hi');
         *          <samp>hi</samp>
         *          TP.objectToString(42);
         *          <samp>42</samp>
         *          TP.objectToString(true);
         *          <samp>true</samp>
         *          TP.objectToString(TP.ac(1,2,3));
         *          <samp>1,2,3</samp>
         *          TP.objectToString(TP.dc());
         *          <samp>Tue Mar 27 2007 18:17:27 GMT-0600 (MDT)</samp>
         *          TP.objectToString(TP.hc('lname', 'Smith'));
         *          <samp>TP.lang.Hash_11195e8e7fdcb31af18d399f</samp>
         *          TP.objectToString(window);
         *          <samp>[object DOMWindow]</samp>
         *          TP.objectToString(window.document);
         *          <samp>[object HTMLDocument]</samp>
         *          TP.objectToString(document.documentElement);
         *          <samp>[object HTMLHtmlElement]</samp>
         *          TP.objectToString(TP.documentGetBody(document).attributes);
         *          <samp>[object NamedNodeMap]</samp>
         *          TP.objectToString(TP.documentGetBody(document).childNodes);
         *          <samp>[object NodeList]</samp>
         *          TP.objectToString(TP.lang.Object.construct());
         *          <samp>TP.lang.Object_11195ea9ded7b7e55b8b5207</samp>
         *     </code>
         * @returns {String} The 'representational String' of the Object.
         * @todo
         */

        var str,
            match;

        if (TP.isNull(anObject)) {
            return 'null';
        }

        if (TP.notDefined(anObject)) {
            return 'undefined';
        }

        //  XMLHttpRequest can have permission issues, so check early
        if (TP.isXHR(anObject)) {
            return '[object XMLHttpRequest]';
        }

        //  NOTE that we test for documents before we move on to general
        //  nodes
        if (TP.isHTMLDocument(anObject)) {
            return '[object HTMLDocument]';
        }

        if (TP.isXMLDocument(anObject)) {
            return '[object XMLDocument]';
        }

        //  native nodes are the next-most likely object being passed to
        //  this routine, so we'll try to build up a proper string here
        if (TP.isNode(anObject)) {
            return TP.$nodeToString(anObject);
        }

        //  error objects are a little special, can't always work with them
        //  as instrumented objects so we'll do it manually
        if (TP.isError(anObject)) {
            return '[object ' + (anObject.name || 'Error') + ']';
        }

        //  anchors are special, they don't output
        //  [object HTMLAnchorElement] as they should, they try to output
        //  their href
        if (TP.isElement(anObject) && anObject.tagName.toUpperCase() === 'A') {
            return '[object HTMLAnchorElement]';
        }

        if (TP.isWindow(anObject)) {
            return '[object DOMWindow]';
        }

        if (TP.isNodeList(anObject)) {
            return '[object NodeList]';
        }

        if (TP.isNamedNodeMap(anObject)) {
            return '[object NamedNodeMap]';
        }

        if (TP.isStyleDeclaration(anObject)) {
            return '[object CSSStyleDeclaration]';
        }

        if (TP.canInvoke(anObject, 'toString')) {
            str = anObject.toString();
            if (TP.regex.INSTANCE_OID.test(str)) {
                str = '[object ' + TP.tname(anObject) + ']';
            } else if (TP.regex.NATIVE_CODE.test(str)) {

                //  NB: Do *not* rewrite as "TP.name('anObject')" or this call
                //  will endlessly recurse.

                if ((match = str.match(/function (\w+)/))) {
                    str = match[1];
                }
            }

            return str;
        }

        //  Sometimes isNaN() will throw if it can't convert to a Number
        //  NB: DO NOT move this line above the 'toString()' line. NaN is a
        //  weird value and won't test properly.
        try {
            if (isNaN(anObject)) {
                return 'NaN';
            }
        } catch (e) {
        }

        //  if all else fails punt
        return '[object Object]';
    }
));

//  ------------------------------------------------------------------------

//  NOTE that this won't be bound...but it doesn't reference 'this'
TP.definePrimitive('tostr', TP.objectToString);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
