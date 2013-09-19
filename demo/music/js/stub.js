	$(function() {
	var imagePath = "img/pattern.jpg";
    var musicPath = "audio/music.mp3";

	var container = $("#container");

	resizeHandler = function() {
		container.height( $(window).height() );
		container.width( $(window).width() );
	};

    $(window).resize(resizeHandler);
    $(window).resize();

    var scope = new Graphemescope(container[0], imagePath, musicPath);
    
  //   var kaleidoscope = new Kaleidoscope( container[0] );

  //   // Init Drag'n'Drop 
  //   var dragdrop = new DragDrop(container[0], /^image/i, function (result) {
  //   	var img = new Image();
  //       img.src = result;
  //       kaleidoscope.image = img;
  //   });
       
  //   setInterval(function() {
  //   	kaleidoscope.draw();
  //   }, 1000 / 30);

  //   var image = new Image();
  //   image.src = imagePath;
  //   image.onload = function() {
  //       kaleidoscope.image = image;
  //   };

  //   $(window).mousemove(function(event) {
		// var factorx = event.pageX / $(window).width();
		// var factory = event.pageY / $(window).height();

		// kaleidoscope.angleTarget = factorx;
		// kaleidoscope.zoomTarget  = 1.0 + 1.5 * factory;
  //   });

});
