define( [ 
	"jquery",
	"app/shared",
	"app/section"
],
function ( $, _s, _section ) {
	
	var _de = _s.domElements;
	var _solarSystem = {};
	var $element = _de.$solarSystem;
	var sections = [];
	var active;
	var triggers = {};
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	_de.$section.each( function () {
		
		var $element = $( this );
		var section = new _section.Instance( $element );
		
		section.onLandingStarted.add( SetActiveSection );
		
		sections.push( section );
		
	} );
	
	/*===================================================
	
	active
	
	=====================================================*/
	
	function ClearActiveSection () {
		
		if ( active instanceof _section.Instance ) {
			
			active.onOrbitingStarted.remove( ClearActiveSection );
			active = undefined;
			
		}
		
	}
	
	function SetActiveSection ( target ) {
		
		var i, il, section;
		
		ClearActiveSection();
		
		if ( target instanceof _section.Instance ) {
			
			// active setup
			
			active = target;
			active.onOrbitingStarted.add( ClearActiveSection );
			
			// for all non active, ensure they are orbiting
			
			for ( i = 0, il = sections.length; i < il; i++ ) {
				
				section = sections[ i ];
				
				if ( section !== active ) {
					
					section.StartOrbiting();
					
				}
				
			}
			
		}
		
	}
	
	function GetActiveSection () {
		
		return active;
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_solarSystem.$element = $element;
	_solarSystem.sections = sections;
	
	_solarSystem.ClearActiveSection = ClearActiveSection;
	_solarSystem.SetActiveSection = SetActiveSection;
	_solarSystem.GetActiveSection = GetActiveSection;
	
	return _solarSystem;
	
} );