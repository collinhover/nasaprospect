define( [ 
	"jquery"
],
function ( $ ) {
	
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
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( IndexOfValue( values, array[ i ] ) !== -1 ) {
				
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
	_utils.IndexOfProperty = IndexOfProperty;
	_utils.IndicesOfProperty = IndicesOfProperty;
	_utils.IndexOfProperties = IndexOfProperties;
	
	return _utils;
	
} );