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
 * @type {TP.xctrls.tabbar}
 */

//  ------------------------------------------------------------------------

TP.xctrls.itemset.defineSubtype('xctrls:tabbar');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.tabbar.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIActivate',
            'TP.sig.UIDeactivate',

            'TP.sig.UIDeselect',
            'TP.sig.UISelect',

            'TP.sig.UIDisabled',
            'TP.sig.UIEnabled'
            ));

/**
 * The tag name of the tag to use for each item if there is no template.
 * @type {String}
 */
TP.xctrls.tabbar.Type.defineAttribute('defaultItemTagName',
                                        'xctrls:tabitem');

/**
 * Whether or not the tag wants 'close mark' elements to allow individual
 * items to be closed (i.e. removed)
 * @type {String}
 */
TP.xctrls.tabbar.Type.defineAttribute('wantsCloseMarks', true);

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var containerSelection,
        rootUpdateSelection;

    console.log('GOT TO TABBAR RENDER #1');

    //  Note that this is a strict check for the value of 'false' (the Boolean
    //  value of false). This can't just be a 'falsey' value.
    if (TP.isFalse(this.get('shouldRender'))) {
        return this;
    }

    console.log('GOT TO TABBAR RENDER #2');

    this.d3SelectContainer();

    console.log('GOT TO TABBAR RENDER #3');

    //  If the data is not valid, then empty the root selection (keeping the
    //  root itself intact for future updates).
    if (TP.notValid(this.get('data'))) {

    console.log('GOT TO TABBAR RENDER #4');

        containerSelection = this.get('containerSelection');

    console.log('GOT TO TABBAR RENDER #5');

        //  No valid container selection? Return here.
        if (TP.notValid(containerSelection)) {

    console.log('GOT TO TABBAR RENDER #6');

            //  Signal to observers that this control has rendered.
            this.signal('TP.sig.DidRender');

            return this;
        }

    console.log('GOT TO TABBAR RENDER #7');

        containerSelection.selectAll('*').remove();

    console.log('GOT TO TABBAR RENDER #8');

        //  Signal to observers that this control has rendered.
        this.signal('TP.sig.DidRender');

    } else {

    console.log('GOT TO TABBAR RENDER #9');

        //  Select any nodes under the 'selection root'
        rootUpdateSelection = this.d3Select();

    console.log('GOT TO TABBAR RENDER #10');

        //  No valid root update selection? Return here.
        if (TP.notValid(rootUpdateSelection)) {

    console.log('GOT TO TABBAR RENDER #11');

            //  Signal to observers that this control has rendered.
            this.signal('TP.sig.DidRender');

            return this;
        }

    console.log('GOT TO TABBAR RENDER #12');

        //  Associate (or 'bind') the data to the root update selection.
        this.d3Data(rootUpdateSelection);

    console.log('GOT TO TABBAR RENDER #13');

        //  Update any existing update selection
        this.d3Update();
        this.d3UpdateTransition();

    console.log('GOT TO TABBAR RENDER #14');

        //  Add any content to the enter selection
        this.d3Enter();
        this.d3EnterTransition();

    console.log('GOT TO TABBAR RENDER #15');

        //  Remove any content from the exit selection
        this.d3Exit();
        this.d3ExitTransition();

    console.log('GOT TO TABBAR RENDER #16');

        //  If we're supposed to maintain the order between data and DOM, then
        //  do so here.
        if (TP.notFalse(this.getType().get('shouldOrder'))) {
    console.log('GOT TO TABBAR RENDER #17');

            this.get('updateSelection').order();
        }

    console.log('GOT TO TABBAR RENDER #18');

        //  Signal to observers that this control has rendered its data.
        this.signal('TP.sig.DidRenderData');
    }

    console.log('GOT TO TABBAR RENDER #19');

    return this;
});

//  ========================================================================
//  TP.xctrls.tabitem
//  ========================================================================

TP.xctrls.item.defineSubtype('xctrls:tabitem');

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.tabitem.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.tabitem.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.tabitem.Type.defineAttribute('opaqueCapturingSignalNames',
        TP.ac('TP.sig.DOMMouseDown',
                'TP.sig.DOMMouseUp',
                'TP.sig.DOMMouseOver',
                'TP.sig.DOMMouseOut',
                'TP.sig.DOMFocus',
                'TP.sig.DOMBlur'));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.tabitem.Inst.defineAttribute('label',
    TP.xpc('string(./xctrls:label)', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.tabitem.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the receiver. This is overriding an
     *     inherited method, which is why it is done as a method, rather than as
     *     an attribute with a path alias.
     * @returns {String} The value in string form.
     */

    return this.get(
        TP.xpc('string(./xctrls:value)', TP.hc('shouldCollapse', true)));
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
