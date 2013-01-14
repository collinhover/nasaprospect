define( [ 
	"jquery",
	"app/shared",
	"app/utilities",
	"signals",
	"TweenMax",
	"MobileRangeSlider",
	"jquery.throttle-debounce.custom"
],
function ( $, _s, _utils, Signal ) {
	
	var _de = _s.domElements;
	var _snd = {
		options: {
			descendents: false
		}
	};
	var _handlers = [];
	var _sounds = [];
	var _playing;
	var _waiting = [];
	var _infinite = true;
	var _durationFade = 500;
	var _durationFadeMax = 2500;
	var _durationSoundBase = 10000;
	var _durationSoundMinToFade = 1000;
	var _volume = 0;
	var _volumeLast = 50;
	
	Object.defineProperty( _snd, 'volume', { 
		get : function () { return _volume; },
		set: function ( volume ) {
			
			if ( _volume !== volume ) {
				
				_volumeLast = _volume;
				_volume = volume;
				
				_snd.onVolumeChanged.dispatch( _volume );
				
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
	
	init
	
	=====================================================*/
	
	// state change signals
	
	_snd.onVolumeChanged = new Signal();
	
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
		this.position = 0;
		this.volumeBase = parseInt( parameters.volume );
		if ( _utils.IsNumber( this.volumeBase ) !== true || this.volumeBase < 0 ) this.volumeBase = 100;
		this.volume = this.volumeBase;
		this.volumeLast = this.volume === 0 ? 100 : 0;
		this.enabled = ParseAttribute( parameters.disabled, false, true );
		this.priority = parseInt( parameters.priority );
		if ( _utils.IsNumber( this.priority ) !== true ) this.priority = 0;
		this.timestamp = Date.now();
		
		this.trigger = GenerateScrollTrigger( this );
		
		_utils.ArrayCautiousAdd( _sounds, this );
		
	}
	
	/*===================================================
	
	find
	
	=====================================================*/
	
	function Find ( parameters ) {
		
		var me = this;
		var $elements = this.$element = $( parameters.element || parameters.$element );
		this.options = $.extend( {}, _snd.options, parameters.options );
		
		if ( this.options.descendents === true ) {
			
			$elements = this.$element = $elements.find( "[data-sounds]" ).andSelf();
			
		}
		
		var $exclude = this.options.$exclude;
		
		if ( $exclude instanceof $ ) {
			
			$elements = this.$element = $elements.filter( function () {
				
				return !$exclude.is( this ) || !$exclude.has( this );
				
			} );
			
		}
		
		$elements.each( function () {
			
			var $element = $( this );
			var parts = _utils.ParseDataString( $element, 'data-sounds' );
			
			for ( var i = 0, il = parts.length; i < il; i++ ) {
				
				var part = parts[ i ];
				var file = part[ 0 ];
				
				if ( typeof file === 'string' && file.length > 0 ) {
					
					var optionsString = part[ 1 ];
					var options = typeof optionsString === 'string' ? $.trim( optionsString.toLowerCase() ).split( ',' ) : [];
					
					me.Add( {
						$element: $element,
						file: file,
						id: _utils.FindDataOptionValue( options, 'id' ) || file,
						fade: _utils.FindDataOptionValue( options, 'fade' ),
						loops: _utils.FindDataOptionValue( options, 'loops' ),
						volume: _utils.FindDataOptionValue( options, 'volume' ),
						disabled: _utils.FindDataOptionValue( options, 'disabled' ),
						priority: _utils.FindDataOptionValue( options, 'priority' )
					} );
					
				}
				
			}
			
		} );
		
		return this;
		
	}
	
	function ParseAttribute ( attribute, whenFound, fallback, lookingFor ) {
		
		var i, il;
		
		if ( typeof attribute === 'string' ) {
			
			attribute = $.trim( attribute.toLowerCase() );
			
		}
		
		if ( typeof lookingFor === 'undefined' ) {
			
			lookingFor = [ true, 'true', 'yes' ];
			
		}
		
		if ( _utils.IndexOfValue( lookingFor, attribute ) !== -1 ) return whenFound;
		
		attribute = parseInt( attribute );
		
		if ( !attribute ) {
			
			attribute = fallback;
			
		}
		
		return attribute;
		
	}
	
	function GenerateScrollTrigger ( datum ) {
		
		var trigger = {
			element: datum.$element,
			callback: function () {
				
				WaitCheckSound.call( datum );
				
			},
			callbackRemove: function () {
				
				PauseSound.call( datum );
				
			}
		};
		trigger.callbackOutside = trigger.callbackRemove;
		
		return trigger;
		
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
	
	enable
	
	=====================================================*/
	
	function Enable ( parameters ) {
		
		if ( this.data.length > 0 ) {
			
			this.ForData( parameters, EnableSound );
			
		}
		
	}
	
	function EnableSound () {
		
		this.enabled = true;
		
		if ( this.playOnEnable === true ) {
			
			WaitCheckSound.call( this );
			
		}
		
	}
	
	function Disable ( parameters ) {
		
		if ( this.data.length > 0 ) {
			
			this.ForData( parameters, DisableSound );
			
		}
		
	}
	
	function DisableSound () {
		
		this.enabled = false;
		
		var playOnEnable = false;
		
		if ( this.sound && this.sound.playState === 1 ) {
			
			playOnEnable = true;
			PauseSound.call( this );
			
		}
		
		this.playOnEnable = playOnEnable;
		
	}
	
	/*===================================================
	
	play
	
	=====================================================*/
	
	function Play ( parameters ) {
		
		if ( this.data.length > 0 ) {
			
			this.ForData( parameters, WaitCheckSound );
			
		}
		
	}
	
	function PlaySound () {
		
		if ( this.enabled === true ) {
				
				CleanSound.call( this );
				
				var sound = SoundCheck( this );
				
				if ( sound ) {
						
						var paused = sound.paused;
						var position = this.position;
						var parameters = {
							onfinish: $.proxy( OnFinishSound, this )
						};
						
						if ( this.positionResumed === false ) {
								
								parameters.whileloading = $.proxy( function () {
										
										if ( this.positionResumed === false ) {
												
												if ( sound.duration >= position ) this.positionResumed = true;
												
												sound.setPosition( Math.min( position, sound.duration ) );
												
										}
										
								}, this );
								
						}
						
						sound.play( parameters );
						
						if ( paused ) {
							
							sound.resume();
							
						}
						
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
				
		}
		else {
			
			this.playOnEnable = true;
			
		}
		
	}
	
	function ActivatePlayButton () {
		
		_de.$playSound
				.off( '.sound' )
				.one( 'tap.sound', $.proxy( function () {
						
						DeactivatePlayButton.call( this );
						PlaySound.call( this );
						
				}, this ) );
		
		_utils.FadeDOM( {
			element: _de.$playSound,
			opacity: 1
		} );
		
	}
	
	function DeactivatePlayButton () {
		
		_de.$playSound.off( '.sound' );
		
		_utils.FadeDOM( {
			element: _de.$playSound
		} );
		
	}
	
	/*===================================================
	
	pause
	
	=====================================================*/
	
	function Pause ( parameters ) {
		
		if ( this.data.length > 0 ) {
			
			this.ForData( parameters, PauseSound );
			
		}
		
	}
	
	function PauseSound () {
		
		if ( this.priority > -1 ) {
			
			UnwaitSound.call( this );
			
		}
		
		PauseInternalSound.call( this );
		
	}
	
	function PauseInternalSound () {
		
		CleanSound.call( this );
		
		var sound = this.sound;
		
		if ( sound ) {
			
			if ( sound.playState === 1 && this.fade !== false ) {
				
				FadeSound.call( this, {
					onComplete: $.proxy( function () {
						
						sound.pause();
						
						ClearSound.call( this );
						
					}, this )
				} );
				
			}
			else {
				
				sound.pause();
				
				ClearSound.call( this );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	stop
	
	=====================================================*/
	
	function Stop ( parameters ) {
		
		if ( this.data.length > 0 ) {
			
			this.ForData( parameters, StopSound );
			
		}
		
	}
	
	function StopSound () {
		
		if ( this.priority > -1 ) {
			
			UnwaitSound.call( this );
			
		}
		
		StopInternalSound.call( this );
		
	}
	
	function StopInternalSound () {
		
		CleanSound.call( this );
		
		this.loopCount = 0;
		
		var sound = this.sound;
		
		if ( sound ) {
			
			if ( sound.playState === 1 && this.fade !== false ) {
				
				FadeSound.call( this, {
					onComplete: $.proxy( function () {
						
						sound.stop();
						
						ClearSound.call( this );
						
					}, this )
				} );
				
			}
			else {
				
				sound.stop();
				
				ClearSound.call( this );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	wait
	
	=====================================================*/
	
	function WaitCheckSound () {
		
		if ( this.priority > -1 ) {
				
				if ( _playing !== this ) {
						
						this.timestamp = Date.now();
						
						WaitSound.call( this );
						
						WaitCycle();
						
				}
				
		}
		else {
				
			PlaySound.call( this );	
				
		}
		
	}
	
	function WaitSound () {
		
		var l = _waiting.length;
		
		_utils.ArrayCautiousAdd( _waiting, this );
		
		if ( l !== _waiting.length ) _waiting.sort( SoundPriorityCompare );
		
		PauseInternalSound.call( this );
		
	}
	
	function UnwaitSound () {
		
		if ( this === _playing ) {
				
				_playing = undefined;
				
				if ( _s.mobile ) {
						
						DeactivatePlayButton.call( this );
						
				}
			
		}
		else {
			
			_utils.ArrayCautiousRemove( _waiting, this );
			
		}
		
		WaitCycle();
		
	}
	
	function WaitCycle () {
		
		if ( _waiting.length > 0 && ( typeof _playing === 'undefined' || SoundPriorityCompare( _waiting[ 0 ], _playing ) < 0 ) ) {
				
				if ( _waiting[ 0 ].enabled !== true ) {
						
						_waiting[ 0 ].playOnEnable = true;
						
				}
				else {
						
						if ( _playing ) WaitSound.call( _playing );
						
						_playing = _waiting.shift();
						
						if ( _s.mobile === true ) {
								
								ActivatePlayButton.call( _playing );
								
						}
						else {
							
							PlaySound.call( _playing );
								
						}
						
				}
				
		}
		
	}
	
	/*===================================================
	
	events
	
	=====================================================*/
	
	function OnFinishSound () {
		
		this.loopCount++;
		this.position = 0;
		if ( this.sound ) this.sound.setPosition( this.position );
		
		if ( this.fadingOut !== true ) {
			
			if ( this.loops === true || ( _utils.IsNumber( this.loops ) && this.loopCount < this.loops ) ) {
				
				PlaySound.call( this );
				
			}
			else {
				
				StopSound.call( this );
				
			}
			
		}
	
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function CleanSound () {
		
		this.playOnEnable = false;
		
		ClearFadeSound.call( this );
		
	}
	
	function ClearSound () {
		
		CleanSound.call( this );
		
		// if sound still buffering/loading, destroy so we don't load unnecessarily
		
		if ( this.sound && ( !this.sound.loaded && this.sound.readyState !== 3 ) ) {
				
				this.positionResumed = false;
				this.position = this.sound.position;
				
				this.sound.unload();
				this.sound.destruct();
				
				this.sound = undefined;
				
		}
		
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
		
		ClearFadeSound.call( this );
		
		if ( sound && parameters ) {
				
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
					
					this.tween = TweenMax.to( this, parameters.duration, parameters );
					
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
	
	
	function ClearFadeSound () {
		
		if ( typeof this.tween !== 'undefined' && this.tween.progress() !== 1 ) {
				
				this.tween.progress( 1 );
				this.tween = undefined;
				
		}
		
	}
	
	/*===================================================
	
	utility
	
	=====================================================*/
	
	function ForData ( parameters, callback ) {
		
		if ( this.data.length > 0 ) {
			
			ForSounds( this.GetData( parameters ), parameters, callback )
			
		}
		
	}
	
	function ForSounds ( data, parameters, callback ) {
		
		data = _utils.ToArray( data );
		
		for ( var i = 0, il = data.length; i < il; i++ ) {
			
			callback.call( data[ i ], parameters );
			
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
		
		if ( typeof data === 'undefined' && typeof parameters !== 'undefined' ) {
			
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
	
	function SoundPriorityCompare ( a, b ) {
		
		return a.priority === b.priority ? b.timestamp - a.timestamp : b.priority - a.priority;
		
	}
	
	/*===================================================
	
	global
	
	=====================================================*/
	
	function MuteAll ( parameters ) {
		
		_de.$toggleSound.removeClass( 'on' );
		
		_snd.volume = 0;
		
	}
	
	function UnmuteAll ( parameters ) {
		
		_de.$toggleSound.addClass( 'on' );
		
		_snd.volume = parameters && _utils.IsNumber( parameters.volume ) ? parameters.volume : _volumeLast;
		
	}
	
	function EnableSounds ( parameters ) {
		
		ForHandlers( GetHandlers( parameters ), parameters, Enable );
		
	}
	
	function DisableSounds ( parameters ) {
		
		ForHandlers( GetHandlers( parameters ), parameters, Disable );
		
	}
	
	function GetSounds ( parameters ) {
		
		var sounds = [];
		
		ForHandlers( GetHandlers( parameters ), parameters, function () {
			
			var data = this.GetData( parameters );
			
			sounds = sounds.concat( data );
			
		} );
		
		return sounds;
		
	}
	
	function GetHandlers ( parameters ) {
		
		parameters = parameters || {};
		
		var handlers;
		
		if ( parameters.handlers ) {
			
			handlers = _utils.ToArray( parameters.handlers );
			
		}
		else if ( parameters.$element instanceof $ ) {
			
			var indices = _utils.IndicesOfPropertyjQuery( _handlers, '$element', parameters.$element );
			
			if ( indices.length > 0 ) {
				
				handlers = [];
				
				for ( i = 0, il = indices.length; i < il; i++ ) {
					
					handlers.push( _handlers[ indices[ i ] ] );
					
				}
				
			}
			
		}
		
		return handlers;
		
	}
	
	function ForAll ( parameters, callback ) {
		
		ForHandlers( GetHandlers( parameters ) || _handlers, parameters, callback );
		
	}
	
	function ForHandlers ( handlers, parameters, callback ) {
		
		parameters = parameters || {};
		
		var data = parameters.data || parameters.datum || parameters.sounds || parameters.sound;
		
		if ( data ) {
			
			ForSounds( data, parameters, callback );
			
		}
		else {
			
			handlers = _utils.ToArray( handlers );
			
			var i, il, handler;
			
			for ( i = 0, il = handlers.length; i < il; i++ ) {
				
				handler = handlers[ i ];
				
				callback.call( handler, parameters );
				
			}
			
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
	
	_snd.SoundHandler.prototype.Enable = Enable;
	_snd.SoundHandler.prototype.Disable = Disable;
	
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
	
	_snd.MuteAll = MuteAll;
	_snd.UnmuteAll = UnmuteAll;
	_snd.EnableSounds = EnableSounds;
	_snd.DisableSounds = DisableSounds;
	_snd.GetSounds = GetSounds;
	
	return _snd;
	
} );