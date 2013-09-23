window.Graphemescope = (container, imageSource, audioSource) ->
    # Init kaleidoscope
    kaleidoscope = new Kaleidoscope( container )

    draw = ->
        do kaleidoscope.draw

    setInterval draw, 1000 / 30

    image = new Image()
    image.src = imageSource
    image.onload = ->
        kaleidoscope.image = image

    NUM_BANDS = 32
    SMOOTHING = 0.5

    analyzeCallback = (data) ->
        windowCoeffs = [0.1, 0.1, 0.8, 1.0, 0.8, 0.5, 0.1];

        primaryBeat   = (data[10 + i] * windowCoeffs[i]) for i in [0...windowCoeffs.length] 
        secondaryBeat = (data[0  + i] * windowCoeffs[i]) for i in [0...windowCoeffs.length]  
        
        kaleidoscope.zoomTarget = 1.0 + primaryBeat / 10
        kaleidoscope.angleTarget = secondaryBeat    / 50

    # setup the audio analyser
    analyser = new AudioAnalyser audioSource, NUM_BANDS, SMOOTHING

    analyser.onUpdate = analyzeCallback

    # start as soon as the audio is buffered
    analyser.start();

    # show audio controls
    document.body.appendChild analyser.audio
