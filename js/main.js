requirejs.config({
	// by default load any module IDs from js/lib
	baseUrl: 'js/lib',
	// exceptions
	paths: {
		app: '../app'
	}
});

// assumes we have already loaded sound manager
// sound manager tends to not load properly in module format

soundManager.onready( function () {
	
	require(
	[
		"jquery",
		"app/shared",
		"app/utilities",
		"app/ui",
		"app/navigator",
		"app/solarSystem",
		"app/user",
		"overthrow",
		"RequestAnimationFrame"
	],
	function ( $, _s, _utils, _ui, _navi, _solarSystem, _user ) {
		
		var _de = _s.domElements;
		
		// main update loop
		
		function Update () {
			
			_s.signals.onUpdated.dispatch();
			
			window.requestAnimationFrame( Update );
			
		}
		
		Update();
		
		// ready
		
		_s.signals.onReady.dispatch();
		
		// resize once on start
		
		_de.$window.trigger( 'resize' );
		_navi.CheckTriggers( true );
		
		// fade preloader
		
		_utils.FadeDOM( {
			element: _de.$preloader,
			easing: 'easeInCubic',
			duration: 1000
		} );
		
	} );
	
} );