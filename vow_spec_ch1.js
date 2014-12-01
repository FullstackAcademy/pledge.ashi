/*--------------------------------------------------------
Promises Workshop: Build a Deferral-Style Implementation

We are going to write a promise library similar to $q & Q,
called vow.js. Our promises will be named "$promise" to avoid
triggering existing browser code. To focus on concepts, vow.js
will use many public variables and not be standards-compliant.
In a stricter deferral system, a promise could not be directly
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

  xit('has $Promise & Deferral classes', function(){
    expect(
      typeof $Promise === 'function' &&
      typeof Deferral === 'function'
    ).toBe( true );
  });

  xit('has a defer function that returns unique deferrals', function(){
    var deferral1 = defer();
    expect( deferral1 instanceof Deferral ).toBe( true );
    var deferral2 = defer();
    expect( deferral2 ).not.toBe( deferral1 );
  });

});

describe('A deferral', function(){

  var deferral;
  beforeEach(function(){
    myDeferral = defer();
  });

  xit('is associated with a unique $promise', function(){
    var promise1 = myDeferral.$promise;
    expect( promise1 instanceof $Promise ).toBe( true );
    var promise2 = defer().$promise;
    expect( promise2 ).not.toBe( promise1 );
  });

});

describe("A deferral's associated promise", function(){

  var deferral, promise;
  beforeEach(function(){
    deferral = defer();
    promise  = deferral.$promise;
  });

  xit('starts with "pending" state', function(){
    expect( promise.state ).toBe( 'pending' );
  });

});

// We have some scaffolding set up, now let's work on behavior.
describe('Resolving through a deferral', function(){

  var deferral, promise;
  beforeEach(function(){
    deferral = defer();
    promise  = deferral.$promise;
  });

  // Reminder: methods should (usually) be defined on the prototype.

  xit('(usually) changes its promise state to "fulfilled"', function(){
    /* Why not "resolved"? Strictly speaking, a promise can resolve
    successfully (fulfillment) or unsuccessfully (rejection). In $q / Q,
    .resolve normally fulfills the promise, but can in some edge cases
    result in a pending or rejected promise. However, for now you may
    consider resolve and fulfill to mean the same thing. */
    deferral.resolve();
    expect( promise.state ).toBe( 'fulfilled' );
  });

  xit('can send data to the promise for storage', function(){
    var someData = { name: 'Gabriel' };
    deferral.resolve( someData );
    expect( promise.value ).toBe( someData );
  });

  // Hint: use the pending status.
  xit('does not affect an already-fulfilled promise', function(){
    var data1 = { name: 'Gabriel' };
    var data2 = { name: 'Gabe' };
    deferral.resolve( data1 );
    deferral.resolve( data2 );
    expect( promise.value ).toBe( data1 );
  });

  xit('works even with falsey values', function(){
    var data1 = null;
    var data2 = 'oops!';
    deferral.resolve( data1 );
    deferral.resolve( data2 );
    expect( promise.value ).toBe( data1 );
  });

});

describe('Rejecting through a deferral', function(){

  var deferral, promise;
  beforeEach(function(){
    deferral = defer();
    promise  = deferral.$promise;
  });

  xit('changes its promise state to "rejected"', function(){
    deferral.reject();
    expect( promise.state ).toBe( 'rejected' );
  });

  xit('can send a reason to the promise for storage', function(){
    var myReason = { error: 'bad request' };
    deferral.reject( myReason );
    expect( promise.value ).toBe( myReason );
  });

  // Hint: use the pending status.
  xit('does not affect an already-rejected promise', function(){
    var reason1 = { error: 'bad request' };
    var reason2 = { error: 'timed out' };
    deferral.reject( reason1 );
    deferral.reject( reason2 );
    expect( promise.value ).toBe( reason1 );
  });

  xit('works even with falsey values', function(){
    var reason1 = null;
    var reason2 = 'oops!';
    deferral.reject( reason1 );
    deferral.reject( reason2 );
    expect( promise.value ).toBe( reason1 );
  });

});

// If you used the pending status for your "only happens
// the first time" specs, this should pass already.
describe('Settled promises never change state:', function(){

  var deferral, promise;
  beforeEach(function(){
    deferral = defer();
    promise  = deferral.$promise;
  });

  xit('reject does not overwrite resolve', function(){
    deferral.resolve( 'Gabriel' );
    deferral.reject( 404 );
    expect( promise.state ).toBe( 'fulfilled' );
    expect( promise.value ).toBe( 'Gabriel' );
  });

  xit('resolve does not overwrite reject', function(){
    deferral.reject( 404 );
    deferral.resolve( 'Gabriel' );
    expect( promise.state ).toBe( 'rejected' );
    expect( promise.value ).toBe( 404 );
  });

});
