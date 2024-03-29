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

/* global WebKitPoint:false
*/

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('documentConstructIFrameElement',
TP.hc(
    'test',
    'webkit',
    'true',
    function(aDocument, forcedMIMEType, iframeID) {

        /**
         * @method documentConstructIFrameElement
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
         *     TP.ietf.mime.HTML TP.ietf.mime.XHTML.
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
                docMIMEType = TP.ietf.mime.HTML;
            } else {
                docMIMEType = TP.ietf.mime.XHTML;
            }
        }

        if (docMIMEType === TP.ietf.mime.HTML) {
            newIFrameElement = TP.documentConstructElement(aDocument,
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
            newIFrameElement = TP.documentConstructElement(aDocument,
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

            newIFrameElement.contentWindow = TP.nodeGetWindow(iframeDoc);

            if (TP.isString(iframeID)) {
                TP.nodeGetWindow(aDocument).frames[iframeID] =
                    TP.nodeGetWindow(iframeDoc);
            }
        }

        return newIFrameElement;
    },
    TP.DEFAULT,
    function(aDocument, forcedMIMEType, iframeID) {

        /**
         * @method documentConstructIFrameElement
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
         *     TP.ietf.mime.HTML TP.ietf.mime.XHTML.
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
                docMIMEType = TP.ietf.mime.HTML;
            } else {
                docMIMEType = TP.ietf.mime.XHTML;
            }
        }

        if (docMIMEType === TP.ietf.mime.HTML) {
            newIFrameElement = TP.documentConstructElement(aDocument,
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

            newIFrameElement = TP.documentConstructElement(aDocument,
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

            newIFrameElement.contentWindow = TP.nodeGetWindow(iframeDoc);

            if (TP.isString(iframeID)) {
                TP.nodeGetWindow(aDocument).frames[iframeID] =
                    TP.nodeGetWindow(iframeDoc);
            }
        }

        return newIFrameElement;
    }
));

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
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
         * @exception TP.sig.InvalidElement
         * @exception TP.sig.InvalidStyleDeclaration
         * @returns {Number|Number[]} The element's border in pixels. If a side
         *     is supplied, this will be a Number, otherwise it will be an
         *     Array of Numbers containing the element's borders. The numbers
         *     are arranged in the following order: top, right, bottom, left.
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
            return TP.raise(this, 'TP.sig.InvalidStyleDeclaration');
        }

        //  Define a reusable helper Function that will avoid repetition below.
        pixelFunc = function(cssName) {
            var pixelVal;

            pixelVal = TP.elementGetPixelValue(
                            anElement,
                            computedStyle.getPropertyValue(cssName),
                            cssName.asDOMName(),
                            wantsTransformed);

            return pixelVal;
        };

        //  Set the initial value to 0.
        valueInPixels = 0;

        try {
            if (TP.isEmpty(aSide)) {
                valuesInPixels = TP.ac();

                valuesInPixels.push(pixelFunc('border-top-width'));
                valuesInPixels.push(pixelFunc('border-right-width'));
                valuesInPixels.push(pixelFunc('border-bottom-width'));
                valuesInPixels.push(pixelFunc('border-left-width'));

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
         * @exception TP.sig.InvalidElement
         * @exception TP.sig.InvalidParameter
         * @exception TP.sig.InvalidStyleDeclaration
         * @returns {Number|Number[]} The element's margin in pixels. If a side
         *     is supplied, this will be a Number, otherwise it will be an
         *     Array of Numbers containing the element's margins. The numbers
         *     are arranged in the following order: top, right, bottom, left.
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
            return TP.raise(this, 'TP.sig.InvalidStyleDeclaration');
        }

        //  Define a reusable helper Function that will avoid repetition below.
        pixelFunc = function(cssName) {
            var pixelVal;

            pixelVal = TP.elementGetPixelValue(
                            anElement,
                            computedStyle.getPropertyValue(cssName),
                            cssName.asDOMName(),
                            wantsTransformed);

            return pixelVal;
        };

        //  Set the initial value to 0.
        valueInPixels = 0;

        try {
            if (TP.isEmpty(aSide)) {

                valuesInPixels = TP.ac();

                valuesInPixels.push(pixelFunc('margin-top'));
                valuesInPixels.push(pixelFunc('margin-right'));
                valuesInPixels.push(pixelFunc('margin-bottom'));
                valuesInPixels.push(pixelFunc('margin-left'));

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

TP.definePrimitive('elementGetPaddingInPixels',
TP.hc(
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
         * @exception TP.sig.InvalidElement
         * @exception TP.sig.InvalidParameter
         * @exception TP.sig.InvalidStyleDeclaration
         * @returns {Number|Number[]} The element's padding in pixels. If a side
         *     is supplied, this will be a Number, otherwise it will be an
         *     Array of Numbers containing the element's paddings. The numbers
         *     are arranged in the following order: top, right, bottom, left.
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
            return TP.raise(this, 'TP.sig.InvalidStyleDeclaration');
        }

        //  Define a reusable helper Function that will avoid repetition below.
        pixelFunc = function(cssName) {
            var pixelVal;

            pixelVal = TP.elementGetPixelValue(
                            anElement,
                            computedStyle.getPropertyValue(cssName),
                            cssName.asDOMName(),
                            wantsTransformed);

            return pixelVal;
        };

        //  Set the initial value to 0.
        valueInPixels = 0;

        try {
            if (TP.isEmpty(aSide)) {
                valuesInPixels = TP.ac();

                valuesInPixels.push(pixelFunc('padding-top'));
                valuesInPixels.push(pixelFunc('padding-right'));
                valuesInPixels.push(pixelFunc('padding-bottom'));
                valuesInPixels.push(pixelFunc('padding-left'));

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
         * @exception TP.sig.InvalidElement
         * @exception TP.sig.InvalidStyleDeclaration
         * @returns {Number[][]} The matrix expressed as an Array of Arrays.
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
            return TP.raise(this, 'TP.sig.InvalidStyleDeclaration');
        }

        if (TP.isValid(val = computedStyle.MozTransform)) {

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
         * @exception TP.sig.InvalidElement
         * @exception TP.sig.InvalidStyleDeclaration
         * @returns {Number[][]} The matrix expressed as an Array of Arrays.
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
            return TP.raise(this, 'TP.sig.InvalidStyleDeclaration');
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
         * @returns {Number[]} An ordered pair where the first item is the X
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
         * @returns {Number[]} An ordered pair where the first item is the X
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

        a = TP.matrixTranslate(
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
         * @returns {Number[]} An ordered pair where the first item is the X
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
         * @returns {Number[]} An ordered pair where the first item is the X
         *     coordinate and the second item is the Y coordinate.
         */

        TP.raise(this, 'TP.sig.UnsupportedOperation');

        return TP.ac();
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
         * @param {Window} aWindow The window to create the function in.
         * @param {Function} aFunction The function to build a wrapper for.
         * @exception TP.sig.InvalidWindow
         * @exception TP.sig.InvalidFunction
         * @returns {Function} The wrapper function built with aWindow as its
         *     context.
         */

        //  On Gecko, this does nothing.
        return aFunction;
    },
    'webkit',
    function(aWindow, aFunction) {

        /**
         * @method windowBuildFunctionFor
         * @summary Builds a 'wrapper' function for the supplied Function in
         *     the context of the supplied Window. This is normally used when
         *     installing callback Functions into code that TIBET has no control
         *     over and that is executing in another window or frame.
         * @param {Window} aWindow The window to create the function in.
         * @param {Function} aFunction The function to build a wrapper for.
         * @exception TP.sig.InvalidWindow
         * @exception TP.sig.InvalidFunction
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
    function(aWindow) {

        /**
         * @method windowInstallOnBeforeUnloadHook
         * @summary Installs the 'onbeforeunload' hook onto the supplied
         *     Window. This is an event handling function that manages whether
         *     or not the user can close or unload a window without being
         *     prompted.
         * @param {Window} aWindow The window to install the event hook function
         *     onto.
         * @exception TP.sig.InvalidWindow
         */

        if (!TP.isWindow(aWindow)) {
            return TP.raise(this, 'TP.sig.InvalidWindow');
        }

        //  On Mozilla, we don't place this property on any other Window than
        //  the top-level Window. There used to be a problem with this firing
        //  multiple times if multiple frames were instrumented with this hook.
        if (aWindow.name !== TP.topWindow.name) {
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
            //  window's document's body (called 'unloadable') to 'true' to
            //  allow the window to unload without seeing the dialog box. If
            //  this flag is defined and is true, we just return null from
            //  this function, which causes the browser to not show the
            //  dialog box.

            //  If running in a Karma testing environment don't prompt, exit.
            if (aWindow[TP.sys.cfg('karma.slot', '__karma__')]) {
                return;
            }

            //  On Electron, we always just return, allowing the TIBET/Electron
            //  machinery to handle shutdown.
            if (TP.sys.cfg('boot.context') === 'electron') {
                return;
            }

            //  If there is no body, there is nothing to protect, so we can
            //  just exit here.
            if (TP.notValid(TP.documentGetBody(aWindow.document))) {
                return;
            }

            if (TP.elementGetAttribute(TP.documentGetBody(aWindow.document),
                                        'unloadable') === 'true') {
                return;
            }

            return TP.join(
                    'You should use your application\'s Back/Exit ',
                    'features (if provided) to navigate or quit.\n\n',
                    'You may lose unsaved data if you click OK !');
        };
    },
    'webkit',
    function(aWindow) {

        /**
         * @method windowInstallOnBeforeUnloadHook
         * @summary Installs the 'onbeforeunload' hook onto the supplied
         *     Window. This is an event handling function that manages whether
         *     or not the user can close or unload a window without being
         *     prompted.
         * @param {Window} aWindow The window to install the event hook function
         *     onto.
         * @exception TP.sig.InvalidWindow
         */

        if (!TP.isWindow(aWindow)) {
            return TP.raise(this, 'TP.sig.InvalidWindow');
        }

        //  On Webkit we don't set up a hook for any window other than the
        //  top-level one.
        if (aWindow.name !== TP.topWindow.name) {
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
            //  window's document's body (called 'unloadable') to 'true' to
            //  allow the window to unload without seeing the dialog box. If
            //  this flag is defined and is true, we just return null from
            //  this function, which causes the browser to not show the
            //  dialog box.

            //  If running in a Karma testing environment don't prompt, exit.
            if (aWindow[TP.sys.cfg('karma.slot', '__karma__')]) {
                return;
            }

            //  On Electron, we always just return, allowing the TIBET/Electron
            //  machinery to handle shutdown.
            if (TP.sys.cfg('boot.context') === 'electron') {
                return;
            }

            //  If there is no body, there is nothing to protect, so we can
            //  just exit here.
            if (TP.notValid(TP.documentGetBody(aWindow.document))) {
                return;
            }

            if (TP.elementGetAttribute(TP.documentGetBody(aWindow.document),
                                        'unloadable') === 'true') {
                return;
            }

            if (TP.sys.getBrowser() === 'chrome') {
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
