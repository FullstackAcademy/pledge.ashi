'use strict';

////////// The Promise state machine. //////////

/**
 * The State of a promise. It holds a value, which may
 * be undefined.
 * 
 * States are immutable. They represent the state of a Promise, frozen in time.
 * When the Promise changes state, we'll create a new immutable State object
 * to represent that new state
 */
class State {
    /**
     * Create a new state holding a value.
     * 
     * @param {*} value The value held by this state
     */
    constructor(value) { this.value = value }

    ////// State transitions //////
    //
    // These methods describe how we can transition from one state into
    // another.
    //
    //////
    
    /**
     * Returns the next state of the promise if we resolve
     * while in this state.
     * 
     * The default implementation returns the current state--
     * that is, it does nothing when resolved.
     * 
     * @param {*} value
     * @returns {State} next state
     */
    resolve(value) { return this }

    /**
     * Returns the next state of promise if we reject while in
     * this state.
     * 
     * The default implementation returns the current state--
     * that is, it does nothing when rejected.
     * 
     * @param {*} reason 
     * @returns {State} next state
     */
    reject(reason) { return this }    
    
    ////// Dispatchers //////

    /**
     * Drains a queue of handlers, calling callbacks as
     * appropriate for the Promise is in this state.
     * 
     * This mutates the provided handlers queue.
     * 
     * The default implementation does nothing--that is, it
     * dispatches no handlers.
     * 
     * @param {Array} handlers queue
     */
    fire(handlers) {}
}

// Remember that classes are just constructor functions.
// JS gives us this neat anonymous class form, which
// gives you a reference to the constructor function.

State.Pending = class extends State {
    // If we resolve (with a value) while in the Pending state,
    // our next state will be Fulfilled (with that value)
    resolve(value) { return Fulfilled(value) }

    // If we reject (with a reason) while in the Pending state,
    // our next state will be Rejected (with that reason)    
    reject(reason) { return Rejected(reason) }

    // We're leaving fire() alone here, because it does nothing
    // by default, and we're happy with that. While pending,
    // we don't want to call handlers.
}
State.Pending.prototype.name = 'pending'

State.Fulfilled = class extends State {
    // When we're in the Fulfilled state, we call any queued
    // success handlers.
    fire(handlers) {
        while (handlers.length) {
            const {successCb} = handlers.shift();
            successCb(this.value)                     
        }
    }

    // Fulfilled doesn't define resolve() or reject(), so it gets
    // the default implementations from the State class.
    //
    // Those implementations always return `this`--that is, they
    // never transition to a new state. That's correct: a Promise,
    // once Fulfilled, will never transition to Rejected.
}
State.Fulfilled.prototype.name = 'fulfilled'

State.Rejected = class extends State {
    // When we're in the Rejected state, we call any queued
    // error handlers.    
    fire(handlers) {
        while (handlers.length) {
            const {errorCb} = handlers.shift();
            errorCb(this.value)            
        }        
    }

    // Rejected doesn't define resolve() or reject(), so it gets
    // the default implementations from the State class.
    //
    // Those implementations always return `this`--that is, they
    // never transition to a new state. That's correct: a Promise,
    // once Rejected, will never transition to Fulfilled.
}
State.Rejected.prototype.name = 'rejected'

// Convenience functions for making States.
const Pending = new State.Pending
const Fulfilled = value => new State.Fulfilled(value)
const Rejected = reason => new State.Rejected(reason)

/**
 * Return a function that, when called, uses `callback` to drive the $Promise `next`.
 * 
 * If `callback` is not a function, we return null.
 * 
 * Otherwise, we return a function that calls `callback`:
 *   - If `callback` returns successfully, `next` resolves with its return value
 *   - If `callback` throws, `next` rejects with the error as the reason
 * 
 * @param {Function<any, any>|null} callback 
 * @param {$Promise} next 
 * @returns {Function<any>|null}
 */
const chain = (callback, next) =>
    typeof callback === 'function'
        ? value => next.tryExecutor(resolve => resolve(callback(value)))
        : null

/**
 * The $Promise class runs the state machine we defined above.
 */
 class $Promise {
     // We're keeping these shims to keep the tests passing.
     get _state() { return this.state.name }
     get _value() { return this.state.value }

    constructor(exec) {
        this.state = Pending
        this._handlerGroups = [];
        this._resolve = this._internalResolve.bind(this)
        this._reject = this._internalReject.bind(this)
        this.tryExecutor(exec)
    }
    
    /**
     * Call an executor with handles to either resolves or reject
     * this promise.
     * 
     * If the executor throws, this promise rejects.
     * 
     * @param {*} exec 
     */
    tryExecutor(exec = () => {}) {
        try {
            exec(this._resolve, this._reject)
        } catch (reason) {
            this._reject(reason)
        }
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

    /**
     * Transition this Promise to a new state.
     * 
     * This method produces side effects: it will call any handlers
     * for the new state.
     * 
     * @param {State|Promise<State>} newState 
     */
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
