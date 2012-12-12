define( [ 
	"jquery",
	"app/shared",
	"app/utilities",
	"jquery.throttle-debounce.custom",
	"jquery.stellar.custom"
],
function ( $, _s, _utils ) {
	
	var _de = _s.domElements;
	var _navi = {};
	var _$navi = _de.$main;
	var _naviWidth, _naviHeight;
	var _triggers = [];
	var _triggersAdded = [];
	var _triggersSorted = {
		top: [],
		bottom: [],
		left: [],
		right: []
	};
	var _scrollPosition = { x: 0, y: 0 };
	var _scrollCenterPosition = { x: 0, y: 0 };
	var _scrollDirection = { x: 0, y: 0 };
	var _triggerCheckPosition = { x: 0, y: 0 };
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	_de.$maxgrounds.attr( "data-stellar-ratio", _s.parallaxMaxground );
	_de.$foregrounds.attr( "data-stellar-ratio", _s.parallaxForeground );
	_de.$middlegrounds.attr( "data-stellar-ratio", _s.parallaxMiddleground );
	_de.$backgrounds.attr( "data-stellar-ratio", _s.parallaxBackground );
	
	var ThrottledScroll = $.throttle( _s.throttleTimeShort, Scroll );
	
	_$navi
		.removeClass( 'unscrollable' )
		.on( 'scroll', ThrottledScroll )
		.stellar( {
			horizontalScrolling: false
		} );
	
	_s.signals.onContentRefreshed.add( Resize );
	
	/*===================================================
	
	utility
	
	=====================================================*/
	
	function GetScrollPosition () {
		
		return _scrollPosition;
		
	}
	
	function GetScrollCenterPosition () {
		
		return _scrollCenterPosition;
		
	}
	
	function GetScrollDirection () {
		
		return _scrollDirection;
		
	}
	
	/*===================================================
	
	triggers
	
	=====================================================*/
	
	function AddTriggers ( list ) {
		
		var i, il, added = [], trigger;
		
		if ( typeof list !== 'undefined' ) {
			
			for( i = 0, il = list.length; i < il; i++ ) {
				
				trigger = AddTrigger( list[ i ] );
				
				if ( typeof trigger !== 'undefined' ) {
					
					added.push( trigger );
					
				}
				
			}
			
		}
		
		return added;
		
	}
	
	function RemoveTriggers ( list ) {
		
		var i, il;
		
		if ( typeof list !== 'undefined' ) {
			
			for( i = 0, il = list.length; i < il; i++ ) {
				
				RemoveTrigger( list[ i ] );
				
			}
			
		}
		
	}
	
	function AddTrigger ( trigger ) {
		
		var $element = trigger.$element = trigger.$element || $( trigger.element );
		var bounds = trigger.bounds = GetTriggerBounds( $element );
		
		if ( $element.length > 0 ) {
			
			// find if element already has trigger
			// trying to detect duplicates seems to have false positives
			// instead, combine triggers
			
			var i, il, triggerExisting;
			
			for( i = 0, il = _triggers.length; i < il; i++ ) {
				
				triggerExisting = _triggers[ i ];
				
				if ( triggerExisting.$element.is( $element ) ) {
					
					// add new callbacks to existing
					
					var j, jl, callbackType;
					var callbackTypes = [
							'callback',
							'callbackContinuous',
							'callbackCenter',
							'callbackCenterContinuous',
							'callbackCenterOutside',
							'callbackOutside',
							'callbackRemove'
						];
					
					for ( j = 0, jl = callbackTypes.length; j < jl; j++ ) {
						
						callbackType = callbackTypes[ j ];
						
						if ( trigger[ callbackType ] ) {
							
							if ( triggerExisting[ callbackType ] ) {
								
								triggerExisting[ callbackType ] = [].concat( triggerExisting[ callbackType ], trigger[ callbackType ] );
								
							}
							else {
								
								triggerExisting[ callbackType ] = trigger[ callbackType ];
								
							}
							
						}
						
					}
					
					return triggerExisting;
					
				}
				
			}
			
			_triggers.push( trigger );
			_triggersAdded.push( trigger );
			
			// sorting
			
			AddTriggerSorted( trigger );
			
			if ( trigger.callbackAdd ) {
				
				HandleTriggerCallbacks( trigger, trigger.callbackAdd, trigger.contextAdd || trigger.contextAll );
				
			}
			
			return trigger;
			
		}
		
	}
	
	function RemoveTrigger ( trigger ) {
		
		if ( typeof trigger !== 'undefined' ) {
			
			// primary trigger
			
			_utils.ArrayCautiousRemove( _triggers, trigger );
			
			if ( _triggersAdded.length > 0 ) {
				
				_utils.ArrayCautiousRemove( _triggersAdded, trigger );
				
			}
			
			// handle trigger outside in case we've entered trigger area
			
			TriggerOutside( trigger );
			
			if ( trigger.callbackRemove ) {
				
				HandleTriggerCallbacks( trigger, trigger.callbackRemove, trigger.contextRemove || trigger.contextAll );
				
			}
			
			// sorting
			
			RemoveTriggerSorted( trigger );
			
		}
		
	}
	
	function AddTriggerSorted ( trigger ) {
		
		_triggersSorted.top.push( trigger );
		_triggersSorted.bottom.push( trigger );
		
		SortTriggers();
		
	}
	
	function RemoveTriggerSorted ( trigger ) {
		
		_utils.ArrayCautiousRemove( _triggersSorted.top, trigger );
		_utils.ArrayCautiousRemove( _triggersSorted.bottom, trigger );
		
	}
	
	function SortTriggers () {
		
		// sort assuming iteration from end to start
		
		_triggersSorted.top.sort( function ( a, b ) {
			return b.bounds.top - a.bounds.top;
		} );
		_triggersSorted.bottom.sort( function ( a, b ) {
			return a.bounds.bottom - b.bounds.bottom;
		} );
		
	}
	
	function CheckTriggers ( force, triggers ) {
		
		if ( force === true || ( _scrollPosition.y !== _triggerCheckPosition.y || _scrollPosition.x !== _triggerCheckPosition.x ) ) {
			
			var dirX = _scrollPosition.x - _triggerCheckPosition.x;
			var dirY = _scrollPosition.y - _triggerCheckPosition.y;
			var resetOnReverse;
			var minX, maxX, minY, maxY;
			var left, right, top, bottom;
			var topC, bottomC;
			var numTriggersBeforeCheck = _triggers.length;
			var triggersAdded = _triggersAdded;
			
			// direction
			
			if ( dirX !== 0 ) dirX = dirX / Math.abs( dirX );
			if ( dirY !== 0 ) dirY = dirY / Math.abs( dirY );
			
			if ( _scrollDirection.y !== dirY || _scrollDirection.x !== dirX ) {
				
				resetOnReverse = true;
				_scrollDirection.x = dirX;
				_scrollDirection.y = dirY;
				
			}
			
			// scrolling up
			if ( _scrollDirection.y < 0 ) {
				
				minX = _scrollPosition.x;
				maxX = _triggerCheckPosition.x;
				minY = _scrollPosition.y;
				maxY = _triggerCheckPosition.y;
				
				topC = minY + _naviHeight * 0.5;
				bottomC = maxY + _naviHeight * 0.5;
				
				if ( typeof triggers === 'undefined' ) {
					
					triggers = _triggersSorted.bottom.slice( 0 );
					
				}
				
			}
			// scrolling top down
			else {
				
				minX = _triggerCheckPosition.x;
				maxX = _scrollPosition.x;
				minY = _triggerCheckPosition.y;
				maxY = _scrollPosition.y;
				
				topC = minY;
				bottomC = maxY + _naviHeight * 0.5;
				
				if ( typeof triggers === 'undefined' ) {
					
					triggers = _triggersSorted.top.slice( 0 );
					
				}
				
			}
			
			left = minX;
			right = maxX + _naviWidth;
			top = minY;
			bottom = maxY + _naviHeight;
			
			// for each trigger
			
			var i, trigger, bounds;
			
			for( i = triggers.length - 1; i >= 0; i-- ) {
				
				trigger = triggers[ i ];
				bounds = trigger.bounds;
				
				// if should reset trigger on reverse direction
				
				if ( trigger.resetOnReverse === true && resetOnReverse === true ) {
					
					trigger.resetOnReverse = false;
					ResetTrigger( trigger );
					
				}
				
				// any overlap with trigger
				
				if ( _utils.AABBIntersectsAABB( left, top, right, bottom, bounds.left, bounds.top, bounds.right, bounds.bottom ) ) {
					
					if ( trigger.callbackContinuous ) {
						
						HandleTriggerCallbacks( trigger, trigger.callbackContinuous, trigger.contextContinuous || trigger.contextAll );
						
					}
					
					if ( trigger.callback && trigger.inside !== true ) {
						
						HandleTriggerCallbacks( trigger, trigger.callback, trigger.context || trigger.contextAll );
						
					}
					
					// screen center inside trigger
					
					if ( _utils.AABBIntersectsAABB( left, topC, right, bottomC, bounds.left, bounds.top, bounds.right, bounds.bottom ) ) {
						
						if ( trigger.callbackCenterContinuous ) {
							
							HandleTriggerCallbacks( trigger, trigger.callbackCenterContinuous, trigger.contextCenterContinuous || trigger.contextAll );
							
						}
						
						if ( trigger.callbackCenter && trigger.insideCenter !== true ) {
							
							HandleTriggerCallbacks( trigger, trigger.callbackCenter, trigger.contextCenter || trigger.contextAll );
							
						}
						
						trigger.insideCenter = true;
						
					}
					else {
						
						if ( trigger.callbackCenterOutside && trigger.insideCenter === true ) {
							
							HandleTriggerCallbacks( trigger, trigger.callbackCenterOutside, trigger.contextCenterOutside || trigger.contextAll );
							
						}
						
						trigger.insideCenter = false;
						
					}
					
					if ( trigger.once === true ) {
						
						RemoveTrigger( trigger );
						
					}
					
					trigger.inside = true;
					trigger.outside = false;
				
				}
				else {
					
					TriggerOutside( trigger );
					
				}
				
			}
			
			// reset triggers added
			
			_triggersAdded = [];
			
			// if triggers have been added during this check, check one more time
			
			if ( _triggers.length > numTriggersBeforeCheck  ) {
				
				CheckTriggers( false, triggersAdded );
				
			}
			// update trigger check position
			else {
				
				_triggerCheckPosition.x = _scrollPosition.x;
				_triggerCheckPosition.y = _scrollPosition.y;
				
			}
			
		}
		
	}
	
	function TriggerOutside ( trigger ) {
		
		if ( trigger.callbackOutside && trigger.inside === true ) {
			
			HandleTriggerCallbacks( trigger, trigger.callbackOutside, trigger.contextOutside || trigger.contextAll );
			
		}
		
		if ( trigger.callbackCenterOutside && trigger.insideCenter === true ) {
			
			HandleTriggerCallbacks( trigger, trigger.callbackCenterOutside, trigger.contextCenterOutside || trigger.contextAll );
			
		}
		
		ResetTrigger( trigger );
		
	}
	
	function ResetTrigger ( trigger ) {
		
		trigger.inside = trigger.insideCenter = trigger.insideCenterLeave = false;
		
	}
	
	function HandleTriggerCallbacks ( trigger, callbacks, contextFallback ) {
		
		var i, il, callbackData;
		
		if ( _utils.IsArray( callbacks ) ) {
			
			for ( i = 0, il = callbacks.length; i < il; i++ ) {
				
				callbackData = callbacks[ i ];
				
				if ( typeof callbackData === 'function' ) {
					
					callbackData.call( contextFallback, trigger );
					
				}
				else {
					
					callbackData.callback.call( callbackData.context || contextFallback, trigger );
					
				}
				
			}
			
		}
		else {
			
			callbacks.call( contextFallback, trigger );
			
		}
		
	}
	
	function ReverseResetTriggers ( triggers, id ) {
		
		var i, il, trigger;
		
		triggers = _utils.ToArray( triggers || _triggers );
		
		for ( i = 0, il = triggers.length; i < il; i++ ) {
			
			ReverseResetTrigger( triggers[ i ] );
		}
		
	}
	
	function ReverseResetTrigger ( trigger ) {
		
		trigger.resetOnReverse = true;
		
	}
	
	function RepositionTriggers () {
		
		var i, il, trigger;
		
		for ( i = 0, il = _triggers.length; i < il; i++ ) {
			
			trigger = _triggers[ i ];
			trigger.bounds = GetTriggerBounds( trigger.$element );
			
		}
		
	}
	
	function GetTriggerBounds ( $element ) {
		
		var bounds = _utils.DOMBounds( $element );
		
		// account for scroll
		
		bounds.left += _scrollPosition.x;
		bounds.right += _scrollPosition.x;
		bounds.top += _scrollPosition.y;
		bounds.bottom += _scrollPosition.y;
		
		return bounds;
		
	}
	
	/*===================================================
	
	resize
	
	=====================================================*/
	
	function Resize () {
		
		_naviWidth = _$navi.width();
		_naviHeight = _$navi.height();
		
		// rebound triggers
		
		RepositionTriggers();
		
		// update parallax
		
		_$navi.stellar( 'refresh' );
		
	}
	
	/*===================================================
	
	scroll
	
	=====================================================*/
	
	function Scroll () {
		
		_scrollPosition.x = _$navi.scrollLeft();
		_scrollPosition.y = _$navi.scrollTop();
		
		_scrollCenterPosition.x = _scrollPosition.x + _naviWidth * 0.5;
		_scrollCenterPosition.y = _scrollPosition.y + _naviHeight * 0.5;
		
		CheckTriggers();
		
		_s.signals.onScrolled.dispatch();
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_navi.$element = _$navi;
	
	_navi.GetScrollPosition = GetScrollPosition;
	_navi.GetScrollCenterPosition = GetScrollCenterPosition;
	_navi.GetScrollDirection = GetScrollDirection;
	
	_navi.AddTriggers = AddTriggers;
	_navi.AddTrigger = AddTrigger;
	_navi.RemoveTriggers = RemoveTriggers;
	_navi.RemoveTrigger = RemoveTrigger;
	_navi.CheckTriggers = CheckTriggers;
	_navi.RepositionTriggers = RepositionTriggers;
	_navi.ReverseResetTriggers = ReverseResetTriggers;
	_navi.ReverseResetTrigger = ReverseResetTrigger;
	
	return _navi;
	
} );