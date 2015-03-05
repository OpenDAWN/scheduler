/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE scheduler singleton based on audio time (time-engine master)
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var PriorityQueue = require("priority-queue");
var TimeEngine = require("time-engine");
var audioContext = require("audio-context");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

var Scheduler = (function(){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var DPS$0 = Object.defineProperties;var proto$0={};
  function Scheduler() {
    this.__queue = new PriorityQueue();
    this.__engines = [];

    this.__currentTime = null;
    this.__nextTime = Infinity;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    this.period = 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     */
    this.lookahead = 0.1;
  }DPS$0(Scheduler.prototype,{currentTime: {"get": $currentTime_get$0, "configurable":true,"enumerable":true}});DP$0(Scheduler,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  // setTimeout scheduling loop
  proto$0.__tick = function() {
    var nextTime = this.__nextTime;

    this.__timeout = null;

    while (nextTime <= audioContext.currentTime + this.lookahead) {
      this.__currentTime = nextTime;

      var engine = this.__queue.head;
      var time = engine.advanceTime(this.__currentTime);

      if (time && time < Infinity) {
        nextTime = this.__queue.move(engine, Math.max(time, this.__currentTime));
      } else {
        nextTime = this.__queue.remove(engine);

        // remove time engine from scheduler if advanceTime returns null/undfined
        if (!time && engine.master === this)
          engine.resetInterface();
      }
    }

    this.__currentTime = null;
    this.__reschedule(nextTime);
  };

  proto$0.__reschedule = function(nextTime) {var this$0 = this;
    if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }

    if (nextTime !== Infinity) {
      this.__nextTime = nextTime;

      var timeOutDelay = Math.max((nextTime - audioContext.currentTime - this.lookahead), this.period);

      this.__timeout = setTimeout(function()  {
        this$0.__tick();
      }, timeOutDelay * 1000);
    }
  };

  /**
   * Get scheduler time
   * @return {Number} current scheduler time including lookahead
   */
  function $currentTime_get$0() {
    return this.__currentTime || audioContext.currentTime + this.lookahead;
  }

  /**
   * Add a time engine or a simple callback function to the scheduler
   * @param {Object} engine time engine to be added to the scheduler
   * @param {Number} time scheduling time
   * @param {Function} function to get current position
   * @return handle to the scheduled engine (use for calling further methods)
   */
  proto$0.add = function(engine) {var time = arguments[1];if(time === void 0)time = this.currentTime;var getCurrentPosition = arguments[2];if(getCurrentPosition === void 0)getCurrentPosition = null;var this$0 = this;
    if (engine instanceof Function) {
      // construct minimal scheduled time engine
      engine = {
        advanceTime: engine
      };
    } else {
      if (!engine.implementsScheduled())
        throw new Error("object cannot be added to scheduler");

      if (engine.master)
        throw new Error("object has already been added to a master");

      // register engine
      this.__engines.push(engine);

      // set scheduled interface
      engine.setScheduled(this, function(time)  {
        var nextTime = this$0.__queue.move(engine, time);
        this$0.__reschedule(nextTime);
      }, function()  {
        return this$0.currentTime;
      }, getCurrentPosition);
    }

    // schedule engine or callback
    var nextTime = this.__queue.insert(engine, time);
    this.__reschedule(nextTime);

    return engine;
  };

  /**
   * Remove a time engine from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  proto$0.remove = function(engine) {
    var master = engine.master;

    if (master) {
      if (master !== this)
        throw new Error("object has not been added to this scheduler");

      engine.resetInterface();
      arrayRemove(this.__engines, engine);
    }

    var nextTime = this.__queue.remove(engine);
    this.__reschedule(nextTime);
  };

  /**
   * Reschedule a scheduled time engine or callback at a given time
   * @param {Object} engine time engine or callback to be rescheduled
   * @param {Number} time time when to reschedule
   */
  proto$0.reset = function(engine, time) {
    var nextTime = this.__queue.move(engine, time);
    this.__reschedule(nextTime);
  };

  /**
   * Remove all schdeduled callbacks and engines from the scheduler
   */
  proto$0.clear = function() {
    if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }

    this.__queue.clear();
    this.__engines.length = 0;
  };
MIXIN$0(Scheduler.prototype,proto$0);proto$0=void 0;return Scheduler;})();

// export scheduler singleton
window.waves = window.waves || {};
module.exports = window.waves.scheduler = window.waves.scheduler || new Scheduler();