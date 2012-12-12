define( [ 
	"jquery",
	"app/shared",
	"app/utilities",
	"app/navigator",
	"app/solarSystem",
	"app/section",
	"TweenMax"
],
function ( $, _s, _utils, _navi, _ss, _section ) {
	
	var _de = _s.domElements;
	var _user = {};
	var _sectionActive;
	var _sectionTriggers = [];
	var _sectionOptions;
	var _sectionOptionsById = {};
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	var _$element = _de.$user;
	var _$ui = _$element.find( '#userUI' );
	var _$charactersContainer = _$element.find( '#userCharacters' );
	
	var _$characters = _$charactersContainer.find( '.character' );
	var _charactersById = {};
	
	_$characters.each( function () {
		
		var $element = $( this );
		var id = $element.attr( 'id' );
		
		if ( typeof id === 'string' ) {
		
			// record original inline styles and init options
			
			var hide = $element.hasClass( 'hidden' );
			
			$element
				.removeClass( 'hidden' )
				.data( 'options', {
					base: {
						widthCSS: $element.prop("style")[ 'width' ],
						heightCSS: $element.prop("style")[ 'height' ]
					},
					adjust: {}
				} );
			
			var options = $element.data( 'options' );
			options.base.width = options.width = parseFloat( options.base.widthCSS );
			options.base.height = options.height = parseFloat( options.base.heightCSS );
			
			if ( _utils.IsNumber( options.base.width ) ) {
				
				options.adjust.width = true;
				
				options.base.leftCSS = $element.prop("style")[ 'left' ];
				options.base.rightCSS = $element.prop("style")[ 'right' ];
				options.base.left = options.left = parseFloat( options.base.leftCSS );
				options.base.right = options.right = parseFloat( options.base.rightCSS );
				
				if ( _utils.IsNumber( options.base.left  ) ) {
					
					options.adjust.left = true;
					
				}
				
				if ( _utils.IsNumber( options.base.right  ) ) {
					
					options.adjust.right = true;
					
				}
				
			}
			if ( _utils.IsNumber( options.base.height  ) ) {
				
				options.adjust.height = true;
				
				options.base.topCSS = $element.prop("style")[ 'top' ];
				options.base.bottomCSS = $element.prop("style")[ 'bottom' ];
				options.base.top = options.top = parseFloat( options.base.topCSS );
				options.base.bottom = options.bottom = parseFloat( options.base.bottomCSS );
				
				if ( _utils.IsNumber( options.base.top  ) ) {
					
					options.adjust.top = true;
					
				}
				
				if ( _utils.IsNumber( options.base.bottom  ) ) {
					
					options.adjust.bottom = true;
					
				}
				
			}
			
			// store
			
			_charactersById[ id ] = $element;
			
			// hide after init complete
			
			if ( hide === true ) {
				
				Grow( id, { width: 0, height: 0 } );
				
			}
			
		}
		
	} );
	
	var _offset = _$element.offset();
	
	_s.signals.onResized.add( Resize );
	_s.signals.onReady.addOnce( function () {
		
		_s.signals.onUpdated.add( Update );
		
	} );
	
	_ss.onSectionActivated.add( SetActiveSection );
	
	/*===================================================
	
	section
	
	=====================================================*/
	
	function SetActiveSection ( section ) {
		
		if ( _sectionActive !== section ) {
			
			_sectionActive = section;
			
			// reset section data
			
			_navi.RemoveTriggers( _sectionTriggers );
			_sectionTriggers = [];
			_sectionOptions = _sectionOptionsById[ _sectionActive.id ] = _sectionOptionsById[ _sectionActive.id ] || {};
			
			if ( _sectionActive instanceof _section.Instance ) {
				
				// if will be resizing characters while in section
				
				InitSectionModifiers( _sectionActive );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	modifiers
	
	=====================================================*/
	
	function InitSectionModifiers ( section ) {
		
		if ( _sectionOptions.$modifiers instanceof $ !== true ) {
			
			_sectionOptions.$modifiers = section.$element.find( '[data-character-modify]' );
			_sectionOptions.modifiersTriggers = [];
			
		}
		
		_sectionOptions.$modifiers.each( function ( index ) {
			
			var $element = $( this );
			var modTriggers = _sectionOptions.modifiersTriggers[ index ];
			var i, il;
			
			// generate triggers on first init
			
			if ( _utils.IsArray( modTriggers ) !== true ) {
				
				var modsString = $.trim( $element.attr( 'data-character-modify' ) );
				var modsStrings = modsString.split( /[ \t\r]+/g );
				
				modTriggers = [];
				
				for ( i = 0, il = modsStrings.length; i < il; i++ ) {
					
					var modTrigger = GenerateModifierTrigger( $element, modsStrings[ i ] );
					
					if ( typeof modTrigger !== 'undefined' ) {
						
						modTriggers.push( modTrigger );
						
					}
					
				}
				
				// store
				
				_sectionOptions.modifiersTriggers[ index ] = modTriggers;
				
			}
			
			_sectionTriggers = _sectionTriggers.concat( _navi.AddTriggers( modTriggers ) );
			
		} );
		
	}
	
	function GenerateModifierTrigger ( $element, modString ) {
		
		var modParts = $.trim( modString ).split( /\/|\\/ );
		var type = modParts[ 0 ];
		var idsString = modParts[ 1 ];
		var ids = idsString ? idsString.split( ',' ) : [];
		var direction = modParts[ 2 ];
		var propertiesString = modParts[ 3 ];
		var properties = propertiesString ? propertiesString.split( ',' ) : [];
		
		if ( typeof _user[ type ] === 'function' && ids.length > 0 ) {
			
			var modTrigger = {
				callbackCenterContinuous: function ( trigger ) {
					
					for ( var i = 0, il = ids.length; i < il; i++ ) {
						
						_user[ type ]( ids[ i ], { 
							element: $element,
							bounds: trigger.bounds,
							direction: direction,
							properties: properties
						} );
						
					}
					
				},
				element: $element
			};
			
			// make sure that we modify one last time upon leaving area / removing trigger
			
			modTrigger.callbackCenterOutside = modTrigger.callbackCenterContinuous;
			
			return modTrigger;
		
		}
		
	}
	
	function GetModifierPct ( $element, parameters ) {
		
		var properties = parameters.properties;
		var scrollPositionCenterY = _navi.GetScrollCenterPosition().y;
		var bounds = parameters.bounds || _utils.DOMBounds( $element );
		var top = bounds.top;
		var bottom = bounds.bottom;
		var boundsDistanceV = bottom - top;
		var pctEnd, pctStart, pctTotal;
		var pct;
		
		if ( properties.length > 0 ) {
			
			pctStart = parseFloat( properties[ 0 ] );
			pctEnd = parseFloat( properties[ 1 ] );
			
			if ( isNaN( pctStart ) ) pctStart = 0;
			else pctStart = _utils.Clamp( pctStart, 0, 1 );
			
			if ( isNaN( pctEnd ) ) pctEnd = 1;
			else pctEnd = _utils.Clamp( pctEnd, pctStart, 1 );
			
			pctTotal = pctEnd - pctStart;
			
			top += boundsDistanceV *  pctStart;
			boundsDistanceV *= pctTotal;
			bottom = top + boundsDistanceV;
			
		}
		else {
			
			pctEnd = 1;
			pctStart = 0;
			
		}
		
		var distanceV = scrollPositionCenterY - top;
		
		// get pct by direction
		
		if ( parameters.direction === 'up' ) {
			
			// special case for total pct of 0
			
			if ( pctTotal <= 0 ) {
				
				if ( scrollPositionCenterY < bottom ) {
					
					pct = 0;
					
				}
				else {
					
					pct = 1;
					
				}
				
			}
			// default pct
			else {
				
				pct = _utils.Clamp( 1 - distanceV / boundsDistanceV, 0, 1 );
				
			}
			
		}
		// default to down
		else {
			
			// special case for total pct of 0
			
			if ( pctTotal <= 0 ) {
				
				if ( scrollPositionCenterY < top ) {
					
					pct = 0;
					
				}
				else {
					
					pct = 1;
					
				}
				
			}
			// default pct
			else {
				
				pct = _utils.Clamp( distanceV / boundsDistanceV, 0, 1 );
				
			}
			
		}
		console.log( 'pct ', pct, ' pctEnd', pctEnd, 'pctStart', pctStart, 'top', top, bounds.top, 'bottom', bottom, bounds.bottom, 'scrollPositionCenterY', scrollPositionCenterY, ' distanceV', distanceV );
		return pct;
		
	}
	
	/*===================================================
	
	resize
	
	=====================================================*/
	
	function Grow ( id, parameters ) {
		//console.log( 'Grow', id );
		parameters = parameters || {};
		var $element = $( parameters.element );
		
		// based on scroll
		
		if ( $element.length > 0 ) {
			
			parameters.pct = GetModifierPct( $element, parameters );
			
			ResizeCharacter( id, parameters );
			
		}
		// for tween
		else {
			
			var $character = _charactersById[ id ];
			
			if ( $character instanceof $ ) {
				
				var options = $character.data( 'options' );
				
				if ( _utils.IsNumber( parameters.width ) !== true ) parameters.width = options.base.width;
				if ( _utils.IsNumber( parameters.height ) !== true ) parameters.height = options.base.height;
				
				ResizeCharacter( id, parameters );
				
			}
			
		}
		
	}
	
	function ResizeCharacter ( id, parameters ) {
		//console.log( ' > ResizeCharacter', id );
		var $character = _charactersById[ id ];
		
		if ( $character instanceof $ ) {
			
			var options = $character.data( 'options' );
			
			parameters = parameters || {};
			var pct = parameters.pct;
			
			TweenMax.killTweensOf( options );
			
			// resize based on pct
			
			if ( _utils.IsNumber( pct ) ) {
				
				if ( options.adjust.width === true ) options.width = options.base.width * pct;
				if ( options.adjust.height === true ) options.height = options.base.height * pct;
				
				UpdateResizeCharacter( $character );
				
			}
			// tween to
			else {
				
				if ( options.adjust.width !== true ) delete parameters.width;
				if ( options.adjust.height !== true ) delete parameters.height;
				
				var duration = _utils.IsNumber( parameters.duration ) ? parameters.duration : 0;
				parameters.easing = parameters.easing || Strong.easeIn;
				parameters.onUpdate = function () {
					
					UpdateResizeCharacter( $character );
					
				};
				
				TweenMax.to( options, duration, parameters );
				
			}
			
		}
		
	}
	
	function UpdateResizeCharacter ( $character ) {
		
		var options = $character.data( 'options' );
		
		if ( options.adjust.width === true && options.widthLast !== options.width ) {
			
			options.widthLast = options.width;
			
			$character.css( 'width', options.width + '%' );
			
			if ( options.adjust.left === true ) {
				
				$character.css( 'left', ( 100 - options.width ) * 0.5 + '%' );
				
			}
			
			if ( options.adjust.right === true ) {
				
				$character.css( 'right', ( 100 - options.width ) * 0.5 + '%' );
				
			}
			
		}
		
		if ( options.adjust.height === true && options.heightLast !== options.height ) {
			
			options.heightLast = options.height;
			
			$character.css( 'height', options.height + '%' );
			
			if ( options.adjust.top === true ) {
				
				$character.css( 'top', ( 100 - options.height ) * 0.5 + '%' );
				
			}
			
			if ( options.adjust.bottom === true ) {
				
				$character.css( 'bottom', ( 100 - options.height ) * 0.5 + '%' );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function Update () {
		
	}
	
	/*===================================================
	
	resize
	
	=====================================================*/
	
	function Resize () {
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_user.Grow = Grow;
	
	return _user;
	
} );