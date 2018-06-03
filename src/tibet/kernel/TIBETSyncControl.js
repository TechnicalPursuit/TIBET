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
 * @type {TP.core.SyncAsync}
 * @summary An abstract type designed to be mixed in to other types which
 *     require support for synchronous and asynchronous mode control. Examples
 *     are TP.core.Resource and TP.uri.URI and their subtypes.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.SyncAsync');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation.
TP.core.SyncAsync.isAbstract(true);

//  ------------------------------------------------------------------------

//  resources can handle requests either synchronously or asynchronously, or
//  both depending on the nature of the resource.
TP.core.SyncAsync.Type.defineConstant('SYNCHRONOUS', 0);
TP.core.SyncAsync.Type.defineConstant('ASYNCHRONOUS', 1);
TP.core.SyncAsync.Type.defineConstant('DUAL_MODE', 2);

//  keep a list of valid processing modes for validation checks
TP.core.SyncAsync.Type.defineConstant('MODES',
        TP.ac(
            TP.core.SyncAsync.SYNCHRONOUS,
            TP.core.SyncAsync.ASYNCHRONOUS,
            TP.core.SyncAsync.DUAL_MODE));

//  what modes does this service support? presumably we can do either in
//  most cases, but this is often overridden by non-HTTP resource types.
TP.core.SyncAsync.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.DUAL_MODE);

//  what mode is the default mode for this service? we default to async
//  since that's the typical way of communicating with users and servers
TP.core.SyncAsync.Type.defineAttribute('mode', TP.core.SyncAsync.ASYNCHRONOUS);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.SyncAsync.Type.defineMethod('isAsyncOnly',
function() {

    /**
     * @method isAsyncOnly
     * @summary Returns true if the receiver can't process synchronously.
     * @returns {Boolean}
     */

    return this.$get('supportedModes') === TP.core.SyncAsync.ASYNCHRONOUS;
});

//  ------------------------------------------------------------------------

TP.core.SyncAsync.Type.defineMethod('isDualMode',
function() {

    /**
     * @method isDualMode
     * @summary Returns true if the receiver can process body synchronously and
     *     asynchronously.
     * @returns {Boolean}
     */

    return this.$get('supportedModes') === TP.core.SyncAsync.DUAL_MODE;
});

//  ------------------------------------------------------------------------

TP.core.SyncAsync.Type.defineMethod('isSyncOnly',
function() {

    /**
     * @method isSyncOnly
     * @summary Returns true if the receiver can't process asynchronously.
     * @returns {Boolean}
     */

    return this.$get('supportedModes') === TP.core.SyncAsync.SYNCHRONOUS;
});

//  ------------------------------------------------------------------------

TP.core.SyncAsync.Type.defineMethod('setMode',
function(aProcessMode) {

    /**
     * @method setMode
     * @summary Sets the default processing mode (sync or async) for the
     *     receiving type. The mode must be one of those supported for the type
     *     based on the value of supportedModes.
     * @param {String} aProcessMode A TP.core.SyncAsync constant.
     * @returns {TP.meta.core.SyncAsync} The receiver.
     */

    var supported;

    //  validate mode against our list of 'approved' modes
    if (!TP.core.SyncAsync.MODES.containsString(aProcessMode)) {
        return this.raise('TP.sig.InvalidProcessMode');
    }

    //  if we're not dual mode then the mode better match the supported mode
    if ((supported = this.get('supportedModes')) !==
                                            TP.core.SyncAsync.DUAL_MODE) {
        if (aProcessMode !== supported) {
            return this.raise('TP.sig.InvalidProcessMode');
        }
    }

    return this.$set('mode', aProcessMode);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.SyncAsync.Inst.defineAttribute('mode');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.SyncAsync.Inst.defineMethod('getMode',
function() {

    /**
     * @method getMode
     * @summary Returns the current default processing mode, sync or async,
     *     for the resource. If there is an instance value that is returned,
     *     otherwise any value specified for the type will be used.
     * @returns {Number} A TP.core.SyncAsync processing mode constant.
     */

    var mode;

    mode = this.$get('mode');
    if (TP.notValid(mode)) {
        mode = this.getType().get('mode');
    }

    return mode;
});

//  ------------------------------------------------------------------------

TP.core.SyncAsync.Inst.defineMethod('isSynchronous',
function() {

    /**
     * @method isSynchronous
     * @summary Returns true if the receiver can support synchronous operation.
     * @returns {Boolean}
     */

    return !this.getType().isAsyncOnly();
});

//  ------------------------------------------------------------------------

TP.core.SyncAsync.Inst.defineMethod('rewriteRequestMode',
function(aRequest) {

    /**
     * @method rewriteRequestMode
     * @summary Returns the request mode which should be used for the request.
     *     In most cases this is the value provided in the request by in some
     *     cases it's possible to have an exception thrown when the request
     *     specifies a mode that the service can't support (for example asking
     *     an async-only service to process a synchronous request.
     * @param {TP.sig.Request} aRequest The request to rewrite.
     * @exception TP.sig.InvalidProcessMode
     * @returns {Boolean} True for asynchronous (for use in the 'async'
     *     parameter).
     */

    var mode,
        async,
        uri,
        refresh;

    async = TP.ifKeyInvalid(aRequest, 'async', null);
    refresh = TP.ifKeyInvalid(aRequest, 'refresh', null);
    //  TODO: on the wrong object this will cause a nasty recursion and blow up.
    //  Figure out why.
    // uri = TP.ifKeyInvalid(aRequest, 'uri', TP.str(TP.uc(TP.str(this))));

    if (TP.notValid(async)) {
        //  One special case is that when a resource isn't being refreshed
        //  we'll be reading from the cache which can be synchronous even
        //  when the resource is inherently async. This can make things a
        //  lot cleaner for certain operations that are checking the cache.
        if (!refresh) {
            return false;
        }

        mode = this.getMode();
        switch (mode) {
            case TP.core.SyncAsync.SYNCHRONOUS:
                async = false;
                break;
            case TP.core.SyncAsync.ASYNCHRONOUS:
                async = true;
                break;
            default:
                async = false;
                break;
        }
    }

    if (this.getType().isDualMode()) {
        return async;
    }

    if (async && this.getType().isSyncOnly()) {
        TP.ifWarn() ?
            TP.warn('Overriding async request for sync-only URI: ' + uri) : 0;

        async = false;
    }

    if (!async && this.getType().isAsyncOnly()) {
        //  One special case is that when a resource isn't being refreshed
        //  we'll be reading from the cache which can be synchronous even
        //  when the resource is inherently async. This can make things a
        //  lot cleaner for certain operations that are checking the cache.
        if (!refresh) {
            return false;
        }

        TP.ifWarn() ?
            TP.warn('Overriding sync request for async-only URI: ' + uri) : 0;

        async = true;
    }

    return async;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
