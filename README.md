# Pledge.js

### Make a promise: build an ES6-style implementation

**Javascript promises** are versatile tools for managing asynchronous results. They are portable and can attach handler functions to an eventual value, in multiple places. Compared to the dead end of standard async callbacks, they restore normal control flow — letting you chain results, `return` new values, and `catch` errors where most convenient.

One way to understand a thing is to build it yourself. This repo contains a [Jasmine 2.0](http://jasmine.github.io/2.0/introduction.html) test spec (split into thematic chapters). Following the spec in order, we will build a constructor-style promise library similar to [native ECMAScript Promises](https://mzl.la/1jLTOHB), which we will call `pledge.js`. Our promises will be named `$Promise` to avoid triggering browser code. To focus on concepts, `pledge.js` will use public variables and not be standards-compliant (see below).

## Instructions

You'll need [Node.js](http://nodejs.org) and its package manager `npm` installed.

```sh
npm install # automatically builds the docs and opens them
npm test
```

You will see all the upcoming tests as "pending" (yellow). Start writing your own code in the `pledge.js` file. When you pass a test (green), change the next pending test from `xit` to `it` and save. This spec is iterative and opinionated; it is recommended that you do the tests in order and not `xit` out any previous specs. For debugging, you can "focus" Jasmine specs/suites with `fit`/`fdescribe`.

## Associated learning materials

The repo contains the lecture slides and a `.then` flowchart, both in PDF format.

## The state of the art

There were once multiple proposed [CommonJS promise standards](http://wiki.commonjs.org/wiki/Promises), but one leading standard [Promises/A+](https://www.promisejs.org) and now a compliant [ES6 implementation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) won out. However, many developers use [Bluebird](https://github.com/petkaantonov/bluebird) for its faster-than-native optimizations and many clever features.

Historically, there have been two ways to generate new promises: CommonJS-style deferreds, and simplified ES6-style constructors. We will study the ES6 style, which has emerged as both the official and de facto standard.

### Warning

Legacy jQuery codebases beware! While jQuery 2 has a version of promises through `$.Deferred`, that implementation differed from current standards and is considered flawed. See [Kris Kowal’s guide.](https://github.com/kriskowal/q/wiki/Coming-from-jQuery) However, modern jQuery users rejoice! jQuery 3 now features P/A+ compliant promises.

## Technical note on non-compliance

Our `pledge.js` library is intended to be a learning exercise. Some of the [Promises/A+](https://promisesaplus.com) standards and general [OOP](http://en.wikipedia.org/wiki/Object-oriented_programming) principles that `pledge.js` will not cover include:

* Handler functions should always be called in an async wrapper (e.g. `setTimeout`). This makes their behavior more deterministic as they execute after a following synchronous code line.
* The `.then()` function should handle assimilation of promises from other libraries ("thenables"). That makes promises interoperable.
* A promise's state and value should not be directly editable (public), only influenced or accessed through the resolver functions and `.then()`.
* For simplicity's sake, `pledge.js` does not always follow strict standards terminology. For example, it considers a pledge's `value` as meaning either its fulfillment `data` or rejection `reason`.

These and other technical details are important, but for someone just beginning to learn they distract from the core behavior and use patterns.

## External Resources for Further Reading

### Canon

* [MDN: ES6 Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) (native functions)
* [The Promises/A+ Standard](https://www.promisejs.org) (with use patterns and an example implementation)

### General

* [You Don't Know JS: Async and Performance](https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/README.md)
* [HTML5 Rocks: Promises](http://www.html5rocks.com/en/tutorials/es6/promises/) (deep walkthrough with use patterns)
* [Nolan Lawson: We Have a Problem with Promises](http://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)
* [DailyJS: Javascript Promises in Wicked Detail](http://dailyjs.com/2014/02/20/promises-in-detail/) (build an ES6-style implementation)
* [Promise Nuggets](http://spion.github.io/promise-nuggets/) (use patterns)
* [Promise Anti-Patterns](http://taoofcode.net/promise-anti-patterns/)

### Libraries

* [Bluebird](http://bluebirdjs.com) (the current favorite for speed & features among many JS developers)
* [Kris Kowal & Domenic Denicola: Q](https://github.com/kriskowal/q) (the library Angular's $q mimics; great examples & resources)

### Angular and Related

* [AngularJS documentation for $q](https://docs.angularjs.org/api/ng/service/$q)
* [AngularJS Corner: Using promises and $q to handle asynchronous calls](http://chariotsolutions.com/blog/post/angularjs-corner-using-promises-q-handle-asynchronous-calls/)
* [Xebia: Promises and Design Patterns in AngularJS](http://blog.xebia.com/2014/02/23/promises-and-design-patterns-in-angularjs/)
* [AngularJS / UI Router / Resolve](http://www.jvandemo.com/how-to-resolve-angularjs-resources-with-ui-router/)
