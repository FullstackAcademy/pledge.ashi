describe('Chapter 2',function(){});
/*======================================================


                         .d8888b.
                        d88P  Y88b
                               888
                             .d88P
                         .od888P"
                        d88P"
                        888"
                        888888888


Chapter 2: Attaching and Calling Promise Event Handlers
--------------------------------------------------------
We are beginning to see how a deferral can manipulate a
promise. But what does a promise actually do? How can one be
used? By completing this chapter, you will learn the
fundamentals of how promises act on eventual information.
========================================================*/

describe("A promise's .then method", function(){

  var deferral, promise;
  beforeEach(function(){
    deferral = defer();
    promise  = deferral.$promise;
  });
  var successCb = function (data)   { /* use data */ };
  var errorCb   = function (reason) { /* handle reason */ };
  var updateCb  = function (info)   { /* act on info */ };

  xit('adds groups of handlers (functions) to the promise', function(){
    promise.then( successCb , errorCb, updateCb );
    expect( promise.handlerGroups[0].onFulfill ).toBe( successCb );
    expect( promise.handlerGroups[0].onReject  ).toBe( errorCb );
    // Update callbacks are handled differently from success and error cbs.
    expect( promise.updateCbs[0] ).toBe( updateCb );
  });

  xit('can be called multiple times to add more handlers', function(){
    var s2 = function (d) { /* use d */ };
    var f2 = function (r) { /* handle r */ };
    var u2 = function (i) { /* act on i */ };
    promise.then( successCb , errorCb, updateCb );
    expect( promise.handlerGroups[0].onFulfill ).toBe( successCb );
    expect( promise.handlerGroups[0].onReject  ).toBe( errorCb );
    expect( promise.updateCbs[0] ).toBe( updateCb );
    promise.then( s2, f2, u2 );
    expect( promise.handlerGroups[1].onFulfill ).toBe( s2 );
    expect( promise.handlerGroups[1].onReject  ).toBe( f2 );
    expect( promise.updateCbs[1] ).toBe( u2 );
  });

  xit('only attaches functions', function(){
    promise.then( 'a string', errorCb, 6275309 );
    expect( promise.handlerGroups[0].onFulfill ).toBeFalsy();
    expect( promise.handlerGroups[0].onReject  ).toBe( errorCb );
    expect( promise.updateCbs ).toEqual( [] );
  });

});

// Getting to the main functionality
describe('A promise', function(){

  var numDeferral, promiseForNum, foo, fn;
  fn = {
    setFoo10: function () { foo = 10; },
    addToFoo: function (num) { foo += num; }
  };
  beforeEach(function(){
    numDeferral = defer();
    promiseForNum = numDeferral.$promise;
    foo = 0;
    spyOn( fn, 'setFoo10' ).and.callThrough();
    spyOn( fn, 'addToFoo' ).and.callThrough();
  });

  describe('that is not yet fulfilled', function(){

    xit('does not call any success handlers yet', function(){
      promiseForNum.then( fn.setFoo10 );
      expect( fn.setFoo10 ).not.toHaveBeenCalled();
    });

  });

  describe('that is already fulfilled', function(){

    beforeEach(function(){
      numDeferral.resolve( 25 );
    });

    // Recommended: add a .handle method to your promise prototype.
    xit('calls a success handler added by .then', function(){
      promiseForNum.then( fn.setFoo10 );
      expect( fn.setFoo10 ).toHaveBeenCalled();
    });

    xit("calls a success handler by passing in the promise's value", function(){
      promiseForNum.then( fn.addToFoo );
      expect( fn.addToFoo ).toHaveBeenCalledWith( 25 );
    });

    xit('calls each success handler once per attachment', function(){
      promiseForNum.then( fn.addToFoo );
      promiseForNum.then( fn.addToFoo );
      expect( fn.addToFoo.calls.count() ).toBe( 2 );
    });

    xit('calls each success handler in the order added', function(){
      promiseForNum.then( fn.setFoo10 );
      promiseForNum.then( fn.addToFoo );
      expect( foo ).toBe( 35 );
    });

  });

  // So we can run callbacks if we already have the value.
  // But what if events occur in opposite order?
  describe('that already has a success handler', function(){

    xit('calls that handler when fulfilled', function(){
      promiseForNum.then( fn.setFoo10 );
      numDeferral.resolve();
      expect( fn.setFoo10 ).toHaveBeenCalled();
    });

    xit('calls all its success handlers one time when fulfilled', function(){
      promiseForNum.then( fn.setFoo10 );
      promiseForNum.then( fn.addToFoo );
      numDeferral.resolve( 25 );
      expect( foo ).toBe( 35 );
    });

  });

  /*
  We've just made something nifty. A promise's .then can
  attach behavior both before & after the promise is actually
  resolved, and we know that the actions will run when they can.
  */

});
