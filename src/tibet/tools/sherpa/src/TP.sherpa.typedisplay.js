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
 * @type {TP.sherpa.typedisplay}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('sherpa:typedisplay');

TP.sherpa.typedisplay.Inst.defineAttribute('sourceObject');

TP.sherpa.typedisplay.Inst.defineAttribute(
        'list',
        {value: TP.cpc('> .typelist', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.typedisplay.Inst.defineMethod('render',
function() {

    var sourceObj,
        data,

        cols,
        wrapper,

        sections,
        sectionsEnter,

        tables,
        colHeadings,
        rows,
        cells;

    sourceObj = this.get('sourceObject');

    data = TP.getSherpaTypeInfo(sourceObj);

    cols = ['name', 'owner'];

    wrapper = TP.documentConstructElement(this.getNativeDocument(), 'span', TP.w3.Xmlns.XHTML);

    sections = TP.extern.d3.select(wrapper).selectAll('div.parent').data(data);

    sectionsEnter = sections.enter().
        append('div').
        attr('class', 'parent');

    // don't use selectAll/data/enter to append children that
    // just inherit parent's data
    sectionsEnter.append('div').
        attr('class', 'header').
        text(function(d) {
            return d.at('name');
        });

    // append table and tr.headings row, still don't need selectAll/data/enter
    sectionsEnter.append('table').
        attr('class', 'parent').
        append('tr').
        attr('class', 'headings');

    // selecting tables picks up previously inherited data
    tables = sections.selectAll('table');

    colHeadings = tables.select('tr.headings').
        selectAll('th').
        data(cols);

    colHeadings.enter().
        append('th').
        text(function(d) {
            return d;
        });

    // one row per child
    rows = tables.selectAll('tr.data').
        data(function(d) {
            return d.at('children');
        });

    rows.enter().
        append('tr').
        attr('class', 'data');

    cells = rows.selectAll('td').
                data(function(d) {
                    // return cell data as an array of prop values,
                    // ordered according to prop names in cols
                    return cols.map(function(prop) {
                        //return d[prop];
                        return d.at(prop);
                    });
                });

    cells.enter().
        append('td').
        text(function(d) {
            return d;
        });

    this.get('list').setRawContent(wrapper, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.typedisplay.Inst.defineMethod('setSourceObject',
function(anObj) {

    this.$set('sourceObject', anObj);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getSherpaTypeInfo',
function(anObject) {

    if (TP.canInvoke(anObject, 'getSherpaTypeInfo')) {
        return anObject.getSherpaTypeInfo();
    }

    return TP.ac();
});

//  ---

TP.lang.RootObject.Type.defineMethod('getSherpaTypeInfo',
function() {

    var result,
        data,

        thisArg,
        childrenData,
        rawData;

    result = TP.ac();

    thisArg = this;

    //  ---

    data = TP.hc('name', 'Supertypes');

    rawData = this.getSupertypeNames();

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var childData;

                childData = TP.hc('name', item);

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    //  ---

    data = TP.hc('name', 'Inherited Methods');

    rawData = this.getInterface('known_inherited_methods').sort();

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var owner,
                    childData;

                childData = TP.hc('name', item);

                if (TP.isValid(thisArg[item]) &&
                    TP.isValid(owner = thisArg[item][TP.OWNER])) {
                    childData.atPut('owner', TP.name(owner));
                } else {
                    childData.atPut('owner', 'none');
                }

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    //  ---

    data = TP.hc('name', 'Overridden Methods');

    rawData = this.getInterface('known_overridden_methods').sort();

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var owner,
                    childData;

                childData = TP.hc('name', item);

                if (TP.isValid(thisArg[item]) &&
                    TP.isValid(owner = thisArg[item][TP.OWNER])) {
                    childData.atPut('owner', TP.name(owner));
                } else {
                    childData.atPut('owner', 'none');
                }

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    //  ---

    data = TP.hc('name', 'Introduced Methods');

    rawData = this.getInterface('known_introduced_methods').sort();

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var owner,
                    childData;

                childData = TP.hc('name', item);

                if (TP.isValid(thisArg[item]) &&
                    TP.isValid(owner = thisArg[item][TP.OWNER])) {
                    childData.atPut('owner', TP.name(owner));
                } else {
                    childData.atPut('owner', 'none');
                }

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    return result;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
