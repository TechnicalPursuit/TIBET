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
 * @subject Common extensions to TP.core.Browser.
 */

//  ------------------------------------------------------------------------

TP.core.Browser.Type.defineMethod('installNativeNamespaces',
function() {

    /**
     * @method installNativeNamespaces
     * @summary Installs namespace support for tag processing for namespaces
     *     that are natively supported on this browser.
     * @returns {TP.meta.core.Browser} The receiver.
     */

    //  We only install the native namespaces if they haven't been installed
    //  yet and then we flip the flag so that they don't get installed
    //  again.
    if (!this.get('nativeNamespacesInstalled')) {
        TP.w3.Xmlns.registerNSInfo(TP.w3.Xmlns.XML,
                                        TP.hc('native', true));
        TP.w3.Xmlns.registerNSInfo(TP.w3.Xmlns.XHTML,
                                        TP.hc('native', true));
        TP.w3.Xmlns.registerNSInfo(TP.w3.Xmlns.XSLT,
                                        TP.hc('native', true));
        TP.w3.Xmlns.registerNSInfo(TP.w3.Xmlns.TIBET,
                                        TP.hc('native', true));
        TP.w3.Xmlns.registerNSInfo(TP.w3.Xmlns.SVG,
                                        TP.hc('native', true));

        this.set('nativeNamespacesInstalled', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Browser.Type.defineMethod('installNonNativeNamespaces',
function() {

    /**
     * @method installNonNativeNamespaces
     * @summary Installs namespace support for tag processing for namespaces
     *     that are not natively supported on this browser.
     * @returns {TP.meta.core.Browser} The receiver.
     */

    //  We only install the non-native namespaces if they haven't been
    //  installed yet and then we flip the flag so that they don't get
    //  installed again.
    if (!this.get('nonNativeNamespacesInstalled')) {
        this.set('nonNativeNamespacesInstalled', true);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
