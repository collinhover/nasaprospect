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
				
				// for all non active, ensure they are orbiting
				
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
	
	resize
	
	=====================================================*/
	
	function OnWindowResized () {
		
		var i, il, section;
		
		for ( i = 0, il = _sections.length; i < il; i++ ) {
			
			_sections[ i ].Resize();
			
		}
		
	}
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	// init all sections
	
	_de.$section.each( function () {
		
		var $element = $( this );
		var section = new _section.Instance( $element );
		
		section.onActivated.add( SetActiveSection );
		
		_sections.push( section );
		
	} );
	
	// add system sound as filler for when no other sounds are playing
	
	_snd.AddFiller( _sound );
	
	_s.signals.onResized.add( OnWindowResized );
	_de.$window.trigger( 'resize' );
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_solarSystem.ClearActiveSection = ClearActiveSection;
	_solarSystem.SetActiveSection = SetActiveSection;
	_solarSystem.GetActiveSection = GetActiveSection;
	
	return _solarSystem;
	
} );