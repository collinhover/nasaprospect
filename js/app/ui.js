define( [ 
	"jquery",
	"app/shared",
	"jquery.easing",
	"jquery.throttle-debounce.custom",
	"hammer.custom",
	"mwheelIntent",
	"jquery.mousewheel",
	"jquery.jscrollpane.custom"
],
function ( $, _s ) {
	
	var _de = _s.domElements;
	var _ui = {};
	
	/*===================================================
	
	sections
	
	=====================================================*/
	
	_de.$section.each( function () {
		
		var $element = $( this );
		var $planet = $element.data( '$planet' );
		
		$planet.on( 'tap', function () {
			console.log( 'planet tap' );
			
			var $land = $element.data( '$land' );
			
			// if visible, scroll smoothly to orbit
			
			if ( $land.is( ':visible' ) ) {
				
				_de.$body.data( 'jsp' ).scrollToElement( $element.data( '$orbit' ), true, true );
				
			}
			else {
				
				$land.show();
				
			}
			
			OnContentChanged();
			
		} );
		
	} );
	
	/*===================================================
	
	scrolling
	
	=====================================================*/
	
	var scrollbarV = $( '<div></div>' ).addClass( 'jspVerticalBar' ).appendTo( _de.$body );
	var scrollbarH = $( '<div></div>' ).addClass( 'jspHorizontalBar' ).appendTo( _de.$body );
	
	var scrollSettings = {
		verticalGutter : -scrollbarV.width(),
		horizontalGutter: -scrollbarH.height(),
		// TODO: move animation settings into a object with complete callback, passed to scrollToElement
		animateEase: "easeOutCubic",
		animateDuration: 500
	};
	
	scrollbarV.remove();
	scrollbarH.remove();
	
	_de.$scrollable.jScrollPane( scrollSettings );
	
	/*===================================================
	
	events
	
	=====================================================*/
	
	// resize once on start
	
	_de.$window.on( 'resize', $.throttle( _s.throttleTimeLong, OnWindowResized ) );
	OnWindowResized();
    
    function OnWindowResized () {
        
        var w = _de.$window.width();
        var h = _de.$window.height();
		
		// orbit is always as big as user screen x1
        
		_de.$orbit.css( {
            "width": w,
            "height": h
        } );
		
		// land is at least as big as user screen x1, but can expand on height
		
        _de.$land.css( {
            "width": w,
            "min-height": h
        } );
		
		// explore is at least as big as user screen x1, but can expand in width
		
		_de.$explore.css( {
            "min-width": w,
            "height": h
        } );
		
		// refresh scroll panes
		
		OnContentChanged();
        
    }
	
	function OnContentChanged () {
		
		_de.$scrollable.each( function () {
			
			var $element = $( this );
			var scrollAPI = $element.data('jsp');
			
			scrollAPI.reinitialise();
			
		} );
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_ui.OnWindowResized = OnWindowResized;
	_ui.OnContentChanged = OnContentChanged;
	
	return _ui;
	
} );