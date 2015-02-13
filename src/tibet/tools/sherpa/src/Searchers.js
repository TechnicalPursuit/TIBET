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
 * @type {TP.core.Searcher}
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Searcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Searcher.Inst.defineMethod('search',
function(usingText) {

    /**
     * @method search
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.Searcher.Inst.defineMethod('getTitle',
function() {

    /**
     * @method search
     */

    return TP.override();
});

//  ========================================================================
//  TP.core.CSSPropertySearcher
//  ========================================================================

TP.core.Searcher.defineSubtype('core.CSSPropertySearcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSPropertySearcher.Inst.defineMethod('search',
function(usingText) {

    /**
     * @method search
     */

    var results,

        searchRegExp,
        CSSPropNames;

    results = TP.ac();

    searchRegExp = TP.rc(TP.regExpEscape(usingText));

    CSSPropNames = TP.CSS_ALL_PROPERTIES;
    CSSPropNames.perform(
        function(aName) {
            if (searchRegExp.test(aName)) {
                results.push(aName);
            }
        });

    return results;
});

//  ------------------------------------------------------------------------

TP.core.CSSPropertySearcher.Inst.defineMethod('getTitle',
function() {

    /**
     * @method title
     */

    return 'CSS PROPERTIES';
});

//  ========================================================================
//  TP.core.CustomTypeSearcher
//  ========================================================================

TP.core.Searcher.defineSubtype('core.CustomTypeSearcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CustomTypeSearcher.Inst.defineMethod('search',
function(usingText) {

    /**
     * @method search
     */

    var results,

        searchRegExp,
        customTypeNames;

    results = TP.ac();

//    if (usingText.startsWith('TP')) {
 //       results.push('TP.sys', 'TP.boot');
  //  } else {
    searchRegExp = TP.rc(TP.regExpEscape(usingText));

    customTypeNames = TP.sys.getMetadata('types').getKeys();
    customTypeNames.perform(
        function(aTypeName) {
            if (searchRegExp.test(aTypeName)) {
                results.push(aTypeName);
            }
        });
   // }

    return results;
});

//  ------------------------------------------------------------------------

TP.core.CustomTypeSearcher.Inst.defineMethod('getTitle',
function() {

    /**
     * @method title
     */

    return 'TYPES';
});

//  ========================================================================
//  TP.core.MethodSearcher
//  ========================================================================

TP.core.Searcher.defineSubtype('core.MethodSearcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.MethodSearcher.Inst.defineMethod('search',
function(usingText) {

    /**
     * @method search
     */

    var results,

        searchRegExp,
        methodNames;

    results = TP.ac();

//    if (usingText.startsWith('TP')) {
 //       results.push('TP.sys', 'TP.boot');
  //  } else {
    searchRegExp = TP.rc(TP.regExpEscape(usingText));

    methodNames = TP.sys.getMetadata('methods').getKeys();
    methodNames.perform(
        function(aMethodName) {
            var methodName,
                ownerName;

            methodName = aMethodName.slice(aMethodName.lastIndexOf('_') + 1);

            if (searchRegExp.test(methodName)) {
                ownerName = aMethodName.slice(0, aMethodName.indexOf('_'));
                results.push(methodName + ' (' + ownerName + ')');

                /*
                trackName = aMethodName.slice(aMethodName.indexOf('_') + 1,
                                            aMethodName.lastIndexOf('_'));

                results.push(
                    methodName + ' (' + ownerName + ' - ' + trackName + ')');
                results.push(methodName);
                */
            }
        });
   // }

    return results;
});

//  ------------------------------------------------------------------------

TP.core.MethodSearcher.Inst.defineMethod('getTitle',
function() {

    /**
     * @method search
     */

    return 'METHODS';
});

//  ========================================================================
//  TP.core.NamespaceSearcher
//  ========================================================================

TP.core.Searcher.defineSubtype('core.NamespaceSearcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.NamespaceSearcher.Inst.defineMethod('search',
function(usingText) {

    /**
     * @method search
     */

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.core.NamespaceSearcher.Inst.defineMethod('getTitle',
function() {

    /**
     * @method title
     */

    return 'NAMESPACES';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
