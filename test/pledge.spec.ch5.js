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
callbacks, chiefly when it comes to *composability* —
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
  it('is a function, and not one we have already written', function(){
    expect( typeof $Promise.resolve ).toBe( 'function' );
    expect( $Promise.resolve ).not.toBe( defer().resolve );
    expect( $Promise.resolve ).not.toBe( Deferral.prototype.resolve );
  });

  // The following behavior is sometimes called "lifting" a value.
  it('takes a plain value A and returns a promise for A', function(){
    [42, 'hi', {}, undefined, /cool/, false].forEach(value => {
      var promise = $Promise.resolve(value)
      expect( promise instanceof $Promise ).toBe( true );
      // like in Ch. 4, you shouldn't need to set state & value manually.
      expect( promise._state ).toBe( 'resolved' );
      expect( promise._value ).toBe( value );
    });
  });

  // This gets more complex with "thenables" but we are ignoring those.
  it('takes a promise for A and returns the same promise for A', function(){
    var firstPromise = defer().$promise;
    var secondPromise = $Promise.resolve(firstPromise);
    expect( secondPromise ).toBe( firstPromise );
  });

  // As you can see, `$Promise.resolve` always returns a promise. This makes
  // it great for "normalizing" values which may or may not be promises.
  // Not sure if something is a promise? `$Promise.resolve` it.

  // This is a demo; it will work if the above works. Understand why.
  it('demonstrates why "resolved" and "fulfilled" are not synonyms', function(){
    var deferral = defer();
    deferral.reject();
    var rejectedPromise = deferral.$promise;
    // And now for the reveal:
    var result = $Promise.resolve(rejectedPromise); // RESOLVING...
    expect( result._state ).toBe( 'rejected' ); // ...but REJECTED!
    // We "resolved" but still ended up with a rejected promise. So "resolve"
    // really means ATTEMPT fulfillment. That works with normal values, or
    // promises which are already fulfilled; but we cannot lie and claim an
    // already-rejected promise is now magically fulfilled.
  })

});
