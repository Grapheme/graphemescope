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
      if( scope.analyser.paused ) {
        console.log("Play");
        scope.analyser.play();
      } else {
        console.log("Pause");
        scope.analyser.pause();
      }
    });
});
