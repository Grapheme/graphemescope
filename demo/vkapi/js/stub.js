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


    function changeResources(imageSrc, music, callback) {
        var image = new Image();
        image.src = imageSrc;
        image.onload = function() {
            kaleidoscope.image = image;
        };


        $('#music-title').text(music.artist + " - " + music.title);

        analyser.audio.src = music.url;

        analyser.audio.play();
    

        callback();
    }

    function apiInitialized() {
        var container = $("#container");


    container.click(function() {
        getNext(0);
    });

        resizeHandler = function() {
            container.height( $(window).height() );
            container.width( $(window).width() );
        };

        window.kaleidoscope = new Kaleidoscope( container[0] );

        setInterval(function() {
            kaleidoscope.draw();
        }, 1000 / 30);

        var NUM_BANDS = 32;
        var SMOOTHING = 0.5;

        var audioSource = 'https://www.dropbox.com/s/b9sob4lotzq8dru/b11cb80e95acfe.mp3?dl=1';

        var analyzeCallback = function(data) {
            var windowCoeffs = [0.1, 0.1, 0.8, 1.0, 0.8, 0.5, 0.1];

            var primaryBeat = 0;
            var secondaryBeat = 0;
            for(var i = 0; i < windowCoeffs.length; ++i) {
                primaryBeat += data[10 + i] * windowCoeffs[i];
                secondaryBeat += data[0  + i] * windowCoeffs[i]; 
            }
            // primaryBeat   = (data[10 + i] * windowCoeffs[i]) for i in [0...windowCoeffs.length] 
            // secondaryBeat = (data[0  + i] * windowCoeffs[i]) for i in [0...windowCoeffs.length]  
            
            kaleidoscope.zoomTarget = 1.0 + primaryBeat / 200;
            kaleidoscope.angleTarget = secondaryBeat    / 500
        };

        window.analyser = new AudioAnalyser(audioSource, NUM_BANDS, SMOOTHING);
        analyser.onUpdate = analyzeCallback;
        analyser.start();


        function getNext(index) {
            ++index;

            index = _.random(0, 200);

            (function() {
            VK.Api.call('wall.get', {
                offset : index,
                domain : 'molefrog',
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
                        return a.audio;
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
                      // getNext(index);
                    }, 60000);
                })
            });
        
            })();
        }

        getNext(0);




        $(window).mousemove(function(event) {
            var factorx = event.pageX / $(window).width();
            var factory = event.pageY / $(window).height();


            //kaleidoscope.angleTarget = factorx;
            //kaleidoscope.zoomTarget  = 1.0 + 1.0 * factory;
        });

        $(window).resize(resizeHandler);
        $(window).resize();
    } 



});
