define( [ 
	"jquery",
	"app/shared",
	"app/utilities",
	"hammer.custom",
	"jquery.throttle-debounce.custom",
	"jquery.stellar.custom",
	"jquery.smooth-scroll"
],
function ( $, _s, _utils ) {
	
	var _de = _s.domElements;
	var _navi = {};
	var _$navi = _de.$main;
	var _naviWidth, _naviHeight;
	var _triggers = [];
	var _triggersChanged = [];
	var _triggersSorted = {
		top: [],
		bottom: []
	};
	var _callbackTypes = [
		'callback',
		'callbackContinuous',
		'callbackCenter',
		'callbackCenterContinuous',
		'callbackCenterOutside',
		'callbackOutside',
		'callbackRemove'
	];
	var _scrollPosition = { x: 0, y: 0 };
	var _scrollCenterPosition = { x: 0, y: 0 };
	var _scrollDirection = { x: 0, y: 0 };
	var _triggerCheckPosition = { x: 0, y: 0 };
	var _$scrollContainer;
	var _triggerScrollContainer;
	var _triggerScrollContainerNext;
	var _triggerScrollContainerPrev;
	
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
			horizontalScrolling: false,
			hideDistantElements: false // necessary or safari doesn't play nice with stellar.js
		} );
		
		_de.$scrollContainer.each( function ( index ) {
				
				var $element = $( this );
				
				if ( index < _de.$scrollContainer.length - 1 ) {
						
						$element.data( '$scrollTargetNext', _de.$scrollContainer.eq( index + 1 ) );
						
				}
				
				if ( index > 0 ) {
						
						$element.data( '$scrollTargetPrev', _de.$scrollContainer.eq( index - 1 ) );
						
				}
				
		} );
		
		FindUserScrollContainer();
		
		_de.$scrollButtonUp.on( 'tap', function () {
				
				UserScroll( _$scrollContainer.data( '$scrollTargetPrev' ) );
				
		} );
		
		_de.$scrollButtonDown.on( 'tap', function () {
				
				UserScroll( _$scrollContainer.data( '$scrollTargetNext' ) );
				
		} );
		
	_s.signals.onContentRefreshed.add( Resize );
	
	/*===================================================
	
	utility
	
	=====================================================*/
	
	function GetTriggers () {
		
		return _triggers;
		
	}
	
	function GetTriggersSorted () {
		
		return _triggersSorted;
		
	}
	
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
	
	function AddTrigger ( parameters ) {
		
		parameters = parameters || {};
		var $element = parameters.$element || $( parameters.element );
		
		if ( $element.length > 0 ) {
			
			var index = _utils.IndexOfPropertyjQuery( _triggers, '$element', $element );
			var trigger;
			
			// element has trigger
			
			if ( index !== -1 ) {
				
				trigger = _triggers[ index ];
				
			}
			// needs new trigger
			else {
				
				trigger = {
					$element: $element,
					bounds: GetTriggerBounds( $element )
				};
				
				_triggers.push( trigger );
				AddTriggerSorted( trigger );
				
			}
			
			// merge callbacks
			
			var i, il, callbackType;
			
			for ( i = 0, il = _callbackTypes.length; i < il; i++ ) {
				
				callbackType = _callbackTypes[ i ];
				
				if ( parameters[ callbackType ] ) {
					
					if ( trigger[ callbackType ] ) {
						
						trigger[ callbackType ] = _utils.ToArray( trigger[ callbackType ] ).concat( parameters[ callbackType ] );
						
					}
					else {
						
						trigger[ callbackType ] = parameters[ callbackType ];
						
					}
					
				}
				
			}
			
			_triggersChanged.push( trigger );
			
			if ( parameters.callbackAdd ) {
				
				HandleTriggerCallbacks( trigger, parameters.callbackAdd );
				
			}
			
		}
		
		return parameters;
		
	}
	
	function RemoveTrigger ( parameters ) {
		
		parameters = parameters || {};
		var $element = parameters.$element = parameters.$element || $( parameters.element );
		
		if ( $element.length > 0 ) {
			
			var index = _utils.IndexOfPropertyjQuery( _triggers, '$element', $element );
			
			var trigger;
			var triggerEmpty = true;
			
			if ( index !== -1 ) {
				
				trigger = _triggers[ index ];
				
				// remove callbacks
				
				var i, il, callbackType, callbackData, triggerCallbackData;
				
				for ( i = 0, il = _callbackTypes.length; i < il; i++ ) {
					
					callbackType = _callbackTypes[ i ];
					callbackData = parameters[ callbackType ];
					triggerCallbackData = trigger[ callbackType ];
					
					if ( callbackData ) {
						
						if ( callbackData === triggerCallbackData ) {
							
							delete trigger[ callbackType ];
							
						}
						// trigger callbacks is array
						else if ( _utils.IsArray( triggerCallbackData ) ) {
							
							if ( _utils.IsArray( callbackData ) ) {
								
								for ( var j = 0, jl = callbackData.length; j < jl; j++ ) {
									
									_utils.ArrayCautiousRemove( triggerCallbackData, callbackData[ j ] );
									
								}
								
							}
							else {
								
								_utils.ArrayCautiousRemove( triggerCallbackData, callbackData );
								
							}
							
							if ( triggerCallbackData.length === 0 ) {
								
								delete trigger[ callbackType ];
								
							}
							
						}
						
					}
					
					if ( triggerEmpty !== false ) {
						
						triggerEmpty = typeof trigger[ callbackType ] === 'undefined';
						
					}
					
				}
				
				if ( triggerEmpty === true ) {
						
					_triggers.splice( index, 1 );
					
					// changed
					
					if ( _triggersChanged.length > 0 ) {
						
						_utils.ArrayCautiousRemove( _triggersChanged, trigger );
						
					}
					
					// sorting
					
					RemoveTriggerSorted( trigger );
					
					// handle trigger outside in case we've entered trigger area
					
					TriggerOutside( trigger );
					
				}
				
				if ( parameters.callbackRemove ) {
					
					HandleTriggerCallbacks( trigger, parameters.callbackRemove );
					
				}
				
			}
			
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
			var triggersAdded = _triggersChanged;
			
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
						
						HandleTriggerCallbacks( trigger, trigger.callbackContinuous );
						
					}
					
					if ( trigger.callback && trigger.inside !== true ) {
						
						HandleTriggerCallbacks( trigger, trigger.callback );
						
					}
					
					// screen center inside trigger
					
					if ( _utils.AABBIntersectsAABB( left, topC, right, bottomC, bounds.left, bounds.top, bounds.right, bounds.bottom ) ) {
						
						if ( trigger.callbackCenterContinuous ) {
							
							HandleTriggerCallbacks( trigger, trigger.callbackCenterContinuous );
							
						}
						
						if ( trigger.callbackCenter && trigger.insideCenter !== true ) {
							
							HandleTriggerCallbacks( trigger, trigger.callbackCenter );
							
						}
						
						trigger.insideCenter = true;
						
					}
					else {
						
						if ( trigger.callbackCenterOutside && trigger.insideCenter === true ) {
							
							HandleTriggerCallbacks( trigger, trigger.callbackCenterOutside );
							
						}
						
						trigger.insideCenter = false;
						
					}
					
					if ( trigger.once === true ) {
						
						RemoveTrigger( trigger );
						
					}
					
					trigger.inside = true;
				
				}
				else {
					
					TriggerOutside( trigger );
					
				}
				
			}
			
			// reset triggers added
			
			_triggersChanged = [];
			
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
			
			HandleTriggerCallbacks( trigger, trigger.callbackOutside );
			
		}
		
		if ( trigger.callbackCenterOutside && trigger.insideCenter === true ) {
			
			HandleTriggerCallbacks( trigger, trigger.callbackCenterOutside );
			
		}
		
		ResetTrigger( trigger );
		
	}
	
	function ResetTrigger ( trigger ) {
		
		trigger.inside = trigger.insideCenter = trigger.insideCenterLeave = false;
		
	}
	
	function HandleTriggerCallbacks ( trigger, callbacks ) {
		
		var i, il;
		
		if ( _utils.IsArray( callbacks ) ) {
			
			for ( i = 0, il = callbacks.length; i < il; i++ ) {
				
				HandleTriggerCallback( trigger, callbacks[ i ] );
				
			}
			
		}
		else {
			
			HandleTriggerCallback( trigger, callbacks );
			
		}
		
	}
	
	function HandleTriggerCallback ( trigger, callback ) {
		
		if ( typeof callback === 'function' ) {
			
			callback( trigger );
			
		}
		else if ( callback.callback ) {
			
			callback.callback.call( callback.context, trigger );
			
		}
		
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
	
	function ReverseResetTriggers ( parameters, id ) {
		
		var i, il, trigger;
		var triggers = FindTriggers( parameters );
		
		for ( i = 0, il = triggers.length; i < il; i++ ) {
			
			triggers[ i ].resetOnReverse = true;
			
		}
		
	}
	
	function FindTriggers ( parameters ) {
		
		var i, il, trigger;
		var $elements;
		
		// parameters are elements
		
		if ( parameters instanceof $ ) {
			
			$elements = parameters;
			
		}
		// from array
		else if ( _utils.IsArray( parameters ) ) {
			
			$elements = $();
			
			for ( i = 0, il = parameters.length; i < il; i++ ) {
				
				trigger = parameters[ i ];
				
				$elements = $elements.add( trigger.$elements || trigger.$element || trigger.elements || trigger.element );
				
			}
			
		}
		// from element
		else if ( typeof parameters !== 'undefined' ) {
			
			$elements = parameters.$elements || parameters.$element || $( parameters.elements || parameters.element );
			
		}
		
		if ( $elements.length > 0 ) {
			
			return _utils.ValuesWithPropertyjQuery( _triggers, '$element', $elements );
			
		}
		else {
			
			return _triggers;
			
		}
		
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
		
		// refind user scroll container
		
		FindUserScrollContainer();
		
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
	
	function UserScroll ( $scrollTarget ) {
		
		if ( $scrollTarget instanceof $ ) {
				
				OnScrollContainerChange( $scrollTarget );
				
				var parameters = {
						scrollElement: _$navi,
						offset: $scrollTarget.offset().top,
						easing: 'easeInOutCubic',
						speed: _s.scrollDuration
				};
				
				if ( _s.lowPerformance === true ) parameters.speed = 0;
				
				$.smoothScroll( parameters );
				
		}
		
	}
	
	function FindUserScrollContainer () {
		
		var $scrollContainer;
		
		_de.$scrollContainer.each( function () {
			
				var $element = $( this );
				var bounds = GetTriggerBounds( $element );
				var intersects = _utils.AABBIntersectsAABB( _scrollPosition.x, _scrollPosition.y, _scrollPosition.x, _scrollPosition.y, bounds.left, bounds.top, bounds.right, bounds.bottom );
				
				// take first intersection
				
				if ( intersects === true ) {
						
						$scrollContainer = $element;
						
						return false;
						
				}
				
		} );
		
		if ( $scrollContainer instanceof $ && $scrollContainer.is( _$scrollContainer ) !== true ) {
				
				if ( _$scrollContainer instanceof $ ) {
						
						RemoveTrigger( $scrollContainer.data( 'triggerScrollContainer' ) );
						
						var $scrollTargetNext = _$scrollContainer.data( '$scrollTargetNext' );
						var $scrollTargetPrev = _$scrollContainer.data( '$scrollTargetPrev' );
						
						if ( $scrollTargetPrev instanceof $ ) {
								RemoveTrigger( $scrollTargetPrev.data( 'triggerScrollContainer' ) );
						}
						
						if ( $scrollTargetNext instanceof $ ) {
								RemoveTrigger( $scrollTargetNext.data( 'triggerScrollContainer' ) );
						}
						
				}
				
				$scrollContainer.data( 'triggerScrollContainer', AddTrigger( {
						$element: $scrollContainer,
						callbackCenter: function () {
								OnScrollContainerChange( $scrollContainer );
						}
				} ) );
				
				OnScrollContainerChange( $scrollContainer );
				
		}
		
	}
	
	function OnScrollContainerChange ( $scrollContainer ) {
		
		if ( $scrollContainer.is( _$scrollContainer ) !== true ) {
				
				var $scrollContainerLast = _$scrollContainer;
				_$scrollContainer = $scrollContainer;
				
				if ( $scrollContainerLast instanceof $ ) {
						
						ReverseResetTriggers( $scrollContainerLast.data( 'triggerScrollContainer' ) );
						
				}
				
				var $scrollTargetNext = _$scrollContainer.data( '$scrollTargetNext' );
				var $scrollTargetPrev = _$scrollContainer.data( '$scrollTargetPrev' );
				
				if ( $scrollTargetPrev instanceof $ ) {
						
						if ( $scrollTargetPrev.is( $scrollContainerLast ) ) {
								
								var $lastLast = $scrollContainerLast.data( '$scrollTargetPrev' );
								
								if ( $lastLast instanceof $ ) {
										
										RemoveTrigger( $lastLast.data( 'triggerScrollContainer' ) );
										
								}
								
						}
						else {
								
								$scrollTargetPrev.data( 'triggerScrollContainer', AddTrigger( {
									$element: $scrollTargetPrev,
									callbackCenter: function () {
										OnScrollContainerChange( $scrollTargetPrev );
									}
								} ) );
								
						}
						
				}
				
				if ( $scrollTargetNext instanceof $ ) {
						
						if ( $scrollTargetNext.is( $scrollContainerLast ) ) {
								
								var $nextNext = $scrollContainerLast.data( '$scrollTargetNext' );
								
								if ( $nextNext instanceof $ ) {
										
										RemoveTrigger( $nextNext.data( 'triggerScrollContainer' ) );
										
								}
								
						}
						else {
								
								$scrollTargetNext.data( 'triggerScrollContainer', AddTrigger( {
									$element: $scrollTargetNext,
									callbackCenter: function () {
										OnScrollContainerChange( $scrollTargetNext );
									}
								} ) );
								
						}
						
				}
				
		}
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_navi.$element = _$navi;
	
	_navi.GetTriggers = GetTriggers;
	_navi.GetTriggersSorted = GetTriggersSorted;
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
	
	return _navi;
	
} );