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
Promises on their own have very many advantages over
callbacks, chiefly when dealing with *composability* —
combining and orchestrating multiple asynchronous results.
That being said, practically every promise library provides
a couple of helper functions to make promise composition
even easier. In this chapter you will implement two of the
most crucial static methods, so useful they are part of the
ES6 spec for promises (EcmaScript goes beyond P/A+).
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

  // This gets more complex with "thenables" but we are ignoring those.
  xit('takes a <promise for A> and returns the same <promise for A>', function(){
    var firstPromise = defer().$promise;
    var secondPromise = $Promise.resolve(firstPromise);
    expect( secondPromise ).toBe( firstPromise );
  });

  // As you can see, `$Promise.resolve` "normalizes" values which may or may
  // not be promises. Values become promises, and promises are already
  // promises. Not sure if something is a promise? Use `$Promise.resolve`.

  // This demo should already work if the above works. Understand why.
  xit('demonstrates why "resolved" and "fulfilled" are not synonyms', function(){
    var deferral = defer();
    deferral.reject();
    var rejectedPromise = deferral.$promise;
    // And now for the reveal:
    var result = $Promise.resolve(rejectedPromise); // RESOLVING...
    expect( result._state ).toBe( 'rejected' ); // ...but REJECTED!
    // We "resolved" but still ended up with a rejected promise. So "resolve"
    // really means *attempt* fulfillment. That works with normal values, or
    // promises which are already fulfilled; but we cannot lie and claim an
    // already-rejected promise is now magically fulfilled.
  })

});

describe('The static method `$Promise.all`', function(){

  var values;
  beforeEach(function(){
    values = [42, 'hi', false, {}, undefined];
  });

  xit('is a function', function(){
    expect( typeof $Promise.all ).toBe( 'function' );
  });

  // ES6 `Promise.all` accepts ANY iterable, but that is beyond Pledge's scope
  xit('takes a single array argument', function(){
    // no errors
    $Promise.all([]);
    $Promise.all(values);
    // errors
    values.forEach(value => {
      var callAllWithValue = () => $Promise.all(value);
      expect( callAllWithValue ).toThrowError( TypeError );
    });
  });

  // Doesn't seem so hard at first.
  xit('converts an <array of values> into a <promise for an array of values>', function(){
    var promise = $Promise.all(values);
    // like in Ch. 4, you shouldn't need to set state & value manually.
    expect( promise._state ).toBe( 'fulfilled' );
    expect( promise._value ).toEqual( values );
  });

  // Uh oh, getting a bit trickier.
  xit('converts an <array of promises> into a <promise for an array of values>', function(){
    var promises = values.map(value => $Promise.resolve(value));
    var promise = $Promise.all(promises);
    // like in Ch. 4, you shouldn't need to set state & value manually.
    expect( promise._state ).toBe( 'fulfilled' );
    expect( promise._value ).toEqual( values );
  });

  // No shortcuts; each individual element may be a value or a promise for a value.
  xit('converts a <array of values and promises> into a <promise for an array of values>', function(){
    var valuesAndPromises = values.map(value => {
      return Math.random() < 0.5 ? value : $Promise.resolve(value)
    });
    var promise = $Promise.all(valuesAndPromises);
    // like in Ch. 4, you shouldn't need to set state & value manually.
    expect( promise._state ).toBe( 'fulfilled' );
    expect( promise._value ).toEqual( values );
  });

  // Helper. Gives a promise for a value, resolves after a set or random delay.
  var MAX_DELAY = 100;
  function slowPromise (value, delay) {
    var deferral = defer();
    setTimeout(() => deferral.resolve(value), delay || (Math.random() * MAX_DELAY));
    return deferral.$promise;
  }

  // Oops! You weren't synchronously checking `._value`, were you?
  // That's not how to use promises… (hint, hint).
  // You might have to siginicantly alter or augment your approach here.
  xit('converts an <array of async promises> into a <promise for an array of values>', function(done){
    var interval = 10;
    var promises = values.map((value, i) => slowPromise(value, interval * (i + 1)));
    var promise = $Promise.all(promises);
    var enoughTime = interval * (promises.length + 1);
    setTimeout(function(){
      // like in Ch. 4, you shouldn't need to set state & value manually.
      expect( promise._state ).toBe( 'fulfilled' );
      expect( promise._value ).toEqual( values );
      done();
    }, enoughTime);
  });

  // Don't simply collect values in the order they finish. Somehow you have to
  // track which values go where in the final array.
  xit('converts an <array of async promises> (fulfilling in random order) into a <promise for an array of values> (ordered by index in the original array)', function(done){
    var promises = values.map(slowPromise); // random delays
    var promise = $Promise.all(promises);
    var enoughTime = 1.2 * MAX_DELAY;
    setTimeout(function(){
      // like in Ch. 4, you shouldn't need to set state & value manually.
      expect( promise._state ).toBe( 'fulfilled' );
      expect( promise._value ).toEqual( values );
      done();
    }, enoughTime);
  });

  // So close now!
  xit('rejects with <reason E> when one of the input promises rejects with <reason E>', function(done){
    // promises which will reject after a random delay
    var deferral1 = defer();
    var deferral2 = defer();
    var promiseThatRejects1 = deferral1.$promise;
    var promiseThatRejects2 = deferral2.$promise;
    var doomsday = Math.random * MAX_DELAY;
    var postApocalypse = 1.2 * doomsday;
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
    var enoughTime = 1.2 * postApocalypse;
    setTimeout(function(){
      // like in Ch. 4, you shouldn't need to set state & value manually.
      expect( promise._state ).toBe( 'rejected' );
      expect( promise._value ).toBe( 'I am the first rejection' );
      done();
    }, enoughTime);
  });

  // Whew! As we can see, `Promise.all` actually does quite a bit for us.
  // Basically, we can give `.all` an array containing any mix of values and
  // randomly-timed promises. In return, `.all` gives us a promise for all the
  // eventual values, maintaining the original order of the array even if
  // the promises fulfill out of order. And if any promise fails, the whole
  // fails immediately with that reason.

});
