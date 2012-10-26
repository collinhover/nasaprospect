define( [ 
	"jquery"
],
function ( $ ) {
	
	var _s = {};
	
	/*===================================================
	
	general
	
	=====================================================*/
	
	_s.timeDeltaExpected = 1000 / 60;
	_s.throttleTimeShort = _s.timeDeltaExpected * 3;
	_s.throttleTimeMedium = 100;
	_s.throttleTimeLong = 250;
	_s.throttleTimeLong = 250;
	
	/*===================================================
	
	dom elements
	
	=====================================================*/
	
	var _de = _s.domElements = {};
	
	_de.$window = $( window );
	_de.$document = $( document );
	_de.$body = _de.$document.find( "body" );
	_de.$scrollable = $( ".scrollable" );
	
	_de.$solarSystem = $( "#solar-system" );
	
	_de.$section = _de.$solarSystem.find( "section" );
	_de.$orbit = _de.$section.find( ".orbit" );
	_de.$land = _de.$section.find( ".land" );
	_de.$explore = _de.$section.find( ".explore" );
	
	_de.$foreground = $( ".foreground" );
	_de.$middleground = $( ".middleground" );
	_de.$background = $( ".background" );
	
	_de.$orbitForeground = _de.$orbit.find( ".foreground" );
	_de.$orbitMiddleground = _de.$orbit.find( ".middleground" );
	_de.$orbitBackground = _de.$orbit.find( ".background" );
	
	_de.$landForeground = _de.$land.find( ".foreground" );
	_de.$landMiddleground = _de.$land.find( ".middleground" );
	_de.$landBackground = _de.$land.find( ".background" );
	
	_de.$exploreForeground = _de.$explore.find( ".foreground" );
	_de.$exploreMiddleground = _de.$explore.find( ".middleground" );
	_de.$exploreBackground = _de.$explore.find( ".background" );
	
	// for each section
	
	_de.$section.each( function () {
		
		var $element = $( this );
		
		$element.data( '$orbit', $element.find( ".orbit" ) );
		$element.data( '$land', $element.find( ".land" ) );
		$element.data( '$explore', $element.find( ".explore" ) );
		$element.data( '$planet', $element.find( ".planet" ) );
		
	} );
	
	return _s;
	
} );