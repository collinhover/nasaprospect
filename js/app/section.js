define( [ 
	"jquery",
	"app/shared",
	"app/ui",
	"app/navigator",
	"app/sound",
	"signals"
],
function ( $, _s, _ui, _navi, _snd, Signal ) {
	
	var _de = _s.domElements;
	var _section = {};
	var _sectionCount = 0;
	
	/*===================================================
	
	instance
	
	=====================================================*/
	
	function Section ( element, parameters ) {
		
		var me = this;
		
		parameters = parameters || {};
		
		this.$element = $( element );
		this.$element.data( 'section', this );
		
		_sectionCount++;
		this.id = this.$element.attr( 'id' ) || String( _sectionCount );
		
		this.whenInside = {};
		
		// triggers
		
		this.triggers = [];
		this.triggersSound = [];
		this.triggersPersistentParameters = [];
		this.triggersPersistent = [];
		
		// areas
		
		this.$explore = this.$element.find( ".explore" );
		
		// clone orbit and land top to create bottom versions
		
		this.$landTop = this.$element.find( ".land-top" );
		this.$landBottom = this.$element.find( ".land-bottom" );
		
		if ( this.$landTop.length > 0 && this.$landTop.hasClass( 'clone' ) ) {
			
			this.$landBottom = this.$landTop
				.clone()
				.removeClass( "land-top" )
				.addClass( "land-bottom mirror-vertical" )
				.insertAfter( this.$explore );
			
			_de.$containerFill = _de.$containerFill.add( this.$landBottom );
			
		}
		
		this.$orbitTop = this.$element.find( ".orbit-top" );
		this.$orbitBottom = this.$element.find( ".orbit-bottom" );
		
		if ( this.$orbitTop.length > 0 && this.$orbitTop.hasClass( 'clone' ) ) {
			
			this.$orbitBottom = this.$orbitTop
				.clone()
				.removeClass( "orbit-top" )
				.addClass( "orbit-bottom mirror-vertical" )
				.insertAfter( this.$landBottom.length > 0 ? this.$landBottom : this.explore );
			
			_de.$containerFill = _de.$containerFill.add( this.$orbitBottom );
			
		}
		
		this.$orbit = this.$element.find( ".orbit" );
		this.$land = this.$element.find( ".land" );
		
		this.$planet = this.$element.find( ".planet" );
		
		// soundHandlers
		
		this.soundHandlers = {
			element: new _snd.SoundHandler( { element: this.$element } ),
			active: new _snd.SoundHandler( { element: this.$element.children(), options: { descendents: true } } )
		}
		
		// triggers
		
		this.triggersPersistent = [
			{
				element: this.$element,
				callback: { callback: this.Enter, context: this },
				callbackOutside: { callback: this.Exit, context: this },
				callbackCenter: { callback: this.Activate, context: this },
				callbackCenterOutside: { callback: this.Deactivate, context: this }
			}
		];
		
		// init persistent triggers
		
		_navi.AddTriggers( this.triggersPersistent );
		
		// signals
		
		this.onEntered = new Signal();
		this.onExited = new Signal();
		this.onActivated = new Signal();
		this.onDeactivated = new Signal();
		
		this.Deactivate();
		this.Exit();
		
	}
	
	/*===================================================
	
	enter
	
	=====================================================*/
	
	function Enter () {
		
		if ( this.inside !== true ) {
			
			this.inside = true;
			
			this.onEntered.dispatch( this );
			
			_s.signals.onUpdated.add( this.Update, this );
			_s.signals.onResized.add( this.Resize, this );
			this.Resize();
			
		}
		
	}
	
	function Exit () {
		
		if ( this.inside !== false ) {
			
			this.inside = false;
			
			_s.signals.onUpdated.remove( this.Update, this );
			_s.signals.onResized.remove( this.Resize, this );
			
			this.onExited.dispatch( this );
			
		}
		
	}
	
	/*===================================================
	
	active
	
	=====================================================*/
	
	function Activate () {
		
		var me = this;
		
		if ( this.active !== true ) {
			
			this.active = true;
			
			this.onActivated.dispatch( this );
			
			this.soundHandlers.element.Play();
			
			_navi.RemoveTriggers( this.triggers );
			this.triggers = _navi.AddTriggers( this.soundHandlers.active.triggers );
			
		}
		
	}
	
	function Deactivate () {
		
		if ( this.active !== false ) {
			this.active = false;
			
			this.onDeactivated.dispatch( this );
			
			this.soundHandlers.element.Pause();
			
			_navi.RemoveTriggers( this.triggers );
			this.triggers = [];
			
			// reset persistent triggers on navigation direction reverse to ensure they activate correctly
			
			_navi.ReverseResetTriggers( this.triggersPersistent, this.id );
			
		}
		
	}
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function Update () {
		
		
		
	}
	
	/*===================================================
	
	resize
	
	=====================================================*/
	
	function Resize () {
		
		if ( typeof this.whenInside.Resize === 'function' ) {
			
			this.whenInside.Resize();
			
		}
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_section.Instance = Section;
	_section.Instance.prototype.constructor = _section.Instance;
	
	_section.Instance.prototype.Enter = Enter;
	_section.Instance.prototype.Exit = Exit;
	_section.Instance.prototype.Activate = Activate;
	_section.Instance.prototype.Deactivate = Deactivate;
	
	_section.Instance.prototype.Update = Update;
	_section.Instance.prototype.Resize = Resize;
	
	return _section;
	
} );