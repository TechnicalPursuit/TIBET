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
 * @type {TP.dom.reactgreeting}
 * @summary
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('demo:reactgreeting');

TP.demo.reactgreeting.addTraitTypes(TP.dom.ReactElement);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.demo.reactgreeting.defineAttribute('styleURI', TP.NO_RESULT);
TP.demo.reactgreeting.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.demo.reactgreeting.Inst.defineMethod('getComponentClassName',
function() {

    /**
     * @method getComponentClassName
     * @summary Returns the React component's ECMAScript class name. This is
     *     used by the TIBET machinery when invoking the ReactDOM.render call.
     * @returns {String} The React component's ECMAScript class name.
     */

    return 'Greeting';
});

//  ------------------------------------------------------------------------

TP.demo.reactgreeting.Inst.defineMethod('getComponentCreationLocation',
function() {

    /**
     * @method getComponentCreationLocation
     * @summary Returns a location containing the ReactJS script that will
     *     create the component. The resource pointed to by this URL may contain
     *     regular JavaScript or JSX.
     * @returns {String|null} The component creation location.
     */

    return this.qualifyToSourcePath('react_greeting.jsx');
});

//  ------------------------------------------------------------------------
//  ReactJS lifecycle methods
//  ------------------------------------------------------------------------

TP.demo.reactgreeting.Inst.defineMethod('reactDidMount',
function(anObject) {

    /**
     * @method reactDidMount
     * @summary This method is invoked when the React peer component has mounted
     *     into its environment.
     * @param {Object} anObject The React peer component.
     * @returns {TP.dom.reactgreeting} The receiver.
     */

    //  Make sure to 'call up' so that TIBET can do thing like maintain data
    //  bindings with the ReactJS component.
    this.callNextMethod();

    return this;
});

//  ------------------------------------------------------------------------

TP.demo.reactgreeting.Inst.defineMethod('reactDidUpdate',
function(anObject, prevProps, prevState) {

    /**
     * @method reactDidUpdate
     * @summary This method is invoked when the React peer component has
     *     updated.
     * @param {Object} anObject The React peer component.
     * @returns {TP.dom.reactgreeting} The receiver.
     */

    //  Make sure to 'call up' so that TIBET can do thing like maintain data
    //  bindings with the ReactJS component.
    this.callNextMethod();

    return this;
});

//  ------------------------------------------------------------------------

TP.demo.reactgreeting.Inst.defineMethod('reactWillUnmount',
function(anObject) {

    /**
     * @method reactWillUnmount
     * @summary This method is invoked when the React peer component is getting
     *     ready to unmount from its environment.
     * @param {Object} anObject The React peer component.
     * @returns {TP.dom.reactgreeting} The receiver.
     */

    //  Make sure to 'call up' so that TIBET can do thing like maintain data
    //  bindings with the ReactJS component.
    this.callNextMethod();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
