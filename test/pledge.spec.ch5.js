describe('Chapter 5: Static Methods `.resolve` and `.all`', function(){});
/*=======================================================


                        888888888
                        888
                        888
                        8888888b.
                             "Y88b
                               888
                        Y88b  d88P
                         "Y8888P


Chapter 5: Extra Credit: Static Methods `.resolve` and `.all`
---------------------------------------------------------
Promises on their own have  many advantages over callbacks,
chiefly when dealing with *composability* — combining and
orchestrating multiple asynchronous results. That being
said, practically every promise library provides a couple
of helper functions to make promise composition even easier.
In this chapter you will implement two of the most crucial
static methods, so useful they are part of the ES6 spec for
promises (EcmaScript follows, but also goes beyond, P/A+).
========================================================*/

/* global $Promise Deferral defer */
/* eslint no-unused-vars: 0 */

describe('The static method `$Promise.resolve`', function(){

  // $Promise.resolve is *not* the same thing as a deferral's resolver.
  xit('is a function, and not one we have already written', function(){
    expect( typeof $Promise.resolve ).toBe( 'function' );
    expect( $Promise.resolve ).not.toBe( defer().resolve );
    expect( $Promise.resolve ).not.toBe( Deferral.prototype.resolve );
  });

  // The following behavior is sometimes called "lifting" a value.
  xit('takes a <plain value A> and returns a <promise for A>', function(){
    [42, 'hi', {}, undefined, /cool/, false].forEach(value => {
      var promise = $Promise.resolve(value)
      expect( promise instanceof $Promise ).toBe( true );
      // like in Ch. 4, you shouldn't need to set state & value manually.
      expect( promise._state ).toBe( 'fulfilled' );
      expect( promise._value ).toBe( value );
    });
  });

  // This would be more complex with "thenables," but we are ignoring those.
  xit('takes a <promise for A> and returns the same <promise for A>', function(){
    var firstPromise = defer().$promise;
    var secondPromise = $Promise.resolve(firstPromise);
    expect( secondPromise ).toBe( firstPromise );
  });

  // As you can see, `$Promise.resolve` "normalizes" values which may or may
  // not be promises. Values become promises, and promises are already
  // promises. Not sure if something is a promise? Use `$Promise.resolve`.

  // This spec should already pass if the above works. Read through the
  // assertions and try to understand what they demonstrate.
  xit('demonstrates why "resolved" and "fulfilled" are not synonyms', function(){
    var deferral = defer();
    deferral.reject();
    var rejectedPromise = deferral.$promise;
    // And now for the reveal:
    var result = $Promise.resolve(rejectedPromise); // RESOLVING...
    expect( result._state ).toBe( 'rejected' ); // ...but REJECTED!
    // We "resolved" but still ended up with a rejected promise. So "resolve"
    // really means *attempt* fulfillment. That works with normal values, or
    // promises which are already fulfilled. However, we cannot lie and claim
    // that an already-rejected promise is now magically fulfilled, without
    // having actually handled the rejection reason.
  })

});

describe('The static method `$Promise.all`', function(){

  var values;
  beforeEach(function(){
    values = [42, 'hi', false, {}, undefined, [] ];
  });

  xit('is a function', function(){
    expect( typeof $Promise.all ).toBe( 'function' );
  });

  // Real ES6 `Promise.all` accepts ANY iterable (https://mzl.la/1SopN1G), but
  // that is beyond Pledge's scope. Our `.all` only needs to support arrays.
  xit('takes a single array argument', function(){
    // passing an array into `$Promise.all` causes no errors
    function callingAllWithArrays () {
      $Promise.all([]);
      $Promise.all(values);
    }
    expect( callingAllWithArrays ).not.toThrow();
    // Passing a non-array into `$Promise.all` throws a `TypeError`
    const nonArrayValues = [42, 'hi', false, {}, undefined, /wow/];
    nonArrayValues.forEach(value => {
      function callingAllWithValue () { return $Promise.all(value) }
      expect( callingAllWithValue ).toThrowError( TypeError );
    });
  });

  // A helper function to DRY up the next bunch of specs.
  function confirmPromiseFulfillsWithVals (promise, vals, done) {
    promise.then(function (fulfilledData) {
      expect( fulfilledData ).toEqual( vals );
      done(); // Tells Jasmine this potentially-async spec is complete.
    })
    .catch(function (err) {
      err = err || Error('Unknown rejection reason');
      done(err); // Tells Jasmine if there was a problem (even an async one).
    });
  }

  // Doesn't seem so hard at first.
  xit('converts an <array of values> into a <promise for an array of values>', function (done) {
    var promise = $Promise.all(values);
    expect( promise instanceof $Promise ).toBe(true);
    // The promise should fulfill with the values.
    confirmPromiseFulfillsWithVals(promise, values, done);
  });

  // Uh oh, getting a bit trickier.
  xit('converts an <array of promises> into a <promise for an array of values>', function (done) {
    var promises = values.map(value => $Promise.resolve(value));
    var promise = $Promise.all(promises);
    // The promise should fulfill with values (not promises for values).
    confirmPromiseFulfillsWithVals(promise, values, done);
  });

  // No shortcuts; each individual element may be a value or a promise for a value.
  xit('converts an <array of values and promises> into a <promise for an array of values>', function (done) {
    var valuesAndPromises = values.map(value => {
      return Math.random() < 0.5 ? value : $Promise.resolve(value)
    });
    var promise = $Promise.all(valuesAndPromises);
    // promise should fulfill with values (not mix of promises and values).
    confirmPromiseFulfillsWithVals(promise, values, done);
  });

  var MAX_DELAY = 100;
  var SMALL_DELAY = 10;

  // Helper: gives a promise for a value, resolves after a set or random delay.
  function slowPromise (value, delay) {
    var deferral = defer();
    setTimeout(() => deferral.resolve(value),
      delay || (Math.random() * MAX_DELAY));
    return deferral.$promise;
  }

  // Oops! You weren't synchronously checking `._value`, were you? Tsk tsk,
  // that's not how to use promises. Remember how to access a promise's value?
  // You might have to sigificantly alter or augment your approach here.
  xit('converts an <array of async promises> into a <promise for an array of values>', function (done) {
    var promises = values.map((value, i) => {
      return slowPromise(value, SMALL_DELAY * (i + 1))
    });
    var promise = $Promise.all(promises);
    // promise should fulfill with values — once those values actually exist.
    confirmPromiseFulfillsWithVals(promise, values, done);
  });

  // Don't simply collect values in the order they finish. Somehow you have to
  // track which values go where in the final array.
  xit('converts an <array of async promises> (fulfilling in random order) into a <promise for an array of values> (ordered by index in the original array)', function (done) {
    var promises = values.map(slowPromise); // random delays
    var promise = $Promise.all(promises);
    // promise should fulfill with values, and in the right order too!
    confirmPromiseFulfillsWithVals(promise, values, done);
  });

  // So close now!
  xit('rejects with <reason E> when one of the input promises rejects with <reason E>', function (done) {
    // promises which will reject after a random delay
    var deferral = defer();
    var promiseThatRejects = deferral.$promise;
    var doomsday = Math.random * MAX_DELAY;
    setTimeout(() => deferral.reject('any Black Mirror episode'), doomsday);
    // a bunch of promises which fulfill in random order
    var promises = values.map(slowPromise);
    // slip our doomed promise in there somewhere
    var randomIndex = Math.floor(Math.random() * promises.length);
    promises.splice(randomIndex, 0, promiseThatRejects);
    // wait for everything with $Promise.all
    var promise = $Promise.all(promises);
    // promise should be rejected.
    promise.then(function () {
      done(Error('Promise should not have fulfilled.'));
    })
    .catch(function (rejectionReason) {
      expect( rejectionReason ).toBe( 'any Black Mirror episode' );
      done();
    });
  });

  // This probably already passes, but let's be sure. We're strict that way.
  xit('is not affected by additional rejections', function (done) {
    // promises which will reject after a random delay
    var deferral1 = defer();
    var deferral2 = defer();
    var promiseThatRejects1 = deferral1.$promise;
    var promiseThatRejects2 = deferral2.$promise;
    var doomsday = Math.random * MAX_DELAY;
    var postApocalypse = doomsday + SMALL_DELAY;
    setTimeout(() => deferral1.reject('I am the first rejection'), doomsday);
    setTimeout(() => deferral2.reject('I am too late, ignore me'), postApocalypse);
    // a bunch of promises which fulfill in random order
    var promises = values.map(slowPromise);
    // slip our doomed promises in there somewhere
    var randomIndex1 = Math.floor(Math.random() * promises.length);
    var randomIndex2 = Math.floor(Math.random() * promises.length);
    promises.splice(randomIndex1, 0, promiseThatRejects1);
    promises.splice(randomIndex2, 0, promiseThatRejects2);
    // wait for everything with $Promise.all
    var promise = $Promise.all(promises);
    // promise should be rejected with first rejection reason.
    promise.then(function () {
      done(Error('Promise should not have fulfilled.'));
    })
    .catch(function (rejectionReason) {
      expect( rejectionReason ).toBe( 'I am the first rejection' );
      done();
    });
  });

  // Whew! As we can see, `Promise.all` actually does quite a bit for us.
  // Basically, we can give `.all` an array containing any mix of values and
  // randomly-timed promises. In return, `.all` gives us a promise for all the
  // eventual values, maintaining the original order of the array even if
  // the promises fulfill out of order. And if any input promise fails, the
  // output promise fails immediately with the same rejection reason.

});
