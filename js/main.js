requirejs.config({
    // by default load any module IDs from js/lib
    baseUrl: 'js/lib',
    // exceptions
    paths: {
        app: '../app'
    },
    shim: {
        'soundmanager2': {
            exports: 'soundManager'
        }
    }
});

// sound manager has odd loading structure, so handle it first

require(
[
	"soundmanager2"
],
function ( soundManager ) {
	
	soundManager.setup( {
		url: 'swf/',
		flashVersion: 9,
		onready: function() {
			
			// start app
			
			require(
			[
				"jquery",
				"app/shared",
				"app/ui",
				"app/solarSystem",
				"overthrow"
			],
			function ( $, _s, _ui, _solarSystem ) {
				
				var _de = _s.domElements;
				
			} );
			
		},
		ontimeout: function() {
			
			// TODO: error message
			
		}
	} );
	
} );