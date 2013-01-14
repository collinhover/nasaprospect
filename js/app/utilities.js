define( [ 
	"jquery",
	"app/shared",
	"jquery.placeholdme"
],
function ( $, _s ) {
	
	var _utils = {};
	
	/*===================================================
    
    type checking
    
    =====================================================*/
	
	function Type ( o ) {
		return o==null?o+'':Object.prototype.toString.call(o).slice(8,-1).toLowerCase();
	}
	
	function IsArray ( target ) {
		return Object.prototype.toString.call( target ) === '[object Array]';
	}
	
	function IsNumber ( n ) {
		return !isNaN( n ) && isFinite( n ) && typeof n !== 'boolean';
	}
	
	function IsImage ( target ) {
		return ( typeof target !== 'undefined' && target.hasOwnProperty('nodeName') && target.nodeName.toLowerCase() === 'img' );
	}
	
	function IsImageExt ( ext ) {
		
		if ( ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp' ) {
			return true;
		}
		else {
			return false;
		}
		
    }
	
	function IsEvent ( obj ) {
		return obj && ( obj.type && ( obj.target || obj.srcElement ) );
	}
	
	/*===================================================
    
    array / object helpers
    
    =====================================================*/
	
	function ToArray ( target ) {
		
		return target ? ( IsArray ( target ) !== true ? [ target ] : target ) : [];
		
	}
	
	function ToNotArray ( target, index ) {
		
		return IsArray ( target ) === true ? target[ index || 0 ] : target;
		
	}
	
	function ArrayCautiousAdd ( target, elements ) {
		
		var i, l,
			element,
			index,
			added = false;
		
		target = ToArray( target );
		elements = ToArray( elements );
		
		// for each element
		
		for ( i = 0, l = elements.length; i < l; i++ ) {
			
			element = elements[ i ];
			
			index = IndexOfValue( target, element );
			
			if ( index === -1 ) {
				
				target.push( element );
				
				added = true;
				
			}
			
		}
		
		return added;
		
	}
	
	function ArrayCautiousRemove ( target, elements ) {
		
		var i, l,
			element,
			index,
			removed = false;
		
		target = ToArray( target );
		elements = ToArray( elements );
		
		// for each element
		
		for ( i = 0, l = elements.length; i < l; i++ ) {
			
			element = elements[ i ];
			
			index = IndexOfValue( target, element );
			
			if ( index !== -1 ) {
				
				target.splice( index, 1 );
				
				removed = true;
				
			}
			
		}
		
		return removed;
		
	}
	
	function ArrayRandomValue ( array ) {
		
		return array[ Math.round( Math.random() * ( array.length - 1 ) ) ];
		
	}
	
	function IndexOfValue( array, value ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function LastIndexOfValue( array, value ) {
		
		for ( var i = array.length - 1; i >= 0; i-- ) {
			
			if ( value === array[ i ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function IndicesOfValue( array, value ) {
		
		var indices = [];
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ] ) {
				
				indices.push( i );
				
			}
			
		}
		
		return indices;
		
	}
	
	function IndexOfValues( array, values ) {
		
		for ( var i = 0, l = values.length; i < l; i++ ) {
			
			if ( IndexOfValue( array, values[ i ] ) !== -1 ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function IndexOfString( array, string ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( typeof array[ i ] === 'string' && array[ i ].indexOf( string ) !== -1 ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function IndexOfProperty( array, property, value ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ][ property ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function IndexOfPropertyjQuery( array, property, $element ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			var $potential = array[ i ][ property ];
			
			if ( $element.is( $potential ) ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function IndicesOfPropertyjQuery( array, property, $element ) {
		
		var indices = [];
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			var $potential = array[ i ][ property ];
			
			if ( $element.is( $potential ) ) {
				
				indices.push( i );
				
			}
			
		}
		
		return indices;
		
	}
	
	function ValuesWithPropertyjQuery( array, property, $element ) {
		
		var values = [];
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			var value = array[ i ];
			var $potential = value[ property ];
			
			if ( $element.is( $potential ) ) {
				
				values.push( value );
				
			}
			
		}
		
		return values;
		
	}
	
	function IndicesOfProperty( array, property, value ) {
		
		var indices = [];
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ][ property ] ) {
				
				indices.push( i );
				
			}
			
		}
		
		return indices;
		
	}
	
	function IndexOfProperties( array, properties, refObject ) {
		
		for ( var i = 0, il = array.length; i < il; i++ ) {
			
			var found = true;
			
			for ( var j = 0, jl = properties.length; j < jl; j++ ) {
				
				// value not found, skip to next
				
				if ( refObject[ properties[ j ] ] !== array[ i ][ properties[ j ] ] ) {
					
					found = false;
					break;
					
				}
				
			}
			
			if ( found === true ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	/*===================================================
    
    math
    
    =====================================================*/
	
	function Clamp ( number, min, max ) {
		
		return Math.max( min, Math.min( max, number ) );
		
	}
	
	function AABBIntersectsAABB ( aMinX, aMinY, aMaxX, aMaxY, bMinX, bMinY, bMaxX, bMaxY ) {
		
		if ( aMinX > bMaxX ) return false;
		if ( aMaxX < bMinX ) return false;
		if ( aMinY > bMaxY ) return false;
		if ( aMaxY < bMinY ) return false;
		
		return true;
		
	}
	
	/*===================================================
    
    strings
    
    =====================================================*/
	
	function ParseDataString ( $element, dataName ) {
		
		var string = $element.attr( dataName );
		var strings = $.trim( string ).split( /[ \t\r]+/g );
		var parts = [];
		
		for ( var i = 0, il = strings.length; i < il; i++ ) {
			
			parts.push( $.trim( strings[ i ] ).split( /\/|\\/ ) );
			
		}
		
		return parts;
		
	}
	
	function FindDataOptionValue ( options, option ) {
		
		var index = _utils.IndexOfString( options, option );
		var value;
		
		if ( index !== -1 ) {
			
			value = options[ index ];
			index = value.indexOf( ':' );
			
			if ( index !== -1 ) value = value.slice( index + 1 );
			else value = true;
			
		}
		
		return value;
		
	}
	
	/*===================================================
    
    dom
    
    =====================================================*/
	
	function DOMBounds ( elements ) {

		var $elements = $( elements );
		var bounds = {
			$elements: $elements,
			left: Number.MAX_VALUE,
			right: -Number.MAX_VALUE,
			top: Number.MAX_VALUE,
			bottom: -Number.MAX_VALUE
		};
		
		// create total box from all elements
		// for simplicity, assumes all elements form a rectangle

		$elements.each( function () {
			
			var $element = $( this );
			
			if ( $element.length > 0 ) {
				
				var offset = $element.offset();
				var left = offset.left;
				var top = offset.top;
				var right = left + $element.outerWidth();
				var bottom = top + $element.outerHeight();
				
				if ( right > bounds.right ) bounds.right = right;
				if ( left < bounds.left ) bounds.left = left;
				if ( bottom > bounds.bottom ) bounds.bottom = bottom;
				if ( top < bounds.top ) bounds.top = top;
				
			}
			
		} );
		
		return bounds;
		
	}
	
	function IgnorePointerDOM ( $element, state ) {
		
		if ( $element instanceof $ ) {
				
				// use native pointer-events when available
				
				if ( _s.supports.pointerEvents ) {
					
					if ( state === true ) {
						
						$element.addClass( 'ignore-pointer-temporary' );
						
					}
					else {
						
						$element.removeClass( 'ignore-pointer-temporary' );
					
					}
					
				}
				else {
					
					// fallback in-case browser does not support pointer-events property
					// this method is incredibly slow, as it has to hide element, retrigger event to find what is under, then show again
					
					if ( state === true ) {
						
						$element.on( 'tap.pointer doubletap.pointer hold.pointer dragstart.pointer drag.pointer, dragend.pointer', 
							function ( e ) { 
								
								e.preventDefault();
								e.stopPropagation();
								
								$element.stop( true ).addClass( 'invisible' );
								
								$( document.elementFromPoint( e.clientX, e.clientY ) ).trigger( e );
								
								$element.stop( true ).removeClass( 'invisible' );
								
								return false;
								
							}
						);
						
					}
					else {
						
						$element.off( '.pointer' );
						
					}
					
				}
				
		}
		
	}
	
	function FadeDOM ( parameters ) {
		
		var $elements,
			duration,
			opacity,
			easing,
			callback,
			makeInvisible;
		
		// handle parameters
		
		parameters = parameters || {};
		
		$elements = $( parameters.element );
		duration = IsNumber( parameters.duration ) ? parameters.duration : _s.fadeDuration;
		opacity = IsNumber( parameters.opacity ) ? parameters.opacity : 0;
		easing = typeof parameters.easing === 'string' ? parameters.easing : _s.fadeEasing;
		callback = parameters.callback;
		
		// for each element
		
		$elements.each( function () {
			
			var $element = $( this ),
				$ignore,
				isCollapsed,
				isHidden,
				isInvisible,
				makeInvisible,
				fadeComplete = function () {
					
					$element.removeClass( 'hiding' );
					
					// if faded out completely, hide
					
					if ( opacity === 0 ) {
						
						$element.addClass( makeInvisible ? 'invisible' : 'hidden' ).css( 'opacity', '' ).trigger( 'hidden' );
						
						// reenable all buttons and links
						
						IgnorePointerDOM( $ignore, false );
						
					}
					else {
						
						$element.trigger( 'shown' );
						
						if ( opacity === 1 ) {
							
							$element.css( 'opacity', '' );
							
						}
						
					}
					
					// do callback
					
					if ( typeof callback === 'function' ) {
						
						callback();
						
					}
					
				};
			
			isInvisible = $element.is( '.invisible' );
			isHidden = $element.is( '.hiding, .hidden' ) || isInvisible;
			isCollapsed = $element.is( '.collapsed' );
			makeInvisible = isInvisible || parameters.invisible;
			
			// stop animations
			
			$element.stop( true ).removeClass( 'invisible hiding hidden collapsed' );
			
			// if should start at 0 opacity
			
			if ( isHidden === true || isCollapsed === true || parameters.initHidden === true ) {
				
				$element.fadeTo( 0, 0 ).css( 'height', '' );
				
			}
			
			// handle opacity
			
			if ( _s.mobile === true || _s.lowPerformance === true ) {
				
				if ( opacity === 0 ) {
					
					$element.trigger( 'hide' );
					
				}
				else {
					
					$element.trigger( 'show' );
					
				}
				
				$element.css( 'opacity', opacity );
				
				fadeComplete();
				
			}
			else {
				
				$ignore = $element.find( 'a, button, .btn' ).add( $element );
				
				if ( opacity === 0 ) {
					
					$element.addClass( 'hiding' ).trigger( 'hide' );
					
					// temporarily disable all buttons and links
					
					IgnorePointerDOM( $ignore, true );
					
				}
				else {
					
					IgnorePointerDOM( $ignore, false );
					
					$element.trigger( 'show' );
					
				}
				
				$element.animate( { opacity: opacity }, { duration: duration, easing: easing, complete: fadeComplete } );
				
			}
			
		} );
		
	}
	
	function CollapseDOM ( parameters ) {
		
		var $elements,
			duration,
			show,
			easing,
			callback;
		
		// handle parameters
		
		parameters = parameters || {};
		
		$elements = $( parameters.element );
		show = typeof parameters.show === 'boolean' ? parameters.show : false;
		duration = IsNumber( parameters.duration ) ? parameters.duration : _s.collapseDuration;
		easing = typeof parameters.easing === 'string' ? parameters.easing : _s.collapseEasing;
		callback = parameters.callback;
		
		// for each element
		
		$elements.each( function () {
			
			var $element = $( this ),
				$ignore,
				isCollapsed,
				isHidden,
				isInvisible,
				makeInvisible,
				heightCurrent,
				heightTarget = 0,
				collapseComplete = function () {
					
					// if shown or hidden
					
					if ( show === true ) {
						
						$element.css( 'height', '' ).trigger( 'shown' );
						
					}
					else {
						
						$element.addClass( makeInvisible ? 'invisible' : 'hidden' ).trigger( 'hidden' );
						
						// enable pointer
						
						IgnorePointerDOM( $ignore, false );
						
					}
					
					// do callback
					
					if ( typeof callback === 'function' ) {
						
						callback();
						
					}
					
				};
			
			// if should start from hidden
			
			isInvisible = $element.is( '.invisible' );
			isHidden = $element.is( '.hiding, .hidden' ) || isInvisible;
			isCollapsed = $element.is( '.collapsed' );
			makeInvisible = isInvisible || parameters.invisible;
			
			if ( isCollapsed !== true && ( isHidden === true || parameters.initHidden === true ) ) {
				
				$element.css( 'height', 0 ).css( 'opacity', '' );
				isCollapsed = true;
				
			}
			
			// if valid element and not already collapsing / collapsed to same state
			
			if ( isCollapsed === show ) {
				
				// stop any previous animation
				
				$element.stop( true ).removeClass( 'invisible hiding hidden collapsed' );
				
				if ( show === true ) {
						
						// find correct current height and target height
						
						$element.placeholdme().appendTo( 'body' );
						
						heightCurrent = $element.height();
						$element.css( 'height', '' );
						heightTarget = $element.height();
						$element.css( 'height', heightCurrent );
						
						$element.placeholdme( 'revert' );
						
						$element.trigger( 'show' );
						
				}
				else {
					
					$element.addClass( 'collapsed' ).trigger( 'hide' );
					
				}
				
				if ( _s.mobile === true || _s.lowPerformance === true ) {
					
					$element.css( 'height', heightTarget );
					
					collapseComplete();
					
				}
				else {
								
						$ignore = $element.find( 'a, button, .btn' ).add( $element );
						
						if ( show === true ) {
							
							// enable pointer
							
							IgnorePointerDOM( $ignore, false );
							
						}
						else {
							
							// temporarily ignore pointer
							
							IgnorePointerDOM( $ignore, true );
							
						}
						
						// animate
						
						$element.animate( { height: heightTarget }, { duration: duration, easing: easing, complete: collapseComplete } );
						
				}
				
			}
			
		} );
		
	}
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	_utils.Type = Type;
	_utils.IsNumber = IsNumber;
	_utils.IsArray = IsArray;
	_utils.IsImage = IsImage;
	_utils.IsImageExt = IsImageExt;
	_utils.IsEvent = IsEvent;
	
	_utils.ToArray = ToArray;
	_utils.ToNotArray = ToNotArray;
	_utils.ArrayCautiousAdd = ArrayCautiousAdd;
	_utils.ArrayCautiousRemove = ArrayCautiousRemove;
	_utils.ArrayRandomValue = ArrayRandomValue;
	_utils.IndexOfValue = IndexOfValue;
	_utils.LastIndexOfValue = LastIndexOfValue;
	_utils.IndicesOfValue = IndicesOfValue;
	_utils.IndexOfValues = IndexOfValues;
	_utils.IndexOfString = IndexOfString;
	_utils.IndexOfProperty = IndexOfProperty;
	_utils.IndexOfPropertyjQuery = IndexOfPropertyjQuery;
	_utils.IndicesOfPropertyjQuery = IndicesOfPropertyjQuery;
	_utils.ValuesWithPropertyjQuery = ValuesWithPropertyjQuery;
	_utils.IndicesOfProperty = IndicesOfProperty;
	_utils.IndexOfProperties = IndexOfProperties;
	
	_utils.Clamp = Clamp;
	_utils.AABBIntersectsAABB = AABBIntersectsAABB;
	
	_utils.ParseDataString = ParseDataString;
	_utils.FindDataOptionValue = FindDataOptionValue;
	
	_utils.DOMBounds = DOMBounds;
	_utils.IgnorePointerDOM = IgnorePointerDOM;
	_utils.FadeDOM = FadeDOM;
	_utils.CollapseDOM = CollapseDOM;
	
	return _utils;
	
} );