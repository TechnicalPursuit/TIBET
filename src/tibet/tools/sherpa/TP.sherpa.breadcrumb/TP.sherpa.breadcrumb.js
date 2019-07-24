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
 * @type {TP.sherpa.breadcrumb}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('breadcrumb');

TP.sherpa.breadcrumb.addTraits(TP.dom.D3Tag);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineAttribute('listcontent',
    TP.cpc('> .content', TP.hc('shouldCollapse', true)));

TP.sherpa.breadcrumb.Inst.defineAttribute('dataset');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineHandler('ItemSelected',
function(aSignal) {

    /**
     * @method handleItemSelected
     * @param {TP.sig.ItemSelected} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.breadcrumb} The receiver.
     */

    var target,
        itemNumber,

        data,
        items;

    target = aSignal.getDOMTarget();

    if (TP.isElement(target)) {
        itemNumber = TP.elementGetAttribute(target, 'itemNum', true);
        itemNumber = itemNumber.asNumber();

        if (TP.isNumber(itemNumber)) {

            data = this.get('data');

            items = data.slice(0, itemNumber + 1);

            this.signal('BreadcrumbSelected',
                        TP.hc('itemNumber', itemNumber,
                                'items', items));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.extern.d3.selection} The supplied enter selection or a new
     *     selection containing any new content that was added.
     */

    var newContent,
        thisref;

    this.updateDataset(enterSelection);

    thisref = this;

    newContent = enterSelection.append('div').classed('item', true).
        attr(
        'itemNum',
        function(d, i) {
            return i;
        }).
        attr(
        'dnd:vend',
        function(d, i) {
            return 'breadcrumb';
        }).
        append('div').classed('itemcontent', true).
        append('div').classed('textcontent', true).
        attr(
        'itemNum',
        function(d, i) {
            return i;
        }).
        text(
        function(d, i) {
            var uri,
                result,
                ds,
                last;

            //  Shorten any URI portions as much as possible.
            if (TP.isURIString(d)) {
                uri = TP.uc(d);

                if (TP.isKindOf(uri, TP.uri.TIBETURL)) {
                    result = uri.getURIParts().at(TP.uri.TIBETURL.URL_INDEX);
                } else {
                    result = TP.uriInTIBETFormat(d);
                }
            } else {
                result = d;
            }

            //  Leverage captured/processed title data to produce the best title
            //  for this index position.
            ds = thisref.$get('dataset');
            if (TP.isValid(ds)) {
                result = TP.ifInvalid(ds.at(i), d);
                if (i > 0) {
                    last = ds.at(i - 1);
                    if (result.startsWith(last)) {
                        result = result.replace(last, '');
                    }
                }
            }

            return result;
        });

    newContent.each(
        function() {
            var hintContent,

                hintElement;

            hintContent = TP.extern.d3.select(this).append('xctrls:hint');
            hintContent.html(
                function(d, i) {
                    var val;

                    //  Pass true here for the call to ignore whether we have a
                    //  scheme or not. If we're a virtual URI, we won't have a
                    //  scheme.
                    if (TP.isURIString(d, true)) {
                        val = TP.uriExpandPath(d);
                    } else {
                        val = d;
                    }

                    return '<span xmlns="' + TP.w3.Xmlns.XHTML + '">' +
                            val +
                            '</span>';
                }
            );

            hintElement = hintContent.node();

            TP.xctrls.hint.setupHintOn(
                this, hintElement, TP.hc('triggerPoint', TP.MOUSE));
        });

    return newContent;
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('getRootUpdateSelection',
function(containerSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @param {TP.extern.d3.selection} containerSelection The selection made by
     *     having d3.js select() the receiver's 'selection container'.
     * @returns {TP.extern.d3.Selection}
     */

    return containerSelection.selectAll('div.item');
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element|null} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    var content;

    content = this.get('listcontent');
    if (TP.notValid(content)) {
        return null;
    }

    return TP.unwrap(content);
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.sherpa.breadcrumb} The receiver.
     */

    var dataSize,
        increment,

        lightnessVals,

        rootUpdateSelection,

        stylesheet,

        selectorPrefix;

    this.callNextMethod();

    //  Try to grab the CSSStyleSheet object associated with our style resource.
    //  If we can't obtain that, we might as well exit here.
    stylesheet = this.getStylesheetForStyleResource();
    if (TP.notValid(stylesheet)) {
        return this;
    }

    //  Compute the lightness values using a d3 interpolation.
    lightnessVals = TP.extern.d3.interpolateNumber(80, 60);

    //  Compute the increment percentage that we'll feed to the d3
    //  interpolation.
    dataSize = this.get('data').getSize();
    increment = 1 / dataSize;

    //  Grab the root update selection. This will be the collection of 'div's
    //  that represent our path.
    rootUpdateSelection = this.d3Select();

    selectorPrefix = 'sherpa|breadcrumb > .content div.item:nth-child';

    rootUpdateSelection.each(
        function(d, i) {

            var level,

                selectorText,
                propertyText,

                rules,
                rule;

            level = i + 1;

            //  Compute a selector that uses the prefix above and adds the level
            //  as an index for the 'nth-child'.
            selectorText = selectorPrefix + '(' + level + ')';

            propertyText = 'hsl(240, 10%, ' +
                            /* eslint-disable no-extra-parens */
                            (lightnessVals(level * increment)) +
                            /* eslint-enable no-extra-parens */
                            '%)';

            //  First, see if there is a rule entry for our 'level' in the style
            //  sheet for the 'main element' by trying to obtain the main rule.
            rules = TP.styleSheetGetStyleRulesMatching(
                            stylesheet,
                            selectorText);

            rule = rules.first();

            if (TP.notValid(rule)) {

                //  Add main rule
                stylesheet.insertRule(
                    TP.join(selectorText,
                            '{',
                            'background-color: ' +
                            propertyText,
                            '}'),
                    stylesheet.cssRules.length);

                //  Add '::after' pseudo-element rule
                selectorText += '::after';
                stylesheet.insertRule(
                    TP.join(selectorText,
                            '{',
                            'border-left-color: ', propertyText,
                            '}'),
                    stylesheet.cssRules.length);

            } else {

                //  Adjust main rule
                rule.style.backgroundColor = propertyText;

                //  Obtain '::after' pseudo-element rule
                selectorText += '::after';
                rules = TP.styleSheetGetStyleRulesMatching(
                                stylesheet,
                                selectorText);
                rule = rules.first();

                //  Adjust '::after' pseudo-element rule
                rule.style.borderLeftColor = propertyText;
            }
        });

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('updateDataset',
function(enterSelection) {

    /**
     * @method updateDataset
     * @summary Refresh internal dataset tracking the title data for our
     *     breadcrumbs. This has to be done since new content can come
     *     incrementally and D3 doesn't store it internally.
     * @param {Object} enterSelection A D3 enter selection object.
     * @returns {String[]} The dataset.
     */

    var dataset,
        selection;

    //  Lazily create the dataset array we'll track historical data in.
    dataset = this.$get('dataset');
    if (TP.notValid(dataset)) {
        dataset = TP.ac();
        this.$set('dataset', dataset);
    }

    //  If no selection clear the dataset.
    if (TP.notValid(enterSelection)) {
        dataset.truncate();
        return dataset;
    }

    //  D3 typically uses an array whose first element is itself an array
    //  containing the data we're interested in. If that's empty clear the list.
    selection = enterSelection[0];
    if (TP.notValid(selection) || selection.getSize() === 0) {
        dataset.truncate();
        return dataset;
    }

    //  Update each index provided, then truncate to remove any entries which
    //  remain in the dataset beyond the last "new data" provided. This happens
    //  if you "back up" and provide new data but the dataset was longer before.
    selection.forEach(function(item, index) {
        dataset.atPut(index, item.__data__);
    });
    dataset.truncate(selection.length);

    return dataset;
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
