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
	
	instance
	
	=====================================================*/
	
	function SoundHandler ( parameters ) {
		
		this.data = [];
		this.dataIds = [];
		this.dataById = {};
		this.triggers = [];
		
		this.Find( parameters );
		
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
			
			var i, il;
			var datum = {};
			
			var $element = datum.$element = $( this );
			var file = datum.file = $element.attr( "data-sound" );
			
			if ( typeof file === 'string' && file.length > 0 ) {
				
				datum.id = $element.attr( "data-sound-id" ) || file;
				
				if ( typeof me.dataById[ datum.id ] === 'undefined' ) {
					
					datum.fade = ParseAttribute( $element.attr( "data-sound-fade" ), _snd.duration, false );
					datum.loops = ParseAttribute( $element.attr( "data-sound-loops" ), _snd.infinite, 1 );
					datum.volume = $element.attr( "data-sound-volume" ) || 100;
					
					datum.trigger = GenerateScrollTrigger( datum );
					
					me.data.push( datum );
					me.dataIds.push( datum.id );
					me.dataById[ datum.id ] = datum;
					me.triggers.push( datum.trigger );
					
				}
				
			}
				
		} );
		
		console.log( this, ' finished finding' );
		
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
			continuous: false,
			callback: function () {
				
				PlaySound( datum );
				
			},
			onRemoved: function () {
				
				if ( datum.fade !== false ) {
					
					_snd.FadeOut( datum.id, {
						duration: datum.fade,
						onComplete: function () {
							soundManager.stop( datum.id );
						}
					} );
					
				}
				else {
					
					soundManager.stop( datum.id );
					
				}
				
			}
		};
		
	}
	
	/*===================================================
	
	play
	
	=====================================================*/
	
	function Play ( parameters ) {
		
		parameters = parameters || {};
		
		if ( this.data.length === 0 ) {
			
			this.data = this.Find( parameters.element, parameters.descendents );
			
		}
		
		var ids = _utils.ToArray( parameters.id || parameters.ids || this.dataIds );
		var i, il, id;
		
		for ( i = 0, il = ids.length; i < il; i++ ) {
			
			id = ids[ i ];
			
			if ( this.dataById.hasOwnProperty( id ) === true ) {
				
				PlaySound( this.dataById[ id ] );
				
			}
			
		}
		
	}
	
	function PlaySound ( datum ) {
		
		if ( typeof datum.sound === 'undefined' ) {
			
			datum.sound = soundManager.createSound( datum.id, [ 
				_s.pathToAssets + datum.file + '.mp3',
				_s.pathToAssets + datum.file + '.ogg',
				_s.pathToAssets + datum.file + '.wav'
			] );
			
		}
		
		if ( typeof datum.sound !== 'undefined' ) {
			
			datum.sound.play( {
				loops: datum.loops,
				onplay: function () {
					
					if ( datum.fade !== false ) {
						
						_snd.FadeIn( datum.id, {
							duration: datum.fade,
							volume: datum.volume,
							fromZero: true
						} );
						
					}
					
				}
			});
			
		}
		
	}
	
	/*===================================================
	
	stop
	
	=====================================================*/
	
	function Stop ( parameters ) {
		
		
		
	}
	
	/*===================================================
	
	fade
	
	=====================================================*/
	
	function FadeIn ( id, parameters ) {
		
		var sound = soundManager.sounds[id];
		
		if ( typeof sound !== 'undefined' ) {
			
			parameters = parameters || {};
			parameters.volume = parameters.volume || 100;
			parameters.onUpdate = function () {
				sound.setVolume( from.volume );
			};
			
			if ( parameters.fromZero === true ) sound.setVolume( 0 );
			
			var from = { volume: sound.volume };
			var durationActual = ( sound.durationEstimate / _snd.soundDurationBase ) * ( parameters.duration || _snd.duration );
			
			TweenMax.to( from, durationActual, parameters );
			
		}
		
	}
	
	function FadeOut ( id, parameters ) {
		
		var sound = soundManager.sounds[id];
		
		if ( typeof sound !== 'undefined' ) {
			
			parameters = parameters || {};
			parameters.volume = parameters.volume || 0;
			parameters.onUpdate = function () {
				sound.setVolume( from.volume );
			};
			
			if ( parameters.fromZero === true ) sound.setVolume( 0 );
			
			var from = { volume: sound.volume };
			var durationActual = ( sound.durationEstimate / _snd.soundDurationBase ) * ( parameters.duration || _snd.duration );
			
			TweenMax.to( from, durationActual, parameters );
			
		}
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_snd.SoundHandler = SoundHandler;
	_snd.SoundHandler.prototype.constructor = _snd.SoundHandler;
	
	_snd.SoundHandler.prototype.Find = Find;
	_snd.SoundHandler.prototype.Play = Play;
	_snd.SoundHandler.prototype.Stop = Stop;
	
	_snd.FadeIn = FadeIn;
	_snd.FadeOut = FadeOut;
	
	return _snd;
	
} );