define( [ 
	"jquery",
	"app/shared",
	"app/utilities",
	"app/solarSystem",
	"app/section",
	"TweenMax"
],
function ( $, _s, _utils, _ss, _section ) {
	
	var _de = _s.domElements;
	var _user = {};
	var _scrolling = false;
	var _scrollY = -Number.MAX_VALUE;
	var _sectionActive;
	var _sectionTriggers;
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
			
			// shrink after init complete
			
			if ( hide === true ) {
				
				Shrink( id );
				
			}
			
		}
		
	} );
	
	var _offset = _$element.offset();
	
	_s.signals.onResized.add( Resize );
	_s.signals.onScrollRefreshed.add( ScrollRefresh );
	_s.signals.onReady.addOnce( function () {
		
		_s.signals.onUpdated.add( Update );
		_de.$main.on( 'scroll', ScrollWith );
		
	} );
	
	_ss.onSectionActivated.add( SetActiveSection );
	
	/*===================================================
	
	scrolling
	
	=====================================================*/
	
	function ScrollWith () {
		
		var scrollY = _s.navigator.getContentPositionY();
		
		if ( scrollY >= _offset.top ) {
			
			if ( _scrollY !== scrollY ) {
				
				_scrolling = true;
				_scrollY = scrollY;
				
				_$element.css( 'top', _scrollY - _offset.top );
				
			}
			
		}
		else {
			
			ScrollStop();
			
		}
		
	}
	
	function ScrollStop () {
		
		_scrolling = false;
		_scrollY = -Number.MAX_VALUE;
		_$element.css( 'top', '' );
		
	}
	
	function ScrollRefresh () {
		
		ScrollStop();
		_offset = _$element.offset();
		_offset.top += _s.navigator.getContentPositionY();
		
		ScrollWith();
		
	}
	
	/*===================================================
	
	section
	
	=====================================================*/
	
	function SetActiveSection ( section ) {
		
		if ( _sectionActive !== section ) {
			
			_sectionActive = section;
			
			// reset section data
			
			_s.navigator.removeTriggers( _sectionTriggers );
			_sectionTriggers = [];
			_sectionOptions = _sectionOptionsById[ _sectionActive.id ] = _sectionOptionsById[ _sectionActive.id ] || {};
			
			if ( _sectionActive instanceof _section.Instance ) {
				
				// if will be resizing characters while in section
				
				InitSectionResizers( _sectionActive );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	shrink / grow
	
	=====================================================*/
	
	function InitSectionResizers ( section ) {
		
		var types = [ 'shrink', 'grow' ];
		
		for ( var i = 0, il = types.length; i < il; i++ ) {
			
			InitSectionResizerType( section, types[ i ] );
			
		}
		
	}
	
	function InitSectionResizerType ( section, type ) {
		
		var typeSearch = type.toLowerCase();
		var typeDataName = 'data-' + typeSearch;
		var typeCallbackName = type.charAt( 0 ).toUpperCase() + type.slice( 1 );
		
		if ( _sectionOptions[ '$' + typeSearch ] instanceof $ !== true ) {
			
			_sectionOptions[ '$' + typeSearch ] = section.$element.find( '[' + typeDataName + ']' );
			
		}
		
		_sectionOptions[ '$' + typeSearch ].each( function () {
			
			var $element = $( this );
			var direction = $element.attr( typeDataName );
			var characters = $.trim( $element.attr( typeDataName + '-characters' ) ).split( /[ \t\r]+/g );
			var triggerParameters = {
				callbackCenterContinuous: function ( trigger ) {
					
					for ( var i = 0, il = characters.length; i < il; i++ ) {
						
						_user[ typeCallbackName ]( characters[ i ], { 
							element: $element,
							bounds: trigger.bounds,
							direction: direction
						} );
						
					}
					
				},
				element: $element
			};
			
			// make sure that we do resize one last time upon leaving trigger area
			
			triggerParameters.callbackCenterLeave = triggerParameters.callbackCenterContinuous;
			
			_sectionTriggers.push( _s.navigator.addTrigger( triggerParameters ) );
			
		} );
		
	}
	
	function Shrink ( id, parameters ) {
		console.log( 'SHRINK', id );
		parameters = parameters || {};
		var $element = $( parameters.element );
		
		// based on scroll
		
		if ( $element.length > 0 ) {
			
			var scrollPositionCenterY = _s.navigator.getScrollPositionCenterY();
			var bounds = parameters.bounds || _utils.DOMBounds( $element );
			var direction = parameters.direction;
			
			// get pct by direction
			
			if ( direction === 'up' ) {
				
				var boundsDeltaV = bounds.bottom - bounds.top;
				parameters.pct = _utils.Clamp( ( scrollPositionCenterY - bounds.top ) / boundsDeltaV, 0, 1 );
				
			}
			// default to down
			else {
				
				var boundsDeltaV = bounds.bottom - bounds.top;
				parameters.pct = _utils.Clamp( 1 - ( scrollPositionCenterY - bounds.top ) / boundsDeltaV, 0, 1 );
				
			}
			
		}
		// for tween
		else {
			
			if ( _utils.IsNumber( parameters.width ) !== true ) parameters.width = 0;
			if ( _utils.IsNumber( parameters.height ) !== true ) parameters.height = 0;
			
		}
		
		ResizeCharacter( id, parameters );
		
	}
	
	function Grow ( id, parameters ) {
		console.log( 'GROW', id );
		parameters = parameters || {};
		var $element = $( parameters.element );
		
		// based on scroll
		
		if ( $element.length > 0 ) {
			
			var scrollPositionCenterY = _s.navigator.getScrollPositionCenterY();
			var bounds = parameters.bounds || _utils.DOMBounds( $element );
			var direction = parameters.direction;
			
			// get pct by direction
			
			if ( direction === 'up' ) {
				
				var boundsDeltaV = bounds.bottom - bounds.top;
				parameters.pct = _utils.Clamp( 1 - ( scrollPositionCenterY - bounds.top ) / boundsDeltaV, 0, 1 );
				
			}
			// default to down
			else {
				
				var boundsDeltaV = bounds.bottom - bounds.top;
				parameters.pct = _utils.Clamp( ( scrollPositionCenterY - bounds.top ) / boundsDeltaV, 0, 1 );
				
			}
			
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
		console.log( ' > Resize', id );
		var $character = _charactersById[ id ];
		
		if ( $character instanceof $ ) {
			
			var options = $character.data( 'options' );
			
			parameters = parameters || {};
			var pct = parameters.pct;
			
			TweenMax.killTweensOf( options );
			
			// shrink based on position relative to element
			
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
	
	_user.Shrink = Shrink;
	_user.Grow = Grow;
	
	return _user;
	
} );