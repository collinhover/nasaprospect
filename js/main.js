requirejs.config({
    // by default load any module IDs from js/lib
    baseUrl: 'js/lib',
    // exceptions
    paths: {
        app: '../app'
    }
});

require(
[
	"jquery",
	"app/shared",
	"app/ui",
	"app/solarSystem",
	"overthrow",
    "jquery.superscrollorama.custom"
],
function ( $, _s, _ui, _solarSystem ) {
	
	var _de = _s.domElements;
	
	/*===================================================
	
	parallax
	
	=====================================================*/
    
	_de.$body.superscrollorama( "addTween", 
    	'#earth',
		(new TimelineLite())
			.append([
				TweenMax.fromTo($('#earth .orbit .background'), 1, 
    				{css:{top: "0%"}, immediateRender:true}, 
					{css:{top: "-10%"}}),
    			TweenMax.fromTo($('#earth .orbit .middleground'), 1,
    				{css:{top: "0%"}, immediateRender:true}, 
					{css:{top: "-30%"}}),
				TweenMax.fromTo($('#earth .orbit .foreground'), 1,
    				{css:{top: "0%"}, immediateRender:true}, 
					{css:{top: "-100%"}})
			]),
		"100%",
		"50%"
	);
	
	_de.$body.superscrollorama( "addTween", 
    	'#earth',
		(new TimelineLite())
			.append([
				TweenMax.fromTo($('#earth .land .background'), 1, 
    				{css:{top: "0%"}, immediateRender:true}, 
					{css:{top: "-10%"}}),
    			TweenMax.fromTo($('#earth .land .middleground'), 1,
    				{css:{top: "0%"}, immediateRender:true}, 
					{css:{top: "-25%"}}),
				TweenMax.fromTo($('#earth .land .foreground'), 1,
    				{css:{top: "0%"}, immediateRender:true}, 
					{css:{top: "-100%"}})
			]),
		"150%",
		"50%"
	);
    
} );