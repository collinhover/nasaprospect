define( [ 
	"jquery",
	"app/shared",
	"jquery.throttle-debounce.custom",
	"hammer.custom",
	"mwheelIntent",
	"jquery.mousewheel"
],
function ( $, _s ) {
	
	var _de = _s.domElements;
	var _ui = {};
	
	/*===================================================
	
	events
	
	=====================================================*/
	
	// resize once on start
	
	_de.$window.on( 'resize', $.throttle( _s.throttleTimeLong, OnWindowResized ) );
	OnWindowResized();
    
    function OnWindowResized () {
        
        var w = _s.windowWidth = _de.$window.width();
        var h = _s.windowHeight = _de.$window.height();
		
    }
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_ui.OnWindowResized = OnWindowResized;
	
	return _ui;
	
} );