define( [ 
	"jquery",
	"app/shared",
	"app/sound",
	"app/section"
],
function ( $, _s, _snd, _section ) {
	
	var _de = _s.domElements;
	var _solarSystem = {};
	var _$element = _de.$solarSystem;
	var _sound = new _snd.SoundHandler( { element: _$element } );
	var _sections = [];
	var _sectionsByName = {};
	var _active;
	
	/*===================================================
	
	active
	
	=====================================================*/
	
	function ClearActiveSection () {
		
		if ( _active instanceof _section.Instance ) {
			
			_active.Deactivate();
			_active = undefined;
			
		}
		
	}
	
	function SetActiveSection ( target ) {
		
		var i, il, section;
		
		if ( _active !== target ) {
			
			ClearActiveSection();
			
			if ( target instanceof _section.Instance ) {
				
				// active setup
				
				_active = target;
				
				// for all non active, deactivate
				
				for ( i = 0, il = _sections.length; i < il; i++ ) {
					
					section = _sections[ i ];
					
					if ( section !== _active ) {
						
						section.Deactivate();
						
					}
					
				}
				
			}
				
		}
			
	}
	
	function GetActiveSection () {
		
		return _active;
		
	}
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	// init all sections
	
	_de.$sections.each( function () {
		
		var $element = $( this );
		var section = new _section.Instance( $element );
		
		section.onActivated.add( SetActiveSection );
		
		_sections.push( section );
		
		if ( typeof section.name === 'string' ) {
			
			_sectionsByName[ section.name ] = section;
			
		}
		
	} );
	
	// section specific methods
	
	// ui
	
	_sectionsByName[ 'ui' ].whenInside.Resize = function () {
		
		// keep nav at correct width
		
		var $items = _de.$navPlanets.find( 'li' );
		var navHeight = _de.$navPlanets.height();
		var numItems = $items.length;
		var heightPerItem = navHeight / numItems;
		
		_de.$navbarPlanets.css( 'width', heightPerItem );
		
	};
	
	// sun
	
	_sectionsByName[ 'sun' ].$element.find( _de.$logo ).removeClass( 'hidden' );
	
	// add system sound as filler for when no other sounds are playing
	
	_snd.AddFiller( _sound );
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_solarSystem.ClearActiveSection = ClearActiveSection;
	_solarSystem.SetActiveSection = SetActiveSection;
	_solarSystem.GetActiveSection = GetActiveSection;
	
	return _solarSystem;
	
} );