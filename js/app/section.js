define( [ 
	"jquery",
	"app/shared",
	"app/ui",
	"app/sound",
	"signals"
],
function ( $, _s, _ui, _snd, Signal ) {
	
	var _section = {};
	
	/*===================================================
	
	instance
	
	=====================================================*/
	
	function Section ( element, parameters ) {
		
		var me = this;
		
		parameters = parameters || {};
		
		this.$element = $( element );
		this.$element.data( 'section', this );
		
		this.orbiting = false;
		this.landing = false;
		this.exploring = false;
		
		this.$explore = this.$element.find( ".explore" );
		
		// clone orbit and land top to create bottom versions
		
		this.$orbitTop = this.$element.find( ".orbit-top" );
		this.$landTop = this.$element.find( ".land-top" );
		
		this.$landBottom = this.$landTop
			.clone()
			.removeClass( "land-top" )
			.addClass( "land-bottom" )
			.insertAfter( this.$explore );
		
		this.$orbitBottom = this.$orbitTop
			.clone()
			.removeClass( "orbit-top" )
			.addClass( "orbit-bottom" )
			.insertAfter( this.$landBottom );
		
		this.$orbit = this.$element.find( ".orbit" );
		this.$land = this.$element.find( ".land" );
		
		this.$planet = this.$element.find( ".planet" );
		
		// soundHandlers
		
		this.soundHandlers = {
			element: new _snd.SoundHandler( { element: this.$element } ),
			orbit: new _snd.SoundHandler( { element: $().add( this.$orbitTop ).add( this.$orbitBottom ), options: { descendents: true } } ),
			land: new _snd.SoundHandler( { element: $().add( this.$landTop ).add( this.$landBottom ), options: { descendents: true } } ),
			explore: new _snd.SoundHandler( { element: this.$explore, options: { descendents: true } } )
		};
		
		// triggers
		
		this.triggers = [];
		this.triggersSound = [];
		this.triggersPersistent = [
			{
				element: this.$orbitTop,
				callback: this.StartOrbiting,
				context: this
			},
			{
				element: this.$orbitBottom,
				callback: this.StartOrbiting,
				context: this
			}
		];
		
		// persistent triggers
		
		_s.navigator.addTriggers( this.triggersPersistent );
		
		// signals
		
		this.onOrbitingStarted = new Signal();
		this.onOrbitingStopped = new Signal();
		this.onLandingStarted = new Signal();
		this.onLandingStopped = new Signal();
		this.onExploringStarted = new Signal();
		this.onExploringStopped = new Signal();
		
		this.$planet.on( 'tap', $.proxy( this.ToOrbit, this ) );
		
		_ui.OnContentChanged( this.$element );
		
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
	
	active
	
	=====================================================*/
	
	function Activate () {
		console.log( 'Activate', this.$element.attr( 'id' ) );
		this.soundHandlers.element.Play();
		
	}
	
	function Deactivate () {
		console.log( 'Deactivate', this.$element.attr( 'id' ) );
		this.StopAll();
		
		this.soundHandlers.element.Stop();
		
	}
	
	/*===================================================
	
	orbiting
	
	=====================================================*/
	
	function ToOrbit () {
		
		_s.navigator.scrollToElement( this.$orbit, true, 1, {
			ease: Cubic.easeOut,
			onComplete: $.proxy( this.StartOrbiting, this )
		} );
		
		return this;
		
	}
	
	function StartOrbiting () {
		
		if ( this.orbiting !== true ) {
			console.log( this.$element.attr( 'id' ), 'start orbiting!' );
			this.orbiting = true;
			
			this.StopLanding();
			this.StopExploring();
			
			// cycle triggers
			
			_s.navigator.removeTriggers( this.triggers );
			this.triggers = _s.navigator.addTriggers( [
				{
					callback: this.StartLanding,
					context: this,
					element: this.$landTop,
					once: true
				},
				{
					callback: this.StartLanding,
					context: this,
					element: this.$landBottom,
					once: true
				}
			] );
			
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
		
		if ( this.landing !== true ) {
			console.log( this.$element.attr( 'id' ), 'start landing!' );
			this.landing = true;
			
			this.StopOrbiting();
			this.StopExploring();
			
			// triggers
			
			_s.navigator.removeTriggers( this.triggers );
			this.triggers = _s.navigator.addTriggers( [
				{
					callback: this.StartExploring,
					context: this,
					element: this.$explore,
					once: true
				}
			] );
			
			// sounds as triggers
			
			this.triggers = this.triggers.concat( _s.navigator.addTriggers( this.soundHandlers.land.triggers ) );
			
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
		
		if ( this.exploring !== true ) {
			console.log( this.$element.attr( 'id' ), 'start exploring!' );
			this.exploring = true;
			
			this.StopOrbiting();
			this.StopLanding();
			
			// cycle triggers
			
			_s.navigator.removeTriggers( this.triggers );
			this.triggers = _s.navigator.addTriggers( [
				{
					callback: this.StartLanding,
					context: this,
					element: this.$landTop,
					once: true
				},
				{
					callback: this.StartLanding,
					context: this,
					element: this.$landBottom,
					once: true
				}
			] );
			
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
	
	resize
	
	=====================================================*/
	
	function Resize ( w, h ) {
		
		w = w || _s.w;
		h = h || _s.h;
		
		// orbit is always as big as user screen x1
        
		this.$orbit.css( {
            "width": w,
            "height": h
        } );
		
		// land is at least as big as user screen x1, but can expand
		
        this.$land.css( {
            "width": w,
            "min-height": h
        } );
		
		// explore is at least as big as user screen x1, but can expand
		
		this.$explore.css( {
            "width": w,
            "min-height": h
        } );
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_section.Instance = Section;
	_section.Instance.prototype.constructor = _section.Instance;
	
	_section.Instance.prototype.StopAll = StopAll;
	_section.Instance.prototype.Activate = Activate;
	_section.Instance.prototype.Deactivate = Deactivate;
	_section.Instance.prototype.ToOrbit = ToOrbit;
	_section.Instance.prototype.StartOrbiting = StartOrbiting;
	_section.Instance.prototype.StopOrbiting = StopOrbiting;
	_section.Instance.prototype.StartLanding = StartLanding;
	_section.Instance.prototype.StopLanding = StopLanding;
	_section.Instance.prototype.StartExploring = StartExploring;
	_section.Instance.prototype.StopExploring = StopExploring;
	_section.Instance.prototype.Resize = Resize;
	
	return _section;
	
} );