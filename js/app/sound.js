define( [ 
	"jquery",
	"app/shared",
	"app/utilities",
	"soundmanager2",
	"TweenMax"
],
function ( $, _s, _utils, soundManager ) {
	
	var _snd = {
		infinite: 9999,
		soundDurationBase: 1000,
		duration: 0.1,
		options: {
			descendents: false
		}
	};
	
	/*===================================================
	
	instances
	
	=====================================================*/
	
	function SoundHandler ( parameters ) {
		
		this.data = [];
		this.dataIds = [];
		this.dataById = {};
		this.triggers = [];
		
		this.Find( parameters );
		
	}
	
	function SoundDatum ( parameters ) {
		
		parameters = parameters || {};
		
		this.$element = $( parameters.element || parameters.$element );
		this.file = parameters.file;
		this.id = parameters.id || this.file;
		this.fade = ParseAttribute( parameters.fade, _snd.duration, false );
		this.loops = ParseAttribute( parameters.loops, _snd.infinite, 1 );
		this.volume = parameters.volume || 100;
		
		this.trigger = GenerateScrollTrigger( this );
		
	}
	
	/*===================================================
	
	find
	
	=====================================================*/
	
	function Find ( parameters ) {
		
		var me = this;
		
		this.options = $.extend( true, {}, _snd.options, parameters.options );
		
		var $elements = this.$element = $( parameters.element || parameters.$element );
		
		if ( this.options.descendents === true ) {
			
			$elements = $elements.find( "[data-sound]" ).andSelf();
			
		}
		
		$elements.each( function () {
			
			var $element = $( this );
			
			me.Add( {
				$element: $element,
				file: $element.attr( "data-sound" ),
				id: $element.attr( "data-sound-id" ),
				fade: $element.attr( "data-sound-fade" ),
				loops: $element.attr( "data-sound-loops" ),
				volume: $element.attr( "data-sound-volume" )
			} );
				
		} );
		
		return this;
		
	}
	
	function ParseAttribute ( attribute, whenFound, fallback, lookingFor ) {
		
		var i, il;
		
		if ( typeof attribute === 'string' ) {
			
			attribute = $.trim( attribute.toLowerCase() );
			
		}
		
		if ( typeof lookingFor === 'undefined' ) {
			
			lookingFor = [ 'true', 'yes' ];
			
		}
		
		for ( i = 0, il = lookingFor.length; i < il; i++ ) {
			
			if ( attribute === lookingFor[ i ] ) {
				
				return whenFound;
				
			}
			
		}
		
		attribute = parseInt( attribute );
		
		if ( !attribute ) {
			
			attribute = fallback;
			
		}
		
		return attribute;
		
	}
	
	function GenerateScrollTrigger ( datum ) {
		
		return {
			element: datum.$element,
			callback: function () {
				
				PlaySound( datum );
				
			},
			onRemoved: function () {
				
				StopSound( datum );
				
			}
		};
		
	}
	
	/*===================================================
	
	add
	
	=====================================================*/
	
	function Add ( parameters ) {
		
		if ( typeof parameters !== 'undefined' ) {
			
			if ( _utils.IsArray( parameters ) ) {
				
				for( var i = 0, il = parameters.length; i < il; i++ ) {
					
					this.Add( parameters[ i ] );
					
				}
				
			}
			else {
				
				var file = parameters.file;
				
				if ( typeof file === 'string' && file.length > 0 ) {
					
					var datum = new SoundDatum( parameters );
					
					if ( _utils.IndexOfProperties( this.data, [ "$element", "file" ], datum ) !== -1 ) {
						
						this.Remove( datum );
						
					}
					
					this.data.push( datum );
					this.dataIds.push( datum.id );
					this.triggers.push( datum.trigger );
					
					if ( typeof this.dataById[ datum.id ] === 'undefined' ) {
						
						this.dataById[ datum.id ] = [];
						
					}
					
					this.dataById[ datum.id ].push( datum );
					
				}
				
			}
			
		}
		
		return this;
		
	}
	
	/*===================================================
	
	remove
	
	=====================================================*/
	
	function Remove ( datum ) {
		
		if ( typeof datum !== 'undefined' ) {
			
			if ( _utils.IsArray( datum ) ) {
				
				for( var i = 0, il = datum.length; i < il; i++ ) {
					
					this.Remove( datum[ i ] );
					
				}
				
			}
			else if ( typeof datum === 'string' ) {
				
				this.Remove( this.dataById[ datum ] );
				
			}
			else {
				
				var index = _utils.IndexOfValue( this.data, datum );
				
				if ( index !== -1 ) {
					
					this.data.splice( index, 1 );
					this.dataIds.splice( index, 1 );
					this.triggers.splice( index, 1 );
					
					var dataById = this.dataById[ datum.id ];
					
					index = _utils.IndexOfValue( dataById, datum );
					
					if ( index !== -1 ) {
						
						dataById.splice( index, 1 );
						
						if ( dataById.length === 0 ) {
							
							delete this.dataById[ datum.id ];
							
						}
						
					}
					
				}
				
			}
			
		}
		
		return this;
		
	}
	
	/*===================================================
	
	play
	
	=====================================================*/
	
	function Play ( parameters ) {
		
		this.ForData( parameters, PlaySound, this );
		
	}
	
	function PlaySound ( datum ) {
		
		SoundCheck( datum );
		
		if ( typeof datum.sound !== 'undefined' ) {
			
			datum.sound.play( {
				loops: datum.loops,
				onplay: function () {
					
					if ( datum.fade !== false ) {
						
						FadeInSound( datum );
						
					}
					
				}
			});
			
		}
		
	}
	
	/*===================================================
	
	stop
	
	=====================================================*/
	
	function Stop ( parameters ) {
		
		this.ForData( parameters, StopSound, this );
		
	}
	
	function StopSound ( datum ) {
		
		if ( datum.sound && datum.sound.playState === 1 ) {
			
			if ( datum.fade !== false ) {
				
				FadeOutSound( datum, {
					onComplete: function () {
						soundManager.stop( datum.id );
					}
				} );
				
			}
			else {
				
				soundManager.stop( datum.id );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	fade
	
	=====================================================*/
	
	function FadeIn ( parameters ) {
		
		this.ForData( parameters, FadeInSound, this );
		
	}
	
	function FadeInSound ( datum, parameters ) {
		
		SoundCheck( datum );
		
		var sound = datum.sound;
		var from = { volume: sound.volume };
		
		parameters = parameters || {};
		parameters.volume = parameters.volume || datum.volume || 100,
		parameters.onUpdate = function () {
			sound.setVolume( from.volume );
		};
		
		if ( parameters.fromZero !== false ) sound.setVolume( 0 );
		
		var durationActual = ( sound.durationEstimate / _snd.soundDurationBase ) * ( parameters.duration || datum.fade || _snd.duration );
		
		TweenMax.to( from, durationActual, parameters );
		
	}
	
	function FadeOut ( parameters ) {
		
		this.ForData( parameters, FadeOutSound, this );
		
	}
	
	function FadeOutSound ( datum, parameters ) {
		
		SoundCheck( datum );
		
		var sound = datum.sound;
		var from = { volume: sound.volume };
		
		parameters = parameters || {};
		parameters.volume = parameters.volume || 0,
		parameters.onUpdate = function () {
			sound.setVolume( from.volume );
		};
		
		var durationActual = ( sound.durationEstimate / _snd.soundDurationBase ) * ( parameters.duration || datum.fade || _snd.duration );
		
		TweenMax.to( from, durationActual, parameters );
		
	}
	
	/*===================================================
	
	utility
	
	=====================================================*/
	
	function ForData ( parameters, callback, context ) {
		
		var i, il;
		var data = this.GetData( parameters );
		
		for ( i = 0, il = data.length; i < il; i++ ) {
			
			callback.call( context, data[ i ], parameters );
			
		}
		
	}
	
	function GetData ( parameters ) {
		
		var data;
		
		if ( parameters instanceof SoundDatum ) {
			
			return _utils.ToArray( parameters );
			
		}
		else if ( typeof parameters === 'string' ) {
			
			data = this.dataById[ parameters ];
			
		}
		
		if ( typeof data === 'undefined'  && typeof parameters !== 'undefined' ) {
			
			data = parameters.data || parameters.datum;
			
			if ( typeof data === 'undefined' ) {
				
				var ids = parameters.id || parameters.ids;
				
				if ( typeof ids !== 'undefined' ) {
					
					var i, il, dataById;
					
					ids = _utils.ToArray( ids );
					data = [];
					
					for ( i = 0, il = ids.length; i < il; i++ ) {
						
						dataById = this.dataById[ ids[ i ] ];
						
						if ( typeof dataById !== 'undefined' ) {
							
							data = data.concat( dataById );
							
						}
						
					}
					
				}
				
			}
			
		}
			
		return data ? _utils.ToArray( data ) : this.data;
		
	}
	
	function SoundCheck ( datum ) {
		
		if ( typeof datum.sound === 'undefined' ) {
			
			datum.sound = soundManager.createSound( datum.id, [ 
				_s.pathToAssets + datum.file + '.mp3',
				_s.pathToAssets + datum.file + '.ogg',
				_s.pathToAssets + datum.file + '.wav'
			] );
			
		}
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_snd.SoundHandler = SoundHandler;
	_snd.SoundHandler.prototype.constructor = _snd.SoundHandler;
	
	_snd.SoundHandler.prototype.Find = Find;
	_snd.SoundHandler.prototype.Add = Add;
	_snd.SoundHandler.prototype.Remove = Remove;
	
	_snd.SoundHandler.prototype.Play = Play;
	_snd.SoundHandler.prototype.Stop = Stop;
	
	_snd.SoundHandler.prototype.ForData = ForData;
	_snd.SoundHandler.prototype.GetData = GetData;
	
	_snd.SoundHandler.prototype.FadeIn = FadeIn;
	_snd.SoundHandler.prototype.FadeOut = FadeOut;
	
	return _snd;
	
} );