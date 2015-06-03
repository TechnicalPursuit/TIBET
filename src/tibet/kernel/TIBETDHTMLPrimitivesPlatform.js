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
Platform-specific functionality related to DHTML operations.
*/

/* JSHint checking */

/* global CSSPrimitiveValue:false,
          WebKitPoint:false
*/

/* jshint newcap:false,
          evil:true
*/

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('documentCreateIFrameElement',
TP.hc(
    'test',
    'webkit',
    'true',
    function(aDocument, forcedMIMEType, iframeID) {

        /**
         * @method documentCreateIFrameElement
         * @summary Creates an (X)HTML 'iframe' element in the document and
         *     'initializes' it to make sure its set up for manipulation.
         * @description In order for the frame element produced by this routine
         *     to have been properly set up, it will be appended to the supplied
         *     document and will be returned that way. If a forced MIME type
         *     isn't supplied, then the supplied Document will be queried to
         *     determine whether it is an HTML or XHTML document and the
         *     document of the iframe will be that type of document. Note also
         *     that the returned element could either be an 'iframe' element or
         *     an 'object' element depending on whether an HTML or XHTML iframe
         *     is to be created.
         * @param {Document} aDocument The document to create the iframe element
         *     in.
         * @param {String} forcedMIMEType The MIME type that should be used to
         *     determine the kind of document that should be used inside of the
         *     iframe. The two supported kinds of MIME type are currently:
         *     TP.ietf.Mime.HTML TP.ietf.Mime.XHTML.
         * @param {String} iframeID Optional. If supplied, and the type of
         *     document to create in the iframe is XHTML, this routine will
         *     properly register this ID with the 'frames' array of aDocument's
         *     window.
         * @exception TP.sig.InvalidDocument
         * @returns {HTMLElement} The 'iframe' (or 'object' if XHTML) element
         *     created in the supplied document.
         */

        var docMIMEType,

            newIFrameElement,
            iframeDoc,

            frmID;

        if (!TP.isDocument(aDocument)) {
            return TP.raise(this, 'TP.sig.InvalidDocument');
        }

        if (TP.isString(forcedMIMEType)) {
            docMIMEType = forcedMIMEType;
        } else {
            if (TP.isHTMLDocument(aDocument)) {
                docMIMEType = TP.ietf.Mime.HTML;
            } else {
                docMIMEType = TP.ietf.Mime.XHTML;
            }
        }

        if (docMIMEType === TP.ietf.Mime.HTML) {
            newIFrameElement = TP.documentCreateElement(aDocument,
                                                        'iframe',
                                                        TP.w3.Xmlns.XHTML);

            //  For IE...
            TP.elementSetAttribute(newIFrameElement, 'frameborder', 0);

            if (TP.isString(iframeID)) {
                TP.elementSetAttribute(newIFrameElement, 'id', iframeID);
            }

            //  Need to append this iframe to the document to be able to
            //  initialize it properly below. Pass 'false' in here to not
            //  worry about awakening.
            TP.nodeAppendChild(TP.documentGetBody(aDocument),
                                newIFrameElement,
                                false);

            //  Grab the document from the iframe and write a blank document
            //  into it to prep the document (making sure it has 'head' and
            //  'body' elements).
            iframeDoc = TP.elementGetIFrameDocument(newIFrameElement);

            iframeDoc.open();
            iframeDoc.write('<html><head><meta http-equiv="X-UA-Compatible" content="IE=9" /></head><body></body></html>');
            iframeDoc.close();
        } else {
            //  For XHTML documents, we actually create 'object' elements

            //  On Webkit-based browsers, we have to do this a bit
            //  differently to make it 'take'

            //  First, we create a 'span' element.
            newIFrameElement = TP.documentCreateElement(aDocument,
                                                        'span',
                                                        TP.w3.Xmlns.XHTML);


            //  Need to append this iframe to the document to be able to
            //  initialize it properly below. Pass 'false' in here to not
            //  worry about awakening.
            TP.nodeAppendChild(TP.documentGetBody(aDocument),
                                newIFrameElement,
                                false);

            //  Having an ID here isn't optional - we need it to grab a
            //  handle to the object, so we generate one here if necessary.
            //  The caller can always reset it...
            TP.regex.INVALID_ID_CHARS.lastIndex = 0;
            frmID = TP.isString(iframeID) ?
                        iframeID :
                        TP.genID('html_object').replace(
                                TP.regex.INVALID_ID_CHARS, '_');

            //  Set the outerHTML of the span wrapper. This will obliterate
            //  the span, but leave the 'object' element.
            newIFrameElement.outerHTML = '<object id="' + frmID + '" type="application/xhtml+xml" data="data:application/xhtml+xml,&lt;?xml version=&quot;1.0&quot;?&gt;&lt;!DOCTYPE html PUBLIC &quot;-//W3C//DTD XHTML 1.0 Strict//EN&quot; &quot;http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd&quot;&gt;&lt;html xmlns=&quot;http://www.w3.org/1999/xhtml&quot;&gt;&lt;body&gt;&lt;/body&gt;&lt;/html&gt;"><p>Couldn\'t create XHTML iframe...</p></object>';

            //  Note the reassignment here - the span is gone.
            newIFrameElement = TP.nodeGetElementById(aDocument, frmID);

            //  Grab the document from the iframe and write a blank document
            //  into it to prep the document (making sure it has 'head' and
            //  'body' elements).
            iframeDoc = TP.elementGetIFrameDocument(newIFrameElement);

            //  For some reason, these properties don't get wired

            newIFrameElement.contentWindow = iframeDoc.defaultView;

            if (TP.isString(iframeID)) {
                TP.nodeGetWindow(aDocument).frames[iframeID] =
                                            iframeDoc.defaultView;
            }
        }

        return newIFrameElement;
    },
    TP.DEFAULT,
    function(aDocument, forcedMIMEType, iframeID) {

        /**
         * @method documentCreateIFrameElement
         * @summary Creates an (X)HTML 'iframe' element in the document and
         *     'initializes' it to make sure its set up for manipulation.
         * @description In order for the frame element produced by this routine
         *     to have been properly set up, it will be appended to the supplied
         *     document and will be returned that way. If a forced MIME type
         *     isn't supplied, then the supplied Document will be queried to
         *     determine whether it is an HTML or XHTML document and the
         *     document of the iframe will be that type of document. Note also
         *     that the returned element could either be an 'iframe' element or
         *     an 'object' element depending on whether an HTML or XHTML iframe
         *     is to be created.
         * @param {Document} aDocument The document to create the iframe element
         *     in.
         * @param {String} forcedMIMEType The MIME type that should be used to
         *     determine the kind of document that should be used inside of the
         *     iframe. The two supported kinds of MIME type are currently:
         *     TP.ietf.Mime.HTML TP.ietf.Mime.XHTML.
         * @param {String} iframeID Optional. If supplied, and the type of
         *     document to create in the iframe is XHTML, this routine will
         *     properly register this ID with the 'frames' array of aDocument's
         *     window.
         * @exception TP.sig.InvalidDocument
         * @returns {HTMLElement} The 'iframe' (or 'object' if XHTML) element
         *     created in the supplied document.
         */

        var docMIMEType,

            newIFrameElement,
            iframeDoc;

        if (!TP.isDocument(aDocument)) {
            return TP.raise(this, 'TP.sig.InvalidDocument');
        }

        if (TP.isString(forcedMIMEType)) {
            docMIMEType = forcedMIMEType;
        } else {
            if (TP.isHTMLDocument(aDocument)) {
                docMIMEType = TP.ietf.Mime.HTML;
            } else {
                docMIMEType = TP.ietf.Mime.XHTML;
            }
        }

        if (docMIMEType === TP.ietf.Mime.HTML) {
            newIFrameElement = TP.documentCreateElement(aDocument,
                                                        'iframe',
                                                        TP.w3.Xmlns.XHTML);

            //  For IE...
            TP.elementSetAttribute(newIFrameElement, 'frameborder', 0);

            if (TP.isString(iframeID)) {
                TP.elementSetAttribute(newIFrameElement, 'id', iframeID);
            }

            //  Need to append this iframe to the document to be able to
            //  initialize it properly below. Pass 'false' in here to not
            //  worry about awakening.
            TP.nodeAppendChild(TP.documentGetBody(aDocument),
                                newIFrameElement,
                                false);

            //  Grab the document from the iframe and write a blank document
            //  into it to prep the document (making sure it has 'head' and
            //  'body' elements).
            iframeDoc = TP.elementGetIFrameDocument(newIFrameElement);

            iframeDoc.open();
            iframeDoc.write('<html><head><meta http-equiv="X-UA-Compatible" content="IE=9" /></head><body></body></html>');
            iframeDoc.close();
        } else {
            //  For XHTML documents, we actually create 'object' elements

            newIFrameElement = TP.documentCreateElement(aDocument,
                                                        'object',
                                                        TP.w3.Xmlns.XHTML);

            if (TP.isString(iframeID)) {
                TP.elementSetAttribute(newIFrameElement, 'id', iframeID);
            }

            TP.elementSetAttribute(newIFrameElement,
                                    'type',
                                    TP.XHTML_ENCODED);
            TP.elementSetAttribute(newIFrameElement, 'data', 'data:application/xhtml+xml,<?xml version="1.0"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><body></body></html>');

            //  Need to append this iframe to the document to be able to
            //  initialize it properly below. Pass 'false' in here to not
            //  worry about awakening.
            TP.nodeAppendChild(TP.documentGetBody(aDocument),
                                newIFrameElement,
                                false);

            //  Grab the document from the iframe and write a blank document
            //  into it to prep the document (making sure it has 'head' and
            //  'body' elements).
            iframeDoc = TP.elementGetIFrameDocument(newIFrameElement);

            //  For some reason, these properties don't get wired

            newIFrameElement.contentWindow = iframeDoc.defaultView;

            if (TP.isString(iframeID)) {
                TP.nodeGetWindow(aDocument).frames[iframeID] =
                                            iframeDoc.defaultView;
            }
        }

        return newIFrameElement;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('documentCreateEvent',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(aDocument, anEventSpec) {

        /**
         * @method documentCreateEvent
         * @summary Creates a native Event object, populating it with the event
         *     spec data provided. The spec must exist, and must contain a
         *     'type' key to construct a valid Event. NOTE that the keys in the
         *     event spec must match those expected for the particular event,
         *     making this method somewhat touchy with respect to input.
         * @param {Document} aDocument The native document the event will be
         *     created within. Default is TIBET's current UI canvas document.
         * @param {Event|TP.core.Hash} anEventSpec A hash containing the event
         *     specification as key/value pairs.
         * @returns {Event} The newly constructed native Event.
         */

        var spec,
            doc,
            type,
            evt,

            modifiers;

        if (TP.isEvent(anEventSpec)) {
            spec = anEventSpec;

            //  Go ahead and instance program an 'at' function on the Event
            //  object, so that calls below work without a lot of shuffle.
            spec.at = function(aKey) {return this[aKey]; };
        } else if (TP.isValid(anEventSpec)) {
            spec = TP.hc(anEventSpec);
        } else {
            spec = TP.hc();
        }

        doc = TP.ifInvalid(aDocument,
                            TP.sys.getUICanvas().getNativeDocument());

        type = TP.ifKeyInvalid(spec, 'type');
        switch (type) {
            //  HTML Events
            case 'abort':
            case 'blur':
            case 'change':
            case 'error':
            case 'focus':
            case 'load':
            case 'reset':
            case 'resize':
            case 'scroll':
            case 'select':
            case 'submit':
            case 'unload':
                evt = doc.createEvent('HTMLEvents');
                evt.initEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true));
                break;

            //  UI Events
            case 'focusin':
            case 'focusout':
                evt = doc.createEvent('UIEvents');
                evt.initUIEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'detail', 0));
                break;

            //  Key Events
            case 'keydown':
            case 'keypress':
            case 'keyup':
                evt = doc.createEvent('KeyboardEvent');

                modifiers = (
                            (spec.at('ctrlKey') ? 'Control' : '') +
                            (spec.at('shiftKey') ? ' Shift' : '') +
                            (spec.at('altKey') ? ' Alt' : '') +
                            (spec.at('metaKey') ? ' Meta' : '')).trim();

                evt.initKeyboardEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'char', null),
                            TP.ifKeyInvalid(spec, 'key', null),
                            TP.ifKeyInvalid(spec, 'location', null),
                            modifiers,
                            TP.ifKeyInvalid(spec, 'repeat', 0),
                            TP.ifKeyInvalid(spec, 'locale', 0));
                break;

            //  Mouse Events
            case 'click':
            case 'dblclick':
            case 'mousedown':
            case 'mouseenter':
            case 'mousemove':
            case 'mouseleave':
            case 'mouseout':
            case 'mouseover':
            case 'mouseup':
                evt = doc.createEvent('MouseEvents');
                evt.initMouseEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'detail', 0),
                            TP.ifKeyInvalid(spec, 'screenX', 0),
                            TP.ifKeyInvalid(spec, 'screenY', 0),
                            TP.ifKeyInvalid(spec, 'clientX', 0),
                            TP.ifKeyInvalid(spec, 'clientY', 0),
                            TP.ifKeyInvalid(spec, 'ctrlKey', false),
                            TP.ifKeyInvalid(spec, 'altKey', false),
                            TP.ifKeyInvalid(spec, 'shiftKey', false),
                            TP.ifKeyInvalid(spec, 'metaKey', false),
                            TP.ifKeyInvalid(spec, 'button', 0),
                            TP.ifKeyInvalid(spec, 'relatedTarget', null));

                evt.$$pageX = TP.ifKeyInvalid(spec, 'pageX', 0);
                evt.$$pageY = TP.ifKeyInvalid(spec, 'pageY', 0);
                evt.$$offsetX = TP.ifKeyInvalid(spec, 'offsetX', 0);
                evt.$$offsetY = TP.ifKeyInvalid(spec, 'offsetY', 0);

                break;

            //  Mouse Scroll Events
            case 'DOMMouseScroll':
                evt = doc.createEvent('MouseScrollEvents');
                evt.initMouseScrollEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'detail', 0),
                            TP.ifKeyInvalid(spec, 'screenX', 0),
                            TP.ifKeyInvalid(spec, 'screenY', 0),
                            TP.ifKeyInvalid(spec, 'clientX', 0),
                            TP.ifKeyInvalid(spec, 'clientY', 0),
                            TP.ifKeyInvalid(spec, 'ctrlKey', false),
                            TP.ifKeyInvalid(spec, 'altKey', false),
                            TP.ifKeyInvalid(spec, 'shiftKey', false),
                            TP.ifKeyInvalid(spec, 'metaKey', false),
                            TP.ifKeyInvalid(spec, 'button', 0),
                            TP.ifKeyInvalid(spec, 'relatedTarget', null),
                            //  1 for horizontal, 2 for vertical
                            TP.ifKeyInvalid(spec, 'axis', 2));

                evt.$$pageX = TP.ifKeyInvalid(spec, 'pageX', 0);
                evt.$$pageY = TP.ifKeyInvalid(spec, 'pageY', 0);
                evt.$$offsetX = TP.ifKeyInvalid(spec, 'offsetX', 0);
                evt.$$offsetY = TP.ifKeyInvalid(spec, 'offsetY', 0);

                break;

            //  Mutation Events
            case 'DOMAttrModified':
            case 'DOMNodeInserted':
            case 'DOMNodeRemoved':
            case 'DOMCharacterDataModified':
            case 'DOMNodeInsertedIntoDocument':
            case 'DOMNodeRemovedFromDocument':
            case 'DOMSubtreeModified':
                evt = doc.createEvent('MutationEvents');
                evt.initMutationEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec, 'relatedTarget', null),
                            TP.ifKeyInvalid(spec, 'prevValue', null),
                            TP.ifKeyInvalid(spec, 'newValue', null),
                            TP.ifKeyInvalid(spec, 'attrName', null),
                            TP.ifKeyInvalid(spec, 'attrChange', null));
                break;

            //  Transition Events
            case 'transitionend':
                //  Not currently supported to generate these by most browsers.
                break;

            default:
                evt = doc.createEvent('Events');
                evt.initEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true));

                //  Not an officially-defined event. Just put the slots from
                //  the supplied hash onto the Event as instance properties.
                TP.keys(spec).perform(
                        function(aKey) {

                            //  Got to filter out specified properties -
                            //  Mozilla will throw an exception.
                            if (TP.W3C_EVENT_PROPERTIES.test(aKey) ||
                                TP.EXTRA_EVENT_PROPERTIES.test(aKey)) {
                                return;
                            }

                            evt[aKey] = spec.at(aKey);
                        });

                break;
        }

        //  additional properties not necessarily covered by spec
        TP.TIBET_EVENT_PROPERTIES.perform(
            function(item) {

                try {
                    evt[item] = spec.at(item.slice(2));
                } catch (e) {
                    TP.ifError() ?
                        TP.error(TP.ec(e, 'Error configuring event.'),
                                    TP.LOG) : 0;
                }
            });

        return evt;
    },
    'trident',
    function(aDocument, anEventSpec) {

        /**
         * @method documentCreateEvent
         * @summary Creates a native Event object, populating it with the event
         *     spec data provided. The spec must exist, and must contain a
         *     'type' key to construct a valid Event. NOTE that the keys in the
         *     event spec must match those expected for the particular event,
         *     making this method somewhat touchy with respect to input.
         * @param {Document} aDocument The native document the event will be
         *     created within. Default is TIBET's current UI canvas document.
         * @param {Event|TP.core.Hash} anEventSpec A hash containing the event
         *     specification as key/value pairs.
         * @returns {Event} The newly constructed native Event.
         */

        var spec,
            doc,
            type,
            evt,

            modifiers;

        if (TP.isEvent(anEventSpec)) {
            spec = anEventSpec;

            //  Go ahead and instance program an 'at' function on the Event
            //  object, so that calls below work without a lot of shuffle.
            spec.at = function(aKey) {return this[aKey]; };
        } else if (TP.isValid(anEventSpec)) {
            spec = TP.hc(anEventSpec);
        } else {
            spec = TP.hc();
        }

        doc = TP.ifInvalid(aDocument,
                            TP.sys.getUICanvas().getNativeDocument());

        type = TP.ifKeyInvalid(spec, 'type');
        switch (type) {
            //  HTML Events
            case 'abort':
            case 'blur':
            case 'change':
            case 'error':
            case 'focus':
            case 'load':
            case 'reset':
            case 'resize':
            case 'scroll':
            case 'select':
            case 'submit':
            case 'unload':
                evt = doc.createEvent('HTMLEvents');
                evt.initEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true));
                break;

            //  UI Events
            case 'focusin':
            case 'focusout':
                evt = doc.createEvent('UIEvents');
                evt.initUIEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'detail', 0));
                break;

            //  Key Events
            case 'keydown':
            case 'keypress':
            case 'keyup':

                evt = doc.createEvent('KeyboardEvent');

                modifiers = (
                            (spec.at('ctrlKey') ? 'Control' : '') +
                            (spec.at('shiftKey') ? ' Shift' : '') +
                            (spec.at('altKey') ? ' Alt' : '') +
                            (spec.at('metaKey') ? ' Meta' : '')).trim();

                evt.initKeyboardEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'key', null),
                            TP.ifKeyInvalid(spec, 'location', null),
                            modifiers,
                            TP.ifKeyInvalid(spec, 'repeat', 0),
                            TP.ifKeyInvalid(spec, 'locale', 0));
                break;

            //  Mouse Events
            case 'click':
            case 'dblclick':
            case 'mousedown':
            case 'mouseenter':
            case 'mousemove':
            case 'mouseleave':
            case 'mouseout':
            case 'mouseover':
            case 'mouseup':
                evt = doc.createEvent('MouseEvents');
                evt.initMouseEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'detail', 0),
                            TP.ifKeyInvalid(spec, 'screenX', 0),
                            TP.ifKeyInvalid(spec, 'screenY', 0),
                            TP.ifKeyInvalid(spec, 'clientX', 0),
                            TP.ifKeyInvalid(spec, 'clientY', 0),
                            TP.ifKeyInvalid(spec, 'ctrlKey', false),
                            TP.ifKeyInvalid(spec, 'altKey', false),
                            TP.ifKeyInvalid(spec, 'shiftKey', false),
                            TP.ifKeyInvalid(spec, 'metaKey', false),
                            TP.ifKeyInvalid(spec, 'button', 0),
                            TP.ifKeyInvalid(spec, 'relatedTarget', null));

                evt.pageX = TP.ifKeyInvalid(spec, 'pageX', 0);
                evt.pageY = TP.ifKeyInvalid(spec, 'pageY', 0);
                evt.offsetX = TP.ifKeyInvalid(spec, 'offsetX', 0);
                evt.offsetY = TP.ifKeyInvalid(spec, 'offsetY', 0);

                break;

            //  Wheel Events
            case 'mousewheel':
                evt = doc.createEvent('WheelEvent');
                evt.initWheelEvent(
                            TP.ifKeyInvalid(spec, 'wheelDeltaX', 0),
                            TP.ifKeyInvalid(spec, 'wheelDeltaY', 0),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'screenX', 0),
                            TP.ifKeyInvalid(spec, 'screenY', 0),
                            TP.ifKeyInvalid(spec, 'clientX', 0),
                            TP.ifKeyInvalid(spec, 'clientY', 0),
                            TP.ifKeyInvalid(spec, 'ctrlKey', false),
                            TP.ifKeyInvalid(spec, 'altKey', false),
                            TP.ifKeyInvalid(spec, 'shiftKey', false),
                            TP.ifKeyInvalid(spec, 'metaKey', false));

                evt.pageX = TP.ifKeyInvalid(spec, 'pageX', 0);
                evt.pageY = TP.ifKeyInvalid(spec, 'pageY', 0);
                evt.offsetX = TP.ifKeyInvalid(spec, 'offsetX', 0);
                evt.offsetY = TP.ifKeyInvalid(spec, 'offsetY', 0);

                break;

            //  Mutation Events
            case 'DOMAttrModified':
            case 'DOMNodeInserted':
            case 'DOMNodeRemoved':
            case 'DOMCharacterDataModified':
            case 'DOMNodeInsertedIntoDocument':
            case 'DOMNodeRemovedFromDocument':
            case 'DOMSubtreeModified':
                evt = doc.createEvent('MutationEvents');
                evt.initMutationEvent(type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec, 'relatedTarget', null),
                            TP.ifKeyInvalid(spec, 'prevValue', null),
                            TP.ifKeyInvalid(spec, 'newValue', null),
                            TP.ifKeyInvalid(spec, 'attrName', null),
                            TP.ifKeyInvalid(spec, 'attrChange', null));
                break;

            default:
                evt = doc.createEvent('Events');
                evt.initEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true));

                //  Not an officially-defined event. Just put the slots from
                //  the supplied hash onto the Event as instance properties.
                TP.keys(spec).perform(
                        function(aKey) {

                            //  We filter out specified properties - Mozilla
                            //  throws an exception. Trident/Webkit may not,
                            //  but it probably won't like it.
                            if (TP.W3C_EVENT_PROPERTIES.test(aKey) ||
                                TP.EXTRA_EVENT_PROPERTIES.test(aKey)) {
                                return;
                            }

                            evt[aKey] = spec.at(aKey);
                        });

                break;
        }

        //  additional properties not necessarily covered by spec
        TP.TIBET_EVENT_PROPERTIES.perform(
            function(item) {

                try {
                    evt[item] = spec.at(item.slice(2));
                } catch (e) {
                    TP.ifError() ?
                        TP.error(TP.ec(e, 'Error configuring event.'),
                                    TP.LOG) : 0;
                }
            });

        return evt;
    },
    'webkit',
    function(aDocument, anEventSpec) {

        /**
         * @method documentCreateEvent
         * @summary Creates a native Event object, populating it with the event
         *     spec data provided. The spec must exist, and must contain a
         *     'type' key to construct a valid Event. NOTE that the keys in the
         *     event spec must match those expected for the particular event,
         *     making this method somewhat touchy with respect to input.
         * @param {Document} aDocument The native document the event will be
         *     created within. Default is TIBET's current UI canvas document.
         * @param {Event|TP.core.Hash} anEventSpec A hash containing the event
         *     specification as key/value pairs.
         * @returns {Event} The newly constructed native Event.
         */

        var spec,
            doc,
            type,
            evt;

        if (TP.isEvent(anEventSpec)) {
            spec = anEventSpec;

            //  Go ahead and instance program an 'at' function on the Event
            //  object, so that calls below work without a lot of shuffle.
            spec.at = function(aKey) {return this[aKey]; };
        } else if (TP.isValid(anEventSpec)) {
            spec = TP.hc(anEventSpec);
        } else {
            spec = TP.hc();
        }

        doc = TP.ifInvalid(aDocument,
                            TP.sys.getUICanvas().getNativeDocument());

        type = TP.ifKeyInvalid(spec, 'type');
        switch (type) {
            //  HTML Events
            case 'abort':
            case 'blur':
            case 'change':
            case 'error':
            case 'focus':
            case 'load':
            case 'reset':
            case 'resize':
            case 'scroll':
            case 'select':
            case 'submit':
            case 'unload':
                evt = doc.createEvent('HTMLEvents');
                evt.initEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true));
                break;

            //  UI Events
            case 'focusin':
            case 'focusout':
                evt = doc.createEvent('UIEvents');
                evt.initUIEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'detail', 0));
                break;

            //  Key Events
            case 'keydown':
            case 'keypress':
            case 'keyup':
                evt = doc.createEvent('KeyboardEvent');
                evt.initKeyboardEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'key', false),
                            TP.ifKeyInvalid(spec, 'location', false),

                            TP.ifKeyInvalid(spec, 'ctrlKey', false),
                            TP.ifKeyInvalid(spec, 'altKey', false),
                            TP.ifKeyInvalid(spec, 'shiftKey', false),
                            TP.ifKeyInvalid(spec, 'metaKey', false));

                break;

            //  Mouse Events
            case 'click':
            case 'dblclick':
            case 'mousedown':
            case 'mouseenter':
            case 'mousemove':
            case 'mouseleave':
            case 'mouseout':
            case 'mouseover':
            case 'mouseup':
                evt = doc.createEvent('MouseEvents');
                evt.initMouseEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'detail', 0),
                            TP.ifKeyInvalid(spec, 'screenX', 0),
                            TP.ifKeyInvalid(spec, 'screenY', 0),
                            TP.ifKeyInvalid(spec, 'clientX', 0),
                            TP.ifKeyInvalid(spec, 'clientY', 0),
                            TP.ifKeyInvalid(spec, 'ctrlKey', false),
                            TP.ifKeyInvalid(spec, 'altKey', false),
                            TP.ifKeyInvalid(spec, 'shiftKey', false),
                            TP.ifKeyInvalid(spec, 'metaKey', false),
                            TP.ifKeyInvalid(spec, 'button', 0),
                            TP.ifKeyInvalid(spec, 'relatedTarget', null));

                evt.pageX = TP.ifKeyInvalid(spec, 'pageX', 0);
                evt.pageY = TP.ifKeyInvalid(spec, 'pageY', 0);

                break;

            //  Wheel Events
            case 'mousewheel':
                evt = doc.createEvent('WheelEvent');
                evt.initWheelEvent(
                            TP.ifKeyInvalid(spec, 'wheelDeltaX', 0),
                            TP.ifKeyInvalid(spec, 'wheelDeltaY', 0),
                            TP.ifKeyInvalid(spec,
                                            'view',
                                            TP.sys.getUICanvas(true)),
                            TP.ifKeyInvalid(spec, 'screenX', 0),
                            TP.ifKeyInvalid(spec, 'screenY', 0),
                            TP.ifKeyInvalid(spec, 'clientX', 0),
                            TP.ifKeyInvalid(spec, 'clientY', 0),
                            TP.ifKeyInvalid(spec, 'ctrlKey', false),
                            TP.ifKeyInvalid(spec, 'altKey', false),
                            TP.ifKeyInvalid(spec, 'shiftKey', false),
                            TP.ifKeyInvalid(spec, 'metaKey', false));

                evt.pageX = TP.ifKeyInvalid(spec, 'pageX', 0);
                evt.pageY = TP.ifKeyInvalid(spec, 'pageY', 0);

                break;

            //  Mutation Events
            case 'DOMAttrModified':
            case 'DOMNodeInserted':
            case 'DOMNodeRemoved':
            case 'DOMCharacterDataModified':
            case 'DOMNodeInsertedIntoDocument':
            case 'DOMNodeRemovedFromDocument':
            case 'DOMSubtreeModified':
                evt = doc.createEvent('MutationEvents');
                evt.initMutationEvent(type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true),
                            TP.ifKeyInvalid(spec, 'relatedTarget', null),
                            TP.ifKeyInvalid(spec, 'prevValue', null),
                            TP.ifKeyInvalid(spec, 'newValue', null),
                            TP.ifKeyInvalid(spec, 'attrName', null),
                            TP.ifKeyInvalid(spec, 'attrChange', null));
                break;

            default:
                evt = doc.createEvent('Events');
                evt.initEvent(
                            type,
                            TP.ifKeyInvalid(spec, 'bubbles', true),
                            TP.ifKeyInvalid(spec, 'cancelable', true));

                //  Not an officially-defined event. Just put the slots from
                //  the supplied hash onto the Event as instance properties.
                TP.keys(spec).perform(
                        function(aKey) {

                            //  We filter out specified properties - Mozilla
                            //  throws an exception. Trident/Webkit may not,
                            //  but it probably won't like it.
                            if (TP.W3C_EVENT_PROPERTIES.test(aKey) ||
                                TP.EXTRA_EVENT_PROPERTIES.test(aKey)) {
                                return;
                            }

                            evt[aKey] = spec.at(aKey);
                        });

                break;
        }

        //  additional properties not necessarily covered by spec
        TP.TIBET_EVENT_PROPERTIES.perform(
            function(item) {

                try {
                    evt[item] = spec.at(item.slice(2));
                } catch (e) {
                    TP.ifError() ?
                        TP.error(TP.ec(e, 'Error configuring event.'),
                                    TP.LOG) : 0;
                }
            });

        return evt;
    }
));

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('$$buildTableDOM',
TP.hc(
    'test',
    'trident',
    'true',
    function(elemTagName, elemDoc, aContent, innerOnly) {

        /**
         * @method $$buildTableDOM
         * @summary Builds a DOM consisting of a 'table', based on the supplied
         *     element tag name and using the supplied content.
         * @description This is an 'internal only' method used by the Trident
         *     rendering engine to generate 'table DOMs' for use in content
         *     setting and insertion. This mechanism is used because of IE's
         *     limitations around using the innerHTML, outerHTML and
         *     insertAdjacentHTML() calls for 'table', 'thead', 'tbody',
         *     'tfoot', 'th', 'tr' and 'td' elements. See
         *     'htmlElementSetContent()', 'htmlElementInsertContent()' and
         *     'htmlElementReplaceWith()' for usage of this routine.
         * @param {String} elemTagName The tag name of the element that we're
         *     generating content for. NOTE: This method expects this name to be
         *     *lower case*.
         * @param {HTMLDocument} elemDoc The HTML document that the DOM elements
         *     should be created in.
         * @param {String} aContent The content to use in generating the DOM.
         * @param {Boolean} innerOnly Whether or not to return only the 'inner
         *     content' of what gets built.
         * @returns {HTMLElement} A container element holding the content to be
         *     inserted.
         */

        var fakeContainer,

            wantsInner,

            returnContainer;

        fakeContainer = elemDoc.createElement('div');
        wantsInner = TP.ifInvalid(innerOnly, true);

        switch (elemTagName) {
            case 'table':

                if (wantsInner) {
                    fakeContainer.innerHTML = TP.join(
                                '<table>',
                                aContent,
                                '</table>');
                    returnContainer = fakeContainer.firstChild;
                } else {
                    fakeContainer.innerHTML = aContent;
                    returnContainer = fakeContainer;
                }

                break;

            case 'thead':
            case 'tbody':
            case 'tfoot':

                if (wantsInner) {
                    fakeContainer.innerHTML = TP.join(
                            '<table><', elemTagName, '>',
                            aContent,
                            '</', elemTagName, '></table>');
                    returnContainer = fakeContainer.firstChild.firstChild;
                } else {
                    fakeContainer.innerHTML = TP.join(
                                '<table>',
                                aContent,
                                '</table>');
                    returnContainer = fakeContainer.firstChild;
                }

                break;

            case 'th':
            case 'tr':

                if (wantsInner) {
                    fakeContainer.innerHTML = TP.join(
                            '<table><tbody><', elemTagName, '>',
                            aContent,
                            '</', elemTagName, '></tbody></table>');
                    returnContainer = fakeContainer.
                                            firstChild.
                                            firstChild.
                                            firstChild;
                } else {
                    fakeContainer.innerHTML = TP.join(
                            '<table><tbody>',
                            aContent,
                            '</tbody></table>');
                    returnContainer = fakeContainer.
                                            firstChild.
                                            firstChild;
                }

                break;

            case 'td':

                if (wantsInner) {
                    fakeContainer.innerHTML = TP.join(
                            '<table><tbody><tr><td>',
                            aContent,
                            '<td></tr></tbody></table>');
                    returnContainer = fakeContainer.
                                            firstChild.
                                            firstChild.
                                            firstChild.
                                            firstChild;
                } else {
                    fakeContainer.innerHTML = TP.join(
                            '<table><tbody><tr>',
                            aContent,
                            '</tr></tbody></table>');
                    returnContainer = fakeContainer.
                                            firstChild.
                                            firstChild.
                                            firstChild;
                }

                break;

            default:
                return null;
        }

        return returnContainer;
    },
    TP.DEFAULT,
    function(elemTagName, elemDoc, aContent, innerOnly) {

        //  NB: Other browsers don't need this call - just return.
        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementDisableUserSelect',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(anElement) {

        /**
         * @method elementDisableUserSelect
         * @summary Disables the element's ability to be selected by the user.
         * @param {Element} anElement The element to disable the selectability
         *     of.
         * @exception TP.sig.InvalidElement
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        TP.elementGetStyleObj(anElement).MozUserSelect = 'none';

        return;
    },
    'trident',
    function(anElement) {

        /**
         * @method elementDisableUserSelect
         * @summary Disables the element's ability to be selected by the user.
         * @param {Element} anElement The element to disable the selectability
         *     of.
         * @exception TP.sig.InvalidElement
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        TP.elementGetStyleObj(anElement).msUserSelect = 'none';

        return;
    },
    'webkit',
    function(anElement) {

        /**
         * @method elementDisableUserSelect
         * @summary Disables the element's ability to be selected by the user.
         * @param {Element} anElement The element to disable the selectability
         *     of.
         * @exception TP.sig.InvalidElement
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        TP.elementGetStyleObj(anElement).WebkitUserSelect = 'none';

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementEnableUserSelect',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(anElement) {

        /**
         * @method elementEnableUserSelect
         * @summary Enables the element's ability to be selected by the user.
         * @param {Element} anElement The element to enable the selectability
         *     of.
         * @exception TP.sig.InvalidElement
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        TP.elementGetStyleObj(anElement).MozUserSelect = 'text';

        return;
    },
    'trident',
    function(anElement) {

        /**
         * @method elementEnableUserSelect
         * @summary Enables the element's ability to be selected by the user.
         * @param {Element} anElement The element to enable the selectability
         *     of.
         * @exception TP.sig.InvalidElement
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        TP.elementGetStyleObj(anElement).msUserSelect = 'text';

        return;
    },
    'webkit',
    function(anElement) {

        /**
         * @method elementEnableUserSelect
         * @summary Enables the element's ability to be selected by the user.
         * @param {Element} anElement The element to enable the selectability
         *     of.
         * @exception TP.sig.InvalidElement
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        TP.elementGetStyleObj(anElement).WebkitUserSelect = 'text';

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetBorderInPixels',
TP.hc(
    'test',
    'trident',
    'true',
    function(anElement, aSide, wantsTransformed) {

        /**
         * @method elementGetBorderInPixels
         * @summary Returns the element's border in pixels. 'aSide' is an
         *     optional argument - if not supplied, an Array of pixel numbers is
         *     returned with all of the border widths for each side of the
         *     supplied element.
         * @param {HTMLElement} anElement The element to retrieve the border in
         *     pixels for.
         * @param {String} aSide The side the border should be computed from.
         *     This should be one of the following TIBET constants: TP.TOP
         *     TP.RIGHT TP.BOTTOM TP.LEFT or it can be empty which means that
         *     values for all sides will be returned.
         * @param {Boolean} wantsTransformed An optional parameter that
         *     determines whether to return 'transformed' values if the
         *     element has been transformed with a CSS transformation. The
         *     default is false.
         * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
         * @returns {Number|Array} The element's border in pixels. If a side is
         *     supplied, this will be a Number, otherwise it will be an Array of
         *     Numbers containing the element's borders. The numbers are
         *     arranged in the following order: top, right, bottom, left.
         */

        var values,
            valueInPixels;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        //  Set the initial value to 0.
        valueInPixels = 0;

        try {
            if (TP.isEmpty(aSide)) {
                values = TP.elementGetStyleValuesInPixels(
                            anElement,
                            TP.ac('borderTopWidth', 'borderRightWidth',
                                    'borderBottomWidth', 'borderLeftWidth'),
                            wantsTransformed);

                return values;

            }

            //  Switch on the supplied side.
            switch (aSide) {
                case TP.TOP:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                            anElement,
                                            'borderTopWidth',
                                            wantsTransformed);
                        break;

                case TP.RIGHT:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                            anElement,
                                            'borderRightWidth',
                                            wantsTransformed);
                        break;

                case TP.BOTTOM:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                            anElement,
                                            'borderBottomWidth',
                                            wantsTransformed);
                        break;

                case TP.LEFT:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                            anElement,
                                            'borderLeftWidth',
                                            wantsTransformed);
                        break;

                default:
                        break;
            }
        } catch (e) {
            //  valueInPixels is already set to 0. Nothing to do here.
            //  empty
        }

        return valueInPixels;
    },
    TP.DEFAULT,
    function(anElement, aSide, wantsTransformed) {

        /**
         * @method elementGetBorderInPixels
         * @summary Returns the element's border in pixels. 'aSide' is an
         *     optional argument - if not supplied, an Array of pixel numbers is
         *     returned with all of the border widths for each side of the
         *     supplied element.
         * @param {HTMLElement} anElement The element to retrieve the border in
         *     pixels for.
         * @param {String} aSide The side the border should be computed from.
         *     This should be one of the following TIBET constants: TP.TOP
         *     TP.RIGHT TP.BOTTOM TP.LEFT or it can be empty which means that
         *     values for all sides will be returned.
         * @param {Boolean} wantsTransformed An optional parameter that
         *     determines whether to return 'transformed' values if the
         *     element has been transformed with a CSS transformation. The
         *     default is false.
         * @exception TP.sig.InvalidElement,TP.sig.InvalidStyle
         * @returns {Number|Array} The element's border in pixels. If a side is
         *     supplied, this will be a Number, otherwise it will be an Array of
         *     Numbers containing the element's borders. The numbers are
         *     arranged in the following order: top, right, bottom, left.
         */

        var computedStyle,

            pixelFunc,

            valueInPixels,
            valuesInPixels;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        //  Grab the computed style for the element
        if (TP.notValid(computedStyle =
                        TP.elementGetComputedStyleObj(anElement))) {
            return TP.raise(this, 'TP.sig.InvalidStyle');
        }

        //  Define a reusable helper Function that will avoid repetition below.
        pixelFunc = function(cssName) {
            var pixelVal;

            pixelVal = computedStyle.getPropertyCSSValue(cssName).
                                    getFloatValue(CSSPrimitiveValue.CSS_PX);


            if (TP.isTrue(wantsTransformed)) {
                pixelVal = TP.elementTransformCSSPixelValue(
                                                    anElement,
                                                    pixelVal,
                                                    cssName.asDOMName());
            }

            return pixelVal;
        };

        //  Set the initial value to 0.
        valueInPixels = 0;

        try {
            if (TP.isEmpty(aSide)) {
                valuesInPixels = TP.ac();

                valuesInPixels.push(pixelFunc('border-top-width'));
                valuesInPixels.push(pixelFunc('border-right-width'));
                valuesInPixels.push(pixelFunc('border-left-width'));
                valuesInPixels.push(pixelFunc('border-bottom-width'));

                return valuesInPixels;
            }

            //  Switch on the supplied side.
            switch (aSide) {
                case TP.TOP:

                    valueInPixels = pixelFunc('border-top-width');

                    break;

                case TP.RIGHT:

                    valueInPixels = pixelFunc('border-right-width');

                    break;

                case TP.BOTTOM:

                    valueInPixels = pixelFunc('border-bottom-width');

                    break;

                case TP.LEFT:

                    valueInPixels = pixelFunc('border-left-width');

                    break;

                default:
                        break;
            }
        } catch (e) {
            //  valueInPixels is already set to 0. Nothing to do here.
            //  empty
        }

        return valueInPixels;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetMarginInPixels',
TP.hc(
    'test',
    'trident',
    'true',
    function(anElement, aSide, wantsTransformed) {

        /**
         * @method elementGetMarginInPixels
         * @summary Returns the element's margin in pixels.
         * @param {HTMLElement} anElement The element to retrieve the margin in
         *     pixels for.
         * @param {String} aSide The side the margin should be computed from.
         *     This should be one of the following TIBET constants: TP.TOP
         *     TP.RIGHT TP.BOTTOM TP.LEFT or it can be empty which means that
         *     values for all sides will be returned.
         * @param {Boolean} wantsTransformed An optional parameter that
         *     determines whether to return 'transformed' values if the
         *     element has been transformed with a CSS transformation. The
         *     default is false.
         * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
         * @returns {Number|Array} The element's margin in pixels. If a side is
         *     supplied, this will be a Number, otherwise it will be an Array of
         *     Numbers containing the element's margins. The numbers are
         *     arranged in the following order: top, right, bottom, left.
         */

        var valueInPixels,
            values;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        if (TP.isEmpty(aSide)) {
            return TP.raise(this, 'TP.sig.InvalidParameter');
        }

        //  Set the initial value to 0.
        valueInPixels = 0;

        try {
            if (TP.isEmpty(aSide)) {
                values = TP.elementGetStyleValuesInPixels(
                            anElement,
                            TP.ac('marginTop', 'marginRight',
                                    'marginBottom', 'marginLeft'),
                            wantsTransformed);

                return values;
            }

            //  Switch on the supplied side.
            switch (aSide) {
                case TP.TOP:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                                anElement,
                                                'marginTop',
                                                wantsTransformed);
                        break;

                case TP.RIGHT:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                                anElement,
                                                'marginRight',
                                                wantsTransformed);
                        break;

                case TP.BOTTOM:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                                anElement,
                                                'marginBottom',
                                                wantsTransformed);
                        break;

                case TP.LEFT:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                                anElement,
                                                'marginLeft',
                                                wantsTransformed);
                        break;

                default:
                        break;
            }
        } catch (e) {
            //  valueInPixels is already set to 0. Nothing to do here.
            //  empty
        }

        return valueInPixels;
    },
    TP.DEFAULT,
    function(anElement, aSide, wantsTransformed) {

        /**
         * @method elementGetMarginInPixels
         * @summary Returns the element's margin in pixels.
         * @param {HTMLElement} anElement The element to retrieve the margin in
         *     pixels for.
         * @param {String} aSide The side the margin should be computed from.
         *     This should be one of the following TIBET constants: TP.TOP
         *     TP.RIGHT TP.BOTTOM TP.LEFT or it can be empty which means that
         *     values for all sides will be returned.
         * @param {Boolean} wantsTransformed An optional parameter that
         *     determines whether to return 'transformed' values if the
         *     element has been transformed with a CSS transformation. The
         *     default is false.
         * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter,
         *         TP.sig.InvalidStyle
         * @returns {Number|Array} The element's margin in pixels. If a side is
         *     supplied, this will be a Number, otherwise it will be an Array of
         *     Numbers containing the element's margins. The numbers are
         *     arranged in the following order: top, right, bottom, left.
         */

        var computedStyle,

            pixelFunc,

            valueInPixels,
            valuesInPixels;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        if (TP.isEmpty(aSide)) {
            return TP.raise(this, 'TP.sig.InvalidParameter');
        }

        //  Grab the computed style for the element
        if (TP.notValid(computedStyle =
                        TP.elementGetComputedStyleObj(anElement))) {
            return TP.raise(this, 'TP.sig.InvalidStyle');
        }

        //  Define a reusable helper Function that will avoid repetition below.
        pixelFunc = function(cssName) {
            var pixelVal;

            pixelVal = computedStyle.getPropertyCSSValue(cssName).
                                    getFloatValue(CSSPrimitiveValue.CSS_PX);


            if (TP.isTrue(wantsTransformed)) {
                pixelVal = TP.elementTransformCSSPixelValue(
                                                    anElement,
                                                    pixelVal,
                                                    cssName.asDOMName());
            }

            return pixelVal;
        };

        //  Set the initial value to 0.
        valueInPixels = 0;

        try {
            if (TP.isEmpty(aSide)) {

                valuesInPixels = TP.ac();

                valuesInPixels.push(pixelFunc('margin-top'));
                valuesInPixels.push(pixelFunc('margin-right'));
                valuesInPixels.push(pixelFunc('margin-left'));
                valuesInPixels.push(pixelFunc('margin-bottom'));

                return valuesInPixels;
            }

            //  Switch on the supplied side.
            switch (aSide) {
                case TP.TOP:

                    valueInPixels = pixelFunc('margin-top');

                    break;

                case TP.RIGHT:

                    valueInPixels = pixelFunc('margin-right');

                    break;

                case TP.BOTTOM:

                    valueInPixels = pixelFunc('margin-bottom');

                    break;

                case TP.LEFT:

                    valueInPixels = pixelFunc('margin-left');

                    break;

                default:
                        break;
            }
        } catch (e) {
            //  valueInPixels is already set to 0. Nothing to do here.
            //  empty
        }

        return valueInPixels;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetOffsetParent',
TP.hc(
    'test',
    'trident',
    'true',
    function(anElement) {

        /**
         * @method elementGetOffsetParent
         * @summary Returns the element's offset parent.
         * @param {HTMLElement} anElement The element to get the offset parent.
         * @exception TP.sig.InvalidElement
         * @returns {Element} The element's offset parent.
         */

        //  IE always returns the correct offset parent, even for parents
        //  that are statically positioned and scrolled.
        return anElement.offsetParent;
    },
    TP.DEFAULT,
    function(anElement) {

        /**
         * @method elementGetOffsetParent
         * @summary Returns the element's offset parent.
         * @description In non-IE browsers the '.offsetParent' property will
         *     only properly return the offset parent if it's positioned
         *     absolute, relative or fixed, but not if it's a statically-placed
         *     element that has scrolled. We compensate for that here.
         * @param {HTMLElement} anElement The element to get the offset parent.
         * @exception TP.sig.InvalidElement,TP.sig.InvalidStyle
         * @returns {Element} The element's offset parent.
         */

        var computedStyle,

            positionVal,
            shouldSkip,
            doc,
            ancestor;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        //  Grab the computed style for the element
        if (TP.notValid(computedStyle =
                        TP.elementGetComputedStyleObj(anElement))) {
            return TP.raise(this, 'TP.sig.InvalidStyle');
        }

        //  Grab the position of the element
        positionVal = computedStyle.position;

        //  We can skip static elements if we're positioned fixed or absolute.
        shouldSkip = /(fixed|absolute)/.test(positionVal);

        doc = TP.nodeGetDocument(anElement);

        ancestor =
            TP.nodeDetectAncestor(
                anElement,
                function(aParent) {

                    var parentPositionVal;

                    //  Grab the parent's position.
                    parentPositionVal =
                            TP.elementGetComputedStyleObj(aParent).position;

                    //  We can continue to skip static elements if:
                    //      we've been skipping them
                    //      the parent's position is 'static'
                    //      the parent isn't either the document element or
                    //      the body.
                    shouldSkip = shouldSkip &&
                                    parentPositionVal === 'static' &&
                                    aParent !== doc.documentElement &&
                                    aParent !== TP.documentGetBody(doc);

                    //  If we're not skipping static elements and either the
                    //  parent's content is scrolled or its positioned fixed
                    //  or absolute, then return it.
                    if (!shouldSkip &&
                        (TP.elementContentIsScrolled(aParent) ||
                        /(fixed|absolute)/.test(parentPositionVal))) {
                        return aParent;
                    }
                });

        //  Couldn't find a valid offset parent traversing with our
        //  algorithm, so just return our parent node.
        if (TP.notValid(ancestor)) {
            return anElement.parentNode;
        }

        return ancestor;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetPaddingInPixels',
TP.hc(
    'test',
    'trident',
    'true',
    function(anElement, aSide, wantsTransformed) {

        /**
         * @method elementGetPaddingInPixels
         * @summary Returns the element's padding in pixels.
         * @param {HTMLElement} anElement The element to retrieve the padding in
         *     pixels for.
         * @param {String} aSide The side the padding should be computed from.
         *     This should be one of the following TIBET constants: TP.TOP
         *     TP.RIGHT TP.BOTTOM TP.LEFT or it can be empty which means that
         *     values for all sides will be returned.
         * @param {Boolean} wantsTransformed An optional parameter that
         *     determines whether to return 'transformed' values if the
         *     element has been transformed with a CSS transformation. The
         *     default is false.
         * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
         * @returns {Number|Array} The element's padding in pixels. If a side is
         *     supplied, this will be a Number, otherwise it will be an Array of
         *     Numbers containing the element's paddings. The numbers are
         *     arranged in the following order: top, right, bottom, left.
         */

        var valueInPixels,
            values;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        if (TP.isEmpty(aSide)) {
            return TP.raise(this, 'TP.sig.InvalidParameter');
        }

        //  Set the initial value to 0.
        valueInPixels = 0;

        try {
            if (TP.isEmpty(aSide)) {
                values = TP.elementGetStyleValuesInPixels(
                            anElement,
                            TP.ac('paddingTop', 'paddingRight',
                                    'paddingBottom', 'paddingLeft'),
                            wantsTransformed);

                return values;

            }

            //  Switch on the supplied side.
            switch (aSide) {
                case TP.TOP:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                                anElement,
                                                'paddingTop',
                                                wantsTransformed);
                        break;

                case TP.RIGHT:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                                anElement,
                                                'paddingRight',
                                                wantsTransformed);
                        break;

                case TP.BOTTOM:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                                anElement,
                                                'paddingBottom',
                                                wantsTransformed);
                        break;

                case TP.LEFT:

                        valueInPixels = TP.elementGetStyleValueInPixels(
                                                anElement,
                                                'paddingLeft',
                                                wantsTransformed);
                        break;

                default:
                        break;
            }
        } catch (e) {
            //  valueInPixels is already set to 0. Nothing to do here.
            //  empty
        }

        return valueInPixels;
    },
    TP.DEFAULT,
    function(anElement, aSide, wantsTransformed) {

        /**
         * @method elementGetPaddingInPixels
         * @summary Returns the element's padding in pixels.
         * @param {HTMLElement} anElement The element to retrieve the padding in
         *     pixels for.
         * @param {String} aSide The side the padding should be computed from.
         *     This should be one of the following TIBET constants: TP.TOP
         *     TP.RIGHT TP.BOTTOM TP.LEFT or it can be empty which means that
         *     values for all sides will be returned.
         * @param {Boolean} wantsTransformed An optional parameter that
         *     determines whether to return 'transformed' values if the
         *     element has been transformed with a CSS transformation. The
         *     default is false.
         * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter,
         *         TP.sig.InvalidStyle
         * @returns {Number|Array} The element's padding in pixels. If a side is
         *     supplied, this will be a Number, otherwise it will be an Array of
         *     Numbers containing the element's paddings. The numbers are
         *     arranged in the following order: top, right, bottom, left.
         */

        var computedStyle,

            pixelFunc,

            valueInPixels,
            valuesInPixels;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        if (TP.isEmpty(aSide)) {
            return TP.raise(this, 'TP.sig.InvalidParameter');
        }

        //  Grab the computed style for the element
        if (TP.notValid(computedStyle =
                        TP.elementGetComputedStyleObj(anElement))) {
            return TP.raise(this, 'TP.sig.InvalidStyle');
        }

        //  Define a reusable helper Function that will avoid repetition below.
        pixelFunc = function(cssName) {
            var pixelVal;

            pixelVal = computedStyle.getPropertyCSSValue(cssName).
                                    getFloatValue(CSSPrimitiveValue.CSS_PX);


            if (TP.isTrue(wantsTransformed)) {
                pixelVal = TP.elementTransformCSSPixelValue(
                                                    anElement,
                                                    pixelVal,
                                                    cssName.asDOMName());
            }

            return pixelVal;
        };

        //  Set the initial value to 0.
        valueInPixels = 0;

        try {
            if (TP.isEmpty(aSide)) {
                valuesInPixels = TP.ac();

                valuesInPixels.push(pixelFunc('padding-top'));
                valuesInPixels.push(pixelFunc('padding-right'));
                valuesInPixels.push(pixelFunc('padding-left'));
                valuesInPixels.push(pixelFunc('padding-bottom'));

                return valuesInPixels;
            }

            //  Switch on the supplied side.
            switch (aSide) {
                case TP.TOP:

                    valueInPixels = pixelFunc('padding-top');

                    break;

                case TP.RIGHT:

                    valueInPixels = pixelFunc('padding-right');

                    break;

                case TP.BOTTOM:

                    valueInPixels = pixelFunc('padding-bottom');

                    break;

                case TP.LEFT:

                    valueInPixels = pixelFunc('padding-left');

                    break;

                default:
                        break;
            }
        } catch (e) {
            //  valueInPixels is already set to 0. Nothing to do here.
            //  empty
        }

        return valueInPixels;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetTransformMatrix',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(anElement, wants2DMatrix) {
        /**
         * @method elementGetTransformMatrix
         * @summary Gets the transformation matrix of the element specified.
         * @description Note that this method will, by default, return a 4x4
         *     matrix suitable for use with CSS 3D transforms. By passing true
         *     to wants2DMatrix, a 3x2 matrix suitable for use by CSS 2D
         *     transforms will be returned.
         * @param {Element} anElement The element to get the transformation
         *     matrix from.
         * @param {Boolean} wants2DMatrix An optional parameter that tells the
         *     method whether or not to return a 3x2 matrix for use with CSS 2D
         *     transforms. The default is false.
         * @exception TP.sig.InvalidElement,TP.sig.InvalidStyle
         * @returns {Array} The matrix expressed as an Array of Arrays.
         */

        var computedStyle,

            val,
            matrix;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        //  Grab the computed style for the element
        if (TP.notValid(computedStyle =
                        TP.elementGetComputedStyleObj(anElement))) {
            return TP.raise(this, 'TP.sig.InvalidStyle');
        }

        if (TP.isValid(val = computedStyle.MozTransform)) {

            matrix = TP.matrixFromCSSString(val, wants2DMatrix);
        }

        return matrix;
    },
    'trident',
    function(anElement, wants2DMatrix) {
        /**
         * @method elementGetTransformMatrix
         * @summary Gets the transformation matrix of the element specified.
         * @description Note that this method will, by default, return a 4x4
         *     matrix suitable for use with CSS 3D transforms. By passing true
         *     to wants2DMatrix, a 3x2 matrix suitable for use by CSS 2D
         *     transforms will be returned.
         * @param {Element} anElement The element to get the transformation
         *     matrix from.
         * @param {Boolean} wants2DMatrix An optional parameter that tells the
         *     method whether or not to return a 3x2 matrix for use with CSS 2D
         *     transforms. The default is false.
         * @exception TP.sig.InvalidElement,TP.sig.InvalidStyle
         * @returns {Array} The matrix expressed as an Array of Arrays.
         */

        var computedStyle,

            val,
            matrix;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        //  Grab the computed style for the element
        if (TP.notValid(computedStyle =
                        TP.elementGetComputedStyleObj(anElement))) {
            return TP.raise(this, 'TP.sig.InvalidStyle');
        }

        if (TP.isValid(val = computedStyle.msTransform)) {

            matrix = TP.matrixFromCSSString(val, wants2DMatrix);
        }

        return matrix;
    },
    'webkit',
    function(anElement, wants2DMatrix) {
        /**
         * @method elementGetTransformMatrix
         * @summary Gets the transformation matrix of the element specified.
         * @description Note that this method will, by default, return a 4x4
         *     matrix suitable for use with CSS 3D transforms. By passing true
         *     to wants2DMatrix, a 3x2 matrix suitable for use by CSS 2D
         *     transforms will be returned.
         * @param {Element} anElement The element to get the transformation
         *     matrix from.
         * @param {Boolean} wants2DMatrix An optional parameter that tells the
         *     method whether or not to return a 3x2 matrix for use with CSS 2D
         *     transforms. The default is false.
         * @exception TP.sig.InvalidElement,TP.sig.InvalidStyle
         * @returns {Array} The matrix expressed as an Array of Arrays.
         */

        var computedStyle,

            val,
            matrix;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        //  Grab the computed style for the element
        if (TP.notValid(computedStyle =
                        TP.elementGetComputedStyleObj(anElement))) {
            return TP.raise(this, 'TP.sig.InvalidStyle');
        }

        if (TP.isValid(val = computedStyle.WebkitTransform)) {

            matrix = TP.matrixFromCSSString(val, wants2DMatrix);
        }

        return matrix;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGlobalToLocalXY',
TP.hc(
    'test',
    'webkit',
    'true',
    function(anElement, x, y) {

        /**
         * @method elementGlobalToLocalXY
         * @summary Returns the 'element local' point taking into account any
         *     CSS transform of the element specified.
         * @param {Element} anElement The element to use the transformation
         *     from.
         * @param {Number} x The X coordinate to use to compute the X from. This
         *     should be specified in 'page' coordinates.
         * @param {Number} y The Y coordinate to use to compute the Y from. This
         *     should be specified in 'page' coordinates.
         * @exception TP.sig.InvalidElement
         * @returns {Array} An ordered pair where the first item is the X
         *     coordinate and the second item is the Y coordinate.
         */

        var newPoint;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        newPoint = TP.nodeGetWindow(anElement).
                        webkitConvertPointFromPageToNode(
                                anElement,
                                new WebKitPoint(x, y));

        return TP.ac(parseFloat((newPoint.x || 0).toFixed(1)),
                     parseFloat((newPoint.y || 0).toFixed(1)));
    },
    TP.DEFAULT,
    function(anElement, x, y) {

        /**
         * @method elementGlobalToLocalXY
         * @summary Returns the 'element local' point taking into account any
         *     CSS transform of the element specified.
         * @param {Element} anElement The element to use the transformation
         *     from.
         * @param {Number} x The X coordinate to use to compute the X from. This
         *     should be specified in 'page' coordinates.
         * @param {Number} y The Y coordinate to use to compute the Y from. This
         *     should be specified in 'page' coordinates.
         * @exception TP.sig.InvalidElement
         * @returns {Array} An ordered pair where the first item is the X
         *     coordinate and the second item is the Y coordinate.
         */

        var win,

            a,

            newX,
            newY;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        /*
         *  cx = a11 a12 a14   x
         *  cy = a21 a22 a24   y
         *   1 =   0   0   1   1
         */

        //  NB: This algorithm does *not* take into account any 3D transforms,
        //  like perspective...

        win = TP.nodeGetWindow(anElement);

        a = TP.translateMatrix(
                        TP.elementGetComputedTransformMatrix(anElement),
                        win.pageXOffset, win.pageYOffset, 0);

        newX = ((x - a[0][3]) * a[1][1] - (y - a[1][3]) * a[0][1]) /
                            (a[0][0] * a[1][1] - a[0][1] * a[1][0]);

        newY = (a[0][0] * (y - a[1][3]) - a[1][0] * (x - a[0][3])) /
                            (a[0][0] * a[1][1] - a[0][1] * a[1][0]);

        return TP.ac(parseFloat((newX || 0).toFixed(1)),
                     parseFloat((newY || 0).toFixed(1)));
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementLocalToGlobalXY',
TP.hc(
    'test',
    'webkit',
    'true',
    function(anElement, x, y) {

        /**
         * @method elementLocalToGlobalXY
         * @summary Returns the 'page' point taking into account any CSS
         *     transform of the element specified.
         * @param {Element} anElement The element to use the transformation
         *     from.
         * @param {Number} x The X coordinate to use to compute the X from. This
         *     should be specified in 'element local' coordinates.
         * @param {Number} y The Y coordinate to use to compute the Y from. This
         *     should be specified in 'element local' coordinates.
         * @exception TP.sig.InvalidElement
         * @returns {Array} An ordered pair where the first item is the X
         *     coordinate and the second item is the Y coordinate.
         */

        var newPoint;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        newPoint = TP.nodeGetWindow(anElement).
                        webkitConvertPointFromNodeToPage(
                                anElement,
                                new WebKitPoint(x, y));

        return TP.ac(parseFloat((newPoint.x || 0).toFixed(1)),
                     parseFloat((newPoint.y || 0).toFixed(1)));
    },
    TP.DEFAULT,
    function(anElement, x, y) {

        /**
         * @method elementLocalToGlobalXY
         * @summary Returns the 'page' point taking into account any CSS
         *     transform of the element specified.
         * @param {Element} anElement The element to use the transformation
         *     from.
         * @param {Number} x The X coordinate to use to compute the X from. This
         *     should be specified in 'element local' coordinates.
         * @param {Number} y The Y coordinate to use to compute the Y from. This
         *     should be specified in 'element local' coordinates.
         * @exception TP.sig.InvalidElement
         * @returns {Array} An ordered pair where the first item is the X
         *     coordinate and the second item is the Y coordinate.
         */

        TP.raise(this, 'TP.sig.UnsupportedOperation');

        return TP.ac();
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetTransform',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(anElement, aTransformStr) {

        /**
         * @method elementSetTransform
         * @summary Sets the CSS transform of the element specified using the
         *     supplied String (which should conform to one of the values
         *     specified in the CSS Transform specification).
         * @param {Element} anElement The element to set the transformation on.
         * @param {String} aTransformStr The value to set on the supplied
         *     Element as its CSS Transform.
         * @exception TP.sig.InvalidElement
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        TP.elementGetStyleObj(anElement).MozTransform = aTransformStr;

        return;
    },
    'trident',
    function(anElement, aTransformStr) {

        /**
         * @method elementSetTransform
         * @summary Sets the CSS transform of the element specified using the
         *     supplied String (which should conform to one of the values
         *     specified in the CSS Transform specification).
         * @param {Element} anElement The element to set the transformation on.
         * @param {String} aTransformStr The value to set on the supplied
         *     Element as its CSS Transform.
         * @exception TP.sig.InvalidElement
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        TP.elementGetStyleObj(anElement).msTransform = aTransformStr;

        return;
    },
    'webkit',
    function(anElement, aTransformStr) {

        /**
         * @method elementSetTransform
         * @summary Sets the CSS transform of the element specified using the
         *     supplied String (which should conform to one of the values
         *     specified in the CSS Transform specification).
         * @param {Element} anElement The element to set the transformation on.
         * @param {String} aTransformStr The value to set on the supplied
         *     Element as its CSS Transform.
         * @exception TP.sig.InvalidElement
         */

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        TP.elementGetStyleObj(anElement).WebkitTransform = aTransformStr;

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetTransformOrigin',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(anElement, xValue, yValue) {

        /**
         * @method elementSetTransformOrigin
         * @summary Sets the transformation origin of the element specified
         *     using the supplied X and Y values.
         * @description The X and Y values supplied to this method can be any
         *     CSS 'length' value (i.e. a number with a unit or a percentage).
         *     If a Number is supplied, 'px' is assumed.
         * @param {Element} anElement The element to set the transformation
         *     origin on.
         * @param {Number|String} xValue The 'X value' to set the transformation
         *     origin to.
         * @param {Number|String} yValue The 'Y value' to set the transformation
         *     origin to.
         * @exception TP.sig.InvalidElement
         */

        var xVal,
            yVal;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        xVal = TP.isNumber(xValue) ? xValue + 'px' : xValue;
        yVal = TP.isNumber(yValue) ? yValue + 'px' : yValue;

        TP.elementGetStyleObj(anElement).MozTransformOrigin =
                                                TP.join(xVal, ' ', yVal);

        return;
    },
    'trident',
    function(anElement, xValue, yValue) {

        /**
         * @method elementSetTransformOrigin
         * @summary Sets the transformation origin of the element specified
         *     using the supplied X and Y values.
         * @description The X and Y values supplied to this method can be any
         *     CSS 'length' value (i.e. a number with a unit or a percentage).
         *     If a Number is supplied, 'px' is assumed.
         * @param {Element} anElement The element to set the transformation
         *     origin on.
         * @param {Number|String} xValue The 'X value' to set the transformation
         *     origin to.
         * @param {Number|String} yValue The 'Y value' to set the transformation
         *     origin to.
         * @exception TP.sig.InvalidElement
         */

        var xVal,
            yVal;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        xVal = TP.isNumber(xValue) ? xValue + 'px' : xValue;
        yVal = TP.isNumber(yValue) ? yValue + 'px' : yValue;

        TP.elementGetStyleObj(anElement).msTransformOrigin =
                                                TP.join(xVal, ' ', yVal);

        return;
    },
    'webkit',
    function(anElement, xValue, yValue) {

        /**
         * @method elementSetTransformOrigin
         * @summary Sets the transformation origin of the element specified
         *     using the supplied X and Y values.
         * @description The X and Y values supplied to this method can be any
         *     CSS 'length' value (i.e. a number with a unit or a percentage).
         *     If a Number is supplied, 'px' is assumed.
         * @param {Element} anElement The element to set the transformation
         *     origin on.
         * @param {Number|String} xValue The 'X value' to set the transformation
         *     origin to.
         * @param {Number|String} yValue The 'Y value' to set the transformation
         *     origin to.
         * @exception TP.sig.InvalidElement
         */

        var xVal,
            yVal;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        xVal = TP.isNumber(xValue) ? xValue + 'px' : xValue;
        yVal = TP.isNumber(yValue) ? yValue + 'px' : yValue;

        TP.elementGetStyleObj(anElement).WebkitTransformOrigin =
                                                TP.join(xVal, ' ', yVal);

        return;
    }
));

//  ------------------------------------------------------------------------
//  WINDOW PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('windowBuildFunctionFor',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(aWindow, aFunction) {

        /**
         * @method windowBuildFunctionFor
         * @summary Builds a 'wrapper' function for the supplied Function in
         *     the context of the supplied Window. This is normally used when
         *     installing callback Functions into code that TIBET has no control
         *     over and that is executing in another window or frame.
         * @description Trident requires this to avoid throwing exceptions on
         *     Functions that are built in the TIBET code frame and then vended
         *     to another window and then has either 'call' or 'apply' called on
         *     it. Trident will throw an exception in this case. Gecko/Webkit
         *     does not and this function does nothing on those browsers.
         * @param {Window} aWindow The window to create the function in.
         * @param {Function} aFunction The function to build a wrapper for.
         * @exception TP.sig.InvalidWindow,TP.sig.InvalidFunction
         * @returns {Function} The wrapper function built with aWindow as its
         *     context.
         */

        //  On Gecko, this does nothing.
        return aFunction;
    },
    'trident',
    function(aWindow, aFunction) {

        /**
         * @method windowBuildFunctionFor
         * @summary Builds a 'wrapper' function for the supplied Function in
         *     the context of the supplied Window. This is normally used when
         *     installing callback Functions into code that TIBET has no control
         *     over and that is executing in another window or frame.
         * @description Trident requires this to avoid throwing exceptions on
         *     Functions that are built in the TIBET code frame and then vended
         *     to another window and then has either 'call' or 'apply' called on
         *     it. Trident will throw an exception in this case. Gecko/Webkit
         *     does not and this function does nothing on those browsers.
         * @param {Window} aWindow The window to create the function in.
         * @param {Function} aFunction The function to build a wrapper for.
         * @exception TP.sig.InvalidWindow,TP.sig.InvalidFunction
         * @returns {Function} The wrapper function built with aWindow as its
         *     context.
         */

        if (!TP.isWindow(aWindow)) {
            return TP.raise(this, 'TP.sig.InvalidWindow');
        }

        if (!TP.isCallable(aFunction)) {
            return TP.raise(this, 'TP.sig.InvalidFunction');
        }

        // TODO: 'window.$$newinst' used to be arguments.callee. verify this
        // still works :) In fact, with eval() changing to be globally scoped
        // this entire thing may not work anyway.
        /* eslint-disable no-eval */
        eval(
            'aWindow.$$newinst = function () {window.$$newinst.$realFunc(' +
            TP.sys.$buildArgString(0, aFunction.getArity() - 1) +
            ')}');
        /* eslint-enable no-eval */

        aWindow.$$newinst.$realFunc = aFunction;

        return aWindow.$$newinst;
    },
    'webkit',
    function(aWindow, aFunction) {

        /**
         * @method windowBuildFunctionFor
         * @summary Builds a 'wrapper' function for the supplied Function in
         *     the context of the supplied Window. This is normally used when
         *     installing callback Functions into code that TIBET has no control
         *     over and that is executing in another window or frame.
         * @description Trident requires this to avoid throwing exceptions on
         *     Functions that are built in the TIBET code frame and then vended
         *     to another window and then has either 'call' or 'apply' called on
         *     it. Trident will throw an exception in this case. Gecko/Webkit
         *     does not and this function does nothing on those browsers.
         * @param {Window} aWindow The window to create the function in.
         * @param {Function} aFunction The function to build a wrapper for.
         * @exception TP.sig.InvalidWindow,TP.sig.InvalidFunction
         * @returns {Function} The wrapper function built with aWindow as its
         *     context.
         */

        //  On Webkit, this does nothing.
        return aFunction;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('windowConstructObject',
TP.hc(
    'test',
    'trident',
    'true',
    function(aWindow, objectName) {

        /**
         * @method windowConstructObject
         * @summary Constructs an object in another Window, using that the
         *     named object as the constructor *in the target Window* to create
         *     the object. Note that this function also passes along any
         *     additional arguments to this function to the constructor.
         * @param {Window} aWindow The window to create the object in.
         * @param {String} objectName The 'type name' of the object to
         *     construct.
         * @exception TP.sig.InvalidWindow
         * @returns {Object}
         */

        if (!TP.isWindow(aWindow)) {
            return TP.raise(this, 'TP.sig.InvalidWindow');
        }

        //  Set a slot on the target window that contains our arguments,
        //  such that the eval() in the target window can pick it up.
        aWindow.creationArgs = arguments;

        //  Switching on the arguments length, create a new object, using
        //  the supplied object name, by evaling the code that puts a slot
        //  on the context window.
        /* eslint-disable no-eval */
        switch (arguments.length) {
            case 2:
                eval('aWindow.$$newinst = new ' + objectName + '()');
                break;
            case 3:
                eval('aWindow.$$newinst = new ' + objectName + '(window.creationArgs[2])');
                break;
            case 4:
                eval('aWindow.$$newinst = new ' + objectName + '(window.creationArgs[2], window.creationArgs[3])');
                break;
            case 5:
                eval('aWindow.$$newinst = new ' + objectName + '(window.creationArgs[2], window.creationArgs[3], window.creationArgs[4])');
                break;
            case 6:
                eval('aWindow.$$newinst = new ' + objectName + '(window.creationArgs[2], window.creationArgs[3], window.creationArgs[4], window.creationArgs[5])');
                break;
            case 7:
                eval('aWindow.$$newinst = new ' + objectName + '(window.creationArgs[2], window.creationArgs[3], window.creationArgs[4], window.creationArgs[5], window.creationArgs[6])');
                break;
            case 8:
                eval('aWindow.$$newinst = new ' + objectName + '(window.creationArgs[2], window.creationArgs[3], window.creationArgs[4], window.creationArgs[5], window.creationArgs[6], window.creationArgs[7])');
                break;
            case 9:
                eval('aWindow.$$newinst = new ' + objectName + '(window.creationArgs[2], window.creationArgs[3], window.creationArgs[4], window.creationArgs[5], window.creationArgs[6], window.creationArgs[7], window.creationArgs[8])');
                break;
            default:
                eval('aWindow.$$newinst = new ' + objectName + '(' +
                    TP.sys.$buildArgString(
                        2, arguments.length, 'window.creationArgs') + ')');
                break;
        }
        /* eslint-enable no-eval */

        //  Set the slot used to make our arguments available to the eval()
        //  in the target window back to null.
        aWindow.creationArgs = null;

        return aWindow.$$newinst;
    },
    TP.DEFAULT,
    function(aWindow, objectName) {

        /**
         * @method windowConstructObject
         * @summary Constructs an object in another Window, using that the
         *     named object as the constructor *in the target Window* to create
         *     the object. Note that this function also passes along any
         *     additional arguments to this function to the constructor.
         * @param {Window} aWindow The window to create the object in.
         * @param {String} objectName The 'type name' of the object to
         *     construct.
         * @exception TP.sig.InvalidWindow
         * @returns {Object}
         */

        var constructorObj,
            $$newinst;

        if (!TP.isWindow(aWindow)) {
            return TP.raise(this, 'TP.sig.InvalidWindow');
        }

        constructorObj = aWindow[objectName];

        if (TP.notValid(constructorObj)) {
            return null;
        }

        //  we start by using the built-in constructor for any arguments so
        //  behavior is consistent with native JS, and then we try parsing
        //  on our own
        /* eslint-disable no-eval, new-cap */
        switch (arguments.length) {
            case 2:
                $$newinst = new constructorObj();
                break;
            case 3:
                $$newinst = new constructorObj(arguments[2]);
                break;
            case 4:
                $$newinst = new constructorObj(arguments[2], arguments[3]);
                break;
            case 5:
                $$newinst = new constructorObj(arguments[2], arguments[3],
                                                arguments[4]);
                break;
            case 6:
                $$newinst = new constructorObj(arguments[2], arguments[3],
                                                arguments[4], arguments[5]);
                break;
            case 7:
                $$newinst = new constructorObj(arguments[2], arguments[3],
                                                arguments[4], arguments[5],
                                                arguments[6]);
                break;
            case 8:
                $$newinst = new constructorObj(arguments[2], arguments[3],
                                                arguments[4], arguments[5],
                                                arguments[6], arguments[7]);
                break;
            case 9:
                $$newinst = new constructorObj(arguments[2], arguments[3],
                                                arguments[4], arguments[5],
                                                arguments[6], arguments[7],
                                                arguments[8]);
                break;
            default:
                eval('$$newinst = new constructorObj(' +
                    TP.sys.$buildArgString(2, arguments.length) + ');');
                break;
        }
        /* eslint-enable no-eval, new-cap */

        return $$newinst;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('windowInstallOnBeforeUnloadHook',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(aWindow, aFunction) {

        /**
         * @method windowInstallOnBeforeUnloadHook
         * @summary Installs the 'onbeforeunload' hook onto the supplied
         *     Window. This is an event handling function that manages whether
         *     or not the user can close or unload a window without being
         *     prompted.
         * @param {Window} aWindow The window to install the event hook function
         *     onto.
         * @param {Function} aFunction The onbeforeunload event handler.
         * @exception TP.sig.InvalidWindow
         */

        if (!TP.isWindow(aWindow)) {
            return TP.raise(this, 'TP.sig.InvalidWindow');
        }

        //  On Mozilla, we don't place this property on any other Window than
        //  the top-level Window. There used to be a problem with this firing
        //  multiple times if multiple frames were instrumented with this hook.
        if (aWindow.name !== top.name) {
            return;
        }

        //  Install the onbeforeunload handler.
        aWindow.onbeforeunload = function() {

            //  This hook allows the user to cancel the navigation away from
            //  a page or the closing of a browser window. This method
            //  returns a message String that tells the user to use their
            //  TIBET application's Quit functionality, if available.

            //  On IE once the 'onbeforeunload' function is installed, it
            //  cannot be uninstalled. So we set an attribute on the
            //  window's document's body (called 'allowUnload') to 'true' to
            //  allow the window to unload without seeing the dialog box. If
            //  this flag is defined and is true, we just return null from
            //  this function, which causes the browser to not show the
            //  dialog box.

            //  If there is no body, there is nothing to protect, so we can
            //  just exit here.
            if (TP.notValid(TP.documentGetBody(aWindow.document))) {
                return;
            }

            if (TP.elementGetAttribute(TP.documentGetBody(aWindow.document),
                                        'allowUnload') === 'true') {
                return;
            }

            return TP.join(
                    'You should use your application\'s Back/Exit ',
                    'features (if provided) to navigate or quit.\n\n',
                    'You may lose unsaved data if you click OK !');
        };
    },
    'trident',
    function(aWindow, aFunction) {

        /**
         * @method windowInstallOnBeforeUnloadHook
         * @summary Installs the 'onbeforeunload' hook onto the supplied
         *     Window. This is an event handling function that manages whether
         *     or not the user can close or unload a window without being
         *     prompted.
         * @param {Window} aWindow The window to install the event hook function
         *     onto.
         * @param {Function} aFunction The onbeforeunload event handler.
         * @exception TP.sig.InvalidWindow
         */

        if (!TP.isWindow(aWindow)) {
            return TP.raise(this, 'TP.sig.InvalidWindow');
        }

        //  On IE, we don't place this property on any other Window than
        //  the top-level Window.
        if (aWindow.name !== top.name) {
            return;
        }

        //  Install the onbeforeunload handler.
        aWindow.addEventListener(
        'beforeunload',
        function() {

            //  This hook allows the user to cancel the navigation away from
            //  a page or the closing of a browser window. This method
            //  returns a message String that tells the user to use their
            //  TIBET application's Quit functionality, if available.

            //  On IE once the 'onbeforeunload' function is installed, it
            //  cannot be uninstalled. So we set an attribute on the
            //  window's document's body (called 'allowUnload') to 'true' to
            //  allow the window to unload without seeing the dialog box. If
            //  this flag is defined and is true, we just return null from
            //  this function, which causes the browser to not show the
            //  dialog box.

            //  If there is no body, there is nothing to protect, so we can
            //  just exit here.
            if (TP.notValid(TP.documentGetBody(aWindow.document))) {
                return;
            }

            if (TP.elementGetAttribute(TP.documentGetBody(aWindow.document),
                                        'allowUnload') === 'true') {
                return;
            }

            aWindow.event.returnValue = TP.join(
                    'You should use your application\'s Back/Exit ',
                    'features (if provided) to navigate or quit.\n\n',
                    'You may lose unsaved data if you click OK !');

            return;
        },
        false);
    },
    'webkit',
    function(aWindow, aFunction) {

        /**
         * @method windowInstallOnBeforeUnloadHook
         * @summary Installs the 'onbeforeunload' hook onto the supplied
         *     Window. This is an event handling function that manages whether
         *     or not the user can close or unload a window without being
         *     prompted.
         * @param {Window} aWindow The window to install the event hook function
         *     onto.
         * @param {Function} aFunction The onbeforeunload event handler.
         * @exception TP.sig.InvalidWindow
         */

        if (!TP.isWindow(aWindow)) {
            return TP.raise(this, 'TP.sig.InvalidWindow');
        }

        //  On Webkit we don't set up a hook for any window other than the
        //  top-level one.
        if (aWindow.name !== top.name) {
            return;
        }

        //  Install the onbeforeunload handler.
        aWindow.onbeforeunload = function() {

            //  This hook allows the user to cancel the navigation away
            //  from a page or the closing of a browser window. This method
            //  returns a message String that tells the user to use their
            //  TIBET application's Quit functionality, if available.

            //  On IE once the 'onbeforeunload' function is installed, it
            //  cannot be uninstalled. So we set an attribute on the
            //  window's document's body (called 'allowUnload') to 'true' to
            //  allow the window to unload without seeing the dialog box. If
            //  this flag is defined and is true, we just return null from
            //  this function, which causes the browser to not show the
            //  dialog box.

            //  If there is no body, there is nothing to protect, so we can
            //  just exit here.
            if (TP.notValid(TP.documentGetBody(aWindow.document))) {
                return;
            }

            if (TP.elementGetAttribute(TP.documentGetBody(aWindow.document),
                                        'allowUnload') === 'true') {
                return;
            }

            if (TP.$browser === 'chrome') {
                return TP.join(
                        'You should use your application\'s Back/Exit ',
                        'features (if provided) to navigate or quit.\n\n',
                        'You may lose unsaved data if you click ',
                        '"Leave this page" !');
            } else {
                return TP.join(
                        'You should use your application\'s Back/Exit ',
                        'features (if provided) to navigate or quit.\n\n',
                        'You may lose unsaved data if you click "OK" !');
            }
        };

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('windowStopLoading',
TP.hc(
    'test',
    'trident',
    'true',
    function(aWindow) {

        /**
         * @method windowStopLoading
         * @summary Stops the window from continuing to load content. Usually
         *     called when the window is currently loading via a
         *     'window.location' change.
         * @param {Window} aWindow The window to stop loading content.
         * @exception TP.sig.InvalidWindow
         */

        if (!TP.isWindow(aWindow)) {
            return TP.raise(this, 'TP.sig.InvalidWindow');
        }

        return aWindow.document.execCommand('Stop');
    },
    TP.DEFAULT,
    function(aWindow) {

        /**
         * @method windowStopLoading
         * @summary Stops the window from continuing to load content. Usually
         *     called when the window is currently loading via a
         *     'window.location' change.
         * @param {Window} aWindow The window to stop loading content.
         * @exception TP.sig.InvalidWindow
         */

        if (!TP.isWindow(aWindow)) {
            return TP.raise(this, 'TP.sig.InvalidWindow');
        }

        return aWindow.stop();
    }
));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
