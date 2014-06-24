//  ========================================================================
/*
NAME:   TIBETBrowserTypesBase.js
AUTH:   William J. Edney (wje), Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @subject Common extensions to TP.core.Browser.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.core.Browser.Type.defineMethod('installNativeNamespaces',
function() {

    /**
     * @name installNativeNamespaces
     * @synopsis Installs namespace support for tag processing for namespaces
     *     that are natively supported on this browser.
     * @returns {TP.core.Browser} The receiver.
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
     * @name installNonNativeNamespaces
     * @synopsis Installs namespace support for tag processing for namespaces
     *     that are not natively supported on this browser.
     * @returns {TP.core.Browser} The receiver.
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
