define( [ 
	"jquery",
	"app/shared",
	"app/sound",
	"app/section",
	"signals"
],
function ( $, _s, _snd, _section, Signal ) {
	
	var _de = _s.domElements;
	var _solarSystem = {};
	var _$element = _de.$solarSystem;
	var _sound = new _snd.SoundHandler( { element: _$element } );
	var _sections = [];
	var _sectionsById = {};
	var _sectionActive;
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	// init all sections
	
	_de.$sections.each( function () {
		
		var $element = $( this );
		var section = new _section.Instance( $element );
		
		section.onActivated.add( SetActiveSection );
		
		_sections.push( section );
		_sectionsById[ section.id ] = section;
		
	} );
	
	if( _sectionsById[ 'sun' ] ) _sectionsById[ 'sun' ].$element.find( _de.$logo ).removeClass( 'hidden' );
	
	// state change signals
	
	_solarSystem.onSectionActivated = new Signal();
	
	// play system sound after first time volume changed, else sound may block loading
	
	_snd.onVolumeChanged.addOnce( function () {
		
		_sound.Play();
		
	} );
	
	/*===================================================
	
	active
	
	=====================================================*/
	
	function SetActiveSection ( section ) {
		
		var i, il;
		
		if ( _sectionActive !== section ) {
			
			_sectionActive = section;
			
			// for all non active, deactivate
			
			for ( i = 0, il = _sections.length; i < il; i++ ) {
				
				section = _sections[ i ];
				
				if ( section !== _sectionActive ) {
					
					section.Deactivate();
					
				}
				
			}
			
			// active setup
			
			if ( _sectionActive instanceof _section.Instance ) {
				
				_solarSystem.onSectionActivated.dispatch( _sectionActive );
				
			}
			
		}
			
	}
	
	function GetActiveSection () {
		
		return _sectionActive;
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_solarSystem.SetActiveSection = SetActiveSection;
	_solarSystem.GetActiveSection = GetActiveSection;
	
	return _solarSystem;
	
} );