$(function() {
	var container = $("#container");

    scope = new Graphemescope( container[0] );

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

		scope.kaleidoscope.angleTarget = factorx;
		scope.kaleidoscope.zoomTarget  = 1.0 + 0.5 * factory;
    });

    $(window).click(changePicture);

    var resizeHandler = function() {
        container.height( $(window).height() );
        container.width( $(window).width() );
    };

	$(window).resize(resizeHandler);
	$(window).resize();
});
