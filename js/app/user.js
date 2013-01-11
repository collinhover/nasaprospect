define( [ 
	"jquery",
	"app/shared",
	"app/utilities",
	"app/navigator",
	"app/solarSystem",
	"app/section",
	"app/sound",
	"jquery.imagesloaded",
	"TweenMax"
],
function ( $, _s, _utils, _navi, _ss, _section, _snd ) {
	
	var _de = _s.domElements;
	var _user = { ready: false };
	var _findables = {};
	var _sectionActive;
	var _sectionTriggers = [];
	var _sectionOptions;
	var _sectionOptionsById = {};
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	var _$element = _de.$user;
	
	// init characters
	
	var _$characters = _de.$body.find( '.character' );
	var _charactersById = {};
	var _charactersLoaded = [];
	var _charactersActive = [];
	
	_$characters.each( function () {
		
		var $character = $( this );
		var id = $character.attr( 'id' );
		
		if ( typeof id === 'string' ) {
		
			$character.imagesLoaded( function () {
						
						// record original inline styles and init options
						
						$character
						.removeClass( 'hidden' )
						.data( 'options', {
							base: {
								widthCSS: $character.prop("style")[ 'width' ],
								heightCSS: $character.prop("style")[ 'height' ],
								opacityCSS: $character.prop("style")[ 'opacity' ],
								size: 1,
								offsetH: 0.5,
								offsetV: 0.5
							},
							adjust: {}
						} );
					
					var options = $character.data( 'options' );
					var width = parseFloat( options.base.widthCSS );
					var height = parseFloat( options.base.heightCSS );
					var opacity = parseFloat( options.base.opacityCSS );
					
					// width
					
					if ( _utils.IsNumber( width ) ) {
						
						options.base.width = options.width = width;
						options.adjust.width = true;
						
					}
					else {
						
						options.base.width = options.width = $character.width();
						
					}
					
					// height
					
					if ( _utils.IsNumber( height ) ) {
						
						options.base.height = options.height = height;
						options.adjust.height = true;
						
					}
					else {
						
						options.base.height = options.height = $character.height();
						
					}
					
					// position
					
					// horizontal
					
					options.base.leftCSS = $character.prop("style")[ 'left' ];
					options.base.rightCSS = $character.prop("style")[ 'right' ];
					options.base.left = options.left = parseFloat( options.base.leftCSS );
					options.base.right = options.right = parseFloat( options.base.rightCSS );
					
					if ( _utils.IsNumber( options.base.right  ) ) {
						
						options.adjust.right = true;
						options.base.offsetH = options.base.right / ( 100 - ( options.adjust.width === true ? options.base.width : 0 ) );
						if ( _utils.IsNumber( options.base.offsetH ) !== true ) options.base.offsetH = 0;
						
					}
					
					if ( _utils.IsNumber( options.base.left  ) ) {
						
						options.adjust.left = true;
						options.base.offsetH = options.base.left / ( 100 - ( options.adjust.width === true ? options.base.width : 0 ) );
						if ( _utils.IsNumber( options.base.offsetH ) !== true ) options.base.offsetH = 0;
						
					}
					
					// fallback to adjusting left
					
					if ( options.adjust.left !== true && options.adjust.right !== true ) {
						
						options.base.left = options.left = options.right = options.base.right = 50;
						options.adjust.left = true;
						
					}
					
					// vertical
					
					options.base.topCSS = $character.prop("style")[ 'top' ];
					options.base.bottomCSS = $character.prop("style")[ 'bottom' ];
					options.base.top = options.top = parseFloat( options.base.topCSS );
					options.base.bottom = options.bottom = parseFloat( options.base.bottomCSS );
					
					if ( _utils.IsNumber( options.base.bottom  ) ) {
						
						options.adjust.bottom = true;
						options.base.offsetV = options.base.bottom / ( 100 - ( options.adjust.height === true ? options.base.height : 0 ) );
						if ( _utils.IsNumber( options.base.offsetV ) !== true ) options.base.offsetV = 0;
						
					}
					
					if ( _utils.IsNumber( options.base.top  ) ) {
						
						options.adjust.top = true;
						options.base.offsetV = options.base.top / ( 100 - ( options.adjust.height === true ? options.base.height : 0 ) );
						if ( _utils.IsNumber( options.base.offsetV ) !== true ) options.base.offsetV = 0;
						
					}
					
					// fallback to adjusting top
					
					if ( options.adjust.top !== true && options.adjust.bottom !== true ) {
						
						options.base.top = options.top = options.bottom = options.base.bottom = 50;
						options.adjust.top = true;
						
					}
					
					// opacity
					
					if ( _utils.IsNumber( opacity ) ) {
						
						options.base.opacity = options.opacity = opacity;
						
					}
					else {
						
						options.base.opacity = options.opacity = 1;
						
					}
					
					
					// store
					
					_charactersById[ id ] = $character;
					_charactersLoaded.push( $character );
					
					// update once
					
					UpdateCharacter( $character );
					
					// hide after init complete
					
					Fade( $character, { opacity: 0 } );
					
					// set ready
					
					if ( _charactersLoaded.length >= _$characters.length ) {
						
						_user.ready = true;
						_s.signals.onUserReady.dispatch();
						
					}
			
			} );
			
		}
		
	} );
	
	_s.signals.onResized.add( Resize );
	_s.signals.onReady.addOnce( function () {
		
		_s.signals.onUpdated.add( Update );
		
	} );
	
	_ss.onSectionActivated.add( SetActiveSection );
	
	// init find
	
	_de.$findable.each( function () {
		
		var $element = $( this );
		var parts = _utils.ParseDataString( $element, 'data-findable' );
		
		for ( var i = 0, il = parts.length; i < il; i++ ) {
			
			var part = parts[ i ];
			var type = part[ 0 ];
			var optionsString = part[ 1 ];
			var options = typeof optionsString === 'string' ? $.trim( optionsString.toLowerCase() ).split( ',' ) : [];
			var groupIdString = _utils.FindDataOptionValue( options, 'group' );
			var groupIds = typeof groupIdString === 'string' ? $.trim( groupIdString ).split( ',' ) : [];
			var groupData;
			
			// handle defaults
			
			if ( typeof type !== 'string' || type.length === 0 ) type = 'finding';
			
			for ( var j = 0, jl = groupIds.length; j < jl; j++ ) {
				
				var groupId = groupIds[ j ];
				
				if ( typeof groupId !== 'string'|| groupId.length === 0 ) groupId = 'all';
				
				// init and find group data
				
				if ( typeof _findables[ groupId ] === 'undefined' ) {
					
					_findables[ groupId ] = {
						id: groupId,
						found: false,
						$trigger: $(),
						$found: $(),
						$finding: $(),
						$sounds: $()
					};
					
				}
				
				groupData = _findables[ groupId ];
				
				// store and init by type
				
				groupData[ '$' + type ] = groupData[ '$' + type ] instanceof $ ? groupData[ '$' + type ].add( $element ) : $element;
				
				if ( type === 'trigger' ) {
					
					$element.one( 'tap.findable', function () {
						
						Find( groupData );
						
					} );
					
				}
				else if ( type === 'sounds' ) {
					
					_snd.DisableSounds( { $element: $element } );
					
				}
				else if ( type === 'finding' ) {
					
					$element.addClass( 'hidden' );
					
				}
				
			}
				
		}
		
	} );
	
	/*===================================================
	
	findables
	
	=====================================================*/
	
	function Find ( groupData ) {
		
		if ( groupData.found !== true ) {
			
			groupData.found = true;
			
			_utils.FadeDOM( {
				element: $().add( groupData.$found ).add( groupData.$trigger ),
				duration: 0
			} );
			
			_utils.FadeDOM( {
				element: groupData.$finding,
				opacity: 1
			} );
			
			if ( groupData.$sounds.length > 0 ) {
				
				_snd.EnableSounds( { $element: groupData.$sounds } );
				
			}
			
		}
		
	}
	
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
				
				InitSection( _sectionActive );
				
			}
			
		}
		
	}
	
	function InitSection ( section ) {
		
		// modifiers
		
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
				
				modTriggers = [];
				var parts = _utils.ParseDataString( $element, 'data-character-modify' );
				
				for ( i = 0, il = parts.length; i < il; i++ ) {
					
					var modTrigger = GenerateModifierTrigger( $element, parts[ i ] );
					
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
	
	/*===================================================
	
	modifiers
	
	=====================================================*/
	
	function GenerateModifierTrigger ( $element, modOptions ) {
		
		var type = modOptions[ 0 ];
		var idsString = modOptions[ 1 ];
		var ids = idsString ? idsString.split( ',' ) : [];
		
		if ( typeof _user[ type ] === 'function' && ids.length > 0 ) {
			
			var direction = modOptions[ 2 ];
			var pctRangesString = modOptions[ 3 ];
			var pctRangesOptions = pctRangesString ? pctRangesString.split( ',' ) : [];
			var size = parseFloat( modOptions[ 4 ] );
			var offsetH = modOptions[ 5 ];
			var offsetV = modOptions[ 6 ];
			var properties = {};
			
			// parse properties
			
			// pct ranges
			
			properties.pctStart = parseFloat( pctRangesOptions[ 0 ] );
			if ( isNaN( properties.pctStart ) ) properties.pctStart = 0;
			else properties.pctStart = _utils.Clamp( properties.pctStart, 0, 1 );
			
			properties.pctEnd = parseFloat( pctRangesOptions[ 1 ] );
			if ( isNaN( properties.pctEnd ) ) properties.pctEnd = 1;
			else properties.pctEnd = _utils.Clamp( properties.pctEnd, properties.pctStart, 1 );
			
			// pct toggle
			
			properties.toggle = pctRangesOptions[ 2 ];
			
			if ( properties.toggle ) {
				
				var toggleOptionA = parseFloat( pctRangesOptions[ 3 ] );
				var toggleOptionB = parseFloat( pctRangesOptions[ 4 ] );
				
				// generate num splits
				
				if ( _utils.IsNumber( toggleOptionA ) && toggleOptionA >= 1 && ( _utils.IsNumber( toggleOptionB ) !== true || toggleOptionB >= 1 ) ) {
					
					properties.toggleRanges = [];
					
					var numSplits = toggleOptionA;
					var offsetSplit = _utils.IsNumber( toggleOptionB ) ? toggleOptionB : 0;
					var pctPerSplit = 1 / numSplits;
					var pctPerSplitSection = pctPerSplit / 3;
					var pctOffset = pctPerSplitSection * offsetSplit;
					var pctCurrent = properties.pctStart + pctOffset;
					
					for ( var i = 0; i < numSplits; i++ ) {
						
						properties.toggleRanges.push( {
							pctStart: _utils.Clamp( pctCurrent, 0, 1 ),
							pctEnd: _utils.Clamp( pctCurrent + pctPerSplit, 0, 1 ),
							pctStartToggle: _utils.Clamp( pctCurrent + pctPerSplitSection, 0, 1 ),
							pctEndToggle: _utils.Clamp( pctCurrent + pctPerSplitSection * 2, 0, 1 )
						} );
						
						pctCurrent += pctPerSplit;
						
					}
					
				}
				// two pcts follow toggle, split at
				else if ( _utils.IsNumber( toggleOptionA ) && _utils.IsNumber( toggleOptionB ) ) {
					
					var toggleRange = {};
					
					toggleRange.pctStart = properties.pctStart;
					toggleRange.pctEnd = properties.pctEnd;
					
					toggleRange.pctStartToggle = toggleOptionA;
					if ( isNaN( toggleRange.pctStartToggle ) ) toggleRange.pctStartToggle = toggleRange.pctStart;
					else toggleRange.pctStartToggle = _utils.Clamp( toggleRange.pctStartToggle, toggleRange.pctStart, toggleRange.pctEnd );
					
					toggleRange.pctEndToggle = toggleOptionB;
					if ( isNaN( toggleRange.pctEndToggle ) ) toggleRange.pctEndToggle = toggleRange.pctEnd;
					else toggleRange.pctEndToggle = _utils.Clamp( toggleRange.pctEndToggle, toggleRange.pctStart, toggleRange.pctEnd );
					
					properties.toggleRanges = [ toggleRange ];
					
				}
				// unusable input, clear toggle
				else {
					
					delete properties.toggle;
					
				}
				
			}
			
			// build trigger
			
			var modTrigger = {
				callbackCenterContinuous: function ( trigger ) {
					
					var scrollDirection = _navi.GetScrollDirection().y;
					var scrolling, antiscrolling;
					
					if ( scrollDirection < 0 ) {
						
						scrolling = 'up';
						antiscrolling = 'down';
						
					}
					else {
						
						scrolling = 'down';
						antiscrolling = 'up';
						
					}
					
					var directional = direction === 'concat';
					var directionMatchesScroll = directional || direction === 'all';
					
					for ( var i = 0, il = ids.length; i < il; i++ ) {
						
						var id = ids[ i ];
						
						// hide opposite if directional
						
						if ( directional === true ) {
							
							Fade( _charactersById[ id + antiscrolling ], { opacity: 0 } );
							id += scrolling;
							
						}
						
						var $character = _charactersById[ id ];
						
						if ( $character instanceof $ ) {
							
							var options = $character.data( 'options' );
							
							// update options
							
							options.size = size;
							options.offsetH = offsetH;
							options.offsetV = offsetV;
							
							// reset opposite modifier
							
							if ( type === 'Grow' && options.opacity !== options.base.opacity ) {
								
								Fade( $character );
								
							}
							else if ( type === 'Fade' && ( options.height !== options.base.height || options.width !== options.base.width ) ) {
								
								Grow( $character );
								
							}
							
							// modify
							
							_user[ type ]( $character, {
								element: $element,
								bounds: trigger.bounds,
								direction: directionMatchesScroll ? scrolling : direction,
								properties: properties
							} );
							
						}
						
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
		
		var direction = parameters.direction;
		var properties = parameters.properties;
		var scrollPositionCenterY = _navi.GetScrollCenterPosition().y;
		var bounds = parameters.bounds || _utils.DOMBounds( $element );
		var top = bounds.top;
		var bottom = bounds.bottom;
		var topToBottom = bottom - top;
		var pct;
		var pctRange = properties.pctEnd - properties.pctStart;
		
		// total pct of 0
		
		if ( pctRange <= 0 ) {
			
			if ( direction === 'up' ) {
				
				if ( scrollPositionCenterY > bottom ) {
					
					pct = 0;
					
				}
				else {
					
					pct = 1;
					
				}
				
			}
			else {
				
				if ( scrollPositionCenterY < top ) {
					
					pct = 0;
					
				}
				else {
					
					pct = 1;
					
				}
				
			}
			
		}
		else {
			
			var boundsDistanceV = topToBottom * pctRange;
			
			top += topToBottom * properties.pctStart;
			bottom = top + boundsDistanceV;
			
			var distanceV = scrollPositionCenterY - top;
			var pctFromTop = distanceV / boundsDistanceV;
			var toggle = properties.toggle;
			
			if ( toggle ) {
				
				var toggleRanges = properties.toggleRanges;
				var toggleRange;
				
				// find toggle range
				
				for ( var i = 0, il = toggleRanges.length; i < il; i++ ) {
					
					toggleRange = toggleRanges[ i ];
					
					if ( pctFromTop >= toggleRange.pctStart && pctFromTop < toggleRange.pctEnd ) break;
					
				}
				
				var topBase = bounds.top;
				var startToggle = topBase + topToBottom * toggleRange.pctStart;
				var endToggle = topBase + topToBottom * toggleRange.pctEnd;
				var topToggle = topBase + topToBottom * toggleRange.pctStartToggle;
				var bottomToggle = topBase + topToBottom * toggleRange.pctEndToggle;
				
				// toggle outside
				if ( toggle === 'out' ) {
					if ( scrollPositionCenterY <= topToggle ) {
						
						pct = _utils.Clamp( 1 - ( scrollPositionCenterY - startToggle ) / ( topToggle - startToggle ), 0, 1 );
						
					}
					else if ( scrollPositionCenterY >= bottomToggle ) {
						
						pct = _utils.Clamp( ( scrollPositionCenterY - bottomToggle ) / ( endToggle - bottomToggle ), 0, 1 );
						
					}
					else {
						
						pct = 0;
						
					}
					
				}
				// default to inside
				else {
					
					if ( scrollPositionCenterY <= topToggle ) {
						
						pct = _utils.Clamp( ( scrollPositionCenterY - startToggle ) / ( topToggle - startToggle ), 0, 1 );
						
					}
					else if ( scrollPositionCenterY >= bottomToggle ) {
						
						pct = _utils.Clamp( 1 - ( scrollPositionCenterY - bottomToggle ) / ( endToggle - bottomToggle ), 0, 1 );
						
					}
					else {
						
						pct = 1;
						
					}
					
				}
				
			}
			// pct by direction
			else {
				
				if ( direction === 'up' ) {
					
					pct = _utils.Clamp( 1 - pctFromTop, 0, 1 );
					
				}
				// default to down
				else {
					
					pct = _utils.Clamp( pctFromTop, 0, 1 );
					
				}
				
			}
			
		}
		//console.log( 'pct ', pct, 'toggle', toggle, 'top', top, bounds.top, 'bottom', bottom, bounds.bottom, 'scrollPositionCenterY', scrollPositionCenterY, ' distanceV', distanceV, 'pctFromTop', pctFromTop );
		return pct;
		
	}
	
	/*===================================================
	
	fade
	
	=====================================================*/
	
	function Fade ( $character, parameters ) {
		
		parameters = parameters || {};
		
		var options = $character.data( 'options' );
		var duration = _utils.IsNumber( parameters.duration ) ? parameters.duration : 0;
		
		// tween to
		if ( duration > 0 ) {
			
			if( _utils.IsNumber( parameters.opacity ) !== true ) parameters.opacity = options.base.opacity;
			parameters.easing = parameters.easing || Strong.easeIn;
			parameters.onUpdate = function () {
				
				UpdateCharacter( $character );
				
			};
			
			options.tweening = true;
			TweenMax.to( options, duration, parameters );
			
		}
		else {
			
			var $element = $( parameters.element );
			
			// based on scroll
			if ( $element.length > 0 ) {
				
				if ( options.tweening === true ) {
					
					options.tweening = false;
					TweenMax.killTweensOf( options );
					
				}
				
				var pct = GetModifierPct( $element, parameters );
				
				options.opacity = pct;
			
			}
			// direct
			else {
				
				options.opacity = _utils.IsNumber( parameters.opacity ) ? parameters.opacity : options.base.opacity;
				
			}
			
			UpdateCharacter( $character );
			
		}
		
	}
	
	/*===================================================
	
	resize
	
	=====================================================*/
	
	function Grow ( $character, parameters ) {
		
		parameters = parameters || {};
		
		var options = $character.data( 'options' );
		var duration = _utils.IsNumber( parameters.duration ) ? parameters.duration : 0;
		
		// tween to
		if ( duration > 0 ) {
		
			if ( options.adjust.width !== true ) delete parameters.width;
			else if ( _utils.IsNumber( parameters.width ) !== true ) parameters.width = options.base.width;
			
			if ( options.adjust.height !== true ) delete parameters.height;
			else if ( _utils.IsNumber( parameters.height ) !== true ) parameters.height = options.base.height;
			
			parameters.easing = parameters.easing || Strong.easeIn;
			parameters.onUpdate = function () {
				
				UpdateCharacter( $character );
				
			};
			
			options.tweening = true;
			TweenMax.to( options, duration, parameters );
			
		}
		else {
			
			var $element = $( parameters.element );
			
			// based on scroll
			if ( $element.length > 0 ) {
				
				if ( options.tweening === true ) {
					
					options.tweening = false;
					TweenMax.killTweensOf( options );
					
				}
				
				var pct = GetModifierPct( $element, parameters );
				
				if ( options.adjust.width === true ) options.width = options.base.width * pct;
				if ( options.adjust.height === true ) options.height = options.base.height * pct;
			
			}
			// direct
			else {
				
				if ( options.adjust.width === true ) options.width = _utils.IsNumber( parameters.width ) ? parameters.width : options.base.width;
				if ( options.adjust.height === true ) options.height = _utils.IsNumber( parameters.height ) ? parameters.height : options.base.height;
				
			}
			
			UpdateCharacter( $character );
			
		}
		
	}
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function UpdateCharacter ( $character ) {
		
		var options = $character.data( 'options' );
		var size = ( options.size || options.base.size );
		var width, height;
		var dimensionsChanged;
		
		if ( options.opacityLast !== options.opacity ) {
			
			options.opacityLast = options.opacity;
			
			$character.css( 'opacity', options.opacity );
			
		}
		
		if ( options.adjust.width === true ) {
			
			width = options.width * size;
			
			if ( options.widthLast !== width ) {
				
				dimensionsChanged = true;
				options.widthLast = width;
				
				$character.css( 'width', width + '%' );
				
			}
			
		}
		else {
			
			width = ( options.width / _s.w ) * 100 * ( options.height / options.base.height ) * size;	
			
		}
		
		if ( options.adjust.height === true ) {
			
			height = options.height * size;
			
			if ( options.heightLast !== height ) {
				
				dimensionsChanged = true;
				options.heightLast = height;
				
				$character.css( 'height', height + '%' );
				
			}
			
		}
		else {
			
			height = ( options.height / _s.h ) * 100 * ( options.width / options.base.width ) * size;	
			
		}
		
		if ( dimensionsChanged === true ) {
			
			var offsetH = ( options.offsetH || options.base.offsetH );
			var offsetV = ( options.offsetV || options.base.offsetV );
			var pctH = ( 100 * offsetH ) - ( width * 0.5 );
			var pctV = ( 100 * offsetV ) - ( height * 0.5 );
			
			if ( pctH < 0 ) pctH = 0;
			else if ( pctH + width > 100 ) pctH = 100 - width;
			
			if ( pctV < 0 ) pctV = 0;
			else if ( pctV + height > 100 ) pctV = 100 - height;
			//console.log( $character.attr('id'), 'pctH', pctH, 'pctV', pctV, 'offsetH', offsetH, 'offsetV', offsetV, 'width', width, 'height', height );
			if ( options.adjust.left === true ) {
				
				$character.css( 'left', pctH + '%' );
				
			}
			
			if ( options.adjust.right === true ) {
				
				$character.css( 'right', pctH + '%' );
				
			}
			
			if ( options.adjust.top === true ) {
				
				$character.css( 'top', pctV + '%' );
				
			}
			
			if ( options.adjust.bottom === true ) {
				
				$character.css( 'bottom', pctV + '%' );
				
			}
			
		}
		
	}
	
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
	_user.Fade = Fade;
	
	return _user;
	
} );