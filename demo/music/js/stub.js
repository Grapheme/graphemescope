window.addEventListener("load", function() {
  	var imagePath = "img/pattern.jpg";
    var musicPath = "audio/music.mp3";

  	var container = $("#container");

  	resizeHandler = function() {
  		container.height( $(window).height() );
  		container.width( $(window).width() );
  	};

    $(window).resize(resizeHandler);
    $(window).resize();

    var scope = new Graphemescope(container[0]);
    scope.setImage(imagePath);
    scope.setAudio(musicPath);

    $(container).click(function() {
      if( scope.analyser.isPaused() ) {
        scope.analyser.play();
      } else {
        scope.analyser.pause();
      }
    });

    $(window).mousemove(function(event) {
      var factorx = event.pageX / $(window).width();
      var factory = event.pageY / $(window).height();

      if(scope.analyser.track.paused) {
          scope.kaleidoscope.angleTarget = factorx;
          scope.kaleidoscope.zoomTarget  = 1.0 + 0.5 * factory;
      }
    });
});
