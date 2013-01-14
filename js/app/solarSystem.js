define( [ 
	"jquery",
	"app/shared",
	"app/sound",
	"app/section",
	"app/navigator",
	"signals",
	"jquery.imagesloaded"
],
function ( $, _s, _snd, _section, _navi, Signal ) {
	
	var _de = _s.domElements;
	var _$navi = _navi.$element;
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
	
	_sectionsById[ 'sun' ].$element.find( _de.$logo ).removeClass( 'hidden' );
	
	// state change signals
	
	_solarSystem.onSectionActivated = new Signal();
	
	// play system sound after all images loaded, else sound may block
	
	_$navi.imagesLoaded( function () {
		
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