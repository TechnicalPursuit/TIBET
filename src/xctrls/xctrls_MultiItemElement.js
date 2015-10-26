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
 * @type {TP.xctrls.MultiItemElement}
 * @summary Mixin that defines methods that allow the receiver to manage
 *     multiple child items, such as a listbox or tabbox.
 * @summary This type uses 3 different 'getters' that it expects the type
 *     that it is being mixed into to provide:
 *
 *     'body' -> The element that new items will be inserted into.
 *     'firstTransform' -> The first 'tsh:transform' that is defined to
 *     transform data into items that will be added. This will have the same
 *     name as a template that the author provided when authoring the markup.
 *     'transformWithName' -> The named 'tsh:transform' that is defined to
 *     transform data into items that will be added. This will have the same
 *     name as a template that the author provided when authoring the markup.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls.MultiItemElement');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.xctrls.MultiItemElement.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.MultiItemElement.Inst.defineMethod('addItem',
function(aValue, aPositionOrPath, templateName) {

    /**
     * @method addItem
     * @summary Adds a child item to the receiver using a template that should
     *     be embedded under the receiver. If a value for templateName is
     *     supplied, this method attempts to find and use the template named
     *     that. Otherwise, it will use the first embedded template found.
     * @param {Object} aValue The object to use as a data source.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to the document's documentElement or a path to evaluate to
     *     get to a node at that position. This should be one of four values:
     *     TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END or the
     *     path to evaluate. Default is TP.BEFORE_END.
     * @param {String} templateName The name of the embedded template to use.
     *     This parameter is optional and if it's not supplied, the first
     *     template found will be used.
     * @returns {TP.xctrls.listbox} The receiver.
     */

    var bodyElem,

        transformElem,

        theValue,
        executeRequest;

    //  Grab the body (the place to add items to)
    if (!TP.isElement(bodyElem = this.get('body'))) {
        //  TODO: Raise an exception
        return;
    }

    bodyElem = TP.wrap(bodyElem);

    if (TP.notEmpty(templateName)) {
        transformElem = this.get('transformWithName', templateName);
    }

    //  Either there was no template name supplied or we couldn't find a
    //  template under us with that name, so just get the first one.
    if (!TP.isElement(transformElem)) {
        if (!TP.isElement(transformElem = this.get('firstTransform'))) {
            //  TODO: Raise an exception
            return;
        }
    }

    //  If the supplied data source isn't an Array, make it one.
    if (!TP.isArray(theValue = aValue)) {
        theValue = TP.ac(aValue);
    }

    //  Set up a request to execute the template against the data source
    executeRequest = TP.request(TP.hc('cmdExecute', true,
                                        'cmdPhases', 'Execute',
                                        'cmdSilent', true));

    //  Iterate over the Array of values, executing the template each time,
    //  grabbing the first child out of the template (which will be the new
    //  item itself) and adding it to the body element.
    theValue.perform(
        function(itemValue, index) {

            var resp,
                newItemStr,
                newItemElem;

            //  Make an index available to the template each time.
            itemValue.atPut('index', index);

            executeRequest.atPut(TP.STDIN, TP.ac(itemValue));

            resp = TP.process(transformElem, executeRequest);
            newItemStr = resp.get('result');

            newItemElem = TP.elem(newItemStr);

            if (TP.notEmpty(aPositionOrPath)) {
                bodyElem.insertRawContent(newItemElem,
                                                aPositionOrPath);
            } else {
                bodyElem.addRawContent(newItemElem);
            }
        });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
