//  ========================================================================
/*
NAME:   xctrls_chart.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.2, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.1
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
 * @type {TP.xctrls.chart}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.defineSubtype('chart');

//  A URI to the 'frame file' - the file that will be loaded into the
//  iframe that this type builds to hold the custom control.
TP.xctrls.chart.Type.defineAttribute('frameFileURI',
    TP.uc('~lib_src/xctrls/xctrls_chart/xctrls_chart_stub.html'));

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.xctrls.chart.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @name cmdSetContent
     * @synopsis Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        obj,
        content;

    if (TP.isEmpty(input = aRequest.stdin())) {
        return aRequest.fail(TP.FAILURE, 'No content');
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail(TP.FAILURE, 'No command instance');
    }

    //  stdin is always an Array, so we want the first item.
    content = input.at(0);

    obj.setContent(content, aRequest);

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.chart.Type.defineMethod('getCompilationAttrs',
function(aRequest) {

    /**
     * @name getCompilationAttrs
     * @synopsis Returns a TP.lang.Hash of any attributes to be added to what is
     *     produced by this type when it is compiled.
     * @description This type produces custom values for the 'tibet:nodetype'
     *     attribute (matching the type of the map based on the 'type'
     *     attribute), thereby allowing instances of subtypes of this type to be
     *     created.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {TP.lang.Hash} A TP.lang.Hash of attributes to be added to the
     *     compiled output from this type.
     */

    var elem,
        chartType;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        return TP.hc();
    }

    chartType = TP.ifEmpty(TP.elementGetAttribute(elem, 'type'), 'bar');

    return TP.hc('tibet:nodetype', 'xctrls:' + chartType + 'chart');
});

//  ------------------------------------------------------------------------

TP.xctrls.chart.Type.defineMethod('getResourceTypeName',
function() {

    /**
     * @name getResourceTypeName
     * @synopsis Returns the resource type name for this type. The resource type
     *     name is used when computing resource paths for this type. We override
     *     this here to provide our own type name for subtypes since the
     *     resources should be found under our name.
     * @returns {String} The resource type name for the receiver.
     */

    return 'TP.xctrls.chart';
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.chart.Inst.defineAttribute('currentData');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.chart.Inst.defineMethod('configure',
function() {

    /**
     * @name configure
     * @returns {TP.xctrls.chart} The receiver.
     * @abstract
     * @todo
     */

    this.set('currentData', null);

    this.refresh();

    //  Make sure to 'call up' so that signaling of 'TP.sig.DOMReady'
    //  occurs.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.chart.Inst.defineMethod('$getD3Inst',
function() {

    /**
     * @name $getD3Inst
     * @synopsis Returns the internal d3 instance.
     * @returns {Object} The internal d3 instance.
     */

    return this.get('tpIFrame').getNativeContentWindow().d3;
});

//  ------------------------------------------------------------------------

TP.xctrls.chart.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node.
     * @description For this type, this is the value of the underlying data
     *     being displayed by the chart.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return this.get('currentData');
});

//  ------------------------------------------------------------------------

TP.xctrls.chart.Inst.defineMethod('refresh',
function(aSignal) {

    /**
     * @name refresh
     * @synopsis Updates the receiver to reflect the current value of any data
     *     binding it may have. If the signal argument's payload specified a
     *     'deep' refresh then descendant elements are also updated.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action. This signal should include a key of 'deep' and a value of
     *     true to cause a deep refresh that updates all nodes.
     * @todo
     */

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.chart.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.chart} The receiver.
     */

    this.set('currentData', aValue);

    this.refresh();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
