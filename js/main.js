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
				opacity: 1
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
				
				if ( _s.unsupported === true ) {
					
					_utils.FadeDOM( {
						element: _de.$nosupport,
						opacity: 1
					} );
					
					$( ".video-container" ).append( '<iframe width="640" height="400" src="http://www.youtube.com/embed/bDMSJ2rFRqg" frameborder="0" allowfullscreen></iframe>' ); 
					
				}
				else if ( _user.ready !== true ) {
					
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
					
					_s.time = _s.timeLast = new Date().getTime();
					Update();
					
					// ready
					
					_s.signals.onReady.dispatch();
					
					// resize once on start
					
					_de.$window.on( 'resize', function () { _s.timeTestPerformancePause = 0; } );
					_s.signals.onContentRefreshed.addOnce( function () { _navi.CheckTriggers( true ); } );
					_de.$window.trigger( 'resize' );
					
					// fade preloader
					
					_utils.FadeDOM( {
						element: _de.$preloader,
						easing: 'easeInCubic',
						duration: 1000,
						callback: function () {
							
							_s.testPerformance = true;
							
						}
					} );
					
					function Update () {
						
						_s.timeLast = _s.time;
						_s.time = new Date().getTime();
						_s.timeDeltaLastLast = _s.timeDeltaLast;
						_s.timeDeltaLast = _s.timeDelta;
						_s.timeDelta = _s.time - _s.timeLast;
						
						// test performance
						
						if ( _s.lowPerformance !== true && _s.testPerformance === true ) {
							
							// special case for when user gets a huge spike for 1 or 2 frames
							
							var timeDeltaLastHalf = _s.timeDeltaLast * 0.5;
							
							if ( _s.timeDeltaLast >= _s.timeDeltaLowPerformance && _s.timeDeltaLastLast < timeDeltaLastHalf && _s.timeDelta < timeDeltaLastHalf ) {
								
								_s.timeDeltaLast = 0;
								
							}
							
							if ( _s.timeTestPerformancePause < _s.timeTestPerformancePauseThreshold ) {
								
								_s.timeTestPerformancePause += _s.timeDeltaLast;
								
							}
							else {
								
								if ( _s.timeDelta >= _s.timeDeltaLowPerformance ) {
									
									_s.timeTestPerformance += _s.timeDeltaLast;
									
									if ( _s.timeTestPerformance >= _s.timeTestPerformanceThreshold ) {
										
										_s.lowPerformance = true;
										_s.testPerformance = false;
										_s.signals.onLowPerformanceMode.dispatch();
										
										// let user know of low performance
										
										_utils.FadeDOM( {
											element: _de.$userLowPerformance,
											opacity: 1
										} );
										
										// allow user to force high performance
										
										_de.$userLowPerformance.one( 'tap', function () {
											
											_utils.FadeDOM( {
												element: _de.$userLowPerformance
											} );
											
											_s.lowPerformance = false;
											_s.signals.onForceHighPerformance.dispatch();
											
										} );
										
									}
									
								}
								// reset low performance time if too long inbetween instances of low performance
								else {
									
									_s.timeTestPerformanceReset += _s.timeDeltaLast;
									
									if ( _s.timeTestPerformanceReset >= _s.timeTestPerformanceResetThreshold ) {
										
										_s.timeTestPerformance = _s.timeTestPerformanceReset = 0;
										
									}
									
								}
								
							}
							
						}
						
						_s.signals.onUpdated.dispatch();
						
						window.requestAnimationFrame( Update );
						
					}
					
				}
				
			} );
			
		}
		
	} );

}( requirejs, soundManager ) );