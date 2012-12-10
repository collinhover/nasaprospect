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
			
			$element.data( 'options', {
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
			_sectionOptions = {};
			
			if ( _sectionActive instanceof _section.Instance ) {
				
				// if will be resizing characters while in section
				
				_sectionOptions.$resizers = _sectionActive.$element.find( '[data-resize]' );
				
				_sectionOptions.$resizers.each( function () {
					
					var $element = $( this );
					var type = $element.attr( 'data-resize' );
					var direction = $element.attr( 'data-resize-direction' );
					
					_sectionTriggers.push( _s.navigator.addTrigger( {
						callbackCenterContinuous: function ( trigger ) {
							
							if ( type === 'shrink' ) {
								
								ShrinkCharacter( 'astronaut', { 
									element: $element,
									bounds: trigger.bounds,
									direction: direction
								} );
								//GrowCharacter( 'robot' );
								
							}
							// default to grow type
							else {
								
								// TODO
								
							}
							
						},
						element: $element
					} ) );
					
				} );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	shrink / grow
	
	=====================================================*/
	
	function ShrinkCharacter ( id, parameters ) {
		console.log( 'SHRINK', id );
		var $character = _charactersById[ id ];
		
		if ( $character instanceof $ ) {
			
			var options = $character.data( 'options' );
			
			parameters = parameters || {};
			var $element = $( parameters.element );
			
			TweenMax.killTweensOf( options );
			
			// shrink based on position relative to element
			
			if ( $element.length > 0 ) {
				
				var scrollPositionCenterY = _s.navigator.getScrollPositionCenterY();
				var bounds = parameters.bounds || _utils.DOMBounds( $element );
				var direction = parameters.direction;
				var pct;
				
				// get pct by direction
				
				if ( direction === 'up' ) {
					
					var boundsDeltaV = bounds.bottom - bounds.top;
					pct = _utils.Clamp( ( scrollPositionCenterY - bounds.top ) / boundsDeltaV, 0, 1 );
					
				}
				// default to down
				else {
					
					var boundsDeltaV = bounds.bottom - bounds.top;
					pct = _utils.Clamp( 1 - ( scrollPositionCenterY - bounds.top ) / boundsDeltaV, 0, 1 );
					
				}
				
				if ( options.adjust.width === true ) {
					
					options.width = options.base.width * pct;
					
				}
				
				if ( options.adjust.height === true ) {
					
					options.height = options.base.height * pct;
					
				}
				console.log( ' > direction', direction || '(default to down)', ' scrollPositionCenterY', scrollPositionCenterY, ' pct ', pct );
				UpdateCharacter( id );
				
			}
			// tween to
			else {
				
				// width to
				
				if ( options.adjust.width !== true ) {
					delete parameters.width;
				}
				else if ( _utils.IsNumber( parameters.width ) !== true ) {
					parameters.width = 0;
				}
				
				// height to
				
				if ( options.adjust.height !== true ) {
					delete parameters.height;
				}
				else if ( _utils.IsNumber( parameters.height ) !== true ) {
					parameters.height = 0;
				}
				
				var duration = _utils.IsNumber( parameters.duration ) ? parameters.duration : 0;
				parameters.easing = parameters.easing || Strong.easeIn;
				parameters.onUpdate = function () {
					
					UpdateCharacter( id );
					
				};
				
				TweenMax.to( options, duration, parameters );
				
			}
			
		}
		
	}
	
	function GrowCharacter ( id, parameters ) {
		console.log( 'GROW', id );
		return;
		/*
		var $character = _charactersById[ id ];
		var options;
		var $element;
		var duration;
		
		if ( $character instanceof $ ) {
			
			options = $character.data( 'options' );
			
			parameters = parameters || {};
			
			// width to
			
			if ( options.adjust.width !== true ) {
				delete parameters.width;
			}
			else if ( _utils.IsNumber( parameters.width ) !== true ) {
				parameters.width = 0;
			}
			
			// height to
			
			if ( options.adjust.height !== true ) {
				delete parameters.height;
			}
			else if ( _utils.IsNumber( parameters.height ) !== true ) {
				parameters.height = 0;
			}
			
			$element = $( parameters.element );
			
		}
		*/
	}
	
	function UpdateCharacter ( id ) {
		
		var $character = _charactersById[ id ];
		
		if ( $character instanceof $ ) {
			
			var options = $character.data( 'options' );
			
			if ( options.adjust.width === true ) {
				
				$character.css( 'width', options.width + '%' );
				
				if ( options.adjust.left === true ) {
					
					$character.css( 'left', ( 100 - options.width ) * 0.5 + '%' );
					
				}
				
				if ( options.adjust.right === true ) {
					
					$character.css( 'right', ( 100 - options.width ) * 0.5 + '%' );
					
				}
				
			}
			
			if ( options.adjust.height === true ) {
				console.log( 'update shrink', options.height );
				$character.css( 'height', options.height + '%' );
				
				if ( options.adjust.top === true ) {
					
					$character.css( 'top', ( 100 - options.height ) * 0.5 + '%' );
					
				}
				
				if ( options.adjust.bottom === true ) {
					
					$character.css( 'bottom', ( 100 - options.height ) * 0.5 + '%' );
					
				}
				
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
	
	_user.ShrinkCharacter = ShrinkCharacter;
	_user.GrowCharacter = GrowCharacter;
	
	return _user;
	
} );