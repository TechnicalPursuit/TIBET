//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 */

/* eslint-disable no-loop-func */

//  ------------------------------------------------------------------------
//  Meta-Type Methods
//  ------------------------------------------------------------------------

//  NB: We only install these as meta-type methods since types are only checked
//  for these methods *after* instances are, but many types that implement these
//  methods implement the type version, so we can't install these as
//  meta-instance methods and ever expect the system to find specialized type
//  versions.

TP.defineMetaTypeMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @method cmdFilterInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to filter standard input using a
     *     filter operation such as .|?.
     * @description This method work in conjunction with 'tsh:eval' type's
     *     'cmdRunContent' method. It equips every object with the capability to
     *     'filter' content. At this level, it simply complete()s the request
     *     with the receiver as the result.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    aRequest.complete(this);

    return;
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @method cmdTransformInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to transform standard input using a
     *     simple transform operation such as .|
     * @description This method work in conjunction with 'tsh:eval' type's
     *     'cmdRunContent' method. It equips every object with the capability to
     *     'transform' content. At this level, it simply complete()s the request
     *     with the receiver as the result.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    aRequest.complete(this);

    return;
});

//  ------------------------------------------------------------------------
//  Object Methods
//  ------------------------------------------------------------------------

Object.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @method cmdAddContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using an
     *     appending operation such as .>>.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     * @exception TP.sig.InvalidSink
     */

    this.raise('TP.sig.InvalidSink');

    return;
});

//  ------------------------------------------------------------------------

Object.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @method cmdGetContent
     * @summary Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var obj,
        msg,
        val;

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    if (TP.notDefined(val = obj.get('value'))) {
        msg = 'No command content.';
        return aRequest.fail(msg);
    }

    aRequest.complete(val);

    return;
});

//  ------------------------------------------------------------------------

Object.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @summary Runs the receiver, effectively invoking its action.
     * @description This method is invoked any time a tag is being run as part
     *     of the processing of an enclosing tsh:script, which happens most
     *     often when the tag is being run interactively. The default defers to
     *     the tshExecute method of their type.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. TP.CONTINUE and TP.BREAK are common values.
     */

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------

Object.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        msg,
        obj,
        result;

    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    //  stdin is an array...so we just want the first item here
    result = input.first();

    obj.set('value', result);

    aRequest.complete(result);

    return;
});

//  ------------------------------------------------------------------------
//  Array Methods
//  ------------------------------------------------------------------------

Array.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @method cmdAddContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using an
     *     appending operation such as .>>.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        msg,
        arr;

    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(arr = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    //  stdin is an array...so addAll, not push here
    arr.addAll(input);

    aRequest.complete(arr);

    return;
});

//  ------------------------------------------------------------------------

Array.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        msg,
        arr;

    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(arr = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    //  truncate to clear first since this is a "set", not an "add"
    arr.length = 0;

    //  stdin is an array...so addAll, not push here
    arr.addAll(input);

    aRequest.complete(arr);

    return;
});

//  ------------------------------------------------------------------------
//  RegExp Methods
//  ------------------------------------------------------------------------

RegExp.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @method cmdFilterInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to filter standard input using a
     *     filter operation such as .|?.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        msg,
        len,
        i,
        content,
        re,
        result;

    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(re = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    len = input.getSize();
    for (i = 0; i < len; i++) {
        content = input.at(i);
        if (TP.notValid(content)) {
            continue;
        }

        //  if we're splatted then the return/output variable is expected to
        //  be a collection rather than a single item
        if (aRequest.at('cmdIterate')) {
            if (TP.isCollection(content)) {
                //  note that filter implies SELECT rather than COLLECT
                result = content.select(
                            function(item) {

                                return re.test(TP.str(item));
                            });

                //  output array, empty or not
                aRequest.stdout(result);
            } else {
                TP.ifWarn() ?
                    TP.warn('Splatting with non-collection content.') : 0;

                if (re.test(TP.str(content))) {
                    aRequest.stdout(TP.ac(content));
                } else {
                    aRequest.stdout(undefined);
                }
            }
        } else {
            //  not expecting collections, work at the object level by
            //  testing the string value of whatever we received.
            if (re.test(TP.str(content))) {
                aRequest.stdout(content);
            } else {
                aRequest.stdout(undefined);
            }
        }
    }

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------

RegExp.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @method cmdTransformInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to transform standard input using a
     *     simple transform operation such as .|
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        msg,
        len,
        i,
        content,
        re,
        result,
        str,
        arr,
        match;

    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(re = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    //  reset in case this is a global instance before looping
    re.lastIndex = 0;

    len = input.getSize();
    for (i = 0; i < len; i++) {
        content = input.at(i);
        if (TP.notValid(content)) {
            continue;
        }

        //  if we're splatted then the return/output variable is expected to
        //  be a collection rather than a single item
        if (aRequest.at('cmdIterate')) {
            if (TP.isCollection(content)) {
                //  transform is more "exec/match" than "test"
                result = content.collect(
                            function(item) {

                                if (re.global) {
                                    str = TP.str(item);
                                    arr = TP.ac();

                                    /* eslint-disable no-extra-parens */
                                    while ((match = re.exec(str))) {
                                        arr.push(match);
                                    }
                                    /* eslint-enable no-extra-parens */

                                    return arr;
                                } else {
                                    return re.exec(TP.str(item));
                                }
                            });

                //  output array, empty or not
                aRequest.stdout(result);
            } else {
                TP.ifWarn() ?
                    TP.warn('Splatting with non-collection content.') : 0;

                aRequest.stdout(re.exec(TP.str(content)));
            }
        } else {
            //  not expecting collections, work at the object level by
            //  testing the string value of whatever we received.
            if (re.global) {
                str = TP.str(content);
                arr = TP.ac();

                /* eslint-disable no-extra-parens */
                while ((match = re.exec(str))) {
                    arr.push(match);
                }
                /* eslint-enable no-extra-parens */

                aRequest.stdout(arr);
            } else {
                aRequest.stdout(re.exec(TP.str(content)));
            }
        }
    }

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------
//  String Methods
//  ------------------------------------------------------------------------

String.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @method cmdFilterInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to filter standard input using a
     *     filter operation such as .|?.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        msg,
        obj,
        str,
        len,
        i,
        content,
        result,
        testfunc;

    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    //  strings are invoked in quoted form due to parsing requirements of
    //  the shell so we want to remove those quotes to avoid complications
    str = obj.unquoted();

    len = input.getSize();
    for (i = 0; i < len; i++) {
        content = input.at(i);
        if (TP.notValid(content)) {
            continue;
        }

        //  TODO:   expand on capability here. currently the string has to
        //  be something the TP.objectValue() call can handle

        testfunc =
            function(item) {
                return TP.isValid(TP.objectValue(item, str));
            };

        //  if we're splatted then the return/output variable is expected to
        //  be a collection rather than a single item
        if (aRequest.at('cmdIterate')) {
            if (TP.isCollection(content)) {
                result = content.select(testfunc);

                //  output array, empty or not
                aRequest.stdout(result);
            } else {
                TP.ifWarn() ?
                    TP.warn('Splatting with non-collection content.') : 0;

                if (testfunc(content)) {
                    aRequest.stdout(content);
                } else {
                    aRequest.stdout(undefined);
                }
            }
        } else {
            //  not expecting collections, work at the object level by
            //  testing the string value of whatever we received.
            if (testfunc(content)) {
                aRequest.stdout(content);
            } else {
                aRequest.stdout(undefined);
            }
        }
    }

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------

String.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @method cmdTransformInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to transform standard input using a
     *     simple transform operation such as .|
     * @description This occurs when the string is quoted in a pipe segment
     *     which does not include a ? implying filtering. In these cases the
     *     string is treated either as a template or as an aspect path used to
     *     query the objects for a new value.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        msg,
        obj,
        str,
        len,
        i,
        content,
        params,
        func,
        result;

    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    //  strings are invoked in quoted form due to parsing requirements of
    //  the shell so we want to remove those quotes to avoid complications
    str = obj.unquoted();

    len = input.getSize();
    for (i = 0; i < len; i++) {
        content = input.at(i);
        if (TP.notValid(content)) {
            //  when there's no stdin to process we have to assume the
            //  string is the desired output
            return str;
        }

        //  first special sugar is when the string represents a templating
        //  string or a format substitution
        if (TP.regex.HAS_ACP.test(str) ||
            TP.regex.FORMAT_SUBSTITUTION.test(str)) {

            //  has templating syntax, we'll go with treating it like a
            //  template rather than a filter then...

            params = aRequest.getPayload();
            if (TP.notValid(params)) {
                params = TP.hc();
            }

            //  if we're splatted then the return/output variable is
            //  expected to be a collection rather than a single item
            if (aRequest.at('cmdIterate')) {
                if (TP.isCollection(content)) {
                    //  even though the transform call can process things in
                    //  a loop we interpret the splat as a directive to
                    //  return an array of results rather than a single
                    //  string so we loop here
                    result = content.collect(
                                function(item) {
                                    return str.transform(item, params);
                                });

                    //  output array, empty or not
                    aRequest.stdout(result);

                    break;
                } else {
                    TP.ifWarn() ?
                        TP.warn('Splatting with non-collection content.') : 0;

                    aRequest.stdout(TP.ac(str.transform(content, params)));
                }
            } else {
                //  no splat, no repeat
                aRequest.stdout(str.transform(content, params));
            }
        } else {
            //  if the string represents a type name then we'll presume
            //  that we want to call TP.format rather than treating it
            //  like a property access transformation.
            func = TP.isType(TP.sys.getTypeByName(str)) ?
                                TP.format :
                                TP.val;

            //  if we're splatted then the return/output variable is
            //  expected to be a collection rather than a single item
            if (TP.isTrue(aRequest.at('cmdIterate'))) {
                if (TP.isCollection(content)) {
                    result = content.collect(
                                function(item) {

                                    return func(item, str);
                                });

                    //  output array, empty or not
                    aRequest.stdout(result);

                    break;
                } else {
                    TP.ifWarn() ?
                        TP.warn('Splatting with non-collection content.') : 0;

                    aRequest.stdout(TP.ac(func(content, str)));
                }
            } else {
                //  not expecting collections, work at the object level by
                //  testing the string value of whatever we received.
                aRequest.stdout(func(content, str));
            }
        }
    }

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------
//  TP.core.Node Methods
//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using an
     *     appending operation such as .>>.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        msg,
        obj,
        result;

    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    //  stdin is an array...so we just want the first item here
    result = input.first();

    obj.addContent(result, aRequest);

    aRequest.complete(result);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @method cmdGetContent
     * @summary Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var obj,
        msg,
        node;

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(node = obj.get('content'))) {
        msg = 'No command content.';
        return aRequest.fail(msg);
    }

    aRequest.complete(node);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Node.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        obj,
        result,
        msg;

    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    //  stdin is always an Array, so we want the first item.
    result = input.at(0);

    obj.set('content', result, aRequest);

    aRequest.complete(result);

    return;
});

//  ------------------------------------------------------------------------
//  TP.core.XSLDocumentNode Methods
//  ------------------------------------------------------------------------

TP.core.XSLDocumentNode.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @method cmdTransformInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to transform standard input using a
     *     simple transform operation such as .|
     * @description This occurs when the XSL Node is quoted in a pipe segment
     *     which does not include a ? implying filtering. In these cases the
     *     Node is treated an XSLT for use in transforming the content supplied
     *     to it, resulting in new content.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        obj,
        msg,
        len,
        i,
        content,

        result;

    //  Check input
    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    len = input.getSize();
    for (i = 0; i < len; i++) {
        content = input.at(i);
        if (TP.notValid(content)) {
            continue;
        }

        //  if we're splatted then the return/output variable is expected to
        //  be a collection rather than a single item
        if (aRequest.at('cmdIterate')) {
            if (TP.isCollection(content)) {
                //  even though the transform call can process things in a
                //  loop we interpret the splat as a directive to return an
                //  array of results rather than a single string so we loop
                //  here
                result = content.collect(
                            function(item) {
                                return obj.transform(item, aRequest);
                            });

                //  output array, empty or not
                aRequest.stdout(result);

                break;
            } else {
                TP.ifWarn() ?
                    TP.warn('Splatting with non-collection content.') : 0;

                aRequest.stdout(
                            TP.ac(obj.transform(content, aRequest)));
            }
        } else {
            //  no splat, no repeat
            aRequest.stdout(obj.transform(content, aRequest));
        }
    }

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------
//  TP.core.UICanvas Methods
//  ------------------------------------------------------------------------

TP.core.UICanvas.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @method cmdGetContent
     * @summary Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var obj,
        doc,
        msg;

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(doc = obj.getContentDocument())) {
        msg = 'No command content.';
        return aRequest.fail(msg);
    }

    return aRequest.complete(doc);
});

//  ------------------------------------------------------------------------

TP.core.UICanvas.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        obj,
        msg,
        result;

    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    //  stdin is always an Array, so we want the first item.
    result = TP.wrap(input.first());
    obj.setContent(result, aRequest);

    aRequest.complete(result);

    return;
});

//  ------------------------------------------------------------------------
//  TP.core.URI Methods
//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @method cmdAddContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using an
     *     appending operation such as .>>.
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest, TP.ADD);
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @method cmdFilterInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to filter standard input using a
     *     filter operation such as .|?.
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest, TP.FILTER);
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @method cmdGetContent
     * @summary Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest, TP.GET);
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('cmdRunContent',
function(aRequest, cmdType) {

    /**
     * @method cmdRunContent
     * @summary Runs the receiver, effectively invoking its action. For
     *     TP.core.URI this method is responsible for dispatching all the
     *     variations of pipe methods which are suitable for use with a URI.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     */

    var obj,
        msg,

        href,

        pipe,
        crud,

        result,

        fname,
        subrequest,
        commitreq,
        content;

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        msg = 'No command instance.';
        return aRequest.fail(msg);
    }

    href = obj.getLocation();

    pipe = TP.elementGetAttribute(aRequest.at('cmdNode'), 'tsh:pipe', true);

    //  Since we may run into a variety of things during actual processing
    //  we construct a subrequest with our parameter data.

    //  If we're being used from a TP.tsh.uri, then there will be parameters
    //  picked up from that tag. If not, this will be null and there won't be
    //  any additional parameters.
    subrequest = TP.request(aRequest.at('TP.tsh.uri.params'));

    subrequest.atPut('cmdAction', aRequest.at('cmdAction'));

    subrequest.defineMethod('cancelJob',
        function(aFaultString, aFaultCode, aFaultInfo) {

            switch (arguments.length) {
                case 1:
                    this.$wrapupJob('Cancelled', TP.CANCELLED, aFaultString);
                    return aRequest.cancel(aFaultString);
                case 2:
                    this.$wrapupJob('Cancelled', TP.CANCELLED, aFaultString,
                                    aFaultCode);
                    return aRequest.cancel(aFaultString, aFaultCode);
                case 3:
                    this.$wrapupJob('Cancelled', TP.CANCELLED, aFaultString,
                                    aFaultCode, aFaultInfo);
                    return aRequest.cancel(aFaultString,
                                            aFaultCode,
                                            aFaultInfo);
                default:
                    this.$wrapupJob('Cancelled', TP.CANCELLED);
                    return aRequest.cancel();
            }
        });

    subrequest.defineMethod('completeJob',
        function(aResult) {

            var res;

            switch (arguments.length) {
                case 1:
                    this.$wrapupJob('Succeeded', TP.SUCCEEDED, aResult);
                    return aRequest.complete(aResult);
                default:    //  0
                    res = subrequest.getResult();
                    if (TP.isDefined(res)) {
                        this.$wrapupJob('Succeeded', TP.SUCCEEDED, res);
                        return aRequest.complete(res);
                    } else {
                        this.$wrapupJob('Succeeded', TP.SUCCEEDED);
                        return aRequest.complete();
                    }
            }
        });

    subrequest.defineMethod('failJob',
        function(aFaultString, aFaultCode, aFaultInfo) {

            switch (arguments.length) {
                case 1:
                    this.$wrapupJob('Failed', TP.FAILED, aFaultString);
                    return aRequest.fail(aFaultString);
                case 2:
                    this.$wrapupJob('Failed', TP.FAILED, aFaultString,
                                    aFaultCode);
                    return aRequest.fail(aFaultString, aFaultCode);
                case 3:
                    this.$wrapupJob('Failed', TP.FAILED, aFaultString,
                                    aFaultCode,
                                    aFaultInfo);
                    return aRequest.fail(aFaultString,
                                            aFaultCode,
                                            aFaultInfo);
                default:
                    this.$wrapupJob('Failed', TP.FAILED);
                    return aRequest.fail();
            }
        });

    switch (cmdType) {

        case TP.TRANSFORM:
            //  transform content...fall through

        case TP.FILTER:
            //  filter content

            fname = /\?/.test(pipe) ?
                    'cmdFilterInput' :
                    'cmdTransformInput';

            //  We rely on the result resource object to filter or transform
            //  the data so we need a slightly more complex handler for
            //  success in this case.
            subrequest.defineHandler('RequestSucceeded',
                function(aSignal) {

                    var res,
                        type,
                        failMsg;

                    res = aSignal.getResult();
                    if (TP.notValid(res)) {
                        failMsg = 'Missing pipe resource: ' + href;
                        aRequest.fail(failMsg);

                        return;
                    } else if (TP.canInvoke(res, fname)) {
                        res = res[fname](aRequest);
                    } else if (TP.canInvoke(res, 'getType')) {
                        type = res.getType();
                        if (TP.canInvoke(type, fname)) {
                            aRequest.atPut('cmdInstance', res);
                            res = type[fname](aRequest);
                        }
                    } else {
                        failMsg = 'Incapable pipe resource: ' + href;
                        aRequest.fail(failMsg);

                        return;
                    }

                    if (TP.isDefined(res)) {
                        aRequest.complete(res);
                    } else {
                        aRequest.complete();
                    }

                    return;
                });

            obj.getResource(subrequest);

            return;

        case TP.SET:

            //  set content, with or without commit

            //  NOTE that because of how TP.core.URI operates any invocation
            //  of a setContent() call that isn't followed by a commit
            //  operation simply sets the content of the URI without any
            //  network or local DB access. As a result we can update
            //  content without any extra effort and use request/response
            //  only when doing a commit.
            content = aRequest.stdin().at(0);

            //  Make sure to get the CRUD value *before* setting the resource,
            //  as that will flip the 'isLoaded' flag to true.
            crud = obj.isLoaded() ? TP.UPDATE : TP.CREATE;

            result = obj.setResource(content);

            //  if ! for commit is present then we can simply queue the save
            //  operation and rely on the subrequest to handle resync.
            if (/!/.test(pipe)) {
                result = null;
                subrequest.atPut('crud', crud);
                if (subrequest.at('method') === TP.HTTP_DELETE) {
                    obj.delete(subrequest);
                } else {
                    obj.save(subrequest);
                }
            } else {
                //  Save is synchronous for all URI types since it's a
                //  "local save" to the URI's internal cache unless a commit
                //  is being requested. We need to complete() to have the
                //  rest of the system behave appropriately.
                subrequest.complete(result);
            }

            return;

        case TP.ADD:

            //  add content, with or without commit

            //  If we're going to be doing a commit operation we'll need to
            //  ensure we can pass along the same parameters for save().
            if (/!/.test(pipe)) {
                commitreq = TP.request();

                commitreq.defineHandler('RequestFailed',
                    function(aSignal) {

                        aRequest.fail(aSignal.getResult());

                        return;
                    });

                commitreq.defineHandler('RequestSucceeded',
                    function(aSignal) {

                        aRequest.complete(aSignal.getResult());

                        return;
                    });
            }

            //  NOTE that append is more difficult than set since we have to
            //  first acquire the existing content. That implies that we
            //  have a two or three-step process rather than a single step.
            //  Our first step is to process the getContent call, handling
            //  any asynchronous fetch there might be. The second step
            //  is to take that data and append the new content to the URIs
            //  content cache. The final step is to save the resulting data
            //  when a commit operation has been requested.
            subrequest.defineHandler('RequestSucceeded',
                function(aSignal) {

                    var input,
                        res;

                    res = aSignal.getResult();
                    input = aRequest.stdin().at(0);

                    //  if ! for commit is present then we can simply queue
                    //  the save operation and rely on the subrequest to
                    //  handle resync.
                    if (/!/.test(pipe)) {
                        commitreq.atPut('crud', TP.CREATE);
                        obj.save(commitreq);

                        //  Note here that we use 'addResource' so that the
                        //  receiving URI can do with the new data as it sees
                        //  fit.
                        obj.addResource(res, input, commitreq);
                    } else {
                        //  Note here that we use 'addResource' so that the
                        //  receiving URI can do with the new data as it sees
                        //  fit.
                        obj.addResource(res, input, aRequest);
                    }

                    return;
                });

            //  invoke stage one, the content acquisition, and let the
            //  response handlers take it from there.
            obj.getResource(subrequest);

            return;

        case TP.GET:

            //  NOTE fallthrough to the default which is to fetch content

        default:

            if (subrequest.at('method') === TP.HTTP_DELETE) {
                obj.delete(subrequest);
                break;
            }

            //  trigger the fetch sequence, relying on the subrequest's
            //  handlers to update the request appropriately.
            obj.getResource(subrequest);
            break;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest, TP.SET);
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @method cmdTransformInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to transform standard input using a
     *     simple transform operation such as .|
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest, TP.TRANSFORM);
});

//  ------------------------------------------------------------------------
//  TP.core.Window Methods
//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @method cmdAddContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using an
     *     appending operation such as .>>.
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var obj;

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail('No command instance');
    }

    return obj.getDocument().getType().cmdAddContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @method cmdGetContent
     * @summary Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var obj;

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail('No command instance');
    }

    return obj.getDocument().getType().cmdGetContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        msg,
        obj,
        result,

        maybeURI,
        request;

    if (TP.isEmpty(input = aRequest.stdin())) {
        msg = 'No command stdin.';
        return aRequest.fail(msg);
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail('No command instance');
    }

    //  stdin is always an Array, so we want the first item.
    result = input.at(0);

    if (TP.isKindOf(result, TP.core.XHTMLDocumentNode)) {
        maybeURI = result.get('uri');
    } else if (TP.isKindOf(result, TP.core.Content)) {
        maybeURI = result.get('sourceURI');
    } else {
        maybeURI = result;
    }

    //  If we were able to get a URI, then use it in a setLocation call to get
    //  proper push/history state management.
    if (TP.isURIString(maybeURI) || TP.isURI(maybeURI)) {

        //  Build a request we can pass to the setLocation routine to handle any
        //  callbacks, error conditions, etc.
        request = TP.request();

        //  Attach TP.ONLOAD and TP.ONFAIL handlers to the request. These will
        //  be called back when the receiving window is done loading.
        request.atPut(TP.ONLOAD, function(aDocument) {
            aRequest.complete();
        });

        request.atPut(TP.ONFAIL, function(req) {
            aRequest.fail();
        });

        //  Set the location of the window
        obj.setLocation(maybeURI, request);

        //  Return separately for consistency with this API vs. TP.go2() API
        //  which returns false.
        return;
    } else {
        //  Otherwise, the input wasn't a URI, so forward it on to our document.
        return obj.getDocument().getType().cmdSetContent(aRequest);
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
