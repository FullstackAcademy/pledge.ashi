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
where convenient… even returning new values.
This chapter may be challenging.
========================================================*/

describe('For a given promiseA (pA),', function(){

  var deferralA, promiseA;
  beforeEach(function(){
    deferralA = defer();
    promiseA = deferralA.$promise;
  });
  function thisReturnsHi () { return 'hi'; }
  function thisThrowsErr () { throw 'err'; }

  it('.then adds a new deferral to its handler group', function(){
    promiseA.then();
    expect( promiseA.handlerGroups[0].forwarder instanceof Deferral ).toBe( true );
  });

  it('.then returns the promise from that deferral', function(){
    var promiseB = promiseA.then();
    expect( promiseB ).toBe( promiseA.handlerGroups[0].forwarder.$promise );
  });

  describe('the promiseB (pB) returned by .then', function(){

    // Fulfillment bubbles down to the first available success handler.
    it('is fulfilled with pA.value if pA is fulfilled but has no success handler', function(){
      var promiseB = promiseA.then();
      deferralA.resolve( 9001 );
      expect( promiseB.state ).toBe( 'fulfilled' );
      expect( promiseB.value ).toBe( 9001 );
    });

    // Rejection bubbles down to the first available error handler.
    it('is rejected with pA.value if pA is rejected but has no error handler', function(){
      var promiseB = promiseA.then();
      deferralA.reject( 'darn' );
      expect( promiseB.state ).toBe( 'rejected' );
      expect( promiseB.value ).toBe( 'darn' );
    });

    // Exceptions cause the returned promise to be rejected with the error.
    // Hint: you need to know how to use try-catch to make this work.
    it("is rejected with e if pA's success handler throws an error e", function(){
      var promiseB = promiseA.then( thisThrowsErr );
      deferralA.resolve();
      expect( promiseB.state ).toBe( 'rejected' );
      expect( promiseB.value ).toBe( 'err' );
    });

    it("is rejected with e if pA's error handler throws an error e", function(){
      var promiseB = promiseA.catch( thisThrowsErr );
      deferralA.reject();
      expect( promiseB.state ).toBe( 'rejected' );
      expect( promiseB.value ).toBe( 'err' );
    });

    // This is for normal (non-promise) return values
    it("is fulfilled with the return value of pA's success handler", function(){
      var promiseB = promiseA.then( thisReturnsHi );
      deferralA.resolve( 'an ordinary value' );
      expect( promiseB.state ).toBe( 'fulfilled' );
      expect( promiseB.value ).toBe( 'hi' );
    });

    // This is for normal (non-promise) return values
    it("is fulfilled with the return value of pA's error handler", function(){
      /* Why fulfilled? This is similar to try-catch. If promiseA is
      rejected (equivalent to try failed), we pass the reason to
      promiseA's error handler (equivalent to catch). We have now
      successfully handled the error, so promiseB should represent
      the error handler returning something useful, not a new error.
      promiseB should only be rejected if the error handler itself
      fails somehow (which we already addressed in a previous test). */
      var promiseB = promiseA.catch( thisReturnsHi );
      deferralA.reject();
      expect( promiseB.state ).toBe( 'fulfilled' );
      expect( promiseB.value ).toBe( 'hi' );
    });

    /* What if promiseA returns a promiseX? You could handle pX like a
    normal value, but then you have to start writing .then inside .then.
    Instead, we want to make promiseB resolve/reject with pX's
    resolve/reject data – in essence, to "become" pX by copying
    pX's behavior. This test is a brain-bender. */
    it("mimics promiseX if pA's success handler returns promiseX", function(){
      var deferralX = defer();
      var promiseX = deferralX.$promise;
      var promiseB = promiseA.then( function () { return promiseX; } );
      deferralA.resolve();
      deferralX.resolve( 'testing' );
      expect( promiseB.value ).toBe( 'testing' );
    });

    it("mimics promiseX if pA's error handler returns promiseX", function(){
      var deferralX = defer();
      var promiseX = deferralX.$promise;
      var promiseB = promiseA.catch( function () { return promiseX; } );
      deferralA.reject();
      deferralX.resolve( 'testing' );
      expect( promiseB.value ).toBe( 'testing' );
    });

    it('can chain .then many times', function(){
      var add1 = function (num) { return ++num; };
      var test = 0;
      promiseA.then( add1 ).then( add1 ).then().then( function (data) {
        test = data;
      });
      deferralA.resolve( 0 );
      expect( test ).toBe( 2 );
    });

  });
  // You could bubble notifications too, but we will skip that.
});
