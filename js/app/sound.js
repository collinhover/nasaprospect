define( [ 
	"jquery",
	"app/shared",
	"app/utilities",
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
	var _handlers = [];
	var _playing = [];
	var _fillers = [];
	var _fillersActive = true;
	var _infinite = true;
	var _durationFade = 500;
	var _durationFadeMax = 2500;
	var _durationSoundBase = 10000;
	var _durationSoundMinToFade = 1000;
	var _volume = 50;
	var _volumeLast = 0;
	
	Object.defineProperty( _snd, 'volume', { 
		get : function () { return _volume; },
		set: function ( volume ) {
			
			if ( _volume !== volume ) {
				
				_volumeLast = _volume;
				_volume = volume;
				
			}
			
			ForAll( undefined, UpdateVolume );
			
			_de.$toggleSound.each( function () {
				
				var $element = $( this );
				var $slider = $element.data( '$slider' );
				var sliderAPI;
				
				if ( $slider ) {
					
					sliderAPI = $slider.data( 'sliderAPI' );
					
					if ( sliderAPI instanceof MobileRangeSlider ) {
						
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
		
		_utils.ArrayCautiousAdd( _handlers, this );
		
	}
	
	function SoundDatum ( parameters ) {
		
		parameters = parameters || {};
		
		this.$element = $( parameters.element || parameters.$element );
		this.file = parameters.file;
		this.id = parameters.id || this.file;
		this.fade = ParseAttribute( parameters.fade, _durationFade, false );
		this.loops = ParseAttribute( parameters.loops, _infinite, 1 );
		this.loopCount = 0;
		this.volumeBase = parameters.volume || 100;
		this.volume = this.volumeBase;
		this.volumeLast = this.volume === 0 ? 100 : 0;
		
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
				
				PauseSound( datum );
				
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
		
		if ( this.data.length > 0 ) {
			
			this.ForData( parameters, PlaySound );
			
			Playing.call( this );
			
		}
		
	}
	
	function PlaySound () {
		
		var sound = SoundCheck( this );
		
		if ( sound ) {
			
			if ( sound.playState !== 1 ) {
				
				sound.play( {
					onplay: $.proxy( OnPlaySound, this ),
					onfinish: $.proxy( OnFinishSound, this ),
					onstop: $.proxy( OnStopSound, this )
				} );
				
			}
			else if ( sound.paused ) {
				
				OnPlaySound.call( this );
				
				sound.resume();
				
			}
			
		}
		
	}
	
	/*===================================================
	
	pause
	
	=====================================================*/
	
	function Pause ( parameters ) {
		
		if ( this.data.length > 0 ) {
			
			NotPlaying.call( this );
			
			this.ForData( parameters, PauseSound );
			
		}
		
	}
	
	function PauseSound () {
		
		var sound = this.sound;
		
		if ( sound && sound.playState === 1 ) {
			
			if ( this.fade !== false ) {
				
				FadeSound.call( this, {
					onComplete: function () {
						sound.pause();
					}
				} );
				
			}
			else {
				
				sound.pause();
				
			}
			
		}
		
	}
	
	/*===================================================
	
	stop
	
	=====================================================*/
	
	function Stop ( parameters ) {
		
		if ( this.data.length > 0 ) {
			
			NotPlaying.call( this );
			
			this.ForData( parameters, StopSound );
			
		}
		
	}
	
	function StopSound () {
		
		var sound = this.sound;
		
		if ( sound && sound.playState === 1 ) {
			
			if ( this.fade !== false ) {
				
				FadeSound.call( this, {
					onComplete: function () {
						
						sound.stop();
						
					}
				} );
				
			}
			else {
				
				sound.stop();
				
			}
			
		}
		
	}
	
	/*===================================================
	
	events
	
	=====================================================*/
	
	function OnPlaySound () {
		
		if ( this.loopCount === 0 ) {
			
			SetVolumeSound.call( this, { volume: 0 } );
			
		}
		
		if ( this.volume !== this.volumeBase ) {
			
			if ( this.fade !== false ) {
				
				FadeSound.call( this, { volume: this.volumeBase } );
				
			}
			else {
				
				SetVolumeSound.call( this, { volume: this.volumeBase } );
				
			}
			
		}
		
	}
	
	function OnFinishSound () {
		
		this.loopCount++;
		
		if ( this.fadingOut !== true ) {
			
			if ( this.loops === true ) {
				
				PlaySound.call( this );
				
			}
			else if ( _utils.IsNumber( this.loops ) ) {
				
				if ( this.loopCount < this.loops ) {
					
					PlaySound.call( this );
					
				}
				
			}
			
		}
	
	}
	
	function OnStopSound () {
		
		this.loopCount = 0;
		
	}
	
	/*===================================================
	
	volume
	
	=====================================================*/
	
	function SetVolume ( parameters ) {
		
		this.ForData( parameters, SetVolumeSound );
		
	}
	
	function SetVolumeSound ( parameters ) {
		
		var me = this;
		var sound = this.sound;
		
		if ( sound ) {
			
			if ( parameters ) {
				
				parameters = parameters || {};
				parameters.volume = _utils.Clamp( _utils.IsNumber( parameters.volume ) ? parameters.volume : this.volume, 0, 100 );
				parameters.duration = parameters.duration || 0;
				
				if ( this.volume !== parameters.volume ) {
					
					this.volumeLast = this.volume;
					this.fadingOut = parameters.volume === 0 ? true : false;
					
					parameters.onUpdate = $.proxy( UpdateVolumeSound, this );
					// wrap on complete
					var onComplete = parameters.onComplete;
					parameters.onComplete = function () {
						
						me.fadingOut = false;
						
						if ( typeof onComplete === 'function' ) {
							
							onComplete();
						
						}
						
					}
					
					TweenMax.to( this, parameters.duration, parameters );
					
				}
				
			}
			
		}
		
	}
	
	function UpdateVolume ( parameters ) {
		
		this.ForData( parameters, UpdateVolumeSound );
		
	}
	
	function UpdateVolumeSound () {
		
		var sound = this.sound;
		
		if ( sound ) {
			
			sound.setVolume( Math.round( this.volume * ( _volume / 100 ) ) );
			
		}
		
	}
	
	function Mute ( parameters ) {
		
		parameters = parameters || {};
		parameters.volume = parameters.volume || 0;
		
		this.ForData( parameters, SetVolumeSound );
		
	}
	
	function Unmute ( parameters ) {
		
		this.ForData( parameters, UnmuteSound );
		
	}
	
	function UnmuteSound ( parameters ) {
		
		var sound = this.sound;
		
		if ( sound ) {
			
			parameters = parameters || {};
			parameters.volume = parameters.volume || this.volumeLast;
			
			SetVolumeSound.call( this, parameters );
			
		}
		
	}
	
	function FadeIn ( parameters ) {
		
		parameters = parameters || {};
		parameters.toBase = true;
		
		this.ForData( parameters, FadeSound );
		
	}
	
	function FadeOut ( parameters ) {
		
		this.ForData( parameters, FadeSound );
		
	}
	
	function FadeSound ( parameters ) {
		
		var sound = this.sound;
		
		if ( sound ) {
			
			parameters = parameters || {};
			
			if ( parameters.toBase === true ) {
				
				parameters.volume = this.volumeBase;
				
			}
			else {
				
				parameters.volume = _utils.IsNumber( parameters.volume ) ? parameters.volume : 0;
				
			}
			
			parameters.duration = _utils.Clamp( Math.round( ( sound.durationEstimate / _durationSoundBase ) * ( ( parameters && parameters.duration ) || ( _utils.IsNumber( this.fade ) && this.fade ) || _durationFade ) ), _durationFade, _durationFadeMax ) / 1000;
			
			SetVolumeSound.call( this, parameters );
			
		}
		
	}
	
	/*===================================================
	
	utility
	
	=====================================================*/
	
	function ForData ( parameters, callback ) {
		
		if ( this.data.length > 0 ) {
			
			var i, il;
			var data = this.GetData( parameters );
			
			for ( i = 0, il = data.length; i < il; i++ ) {
				
				callback.call( data[ i ], parameters );
				
			}
			
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
			
			datum.sound = soundManager.createSound( {
				id: datum.id,
				url: [ 
					_s.pathToAssets + datum.file + '.mp3',
					_s.pathToAssets + datum.file + '.ogg',
					_s.pathToAssets + datum.file + '.wav'
				],
				autoLoad:true
			} );
			
		}
		
		return datum.sound;
		
	}
	
	/*===================================================
	
	global
	
	=====================================================*/
	
	function AddFiller ( handler ) {
		
		_utils.ArrayCautiousAdd( _fillers, handler );
		
		if ( _fillersActive === true ) {
			
			ActivateFillers();
			
		}
		
	}
	
	function RemoveFiller ( handler ) {
		
		handler.Stop();
		
		_utils.ArrayCautiousRemove( _fillers, handler );
		
	}
	
	function ActivateFillers () {
		
		_fillersActive = true;
		
		ForAll( { handlers: _fillers }, Play );
		
	}
	
	function DeactivateFillers () {
		
		_fillersActive = false;
		
		ForAll( { handlers: _fillers }, Pause );
		
	}
	
	function Playing () {
		
		if ( _fillersActive === true && _utils.IndexOfValue( _fillers, this ) === -1 ) {
			
			DeactivateFillers();
			
		}
		
		_utils.ArrayCautiousAdd( _playing, this );
		
	}
	
	function NotPlaying () {
		
		_utils.ArrayCautiousRemove( _playing, this );
		
		if ( _playing.length === 0 && _utils.IndexOfValue( _fillers, this ) === -1 ) {
			
			ActivateFillers();
			
		}
		
	}
	
	function MuteAll ( parameters ) {
		
		_de.$toggleSound.removeClass( 'on' );
		
		_snd.volume = 0;
		
	}
	
	function UnmuteAll ( parameters ) {
		
		_de.$toggleSound.addClass( 'on' );
		
		_snd.volume = parameters && _utils.IsNumber( parameters.volume ) ? parameters.volume : _volumeLast;
		
	}
	
	function ForAll ( parameters, callback ) {
		
		var i, il, handler;
		var handlers = parameters && parameters.handlers ? _utils.ToArray( parameters.handlers ) : _handlers;
		
		for ( i = 0, il = handlers.length; i < il; i++ ) {
			
			handler = handlers[ i ];
			
			callback.call( handler, parameters );
			
		}
		
	}
	
	/*===================================================
	
	init
	
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
					
					MuteAll();
					
				}
				else {
					
					UnmuteAll();
					
				}
				
			} );
			
		}
		else {
			
			$toggleOn.on( 'tap', function () {
				
				UnmuteAll();
				
			} );
			
			$toggleOff.on( 'tap', function () {
				
				MuteAll();
				
			} );
			
		}
		
		
	} );
	
	// start unmuted and at 0 volume
	
	UnmuteAll( { volume: 0 } );
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_snd.SoundHandler = SoundHandler;
	_snd.SoundHandler.prototype.constructor = _snd.SoundHandler;
	
	_snd.SoundHandler.prototype.Find = Find;
	_snd.SoundHandler.prototype.Add = Add;
	_snd.SoundHandler.prototype.Remove = Remove;
	
	_snd.SoundHandler.prototype.Play = Play;
	_snd.SoundHandler.prototype.Pause = Pause;
	_snd.SoundHandler.prototype.Stop = Stop;
	
	_snd.SoundHandler.prototype.ForData = ForData;
	_snd.SoundHandler.prototype.GetData = GetData;
	
	_snd.SoundHandler.prototype.SetVolume = SetVolume;
	_snd.SoundHandler.prototype.Mute = Mute;
	_snd.SoundHandler.prototype.Unmute = Unmute;
	_snd.SoundHandler.prototype.FadeIn = FadeIn;
	_snd.SoundHandler.prototype.FadeOut = FadeOut;
	
	_snd.AddFiller = AddFiller;
	_snd.RemoveFiller = RemoveFiller;
	_snd.MuteAll = MuteAll;
	_snd.UnmuteAll = UnmuteAll;
	
	return _snd;
	
} );