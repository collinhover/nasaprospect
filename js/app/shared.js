define( [ 
	"jquery",
	"signals"
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
		onResized: new Signal()
	};
	
	/*===================================================
	
	dom elements
	
	=====================================================*/
	
	var _de = _s.domElements = {};
	
	_de.$window = $( window );
	_de.$document = $( document );
	_de.$body = _de.$document.find( "body" );
	_de.$main = $( "#main" );
	
	_de.$scrollable = $( ".scrollable" );
	_de.$stickable = $( ".stickyme, .is-sticky" );
	_de.$toggleSound = $( ".toggle-sound" );
	
	_de.$containerFill = $( ".container-fill" );
	
	_de.$logoName = $( ".prospect-name" );
	
	_de.$navbarPlanets = $( "#navbarPlanets" );
	_de.$navPlanets = $( ".nav-planets" );
	
	_de.$solarSystem = $( "#solar-system" );
	_de.$section = $( ".system-section" );
	
	/*===================================================
	
	general
	
	=====================================================*/
	
	_s.timeDeltaExpected = 1000 / 60;
	_s.throttleTimeShort = _s.timeDeltaExpected * 3;
	_s.throttleTimeMedium = 100;
	_s.throttleTimeLong = 250;
	_s.throttleTimeLong = 250;
	
	_s.parallaxBackground = 1.25;
	_s.parallaxMiddleground = 1.6;
	_s.parallaxForeground = 2.1;
	
	_s.w = _de.$window.width();
    _s.h = _de.$window.height();
	
	return _s;
	
} );