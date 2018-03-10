//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.core.Browser}
 * @summary A type containing common data and functions for the browser.
 * @description TP.core.Browser is responsible for containing browser-specific
 *     features such as event registration and dispatch functions.
 *
 *     This type is also registered under the global 'browser' to make it
 *     symmetric with the 'window' and 'document' globals with which it is
 *     associated.
 *
 *     Note that this type loads in sections, the first section provides the
 *     common functionality and base methods, the second section is loaded via
 *     the boot system's conditional loading model so that browser-specific
 *     implementations of certain methods are loaded, completing the type's
 *     definition.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Browser');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  note dependency on TP.ietf.mime object here
TP.core.Browser.Type.defineConstant('DEFAULT_MIME_TYPE', TP.ietf.mime.HTML);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.Browser.Type.defineAttribute('nativeNamespacesInstalled', false);
TP.core.Browser.Type.defineAttribute('nonNativeNamespacesInstalled', false);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Browser.Type.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    return '[' + TP.tname(this) + ' :: ' + 'browser' + ']';
});

//  ------------------------------------------------------------------------

TP.core.Browser.Type.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return 'browser';
});

//  ------------------------------------------------------------------------

TP.core.Browser.Type.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return 'browser';
});

//  ------------------------------------------------------------------------

TP.core.Browser.Type.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the string representation of the receiver. The
     *     TP.core.Browser type is special here, it returns the string
     *     'browser', which is intended to mirror 'window', 'document', and
     *     similar terms.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.core.Browser's String representation. The default is true.
     * @returns {String} The browser string.
     */

    return 'browser';
});

//  ------------------------------------------------------------------------

TP.core.Browser.Type.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return 'browser';
});

//  ========================================================================
//  Browser Signals
//  ========================================================================

/*
Signaling support types related to browser/window/document operations.
*/

//  ------------------------------------------------------------------------
//  TP.sig.DocumentSignal
//  ------------------------------------------------------------------------

/**
 * @type {TP.sig.DocumentSignal}
 * @summary The supertype of both TP.sig.DocumentLoaded and
 *     TP.sig.DocumentUnloaded which can provide the window's global ID that the
 *     document is being loaded into or unloaded from.
 */

//  ------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('DocumentSignal');

TP.sig.DocumentSignal.Type.isControllerSignal(true);
TP.sig.DocumentSignal.isControllerRoot(true);

//  ------------------------------------------------------------------------

TP.sig.DocumentSignal.Inst.defineMethod('getWindowName',
function() {

    /**
     * @method getWindowName
     * @summary Returns the global ID of the window that the page was loaded
     *     into or unloaded out of.
     * @returns {String} The global ID of the Window.
     */

    return this.getPayload();
});

//  ------------------------------------------------------------------------
//  TP.sig.DocumentUnloaded
//  ------------------------------------------------------------------------

TP.sig.DocumentSignal.defineSubtype('DocumentUnloaded');

//  ------------------------------------------------------------------------
//  TP.sig.DocumentLoaded
//  ------------------------------------------------------------------------

TP.sig.DocumentSignal.defineSubtype('DocumentLoaded');

//  ------------------------------------------------------------------------
//  TP.sig.DocumentVisibility
//  ------------------------------------------------------------------------

TP.sig.DocumentSignal.defineSubtype('DocumentVisibility');
TP.sig.DocumentVisibility.defineSubtype('DocumentVisible');
TP.sig.DocumentVisibility.defineSubtype('DocumentInvisible');

//  ------------------------------------------------------------------------

/**
 * @type {TP.sig.WindowSignal}
 * @summary A window-related signal type which provides the supertype for
 *     TP.sig.WindowClosed and other window events.
 */

//  ------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('WindowSignal');

//  ------------------------------------------------------------------------

TP.sig.WindowSignal.Inst.defineMethod('getWindowName',
function() {

    /**
     * @method getWindowName
     * @summary Returns the global ID of the window involved in activity.
     * @returns {String} The global ID of the Window.
     */

    return this.getPayload();
});

//  ------------------------------------------------------------------------
//  TP.sig.WindowClosed
//  ------------------------------------------------------------------------

TP.sig.WindowSignal.defineSubtype('WindowClosed');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
