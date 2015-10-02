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
     * @param {Array} anArgArray The argument Array to check.
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
            TP.sc('Expected ', TP.id(anObject), ' to be a ', aType, '.'));
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
            TP.sc('Expected ', TP.id(anObject), ' to be a kind of ', aType, '.'));
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
            TP.sc('Expected ', TP.id(anObject), ' to be a member of ', aType, '.'));
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
            TP.sc('Expected ', TP.id(anObject), ' to match ', TP.id(aValue), '.'));
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - EQUALITY/IDENTITY
//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEqualAs',
function(anObject, aValue, aType, aComment) {

    if (!this.assertMinArguments(arguments, 3)) {
        return false;
    }

    return this.assert(
            TP.sc(anObject, aValue).equalAs(aType),
            aComment,
            TP.sc('Expected ', TP.str(anObject), ' and ', TP.str(aValue),
                    ' to be equal as ', TP.name(aType), 's.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isEqualTo',
function(anObject, aValue, aComment) {

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    return this.assert(
            TP.equal(anObject, aValue),
            aComment,
            TP.sc('Expected ', TP.str(anObject), ' and ', TP.str(aValue),
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

    var val;

    if (!this.assertMinArguments(arguments, 3)) {
        return false;
    }

    val = TP.elementGetAttribute(anObject, attrName, true);

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

    val = TP.uri(anObject);

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

    //  Just in case we got handed a TP.core.ElementNode.
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

    //  Just in case we got handed a TP.core.AttributeNode.
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

    //  Just in case we got handed a TP.core.CommentNode.
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

    //  Just in case we got handed a TP.core.CDATASectionNode.
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

    //  Just in case we got handed a TP.core.DocumentNode
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

    //  Just in case we got handed a TP.core.ElementNode.
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

    //  Just in case we got handed a TP.core.DocumentFragmentNode.
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

    //  Just in case we got handed a TP.core.HTMLDocumentNode
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
            TP.sc('Expected ', TP.str(aString), ' to be a JSON string.'));
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

    isNode = this.assert(
                TP.isNode(anObject),
                aComment,
                TP.sc('Expected ', TP.id(anObject), ' to be a Node.'));

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

    //  Just in case we got handed a TP.core.XMLDocumentNode
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

    //  Just in case we got handed a TP.core.HTMLDocumentNode
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
function(aTarget, aSignal) {

    var signalName,
        targetGID,

        originMatcher,

        isSpecialSignal,
        signalMatcher,
        eventMatcher,

        hadMatch;

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    if (!this.get('currentTestCase').getSuite().get('$capturingSignals')) {
        this.assert(
            false,
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
        originMatcher = TP.extern.sinon.match.any;
    }

    //  A 'special signal' is one that is either a key or mouse event, but is
    //  not a special TIBET manufactured 'event sequence' (denoted by the double
    //  underscore - '__').
    isSpecialSignal = (TP.regex.KEY_EVENT.test(signalName) ||
                        TP.regex.MOUSE_EVENT.test(signalName)) &&
                        !/__/.test(signalName);

    //  If signalName is real and is not a "special signal", then we construct a
    //  real matcher for signals. Otherwise, we use Sinon's 'any' matcher for
    //  signals.
    if (TP.isValid(signalName) && !isSpecialSignal) {

        //  Note that we have to use a custom matcher here, because signal
        //  types can either be a String representing a single name or a
        //  TP.sig.Signal instance that has to be tested against all of it's
        //  signal names.
        signalMatcher = TP.extern.sinon.match(
                function(value) {
                    var sigType,
                        sig,
                        sigNames;

                    if (TP.isString(value)) {
                        if (value === signalName) {
                            return true;
                        }

                        if (!TP.isType(
                            sigType = TP.sys.getTypeByName(signalName))) {
                            return false;
                        }

                        sig = sigType.construct();
                    } else {
                        sig = value;
                    }

                    if (TP.isKindOf(sig, TP.sig.Signal)) {
                        sigNames = sig.getSignalNames();
                    }

                    if (TP.notEmpty(sigNames) &&
                        sigNames.contains(signalName)) {
                        return true;
                    }

                    return false;
                });
    } else {
        signalMatcher = TP.extern.sinon.match.any;
    }

    //  If signalName is real and is a "special signal", then we construct a
    //  real matcher for events (which will be the 3rd argument to these kinds
    //  of calls to TP.signal). Otherwise, we use Sinon's 'any' matcher for
    //  events.
    if (TP.isValid(signalName) && isSpecialSignal) {

        eventMatcher = TP.extern.sinon.match(
                    function(value) {
                        var signal,
                            sigNames;

                        if (TP.isEvent(value)) {
                            signal = TP.wrap(value);
                            sigNames = signal.getSignalNames();
                            if (sigNames.contains(signalName)) {
                                return true;
                            }
                        }

                        return false;
                    });
    } else {
        eventMatcher = TP.extern.sinon.match.any;
    }

    //  Try the match.
    hadMatch = TP.signal.calledWith(originMatcher, signalMatcher, eventMatcher);

    return this.assert(
            hadMatch,
            TP.sc('Expected ', TP.id(aTarget),
                    ' to have signaled ', signalName, '.'));
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('raises',
function(aFunction, anException) {

    var name,
        exception,

        retVal;

    if (!this.assertMinArguments(arguments, 2)) {
        return false;
    }

    if (TP.isValid(anException)) {
        name = TP.isString(anException) ? anException : TP.name(anException);
    }

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
                            ' but raised ', TP.str(exception)));
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
        TP.raise.restore();
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('signals',
function(aFunction, aSignal) {

    var name,
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

    //  Stub out raise to avoid seeing any exception output so we stay focused
    //  on the signaling test aspect.
    TP.raise = TP.raise.asStub();

    try {
        aFunction();
    } finally {
        TP.signal.restore();
        TP.raise.restore();
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
                        ' but signaled ' + TP.str(signal)));
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

    //this.assert(TP.isActive(anObject), aComment,
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

    //this.assert(TP.isBusy(anObject), aComment,
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

    //this.assert(TP.isClosed(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be closed.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isDisabled',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //this.assert(TP.isDisabled(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be disabled.');

    TP.todo();

    return;
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

    //  Just in case we got handed a TP.core.ElementNode.
    obj = TP.unwrap(anObject);

    isElem = this.assert(
                TP.isElement(obj),
                aComment,
                TP.sc('Expected ', TP.id(anObject), ' to be an Element.'));

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

    //this.assert(!TP.isDisabled(anObject), aComment,
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

    //this.assert(TP.isFocused(anObject), aComment,
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

    //this.assert(!TP.isActive(anObject), aComment,
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

    //this.assert(TP.isInvisible(anObject), aComment,
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

    //this.assert(!TP.isClosed(anObject), aComment,
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

    //this.assert(TP.isReadonly(anObject), aComment,
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

    //this.assert(TP.isRelevant(anObject), aComment,
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

    //this.assert(TP.isRequired(anObject), aComment,
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

    //this.assert(TP.isSelected(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be selected.');

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TestMethodCollection.defineAssertion('isVisible',
function(anObject, aComment) {

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //this.assert(!TP.isInvisible(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be visible.');

    TP.todo();

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

    if (!this.assertMinArguments(arguments, 1)) {
        return false;
    }

    //this.assert(TP.notValid(anObject), aComment,
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

    //this.assert(!TP.notValid(anObject), aComment,
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

    //  Just in case we got handed a TP.core.ElementNode.
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

//  ========================================================================
//  TP.test.Expect
//  ========================================================================

/**
 * @type {TP.test.Expect}
 * @summary A type that can a 'chain' of test expectation methods.
 * @summary This type works by operating a 'method chain'. Each member of
 *     the chain is responsible for executing a piece of logic and then setting
 *     the result of the chain. This result is a Boolean. If any one of the
 *     members of a chain sets the result to false, that result 'sticks' no
 *     matter what further members of the chain set it to. When the chain
 *     finishes executing, this value is check and, if it is false, the entire
 *     chain will have been considered to have failed and the test case itself
 *     will be 'fail()'ed.
 *     Therefore, there are no individual assertions in any of these methods.
 *     They are to simply set the result of the chain to true or false.
 */

TP.lang.Object.defineSubtype('test.Expect');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.test.Expect.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    var chainMethodNames,
        chainDict;

    chainMethodNames = TP.ac(
                        'a',            //  real implementation
                        'above',        //  real implementation
                        'an',           //  real implementation
                        'args',         //  real implementation
                        'at',           //  chain-only
                        'be',           //  chain-only
                        'been',         //  chain-only
                        'below',        //  real implementation
                        'closeTo',      //  real implementation
                        'contain',      //  real implementation
                        'deep',         //  real implementation
                        'empty',        //  real implementation
                        'equal',        //  real implementation
                        'equals',       //  real implementation
                        'eq',           //  real implementation
                        'exist',        //  real implementation
                        'false',        //  real implementation
                        'greaterThan',  //  real implementation
                        'gt',           //  real implementation
                        'identical',    //  real implementation
                        'include',      //  real implementation
                        'itself',       //  real implementation
                        'is',           //  chain-only
                        'has',          //  chain-only
                        'have',         //  chain-only
                        'key',          //  real implementation
                        'keys',         //  real implementation
                        'least',        //  real implementation
                        'lengthOf',     //  real implementation
                        'lessThan',     //  real implementation
                        'lt',           //  real implementation
                        'match',        //  real implementation
                        'members',      //  real implementation
                        'most',         //  real implementation
                        'not',          //  real implementation
                        'null',         //  real implementation
                        'ok',           //  real implementation
                        'of',           //  chain-only
                        'ownProperty',  //  real implementation
                        'property',     //  real implementation
                        'respondTo',    //  real implementation
                        'same',         //  chain-only
                        'satisfy',      //  real implementation
                        'size',         //  real implementation
                        'string',       //  real implementation
                        'that',         //  chain-only
                        'throw',        //  real implementation
                        'throws',       //  real implementation
                        'to',           //  chain-only
                        'true',         //  real implementation
                        'undefined',    //  real implementation
                        'valid',        //  real implementation
                        'with',         //  chain-only
                        'within'        //  real implementation
                        );

    //  Initialize a TP.core.Hash that will use the defined Array as all of its
    //  keys and put the Array at each one of those places in the Hash. This has
    //  the effect, when used below, of creating stub chains from each name
    //  listed to every other name.
    chainDict = TP.hc();
    chainDict.atAllPut(chainMethodNames, chainMethodNames);

    //  Set up the method chains.
    TP.test.Expect.setupMethodChains(chainDict);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The object under test
TP.test.Expect.Inst.defineAttribute('testObj');

//  The test case that the expecter is associated with.
TP.test.Expect.Inst.defineAttribute('testCase');

//  The failure String
TP.test.Expect.Inst.defineAttribute('faultStr');

//  The current result
TP.test.Expect.Inst.defineAttribute('result');

TP.test.Expect.Inst.defineAttribute('$chainDone');

//  Boolean flags
TP.test.Expect.Inst.defineAttribute('$negate');
TP.test.Expect.Inst.defineAttribute('$deep');
TP.test.Expect.Inst.defineAttribute('$contain');
TP.test.Expect.Inst.defineAttribute('$itself');

TP.test.Expect.Inst.defineAttribute('$lengthVal');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('init',
function(anObject, testCase) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {Object} anObject The object to put under test.
     * @param {TP.test.Case} testCase The test case associated with this
     *     expectation. If the expectation fails, this is the test case that
     *     will fail.
     * @returns {TP.test.Expect} The new instance.
     */

    this.callNextMethod();

    this.reset(anObject);

    this.$set('testCase', testCase, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('reset',
function(obj) {

    /**
     * @method reset
     * @summary Reset the instance and use the supplied object as the new
     *     object under test.
     * @param {Object} anObject The object to put under test.
     * @returns {TP.test.Expect} The receiver.
     */

    this.$set('$chainDone', false, false);

    //  Boolean flags
    this.$set('$negate', false, false);
    this.$set('$deep', false, false);
    this.$set('$contain', false, false);
    this.$set('$itself', false, false);

    //  Other values used by assertions
    this.$set('$lengthVal', TP.NO_SIZE, false);

    //  Public objects
    this.$set('testObj', obj, false);
    this.$set('result', false, false);
    this.$set('faultStr', null, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('executeChain',
function() {

    /**
     * @method executeChain
     * @summary Executes the 'chain' of statements constituting the
     *     expectation. Some of these will be real instance methods on this
     *     object and some of them are just part of the 'chain' to make the
     *     expectation easier to read.
     * @returns {TP.test.Expect} The receiver.
     */

    var chain,
        len,
        i,

        chainName,
        testCase;

    chain = this.get('$$methodChainNames');

    //  NB: We go to length - 1 here, since we don't want to execute the last
    //  item in the chain (which should be the method that invoked us - we don't
    //  want to endlessly recurse).
    len = chain.getSize();
    for (i = 0; i < len - 1; i++) {

        chainName = chain.at(i);

        if (TP.canInvoke(this, chainName)) {
            try {
                this[chainName]();
            } catch (e) {
                if (TP.isValid(testCase = this.get('testCase'))) {
                    testCase.error(e);
                }

                //  Make sure to rethrow the Error so that handlers 'higher up'
                //  will also catch it.
                throw e;
            }
        }
    }

    this.set('$chainDone', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('isProcessingChain',
function() {

    /**
     * @method isProcessingChain
     * @summary Whether or not we're in the middle of processing the chain.
     * @returns {Boolean} Whether or not we're processing the chain.
     */

    return !this.get('$chainDone');
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('setResult',
function(aValue) {

    /**
     * @method setResult
     * @summary Sets the result of the expection to the supplied value. Note
     *     that if the expectation has been negated somewhere in its chain, this
     *     method is where the value inversion is performed.
     * @param {Boolean} aValue The Boolean result value.
     * @returns {TP.test.Expect} The receiver.
     */

    var testCase,

        faultStr;

    //  If the expectation has been negated somewhere along the way, invert the
    //  Boolean result.
    this.$set('result', TP.isTrue(this.get('$negate')) ? !aValue : aValue);

    //  If we're *not* processing the chain, it must mean we're done. If we have
    //  a valid test case and the value is false, then fail the test case.
    if (!this.isProcessingChain() &&
        TP.isValid(testCase = this.get('testCase'))) {

        //  Note here how we make sure to fetch the result since it might have
        //  been 'flipped' above.
        if (!this.get('result')) {

            faultStr = this.get('faultStr');
            testCase.fail(faultStr || '');
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS
//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('a',
function(aType) {

    var testVal,
        retVal;

    if (!TP.isType(aType) && !TP.isString(aType)) {
        return this.raise('TP.sig.InvalidType');
    }

    this.executeChain();

    testVal = this.get('testObj');
    retVal = TP.isKindOf(testVal, aType);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be a kind of ', aType, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be a kind of ', aType, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'a' is 'an' - note that this resets the TP.NAME and TP.DISPLAY
//  of the method
TP.test.Expect.Inst.defineMethod('an', TP.test.Expect.Inst.a);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('above',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isNumber(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj')) &&
        !TP.isNumber(testVal = this.get('$lengthVal'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    retVal = testVal > aValue;

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length above ' :
                            ' to be above ',
                        aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length at most ' :
                            ' to be at most ',
                        aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'above' is 'gt' - note that this resets the TP.NAME and TP.DISPLAY
//  of the method
TP.test.Expect.Inst.defineMethod('gt', TP.test.Expect.Inst.above);

//  Alias for 'above' is 'greaterThan' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('greaterThan', TP.test.Expect.Inst.above);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('args',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isArgArray(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be an Arguments object.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be an Arguments object'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('below',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isNumber(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj')) &&
        !TP.isNumber(testVal = this.get('$lengthVal'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    retVal = testVal < aValue;

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length below ' :
                            ' to be below ',
                        aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length at least ' :
                            ' to be at least ',
                        aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'below' is 'lt' - note that this resets the TP.NAME and TP.DISPLAY
//  of the method
TP.test.Expect.Inst.defineMethod('lt', TP.test.Expect.Inst.below);

//  Alias for 'below' is 'lessThan' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('lessThan', TP.test.Expect.Inst.below);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('closeTo',
function(expectedVal, delta) {

    var testVal,

        retVal;

    if (!TP.isNumber(expectedVal) || !TP.isNumber(delta)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    retVal = (testVal - expectedVal).abs() <= delta;

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        ' to not be close to ', expectedVal,
                        ' +/- ', delta, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        ' to be close to ', expectedVal,
                        ' +/- ', delta, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('contain',
function(aValue) {

    var testVal,
        retVal;

    if (this.isProcessingChain()) {
        //  This flag is later used by the 'keys' assertions
        this.set('$contain', true);
    } else {

        if (TP.notValid(aValue)) {
            return this.raise('TP.sig.InvalidParameter');
        }

        this.executeChain();

        if (!TP.isCollection(testVal = this.get('testObj'))) {
            return this.raise('TP.sig.InvalidCollection');
        }

        retVal = TP.contains(this.get('testObj'), aValue);

        if (!retVal) {
            if (TP.isTrue(this.get('$negate'))) {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to not include ', aValue, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to have include ', aValue, '.'));
            }
        }

        this.set('result', retVal);
    }

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'contain' is 'include' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('include', TP.test.Expect.Inst.contain);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('deep',
function() {

    //  This flag is later used by the 'equal', 'property' and 'members'
    //  assertions
    this.set('$deep', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('empty',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isEmpty(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be empty.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be empty.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('equal',
function(anObject) {

    var testVal,
        retVal;

    if (TP.notValid(anObject)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.executeChain();

    testVal = this.get('testObj');

    if (this.get('$deep')) {
        retVal = TP.equal(testVal, anObject);
    } else {
        retVal = TP.identical(testVal, anObject);
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not equal ', anObject, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to equal ', anObject, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'equal' is 'equals' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('equals', TP.test.Expect.Inst.equal);

//  Alias for 'equal' is 'eq' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('eq', TP.test.Expect.Inst.equal);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('exist',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isValid(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not exist.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to exist.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'exist' is 'valid' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('valid', TP.test.Expect.Inst.exist);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('false',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isFalse(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be true.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be false.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('identical',
function(anObject) {

    var testVal,
        retVal;

    if (TP.notValid(anObject)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.identical(testVal, anObject);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be identical to ', anObject, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be identical to ', anObject, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('itself',
function(aValue) {

    //  This flag is later used by the 'respondTo' assertion
    this.set('$itself', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('key',
function(aKey) {

    var testVal,
        testKeys,
        retVal;

    if (!TP.isString(aKey)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid String supplied.');
    }

    this.executeChain();

    testVal = this.get('testObj');

    testKeys = TP.keys(testVal);

    if (this.get('$contain')) {
        retVal = testKeys.contains(aKey);
    } else {
        //  There has to be an exact match here.
        retVal = testKeys.getSize() === 1 && testKeys.first() === aKey;
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not contain ', aKey, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to contain ', aKey, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('keys',
function(aKeyArray) {

    var testKeys,
        testVal,
        retVal;

    if (!TP.isArray(aKeyArray)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Array supplied.');
    }

    this.executeChain();

    testVal = this.get('testObj');

    testKeys = TP.keys(testVal);

    if (this.get('$contain')) {
        retVal = testKeys.containsAll(aKeyArray);
    } else {
        //  There has to be an exact match here.
        retVal = testKeys.getSize() === aKeyArray.getSize() &&
                    testKeys.containsAll(aKeyArray);
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not contain ', aKeyArray, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to contain ', aKeyArray, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('least',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isNumber(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj')) &&
        !TP.isNumber(testVal = this.get('$lengthVal'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    retVal = testVal >= aValue;

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length below ' :
                            ' to be below ',
                        aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length at least ' :
                            ' to be at least ',
                        aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('lengthOf',
function(aValue) {

    var testVal,
        retVal;

    if (this.isProcessingChain()) {
        //  This value can be used later by 'above', 'least', 'below', 'most'
        //  and 'within'
        this.set('$lengthVal', TP.size(this.get('testObj')));
    } else {

        if (!TP.isNumber(aValue)) {
            return this.raise('TP.sig.InvalidParameter',
                                'Invalid Number supplied.');
        }

        this.executeChain();

        testVal = this.get('testObj');

        retVal = TP.size(testVal) === aValue;

        if (!retVal) {
            if (TP.isTrue(this.get('$negate'))) {
                this.set('faultStr',
                    TP.sc('Expected ', testVal,
                            ' to not have a length of ', aValue, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', testVal,
                            ' to have a length of ', aValue, '.'));
            }
        }

        this.set('result', retVal);
    }

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'lengthOf' is 'size' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('size', TP.test.Expect.Inst.lengthOf);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('match',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isRegExp(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid RegExp supplied.');
    }

    this.executeChain();

    testVal = this.get('testObj');
    retVal = aValue.test(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        ' to not match ', aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        ' to match ', aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('members',
function(setArray) {

    var testVal,
        comparisonTest,
        retVal;

    if (!TP.isArray(setArray)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Array supplied.');
    }

    this.executeChain();

    if (!TP.isArray(testVal = this.get('testObj'))) {
        return this.raise('TP.sig.InvalidArray');
    }

    if (this.get('$deep')) {
        comparisonTest = TP.EQUALITY;
    } else {
        comparisonTest = TP.IDENTITY;
    }

    if (this.get('$contain')) {
        retVal = TP.isEmpty(setArray.difference(testVal, comparisonTest));
    } else {
        retVal = testVal.containsAll(setArray);
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isTrue(this.get('$contain')) ?
                            ' to not be a superset of ' :
                            ' to not have the same members as ',
                        setArray, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isTrue(this.get('$contain')) ?
                            ' to be a superset of ' :
                            ' to have the same members as ',
                        setArray, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('most',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isNumber(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj')) &&
        !TP.isNumber(testVal = this.get('$lengthVal'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    retVal = testVal <= aValue;

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length above ' :
                            ' to be above ',
                        aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length at most ' :
                            ' to be at most ',
                        aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('not',
function() {

    this.set('$negate', !this.get('$negate'));

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('null',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isNull(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be null.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be null.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('ok',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isTruthy(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be truthy.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be truthy.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('ownProperty',
function(aName, aValue) {

    var testVal,
        retVal;

    //  aValue isn't required, but aName is

    if (!TP.isString(aName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isOwnProperty(testVal, aName);

    if (TP.isTrue(retVal) && TP.notEmpty(aValue)) {
        retVal = TP.val(testVal, aName) === aValue;
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            if (TP.isEmpty(aValue)) {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to not have an "own" property of ', aName, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to not have an "own" property of ', aName,
                            ' with value ', aValue, '.'));
            }
        } else {
            if (TP.isEmpty(aValue)) {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to have an "own" property of ', aName, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to have an "own" property of ', aName,
                            ' with value ', aValue, '.'));
            }
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('property',
function(aName, aValue) {

    var testVal,
        retVal;

    //  aValue isn't required, but aName is

    if (!TP.isString(aName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isProperty(testVal, aName);

    if (TP.isTrue(retVal) && TP.notEmpty(aValue)) {
        retVal = TP.val(testVal, aName) === aValue;
    }

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            if (TP.isEmpty(aValue)) {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to not have a property of ', aName, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to not have a property of ', aName,
                            ' with value ', aValue, '.'));
            }
        } else {
            if (TP.isEmpty(aValue)) {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to have a property of ', aName, '.'));
            } else {
                this.set('faultStr',
                    TP.sc('Expected ', TP.id(testVal),
                            ' to have a property of ', aName,
                            ' with value ', aValue, '.'));
            }
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('respondTo',
function(methodName) {

    var testVal,
        track,
        retVal;

    if (!TP.isString(methodName)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid method name supplied.');
    }

    this.executeChain();

    if (TP.notValid(testVal = this.get('testObj'))) {
        return this.raise('TP.sig.InvalidObject');
    }

    if (TP.isType(testVal)) {
        if (this.get('$itself')) {
            track = TP.TYPE_LOCAL_TRACK;
        } else {
            track = TP.TYPE_TRACK;
        }
    } else {
        if (this.get('$itself')) {
            track = TP.LOCAL_TRACK;
        } else {
            track = TP.INST_TRACK;
        }
    }

    retVal = TP.isMethod(testVal.getMethod(methodName, track));

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not respond to ', methodName, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to respond to ', methodName, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('satisfy',
function(aFunction) {

    var testVal,
        retVal;

    if (!TP.isFunction(aFunction)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Function supplied.');
    }

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isTrue(aFunction(testVal));

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not satisfy ', TP.str(aFunction), '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to satisfy ', TP.str(aFunction), '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('string',
function(aValue) {

    var testVal,
        retVal;

    if (!TP.isString(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid String supplied.');
    }

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.str(this.get('testObj')).contains(aValue);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not contain ', aValue, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to contain ', aValue, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('throw',
function(errorConstructor, errMsg, comment) {

    var expectedErrMsg,
        TheConstructor,

        testObj,

        desiredError,
        name,
        thrownError,

        retVal,

        faultStr;

    expectedErrMsg = errMsg;
    TheConstructor = errorConstructor;

    desiredError = null;
    name = null;
    thrownError = null;

    if (arguments.length === 0) {
        expectedErrMsg = null;
        TheConstructor = null;
    } else if (TP.isRegExp(TheConstructor) || TP.isString(TheConstructor)) {
        expectedErrMsg = TheConstructor;
        TheConstructor = null;
    } else if (TP.isError(TheConstructor)) {
        desiredError = TheConstructor;
        expectedErrMsg = null;
        TheConstructor = null;
    } else if (TP.isNativeType(TheConstructor)) {
        name = TP.name(TheConstructor.prototype) || TP.name(TheConstructor);
        if (name === 'Error' && TheConstructor !== Error) {
            name = TP.name(new TheConstructor());
        }
    } else {
        TheConstructor = null;
    }

    this.executeChain();

    testObj = this.get('testObj');

    retVal = false;

    try {
        testObj();
    } catch (err) {
        if (TP.isValid(desiredError)) {
            retVal = err === desiredError;
            if (!retVal) {
                faultStr = TP.sc('Expected ', TP.id(testObj),
                                    ' to throw ',
                                    TP.str(desiredError),
                                    ' instead of ',
                                    TP.str(err));
            }
        } else if (TP.isValid(TheConstructor)) {
            retVal = err instanceof TheConstructor;
            if (!retVal) {
                faultStr = TP.sc('Expected ', TP.id(testObj),
                                    ' to throw ',
                                    name,
                                    ' instead of ',
                                    TP.str(err));
            }
        } else if (!TP.isEmpty(err.message)) {
            if (TP.isRegExp(expectedErrMsg)) {
                retVal = expectedErrMsg.test(err.message);
            } else if (TP.isString(expectedErrMsg)) {
                retVal = err.message.contains(expectedErrMsg);
            }

            if (!retVal) {
                faultStr = TP.sc('Expected ', TP.id(testObj),
                                    ' to throw error matching ',
                                    TP.str(expectedErrMsg),
                                    ' but got ',
                                    err.message);
            }
        }

        thrownError = err;
    }

    if (!retVal && TP.isEmpty(faultStr)) {
        /* eslint-disable no-nested-ternary */
        faultStr = TP.sc(
                    'Expected ', TP.id(testObj),
                    ' to throw ',
                    TP.notEmpty(name) ? name :
                        TP.isValid(desiredError) ? TP.str(desiredError) :
                        'an error',
                    ' instead of ',
                    TP.str(thrownError));
        /* eslint-enable no-nested-ternary */
    }

    this.set('result', retVal);
    this.set('faultStr', faultStr);

    return this;
});

//  ------------------------------------------------------------------------

//  Alias for 'throw' is 'throws' - note that this resets the TP.NAME and
//  TP.DISPLAY of the method
TP.test.Expect.Inst.defineMethod('throws', TP.test.Expect.Inst.throw);

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('true',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = TP.isTrue(testVal);

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be false.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be true.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('undefined',
function() {

    var testVal,
        retVal;

    this.executeChain();

    testVal = this.get('testObj');

    retVal = !TP.isDefined(this.get('testObj'));

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to not be undefined.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', TP.id(testVal),
                        ' to be undefined.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.Inst.defineMethod('within',
function(start, finish) {

    var testVal,
        retVal;

    if (!TP.isNumber(start) || !TP.isNumber(finish)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid Number supplied.');
    }

    this.executeChain();

    if (!TP.isNumber(testVal = this.get('testObj')) &&
        !TP.isNumber(testVal = this.get('$lengthVal'))) {
        return this.raise('TP.sig.InvalidNumber');
    }

    /* eslint-disable no-extra-parens */
    retVal = (testVal >= start && testVal <= finish);
    /* eslint-enable no-extra-parens */

    if (!retVal) {
        if (TP.isTrue(this.get('$negate'))) {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to not have a length within ' :
                            ' to not be within ',
                        start, '..', finish, '.'));
        } else {
            this.set('faultStr',
                TP.sc('Expected ', testVal,
                        TP.isValid(this.get('$lengthVal')) ?
                            ' to have a length within ' :
                            ' to be within ',
                        start, '..', finish, '.'));
        }
    }

    this.set('result', retVal);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
