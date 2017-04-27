//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.core.Content Transactions
//  ========================================================================

TP.core.XMLContent.Inst.describe('Transactions',
function() {

    var modelObj,
        xmlPath1;

    //  ---

    this.before(function() {

        TP.sys.shouldUseContentCheckpoints(true);

        xmlPath1 = TP.apc('/emp/lname').set('shouldCollapse', true);
    });

    //  ---

    this.beforeEach(function() {

        modelObj = TP.core.XMLContent.construct('<emp><lname valid="true">Jones</lname><age>47</age></emp>');

        modelObj.shouldSignalChange(true);

        this.getSuite().startTrackingSignals();
    });

    //  ---

    this.afterEach(function() {

        this.getSuite().stopTrackingSignals();
    });

    //  ---

    this.it('Checkpoint', function(test, options) {

        var val,
            numSnaps;

        //  Ensure that the last name is correct
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        xmlPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');
    });

    //  ---

    this.it('Checkpoint then move back', function(test, options) {

        var val,
            numSnaps;

        //  Ensure that the last name is correct
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        xmlPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Go back.
        modelObj.back();

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling so that we know that when we go back again,
        //  we'll *not* get another currentIndex or TP.sig.ValueChange signal
        //  (we're already at the end).
        test.getSuite().resetSignalTracking();

        //  ---

        //  Shouldn't be able to go back any further than the current snapshot
        modelObj.back();

        //  ---

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');
    });

    //  ---

    this.it('Checkpoint then move back then forward', function(test, options) {

        var val,
            numSnaps;

        //  Ensure that the last name is correct
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        xmlPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  Go back.
        modelObj.back();

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling so that we know that when we go back again,
        //  we'll *not* get another currentIndex or TP.sig.ValueChange signal.
        test.getSuite().resetSignalTracking();

        //  ---

        //  Then go forward. This should restore the most current data set.
        modelObj.forward();

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Now, reset the signaling so that we know that when we go forward
        //  again, we'll *not* get another currentIndex or TP.sig.ValueChange
        //  signal (we're already at the end).
        test.getSuite().resetSignalTracking();

        //  ---

        //  Shouldn't be able to go forward any further than the current
        //  snapshot
        modelObj.forward();

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');
    });

    //  ---

    this.it('Checkpoint multiple times and commit', function(test, options) {

        var val,
            numSnaps;

        //  Ensure that the last name is correct
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        xmlPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Now, reset the signaling.
        test.getSuite().resetSignalTracking();

        //  ---

        //  Checkpoint the data
        modelObj.checkpoint();

        //  There should now be 2 snapshots
        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 2);

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        xmlPath1.executeSet(modelObj, 'Jones', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling.
        test.getSuite().resetSignalTracking();

        //  ---

        //  Commit the model - this will cause it to flush its snapshots and
        //  just use its current data.
        modelObj.commit();

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  There should now be a single snapshot, the initial one.
        test.assert.isEqualTo(modelObj.get('snaps').getSize(), 1);

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');
    });

    //  ---

    this.it('Checkpoint multiple times and rollback', function(test, options) {

        var val,
            numSnaps;

        //  Ensure that the last name is correct
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        xmlPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Now, reset the signaling.
        test.getSuite().resetSignalTracking();

        //  ---

        //  Checkpoint the data
        modelObj.checkpoint();

        //  There should now be 2 snapshots
        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 2);

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        xmlPath1.executeSet(modelObj, 'Jones', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling.
        test.getSuite().resetSignalTracking();

        //  ---

        //  Rollback the model - this will cause it to flush its snapshots and
        //  use the data that was present before checkpointing occurred.
        modelObj.rollback();

        //  Rolling back changes our index, so ensure that is signaled.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');

        //  Make sure the model signaled a value change though.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  There should now be a single snapshot, the initial one.
        test.assert.isEqualTo(modelObj.get('snaps').getSize(), 1);

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');
    });

    //  ---

    this.it('Checkpoint to named checkpoint then checkpoint then move back to the named checkpoint', function(test, options) {

        var val,
            numSnaps,
            numPoints;

        //  Ensure that the last name is correct
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data to the
        //  baseline checkpoint.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        xmlPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Checkpoint the data into a named checkpoint
        modelObj.checkpoint('Test1');

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 2);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Checkpoint the data twice more into unnamed checkpoints
        modelObj.checkpoint();
        modelObj.checkpoint();

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 4);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        xmlPath1.executeSet(modelObj, 'Berry', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Berry');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Go back to the named 'Test1' checkpoint.
        modelObj.back('Test1');

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');
    });

    //  ---

    this.it('Checkpoint to named checkpoint then checkpoint then move back to the named checkpoint and commit', function(test, options) {

        var val,
            numSnaps,
            numPoints;

        //  Ensure that the last name is correct
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data to the
        //  baseline checkpoint.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Checkpoint the data into a named checkpoint
        modelObj.checkpoint('Test2');

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 2);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Checkpoint the data twice more into unnamed checkpoints
        modelObj.checkpoint();
        modelObj.checkpoint();

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 4);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        xmlPath1.executeSet(modelObj, 'Berry', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Berry');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Go back to the named 'Test2' checkpoint.
        modelObj.back('Test2');

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Commit the model - this will cause it to flush its snapshots and
        //  just use its current data.
        modelObj.commit();

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  There should now be a single snapshot, the initial one.
        test.assert.isEqualTo(modelObj.get('snaps').getSize(), 1);

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');
    });

    //  ---

    this.it('Checkpoint to named checkpoint then checkpoint then move back to the named checkpoint and rollback', function(test, options) {

        var val,
            numSnaps,
            numPoints;

        //  Ensure that the last name is correct
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data to the
        //  baseline checkpoint.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Checkpoint the data into a named checkpoint
        modelObj.checkpoint('Test3');

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 2);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Checkpoint the data twice more into unnamed checkpoints
        modelObj.checkpoint();
        modelObj.checkpoint();

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 4);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        xmlPath1.executeSet(modelObj, 'Berry', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Berry');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Go back to the named 'Test3' checkpoint.
        modelObj.back('Test3');

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Rollback the model - this will cause it to flush its snapshots and
        //  use the data that was present before checkpointing occurred.
        modelObj.rollback();

        //  Rolling back changes our index, so ensure that is signaled.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');

        //  Make sure the model signaled a value change though.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  There should now be a single snapshot, the initial one.
        test.assert.isEqualTo(modelObj.get('snaps').getSize(), 1);

        //  Make sure the value is what we think it should be
        val = TP.val(xmlPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');
    });
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.describe('Transactions',
function() {

    var modelObj,
        jsonPath1;

    //  ---

    this.before(function() {

        TP.sys.shouldUseContentCheckpoints(true);

        jsonPath1 = TP.apc('$.emp.lname').set('shouldCollapse', true);
    });

    //  ---

    this.beforeEach(function() {

        modelObj = TP.core.JSONContent.construct('{"emp":{"lname":"Jones","age":"47"}}');

        modelObj.shouldSignalChange(true);

        this.getSuite().startTrackingSignals();
    });

    //  ---

    this.afterEach(function() {

        this.getSuite().stopTrackingSignals();
    });

    //  ---

    this.it('Checkpoint', function(test, options) {

        var val,
            numSnaps;

        //  Ensure that the last name is correct
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        jsonPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');
    });

    //  ---

    this.it('Checkpoint then move back', function(test, options) {

        var val,
            numSnaps;

        //  Ensure that the last name is correct
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        jsonPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Go back.
        modelObj.back();

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling so that we know that when we go back again,
        //  we'll *not* get another currentIndex or TP.sig.ValueChange signal
        //  (we're already at the end).
        test.getSuite().resetSignalTracking();

        //  ---

        //  Shouldn't be able to go back any further than the current snapshot
        modelObj.back();

        //  ---

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');
    });

    //  ---

    this.it('Checkpoint then move back then forward', function(test, options) {

        var val,
            numSnaps;

        //  Ensure that the last name is correct
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        jsonPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  Go back.
        modelObj.back();

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling so that we know that when we go back again,
        //  we'll *not* get another currentIndex or TP.sig.ValueChange signal.
        test.getSuite().resetSignalTracking();

        //  ---

        //  Then go forward. This should restore the most current data set.
        modelObj.forward();

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Now, reset the signaling so that we know that when we go forward
        //  again, we'll *not* get another currentIndex or TP.sig.ValueChange
        //  signal (we're already at the end).
        test.getSuite().resetSignalTracking();

        //  ---

        //  Shouldn't be able to go forward any further than the current
        //  snapshot
        modelObj.forward();

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');
    });

    //  ---

    this.it('Checkpoint multiple times and commit', function(test, options) {

        var val,
            numSnaps;

        //  Ensure that the last name is correct
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        jsonPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Now, reset the signaling.
        test.getSuite().resetSignalTracking();

        //  ---

        //  Checkpoint the data
        modelObj.checkpoint();

        //  There should now be 2 snapshots
        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 2);

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        jsonPath1.executeSet(modelObj, 'Jones', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling.
        test.getSuite().resetSignalTracking();

        //  ---

        //  Commit the model - this will cause it to flush its snapshots and
        //  just use its current data.
        modelObj.commit();

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  There should now be a single snapshot, the initial one.
        test.assert.isEqualTo(modelObj.get('snaps').getSize(), 1);

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');
    });

    //  ---

    this.it('Checkpoint multiple times and rollback', function(test, options) {

        var val,
            numSnaps;

        //  Ensure that the last name is correct
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        jsonPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Now, reset the signaling.
        test.getSuite().resetSignalTracking();

        //  ---

        //  Checkpoint the data
        modelObj.checkpoint();

        //  There should now be 2 snapshots
        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 2);

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        jsonPath1.executeSet(modelObj, 'Jones', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling.
        test.getSuite().resetSignalTracking();

        //  ---

        //  Rollback the model - this will cause it to flush its snapshots and
        //  use the data that was present before checkpointing occurred.
        modelObj.rollback();

        //  Rolling back changes our index, so ensure that is signaled.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');

        //  Make sure the model signaled a value change though.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  There should now be a single snapshot, the initial one.
        test.assert.isEqualTo(modelObj.get('snaps').getSize(), 1);

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');
    });

    //  ---

    this.it('Checkpoint to named checkpoint then checkpoint then move back to the named checkpoint', function(test, options) {

        var val,
            numSnaps,
            numPoints;

        //  Ensure that the last name is correct
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data to the
        //  baseline checkpoint.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        jsonPath1.executeSet(modelObj, 'Smith', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');

        //  ---

        //  Checkpoint the data into a named checkpoint
        modelObj.checkpoint('Test1');

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 2);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Checkpoint the data twice more into unnamed checkpoints
        modelObj.checkpoint();
        modelObj.checkpoint();

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 4);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        jsonPath1.executeSet(modelObj, 'Berry', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Berry');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Go back to the named 'Test1' checkpoint.
        modelObj.back('Test1');

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Smith');
    });

    //  ---

    this.it('Checkpoint to named checkpoint then checkpoint then move back to the named checkpoint and commit', function(test, options) {

        var val,
            numSnaps,
            numPoints;

        //  Ensure that the last name is correct
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data to the
        //  baseline checkpoint.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Checkpoint the data into a named checkpoint
        modelObj.checkpoint('Test2');

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 2);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Checkpoint the data twice more into unnamed checkpoints
        modelObj.checkpoint();
        modelObj.checkpoint();

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 4);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        jsonPath1.executeSet(modelObj, 'Berry', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Berry');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Go back to the named 'Test2' checkpoint.
        modelObj.back('Test2');

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Commit the model - this will cause it to flush its snapshots and
        //  just use its current data.
        modelObj.commit();

        //  Make sure the model did *not* signal, either the current index
        //  change or a value change.
        test.refute.didSignal(modelObj, 'CurrentIndexChange');
        test.refute.didSignal(modelObj, 'TP.sig.ValueChange');

        //  There should now be a single snapshot, the initial one.
        test.assert.isEqualTo(modelObj.get('snaps').getSize(), 1);

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');
    });

    //  ---

    this.it('Checkpoint to named checkpoint then checkpoint then move back to the named checkpoint and rollback', function(test, options) {

        var val,
            numSnaps,
            numPoints;

        //  Ensure that the last name is correct
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Turn on transactional behavior. This will checkpoint the data to the
        //  baseline checkpoint.
        modelObj.isTransactional(true);

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 1);

        //  Ensure that the last name is correct after the checkpoint
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Checkpoint the data into a named checkpoint
        modelObj.checkpoint('Test3');

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 2);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Checkpoint the data twice more into unnamed checkpoints
        modelObj.checkpoint();
        modelObj.checkpoint();

        numSnaps = modelObj.get('snaps').getSize();
        test.assert.isEqualTo(numSnaps, 4);

        numPoints = modelObj.get('points').getSize();
        test.assert.isEqualTo(numPoints, 1);

        //  ---

        //  Set the last name value. This should set the value in the latest
        //  snapshot
        jsonPath1.executeSet(modelObj, 'Berry', true);

        //  Make sure the model signaled.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Berry');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Go back to the named 'Test3' checkpoint.
        modelObj.back('Test3');

        //  Make sure the model signaled, both the current index change and a
        //  value change.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');

        //  ---

        //  Now, reset the signaling so that we know that when we go back, we'll
        //  get another TP.sig.ValueChange signal
        test.getSuite().resetSignalTracking();

        //  ---

        //  Rollback the model - this will cause it to flush its snapshots and
        //  use the data that was present before checkpointing occurred.
        modelObj.rollback();

        //  Rolling back changes our index, so ensure that is signaled.
        test.assert.didSignal(modelObj, 'CurrentIndexChange');

        //  Make sure the model signaled a value change though.
        test.assert.didSignal(modelObj, 'TP.sig.ValueChange');

        //  There should now be a single snapshot, the initial one.
        test.assert.isEqualTo(modelObj.get('snaps').getSize(), 1);

        //  Make sure the value is what we think it should be
        val = TP.val(jsonPath1.executeGet(modelObj));
        test.assert.isEqualTo(val, 'Jones');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
