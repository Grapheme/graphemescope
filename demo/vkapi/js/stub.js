$(function() {

    VK.init({
        apiId: 3300222
    });

    window.authInfo = function authInfo(response) {
        if (response.session) {
            $('#login_button').hide();
            apiInitialized();
        } 
    }
    VK.Auth.getLoginStatus(authInfo);
    VK.UI.button('login_button');


    function apiInitialized() {
        var container = $("#container");

        resizeHandler = function() {
            container.height( $(window).height() );
            container.width( $(window).width() );
        };

        var kaleidoscope = new Kaleidoscope( container[0] );

        setInterval(function() {
            kaleidoscope.draw();
        }, 1000 / 30);


        VK.Api.call('wall.get', {
            offset : 0,
            count  : 1,
            filter : 'owner'

        }, function(r) {   
            if(r.response) {     
                var imageSrc = r.response[1].attachments[0].photo.src_xbig;

                console.log(r.response[1].attachments[0].photo);

                var image = new Image();
                image.src = imageSrc;
                image.onload = function() {
                    kaleidoscope.image = image;
                };


            }  
         });

          $(window).mousemove(function(event) {
        var factorx = event.pageX / $(window).width();
        var factory = event.pageY / $(window).height();


        kaleidoscope.angleTarget = factorx;
        kaleidoscope.zoomTarget  = 1.0 + 1.0 * factory;
    });



        $(window).resize(resizeHandler);
        $(window).resize();


    } 



});
