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
 * @type {TP.tsh.service}
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:service');

TP.tsh.service.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.service.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @inheritDoc
     * @todo
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.service.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @inheritDoc
     * @todo
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.service.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @inheritDoc
     * @todo
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.service.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @inheritDoc
     * @todo
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.service.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @inheritDoc
     * @todo
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.service.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @name tshExecute
     * @synopsis Runs the receiver, effectively invoking its action. For tsh:uri
     *     this method is responsible for dispatching all the variations of pipe
     *     methods which are suitable for use with a URI.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. Common values are TP.CONTINUE, TP.DESCEND, and
     *     TP.BREAK.
     */

    var node,
        inst;

    TP.stop('break.tsh_request');

    node = aRequest.at('cmdNode');
    inst = TP.wrap(node);

    return inst.execute(aRequest);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tsh.service.Inst.defineMethod('execute',
function(aRequest) {

    /**
     * @name execute
     * @synopsis Runs the receiver, effectively invoking its action.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. Common values are TP.CONTINUE, TP.DESCEND, and
     *     TP.BREAK.
     */

    var node,
        shell,

        url,
        method,

        dict,
        handler,

        data,

        attrs,
        len,
        i,
        item,
        name,
        value,
        params,

        subrequest,

        finalURL;

    TP.stop('break.tsh_service');

    node = aRequest.at('cmdNode');
    shell = aRequest.at('cmdShell');

    //  are we busy? then we can't proceed regardless of any other state.
    if (TP.elementGetAttribute(node, 'tsh:busy', true) === 'true') {
        this.dispatch('tsh-service-error', node,
            TP.hc('error-type', 'request-in-progress'));

        aRequest.fail(TP.FAILURE,
            'Service call already in progress for: ' + TP.str(node));

        return TP.BREAK;
    } else {
        //  TODO:
        //  set it now...we're busy as soon as we start processing...

        //  TODO:
        //  clear it before we 'return' from errors etc.
        void(0);
    }

    //  target URI is the key piece of data, without that we can't run since
    //  we have to be able to get a URI handler to process the request.
    if (TP.isEmpty(url = TP.elementGetAttribute(node, 'tsh:href', true))) {
        //  optionally we might have a parameter tag child which specifies
        //  what we need
        if (TP.isEmpty(url = this.getActionParam(aRequest, 'href'))) {
            this.raise('TP.sig.InvalidParameter',
                'Missing required resource attribute for: ' + TP.str(node));

            this.dispatch('tsh-service-error', node,
                TP.hc('error-type', 'resource-error'));

            return TP.BREAK;
        }
    }

    url = TP.uc(url);
    if (TP.notValid(url)) {
        this.raise('TP.sig.InvalidParameter',
            'Invalid resource attribute for: ' + TP.str(node));

        this.dispatch('tsh-service-error', node,
            TP.hc('error-type', 'resource-error'));

        return TP.BREAK;
    }

    //  method is the operation we'll be routing to a handler.
    if (TP.isEmpty(method = TP.elementGetAttribute(node, 'tsh:method', true))) {
        if (TP.isEmpty(method = this.getActionParam(aRequest, 'method'))) {
            this.raise('TP.sig.InvalidParameter',
                'Missing required method attribute for: ' + TP.str(node));

            this.dispatch('tsh-service-error', node,
                TP.hc('error-type', 'method-error'));

            return TP.BREAK;
        }
    }

    //  use the method and URI to determine a viable URI handler which will
    //  be responsible for processing the details of the request.
    dict = TP.hc('route', method);
    dict.atPut('verb', method.toUpperCase());
    handler = TP.core.URI.route(url, dict);

    if (TP.notValid(handler)) {
        this.raise('TP.sig.InvalidHandler',
            'Missing required handler type for: ' + TP.str(node));

        this.dispatch('tsh-service-error', node,
            TP.hc('error-type', 'handler-error'));

        return TP.BREAK;
    }

    //  ---
    //  once we've confirmed we can find a reasonable URI handler we move on
    //  to process all the remaining parameter data found either on the tag
    //  or within child <param> tags.
    //  ---

    //  using getActionInput means we defer to binding data, then stdin data
    //  from a pipe, followed by any primary argument data.
    data = this.getType().getActionInput(aRequest);
    dict.atPut('body', data);

    //  process any attributes on the tag itself...these are available via
    //  the getArguments call from the shell, which will process the tag for
    //  any shell-isms like argv etc in addition to collecting attributes.
    attrs = shell.getArguments(aRequest).getItems();
    len = attrs.getSize();
    for (i = 0; i < len; i++) {
        item = attrs.at(i);
        name = item.first();
        value = item.last();
        switch (name) {
            case 'tsh:href': // Already processed.
            case 'tsh:method':
                break;
            case 'tsh:async':
                dict.atPut('async', TP.bc(value));
                break;
            case 'tsh:refresh':
                dict.atPut('refresh', TP.bc(value));
                break;
            default:
                //  non TP.tsh. prefixed attributes are ignored since
                //  they're almost always xmlns, or class, or other html
                //  overhead.
                if (name.indexOf('tsh:') === 0) {
                    dict.atPut(name.slice(4), value);
                }
                break;
        }
    }

    //  process any child <param> tags within the tag which might be used to
    //  provide bind-accessible values to the author.
    params = shell.getParams(aRequest).getItems();
    len = params.getSize();
    for (i = 0; i < len; i++) {
        item = params.at(i);
        name = item.first();
        value = item.last();

        switch (name) {
            case 'tsh:href':     // Already processed.
            case 'tsh:method':
                break;
            default:
                if (name.indexOf('tsh:') === 0) {
                    dict.atPut(name.slice(4), value);
                } else {
                    dict.atPut(name, value);
                }
                break;
        }
    }

    finalURL = url.asString().transform(dict);

    if (!TP.isURI(finalURL = TP.uc(finalURL))) {
        finalURL = url;
    }

    //  TODO: Should we recompute the handler here? All we did (supposedly)
    //  was update params - or was that all? ;-)

    //  TODO: Detect which 'dict' keys were found in the URL (i.e. in some
    //  substitution expression) and remove those entries from 'dict' -
    //  probably have to use a RegExp here since they might not be 'cleanly
    //  within' the URL parameter value boundary (i.e. foo="Hi ${bar}").

    //  Since we may run into a variety of things during actual processing
    //  we construct a subrequest with our parameter data.
    subrequest = TP.request(dict);

    //  cancel, complete, and fail make sure that we connect to pipes and
    //  other request sequences properly -- and that we get the
    //  handleRequestFailed and handleRequestSucceeded calls defined later.

    subrequest.defineMethod('cancelJob',
function(aFaultCode, aFaultString) {

            this.$wrapupJob('Cancelled', TP.CANCELLED,
                            aFaultCode, aFaultString);

            return aRequest.cancel(aFaultCode, aFaultString);
});
    subrequest.defineMethod('completeJob',
function(aResult) {

            this.$wrapupJob('Completed', TP.COMPLETED,
                            aResult || subrequest.getResult());

            return aRequest.complete(aResult || subrequest.getResult());
});
    subrequest.defineMethod('failJob',
function(aFaultCode, aFaultString, aFaultStack) {

            this.$wrapupJob('Failed', TP.FAILED,
                            aFaultCode, aFaultString);

            return aRequest.fail(aFaultCode, aFaultString);
});

    //  regardless of whether we failed or succeeded this method will be
    //  called when all processing has completed
    subrequest.defineMethod('handleRequestCompleted',
function() {
            // TODO: real work?
            //window.alert('tsh:service completed');
            return;
});

    //  If the fail() method is invoked we'll know about it and can process
    //  that here.
    subrequest.defineMethod('handleRequestFailed',
function() {

            // TODO: real work?
            //window.alert('tsh:service failed');
            return;
});

    //  If the complete() method is invoked we'll find out about it since
    //  this method will be invoked.
    subrequest.defineMethod('handleRequestSucceeded',
function(aRequest) {

            //window.alert('tsh:service succeeded');
            TP.ifInfo() ?
                TP.info('The results are: ' + TP.str(aRequest.getResult()),
                        TP.LOG) : 0;

                        /*
            args = TP.hc('response', aSignal,
                        'error', aSignal.didFail(),
                        'body', result);

            signal = this.dispatch('tsh-service-transmit-done',
                                    this.getNativeNode(),
                                    args);

            TP.handle(this, signal, 'handletsh-service-transmit-done');

            if (signal.didFail()) {
                this.dispatch('tsh-service-error', this.getNativeNode(), args);
            };
                        */
            return;
});

    //  the rest is up to the handler :)
    handler.service(finalURL, subrequest);

    //  skip children, they don't execute.
    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------
//  Binding Support
//  ------------------------------------------------------------------------

TP.tsh.service.Inst.defineMethod('isBoundElement',
function() {

    /**
     * @name isBoundElement
     * @synopsis Returns true if the receiver is a bound element. Service
     *     elements are typically bound, to the default instance if not
     *     specified otherwise using a default ref value of "/".
     * @returns {Boolean} True if the receiver has binding attributes.
     * @todo
     */

    //  service elements are bound to the default instance if nothing else,
    //  ensuring that they have a reference to source data.
    return true;
});

//  ------------------------------------------------------------------------

TP.tsh.service.Inst.defineMethod('isSingleValued',
function() {

    /**
     * @name isSingleValued
     * @synopsis Returns true if the receiver binds to a single element. For
     *     TP.tsh.service this is always true since only a single element can be
     *     processed as valid content.
     * @returns {Boolean} True if the receiver has binding attributes.
     */

    //  services always work in terms of a single-rooted/single object model
    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
