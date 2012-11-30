/*
 * Mobile Range Slider 
 * A Touch Slider for Webkit / Mobile Safari
 *
 * https://github.com/ubilabs/mobile-range-slider
 *
 * Full rewrite of https://github.com/alexgibson/WKSlider
 *
 * @author Ubilabs http://ubilabs.net, 2012
 * @license MIT License http://www.opensource.org/licenses/mit-license.php
 */

// function.bind() polyfill
// taken from: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      throw new TypeError(
        "Function.prototype.bind - what is trying to be bound is not callable"
      );
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
      fToBind = this, 
      fNOP = function() { },
      fBound = function() {
        return fToBind.apply(
          this instanceof fNOP ? this : oThis || window,
          aArgs.concat( Array.prototype.slice.call(arguments) )
        );
      };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}


(function(undefined) {
  
  // mapping of event handlers
  var events = {
    start: ['touchstart', 'mousedown'],
    move: ['touchmove', 'mousemove'],
    end: ['touchend', 'touchcancel', 'mouseup', 'mouseout']
  };

  // constructor
  function MobileRangeSlider(element, options) {

    this.element = element;
    
    this.options = {};
    
    options = options || {};
    
    var property;
    
    for (property in this.defaultOptions){
      if (options[property] !== undefined){
        // set options passed to constructor
        this.options[property] = options[property];
      } else {
        // set default options
        this.options[property] = this.defaultOptions[property];
      }
    }
 
    // detect support for Webkit CSS 3d transforms
    this.supportsWebkit3dTransform = (
      'WebKitCSSMatrix' in window && 
      'm11' in new WebKitCSSMatrix()
    );
    
    // store references to DOM elements
    if (typeof element === 'string'){
      this.element = document.getElementById(element);
    }
        
    this.knob = this.element.getElementsByClassName('knob')[0];
    this.track = this.element.getElementsByClassName('track')[0];
    
    // set context for event handlers
    this.start = this.start.bind(this);
    this.move = this.move.bind(this);
    this.end = this.end.bind(this);
    
    // set the inital value
    this.addEvents("start");
    this.setValue(this.options.value);
    
    // update postion on page resize
    window.addEventListener("resize", this.update.bind(this));
  }
  
  // default options
  MobileRangeSlider.prototype.defaultOptions = {
    value: 0, // initial value
    min: 0, // minimum value
    max: 100, // maximum value
    change: null // change callback
  };

  // add event handlers for a given name
  MobileRangeSlider.prototype.addEvents = function(name){
    var list = events[name], 
      handler = this[name],
      all;
    
    for (all in list){
      this.element.addEventListener(list[all], handler, false);
    }
  };
  
  // remove event handlers for a given name
  MobileRangeSlider.prototype.removeEvents = function(name){ 
    var list = events[name], 
      handler = this[name],
      all;
      
    for (all in list){
      this.element.removeEventListener(list[all], handler, false);
    }
  };
  
  // start to listen for move events
  MobileRangeSlider.prototype.start = function(event) {
    this.addEvents("move");
    this.addEvents("end");
    this.handle(event);
  };
  
  // handle move events
  MobileRangeSlider.prototype.move = function(event) {
    this.handle(event);
  }; 

  // stop listening for move events
  MobileRangeSlider.prototype.end = function() {
    this.removeEvents("move");
    this.removeEvents("end");
  };
  
  // update the knob position
  MobileRangeSlider.prototype.update = function() {
    this.setValue(this.value);
  };
  
  // set the new value of the slider
  MobileRangeSlider.prototype.setValue = function(value) {
    
    if (value === undefined){ value = this.options.min; }
    
    value = Math.min(value, this.options.max);
    value = Math.max(value, this.options.min);
    
    var 
      knobWidth = this.knob.offsetWidth,
      trackWidth = this.track.offsetWidth,
      range = this.options.max - this.options.min,
      width = trackWidth - knobWidth,
      position = Math.round((value - this.options.min) * width / range);
    
    this.setKnobPosition(position);
    
    this.value = value;
    this.callback(value);
  };
  
  MobileRangeSlider.prototype.setKnobPosition = function(x){
    // use Webkit CSS 3d transforms for hardware acceleration if available 
    if (this.supportsWebkit3dTransform) {
      this.knob.style.webkitTransform = 'translate3d(' + x + 'px, 0, 0)';
    } else {
      this.knob.style.webkitTransform = 
      this.knob.style.MozTransform = 
      this.knob.style.msTransform = 
      this.knob.style.OTransform = 
      this.knob.style.transform = 'translateX(' + x + 'px)';
    }
  };

  // handle a mouse event
  MobileRangeSlider.prototype.handle = function(event){
    event.preventDefault();
    if (event.targetTouches){ event = event.targetTouches[0]; }
  
    var position = event.pageX, 
      element,
      knobWidth = this.knob.offsetWidth,
      trackWidth = this.track.offsetWidth,
      width = trackWidth - knobWidth,
      range = this.options.max - this.options.min,
      value;
      
    for (element = this.element; element; element = element.offsetParent){
      position -= element.offsetLeft;
    }
    
    // keep knob in the bounds
    position += knobWidth / 2;
    position = Math.min(position, trackWidth);
    position = Math.max(position - knobWidth, 0);
  
    this.setKnobPosition(position);
  
    // update
    value = this.options.min + Math.round(position * range / width);
    this.setValue(value);
  };

  // call callback with new value
  MobileRangeSlider.prototype.callback = function(value) { 
    if (this.options.change){
      this.options.change(value);
    }
  };

  //public function
  window.MobileRangeSlider = MobileRangeSlider;
})();