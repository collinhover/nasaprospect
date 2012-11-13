define( [ 
	"jquery",
	"app/shared",
	"jquery.throttle-debounce.custom",
	"hammer.custom",
	"mwheelIntent",
	"jquery.mousewheel",
	"jquery.jscrollpane.custom",
	"jquery.stellar"
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
		horizontalGutter: -scrollbarH.height()
	};
	
	scrollbarV.remove();
	scrollbarH.remove();
	
	_de.$scrollable.jScrollPane( scrollSettings );
	
	/*===================================================
	
	parallax
	
	=====================================================*/
	
	_s.navigator = _de.$body.data( 'jsp' );
	
	_s.navigator.getContentPane().stellar( {
		scrollProperty: 'position'
	} );
	
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