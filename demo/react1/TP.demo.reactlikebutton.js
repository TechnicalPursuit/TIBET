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
 * @type {TP.demo.reactlikebutton}
 * @summary
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('demo:reactlikebutton');

TP.demo.reactlikebutton.addTraits(TP.dom.ReactElement);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.demo.reactlikebutton.defineAttribute('styleURI', TP.NO_RESULT);
TP.demo.reactlikebutton.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.demo.reactlikebutton.Type.defineMethod('getComponentScriptLocations',
function() {

    /**
     * @method getComponentScriptLocations
     * @summary Returns an Array of URL locations that contain JavaScript code
     *     used to implement the React component that the receiver is
     *     representing.
     * @returns {String[]} An Array of script URL locations containing the React
     *     component code.
     */

    return TP.ac(this.qualifyToSourcePath('like_button.js'));
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.demo.reactlikebutton.Inst.defineMethod('getComponentClassName',
function() {

    /**
     * @method getComponentClassName
     * @summary Returns the React component's ECMAScript class name. This is
     *     used by the TIBET machinery when invoking the ReactDOM.render call.
     * @returns {String} The React component's ECMAScript class name.
     */

    return 'LikeButton';
});

//  ------------------------------------------------------------------------
//  ReactJS lifecycle methods
//  ------------------------------------------------------------------------

TP.demo.reactlikebutton.Inst.defineMethod('reactDidMount',
function(anObject) {

    /**
     * @method reactDidMount
     * @summary This method is invoked when the React peer component has mounted
     *     into its environment.
     * @param {Object} anObject The React peer component.
     * @returns {TP.dom.reactlikebutton} The receiver.
     */

    //  Make sure to 'call up' so that TIBET can do thing like maintain data
    //  bindings with the ReactJS component.
    this.callNextMethod();

    return this;
});

//  ------------------------------------------------------------------------

TP.demo.reactlikebutton.Inst.defineMethod('reactDidUpdate',
function(anObject, prevProps, prevState) {

    /**
     * @method reactDidUpdate
     * @summary This method is invoked when the React peer component has
     *     updated.
     * @param {Object} anObject The React peer component.
     * @returns {TP.dom.reactlikebutton} The receiver.
     */

    //  Make sure to 'call up' so that TIBET can do thing like maintain data
    //  bindings with the ReactJS component.
    this.callNextMethod();

    return this;
});

//  ------------------------------------------------------------------------

TP.demo.reactlikebutton.Inst.defineMethod('reactWillUnmount',
function(anObject) {

    /**
     * @method reactWillUnmount
     * @summary This method is invoked when the React peer component is getting
     *     ready to unmount from its environment.
     * @param {Object} anObject The React peer component.
     * @returns {TP.dom.reactlikebutton} The receiver.
     */

    //  Make sure to 'call up' so that TIBET can do thing like maintain data
    //  bindings with the ReactJS component.
    this.callNextMethod();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
