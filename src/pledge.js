'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js ES6-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:
 class $Promise {
    constructor(exec = () => {}) {
        this._state = 'pending';
        this._handlerGroups = [];
        exec((val) => this._internalResolve(val), (reason) => this._internalReject(reason));
    }
  
    _internalResolve(data) {
        if( this._state === 'pending') {
            this._state = 'fulfilled';
            this._value = data;
        }
        this._callHandlers();
    }

    _internalReject(reason) {
         if( this._state === 'pending') {
            this._state = 'rejected';
            this._value = reason;
        }
        this._callHandlers();
    }

    _callHandlers() {
        switch (this._state){
            case "fulfilled":
                while(this._handlerGroups.length) {
                    const chelsea = this._handlerGroups.shift();
                    chelsea.successCb && chelsea.successCb(this._value)
                }
        }
    }

    then(successCb, errorCb) {
        let chelsea = { //as in handler
            successCb: typeof successCb == 'function' ? successCb : null, 
            errorCb : typeof errorCb == 'function' ? errorCb : null
        };
        this._handlerGroups.push(chelsea);
        this._callHandlers();
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
