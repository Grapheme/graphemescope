$(function() {

    VK.init({
        apiId: 3300222
    });

    function authInfo(response) {
        if (response.session) {
            $('#login_button').hide();
            apiInitialized();
        } 
    }

    VK.Auth.getLoginStatus(authInfo);
    VK.UI.button('login_button');

    $('#login_button').click(function() {
        VK.Auth.login(authInfo);
    });
    

    function changeResources(imageSrc, musicSrc, callback) {
        var image = new Image();
        image.src = imageSrc;
        image.onload = function() {
            kaleidoscope.image = image;
        };

        callback();
    }

    function apiInitialized() {
        var container = $("#container");

        resizeHandler = function() {
            container.height( $(window).height() );
            container.width( $(window).width() );
        };

        window.kaleidoscope = new Kaleidoscope( container[0] );

        setInterval(function() {
            kaleidoscope.draw();
        }, 1000 / 30);


        function getNext(index) {
            ++index;

            (function() {
            VK.Api.call('wall.get', {
                offset : index,
                count  : 1,
                filter : 'owner'
            }, function(r) {   
                if(!(r.response && r.response[1] && r.response[1].attachments)) {
                    return getNext(index);
                }   

                var att = r.response[1].attachments;

                var photos = _(att).chain()
                    .filter(function(a) {
                        return (a.type === 'photo');
                    })
                    .map(function(a) {
                        return a.photo.src_xbig;
                    })
                    .shuffle()
                    .value();

                var music = _(att).chain()
                    .filter(function(a) {
                        return (a.type == 'audio');
                    })
                    .map(function(a) {
                        return a.audio.url;
                    })
                    .shuffle()
                    .value();

                if(photos.length <= 0 || music.length <= 0) {
                    return getNext(index);
                }

                var imageSrc = photos[0];
                var musicSrc = music[0];


                changeResources(imageSrc, musicSrc, function() {
                    setTimeout(function() {
                        getNext(index);
                    }, 2000);
                })
            });
        
            })();
        }

        getNext(-1);

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
