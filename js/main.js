requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    paths: {
        app: '../app'
    }
});

require( [
    "greensock/TweenMax",
    "jquery.superscrollorama"
],
function () {
    
    var controller = $.superscrollorama();
    var $window = $( window );
    
    controller.addTween(
    	'#earth',
		(new TimelineLite())
			.append([
				TweenMax.fromTo($('#earth .background'), 1, 
    				{css:{top: "10%"}, immediateRender:true}, 
					{css:{top: "-10%"}}),
    			TweenMax.fromTo($('#earth .middleground'), 1,
    				{css:{top: "25%"}, immediateRender:true}, 
					{css:{top: "-25%"}}),
				TweenMax.fromTo($('#earth .foreground'), 1,
    				{css:{top: "100%"}, immediateRender:true}, 
					{css:{top: "-60%"}})
			]),
		1000 // scroll duration of tween
	);
    
    $window.trigger( 'scroll' );
    
    $window.on( 'resize', OnWindowResize );
    OnWindowResize();
    
    function OnWindowResize () {
        
        var w = $window.width();
        var h = $window.height();
        
        $( "#system" ).find( "section" ).css( {
            "min-width": w,
            "min-height": h
        } );
        
    }
    
} );