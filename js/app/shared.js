define( [ 
	"jquery",
	"signals",
	"jquery.easing",
	"mdetect"
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
		onUserReady: new Signal(),
		onScrolled: new Signal(),
		onUpdated: new Signal(),
		onResized: new Signal(),
		onContentRefreshed: new Signal(),
		onLowPerformanceMode: new Signal(),
		onForceHighPerformance: new Signal()
	};
	
	/*===================================================
	
	dom elements
	
	=====================================================*/
	
	var _de = _s.domElements = {};
	
	_de.$window = $( window );
	_de.$document = $( document );
	_de.$html = _de.$document.find( "html" );
	_de.$body = _de.$document.find( "body" );
	_de.$main = $( "#main" );
	_de.$preloader = $( "#preloader" );
	_de.$noflash = $( "#noflash" );
	_de.$nosupport = $( "#nosupport" );
	
	_de.$user = $( "#user" );
	_de.$userToggleSound = $( "#userToggleSound" );
	_de.$userPlaySound = $( "#userPlaySound" );
	_de.$userScroll = $( "#userScroll" );
	_de.$userLowPerformance = $( "#userLowPerformance" );
	
	_de.$scrollable = $( ".scrollable" );
	_de.$toggleSound = $( ".toggle-sound" );
	_de.$playSound = $( ".play-sound" );
	_de.$findable = $( "[data-findable]" );
	
	_de.$logo = $( ".logo" );
	_de.$logoName = _de.$logo.find( ".prospect-name" );
	
	_de.$solarSystem = $( "#solar-system" );
	_de.$sections = $( ".system-section" );
	_de.$setup = $( "#setup" );
	
	_de.$containerFill = $( ".container-fill" );
	_de.$scrollContainer = $( ".scroll-container" ).add( _de.$containerFill );
	_de.$scrollButtonUp = $( ".scroll-button-up" );
	_de.$scrollButtonDown = $( ".scroll-button-down" );
	
	_de.$navbarPlanets = $( "#navbarPlanets" );
	_de.$navPlanets = $( ".nav-planets" );
	
	_de.$maxgrounds = $( ".maxground" );
	_de.$foregrounds = $( ".foreground" );
	_de.$middlegrounds = $( ".middleground" );
	_de.$backgrounds = $( ".background" );
	
	/*===================================================
	
	general
	
	=====================================================*/
	
	_s.time = _s.timeLast = new Date().getTime();
	_s.timeDelta = _s.timeDeltaLast = _s.timeDeltaLastLast = 0;
	
	_s.lowPerformance = false;
	_s.testLowPerformance = false;
	_s.timeDeltaLowPerformance = 1000 / 20;
	_s.timeTestPerformance = 0;
	_s.timeTestPerformanceThreshold = 1000;
	_s.timeTestPerformanceReset = 0;
	_s.timeTestPerformanceResetThreshold = 1000;
	_s.timeTestPerformancePause = _s.timeTestPerformancePauseThreshold = 2000;
	
	_s.throttleTimeShort = _s.timeDeltaExpected * 3;
	_s.throttleTimeMedium = 100;
	_s.throttleTimeLong = 250;
	
	_s.wMin = 979;
	_s.hMin = 550;
	_s.wBase = 1200;
	_s.hBase = _s.hMin;
	_s.fontSizeMin = 0.8;
	_s.fontSizeMax = 1;
	
	_s.scrollDuration = 2000;
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
	
	_s.mobile = DetectTierIphone() || DetectTierTablet();
	_s.unsupported = _de.$html.hasClass( 'lt-ie9' )
		|| !_de.$html.hasClass( 'fontface' )
		|| !_de.$html.hasClass( 'backgroundsize' )
		|| !_de.$html.hasClass( 'opacity' )
		|| !Modernizr.mq( '(min-width: 0px)' );
	_s.ie9 = _de.$html.hasClass( 'ie9' );
	_s.supports = {
		pointerEvents: Modernizr.testProp('pointerEvents')
	};
	
	// svg not correctly supported, fallback on png
	
	if ( !Modernizr.svg || !Modernizr.svgclippaths ) {
		
		SVGtoPNG( $( 'img' ) );
		
	}
	
	// ie9 fixes for user ui
	
	if ( _s.ie9 === true ) {
		
		SVGtoPNG( $().add( _de.$setup ).add( _de.$userToggleSound ).add( _de.$userPlaySound ).add( _de.$userScroll ).add( _de.$userLowPerformance ).find( 'img' ) );
		
	}
	
	function SVGtoPNG ( $elements ) {
		
		$elements.each( function () {
			
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