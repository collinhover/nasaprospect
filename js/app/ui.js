define( [ 
	"jquery",
	"app/shared",
	"hammer.custom",
	"bootstrap",
	"mwheelIntent",
	"jquery.throttle-debounce.custom",
	"jquery.mousewheel",
	"jquery.jscrollpane.custom",
	"jquery.stellar.custom"
],
function ( $, _s ) {
	
	var _de = _s.domElements;
	var _ui = {};
	
	/*===================================================
	
	events
	
	=====================================================*/
    
    function OnWindowResized () {
       
		_s.w = _de.$window.width();
        _s.h = _de.$window.height();
		
		_s.signals.onResized.dispatch( _s.w, _s.h );
		
		// fill container elements
		
		_de.$containerFill.css( {
            "width": _s.w,
            "height": _s.h
        } );
		
		// refresh scroll panes
		
		OnContentChanged();
        
    }
	
	function OnContentChanged ( changed ) {
		
		var $changed = $( changed );
		var $scrollable;
		
		if ( $changed.length > 0 ) {
			
			$scrollable = _de.$scrollable.has( $changed );
			
		}
		else {
			
			$scrollable = _de.$scrollable;
			
		}
		
		$scrollable.each( function () {
			
			var $element = $( this );
			var scrollAPI = $element.data('jsp');
			
			scrollAPI.reinitialise();
			
		} );
		
		// update section parts
		
		_de.$orbits = _de.$sections.find( ".orbit" );
		_de.$lands = _de.$sections.find( ".land" );
		_de.$explores = _de.$sections.find( ".explore" );
		
		_de.$foregrounds = $( ".foreground" );
		_de.$middlegrounds = $( ".middleground" );
		_de.$backgrounds = $( ".background" );
		
		// update parallax
		
		_de.$foregrounds.attr( "data-stellar-ratio", _s.parallaxForeground );
		_de.$middlegrounds.attr( "data-stellar-ratio", _s.parallaxMiddleground );
		_de.$backgrounds.attr( "data-stellar-ratio", _s.parallaxBackground );
		
		_s.navigator.getContentPane().stellar( 'refresh' );
		
	}
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	var scrollbarV = $( '<div></div>' ).addClass( 'jspVerticalBar' ).appendTo( _de.$main );
	var scrollbarH = $( '<div></div>' ).addClass( 'jspHorizontalBar' ).appendTo( _de.$main );
	
	var scrollSettings = {
		verticalGutter : -scrollbarV.width(),
		horizontalGutter: -scrollbarH.height(),
		hijackInternalLinks: true
	};
	
	scrollbarV.remove();
	scrollbarH.remove();
	
	_de.$scrollable.jScrollPane( scrollSettings );
	
	_s.navigator = _de.$main.data( 'jsp' );
	
	// parallax
	
	_s.navigator.getContentPane().stellar( {
		scrollProperty: 'position',
		horizontalScrolling: false,
		hideDistantElements: false
	} );
	
	// load sticky late so it can use throttle to improve performance
	
	require( [
		"jquery.multi-sticky"
	],
	function () {
		
		_de.$stickable.each( function () {
			
			var $element = $( this );
			var $target = $( $element.data( "target" ) );
			var stickyParameters = {
				handlePosition: false
			};
			
			// if target empty, assume main
			
			if ( $target.length === 0 ) {
				
				$target = _de.$main;
				stickyParameters.scrollTop = function () {
					
					return _s.navigator.getContentPositionY();
					
				};
				
			}
			
			stickyParameters.scrollTarget = $target;
			
			$element.removeClass( 'is-sticky' ).sticky( stickyParameters );
			
		} );
		
	}
	);
	
	_de.$window.on( 'resize', $.throttle( _s.throttleTimeLong, OnWindowResized ) );
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_ui.OnWindowResized = OnWindowResized;
	_ui.OnContentChanged = OnContentChanged;
	
	return _ui;
	
} );