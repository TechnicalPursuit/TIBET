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
 * @type {TP.xctrls.chart}
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
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        obj,
        content;

    if (TP.isEmpty(input = aRequest.stdin())) {
        return aRequest.fail('No content');
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail('No command instance');
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
     * @method getCompilationAttrs
     * @summary Returns a TP.lang.Hash of any attributes to be added to what is
     *     produced by this type when it is compiled.
     * @description This type produces custom values for the 'tibet:ctrl'
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
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return TP.hc();
    }

    chartType = TP.ifEmpty(TP.elementGetAttribute(elem, 'type'), 'bar');

    return TP.hc('tibet:ctrl', 'xctrls:' + chartType + 'chart');
});

//  ------------------------------------------------------------------------

TP.xctrls.chart.Type.defineMethod('getResourceTypeName',
function() {

    /**
     * @method getResourceTypeName
     * @summary Returns the resource type name for this type. The resource type
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
     * @method configure
     * @returns {TP.xctrls.chart} The receiver.
     * @abstract
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
     * @method $getD3Inst
     * @summary Returns the internal d3 instance.
     * @returns {Object} The internal d3 instance.
     */

    return this.get('tpIFrame').getNativeContentWindow().d3;
});

//  ------------------------------------------------------------------------

TP.xctrls.chart.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node.
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
     * @method refresh
     * @summary Updates the receiver to reflect the current value of any data
     *     binding it may have. If the signal argument's payload specified a
     *     'deep' refresh then descendant elements are also updated.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action. This signal should include a key of 'deep' and a value of
     *     true to cause a deep refresh that updates all nodes.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.chart.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
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
