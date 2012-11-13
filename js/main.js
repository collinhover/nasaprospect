requirejs.config({
    // by default load any module IDs from js/lib
    baseUrl: 'js/lib',
    // exceptions
    paths: {
        app: '../app'
    }
});

// start app

require(
[
	"jquery",
	"app/shared",
	"app/ui",
	"app/solarSystem",
	"overthrow",
	"RequestAnimationFrame",
	"RequestInterval",
	"RequestTimeout"
],
function ( $, _s, _ui, _solarSystem ) {
	
	var _de = _s.domElements;
	
} );