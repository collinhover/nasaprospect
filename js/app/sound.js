define( [ 
	"jquery",
	"app/shared",
	"soundManager2",
	"TweenMax"
],
function ( $, _s ) {
	
	var _snd = {};
	var ready = false;
	var infinite = 9999;
	var soundDurationBase = 1000;
	var duration = 0.1;
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	soundManager.setup( {
		url: 'swf/',
		flashVersion: 9,
		onready: function() {
			
			ready = true;
			
		},
		ontimeout: function() {
			// Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
		}
	} );
	
	function ReadyCatch ( callback ) {
		
		if ( ready === true ) {
			
			callback();
			
		}
		else {
			
			soundManager.onready( callback );
			
		}
		
	}
	
	/*===================================================
	
	fade
	
	=====================================================*/
	
	function FadeIn ( id, parameters ) {
		
		ReadyCatch( function () {
			
			var sound = soundManager.sounds[id];
			
			if ( typeof sound !== 'undefined' ) {
				
				parameters = parameters || {};
				parameters.volume = parameters.volume || 100;
				parameters.onUpdate = function () {
					sound.setVolume( from.volume );
				};
				
				if ( parameters.fromZero === true ) sound.setVolume( 0 );
				
				var from = { volume: sound.volume };
				var durationActual = ( sound.durationEstimate / soundDurationBase ) * ( parameters.duration || duration );
				
				TweenMax.to( from, durationActual, parameters );
				
			}
			
		} );
		
	}
	
	function FadeOut ( id, parameters ) {
		
		ReadyCatch( function () {
			
			var sound = soundManager.sounds[id];
			
			if ( typeof sound !== 'undefined' ) {
				
				parameters = parameters || {};
				parameters.volume = parameters.volume || 0;
				parameters.onUpdate = function () {
					sound.setVolume( from.volume );
				};
				
				if ( parameters.fromZero === true ) sound.setVolume( 0 );
				
				var from = { volume: sound.volume };
				var durationActual = ( sound.durationEstimate / soundDurationBase ) * ( parameters.duration || duration );
				
				TweenMax.to( from, durationActual, parameters );
				
			}
			
		} );
		
	}
	
	/*===================================================
	
	find
	
	=====================================================*/
	
	function FindSounds ( elements, includeDescendents ) {
		
		var data = [];
		var $elements = $( elements );
		
		if ( includeDescendents === true ) {
			
			$elements = $elements.find( "[data-sound]" ).andSelf();
			
		}
		
		$elements.each( function () {
			
			var i, il, datum;
			var exists = false;
			var datumNew = {};
			
			var $element = datumNew.$element = $( this );
			var file = datumNew.file = $element.attr( "data-sound" );
			
			if ( typeof file === 'string' && file.length > 0 ) {
				
				datumNew.id = $element.attr( "data-sound-id" ) || file;
				datumNew.fade = ParseAttribute( $element.attr( "data-sound-fade" ), duration, false );
				datumNew.loops = ParseAttribute( $element.attr( "data-sound-loops" ), infinite, 1 );
				datumNew.volume = $element.attr( "data-sound-volume" ) || 100;
				
				for ( i = 0, il = data.length; i < il; i++ ) {
					
					datum = data[ i ];
					
					if ( $element.is( datum.$element ) && file === datum.file && datumNew.id === datum.id ) {
						
						exists = true;
						break;
						
					}
					
				}
				
				if ( exists === false ) {
					
					data.push( datumNew );
					
				}
				
			}
				
		} );
		
		return {
			data: data,
			triggers: SoundsToScrollTriggers( data )
		};
		
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
	
	function DataToSounds ( data ) {
		
		var i, il, datum;
		var sounds = [];
		
		for ( i = 0, il = data.length; i < il; i++ ) {
			
			datum = data[ i ];
			
			sounds.push( DatumToSound( datum ) );
		
		}
		
		return sounds;
		
	}
	
	function DatumToSound ( datum ) {
		
		return soundManager.createSound( datum.id, [ 
			_s.pathToAssets + datum.file + '.mp3',
			_s.pathToAssets + datum.file + '.ogg',
			_s.pathToAssets + datum.file + '.wav'
		] );
		
	}
	
	function PlayFromData ( data ) {
		
		ReadyCatch( function () {
			
			var i, il, datum;
			
			for ( i = 0, il = data.length; i < il; i++ ) {
				
				datum = data[ i ];
				
				PlayFromDatum( datum );
			
			}
			
		} );
		
	}
	
	function PlayFromDatum ( datum ) {
		
		ReadyCatch( function () {
			
			datum.sound = DatumToSound( datum );
			
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
			
		} );
		
	}
	
	/*===================================================
	
	scroll triggers
	
	=====================================================*/
	
	function SoundsToScrollTriggers ( sounds ) {
		
		var i, il;
		var soundTriggers = [];
		
		for ( i = 0, il = sounds.length; i < il; i++ ) {
			
			soundTriggers.push( SoundToScrollTrigger( sounds[ i ] ) );
			
		}
		
		return soundTriggers;
		
	}
	
	function SoundToScrollTrigger ( datum ) {
		
		return {
			element: datum.$element,
			continuous: false,
			callback: function () {
				
				PlayFromDatum( datum );
				
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
	
	public
	
	=====================================================*/
	
	_snd.infinite = infinite;
	
	_snd.FadeIn = FadeIn;
	_snd.FadeOut = FadeOut;
	
	_snd.FindSounds = FindSounds;
	
	_snd.DataToSounds = DataToSounds;
	_snd.DatumToSound = DatumToSound;
	_snd.PlayFromData = PlayFromData;
	_snd.PlayFromDatum = PlayFromDatum;
	
	_snd.SoundsToScrollTriggers = SoundsToScrollTriggers;
	_snd.SoundToScrollTrigger = SoundToScrollTrigger;
	
	return _snd;
	
} );