describe('Chapter 2: Fulfillment Callback Attachment',function(){});
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
  function s1 (data)   { /* use data */ }
  function e1 (reason) { /* handle reason */ }
  function s2 (d) { /* use d */ }
  function e2 (r) { /* handle r */ }

  xit('adds groups of handlers (callback functions) to the promise', function(){
    promise.then( s1, e1 );
    expect( promise.handlerGroups[0].successCb ).toBe( s1 );
    expect( promise.handlerGroups[0].errorCb   ).toBe( e1 );
  });

  xit('can be called multiple times to add more handlers', function(){
    promise.then( s1, e1 );
    expect( promise.handlerGroups[0].successCb ).toBe( s1 );
    expect( promise.handlerGroups[0].errorCb   ).toBe( e1 );
    promise.then( s2, e2 );
    expect( promise.handlerGroups[1].successCb ).toBe( s2 );
    expect( promise.handlerGroups[1].errorCb   ).toBe( e2 );
  });

  xit('attaches a falsy value in place of non-function success or error callbacks', function(){
    promise.then( 'a string', {} );
    expect( promise.handlerGroups[0].successCb ).toBeFalsy();
    expect( promise.handlerGroups[0].errorCb   ).toBeFalsy();
  });

});

// Getting to the main functionality
describe('A promise', function(){

  var numDeferral, promiseForNum, foo;
  var setFoo10 = jasmine.createSpy().and.callFake(function () { foo = 10; });
  var addToFoo = jasmine.createSpy().and.callFake(function (num) { foo += num; });
  beforeEach(function(){
    numDeferral = defer();
    promiseForNum = numDeferral.$promise;
    foo = 0;
    setFoo10.calls.reset();
    addToFoo.calls.reset();
  });

  describe('that is not yet resolved', function(){

    xit('does not call any success handlers yet', function(){
      promiseForNum.then( setFoo10 );
      expect( setFoo10 ).not.toHaveBeenCalled();
    });

  });

  describe('that is already resolved', function(){

    beforeEach(function(){
      numDeferral.resolve( 25 );
    });

    // Recommended: add a .callHandlers method to your promise prototype.

    xit('calls a success handler added by .then', function(){
      promiseForNum.then( setFoo10 );
      expect( setFoo10 ).toHaveBeenCalled();
    });

    xit("calls a success handler by passing in the promise's value", function(){
      promiseForNum.then( addToFoo );
      expect( addToFoo ).toHaveBeenCalledWith( 25 );
    });

    xit('calls each success handler once per attachment', function(){
      promiseForNum.then( setFoo10 );
      promiseForNum.then( addToFoo );
      promiseForNum.then( addToFoo );
      expect( setFoo10.calls.count() ).toBe( 1 );
      expect( addToFoo.calls.count() ).toBe( 2 );
      expect( addToFoo ).toHaveBeenCalledWith( 25 );
    });

    xit('calls each success handler when added', function(){
      promiseForNum.then( setFoo10 );
      expect( foo ).toBe( 10 );
      promiseForNum.then( addToFoo );
      expect( foo ).toBe( 35 );
    });

  });

  // So we can run callbacks if we already have the value.
  // But what if events occur in opposite order?
  describe('that already has a success handler', function(){

    xit('calls that handler when resolved', function(){
      promiseForNum.then( setFoo10 );
      numDeferral.resolve();
      expect( setFoo10 ).toHaveBeenCalled();
    });

    xit('calls all its success handlers in order one time when resolved', function(){
      promiseForNum.then( setFoo10 );
      promiseForNum.then( addToFoo );
      numDeferral.resolve( 25 );
      expect( foo ).toBe( 35 );
    });

  });

});

/*
We've just made something nifty. A promise's .then can
attach behavior both before & after the promise is actually
resolved, and we know that the actions will run when they can.
The .then method can also be called multiple times, so you can
attach callbacks to run in different parts of your code, and
they will all run once the promise is resolved.
*/
