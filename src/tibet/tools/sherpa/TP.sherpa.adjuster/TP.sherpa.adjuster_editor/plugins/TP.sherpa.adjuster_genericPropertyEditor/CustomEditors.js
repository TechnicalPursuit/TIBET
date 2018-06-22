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
 * @type {TP.sherpa.adjuster_customPropertyEditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.defineSubtype(
'adjuster_customPropertyEditor');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.adjuster_customPropertyEditor.Type.defineMethod('computeResourceURI',
function(resource, mimeType, fallback) {

    /**
     * @method computeResourceURI
     * @summary Computes a resource URI using information including a resource
     *     "name" and mime type (for use in determining potential extensions).
     *     This routine is leveraged by getResourceURI-invoked methods which
     *     need to compute default file paths.
     * @param {String} resource The resource name. Typically template, style,
     *     style_{theme}, etc. but it could be essentially anything except the
     *     word 'resource' (since that would trigger a recursion).
     * @param {String} mimeType The mimeType for the resource being looked up.
     * @param {Boolean} [fallback] Whether or not to compute a fallback value
     *     if the computation returns an empty value (but not TP.NO_RESULT -
     *     those are considered non-empty).  Defaults to the value of
     *     'uri.<resource type>_fallback'.
     * @returns {String|TP.NO_RESULT|undefined} A properly computed URL in
     *     string form or TP.NO_RESULT if the receiver has specifically
     *     determined that it has no such resource.
     */

    return this.getSupertype().computeResourceURI(resource, mimeType, fallback);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.adjuster_customPropertyEditor.Inst.defineMethod(
'getGuidesRootElement',
function() {

    /**
     * @method getGuidesRootElement
     * @summary Returns the guides 'root element' (an SVG 'svg' element) that
     *     contain our guide content.
     * @returns {SVGSVGElement} The guides root element.
     */

    var toolsLayerElem,
        svgElem,

        str;

    //  Grab the common 'tools layer' that the Sherpa provides.
    toolsLayerElem = TP.bySystemId('Sherpa').getToolsLayer().getNativeNode();

    //  Then, make sure we can get the common 'svg' element that should contain
    //  all guide groups. If it's not there, try to create it.
    svgElem = TP.byCSSPath('> svg|svg', toolsLayerElem, true, false);
    if (!TP.isElement(svgElem)) {
        str = '<svg xmlns="' +
                    TP.w3.Xmlns.SVG +
                    '" width="100%" height="100%">' +
                '</svg>';
        svgElem = TP.elem(str);
        svgElem = TP.nodeAppendChild(toolsLayerElem, svgElem, false);
    }

    return svgElem;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_customPropertyEditor.Inst.defineMethod(
'getGuidesDefsElement',
function() {

    /**
     * @method getGuidesDefsElement
     * @summary Returns the guides 'definitions element' (an SVG 'defs' element)
     *     that contain common definitions for our guide content.
     * @returns {SVGDefsElement} The guides definitions element.
     */

    var svgElem,
        defsID,

        str,

        defsElem;

    //  Grab the guides root element - the definitions element should be a
    //  direct child of it.
    svgElem = this.getGuidesRootElement();

    //  Compute an ID that is based on our unique local ID.
    defsID = this.getLocalID() + '_guide_defs';

    //  Try to get the definitions element with that ID. If it's not there, try
    //  to create it.
    defsElem = TP.byCSSPath('> svg|defs#' + defsID, svgElem, true, false);
    if (!TP.isElement(defsElem)) {
        str = '<defs id="' + defsID + '" xmlns="' + TP.w3.Xmlns.SVG + '"/>';
        defsElem = TP.elem(str);
        defsElem = TP.nodeAppendChild(svgElem, defsElem, false);
    }

    return defsElem;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_customPropertyEditor.Inst.defineMethod(
'getGuidesGroupElement',
function() {

    /**
     * @method getGuidesGroupElement
     * @summary Returns the guides 'group element' (an SVG 'g' element) that
     *     group and contain our guide content.
     * @returns {SVGGElement} The guides group element.
     */

    var svgElem,
        groupID,

        str,

        groupElem;

    //  Grab the guides root element - the group element should be a direct
    //  child of it.
    svgElem = this.getGuidesRootElement();

    //  Compute an ID that is based on our unique local ID.
    groupID = this.getLocalID() + '_guide_group';

    //  Try to get the group element with that ID. If it's not there, try to
    //  create it.
    groupElem = TP.byCSSPath('> svg|g#' + groupID, svgElem, true, false);
    if (!TP.isElement(groupElem)) {
        str = '<g id="' + groupID + '" xmlns="' +
                TP.w3.Xmlns.SVG +
                '" width="100%" height="100%"/>';
        groupElem = TP.elem(str);
        groupElem = TP.nodeAppendChild(svgElem, groupElem, false);
    }

    return groupElem;
});

//  ========================================================================
//  TP.sherpa.adjuster_heightPropertyEditor
//  ========================================================================

/**
 * @type {TP.sherpa.adjuster_heightPropertyEditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_customPropertyEditor.defineSubtype(
'adjuster_heightPropertyEditor');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.adjuster_heightPropertyEditor.Inst.defineAttribute('$yOffset');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.adjuster_heightPropertyEditor.Inst.defineMethod('hideVisualGuides',
function() {

    /**
     * @method hideVisualGuides
     * @summary Hides any visual guides that the receiver draws to help the user
     *     when adjusting the receiver's value.
     * @returns {TP.sherpa.adjuster_heightPropertyEditor} The receiver.
     */

    var adjuster,

        defsElem,
        groupElem;

    //  If the adjuster is currently adjusting, then we don't hide anything.
    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    if (adjuster.get('isAdjusting')) {
        return this;
    }

    //  Grab our definitions element and detach it.
    defsElem = this.getGuidesDefsElement();
    if (TP.isElement(defsElem)) {
        TP.nodeDetach(defsElem);
    }

    //  Grab our group element and detach it.
    groupElem = this.getGuidesGroupElement();
    if (TP.isElement(groupElem)) {
        TP.nodeDetach(groupElem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_heightPropertyEditor.Inst.defineMethod('showVisualGuides',
function() {

    /**
     * @method showVisualGuides
     * @summary Shows any visual guides that the receiver draws to help the user
     *     when adjusting the receiver's value.
     * @returns {TP.sherpa.adjuster_heightPropertyEditor} The receiver.
     */

    var selector,
        appliedTPElems,

        toolsLayerOffsets,
        toolsLayerYOffset,

        linecapID,

        defsElem,

        str,

        markerElem,
        groupElem,

        bufferYOffset,

        lineElems;

    //  Grab the selector that we're representing.
    selector = this.get('value').at('selector');

    //  Get all elements that the selector applies to. These will be the
    //  elements that we're going to draw guides for.
    appliedTPElems = TP.byCSSPath(selector, TP.sys.uidoc());
    if (TP.isEmpty(appliedTPElems)) {
        return this;
    }

    //  Get the offsets from the tools layer to the sherpa screen containing the
    //  UI canvas document. We'll need to add these offsets to the guide
    //  elements to properly position them as we draw.
    toolsLayerOffsets = TP.bySystemId('Sherpa').getToolsLayerOffsetsFromScreen(
                                appliedTPElems.first().sherpaGetWorldScreen());

    //  The Y offset is the last of two.
    toolsLayerYOffset = toolsLayerOffsets.last();
    this.$set('$yOffset', toolsLayerYOffset);

    //  Compute an ID that is based on our unique local ID.
    linecapID = this.getLocalID() + '_guide_linecap';

    //  Grab our definitions element and define an SVG 'marker' element under
    //  it. These will be used as 'endcaps' for the lines.
    defsElem = this.getGuidesDefsElement();
    str = '<marker xmlns="' + TP.w3.Xmlns.SVG + '"' +
            ' id="' + linecapID + '" markerWidth="10" markerHeight="1"' +
            ' refX="5" refY="0" orient="180" markerUnits="strokeWidth">' +
                '<line x1="0" y1="0" x2="20" y2="0" stroke="red"/>' +
            '</marker>';
    markerElem = TP.elem(str);
    TP.nodeAppendChild(defsElem, markerElem, false);

    //  Grab our group element. This will contain the 'svg:line' elements that
    //  are representing our guides within the overall SVG content.
    groupElem = this.getGuidesGroupElement();
    if (!TP.isElement(groupElem)) {
        //  TODO: Raise an exception
        return this;
    }

    //  We leave some additional pixels for better visualization.
    bufferYOffset = 3;

    //  Iterate over all of the elements that we're going to draw guides for.
    appliedTPElems.forEach(
        function(aTPElem) {

            var rect,

                x1,
                x2,
                y1,
                y2,

                lineStr,
                elem;

            //  Grab the source element's page rectangle.
            rect = aTPElem.getPageRect();

            //  Compute the endpoints for the line.

            /* eslint-disable no-extra-parens */
            x1 = rect.getX() + rect.getWidth();
            x2 = rect.getX() + rect.getWidth();
            y1 = rect.getY() + toolsLayerYOffset + bufferYOffset;
            y2 = rect.getY() +
                    rect.getHeight() +
                    toolsLayerYOffset -
                    (bufferYOffset * 2);
            /* eslint-enable no-extra-parens */

            //  Construct the markup for the 'svg:line' element.
            lineStr = '<line xmlns="' + TP.w3.Xmlns.SVG + '"' +
                        ' x1="' + x1 + '"' +
                        ' y1="' + y1 + '"' +
                        ' x2="' + x2 + '"' +
                        ' y2="' + y2 + '"' +
                        ' stroke="#f00" stroke-width="2"' +
                        ' marker-start="url(#' + linecapID + ')"' +
                        ' marker-end="url(#' + linecapID + ')"/>';

            //  Make an Element from the markup and append it to our guide
            //  group.
            elem = TP.elem(lineStr);
            TP.nodeAppendChild(groupElem, elem, false);
        });

    //  Now, query all of the svg:line elements that were created and put a
    //  reference to the source element that they're representing. This is
    //  important because it will be used when updating the guides as the user
    //  manipulates the GUI.
    lineElems = TP.byCSSPath('> svg|line', groupElem, false, false);
    lineElems.forEach(
        function(lineElem, index) {
            lineElem.__sourceTPElem__ = appliedTPElems.at(index);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_heightPropertyEditor.Inst.defineMethod('updateVisualGuides',
function() {

    /**
     * @method updateVisualGuides
     * @summary Updates any visual guides that the receiver draws to help the
     *     user when adjusting the receiver's value.
     * @returns {TP.sherpa.adjuster_heightPropertyEditor} The receiver.
     */

    var groupElem,
        lineElems,

        toolsLayerYOffset,
        bufferYOffset;

    //  Grab our group element. This will contain the 'svg:line' elements that
    //  are representing our guides within the overall SVG content.
    groupElem = this.getGuidesGroupElement();

    //  Grab any 'svg:line' elements under the group.
    lineElems = TP.byCSSPath('> svg|line', groupElem, false, false);

    //  Get our computed offsets.
    toolsLayerYOffset = this.$get('$yOffset');
    bufferYOffset = 3;

    var natWindow = this.getNativeWindow();

    lineElems.forEach(
        function(lineElem) {

            var sourceTPElem,

            //  This is the element that these lines are representing as guides
            //  in the group.
            sourceTPElem = lineElem.__sourceTPElem__;

            //  Set the Y coordinates of the line that are drawing the
            //  guidelines based on the source element's page rectangle's Y and
            //  height and using our computed offsets.

            //  NB: We do this inside of a 'next repaint' function for much
            //  smoother drawing.
            (function() {
                var rect,

                    y1,
                    y2;

                rect = sourceTPElem.getPageRect();

                /* eslint-disable no-extra-parens */
                y1 = rect.getY() + toolsLayerYOffset + bufferYOffset;
                y2 = rect.getY() +
                        rect.getHeight() +
                        toolsLayerYOffset -
                        (bufferYOffset * 2);
                /* eslint-enable no-extra-parens */

                    lineElem.setAttribute('y1', y1);
                    lineElem.setAttribute('y2', y2);
            }).queueForNextRepaint(natWindow);
        });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
