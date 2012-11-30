define( [ 
	"jquery",
	"app/shared",
	"app/utilities",
	"buzz",
	"TweenMax",
	"MobileRangeSlider",
	"jquery.throttle-debounce.custom"
],
function ( $, _s, _utils ) {
	
	var _de = _s.domElements;
	var _snd = {
		options: {
			descendents: false
		}
	};
	var _durationFade = 500;
	var _durationFadeMax = 1000;
	var _durationSoundBase = 1000;
	var _volume = 100;
	var _volumeLast = 0;
	
	Object.defineProperty( _snd, 'volume', { 
		get : function () { return _volume; },
		set: function ( volume ) {
			
			if ( _volume !== volume ) {
				
				_volumeLast = _volume;
				_volume = volume;
				
			}
			
			buzz.defaults.volume = _volume;
			buzz.all().fadeTo( _volume, _durationFade );
			
			_de.$toggleSound.each( function () {
				
				var $element = $( this );
				var $slider = $element.data( '$slider' );
				var sliderAPI;
				
				if ( $slider ) {
					
					sliderAPI = $slider.data( 'sliderAPI' );
					
					if ( sliderAPI instanceof MobileRangeSlider && sliderAPI.value !== _volume ) {
						
						sliderAPI.setValue( _volume );
						
					}
					
				}
				
			} );
			
		}
	});
	
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
		this.fade = ParseAttribute( parameters.fade, _durationFade, false );
		this.loop = ParseAttribute( parameters.loop, true, false );
		
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
				loop: $element.attr( "data-sound-loop" )
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
		
		if ( _utils.IsNumber( fallback ) ) {
			
			attribute = parseInt( attribute );
			
		}
		
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
	
	function PlaySound ( datum, parameters ) {
		
		var sound = SoundCheck( datum ),
			durationFade;
		
		if ( typeof sound !== 'undefined' ) {
			
			sound.play()
				.setVolume( 0 )
				.bind( 'playing', function () {
					
					if ( datum.fade !== false ) {
						
						durationFade = Math.max( _durationFade, Math.min( _durationFadeMax, Math.round( ( ( sound.getDuration() * 1000 ) / _durationSoundBase ) * ( ( parameters && parameters.duration ) || ( _utils.IsNumber( datum.fade ) && datum.fade ) || _durationFade ) ) ) );
						
						sound.fadeTo( _volume, durationFade );
						
					}
					else {
						
						sound.setVolume( _volume );
						
					}
					
					if ( datum.loop === true ) {
						
						sound.unloop().loop();
						
					}
					
				} );
			
		}
		
	}
	
	/*===================================================
	
	stop
	
	=====================================================*/
	
	function Stop ( parameters ) {
		
		this.ForData( parameters, StopSound, this );
		
	}
	
	function StopSound ( datum, parameters ) {
		
		var sound = datum.sound,
			durationFade;
		
		if ( sound && sound.isPaused() !== true ) {
			
			if ( datum.fade !== false ) {
				
				durationFade = Math.max( _durationFade, Math.min( _durationFadeMax, Math.round( ( ( sound.getDuration() * 1000 ) / _durationSoundBase ) * ( ( parameters && parameters.duration ) || ( _utils.IsNumber( datum.fade ) && datum.fade ) || _durationFade ) ) ) );
				
				sound.fadeOut( durationFade, function () {
					sound.stop();
				} );
				
			}
			else {
				
				sound.stop();
				
			}
			
		}
		
	}
	
	/*===================================================
	
	fade
	
	=====================================================*/
	
	/*function FadeIn ( parameters ) {
		
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
		
		var durationFade = ( sound.durationEstimate / _durationSoundBase ) * ( parameters.duration || datum.fade || _durationFade );
		
		TweenMax.to( from, durationFade, parameters );
		
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
		
		var durationFade = ( sound.durationEstimate / _durationSoundBase ) * ( parameters.duration || datum.fade || _durationFade );
		
		TweenMax.to( from, durationFade, parameters );
		
	}*/
	
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
			
			datum.sound = new buzz.sound( _s.pathToAssets + datum.file, {
				formats: [ "mp3", "ogg", "wav" ],
				preload: true
			} )
			.load();
			
		}
		
		return datum.sound;
		
	}
	
	/*===================================================
	
	volume
	
	=====================================================*/
	
	function Mute () {
		
		_snd.volume = 0;
		
		_de.$toggleSound.removeClass( 'on' );
		
	}
	
	function Unmute () {
		
		if ( _volume !== _volumeLast ) {
			
			_snd.volume = _volumeLast;
			
			_de.$toggleSound.addClass( 'on' );
			
		}
		
	}
	
	/*===================================================
	
	ui
	
	=====================================================*/
	
	// for each sound toggle
	
	_de.$toggleSound.each( function () {
		
		var $element = $( this );
		var $toggleOn = $element.find( '.toggle-on' );
		var $toggleOff = $element.find( '.toggle-off' );
		var $slider = $element.find( '.slider' );
		var sliderAPI;
		
		if ( $slider.length > 0 ) {
			
			sliderAPI = new MobileRangeSlider( $slider.get( 0 ), {
				min: 0,
				max: 100,
				value: _volume,
				change: $.throttle( _s.throttleTimeLong, function( volume ){
					
					if ( _volume !== volume ) {
						
						_snd.volume = volume;
						
					}
					
				} )
			} );
			
			$slider.data( 'sliderAPI', sliderAPI );
			$element.data( '$slider', $slider );
			
		}
		
		if ( $toggleOn.length === 0 && $toggleOff.length === 0 ) {
			
			$element.on( 'tap', function () {
				
				var $element = $( this );
				
				if ( $element.hasClass( 'on' ) ) {
					
					Mute();
					
				}
				else {
					
					Unmute();
					
				}
				
			} );
			
		}
		else {
			
			$toggleOn.on( 'tap', function () {
				
				Unmute();
				
			} );
			
			$toggleOff.on( 'tap', function () {
				
				Mute();
				
			} );
			
		}
		
		
	} );
	
	// start muted
	
	Mute();
	
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
	
	_snd.Mute = Mute;
	_snd.Unmute = Unmute;
	
	return _snd;
	
} );