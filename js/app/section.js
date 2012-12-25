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
		console.log( this.$landTop.length > 0, this.$landTop.hasClass( 'clone' ) );
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
			orbit: new _snd.SoundHandler( { element: this.$orbit, options: { descendents: true } } ),
			land: new _snd.SoundHandler( { element: this.$land, options: { descendents: true } } ),
			explore: new _snd.SoundHandler( { element: this.$explore, options: { descendents: true } } )
		}
		
		// persistent triggers
		
		this.triggersPersistent = [
			{
				element: this.$element,
				callback: { callback: this.Enter, context: this },
				callbackOutside: { callback: this.Exit, context: this },
				callbackCenter: { callback: this.Activate, context: this },
				callbackCenterOutside: { callback: this.Deactivate, context: this }
			}
		];
		_navi.AddTriggers( this.triggersPersistent );
		
		// signals
		
		this.onEntered = new Signal();
		this.onExited = new Signal();
		this.onActivated = new Signal();
		this.onDeactivated = new Signal();
		this.onOrbitingStarted = new Signal();
		this.onOrbitingStopped = new Signal();
		this.onLandingStarted = new Signal();
		this.onLandingStopped = new Signal();
		this.onExploringStarted = new Signal();
		this.onExploringStopped = new Signal();
		
		this.$planet.on( 'tap', $.proxy( this.ToOrbit, this ) );
		
		this.Deactivate();
		this.Exit();
		
	}
	
	/*===================================================
	
	utility
	
	=====================================================*/
	
	function StopAll () {
		
		this.StopOrbiting();
		this.StopExploring();
		this.StopLanding();
		
	}
	
	/*===================================================
	
	enter
	
	=====================================================*/
	
	function Enter () {
		
		if ( this.inside !== true ) {
			console.log( this.id, 'entered' );
			this.inside = true;
			
			this.onEntered.dispatch( this );
			
			_s.signals.onUpdated.add( this.Update, this );
			_s.signals.onResized.add( this.Resize, this );
			this.Resize();
			
		}
		
	}
	
	function Exit () {
		
		if ( this.inside !== false ) {
			console.log( this.id, 'exited' );
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
			console.log( this.id, ' activate' );
			this.soundHandlers.element.Play();
			
			_navi.RemoveTriggers( this.triggers );
			this.triggers = [];
			
			this.$orbit.each( function () {
				
				me.triggers.push( _navi.AddTrigger( {
					callbackCenter: { callback: me.StartOrbiting, context: me },
					element: this,
					once: true
				} ) );
				
			} );
			
		}
		
	}
	
	function Deactivate () {
		
		if ( this.active !== false ) {
			this.active = false;
			
			this.onDeactivated.dispatch( this );
			console.log( this.id, ' deactivate' );
			this.StopAll();
			
			this.soundHandlers.element.Pause();
			
			_navi.RemoveTriggers( this.triggers );
			this.triggers = [];
			
			// reset persistent triggers on navigation direction reverse to ensure they activate correctly
			
			_navi.ReverseResetTriggers( this.triggersPersistent, this.id );
			
		}
		
	}
	
	/*===================================================
	
	orbiting
	
	=====================================================*/
	
	function ToOrbit () {
		
		_navi.scrollToElement( this.$orbit, true, 1, {
			ease: Cubic.easeOut,
			onComplete: $.proxy( this.StartOrbiting, this )
		} );
		
		return this;
		
	}
	
	function StartOrbiting () {
		
		var me = this;
		
		if ( this.orbiting !== true ) {
			console.log( this.$element.attr( 'id' ), 'start orbiting!' );
			this.orbiting = true;
			
			this.StopLanding();
			this.StopExploring();
			
			// cycle triggers
			
			_navi.RemoveTriggers( this.triggers );
			this.triggers = [];
			
			this.$land.each( function () {
				
				me.triggers.push( _navi.AddTrigger( {
					callbackCenter: { callback: me.StartLanding, context: me },
					element: this,
					once: true
				} ) );
				
			} );
			
			this.onOrbitingStarted.dispatch( this );
			
		}
		
		return this;
		
	}
	
	function StopOrbiting () {
		
		if ( this.orbiting !== false ) {
			
			this.orbiting = false;
			
			this.onOrbitingStopped.dispatch( this );
			
		}
		
		return this;
		
	}
	
	/*===================================================
	
	landing
	
	=====================================================*/
	
	function StartLanding () {
		
		var me = this;
		
		if ( this.landing !== true ) {
			console.log( this.$element.attr( 'id' ), 'start landing!' );
			this.landing = true;
			
			this.StopOrbiting();
			this.StopExploring();
			
			// triggers
			
			_navi.RemoveTriggers( this.triggers );
			this.triggers = [];
			
			this.$explore.each( function () {
				
				me.triggers.push( _navi.AddTrigger( {
					callbackCenter: { callback: me.StartExploring, context: me },
					element: this,
					once: true
				} ) );
				
			} );
			
			// sounds as triggers
			
			this.triggers = this.triggers.concat( _navi.AddTriggers( this.soundHandlers.land.triggers ) );
			
			this.onLandingStarted.dispatch( this );
			
		}
		
		return this;
		
	}
	
	function StopLanding () {
		
		if ( this.landing !== false ) {
			
			this.landing = false;
			
			this.onLandingStopped.dispatch( this );
			
		}
		
		return this;
		
	}
	
	/*===================================================
	
	exploring
	
	=====================================================*/
	
	function StartExploring () {
		
		var me = this;
		
		if ( this.exploring !== true ) {
			console.log( this.$element.attr( 'id' ), 'start exploring!' );
			this.exploring = true;
			
			this.StopOrbiting();
			this.StopLanding();
			
			// cycle triggers
			
			_navi.RemoveTriggers( this.triggers );
			this.triggers = [];
			
			this.$land.each( function () {
				
				me.triggers.push( _navi.AddTrigger( {
					callbackCenter: { callback: me.StartLanding, context: me },
					element: this,
					once: true
				} ) );
				
			} );
			
			this.onExploringStarted.dispatch( this );
			
		}
		
		return this;
		
	}
	
	function StopExploring () {
		
		if ( this.exploring !== false ) {
			
			this.exploring = false;
			
			this.onExploringStopped.dispatch( this );
			
		}
		
		return this;
		
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
	
	_section.Instance.prototype.StopAll = StopAll;
	_section.Instance.prototype.Enter = Enter;
	_section.Instance.prototype.Exit = Exit;
	_section.Instance.prototype.Activate = Activate;
	_section.Instance.prototype.Deactivate = Deactivate;
	
	_section.Instance.prototype.ToOrbit = ToOrbit;
	_section.Instance.prototype.StartOrbiting = StartOrbiting;
	_section.Instance.prototype.StopOrbiting = StopOrbiting;
	_section.Instance.prototype.StartLanding = StartLanding;
	_section.Instance.prototype.StopLanding = StopLanding;
	_section.Instance.prototype.StartExploring = StartExploring;
	_section.Instance.prototype.StopExploring = StopExploring;
	
	_section.Instance.prototype.Update = Update;
	_section.Instance.prototype.Resize = Resize;
	
	return _section;
	
} );