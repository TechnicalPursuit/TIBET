//  ========================================================================
/*
NAME:   TIBETUICanvasTypesBase.js
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
 * @subject Common extensions to the base TP.core.Window type.
 * @todo
 */

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('installDocumentExtensions',
function(aWindow) {

    /**
     * @name installDocumentExtensions
     * @synopsis Instruments the document belonging to aWindow with TIBET
     *     specific functions.
     * @param {Window} aWindow The window of the document to install the
     *     functions on.
     * @returns {TP.core.Window} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('installLoadUnloadHooks',
function(aWindow) {

    /**
     * @name installLoadUnloadHooks
     * @synopsis This method installs the TIBET load/unload hooks onto the
     *     supplied native window so that load/unload events on that window can
     *     be caught by TIBET and rebroadcast into the system as signals.
     * @param {Window} aWindow The Window to install the load/unload hooks onto.
     * @returns {TP.core.Window} The receiver.
     */

    var tibetWin,
        dclListener,
        unloadListener;

    if (!TP.isWindow(aWindow)) {
        return this.raise('TP.sig.InvalidWindow', arguments);
    }

    if (TP.$$DEBUG) {
        TP.boot.$stdout('Arming window: ' + TP.gid(aWindow) + '.', TP.TRACE);
        TP.boot.$stdout('Adding listeners to ' + aWindow.name + '.', TP.TRACE);
    }

    //  Set the native window's onerror handler to the standard TIBET
    //  onerror handler, so that errors that occur in the window are
    //  processed by the TIBET error handling system.
    aWindow.onerror = TP.sys.onerror;

    //  assign our codebase window to the var we'll close around
    tibetWin = window;

    dclListener = function(anEvent) {

                    if (anEvent.target !== aWindow.document) {
                        if (TP.$$DEBUG) {
                            TP.boot.$stdout(
                                'Ignoring DOMContentLoaded from target: ' +
                                anEvent.target + '.', TP.TRACE);
                        }
                        return;
                    }

                    //  NOTE that this signal is only triggered in
                    //  response to a location change. altering the DOM
                    //  of the document element won't trigger it.
                    if (TP.$$DEBUG) {
                        TP.boot.$stdout('DOMContentLoaded at: ' +
                            TP.str(anEvent.target), TP.TRACE);
                    }


                    //  remove so we don't trigger again due to
                    //  processDocumentLoaded invocation(s)
                    aWindow.removeEventListener(
                            'DOMContentLoaded',
                            dclListener,
                            false);

                    //  writing handler is false, we're the location
                    //  handler
                    tibetWin.TP.$$processDocumentLoaded(aWindow);
                };

    aWindow.addEventListener('DOMContentLoaded', dclListener, false);

    unloadListener = function(anEvent) {

                        if (anEvent.target !== aWindow.document) {
                            if (TP.$$DEBUG) {
                                TP.boot.$stdout(
                                    'Ignoring DOMContentUnloaded from target: ' +
                                    anEvent.target + '.', TP.TRACE);
                            }
                            return;
                        }

                        //  NOTE that this signal is only triggered in
                        //  response to a location change. altering the DOM
                        //  of the document element won't trigger it.
                        if (TP.$$DEBUG) {
                            TP.boot.$stdout('DOMContentUnloaded at: ' +
                                TP.str(anEvent.target), TP.TRACE);
                        }

                        aWindow.removeEventListener(
                                'unload',
                                unloadListener,
                                false);

                        tibetWin.TP.$$processDocumentUnloaded(aWindow);
                    },

    aWindow.addEventListener('unload', unloadListener, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('installWindowExtensions',
function(aWindow) {

    /**
     * @name installWindowExtensions
     * @synopsis Installs a set of common functions onto aWindow to enhance that
     *     window's capability within the TIBET framework.
     * @param {Window} aWindow The window to install the functions on.
     * @returns {TP.core.Window} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
