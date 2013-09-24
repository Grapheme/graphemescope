	$(function() {
	var imagePath = "img/pattern.jpg";

	var container = $("#container");

	resizeHandler = function() {
		container.height( $(window).height() );
		container.width( $(window).width() );
	};

    var kaleidoscope = new Kaleidoscope( container[0] );

    // Init Drag'n'Drop 
    var dragdrop = new DragDrop(container[0],  function (files) {
        var filter = /^image/i;
        var file = files[0];

        if(filter.test(file.type)) {
            var reader = new FileReader();
            reader.onload = function(event) {
                var img = new Image();
                img.src = event.target.result;
                kaleidoscope.setImage(img);
            };

            reader.readAsDataURL(file);
        } 
      
    });


    setTimeout(function() {
        var img = new Image();
        img.src = "img/pattern-change.jpg";
        kaleidoscope.setImage(img);
    }, 3000);
       
    setInterval(function() {
    	kaleidoscope.draw();
    }, 1000 / 30);

    var image = new Image();
    image.src = imagePath;
    image.onload = function() {
        kaleidoscope.setImage(image);
    };

    $(window).mousemove(function(event) {
		var factorx = event.pageX / $(window).width();
		var factory = event.pageY / $(window).height();

		kaleidoscope.angleTarget = factorx;
		kaleidoscope.zoomTarget  = 1.0 + 0.5 * factory;
    });

	$(window).resize(resizeHandler);
	$(window).resize();
});
