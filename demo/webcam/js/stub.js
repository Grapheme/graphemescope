$(function() {
 var streaming = false,
      video        = document.querySelector('#video'),
      canvas       = document.querySelector('#canvas'),
      photo        = document.querySelector('#photo'),
      width = 320,
      height = 0;

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
      height = video.videoHeight / (video.videoWidth/width);
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;

    }
  }, false);

  function takepicture() {
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0, width, height);

    var image = new Image();
    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);

    scope.setImage(photo);
  }


    window.leapEnabled = false;

	var container = $("#container");

    window.scope = new Graphemescope( container[0] );

    var dragdrop = new DragDrop(container[0],  function (files) {
        var filter = /^image/i;
        var file = files[0];

        if(filter.test(file.type)) {
            var reader = new FileReader();
            reader.onload = function(event) {
                var img = new Image();
                img.src = event.target.result;
                scope.kaleidoscope.setImage(img);
            };

            reader.readAsDataURL(file);
        } 
      
    });

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
            scope.kaleidoscope.angleTarget = factorx;
            scope.kaleidoscope.zoomTarget  = 1.0 + 0.5 * factory;
        }
    });

    $(window).click(takepicture);

    var resizeHandler = function() {
        container.height( $(window).height() );
        container.width( $(window).width() );
    };

	$(window).resize(resizeHandler);
	$(window).resize();

    var throttledChange = _(changePicture).throttle(1000, {leading: false});


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

              scope.kaleidoscope.zoomTarget  = 1.0 + 1.0 * handPos[1];
              scope.kaleidoscope.angleTarget = handPos[0];
          } 

          if(frame.gestures && frame.gestures.length > 0) {
            var gesture = frame.gestures[0];

            if(gesture.type === "swipe") {
                var startPos = leapToScene(frame, gesture.startPosition );
                var pos = leapToScene( frame, gesture.position );
    
                if(startPos[0] - pos[0] < 0) {
                    console.log("Swipe event");
                    throttledChange();
                }
            }
          }
        }
    });
});
