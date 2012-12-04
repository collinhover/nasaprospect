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
	
	var _sctSun = _sectionsByName[ 'sun' ];
	
	_sctSun.whenInside.Resize = function () {
		
		// keep logo type filling space
		
		var lnHeight = _de.$logoName.height();
		
		_de.$logoName.find( '[class^="letter"]' ).each( function () {
			
			var $element = $( this );
			var elWidth = $element.width();
			var $h1 = $element.find( "h1" );
			var $h2 = $element.find( "h2" );
			
			$h2.css( 'font-size', '' );
			
			var h2Width = $h2.width();
			
			if ( h2Width > elWidth ) {
				
				$h2.css( 'font-size', elWidth / 4 );
				
			}
			
			$h1.css( 'font-size', Math.min( lnHeight - $h2.height(), elWidth ) * 1.3 );
			
		} );
		
	};
	
	_sctSun.$element.find( _de.$logo ).removeClass( 'hidden' );
	
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