/*--------------------------------------------------------
Promises Workshop: Build a Deferral-Style Implementation

We are going to write a promise library similar to $q & Q,
called vow.js. Our promises will be named "pledges" to avoid
triggering existing browser code. To focus on concepts, vow.js
will use many public variables and not be standards-compliant.
In a stricter deferral system, a pledge could not be directly
tampered with, only manipulated by its parent deferral or
its .then method.

To execute the spec, run testem in this directory. When you
pass a test, change the next pending test from 'xit' to 'it'.
This spec is iterative and opinionated; do the tests in order.
--------------------------------------------------------*/

describe('Chapter 1',function(){});
/*======================================================


                         d888
                        d8888
                          888
                          888
                          888
                          888
                          888
                        8888888


Chapter 1: Basic Structure and State Changes
--------------------------------------------------------
We are going to start with some essential pieces and begin
to define how a deferral is related to a promise. This should
be pretty easy.
========================================================*/

describe('The vow.js library', function(){

  it('has Pledge & Deferral classes', function(){
    expect(
      typeof Pledge   === 'function' &&
      typeof Deferral === 'function'
    ).toBe( true );
  });

  xit('has a defer function that returns unique deferrals', function(){
    var defer1 = defer();
    expect( defer1 instanceof Deferral ).toBe( true );
    var defer2 = defer();
    expect( defer2 ).not.toBe( defer1 );
  });

});

describe('A deferral', function(){

  var deferral;
  beforeEach(function(){
    myDeferral = defer();
  });

  // Reminder: methods should (usually) be defined on the prototype.
  xit('has .resolve, .reject, and .notify methods', function(){
    expect(
      typeof myDeferral.resolve === 'function' &&
      typeof myDeferral.reject  === 'function' &&
      typeof myDeferral.notify  === 'function'
    ).toBe( true );
  });

  xit('is associated with a unique pledge', function(){
    var pledge1 = myDeferral.pledge;
    expect( pledge1 instanceof Pledge ).toBe( true );
    var pledge2 = defer().pledge;
    expect( pledge2 ).not.toBe( pledge1 );
  });

});

describe('A deferral\'s associated pledge', function(){

  var deferral, pledge;
  beforeEach(function(){
    deferral = defer();
    pledge   = deferral.pledge;
  });

  xit('starts with "pending" state', function(){
    expect( pledge.state ).toBe( 'pending' );
  });

  xit('has an array of handler groups', function(){
    expect( Array.isArray(pledge.handlerGroups) ).toBe( true );
  });

  xit('has an array of update callbacks', function(){
    expect( Array.isArray(pledge.updateCbs) ).toBe( true );
  });

  xit('has a .then method', function(){
    expect( typeof pledge.then ).toBe( 'function' );
  });

});

// We have some scaffolding set up, now let's work on behavior.
describe('Resolving through a deferral', function(){

  var deferral, pledge;
  beforeEach(function(){
    deferral = defer();
    pledge   = deferral.pledge;
  });

  xit('(usually) changes its pledge state to "fulfilled"', function(){
    /* Why not "resolved"? Strictly speaking, a promise can resolve
    successfully (fulfillment) or unsuccessfully (rejection). In $q/Q,
    .resolve normally fulfills the promise, but can in some edge cases
    result in a pending or rejected promise. However, for now you may
    consider resolve and fulfill to mean the same thing. */
    deferral.resolve();
    expect( pledge.state ).toBe( 'fulfilled' );
  });

  xit('can send data to the pledge for storage', function(){
    var someData = { name: 'Gabriel' };
    deferral.resolve( someData );
    expect( pledge.value ).toBe( someData );
  });

  xit('can only happen one time', function(){
    var data1 = { name: 'Gabriel' };
    var data2 = { name: 'Gabe' };
    deferral.resolve( data1 );
    deferral.resolve( data2 );
    expect( pledge.value ).toBe( data1 );
  });

  xit('works even with falsey values', function(){
    var data1 = null;
    var data2 = 'oops!';
    deferral.resolve( data1 );
    deferral.resolve( data2 );
    expect( pledge.value ).toBe( data1 );
  });

});

describe('Rejecting through a deferral', function(){

  var deferral, pledge;
  beforeEach(function(){
    deferral = defer();
    pledge   = deferral.pledge;
  });

  xit('changes its pledge state to "rejected"', function(){
    deferral.reject();
    expect( pledge.state ).toBe( 'rejected' );
  });

  xit('can send a reason to the pledge for storage', function(){
    var myReason = { error: 'bad request' };
    deferral.reject( myReason );
    expect( pledge.value ).toBe( myReason );
  });

  xit('can only happen one time', function(){
    var reason1 = { error: 'bad request' };
    var reason2 = { error: 'timed out' };
    deferral.reject( reason1 );
    deferral.reject( reason2 );
    expect( pledge.value ).toBe( reason1 );
  });

  xit('works even with falsey values', function(){
    var reason1 = null;
    var reason2 = 'oops!';
    deferral.reject( reason1 );
    deferral.reject( reason2 );
    expect( pledge.value ).toBe( reason1 );
  });

});

describe('The first event wins:', function(){

  var deferral, pledge;
  beforeEach(function(){
    deferral = defer();
    pledge   = deferral.pledge;
  });

  xit('reject does not overwrite resolve', function(){
    deferral.resolve( 'Gabriel' );
    deferral.reject( 404 );
    expect( pledge.state ).toBe( 'fulfilled' );
    expect( pledge.value ).toBe( 'Gabriel' );
  });

  xit('resolve does not overwrite reject', function(){
    deferral.reject( 404 );
    deferral.resolve( 'Gabriel' );
    expect( pledge.state ).toBe( 'rejected' );
    expect( pledge.value ).toBe( 404 );
  });

});

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


Chapter 2: Attaching and Calling Handlers to a Promise
--------------------------------------------------------
We are beginning to see how a deferral can manipulate a promise.
But what does a promise actually do? How can a promise be used?
If you can complete this chapter, you will understand the
fundamentals of how promises let you act on eventual information.
========================================================*/

describe('A pledge\'s .then method', function(){

  var deferral, pledge;
  beforeEach(function(){
    deferral = defer();
    pledge   = deferral.pledge;
  });
  var successFn = function (data)   { console.log( data ); };
  var errorFn   = function (reason) { console.log( reason ); };
  var updateFn  = function (info)   { console.log( info ); };

  xit('adds groups of handlers (functions) to the pledge', function(){
    pledge.then( successFn , errorFn, updateFn );
    expect( pledge.handlerGroups[0].onFulfill ).toBe( successFn );
    expect( pledge.handlerGroups[0].onReject  ).toBe( errorFn );
    // Update callbacks are handled differently from success and error cbs.
    // There are different solutions for this; we just use a separate array.
    expect( pledge.updateCbs[0] ).toBe( updateFn );
  });

  xit('can be called multiple times to add more handlers', function(){
    var s2 = function (d) { console.log(d); };
    var f2 = function (r) { console.log(r); };
    var u2 = function (i) { console.log(i); };
    pledge.then( successFn , errorFn, updateFn );
    expect( pledge.handlerGroups[0].onFulfill ).toBe( successFn );
    expect( pledge.handlerGroups[0].onReject  ).toBe( errorFn );
    expect( pledge.updateCbs[0] ).toBe( updateFn );
    pledge.then( s2, f2, u2 );
    expect( pledge.handlerGroups[1].onFulfill ).toBe( s2 );
    expect( pledge.handlerGroups[1].onReject  ).toBe( f2 );
    expect( pledge.updateCbs[1] ).toBe( u2 );
  });

  xit('only attaches functions', function(){
    var notFunc = 'I am a string';
    pledge.then( null, errorFn, notFunc );
    expect( pledge.handlerGroups[0].onFulfill ).toBe( undefined );
    expect( pledge.handlerGroups[0].onReject  ).toBe( errorFn );
    expect( pledge.updateCbs ).toEqual( [] );
  });

});

// Getting to the main functionality
describe('A pledge', function(){

  var numDeferral, pledgeForNum, foo;
  beforeEach(function(){
    numDeferral  = defer();
    pledgeForNum = numDeferral.pledge;
    foo = 0;
  });
  var setFoo10 = function ()    { foo  = 10;  };
  var addToFoo = function (num) { foo += num; };

  describe('that is not yet fulfilled', function(){

    xit('does not call any success handlers yet', function(){
      pledgeForNum.then( setFoo10 );
      expect( foo ).toBe( 0 );
    });

  });

  describe('that is already fulfilled', function(){

    beforeEach(function(){
      numDeferral.resolve( 25 );
    });

    // Recommended: add a .handle method to your pledge prototype.
    xit('calls a success handler added by .then', function(){
      pledgeForNum.then( setFoo10 );
      expect( foo ).toBe( 10 );
    });

    xit('calls a success handler by passing in the pledge\'s value', function(){
      pledgeForNum.then( addToFoo );
      expect( foo ).toBe( 25 );
    });

    xit('calls each success handler once per attachment, in order', function(){
      pledgeForNum.then( setFoo10 );
      pledgeForNum.then( addToFoo );
      pledgeForNum.then( addToFoo );
      expect( foo ).toBe( 60 );
    });

  });

  // So we can run callbacks if we already have the value.
  // But what if events occur in opposite order?
  describe('that already has a success handler', function(){

    xit('calls that handler when fulfilled', function(){
      pledgeForNum.then( setFoo10 );
      expect( foo ).toBe( 0 );
      numDeferral.resolve();
      expect( foo ).toBe( 10 );
    });

    xit('calls all its success handlers one time when fulfilled', function(){
      pledgeForNum.then( setFoo10 );
      pledgeForNum.then( addToFoo );
      expect( foo ).toBe( 0 );
      numDeferral.resolve( 25 );
      expect( foo ).toBe( 35 );
    });

  });

  // We've just made something pretty nifty:
  xit('can attach behavior before & after fulfillment!', function(){
    pledgeForNum.then( setFoo10 );
    // foo is still 0 because pledgeForNum isn't fulfilled…
    expect( foo ).toBe( 0 );
    // Now we fulfill the pledge via its deferral, so setFoo10 is called.
    numDeferral.resolve( 25 );
    expect( foo ).toBe( 10 );
    // But we can still tell pledgeForNum things to do with its value:
    pledgeForNum.then( addToFoo );
    expect( foo ).toBe( 35 );
    // So, we can add actions to pledges regardless of their current state,
    // and know the actions will occur if and when the pledge is resolved.
  });

});

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
and notification is a little different. Finish up the
"callback aggregation" aspect of promises in this chapter.
========================================================*/

describe('Another pledge', function(){

  var thingDeferral, pledgeForThing, log;
  beforeEach(function(){
    thingDeferral  = defer();
    pledgeForThing = thingDeferral.pledge;
    log = [];
  });
  var logOops = function () { log.push({ code: 'oops' }); };
  var logInput = function (input) { log.push( input ); };

  describe('that is not yet rejected', function(){

    xit('does not call error handlers yet', function(){
      pledgeForThing.then( null, logOops );
      expect( log ).toEqual( [] );
    });

  });

  describe('that is already rejected', function(){

    beforeEach(function(){
      thingDeferral.reject({ code: 'timed out' });
    });

    xit('does not call any success handlers', function(){
      pledgeForThing.then( logOops );
      expect( log ).toEqual( [] );
    });

    xit('calls an error handler added by .then', function(){
      pledgeForThing.then( null, logOops );
      expect( log ).toEqual( [{code: 'oops'}] );
    });

    xit('calls an error handler by passing in the pledge\'s value', function(){
      pledgeForThing.then( null, logInput );
      expect( log ).toEqual( [{code: 'timed out'}] );
    });

    xit('calls each error handler once per attachment, in order', function(){
      pledgeForThing.then( null, logInput );
      pledgeForThing.then( null, logInput );
      pledgeForThing.then( null, logOops );
      expect( log ).toEqual(
        [{code: 'timed out'}, {code: 'timed out'}, {code: 'oops'}]
      );
    });

  });

  describe('that already has an error handler', function(){

    xit('calls that handler when rejected', function(){
      pledgeForThing.then( null, logInput );
      expect( log ).toEqual( [] );
      thingDeferral.reject( {code: 500} );
      expect( log ).toEqual( [{code: 500}] );
    });

    xit('calls all its error handlers one time when rejected', function(){
      pledgeForThing.then( null, logInput );
      pledgeForThing.then( null, logOops );
      expect( log ).toEqual( [] );
      thingDeferral.reject( {code: 'unauthorized'} );
      expect( log ).toEqual( [{code: 'unauthorized'}, {code: 'oops'}] );
    });

  });

  describe('with both success and error handlers', function(){

    var ui;
    beforeEach(function(){
      ui = { animals: ['kitten', 'puppy'], warning: null };
      pledgeForThing.then(
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
      expect( pledgeForThing.handlerGroups ).toEqual( [] );
    });

  });

});

// A quick detour while we are finishing rejections:
// add a .catch(fn) convenience method to your pledge prototype.
// Hint: the internals of this method can be coded as one short line.
describe('A pledge\'s .catch(errorFn) method', function(){

  var log, deferral, pledge;
  beforeEach(function(){
     deferral = defer();
     pledge = deferral.pledge;
     log = [];
  });
  var logIt = function (reason) { log.push( reason ); };

  xit('attaches errorFn as an error handler', function(){
    pledge.catch( logIt );
    expect( pledge.handlerGroups[0].onReject ).toBe( logIt );
    expect( pledge.handlerGroups[0].onFulfill ).toBe( undefined );
    deferral.reject( 'err' );
    expect( log[0] ).toBe( 'err' );
  });

  // This spec may seem arbitrary now, but will become important in Ch. 4.
  xit('returns the same thing that .then would', function(){
    var return1 = pledge.catch( logIt );
    var return2 = pledge.then( null, logIt );
    expect( return1 ).toEqual( return2 );
  });

});

// The .notify method is slightly different:
describe('A deferral\'s .notify method', function(){

  var downloadDeferral, pledgeForDownload, progress;
  beforeEach(function(){
    downloadDeferral  = defer();
    pledgeForDownload = downloadDeferral.pledge;
    loadingBar = 0;
  });
  var add10 = function () { loadingBar += 10; };
  var setLoadingBar = function (num) { loadingBar = num; };

  xit('calls a pledge\'s update handler attached via .then', function(){
    pledgeForDownload.then(null, null, add10);
    expect( loadingBar ).toBe( 0 );
    downloadDeferral.notify( 'hello' );
    expect( loadingBar ).toBe( 10 );
  });

  xit('calls an update handler with some information', function(){
    pledgeForDownload.then(null, null, setLoadingBar);
    expect( loadingBar ).toBe( 0 );
    downloadDeferral.notify( 17 );
    expect( loadingBar ).toBe( 17 );
  });

  xit('never affects the pledge\'s value', function(){
    downloadDeferral.notify( 50 );
    expect( pledgeForDownload.value ).toBe( undefined );
  });

  xit('calls all attached update handlers', function(){
    pledgeForDownload.then(null, null, add10);
    pledgeForDownload.then(null, null, add10);
    expect( loadingBar ).toBe( 0 );
    downloadDeferral.notify( 'hi there' );
    expect( loadingBar ).toBe( 20 );
  });

  xit('only works while the pledge is pending', function(){
    pledgeForDownload.then(null, null, setLoadingBar);
    downloadDeferral.notify( 50 );
    expect( loadingBar ).toBe( 50 );
    downloadDeferral.resolve( ['foo', 'bar'] );
    downloadDeferral.notify( 75 );
    expect( loadingBar ).toBe( 50 );
  });

  xit('can be called multiple times before fulfillment/rejection', function(){
    pledgeForDownload.then(null, null, setLoadingBar);
    downloadDeferral.notify( 12 );
    expect( loadingBar ).toBe( 12 );
    downloadDeferral.notify( 38 );
    expect( loadingBar ).toBe( 38 );
    downloadDeferral.reject( 'corrupted data' );
    downloadDeferral.notify( 54 );
    expect( loadingBar ).toBe( 38 );
  });

});

describe('Chapter 4',function(){});
/*=======================================================


                          d8888
                         d8P888
                        d8P 888
                       d8P  888
                      d88   888
                      8888888888
                            888
                            888


Chapter 4: Promises Can Return Values and Chain Together
---------------------------------------------------------
A crucial aspect of promises is that .then always returns
a new promise. When values are returned from promise A's
handler, they bubble out and are represented by the return
promise B. This leads to amazingly versatile behavior:
choosing when to catch errors, chaining promises together,
easily passing around promised values and acting on them
where convenient. This chapter will be a challenge.
========================================================*/

describe('For a given pledgeA (pA),', function(){

  var deferralA, pledgeA;
  beforeEach(function(){
    deferralA = defer();
    pledgeA = deferralA.pledge;
  });
  var thisReturnsHi = function () { return 'hi'; };
  var thisThrowsErr = function () { throw 'err'; };

  xit('.then adds a new deferral to its handler group', function(){
    pledgeA.then();
    expect( pledgeA.handlerGroups[0].forwarder instanceof Deferral ).toBe( true );
  });

  xit('.then returns the pledge from that deferral', function(){
    var pledgeB = pledgeA.then();
    expect( pledgeB ).toBe( pledgeA.handlerGroups[0].forwarder.pledge );
  });

  describe('the pledgeB (pB) returned by .then', function(){

    // Fulfillment bubbles down to the first available success handler.
    xit('is fulfilled with pA.value if pA is fulfilled but has no success handler', function(){
      var pledgeB = pledgeA.then();
      deferralA.resolve( 9001 );
      expect( pledgeB.state ).toBe( 'fulfilled' );
      expect( pledgeB.value ).toBe( 9001 );
    });

    // Rejection bubbles down to the first available error handler.
    xit('is rejected with pA.value if pA is rejected but has no error handler', function(){
      var pledgeB = pledgeA.then();
      deferralA.reject( 'darn' );
      expect( pledgeB.state ).toBe( 'rejected' );
      expect( pledgeB.value ).toBe( 'darn' );
    });

    // Exceptions cause the returned promise to be rejected with the error.
    // Hint: you need to know how to use try-catch to make this work.
    xit('is rejected with e if pA\'s success handler throws an error e', function(){
      var pledgeB = pledgeA.then( thisThrowsErr );
      deferralA.resolve();
      expect( pledgeB.state ).toBe( 'rejected' );
      expect( pledgeB.value ).toBe( 'err' );
    });

    xit('is rejected with e if pA\'s error handler throws an error e', function(){
      var pledgeB = pledgeA.catch( thisThrowsErr );
      deferralA.reject();
      expect( pledgeB.state ).toBe( 'rejected' );
      expect( pledgeB.value ).toBe( 'err' );
    });

    // This is for normal (non-promise) return values
    xit('is fulfilled with the return value of pA\'s success handler', function(){
      var pledgeB = pledgeA.then( thisReturnsHi );
      deferralA.resolve( 'an ordinary value' );
      expect( pledgeB.state ).toBe( 'fulfilled' );
      expect( pledgeB.value ).toBe( 'hi' );
    });

    // This is for normal (non-promise) return values
    xit('is fulfilled with the return value of pA\'s error handler', function(){
      /* Why fulfilled? This is similar to try-catch. If pledgeA is
      rejected (equivalent to try failed), we pass the reason to
      pledgeA's error handler (equivalent to catch). We have now
      successfully handled the error, so pledgeB should represent
      the error handler returning something useful, not a new error.
      PledgeB should only be rejected if the error handler itself
      fails somehow (which we already addressed in a previous test). */
      var pledgeB = pledgeA.catch( thisReturnsHi );
      deferralA.reject();
      expect( pledgeB.state ).toBe( 'fulfilled' );
      expect( pledgeB.value ).toBe( 'hi' );
    });

    xit('can chain .then many times', function(){
      var add1 = function (num) { return ++num; };
      var test = 0;
      pledgeA.then( add1 ).then( add1 ).then().then( function (data) {
        test = data;
      });
      deferralA.resolve( 0 );
      expect( test ).toBe( 2 );
    });

    /* What if pledgeA returns a pledgeX? You could handle pX like a
    normal value, but then you have to start writing .then inside .then.
    Instead, we want to make pledgeB resolve/reject with pX's
    resolve/reject data – in essence, to "become" pX by following pX's
    behavior. This test is a brain-bender. */
    xit('mimics pledgeX if pA\'s success handler returns pledgeX', function(){
      var deferralX = defer();
      var pledgeX = deferralX.pledge;
      var pledgeB = pledgeA.then( function () { return pledgeX; } );
      deferralA.resolve();
      deferralX.resolve( 'testing' );
      expect( pledgeB.value ).toBe( 'testing' );
    });

    xit('mimics pledgeX if pA\'s error handler returns pledgeX', function(){
      var deferralX = defer();
      var pledgeX = deferralX.pledge;
      var pledgeB = pledgeA.catch( function () { return pledgeX; } );
      deferralA.reject();
      deferralX.resolve( 'testing' );
      expect( pledgeB.value ).toBe( 'testing' );
    });

  });
  // You could bubble notifications too, but we will skip that.
});

describe('Chapter 5',function(){});
/*=======================================================


                        888888888
                        888
                        888
                        8888888b.
                             "Y88b
                               888
                        Y88b  d88P
                         "Y8888P"


Chapter 5: Utility Functions for Fun & Profit
---------------------------------------------------------
Wow! If you got this far, congratulations. We omitted certain
details (e.g. handlers must always be called in a true async
wrapper), but you have built a promise library with most of
the standard behavior. If you are up to the task, there are a few
indispensable secondary methods that will be good to understand.
========================================================*/

// all() is probably the most useful utility function in promise libraries.
describe('The vow.js all() function', function(){

  xit('takes an array of pledges', function(){

  });

});
