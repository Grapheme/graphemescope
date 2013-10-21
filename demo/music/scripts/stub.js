window.addEventListener("load", function() {
  	var imagePath = "img/pattern.jpg";

  	var container = $("#container");

  	resizeHandler = function() {
  		container.height( $(window).height() );
  		container.width( $(window).width() );
  	};

    $(window).resize(resizeHandler);
    $(window).resize();


    var scope = new Graphemescope(container[0]);


    var x = 1;
    var v = 0;
    var target = 0;

    function moveScope() {
        var a = 4;
        var b = 1;
        var dt = 0.1;

        var force = a * (-x) + b * (-v);
        v += force * dt;
        x += v * dt;

        $("#beat").css({
        "transform" : "translateX(" + 100 * x + "px)"
        });
    }


    var dancer = new Dancer();

    dancer.bind("loaded", function() {
        dancer.play();
    });


    var kick = dancer.createKick({
        onKick: function (a) {
            x = a;
        },
        offKick: function () {}
    }).on();

    dancer.load({ src: "music.mp3" });


    scope.setImage(imagePath);


    var r = 0;

    dancer.after( 0, function() {
      var one = 0.15 * x;
      var two = 100 * this.getFrequency(32, 128);

      r += 0.1 * (two - r);



      scope.angleTarget = r;
      scope.zoomTarget  = 1.0 + 5.0 * one;

      moveScope();
    });

    $(container).click(function() {
      if(dancer.isPlaying()) {
        dancer.pause();
      } else {
        dancer.play();
      }
    });

    $(window).mousemove(function(event) {
      var factorx = event.pageX / $(window).width();
      var factory = event.pageY / $(window).height();
    });
});
