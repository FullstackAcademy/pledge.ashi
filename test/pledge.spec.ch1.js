/*--------------------------------------------------------
Promises Workshop: Build a Deferral-Style Implementation

We are going to write a promise library similar to $q & Q,
called pledge.js. Our promises will be named "$promise" to avoid
triggering existing browser code. To focus on concepts, pledge.js
will use many public variables and not be standards-compliant.

To execute the spec, run testem in this directory. When you
pass a test, change the next pending test from 'xit' to 'it'.
This spec is iterative and opinionated; do the tests in order.
--------------------------------------------------------*/

describe('Chapter 1: Structure and State', function(){});
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
not be too difficult.
========================================================*/

/* global Deferral $Promise defer */

describe('The pledge.js library', function(){

  it('has `$Promise` & `Deferral` classes', function(){
    expect( typeof $Promise ).toBe( 'function' );
    expect( typeof Deferral ).toBe( 'function' );
  });

  xit('has a `defer` function that returns unique deferrals', function(){
    var deferral1 = defer();
    var deferral2 = defer();
    expect( deferral1 instanceof Deferral ).toBe( true );
    expect( deferral2 ).not.toBe( deferral1 );
  });

});

describe('A deferral', function(){

  xit('is associated with a unique `$promise`', function(){
    var myDeferral = defer();
    var promise1 = myDeferral.$promise;
    var promise2 = defer().$promise;
    expect( promise1 instanceof $Promise ).toBe( true );
    expect( promise2 ).not.toBe( promise1 );
  });

});

describe("A deferral's associated promise", function(){

  xit('starts with "pending" state', function(){
    var deferral = defer();
    var promise = deferral.$promise;
    expect( promise._state ).toBe( 'pending' );
  });

});

// We have some scaffolding set up, now let's work on behavior.
describe('Resolving through a deferral', function(){

  var deferral, promise;
  beforeEach(function(){
    deferral = defer();
    promise  = deferral.$promise;
  });

  // Reminder: common class methods should be defined on a prototype.

  xit('changes its promise state to "fulfilled"', function(){
    /* Why not "resolved"? This will be covered in detail in Ch. 5, but
    for now just know that strict P/A+ terminology draws a distinction
    between "resolution" and "fulfillment." Normally a resolved promise
    is also fulfilled, but in one particular case, a resolved promise is
    actually rejected. You don't have to know why just yet! */
    deferral.resolve();
    expect( promise._state ).toBe( 'fulfilled' );
  });

  xit('can send data to the promise for storage', function(){
    var someData = { name: 'Harry Potter' };
    deferral.resolve( someData );
    expect( promise._value ).toBe( someData );
  });

  // Hint: use the pending status.
  xit('does not affect an already-fulfilled promise', function(){
    var data1 = { name: 'Harry Potter' };
    var data2 = { name: 'Gandalf' };
    deferral.resolve( data1 );
    deferral.resolve( data2 );
    expect( promise._value ).toBe( data1 );
  });

  xit('works even with falsey values', function(){
    var data1; // undefined; could also work with null, 0, false, etc.
    var data2 = 'oops!';
    deferral.resolve( data1 );
    deferral.resolve( data2 );
    expect( promise._value ).not.toBe( data2 );
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
    expect( promise._state ).toBe( 'rejected' );
  });

  xit('can send a reason to the promise for storage', function(){
    var myReason = { error: 'bad request' };
    deferral.reject( myReason );
    expect( promise._value ).toBe( myReason );
  });

  // Hint: use the pending status.
  xit('does not affect an already-rejected promise', function(){
    var reason1 = { error: 'bad request' };
    var reason2 = { error: 'timed out' };
    deferral.reject( reason1 );
    deferral.reject( reason2 );
    expect( promise._value ).toBe( reason1 );
  });

  xit('works even with falsey values', function(){
    var reason1; // undefined; could also work with null, 0, false, etc.
    var reason2 = 'oops!';
    deferral.reject( reason1 );
    deferral.reject( reason2 );
    expect( promise._value ).not.toBe( reason2 );
  });

});

describe('Settled promises never change state:', function(){

  var deferral, promise;
  beforeEach(function(){
    deferral = defer();
    promise  = deferral.$promise;
  });

  // If you used the pending status for your "does not affect
  // already fulfilled/rejected" specs, these two specs should pass already.

  xit('`reject` does not overwrite fulfillment', function(){
    deferral.resolve( 'Dumbledore' );
    deferral.reject( 404 );
    expect( promise._state ).toBe( 'fulfilled' );
    expect( promise._value ).toBe( 'Dumbledore' );
  });

  xit('`resolve` does not overwrite rejection', function(){
    deferral.reject( 404 );
    deferral.resolve( 'Dumbledore' );
    expect( promise._state ).toBe( 'rejected' );
    expect( promise._value ).toBe( 404 );
  });

});

/*
At this point we have some basic facts established. A promise
starts out with pending state and no value. At some point, the
promise can become fulfilled with data, or rejected with a reason.
Once settled (fulfilled or rejected), a promise is stuck in that
state and cannot be changed again. The deferral object is a kind
of promise parent and manager, which can resolve or reject its
associated promise.
*/
