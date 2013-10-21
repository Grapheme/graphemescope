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

    var Settings = function() {
      this.a = 2.0;
      this.b = 1.0;
      this.c = 20.0;
    };

    var settings = new Settings();

    var gui = new dat.GUI();

    gui.add(settings, 'a', 0.0, 60.0);    
    gui.add(settings, 'b', 0.0, 60.0);    
    gui.add(settings, 'c', 0.0, 60.0);


    var x = 1;
    var v = 0;
    var target = 0;
    var dt = 0.1;

    function moveScope() {
        var force = settings.a * (-x) + settings.b * (-v);
        v += force * dt;
        x += v * dt;


        scope.kaleidoscope.angleTarget = 0.2 * x;
        scope.kaleidoscope.zoomTarget  = 1.0 + 0.5 * x;


        $("#beat").css({
        "transform" : "translateX(" + 100 * x + "px)"
        });
    }

    setInterval(moveScope, 1000/45);

    var dancer = new Dancer();

    dancer.bind("loaded", function() {
        dancer.play();
    });

    var kick = dancer.createKick({
        //decay : 0.1,
        //threshold : 0.4,
        //frequency : [50, 60],
        onKick: function (a) {
            x = a;
        },
        offKick: function () {}
    }).on();

    dancer.load({ src: "music.mp3" });


    scope.setImage(imagePath);

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
