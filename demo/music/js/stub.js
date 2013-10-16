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
      if(!AudioAnalyser.supported) return;

      if( scope.analyser.isPaused() ) {
        scope.analyser.play();
      } else {
        scope.analyser.pause();
      }
    });

    function moveKaleidoscope(factorx, factory) {
        if(!AudioAnalyser.supported || scope.analyser.isPaused()) {
            scope.kaleidoscope.angleTarget = factorx;
            scope.kaleidoscope.zoomTarget  = 1.0 + 0.5 * factory;
        }
    }

    $(window).mousemove(function(event) {
        moveKaleidoscope(
            event.pageX / $(window).width(),
            event.pageY / $(window).height()
        );
    });

    $(window).on("touchmove", function(evt) {
        evt.preventDefault();
        var originalEvent = evt.originalEvent;
        
        var touch = originalEvent.touches[0];  
        moveKaleidoscope(
            touch.pageX / $(window).width(),
            touch.pageY / $(window).height()
        );
    });

});
