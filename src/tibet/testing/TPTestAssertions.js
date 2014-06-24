//  ========================================================================
/**
 * @file TPTestingAssertions.js
 * @overview TP.test.Case assertion extensions. The core assert call is found in
 *     the primary TP.test.Case definition file.
 *
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */
//  ------------------------------------------------------------------------

/**
 */

//  ------------------------------------------------------------------------
//  ASSERTIONS - GENERAL TYPE CHECKS
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsA',
function(anObject, aType, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.validate(anObject, aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' to be a ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsEnhanced',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isEnhanced(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an enhanced object.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsKindOf',
function(anObject, aType, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.isKindOf(anObject, aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' to be a kind of ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsMemberOf',
function(anObject, aType, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.isMemberOf(anObject, aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' to be a member of ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsMutable',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isMutable(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be mutable.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsNativeType',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNativeType(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a native type.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsPrototype',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isPrototype(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a prototype.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsReferenceType',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isReferenceType(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a reference type.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsType',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isType(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a type.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsTypeName',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isTypeName(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a type name.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotA',
function(anObject, aType, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        !TP.validate(anObject, aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' not to be a ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - GENERAL API / PROPERTY CHECKING
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertCanInvoke',
function(anObject, aMethodName, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.canInvoke(anObject, aMethodName),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' could invoke ', aMethodName, '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsCallable',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isCallable(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be callable.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsAttribute',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isProperty(anObject) && !TP.isMethod(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an attribute.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsGlobal',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isGlobal(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a global.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsGlobalMethod',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isGlobalMethod(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a global method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsInstMethod',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isInstMethod(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an instance method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsLocalMethod',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isLocalMethod(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a local method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsMethod',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isMethod(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsProperty',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isProperty(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a property.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsTypeMethod',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isTypeMethod(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a type method.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - SPECIFIC TYPE CHECKING
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsArgArray',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isArgArray(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' to be an "arguments" object.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsArray',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isArray(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an Array.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsBoolean',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isBoolean(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Boolean.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsCollection',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isCollection(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a collection.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsDate',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isDate(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Date.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsError',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isError(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an Error.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsEvent',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isEvent(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an Event.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsFunction',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isFunction(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Function.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsIFrame',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isIFrameWindow(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an iframe.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsNaN',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNaN(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be NaN.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsNumber',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNumber(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Number.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsPair',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isPair(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a "pair".'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsRegExp',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isRegExp(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a RegExp.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsString',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isString(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a String.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsStyleDeclaration',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isStyleDeclaration(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a style.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsURI',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isURI(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a URI.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsWindow',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isWindow(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Window.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsXHR',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isXHR(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an XHR object.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotNaN',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        !TP.isNaN(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' not to be NaN.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - BOOLEAN
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertFalse',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isFalse(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be False.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertFalsey',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        !anObject,
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be false-like.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotFalse',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notFalse(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' not to be False.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotTrue',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notTrue(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' not to be True.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertTrue',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isTrue(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be True.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertTruthy',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        anObject,
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be true-like.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - NULL/UNDEFINED/VALID
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsDefined',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isDefined(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be defined.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsNull',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNull(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be null.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsUndefined',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        !TP.isDefined(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be undefined.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsValid',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isValid(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be defined and non-null.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotDefined',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notDefined(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be undefined.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotNull',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notNull(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be non-null.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotValid',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notValid(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be null or undefined.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - CONTENT/VALUE
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertBlank',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isBlank(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be blank.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertContains',
function(anObject, someContent, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.contains(anObject, someContent),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' to contain ', TP.id(someContent)));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertEmpty',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isEmpty(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be empty.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertMatches',
function(anObject, aValue, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.isTrue(aValue.test(anObject)),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to match ', TP.id(aValue), '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotBlank',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notBlank(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' not to be blank.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotContains',
function(anObject, someContent, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        !TP.contains(anObject, someContent),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' not to contain ', TP.id(someContent)));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotEmpty',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notEmpty(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' not to be empty.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - EQUALITY/IDENTITY
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertEqualAs',
function(anObject, aValue, aType, aComment) {

    this.assertMinArguments(arguments, 3);

    this.assert(
        TP.ac(anObject, aValue).equalAs(aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' to be equal as ', TP.name(aType), 's.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertEqualTo',
function(anObject, aValue, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.equal(anObject, aValue),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIdenticalTo',
function(anObject, aValue, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.identical(anObject, aValue),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' to be identical.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotEqualAs',
function(anObject, aValue, aType, aComment) {

    this.assertMinArguments(arguments, 3);

    this.assert(
        !TP.ac(anObject, aValue).equalAs(aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' to be unequal as ', TP.name(aType), 's.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotEqualTo',
function(anObject, aValue, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        !TP.equal(anObject, aValue),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' not to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotIdenticalTo',
function(anObject, aValue, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        !TP.identical(anObject, aValue),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' not to be identical.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - CONVERTED VALUE EQUALITY
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertHashEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.hash(anObject);

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected hash ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertHTMLEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.htmlstr(anObject);

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected HTML ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertJSONEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.json(anObject);

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected JSON ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertSrcEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.src(anObject);

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected JS source ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertStrEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.str(anObject);

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected string ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertURIEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.uri(anObject);

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected URI ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertValEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.val(anObject);

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected value ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertXHTMLEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.xhtmlstr(anObject);

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected XHTML ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertXMLEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.xmlstr(anObject);

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected XML ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - MARKUP / ENCODING
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsAttributeNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isAttributeNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an attribute node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsCommentNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isCommentNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Comment node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsCDATASectionNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isCDATASectionNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a CDATASection node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsCollectionNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isCollectionNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a collection node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsDocument',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isDocument(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsElement',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isElement(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an Element.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsFragment',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isFragment(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a document fragment.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsHTML',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsHTMLDocument',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isHTMLDocument(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an HTML document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsHTMLNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isHTMLNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an HTML node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsJSON',
function(aString, aComment) {

    this.assertMinArguments(arguments, 1);

    if (TP.isEmpty(aString)) {
        this.assert(false, aComment,
            TP.sc('Expected ', TP.str(aString), ' to be JSON.'));
        return;
    }

    try {
        JSON.parse(aString);
    } catch (e) {
        this.assert(false, aComment,
            TP.sc('Expected ', TP.str(aString), ' to be JSON.'));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsNamedNodeMap',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNamedNodeMap(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a NamedNodeMap.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsNodeList',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNodeList(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a NodeList.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsNodeType',
function(anObject, aNodeType, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.isNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Node.'));

    this.assert(
        anObject.nodeType === aNodeType,
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' to be a type #', aNodeType, ' Node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsSVGNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isSVGNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an SVG Node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsTextNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isTextNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a text Node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsXHTML',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsXHTMLDocument',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isXHTMLDocument(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an XHTML document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsXHTMLNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isXHTMLNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an XHTML node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsXML',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsXMLDocument',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isXMLDocument(anObject),
        aComment,
        TP.ac('Expected ', TP.id(anObject), ' to be an XML document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertIsXMLNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isXMLNode(anObject),
        aComment,
        TP.ac('Expected ', TP.id(anObject), ' to be an XML node.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - SIGNALING
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNoRaise',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNoSignal',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNoThrow',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertRaises',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertSignals',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertThrows',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - STRUCTURE
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertInAncestor',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertInDocument',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertInParent',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertInWindow',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - STATE
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertActive',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isActive(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be active.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertBusy',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isBusy(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be busy.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertClosed',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isClosed(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be closed.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertDisabled',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isDisabled(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be disabled.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertEnabled',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isDisabled(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be enabled.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertFocused',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isFocused(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be focused.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertInactive',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isActive(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be inactive.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertInvisible',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isInvisible(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be invisible.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotBusy',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isInvisible(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' not to be busy.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotFocused',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isFocused(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be unfocused.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotReadonly',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isReadonly(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be writable.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotRelevant',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isRelevant(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be irrelevant.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotRequired',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isRequired(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be unrequired.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertNotSelected',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isSelected(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be unselected.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertOpen',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isClosed(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be open.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertReadonly',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isReadonly(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be readonly.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertRelevant',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isRelevant(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be relevant.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertRequired',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isRequired(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be required.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertSelected',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isSelected(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be selected.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertVisible',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isInvisible(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be visible.');

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - INPUT TESTS
//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertInputInRange',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertInputInvalid',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.notValid(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to have invalid input.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertInputOutOfRange',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.Case.Inst.defineMethod('assertInputValid',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.notValid(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to have valid input.');

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
