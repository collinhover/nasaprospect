define( [ 
	"jquery",
	"signals",
	"jquery.easing"
],
function ( $, Signal ) {
	
	var _s = {};
	
	/*===================================================
	
	paths
	
	=====================================================*/
	
	_s.pathToAssets = "asset/";
	
	/*===================================================
	
	signals
	
	=====================================================*/
	
	_s.signals = {
		onReady: new Signal(),
		onScrolled: new Signal(),
		onUpdated: new Signal(),
		onResized: new Signal(),
		onContentRefreshed: new Signal()
	};
	
	/*===================================================
	
	dom elements
	
	=====================================================*/
	
	var _de = _s.domElements = {};
	
	_de.$window = $( window );
	_de.$document = $( document );
	_de.$body = _de.$document.find( "body" );
	_de.$main = $( "#main" );
	_de.$preloader = $( "#preloader" );
	_de.$noflash = $( "#noflash" );
	_de.$user = $( "#user" );
	
	_de.$scrollable = $( ".scrollable" );
	_de.$stickable = $( ".stickyme, .is-sticky" );
	_de.$toggleSound = $( ".toggle-sound" );
	_de.$findable = $( "[data-findable]" );
	
	_de.$containerFill = $( ".container-fill" );
	
	_de.$logo = $( ".logo" );
	_de.$logoName = _de.$logo.find( ".prospect-name" );
	
	_de.$navbarPlanets = $( "#navbarPlanets" );
	_de.$navPlanets = $( ".nav-planets" );
	
	_de.$solarSystem = $( "#solar-system" );
	_de.$sections = $( ".system-section" );
	
	_de.$maxgrounds = $( ".maxground" );
	_de.$foregrounds = $( ".foreground" );
	_de.$middlegrounds = $( ".middleground" );
	_de.$backgrounds = $( ".background" );
	
	/*===================================================
	
	general
	
	=====================================================*/
	
	_s.timeDeltaExpected = 1000 / 60;
	_s.throttleTimeShort = _s.timeDeltaExpected * 3;
	_s.throttleTimeMedium = 100;
	_s.throttleTimeLong = 250;
	_s.throttleTimeLong = 250;
	
	_s.wMin = 950;
	_s.hMin = 550;
	_s.wBase = 1200;
	_s.hBase = _s.hMin;
	_s.fontSizeMin = 0.8;
	_s.fontSizeMax = 1;
	
	_s.fadeDuration = 500;
	_s.collapseDuration = 500;
	_s.fadeEasing = 'easeInOutCubic';
	_s.collapseEasing = 'easeInOutCubic';
	
	_s.parallaxBackground = 1.25;
	_s.parallaxMiddleground = 1.6;
	_s.parallaxForeground = 2.1;
	_s.parallaxMaxground = 2.7;
	
	_s.w = _de.$window.width();
    _s.h = _de.$window.height();
	
	/*===================================================
	
	support
	
	=====================================================*/
	
	_s.supports = {
		pointerEvents: Modernizr.testProp('pointerEvents')
	};
	
	// svg not correctly supported, fallback on png
	
	if ( !Modernizr.svg || !Modernizr.svgclippaths ) {
		
		$( 'img' ).each( function () {
			
			var $element = $( this );
			var src = $element.attr( 'src' ) || '';
			var index = src.lastIndexOf( '.svg' );
			
			if ( index !== -1 ) {
				
				$element.attr( 'src', src.slice( 0, index ) + '.png' );
				
			}
		} );
		
	}
	
	return _s;
	
} );