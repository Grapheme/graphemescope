$(function() {
	var imagePath = "http://media-cache-ak0.pinimg.com/736x/4a/77/ab/4a77aba8f172f67c5b34ca672f2f17a2.jpg";
	
	//var mp3Path   = "http://cs1-35v4.vk.me/p19/b11cb80e95acfe.mp3";
	var mp3Path = "http://cs1-25v4.vk.me/p22/85f7853f64955f.mp3";
	
	resizeHandler = function() {
		$("#container").height( $(window).height() );
		$("#container").width( $(window).width() );
	};

	$(window).resize(resizeHandler);
	$(window).resize();

	KaleidoscopeMagic($('#container')[0], imagePath, mp3Path);
});
