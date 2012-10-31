define( [ 
	"jquery",
	"app/shared",
	"app/ui",
	"signals"
],
function ( $, _s, _ui, Signal ) {
	
	var _section = {};
	
	/*===================================================
	
	instance
	
	=====================================================*/
	
	function Section ( element, parameters ) {
		
		var me = this;
		
		parameters = parameters || {};
		
		this.$element = $( element );
		this.$element.data( 'section', this );
		
		this.landing = false;
		this.exploring = false;
		
		this.$orbit = this.$element.find( ".orbit" );
		this.$land = this.$element.find( ".land" );
		this.$explore = this.$element.find( ".explore" );
		this.$planet = this.$element.find( ".planet" );
		
		this.triggers = {};
		
		this.onOrbitingStarted = new Signal();
		this.onLandingStarted = new Signal();
		this.onLandingCompleted = new Signal();
		this.onExploringStarted = new Signal();
		
		this.$planet.on( 'tap', $.proxy( this.ToggleLanding, this ) );
		
	}
	
	/*===================================================
	
	orbiting
	
	=====================================================*/
	
	function ToOrbit ( onComplete ) {
		
		var me = this;
		
		_s.navigator.scrollToElement( this.$orbit, true, 1, {
			ease: Cubic.easeOut,
			onComplete: function () {
				
				if ( typeof onComplete === 'function' ) {
					
					onComplete();
					
				}
				else {
					
					me.StartOrbiting();
					
				}
				
			}
		});
		
		return this;
		
	}
	
	function StartOrbiting () {
		
		if ( this.landing !== false ) {
			console.log( this.$element.attr( 'id' ), 'start orbiting!' );
			
			this.StopLanding();
			
			this.onOrbitingStarted.dispatch( this );
			
		}
		
		return this;
		
	}
	
	/*===================================================
	
	landing
	
	=====================================================*/
	
	function ToggleLanding () {
		console.log( this.$element.attr( 'id' ), 'ToggleLanding!' );
		if ( this.landing === true ) {
			
			this.ToOrbit();
			
		}
		else {
			
			this.ToOrbit( $.proxy( this.StartLanding, this ) );
			
		}
		
		return this;
		
	}
	
	function StartLanding () {
		
		if ( this.landing !== true ) {
			console.log( this.$element.attr( 'id' ), 'StartLanding!' );
			this.landing = true;
			
			this.$land.show();
			
			_ui.OnContentChanged( this.$element );
			
			//_s.navigator.setRangeElement( this.$element );
			
			// when user reaches or passes orbit, close planet
			// when user reaches land, open explore
			
			var position = this.$element.position();
			
			this.triggers.landToOrbit = _s.navigator.addTrigger( this.StartOrbiting, {
				context: this,
				yMax: position.top,
				once: true
			} );
			/*
			this.triggers.landToExplore = _s.navigator.addTrigger( this.StartExploring, {
				context: this,
				yMax: position.top,
				once: true
			} );
			*/
			
			this.onLandingStarted.dispatch( this );
			
		}
		
		return this;
		
	}
	
	function StopLanding () {
		
		this.StopExploring();
		
		if ( this.landing !== false ) {
			
			this.$land.hide();
			
			_s.navigator
				.removeTrigger( this.triggers.landToExplore )
				.removeTrigger( this.triggers.landToOrbit );
				//.setRangeElement();
			
			_ui.OnContentChanged( this.$element );
			
			this.landing = false;
			
		}
		
		return this;
		
	}
	
	/*===================================================
	
	exploring
	
	=====================================================*/
	
	function ToggleExploring () {
		/*
		if ( this.exploring === true ) {
			
			this.StopExploring();
			
		}
		else {
			
			this.StartExploring();
			
		}
		*/
		return this;
		
	}
	
	function StartExploring () {
		/*
		this.StartLanding();
		
		if ( this.exploring !== true ) {
			
			this.exploring = true;
			
			this.$explore.show();
			
			_ui.OnContentChanged( this.$element );
			
			this.onExploringStarted.dispatch( this );
			
		}
		*/
		return this;
		
	}
	
	function StopExploring () {
		/*
		if ( this.exploring !== false ) {
			
			this.$explore.hide();
			
			_ui.OnContentChanged( this.$element );
			
			this.exploring = false;
			
		}
		*/
		return this;
		
	}
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_section.Instance = Section;
	_section.Instance.prototype.constructor = _section.Instance;
	
	_section.Instance.prototype.ToOrbit = ToOrbit;
	_section.Instance.prototype.StartOrbiting = StartOrbiting;
	_section.Instance.prototype.ToggleLanding = ToggleLanding;
	_section.Instance.prototype.StartLanding = StartLanding;
	_section.Instance.prototype.StopLanding = StopLanding;
	_section.Instance.prototype.ToggleExploring = ToggleExploring;
	_section.Instance.prototype.StartExploring = StartExploring;
	_section.Instance.prototype.StopExploring = StopExploring;
	
	return _section;
	
} );