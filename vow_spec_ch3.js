describe('Chapter 3',function(){});
/*=======================================================


                         .d8888b.
                        d88P  Y88b
                             .d88P
                            8888"
                             "Y8b.
                        888    888
                        Y88b  d88P
                         "Y8888P"


Chapter 3: Completing the Handlers: Rejection & Notification
---------------------------------------------------------
With .resolve sending and .then acting on data, we have
a major part of promises working. Rejection is similar,
but notification is a little different. Finish up the
"callback aggregation" aspect of promises in this chapter.
========================================================*/

describe('Another promise', function(){

  var thingDeferral, promiseForThing, log, fn;
  fn = {
    logOops: function () { log.push({ code: 'oops' }); },
    logInput: function (input) { log.push( input ); }
  };
  beforeEach(function(){
    thingDeferral  = defer();
    promiseForThing = thingDeferral.$promise;
    log = [];
    spyOn( fn, 'logOops' ).and.callThrough();
    spyOn( fn, 'logInput' ).and.callThrough();
  });

  describe('that is not yet rejected', function(){

    xit('does not call error handlers yet', function(){
      promiseForThing.then( null, fn.logOops );
      expect( fn.logOops ).not.toHaveBeenCalled();
    });

  });

  describe('that is already rejected', function(){

    var myReason = { code: 'timed out' };
    beforeEach(function(){
      thingDeferral.reject( myReason );
    });

    xit('does not call any success handlers', function(){
      promiseForThing.then( fn.logOops );
      expect( fn.logOops ).not.toHaveBeenCalled();
    });

    xit('calls an error handler added by .then', function(){
      promiseForThing.then( null, fn.logOops );
      expect( fn.logOops ).toHaveBeenCalled();
    });

    xit("calls an error handler by passing in the promise's value", function(){
      promiseForThing.then( null, fn.logInput );
      expect( fn.logInput ).toHaveBeenCalledWith( myReason );
    });

    xit('calls each error handler once per attachment', function(){
      promiseForThing.then( null, fn.logOops );
      promiseForThing.then( null, fn.logOops );
      expect( fn.logOops.calls.count() ).toBe( 2 );
    });

    xit('calls each error handler in the order added', function(){
      promiseForThing.then( null, fn.logOops );
      promiseForThing.then( null, fn.logInput );
      expect( log ).toEqual( [{ code: 'oops'}, {code: 'timed out'}] );
    });

  });

  describe('that already has an error handler', function(){

    var myReason = { code: 'unauthorized' };

    xit('calls that handler when rejected', function(){
      promiseForThing.then( null, fn.logInput );
      thingDeferral.reject( myReason );
      expect( fn.logInput ).toHaveBeenCalledWith( myReason );
    });

    xit('calls all its error handlers one time when rejected', function(){
      promiseForThing.then( null, fn.logInput );
      promiseForThing.then( null, fn.logOops );
      thingDeferral.reject( myReason );
      expect( log ).toEqual( [{code: 'unauthorized'}, {code: 'oops'}] );
    });

  });

  // Demonstration — the next two specs should pass already
  describe('with both success and error handlers', function(){

    var ui;
    beforeEach(function(){
      ui = { animals: ['kitten', 'puppy'], warning: null };
      promiseForThing.then(
        function thingSuccess (thing) {
          ui.animals.push( thing.animal );
        },
        function thingError (reason) {
          ui.warning = reason.message;
        }
      );
    });

    xit('can do stuff with fulfilled data', function(){
      thingDeferral.resolve({ animal: 'duckling' });
      expect( ui.animals[2] ).toBe( 'duckling' );
    });

    xit('can deal with rejection reasons', function(){
      thingDeferral.reject({ message: 'unauthorized' });
      expect( ui.warning ).toBe( 'unauthorized' );
    });

    // Optional but recommended garbage collection
    xit('discards handlers that are no longer needed', function(){
      thingDeferral.resolve({ animal: 'chipmunk' });
      expect( promiseForThing.handlerGroups ).toEqual( [] );
    });

  });

});

// A quick detour while we are finishing rejections:
// add a .catch(fn) convenience method to your promise prototype.
// Hint: the internals of this method can be coded as one short line.
describe("A promise's .catch(errorFn) method", function(){

  var log, deferral, promise;
  beforeEach(function(){
     deferral = defer();
     promise = deferral.$promise;
     log = [];
  });
  var logIt = function (reason) { log.push( reason ); };

  xit('attaches errorFn as an error handler', function(){
    promise.catch( logIt );
    expect( promise.handlerGroups[0].onReject ).toBe( logIt );
    expect( promise.handlerGroups[0].onFulfill ).toBe( undefined );
    deferral.reject( 'err' );
    expect( log[0] ).toBe( 'err' );
  });

  // This spec may seem arbitrary now, but will become important in Ch. 4.
  xit('returns the same kind of thing that .then would', function(){
    var return1 = promise.catch( logIt );
    var return2 = promise.then( null, logIt );
    expect( return1 ).toEqual( return2 );
  });

});

// The .notify method is slightly different:
describe("A deferral's .notify method", function(){

  var downloadDeferral, promiseForDownload, progress;
  beforeEach(function(){
    downloadDeferral  = defer();
    promiseForDownload = downloadDeferral.$promise;
    loadingBar = 0;
  });
  var add10 = function () { loadingBar += 10; };
  var setLoadingBar = function (num) { loadingBar = num; };

  xit("calls a promise's update handler attached via .then", function(){
    promiseForDownload.then(null, null, add10);
    expect( loadingBar ).toBe( 0 );
    downloadDeferral.notify( 'hello' );
    expect( loadingBar ).toBe( 10 );
  });

  xit('calls an update handler with some information', function(){
    promiseForDownload.then(null, null, setLoadingBar);
    expect( loadingBar ).toBe( 0 );
    downloadDeferral.notify( 17 );
    expect( loadingBar ).toBe( 17 );
  });

  xit("never affects the promise's value", function(){
    downloadDeferral.notify( 50 );
    expect( promiseForDownload.value ).toBe( undefined );
  });

  xit('calls all attached update handlers', function(){
    promiseForDownload.then(null, null, add10);
    promiseForDownload.then(null, null, add10);
    expect( loadingBar ).toBe( 0 );
    downloadDeferral.notify( 'hi there' );
    expect( loadingBar ).toBe( 20 );
  });

  xit('only works while the promise is pending', function(){
    promiseForDownload.then(null, null, setLoadingBar);
    downloadDeferral.notify( 50 );
    expect( loadingBar ).toBe( 50 );
    downloadDeferral.resolve( ['foo', 'bar'] );
    downloadDeferral.notify( 75 );
    expect( loadingBar ).toBe( 50 );
  });

  xit('can be called multiple times before fulfillment/rejection', function(){
    promiseForDownload.then(null, null, setLoadingBar);
    downloadDeferral.notify( 12 );
    expect( loadingBar ).toBe( 12 );
    downloadDeferral.notify( 38 );
    expect( loadingBar ).toBe( 38 );
    downloadDeferral.reject( 'corrupted data' );
    downloadDeferral.notify( 54 );
    expect( loadingBar ).toBe( 38 );
  });

});
