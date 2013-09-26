window.Graphemescope = (container, imageSource, audioSource) ->
    # Init kaleidoscope
    kaleidoscope = new Kaleidoscope( container )

    image = new Image()
    image.src = imageSource
    image.onload = ->
        kaleidoscope.setImage(image)

    analyzeCallback = (data) ->
        windowCoeffs = [0.1, 0.1, 0.8, 1.0, 0.8, 0.5, 0.1];

        primaryBeat   = (data[10 + i] * windowCoeffs[i]) for i in [0...windowCoeffs.length] 
        secondaryBeat = (data[0  + i] * windowCoeffs[i]) for i in [0...windowCoeffs.length]  
        
        kaleidoscope.zoomTarget = 1.0 + primaryBeat / 10
        kaleidoscope.angleTarget = secondaryBeat    / 50

    # setup the audio analyser
    analyser = new AudioAnalyser

    analyser.onUpdate = analyzeCallback
    analyser.setAudio( audioSource )

    return {
        kaleidoscope : kaleidoscope
        analyser     : analyser
    }