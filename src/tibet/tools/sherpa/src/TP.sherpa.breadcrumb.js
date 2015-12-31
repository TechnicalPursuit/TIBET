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

TP.sherpa.Element.defineSubtype('sherpa:breadcrumb');

TP.sherpa.breadcrumb.Inst.defineAttribute('sourceID');
TP.sherpa.breadcrumb.Inst.defineAttribute('sourceObject');

TP.sherpa.breadcrumb.Inst.defineAttribute(
        'list',
        {value: TP.cpc('> .crumblist', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('render',
function() {

    var sourceObj,
        info,

        lines,

        thisArg;

    sourceObj = this.get('sourceObject');

    info = TP.getSherpaHierarchyInfo(sourceObj);

    lines = TP.extern.d3.select(
            TP.unwrap(this.get('list'))).selectAll('li').data(info);

    thisArg = this;

    lines.enter().append('li');
    lines.html(function(entry) {return thisArg.generateItem(entry); });
    lines.exit().remove();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('generateItem',
function(anEntry) {

    var srcID,
        str;

    srcID = this.get('sourceID');

    str = '<a href="#" onclick="TP.bySystemId(\'' + srcID + '\').setSourceObject(';

    switch (anEntry.first()) {

        case 'type':
            str += 'TP.sys.getTypeByName(\'' + anEntry.last() + '\')';
            break;

        default:
            str += 'null';
    }

    str += ')">' + anEntry.last() + '</a>';

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('setup',
function(anObject) {

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('setSourceObject',
function(anObj) {

    this.$set('sourceObject', anObj);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getSherpaHierarchyInfo',
function(anObject) {

    if (TP.canInvoke(anObject, 'getSherpaHierarchyInfo')) {
        return anObject.getSherpaHierarchyInfo();
    }

    return TP.ac(TP.ac());
});

//  ---

Function.Inst.defineMethod('getSherpaHierarchyInfo',
function() {

    var superNames,
        info;

    info = TP.ac();

    if (TP.isMethod(this)) {
        superNames = this[TP.OWNER].getSupertypeNames().copy();
        superNames.reverse().perform(
            function(item) {
                info.push(TP.ac('type', item));
            });

        info.push(TP.ac('type', this[TP.OWNER].getName()));
        info.push(TP.ac('method', this[TP.DISPLAY]));
    }

    return info;
});

//  ---

TP.lang.RootObject.Type.defineMethod('getSherpaHierarchyInfo',
function() {

    var superNames,
        info;

    info = TP.ac();

    superNames = this.getSupertypeNames().copy();
    superNames.reverse().perform(
        function(item) {
            info.push(TP.ac('type', item));
        });

    info.push(TP.ac('type', this.getName()));

    return info;
});

//  ---

TP.core.ElementNode.Inst.defineMethod('getSherpaHierarchyInfo',
function() {

    var info,
        val,
        id;

    info = TP.ac();

    this.ancestorsPerform(
            function(aNode) {
                var tpElem;

                if (TP.isDocument(aNode)) {
                    info.push(TP.ac('path', '#document'));
                } else {
                    tpElem = TP.wrap(aNode);

                    val = tpElem.getLocalName();
                    if (TP.notEmpty(id = tpElem.getAttribute('id'))) {
                        val += '#' + id;
                    }

                    info.push(TP.ac('path', val));
                }
            },
            true);

    val = this.getLocalName();
    if (TP.notEmpty(id = this.getAttribute('id'))) {
        val += '#' + id;
    }

    info.push(TP.ac('path', val));

    return info;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
