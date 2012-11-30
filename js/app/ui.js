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
	
	scrolling
	
	=====================================================*/
	
	var scrollbarV = $( '<div></div>' ).addClass( 'jspVerticalBar' ).appendTo( _de.$body );
	var scrollbarH = $( '<div></div>' ).addClass( 'jspHorizontalBar' ).appendTo( _de.$body );
	
	var scrollSettings = {
		verticalGutter : -scrollbarV.width(),
		horizontalGutter: -scrollbarH.height(),
		hijackInternalLinks: true
	};
	
	scrollbarV.remove();
	scrollbarH.remove();
	
	_de.$scrollable.jScrollPane( scrollSettings );
	
	_s.navigator = _de.$body.data( 'jsp' );
	
	/*===================================================
	
	parallax
	
	=====================================================*/
	
	_s.navigator.getContentPane().stellar( {
		scrollProperty: 'position'
	} );
	
	/*===================================================
	
	sticky
	
	=====================================================*/
	
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
			
			// if target empty, assume body
			
			if ( $target.length === 0 ) {
				
				$target = _de.$body;
				stickyParameters.scrollTop = function () {
					
					return _s.navigator.getContentPositionY();
					
				};
				
			}
			
			stickyParameters.scrollTarget = $target;
			
			$element.removeClass( 'is-sticky' ).sticky( stickyParameters );
			
		} );
		
	}
	);
	
	/*===================================================
	
	events
	
	=====================================================*/
	
	// resize once on start
	
	_de.$window.on( 'resize', $.throttle( _s.throttleTimeLong, OnWindowResized ) );
	_de.$window.trigger( 'resize' );
    
    function OnWindowResized () {
       
		_s.w = _de.$window.width();
        _s.h = _de.$window.height();
		
		_s.signals.onResized.dispatch( _s.w, _s.h );
		
		// fill container elements
		
		_de.$containerFill.css( {
            "width": _s.w,
            "height": _s.h
        } );
		
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
		
		// keep nav at correct width
		
		var $items = _de.$navPlanets.find( 'li' );
		var navHeight = _de.$navPlanets.height();
		var numItems = $items.length;
		var heightPerItem = navHeight / numItems;
		
		_de.$navbarPlanets.css( 'width', heightPerItem );
		
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
		
		_de.$orbit = _de.$section.find( ".orbit" );
		_de.$land = _de.$section.find( ".land" );
		_de.$explore = _de.$section.find( ".explore" );
		
		_de.$foreground = $( ".foreground" );
		_de.$middleground = $( ".middleground" );
		_de.$background = $( ".background" );
		
		// update parallax
		
		_de.$foreground.attr( "data-stellar-ratio", _s.parallaxForeground );
		_de.$middleground.attr( "data-stellar-ratio", _s.parallaxMiddleground );
		_de.$background.attr( "data-stellar-ratio", _s.parallaxBackground );
		
		_s.navigator.getContentPane().stellar( 'refresh' );
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_ui.OnWindowResized = OnWindowResized;
	_ui.OnContentChanged = OnContentChanged;
	
	return _ui;
	
} );