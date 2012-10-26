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
    "greensock/TweenMax",
    "jquery.superscrollorama.custom"
],
function ( $, _s ) {
	
	var _de = _s.domElements;
	
	/*===================================================
	
	parallax
	
	=====================================================*/
    
	_de.$body.superscrollorama( "addTween", 
    	'#earth',
		(new TimelineLite())
			.append([
				TweenMax.fromTo($('#earth .background'), 1, 
    				{css:{top: "0%"}, immediateRender:true}, 
					{css:{top: "-10%"}}),
    			TweenMax.fromTo($('#earth .middleground'), 1,
    				{css:{top: "0%"}, immediateRender:true}, 
					{css:{top: "-30%"}}),
				TweenMax.fromTo($('#earth .foreground'), 1,
    				{css:{top: "0%"}, immediateRender:true}, 
					{css:{top: "-100%"}})
			]),
		"100%",
		"50%"
	);
    
} );