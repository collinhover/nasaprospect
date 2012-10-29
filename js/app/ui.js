define( [ 
	"jquery",
	"app/shared",
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
	
	// store reference to primary scrollable api
	
	_s.navigator = _de.$body.data( 'jsp' );
	
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
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_ui.OnWindowResized = OnWindowResized;
	_ui.OnContentChanged = OnContentChanged;
	
	return _ui;
	
} );