define( [ 
	"jquery",
	"app/shared",
	"app/sound",
	"app/section"
],
function ( $, _s, _snd, _section ) {
	
	var _de = _s.domElements;
	var _solarSystem = {};
	var $element = _de.$solarSystem;
	var sections = [];
	var active;
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	_de.$section.each( function () {
		
		var $element = $( this );
		var section = new _section.Instance( $element );
		
		section.onOrbitingStarted.add( SetActiveSection );
		
		sections.push( section );
		
	} );
	
	_s.signals.onResized.add( OnWindowResized );
	_de.$window.trigger( 'resize' );
	
	/*===================================================
	
	active
	
	=====================================================*/
	
	function ClearActiveSection () {
		
		if ( active instanceof _section.Instance ) {
			
			active.Deactivate();
			active = undefined;
			
		}
		
	}
	
	function SetActiveSection ( target ) {
		
		var i, il, section;
		
		if ( active !== target ) {
			
			ClearActiveSection();
			
			if ( target instanceof _section.Instance ) {
				
				// active setup
				
				active = target;
				target.Activate();
				
				// for all non active, ensure they are orbiting
				
				for ( i = 0, il = sections.length; i < il; i++ ) {
					
					section = sections[ i ];
					
					if ( section !== active ) {
						
						section.Deactivate();
						
					}
					
				}
				
			}
			
		}
	}
	
	function GetActiveSection () {
		
		return active;
		
	}
	
	/*===================================================
	
	resize
	
	=====================================================*/
	
	function OnWindowResized () {
		
		var i, il, section;
		
		for ( i = 0, il = sections.length; i < il; i++ ) {
			
			sections[ i ].Resize();
			
		}
		
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