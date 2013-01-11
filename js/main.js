( function (requirejs, soundManager ) {
	
	requirejs.config({
		// by default load any module IDs from js/lib
		baseUrl: 'js/lib',
		// exceptions
		paths: {
			app: '../app'
		}
	});
	
	require(
	[
		"jquery",
		"app/shared",
		"app/utilities",
		"hammer.custom"
	],
	function ( $, _s, _utils ) {
		
		var _de = _s.domElements;
		
		// assumes we have already loaded sound manager
		// sound manager tends to not load properly in module format
		
		soundManager.ontimeout( function ( status ) {
			
			soundManager.reset();
			
			// allow no flash to be ignored
			
			_de.$document.one( 'tap.smreset', function () {
				
				_utils.FadeDOM( {
					element: _de.$noflash,
					duration: 0
				} );
				
				// reset and init sound manager preferring html5
				
				soundManager.setup( {
					url: 'swf/',
					flashVersion: 9,
					debugMode: false,
					useHTML5Audio: true,
					preferFlash: false,
					onready: Init
				  } );
				
			} );
			
			// notify user of no flash
			
			$( "#sm2-placeholder" )
				.after( $( "#sm2-container" ) )
				.remove();
			
			_utils.FadeDOM( {
				element: _de.$noflash,
				easing: 'easeInCubic',
				opacity: 1,
				duration: 1000
			} );
			
		} );
		
		soundManager.onready( Init );
		
		function Init () {
			
			require(
			[
				"app/ui",
				"app/navigator",
				"app/solarSystem",
				"app/user",
				"overthrow",
				"RequestAnimationFrame"
			],
			function ( _ui, _navi, _solarSystem, _user ) {
				
				_de.$document.off( '.smreset' );
				
				$( "#sm2-container" ).addClass( 'swf_loaded' );
				
				if ( _user.ready !== true ) {
					
					_s.signals.onUserReady.add( InitInternal );
					
				}
				else {
					
					InitInternal();
					
				}
				
				function InitInternal () {
					
					_utils.FadeDOM( {
						element: _de.$noflash,
						duration: 0
					} );
					
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
					
					function Update () {
						
						_s.signals.onUpdated.dispatch();
						
						window.requestAnimationFrame( Update );
						
					}
					
				}
				
			} );
			
		}
		
	} );

}( requirejs, soundManager ) );