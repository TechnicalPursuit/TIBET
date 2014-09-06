//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TEST CASE ASSERTIONS
//  ------------------------------------------------------------------------

/*
 * The assertion functions here are loosely modeled after those found in other
 * testing frameworks, however they follow a naming and argument list order that
 * makes them more consistent with the rest of TIBET. Some alterations have also
 * been made to help reduce the potential for creating passing tests which don't
 * actually test anything should you overlook a parameter.
 */

//  ------------------------------------------------------------------------
//  ASSERT BASELINE
//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.TestMethodCollection');

//  ------------------------------------------------------------------------

//  Whether or not the collection of test methods is a 'refuter' - that is, does
//  it invert the result of its test?
TP.test.TestMethodCollection.Inst.defineAttribute('isRefuter');

//  The test case that the test method collection is associated with.
TP.test.TestMethodCollection.Inst.defineAttribute('currentTestCase');

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.Inst.defineMethod('$assert',
function(aCondition, aComment, aFaultString) {

    /**
     * @name $assert
     * @synopsis Checks the supplied Boolean value and fails the test case as
     *     needed when the assertion fails.
     * @param {Boolean} aCondition Whether or not the test succeeded.
     * @param {String} aComment A human-readable comment String.
     * @param {String} aFaultString A String detailing the fault. This will be
     *     appended to the comment if it's supplied.
     * @todo
     */

    var comment;

    if (!aCondition) {
        comment = TP.isEmpty(aComment) ? '' : aComment + ' ';

        this.get('currentTestCase').fail(
            TP.FAILURE,
            comment + (aFaultString || ''));
    }
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.Inst.defineMethod('assertMinArguments',
function(anArgArray, aCount, aComment) {

    /**
     * @name assertMinArguments
     * @synopsis Asserts that the supplied argument Array has a minimum number
     *     of items in it.
     * @param {Array} anArgArray The argument Array to check.
     * @param {Number} aCount The minimum number of arguments that the supplied
     *     argument Array should have.
     * @param {String} aComment The comment to use when reporting that the
     *     argument Array does not have the required minimum number of
     *     arguments.
     * @todo
     */

    var comment;

    //  Like JSUnit a comment is optional, but unlike that framework ours
    //  is always the last argument, when present. This approach means its
    //  much harder for an assertion to mistake a comment for a valid input
    //  and implies that the count provided to this method is effectively a
    //  "minimum" count.

    if (anArgArray.length >= aCount) {
        return;
    }

    comment = TP.isEmpty(aComment) ? '' : aComment + ' ';

    this.get('currentTestCase').fail(
        TP.FAILURE,
        TP.join(comment,
                TP.sc('Expected ', aCount, ' argument(s).',
                        ' Got ', anArgArray.length, '.')));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.Inst.defineMethod('assert',
function(aCondition, aComment, aFaultString) {

    /**
     * @name assert
     * @synopsis Asserts that the supplied condition passes (i.e. returns true).
     * @param {Boolean} aCondition Whether or not the test succeeded.
     * @param {String} aComment A human-readable comment String.
     * @param {String} aFaultString A String detailing the fault. This will be
     *     appended to the comment if it's supplied.
     * @todo
     */

    var condition;

    this.assertMinArguments(arguments, 1);

    //  If we're configured to be a 'refuter', then flip the condition result.
    condition = this.get('isRefuter') ? !aCondition : aCondition;

    return this.$assert(condition, aComment, aFaultString);
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.Type.defineMethod('defineAssertion',
function(methodName, methodBody) {

    /**
     * @name defineAssertion
     * @synopsis Builds an assertion try...catch around the supplied method body
     *     and registers it as an instance method on this type.
     * @param {String} methodName The name of the new assertion method.
     * @param {Function} methodBody The actual assertion method implementation.
     * @returns {Object} The receiver.
     */

    TP.test.TestMethodCollection.Inst.defineMethod(
        methodName,
        function() {
            var retVal;

            try {
                retVal = methodBody.apply(this, arguments);
            } catch (e) {
                this.get('currentTestCase').error(e);
                throw e;
            }

            return retVal;
        });

    return this;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - GENERAL TYPE CHECKS
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isA',
function(anObject, aType, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.validate(anObject, aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEnhanced',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isEnhanced(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an enhanced object.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isKindOf',
function(anObject, aType, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.isKindOf(anObject, aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a kind of ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isMemberOf',
function(anObject, aType, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.isMemberOf(anObject, aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a member of ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isMutable',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isMutable(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be mutable.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNamespace',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNamespace(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a namespace.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNativeType',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNativeType(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a native type.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isPrototype',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isPrototype(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a prototype.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isReferenceType',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isReferenceType(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a reference type.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isSubtypeOf',
function(anObject, aType, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.isSubtypeOf(anObject, aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' to be a subtype of: ' + TP.name(aType)));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isType',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isType(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a type.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isTypeName',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isTypeName(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a type name.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotA',
function(anObject, aType, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        !TP.validate(anObject, aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' not to be a ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - GENERAL API / PROPERTY CHECKING
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('canInvoke',
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

TP.test.TestMethodCollection.defineAssertion('isCallable',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isCallable(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be callable.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isAttribute',
function(anObject, anAttributeName, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isProperty(anObject, anAttributeName) &&
            !TP.isMethod(anObject, anAttributeName),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an attribute.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isGlobal',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isGlobal(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a global.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isGlobalMethod',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isGlobalMethod(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a global method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInstMethod',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isInstMethod(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an instance method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isLocalMethod',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isLocalMethod(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a local method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isMethod',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isMethod(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isProperty',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isProperty(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a property.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isTypeMethod',
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

TP.test.TestMethodCollection.defineAssertion('isArgArray',
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

TP.test.TestMethodCollection.defineAssertion('isArray',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isArray(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an Array.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isBoolean',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isBoolean(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Boolean.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isCollection',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isCollection(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a collection.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isDate',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isDate(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Date.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isError',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isError(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an Error.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEvent',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isEvent(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an Event.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isFunction',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isFunction(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Function.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isIFrameWindow',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isIFrameWindow(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an iframe.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isMediaQueryList',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isMediaQueryList(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a media query list.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNaN',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNaN(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be NaN.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNumber',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNumber(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Number.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isPair',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isPair(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a "pair".'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isRegExp',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isRegExp(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a RegExp.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isString',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isString(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a String.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isStyleDeclaration',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isStyleDeclaration(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a style declaration.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isStyleRule',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isStyleRule(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a style rule.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isStyleSheet',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isStyleSheet(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a style sheet.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isURI',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isURI(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a URI.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isWindow',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isWindow(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Window.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXHR',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isXHR(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an XHR object.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotNaN',
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

TP.test.TestMethodCollection.defineAssertion('isFalse',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isFalse(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be False.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isFalsey',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        !anObject,
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be false-like.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotFalse',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notFalse(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' not to be False.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotTrue',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notTrue(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' not to be True.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isTrue',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isTrue(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be True.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isTruthy',
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

TP.test.TestMethodCollection.defineAssertion('isDefined',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isDefined(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be defined.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEmpty',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isEmpty(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be empty.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNull',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNull(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be null.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isValid',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isValid(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be defined and non-null.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotDefined',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notDefined(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be undefined.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotEmpty',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notEmpty(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be not empty.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotNull',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notNull(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be non-null.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotValid',
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

TP.test.TestMethodCollection.defineAssertion('isBlank',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isBlank(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be blank.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('contains',
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

TP.test.TestMethodCollection.defineAssertion('isEmpty',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isEmpty(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be empty.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isSizeOf',
function(anObject, aCount, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.isEqual(TP.size(anObject), aCount),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be size of: ', aCount));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('matches',
function(anObject, aValue, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.isTrue(aValue.test(anObject)),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to match ', TP.id(aValue), '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotBlank',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.notBlank(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' not to be blank.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('notContains',
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

TP.test.TestMethodCollection.defineAssertion('notEmpty',
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

TP.test.TestMethodCollection.defineAssertion('equalAs',
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

TP.test.TestMethodCollection.defineAssertion('equalTo',
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

TP.test.TestMethodCollection.defineAssertion('isIdenticalTo',
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

TP.test.TestMethodCollection.defineAssertion('isNotEqualAs',
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

TP.test.TestMethodCollection.defineAssertion('isNotEqualTo',
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

TP.test.TestMethodCollection.defineAssertion('isNotIdenticalTo',
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

TP.test.TestMethodCollection.defineAssertion('isAttributeEqualTo',
function(anObject, attrName, aValue, aComment) {

    var val;

    this.assertMinArguments(arguments, 3);

    val = TP.elementGetAttribute(anObject, attrName, true);

    this.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected attribute value ', val,
                ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isHashEqualTo',
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

TP.test.TestMethodCollection.defineAssertion('isHTMLEqualTo',
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

TP.test.TestMethodCollection.defineAssertion('isJSONEqualTo',
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

TP.test.TestMethodCollection.defineAssertion('isSrcEqualTo',
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

TP.test.TestMethodCollection.defineAssertion('isStrEqualTo',
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

TP.test.TestMethodCollection.defineAssertion('isURIEqualTo',
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

TP.test.TestMethodCollection.defineAssertion('isValEqualTo',
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

TP.test.TestMethodCollection.defineAssertion('isXHTMLEqualTo',
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

TP.test.TestMethodCollection.defineAssertion('isXMLEqualTo',
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

TP.test.TestMethodCollection.defineAssertion('hasAttribute',
function(anObject, anAttributeName, aComment) {

    this.assertMinArguments(arguments, 2);

    this.assert(
        TP.elementHasAttribute(anObject, anAttributeName),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' to have an attribute of: ' + anAttributeName));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isAttributeNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isAttributeNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an attribute node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isCommentNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isCommentNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Comment node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isCDATASectionNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isCDATASectionNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a CDATASection node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isCollectionNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isCollectionNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a collection node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isDocument',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isDocument(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isElement',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isElement(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an Element.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isFragment',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isFragment(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a document fragment.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isHTML',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isHTMLDocument',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isHTMLDocument(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an HTML document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isHTMLNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isHTMLNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an HTML node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isJSONString',
function(aString, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isJSONString(aString),
        aComment,
        TP.sc('Expected ', TP.str(aString), ' to be a JSON string.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a Node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNamedNodeMap',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNamedNodeMap(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a NamedNodeMap.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNodeList',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isNodeList(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a NodeList.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNodeType',
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

TP.test.TestMethodCollection.defineAssertion('isProcessingInstructionNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isPINode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' to be a ProcessingInstruction node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isSVGNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isSVGNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an SVG Node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isTextNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isTextNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be a text Node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXHTML',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXHTMLDocument',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isXHTMLDocument(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an XHTML document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXHTMLNode',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isXHTMLNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an XHTML node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXML',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXMLDocument',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);

    this.assert(
        TP.isXMLDocument(anObject),
        aComment,
        TP.ac('Expected ', TP.id(anObject), ' to be an XML document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXMLNode',
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

TP.test.TestMethodCollection.defineAssertion('doesNotRaise',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('doesNotSignal',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('doesNotThrow',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('raises',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('signals',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('throws',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - STRUCTURE
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInAncestor',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInDocument',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInParent',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInWindow',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - STATE
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isActive',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isActive(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be active.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isBusy',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isBusy(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be busy.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isClosed',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isClosed(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be closed.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isDisabled',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isDisabled(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be disabled.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEnabled',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isDisabled(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be enabled.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isFocused',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isFocused(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be focused.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInactive',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isActive(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be inactive.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('invisible',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isInvisible(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be invisible.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotBusy',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isInvisible(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' not to be busy.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotFocused',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isFocused(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be unfocused.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotReadonly',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isReadonly(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be writable.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotRelevant',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isRelevant(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be irrelevant.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotRequired',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isRequired(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be unrequired.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNotSelected',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isSelected(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be unselected.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isOpen',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isClosed(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be open.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isReadonly',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isReadonly(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be readonly.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isRelevant',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isRelevant(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be relevant.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isRequired',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isRequired(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be required.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isSelected',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.isSelected(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be selected.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isVisible',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.isInvisible(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be visible.');

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - INPUT TESTS
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInputInRange',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInputInvalid',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(TP.notValid(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to have invalid input.');

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInputOutOfRange',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInputValid',
function(anObject, aComment) {

    this.assertMinArguments(arguments, 1);
    //this.assert(!TP.notValid(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to have valid input.');

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
