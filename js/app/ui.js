define( [ 
	"jquery",
	"app/shared",
	"app/utilities",
	"app/navigator",
	"hammer.custom",
	"bootstrap",
	"jquery.throttle-debounce.custom"
],
function ( $, _s, _utils, _navi ) {
	
	var _de = _s.domElements;
	var _ui = {};
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	// resize
	
	_de.$window.on( 'resize', $.debounce( _s.throttleTimeMedium, OnWindowResized ) );
	
	/*===================================================
	
	events
	
	=====================================================*/
    
    function OnWindowResized () {
	   
		_s.w = _de.$window.width();
		_s.h = _de.$window.height();
		
		// fill container elements to match screen height
		
		_de.$containerFill.css( "height", _s.h );
		
		// handle type size by screen size
		
		_de.$body.css( 'font-size', _utils.Clamp( Math.min( _s.w / _s.wBase, _s.h / _s.hBase ), _s.fontSizeMin, _s.fontSizeMax ) * 100 + "%" );
		
		// keep nav at correct width
		
		var $items = _de.$navPlanets.find( 'li' );
		var navHeight = _de.$navPlanets.height();
		var numItems = $items.length;
		var heightPerItem = navHeight / numItems;
		
		_de.$navbarPlanets.css( 'width', heightPerItem );
		
		// signal
		
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
		
		// update section parts
		
		_de.$orbits = _de.$sections.find( ".orbit" );
		_de.$lands = _de.$sections.find( ".land" );
		_de.$explores = _de.$sections.find( ".explore" );
		
		_s.signals.onContentRefreshed.dispatch();
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_ui.OnWindowResized = OnWindowResized;
	_ui.OnContentChanged = OnContentChanged;
	
	return _ui;
	
} );