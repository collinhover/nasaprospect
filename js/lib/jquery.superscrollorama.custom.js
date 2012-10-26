/*
	SUPERSCROLLORAMA - The jQuery plugin for doing scroll animations
	by John Polacek (@johnpolacek)
	
	Powered by the Greensock Tweening Platform
	http://www.greensock.com
	Greensock License info at http://www.greensock.com/licensing/
	
	Dual licensed under MIT and GPL.
*/

/*
	modified by Collin Hover @ collinhover.com
	+ target multiple elements all scrolling independently
	+ init / stop on command
	+ duration / offset as a percentage of element
*/

(function($) {
	
	function SuperScrollorama ( element, options ) {
		
		this.$document = $( document );
		this.$element = $( element );
		this.options = options;
		this.animObjects = [];
		this.pinnedObjects = [];
		this.x = 0;
		this.y = 0;
		
		this.init();
		
	}
	
	SuperScrollorama.prototype = {
		init: function () {
			
			// reset to top
			
			this.$element.animate( { scrollTop: 0 }, 0 );
			
			// events
			
			this.$document
				.on( 'scroll.superscrollorama', $.proxy( this.scrollUpdate, this ) );
			
			this.$element
				.on( 'jsp-scroll-x.superscrollorama', $.proxy( this.scrollUpdateX, this ) )
				.on( 'jsp-scroll-y.superscrollorama', $.proxy( this.scrollUpdateY, this ) );
			
			// begin update loop
			
			return this.update();
			
		},
		stop: function () {
			
			this.$element.off( '.superscrollorama' );
			
			clearTimeout( this._updateTimeoutId );
			
			return this;
			
		},
		scrollUpdate: function () {
			
			this._dirtyScroll = true;
			
			return this;
			
		},
		scrollUpdateX: function ( e, scrollPositionX ) {
			
			this.x = scrollPositionX;
			this._dirtyScroll = this._dirtyScrollX = true;
			
			return this;
			
		},
		scrollUpdateY: function ( e, scrollPositionY ) {
			
			this.y = scrollPositionY;
			this._dirtyScroll = this._dirtyScrollY = true;
			
			return this;
			
		},
		parseDuration: function ( dur, size ) {
			
			// handle % duration
			
			if ( typeof dur === 'string' ) {
				
				var index = dur.lastIndexOf( '%' );
				
				if ( index !== -1 ) {
					
					dur = size * ( parseInt( dur ) * 0.01 );
					
				}
				else {
					
					dur = parseInt( dur );
					
				}
				
			}
			
			// last resort
			
			if ( isNaN( dur ) || isFinite( dur ) !== true ) {
				
				dur = 0;
				
			}
			
			return dur;
			
		},
		addTween: function(target, tween, dur, offset) {
			
			tween.pause();
						
			this.animObjects.push({
				target:target,
				tween: tween,
				offset: offset || 0,
				dur: dur || 0,
				state:'BEFORE'
			});
			
			this.scrollUpdate();
	  
			return this;
		},
		pin: function(el, dur, vars) {
			if (typeof(el) === 'string') el = $(el);
			if (vars.anim) vars.anim.pause();
			
			// create wrapper for pinned elements that aren't absolute or fixed position
			var pinSpacer = null;
			if (el.css('position') === 'relative' || el.css('position') === 'static') {
				pinSpacer = $('<div class="pin-spacer"></div>');
				el.before(pinSpacer);
			}
			
			this.pinnedObjects.push({
				el:el,
				state:'BEFORE',
				dur: dur || 0,
				offset: vars.offset || 0,
				anim:vars.anim,
				origPosition:el.css('position'),
				spacer:pinSpacer,
				onPin:vars.onPin,
				onUnpin:vars.onUnpin
			});
			
			this.scrollUpdate();
	  
			return this;
		},
		update: function () {
			
			 if ( this._dirtyScroll === true ) {
				
				this._dirtyScroll = false;
				
				var isVertical = this.options.isVertical;
				var currScrollPoint = 0;
				var currScrollCounter = 0;
				
				if ( isVertical ) {
					
					if ( this._dirtyScrollY === true ) {
						
						currScrollPoint = this.y;
						currScrollCounter = -currScrollPoint;
						
					}
					else {
						
						currScrollPoint = this.$element.scrollTop() || this.$document.scrollTop();
						
					}
					
				}
				else {
					
					if ( this._dirtyScrollX === true ) {
						
						currScrollPoint = this.x;
						currScrollCounter = -currScrollPoint;
						
					}
					else {
						
						currScrollPoint = this.$element.scrollLeft() || this.$document.scrollLeft();
						
					}
					
				}
				
				var elementSize = isVertical ? this.$element.height() : this.$element.width();
				var offsetAdjust = -elementSize * 0.5;
				var i, startPoint, endPoint;
				
				// check all animObjects
				var numAnim = this.animObjects.length;
				
				for ( i=0; i<numAnim; i++ ) {
					
					var animObj = this.animObjects[i];
					var target = animObj.target;
					var offset = this.parseDuration( animObj.offset, elementSize );
					var dur = this.parseDuration( animObj.dur, elementSize );
				
					if (typeof(target) === 'string') {
						startPoint = isVertical ? $(target).offset().top - currScrollCounter : $(target).offset().left - currScrollCounter;
						offset += offsetAdjust;
					} else if (typeof(target) === 'number')	{
						startPoint = target;
					} else {
						startPoint = isVertical ? target.offset().top - currScrollCounter : target.offset().left - currScrollCounter;
						offset += offsetAdjust;
					}
					
					startPoint += offset;
					endPoint = startPoint + dur;
					
					if ((currScrollPoint > startPoint && currScrollPoint < endPoint) && animObj.state !== 'TWEENING') {
						// if it should be TWEENING and isn't..
						animObj.state = 'TWEENING';
						animObj.start = startPoint;
						animObj.end = endPoint;
						animObj.tween.progress((currScrollPoint - animObj.start)/(animObj.end - animObj.start)).pause();
					} else if (currScrollPoint < startPoint && animObj.state !== 'BEFORE') {
						// if it should be at the BEFORE tween state and isn't..
						animObj.tween.reverse();
						animObj.state = 'BEFORE';
					} else if (currScrollPoint > endPoint && animObj.state !== 'AFTER') {
						// if it should be at the AFTER tween state and isn't..
						animObj.tween.play();
						animObj.state = 'AFTER';
					} else if (animObj.state === 'TWEENING') {
						// if it is TWEENING..
						animObj.tween.progress((currScrollPoint - animObj.start)/(animObj.end - animObj.start)).pause();
					}
					
				}
					
				// check all pinned elements
				
				var numPinned = this.pinnedObjects.length;
				
				for (i=0; i<numPinned; i++) {
					
					var pinObj = this.pinnedObjects[i];
					var el = pinObj.el;
					var elHeight = el.outerHeight();
					
					// should object be pinned?
					if (pinObj.state != 'PINNED') {
						
						var offset = this.parseDuration( pinObj.offset, elementSize );
						var dur = this.parseDuration( pinObj.dur, elementSize );
						
						startPoint = pinObj.spacer ?
							isVertical ? pinObj.spacer.offset().top : pinObj.spacer.offset().left :
							isVertical ? el.offset().top : el.offset().left;
						
						startPoint += offset;

						endPoint = startPoint + dur;
						
						if (currScrollPoint > startPoint && currScrollPoint < endPoint) {
							// pin it
							pinObj.state = 'PINNED';
							
							// set original position value for unpinning
							pinObj.origPositionVal = isVertical ? el.css('top') : el.css('left');
							if (pinObj.origPositionVal === 'auto')
								pinObj.origPositionVal = 0;
							else
								pinObj.origPositionVal = parseInt(pinObj.origPositionVal, 10);
							
							// change to fixed position
							el.css('position','fixed');
							if (isVertical)
								el.css('top', -offset);
							else
								el.css('left', -offset);
							
							pinObj.pinStart = startPoint;
							pinObj.pinEnd = endPoint;

							if (pinObj.spacer)
								pinObj.spacer.css('height', dur + elHeight);

							if (pinObj.onPin)
								pinObj.onPin();
						}

					// Check to see if object should be unpinned
					} else {
						
						if (currScrollPoint < pinObj.pinStart || currScrollPoint > pinObj.pinEnd) {
							
							// unpin it
							pinObj.state = currScrollPoint < pinObj.pinStart ? 'BEFORE' : 'AFTER';
							if(pinObj.anim&&pinObj.state === 'BEFORE'){
								pinObj.anim.progress(0);
							}else if(pinObj.anim&&pinObj.state === 'AFTER'){
								pinObj.anim.progress(1);
							}
							// revert to original position value
							el.css('position',pinObj.origPosition);
							if (isVertical)
								el.css('top', pinObj.origPositionVal);
							else
								el.css('left', pinObj.origPositionVal);
							
							if (pinObj.spacer)
								pinObj.spacer.css('height', currScrollPoint < pinObj.pinStart ? 0 : pinObj.dur);

							if (pinObj.onUnpin)
								pinObj.onUnpin();
						}
						else if (pinObj.anim) {
							// do animation
							pinObj.anim.progress((currScrollPoint - pinObj.pinStart)/(pinObj.pinEnd - pinObj.pinStart));
						}
					}
				}
				
			}
			
			// loop calls itself and runs, then waits 100 miliseconds and runs again
			
			this._updateTimeoutId = setTimeout( $.proxy( this.update, this ), this.options.timeDelta );
			
			return this;
			
		}
	};
	
	$.fn.superscrollorama = function( option ) {
		
		var args = Array.prototype.slice.call( arguments, 1 );
		
		return this.each( function () {
			
			var $this = $( this );
			var data = $this.data( 'superscrollorama' );
			var options = $.extend( {}, $.fn.superscrollorama.defaults, typeof option == 'object' && option );
			var action = typeof option == 'string' ? option : false;
			
			if ( !data ) {
				
				$this.data( 'superscrollorama', (data = new SuperScrollorama( this, options ) ) );
				
			}
			
			if ( action && typeof data[ action ] === 'function' ) {
				
				data[ action ].apply( data, args );
				
			}
			
		});
		
	};
	
	$.fn.superscrollorama.Constructor = SuperScrollorama;
	
	$.fn.superscrollorama.defaults = {
		timeDelta: 1000 / 30,
		isVertical:true
	};
     
})(jQuery);