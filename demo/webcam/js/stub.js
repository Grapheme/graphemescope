$(function() {
 var streaming    = false;
 var video        = document.querySelector('#video');
 var canvas       = document.querySelector('#canvas');

  navigator.getMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

  navigator.getMedia(
    {
      video: true,
      audio: false
    },
    function(stream) {
      if (navigator.mozGetUserMedia) {
        video.mozSrcObject = stream;
      } else {
        var vendorURL = window.URL || window.webkitURL;
        video.src = vendorURL.createObjectURL(stream);
      }
      video.play();
    },
    function(err) {
      console.log("An error occured! " + err);
    }
  );

  video.addEventListener('canplay', function(ev){
    if (!streaming) {
      canvas.setAttribute('width', video.videoWidth);
      canvas.setAttribute('height', video.videoHeight);
      streaming = true;
    }
  }, false);

  function takePicture() {
   if(streaming) {

      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      
      canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      var image = new Image();
      image.src = canvas.toDataURL('image/png');
      scope.setImage(image);
    }

  }


    window.leapEnabled = false;

	var container = $("#container");

    window.scope = new Graphemescope( container[0] );


    var index = 0;
    var imageCount = 4;

    function changePicture() {
        var imagePath = "img/pattern-" + index + ".jpg";

        scope.setImage(imagePath);

        index = (index + 1) % imageCount;
    }

    changePicture();

    $(window).mousemove(function(event) {
		var factorx = event.pageX / $(window).width();
		var factory = event.pageY / $(window).height();

        if(!leapEnabled) {
            scope.angleTarget = factorx;
            scope.zoomTarget  = 1.0 + 0.5 * factory;
        }
    });

    $(window).click(takePicture);

    var resizeHandler = function() {
        container.height( $(window).height() );
        container.width( $(window).width() );
    };

  	$(window).resize(resizeHandler);
  	$(window).resize();

    setInterval(takePicture, 5000);

    var throttledChange = _(takePicture).throttle(5000);


    var controller = new Leap.Controller({ enableGestures : true });


    controller.on('deviceDisconnected', function() {
        console.log("Leap Motion has been disconnected");
        leapEnabled = false;
    });

    controller.on('deviceConnected', function() {
        console.log("Leap Motion is connected");
        leapEnabled = true;
    });

    controller.on('ready', function() {
        console.log("Leap Motion is ready");
        leapEnabled = true;
    });


    function leapToScene( frame, leapPos ) {
      var iBox = frame.interactionBox;

      var left = iBox.center[0] - iBox.size[0]/2;
      var top = iBox.center[1] + iBox.size[1]/2;

      var x = leapPos[0] - left;
      var y = leapPos[1] - top;

      x /= iBox.size[0];
      y /= iBox.size[1];

      return [ x , -y ];
    }

    controller.loop(function(frame) {
        if (frame.valid) {
          if (typeof firstValidFrame === "undefined") {
            firstValidFrame = frame
          }

          if(frame.hands && frame.hands.length > 0) {
              var handPos = leapToScene( firstValidFrame , frame.hands[0].palmPosition );

              scope.zoomTarget  = 1.0 + 1.0 * handPos[1];
              if(scope.zoomTarget < 1.0) 
                scope.zoomTarget = 1.0;

              if(scope.zoomTarget > 1.6) 
                scope.zoomTarget = 1.6;


              scope.angleTarget = handPos[0];
          } 

          if(frame.gestures && frame.gestures.length > 0) {
            var gesture = frame.gestures[0];

            if(gesture.type === "circle") {
            //  throttledChange();
            }
          }
        }
    });
});
