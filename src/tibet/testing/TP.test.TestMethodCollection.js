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
     * @method $assert
     * @summary Checks the supplied Boolean value and fails the test case as
     *     needed when the assertion fails.
     * @param {Boolean} aCondition Whether or not the test succeeded.
     * @param {String} aComment A human-readable comment String.
     * @param {String} aFaultString A String detailing the fault. This will be
     *     appended to the comment if it's supplied.
     * @returns {Boolean} True if the assertion succeeded, false if it failed.
     */

    var comment,
        message;

    if (!aCondition) {
        comment = TP.isEmpty(aComment) ? '' : aComment + ' ';

        message = comment;
        if (TP.notEmpty(aFaultString)) {
            message += ' ' + aFaultString;
        }

        this.get('currentTestCase').fail(message);
    }

    return aCondition;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.Inst.defineMethod('assertMinArguments',
function(anArgArray, aCount, aComment) {

    /**
     * @method assertMinArguments
     * @summary Asserts that the supplied argument Array has a minimum number
     *     of items in it.
     * @param {Object[]} anArgArray The argument Array to check.
     * @param {Number} aCount The minimum number of arguments that the supplied
     *     argument Array should have.
     * @param {String} aComment The comment to use when reporting that the
     *     argument Array does not have the required minimum number of
     *     arguments.
     * @returns {Boolean} True if the supplied arg array had at least the number
     *     of items given by the supplied count.
     */

    var comment;

    //  Like JSUnit a comment is optional, but unlike that framework ours
    //  is always the last argument, when present. This approach means its
    //  much harder for an assertion to mistake a comment for a valid input
    //  and implies that the count provided to this method is effectively a
    //  "minimum" count.

    if (anArgArray.length >= aCount) {
        return true;
    }

    comment = TP.isEmpty(aComment) ? '' : aComment + ' ';

    this.get('currentTestCase').fail(
        TP.join(comment,
                TP.sc('Expected ', aCount, ' argument(s).',
                        ' Got ', anArgArray.length, '.')));

    return false;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.Inst.defineMethod('assert',
function(aCondition, aComment, aFaultString) {

    /**
     * @method assert
     * @summary Asserts that the supplied condition passes (i.e. returns true).
     * @param {Boolean} aCondition Whether or not the test succeeded.
     * @param {String} aComment A human-readable comment String.
     * @param {String} aFaultString A String detailing the fault. This will be
     *     appended to the comment if it's supplied.
     * @returns {Boolean} True if the assertion succeeded, false if it failed.
     */

    var condition,
        faultStr;

    this.assertMinArguments(arguments, 1);

    //  Mark this test case as having run at least one assertion. If we don't do
    //  this, the test case will fail and be marked as 'todo'.

    //  NB: We specifically do this *after* the assertMinArguments() above,
    //  since those calls don't 'count' towards whether an assertion has been
    //  tested or not.

    this.get('currentTestCase').$set('$executedAssertion', true);

    //  If we're configured to be a 'refuter', then flip the condition result
    //  and alter the fault string message.
    if (this.get('isRefuter')) {
        condition = !aCondition;
        if (TP.isString(aFaultString)) {
            faultStr = aFaultString.replace(
                            /to (be|contain|have|match|raise|signal|throw)/,
                            'to not $1');
        } else {
            faultStr = aFaultString;
        }
    } else {
        condition = aCondition;
        faultStr = aFaultString;
    }

    return this.$assert(condition, aComment, faultStr);
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.Type.defineMethod('defineAssertion',
function(methodName, methodBody) {

    /**
     * @method defineAssertion
     * @summary Builds an assertion try...catch around the supplied method body
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

                //  Make sure to rethrow the Error so that handlers 'higher up'
                //  will also catch it.
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

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.validate(anObject, aType),
            aComment,
            TP.sc('Expected ', TP.id(anObject),
                    ' to be a ', TP.name(aType), '.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEnhanced',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isEnhanced(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an enhanced object.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isKindOf',
function(anObject, aType, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.isKindOf(anObject, aType),
            aComment,
            TP.sc('Expected ', TP.id(anObject),
                    ' to be a kind of ', TP.name(aType), '.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isMemberOf',
function(anObject, aType, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.isMemberOf(anObject, aType),
            aComment,
            TP.sc('Expected ', TP.id(anObject),
                    ' to be a member of ', TP.name(aType), '.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isMutable',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isMutable(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be mutable.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNamespace',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isNamespace(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a namespace.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNativeType',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isNativeType(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a native type.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isPrototype',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isPrototype(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a prototype.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isReferenceType',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isReferenceType(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a reference type.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isSubtypeOf',
function(anObject, aType, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.isSubtypeOf(anObject, aType),
            aComment,
            TP.sc('Expected ', TP.id(anObject),
                    ' to be a subtype of: ' + TP.name(aType)));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isType',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isType(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a type.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isTypeName',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isTypeName(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a type name.'));
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - GENERAL API / PROPERTY CHECKING
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('canInvoke',
function(anObject, aMethodName, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.canInvoke(anObject, aMethodName),
            aComment,
            TP.sc('Expected ', TP.id(anObject),
                    ' could invoke ', aMethodName, '.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isCallable',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isCallable(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be callable.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isAttribute',
function(anObject, anAttributeName, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.isProperty(anObject, anAttributeName) &&
                !TP.isMethod(anObject[anAttributeName]),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an attribute.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isGlobal',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isGlobal(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a global.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isGlobalMethod',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isGlobalMethod(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a global method.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInstMethod',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isInstMethod(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an instance method.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isLocalMethod',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isLocalMethod(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a local method.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isMethod',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isMethod(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a method.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isOwnProperty',
function(anObject, aPropertyName, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.isOwnProperty(anObject, aPropertyName),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to have an "own" property of:',
                    aPropertyName, '.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isProperty',
function(anObject, aPropertyName, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.isProperty(anObject, aPropertyName),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to have a property of:',
                    aPropertyName, '.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isTypeMethod',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isTypeMethod(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a type method.'));
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - SPECIFIC TYPE CHECKING
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isArgArray',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isArgArray(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject),
                    ' to be an "arguments" object.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isArray',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isArray(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an Array.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isBoolean',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isBoolean(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a Boolean.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isCollection',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isCollection(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a collection.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isDate',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isDate(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a Date.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isError',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isError(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an Error.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEvent',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isEvent(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an Event.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isFunction',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isFunction(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a Function.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isIFrameWindow',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isIFrameWindow(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an iframe.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isHash',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isHash(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an Hash.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isMediaQueryList',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isMediaQueryList(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a media query list.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNaN',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isNaN(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be NaN.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNumber',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isNumber(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a Number.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isPair',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isPair(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a "pair".'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isPlainObject',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isPlainObject(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a "plain" Object.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isRegExp',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isRegExp(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a RegExp.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isString',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isString(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a String.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isStyleDeclaration',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isStyleDeclaration(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a style declaration.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isStyleRule',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isStyleRule(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a style rule.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isStyleSheet',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isStyleSheet(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a style sheet.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isURI',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isURI(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a URI.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isWindow',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isWindow(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a Window.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXHR',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isXHR(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an XHR object.'));
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - BOOLEAN
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isFalse',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isFalse(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be false.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isFalsey',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isFalsey(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be false-like.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isTrue',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isTrue(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be true.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isTruthy',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isTruthy(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be true-like.'));
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - NULL/UNDEFINED/VALID
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isDefined',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isDefined(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be defined.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEmpty',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isEmpty(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be empty.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNull',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isNull(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be null.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isValid',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isValid(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be defined and non-null.'));
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - CONTENT/VALUE
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isBlank',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isBlank(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be blank.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('contains',
function(anObject, someContent, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.contains(anObject, someContent),
            aComment,
            TP.sc('Expected ', TP.id(anObject),
                    ' to contain ', TP.id(someContent)));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('hasKey',
function(anObject, aKeyName, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.keys(anObject).contains(aKeyName),
            aComment,
            TP.sc('Expected ', TP.id(anObject),
                    ' to have a key of: ' + aKeyName));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEmpty',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isEmpty(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be empty.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isSizeOf',
function(anObject, aCount, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.equal(TP.size(anObject), aCount),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be size of: ', aCount));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('matches',
function(anObject, aValue, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.isTrue(aValue.test(anObject)),
            aComment,
            TP.sc('Expected ', TP.dump(anObject), ' to match ', TP.str(aValue), '.'));
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - EQUALITY/IDENTITY
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEqualTo',
function(anObject, aValue, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.equal(anObject, aValue),
            aComment,
            TP.sc('Expected ', TP.dump(anObject), ' and ', TP.dump(aValue),
                    ' to be equal.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isIdenticalTo',
function(anObject, aValue, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.identical(anObject, aValue),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                    ' to be identical.'));
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - CONVERTED VALUE EQUALITY
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isAttributeEqualTo',
function(anObject, attrName, aValue, aComment) {

    var obj,
        val;

    if (!this.assertMinArguments(arguments, 3)) {
        return false;
    }

    obj = TP.unwrap(anObject);
    val = TP.elementGetAttribute(obj, attrName, true);

    return this.assert(
            TP.equal(val, aValue),
            aComment,
            TP.sc('Expected attribute value ', val,
                    ' and ', aValue, ' to be equal.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isHashEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.hash(anObject);

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.equal(val, aValue),
            aComment,
            TP.sc('Expected hash ', val, ' and ', aValue, ' to be equal.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isHTMLEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.htmlstr(anObject);

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.equal(val, aValue),
            aComment,
            TP.sc('Expected HTML ', val, ' and ', aValue, ' to be equal.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isJSONEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.json(anObject);

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.equal(val, aValue),
            aComment,
            TP.sc('Expected JSON ', val, ' and ', aValue, ' to be equal.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isSrcEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.src(anObject);

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.equal(val, aValue),
            aComment,
            TP.sc('Expected JS source ', val, ' and ', aValue, ' to be equal.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isStrEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.str(anObject);

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected string ', val, ' and ', aValue, ' to be equal.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isURIEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.uc(TP.str(anObject));

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.equal(val, aValue),
            aComment,
            TP.sc('Expected URI ', val, ' and ', aValue, ' to be equal.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isValEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.val(anObject);

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.equal(val, aValue),
            aComment,
            TP.sc('Expected value ', val, ' and ', aValue, ' to be equal.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXHTMLEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.xhtmlstr(anObject);

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.equal(val, aValue),
            aComment,
            TP.sc('Expected XHTML ', val, ' and ', aValue, ' to be equal.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXMLEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.xmlstr(anObject);

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.equal(val, aValue),
            aComment,
            TP.sc('Expected XML ', val, ' and ', aValue, ' to be equal.'));
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - MARKUP / ENCODING
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('hasAttribute',
function(anObject, anAttributeName, aComment) {

    var obj;

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.ElementNode.
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.elementHasAttribute(obj, anAttributeName),
            aComment,
            TP.sc('Expected ', TP.id(anObject),
                    ' to have an attribute of: ' + anAttributeName));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isAttributeNode',
function(anObject, aComment) {

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.AttributeNode.
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isAttributeNode(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an attribute node.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isChildNodeOf',
function(anObject, anotherObject, aComment) {

    var obj,
        otherObj,

        childNodes;

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    obj = TP.unwrap(anObject);
    otherObj = TP.unwrap(anotherObject);

    childNodes = TP.nodeGetChildNodes(obj);

    return this.assert(
            childNodes.contains(otherObj, TP.IDENTITY),
            aComment,
            TP.sc('Expected ', TP.id(anObject),
                    ' to be a child of ', TP.id(anotherObject)));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isCommentNode',
function(anObject, aComment) {

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.CommentNode.
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isCommentNode(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a Comment node.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isCDATASectionNode',
function(anObject, aComment) {

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.CDATASectionNode.
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isCDATASectionNode(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a CDATASection node.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isCollectionNode',
function(anObject, aComment) {

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.core.* (CollectionNode of some sort)
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isCollectionNode(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a collection node.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isDocument',
function(anObject, aComment) {

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.DocumentNode
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isDocument(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a Document.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isElement',
function(anObject, aComment) {

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.ElementNode.
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isElement(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an Element.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isFragment',
function(anObject, aComment) {

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.DocumentFragmentNode.
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isFragment(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a document fragment.'));
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

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.HTMLDocumentNode
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isHTMLDocument(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an HTML document.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isHTMLNode',
function(anObject, aComment) {

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.core.* (HTML Node of some sort)
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isHTMLNode(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an HTML node.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isJSONString',
function(aString, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    return this.assert(
            TP.isJSONString(aString),
            aComment,
            TP.sc('Expected ', TP.dump(aString), ' to be a JSON string.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNode',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Strict test - we don't unwrap here.

    return this.assert(
            TP.isNode(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a Node.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNamedNodeMap',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Strict test - we don't unwrap here.

    return this.assert(
            TP.isNamedNodeMap(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a NamedNodeMap.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNodeList',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Strict test - we don't unwrap here.

    return this.assert(
            TP.isNodeList(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a NodeList.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isNodeType',
function(anObject, aNodeType, aComment) {

    var isNode,
        isNodeType;

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    //  Strict test - we don't unwrap here.

    isNode = TP.isNode(anObject);

    isNodeType = this.assert(
                    anObject.nodeType === aNodeType,
                    aComment,
                    TP.sc('Expected ', TP.id(anObject),
                            ' to be a type #', aNodeType, ' Node.'));

    /* eslint-disable no-extra-parens */
    return (isNode && isNodeType);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isProcessingInstructionNode',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Strict test - we don't unwrap here.

    return this.assert(
            TP.isPINode(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject),
                    ' to be a ProcessingInstruction node.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isSVGNode',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Strict test - we don't unwrap here.

    return this.assert(
            TP.isSVGNode(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an SVG Node.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isTextNode',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Strict test - we don't unwrap here.

    return this.assert(
            TP.isTextNode(anObject),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be a text Node.'));
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

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.XMLDocumentNode
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isXHTMLDocument(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an XHTML document.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXHTMLNode',
function(anObject, aComment) {

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.core.* (HTML Node of some sort)
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isXHTMLNode(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an XHTML node.'));
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

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.HTMLDocumentNode
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isXMLDocument(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an XML document.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isXMLNode',
function(anObject, aComment) {

    var obj;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.core.* (HTML Node of some sort)
    obj = TP.unwrap(anObject);
    return this.assert(
            TP.isXMLNode(obj),
            aComment,
            TP.sc('Expected ', TP.id(anObject), ' to be an XML node.'));
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - SIGNALING
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('didSignal',
function(aTarget, aSignal, aComment) {

    var signalName,
        targetGID,
        originMatcher,
        signalMatcher,
        hadMatch,
        any;

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    if (!this.get('currentTestCase').getSuite().get('$capturingSignals')) {
        this.assert(
            false,
            aComment,
            TP.sc('Can\'t check for signaling since',
                    ' we\'re not capturing signals.'));
    }

    if (aTarget === TP.ANY) {
        targetGID = TP.ANY;
    } else if (TP.isValid(aTarget)) {
        targetGID = TP.gid(aTarget);
    }

    if (aSignal === TP.ANY) {
        signalName = TP.ANY;
    } else if (TP.isValid(aSignal)) {
        signalName = TP.isString(aSignal) ? aSignal : TP.name(aSignal);
    }

    any = TP.extern.sinon.match.any;

    //  Note, how we test for truth and only set these flags then. Since these
    //  functions will be called once for each item in the set of all signal
    //  dispatch invocations since we started capturing signals, they very well
    //  may become false *after* they have been set to true, unless the last
    //  item always matches both.

    //  If targetGID is real, then we construct a real matcher. Otherwise, we
    //  use Sinon's 'any' matcher for origins.
    if (TP.isValid(targetGID)) {

        //  Note that we have to use a custom matcher here, because signal
        //  origins can either be a String representing a single origin or an
        //  Array representing an origin set.
        originMatcher = TP.extern.sinon.match(
                function(value) {
                    var val;

                    if (!TP.isString(value) && !TP.isArray(value)) {
                        val = TP.gid(value);
                    } else {
                        val = value;
                    }

                    if (TP.isString(val)) {
                        if (val === targetGID) {
                            return true;
                        }
                    }

                    if (TP.isArray(val)) {
                        return TP.isValid(
                                    val.detect(
                                        function(anItem) {
                                            return TP.gid(anItem) === targetGID;
                                        }));
                    }

                    return false;
                });
    } else {
        originMatcher = any;
    }

    if (TP.isValid(signalName)) {

        //  Note that we have to use a custom matcher here, because signal
        //  types can either be a String representing a single name or a
        //  TP.sig.Signal instance that has to be tested against all of it's
        //  signal names.
        signalMatcher = TP.extern.sinon.match(
                function(value) {
                    var sigType,
                        signal,
                        sigNames,
                        expValueName,
                        expSignalName;

                    //  Some invocations will pass null as signal to support
                    //  origin + TP.ANY. In those cases assume false.
                    if (TP.notValid(value)) {
                        return false;
                    }

                    expSignalName = TP.expandSignalName(signalName);

                    if (TP.isString(value)) {

                        //  work with fully expanded names for matching.
                        expValueName = TP.expandSignalName(value);

                        if (expValueName === expSignalName) {
                            return true;
                        }

                        //  Might have captured a subtype of the target type. We
                        //  need to ask for its signal name list if we can get a
                        //  type.
                        if (!TP.isType(sigType = TP.sys.getTypeByName(
                                expValueName))) {
                            //  See if we can construct a proper instance with
                            //  help from the notification system. NOTE that we
                            //  do _not_ use the expanded name here to avoid
                            //  tilting things too much one way or another.
                            sigType = TP.sig.SignalMap.$getSignalType(value);
                            if (!TP.isType(sigType)) {
                                return false;
                            }
                        }

                        sigNames = sigType.getSignalNames();
                    } else if (TP.isEvent(value)) {
                        signal = TP.wrap(value);
                        sigNames = signal.getSignalNames();
                    } else if (TP.canInvoke(value, 'getSignalNames')) {
                        sigNames = value.getSignalNames();
                    }

                    //  One more special consideration is that when signals are
                    //  spoofed they're not expanded. So to check thoroughly we
                    //  need the sigNames list to contain expanded names.
                    if (TP.notEmpty(sigNames)) {
                        sigNames = sigNames.map(function(name) {
                            return TP.expandSignalName(name);
                        });

                        if (sigNames.contains(expSignalName)) {
                            return true;
                        }
                    }

                    return false;
                });
    } else {
        signalMatcher = TP.extern.sinon.match.any;
    }

    //  Check for matches. We have a couple variants. originID, signalName,
    //  originID, blah, 'payload' used for matching events/keyboard etc.,
    //  and originID, blah, blah, blah, signalType used for spoofed signals.
    hadMatch =
        TP.signal.calledWith(originMatcher, signalMatcher) ||
        TP.signal.calledWith(originMatcher, any, signalMatcher) ||
        TP.signal.calledWith(originMatcher, any, any, any, signalMatcher);

    this.assert(
            hadMatch,
            aComment,
            TP.sc('Expected ', TP.id(aTarget),
                    ' to have signaled ', signalName, '.'));


    return hadMatch;
}, {
    dependencies: [TP.extern.sinon]
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('raises',
function(aFunction, anException) {

    var name,

        suspendedVal,

        exception,

        retVal;

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    if (TP.isValid(anException)) {
        name = TP.isString(anException) ? anException : TP.name(anException);
    }

    //  TP.raise will have been installed as a spy by the test harness to track
    //  exceptions, etc., so we need to restore it here before installing it as
    //  a stub. Since we're intentionally tracking raise calls here, we don't
    //  consider raise()s in this context to be test failures.
    suspendedVal = TP.raise.$suspended;
    TP.raise.restore();

    //  Stub out raise so it doesn't actually invoke/throw etc.
    TP.raise = TP.raise.asStub(
                    function() {
                        exception = arguments[1];
                    });

    //  Here we use 'this.assert(true)' and 'this.assert(false)' so that this
    //  routine 'plays well' with the rest of the assertion framework (refute,
    //  etc.)
    try {
        aFunction();
        if (TP.isValid(exception)) {
            if (TP.isEmpty(name)) {
                this.assert(true);
                retVal = true;
            } else if (TP.str(exception) === name) {
                this.assert(true);
                retVal = true;
            } else {
                this.assert(
                    false,
                    TP.sc('Expected function to raise',
                                TP.notEmpty(name) ? ' ' + name : '.',
                            ' but raised ', TP.dump(exception)));
                retVal = false;
            }
        } else {
            this.assert(
                false,
                TP.sc('Expected function to raise',
                        TP.notEmpty(name) ? ' ' + name : '.'));
            retVal = false;
        }
    } finally {

        //  Restore the core TP.raise() from the stub
        TP.raise.restore();

        //  Reinstall the spy on TP.raise()
        TP.raise = TP.raise.asSpy();
        TP.raise.$suspended = suspendedVal;

        //  Mark this spy with the 'shouldFailTest' property so that it actually
        //  fails tests.
        TP.raise.shouldFailTest = true;
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('signals',
function(aFunction, aSignal) {

    var name,

        suspendedVal,

        signal,

        retVal;

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    if (TP.isValid(aSignal)) {
        name = TP.isString(aSignal) ? aSignal : TP.name(aSignal);
    }

    //  Stub out signal so it doesn't actually invoke/throw etc.
    TP.signal = TP.signal.asStub(
    function() {
        signal = arguments[1];
    });

    //  TP.raise will have been installed as a spy by the test harness to track
    //  exceptions, etc., so we need to restore it here before installing it as
    //  a stub. Since we're intentionally ignoring raise calls here, we don't
    //  consider raise()s in this context to be test failures.
    suspendedVal = TP.raise.$suspended;
    TP.raise.restore();

    //  Stub out raise to avoid seeing any exception output so we stay focused
    //  on the signaling test aspect.
    TP.raise = TP.raise.asStub();

    try {
        aFunction();
    } finally {
        //  Restore the core observer from the stub
        TP.signal.restore();

        //  Restore the core TP.raise() from the stub
        TP.raise.restore();

        //  Reinstall the spy on TP.raise()
        TP.raise = TP.raise.asSpy();
        TP.raise.$suspended = suspendedVal;

        //  Mark this spy with the 'shouldFailTest' property so that it actually
        //  fails tests.
        TP.raise.shouldFailTest = true;
    }

    if (TP.isValid(signal)) {
        if (TP.isEmpty(name)) {
            this.assert(true);
            retVal = true;
        } else if (TP.str(signal).indexOf(name) !== TP.NOT_FOUND) {
            this.assert(true);
            retVal = true;
        } else {
            this.assert(
                false,
                TP.sc('Expected function to signal',
                            TP.notEmpty(name) ? ' ' + name : '.',
                        ' but signaled ' + TP.dump(signal)));
            retVal = false;
        }
    } else {
        this.assert(
            false,
            TP.sc('Expected function to signal',
                    TP.notEmpty(name) ? ' ' + name : '.'));

        retVal = false;
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('throws',
function(aFunction, anError) {

    var name,
        type,

        retVal;

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    if (TP.isValid(anError)) {
        name = TP.isString(anError) ?
                    anError :
                    TP.name(anError);

        type = TP.isString(anError) ?
                    TP.sys.getTypeByName(anError) :
                    anError;
    }

    try {
        aFunction();

        //  Didn't throw. That's a fail for this particular assertion.
        retVal = this.assert(
                        false,
                        TP.sc('Expected function to throw',
                                TP.notEmpty(name) ? ' ' + name : '.'));
    } catch (e) {
        //  success if e matches what's expected
        if (e instanceof type) {
            this.assert(true);
            retVal = true;
        } else {
            //  Didn't throw what we expected.
            this.assert(
                false,
                TP.sc('Expected function to throw',
                            TP.notEmpty(name) ? ' ' + name : ' Error',
                        ' but threw ' + TP.tname(e)));
            retVal = false;
        }
    }

    return retVal;
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

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(TP.isActive(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be active.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isBusy',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(TP.isBusy(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be busy.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isClosed',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(TP.isClosed(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be closed.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isDisabled',
function(anObject, aComment) {

    var obj,

        isElem,
        isDisabled;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.ElementNode.
    obj = TP.unwrap(anObject);

    isElem = TP.isElement(obj);

    isDisabled = this.assert(
                    TP.elementIsDisabled(obj),
                    aComment,
                    TP.sc('Expected ', TP.id(anObject), ' to be disabled.'));

    /* eslint-disable no-extra-parens */
    return (isElem && isDisabled);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isDisplayed',
function(anObject, aComment) {

    var obj,

        isElem,
        isDisplayed;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.ElementNode.
    obj = TP.unwrap(anObject);

    isElem = TP.isElement(obj);

    isDisplayed = this.assert(
                    TP.elementIsDisplayed(obj),
                    aComment,
                    TP.sc('Expected ', TP.id(anObject), ' to be displayed.'));

    /* eslint-disable no-extra-parens */
    return (isElem && isDisplayed);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEnabled',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(!TP.isDisabled(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be enabled.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isFocused',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(TP.isFocused(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be focused.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInactive',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(!TP.isActive(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be inactive.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isInvisible',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(TP.isInvisible(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be invisible.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isOpen',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(!TP.isClosed(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be open.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isReadonly',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(TP.isReadonly(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be readonly.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isRelevant',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(TP.isRelevant(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be relevant.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isRequired',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(TP.isRequired(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be required.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isSelected',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(TP.isSelected(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be selected.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isVisible',
function(anObject, aComment) {

    var obj,

        isElem,
        isVisible;

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.ElementNode.
    obj = TP.unwrap(anObject);

    isElem = TP.isElement(obj);

    isVisible = this.assert(
                    TP.elementIsVisible(obj),
                    aComment,
                    TP.sc('Expected ', TP.id(anObject), ' to be visible.'));

    /* eslint-disable no-extra-parens */
    return (isElem && isVisible);
    /* eslint-enable no-extra-parens */
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

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(TP.notValid(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to have invalid input.');

    TP.todo();

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

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //  this.assert(!TP.notValid(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to have valid input.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - STYLE VALUE TESTS
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('hasComputedStyleProperty',
function(anObject, aProperty, aValue, aComment) {

    var obj,
        val;

    if (!this.assertMinArguments(arguments, 3)) {
        return false;
    }

    //  Just in case we got handed a TP.dom.ElementNode.
    obj = TP.unwrap(anObject);
    val = TP.elementGetComputedStyleProperty(obj, aProperty);

    return this.assert(
            TP.equal(val, aValue),
            aComment,
            TP.sc('Expected style property ', aProperty, ' with value ', val,
                    ' and ', aValue, ' to be equal.'));
});

//  ------------------------------------------------------------------------
//  FAUX ASSERTIONS
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('equalTo',
function(anObject, aValue, aComment) {

    TP.ifWarn() ?
        TP.warn('Invalid assertion method: equalTo.' +
                    ' Use "isEqualTo" instead.') : 0;

    return this.assert(false);
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('identicalTo',
function(anObject, aValue, aComment) {

    TP.ifWarn() ?
        TP.warn('Invalid assertion method: identicalTo.' +
                    ' Use "isIdenticalTo" instead.') : 0;

    return this.assert(false);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
