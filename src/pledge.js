'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js ES6-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

class State {
    constructor(value) { this.value = value }
    resolve(value) { return this }
    reject(reason) { return this }    
    fire(handlers) {}
}

State.Pending = class Pending extends State {
    resolve(value) { return Fulfilled(value) }
    reject(reason) { return Rejected(reason) }
}
State.Pending.prototype.name = 'pending'

State.Fulfilled = class extends State {
    fire(handlers) {
        while(handlers.length) {
            const {successCb} = handlers.shift();
            successCb(this.value)                     
        }
    }
}
State.Fulfilled.prototype.name = 'fulfilled'

State.Rejected = class extends State {
    fire(handlers) {
        while(handlers.length) {
            const {errorCb} = handlers.shift();
            errorCb(this.value)            
        }        
    }
}
State.Rejected.prototype.name = 'rejected'

const Pending = new State.Pending
const Fulfilled = value => new State.Fulfilled(value)
const Rejected = reason => new State.Rejected(reason)

// chain(callback?: any->any, next: Promise) -> (any->any)?
const chain = (callback, next) =>
    typeof callback === 'function'
        ? value => {
            try {
                next._resolve(callback(value))
            } catch (reason) {
                next._reject(reason)
            }
        }
        : null

 class $Promise {
     get _state() { return this.state.name }
     get _value() { return this.state.value }

    constructor(exec = () => {}) {
        this.state = Pending
        this._handlerGroups = [];
        this._resolve = this._internalResolve.bind(this)
        this._reject = this._internalReject.bind(this)
        exec(this._resolve, this._reject);
    }
  
    _internalResolve(value) {
        if (value && typeof value.then === 'function') {
            return value.then(this._resolve, this._reject)
        }
        this.setState(this.state.resolve(value))
    }

    _internalReject(reason) {
        this.setState(this.state.reject(reason))        
    }

    setState(newState) {     
        this.state = newState        
        this._callHandlers()
        return this
    }

    _callHandlers() {
        this.state.fire(this._handlerGroups)       
    }

    then(successCb, errorCb) {
        const next = new $Promise
        this._handlerGroups.push({
            successCb: chain(successCb, next) || next._resolve, 
            errorCb : chain(errorCb, next) || next._reject,
            downstreamPromise: next,
        })
        this._callHandlers();
        return next
    }

    catch(errorCb) {
        return this.then(null, errorCb)
    }

    static resolve(value) {
        if (value && typeof value.then === 'function') {
            return value
        }
        // We could mimick the various things _internalResolve
        // does to convert values and promises into promises.
        // ...or we could just create an empty promise and .then
        // off it, which seems easier:
        return new $Promise(resolve => resolve())
            .then(() => value)
    }

    // all<T>(these: Array<Promise<T>>): Promise<Array<T>>
    //
    // Turn an array of promises (or values) into the promise of
    // an array.
    //
    // Returns a promise with resolves with an array, or rejects
    // with the first promise to reject.
    static all(these) {
        if (!Array.isArray(these))
            throw new TypeError(`$Promise.all(these): wanted an array but got ${these && these.constructor}`)
        return these.reduce(
            // (prev: Promise<Array<T>>, next: Promise<T>) -> Promise<Array>
            (prev, next) =>
                // After all previous elements have resolved...
                prev.then(
                    // We're inside its .then, so prev is a real array now
                    //
                    // prev: Array<T>
                    prev =>
                        // Promise.resolve will turn immediate values into
                        // promises for us, if needed.
                        $Promise.resolve(next)
                            // At this point, prev and next are both immediates:
                            //
                            // prev: Array<T>
                            // next: T
                            //
                            // The `...prev` "spreads" the elements of prev into
                            // the array that we finally resolve with.
                            .then(next => [...prev, next])),
            // Kick off our reducer with the promise of an empty array
            $Promise.resolve([])
        )
    }
 }




/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = $Promise;

So in a Node-based project we could write things like this:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
