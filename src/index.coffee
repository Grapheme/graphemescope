window.KaleidoscopeMagic = (container, imageSource, audioSource) ->
    # Init kaleidoscope
    kaleidoscope = new Kaleidoscope( container )

    # Init Drag'n'Drop 
    dragdrop = new DragDrop container, /^image/i, (result) ->
        img = new Image
        img.src = result
        kaleidoscope.image = img

    draw = ->
        do kaleidoscope.draw

    setInterval draw, 1000 / 30

    image = new Image()
    image.src = imageSource
    image.onload = ->
        kaleidoscope.image = image

    NUM_BANDS = 32
    SMOOTHING = 0.8

    analyzeCallback = (data) ->
        primaryIndex = 8
        primaryBeat = ( 
            + 0.1 * data[primaryIndex - 3]
            + 0.5 * data[primaryIndex - 2]
            + 0.9 * data[primaryIndex - 1] 
            + 1.0 * data[primaryIndex]
            + 0.9 * data[primaryIndex + 1]
            + 0.5 * data[primaryIndex + 2]
            + 0.1 * data[primaryIndex + 3]
        )

        secondaryIndex = 20
        secondaryBeat = ( 
            + 0.1 * data[secondaryIndex - 3]
            + 0.5 * data[secondaryIndex - 2]
            + 0.9 * data[secondaryIndex - 1] 
            + 1.0 * data[secondaryIndex]
            + 0.9 * data[secondaryIndex + 1]
            + 0.5 * data[secondaryIndex + 2]
            + 0.1 * data[secondaryIndex + 3]
        )

        kaleidoscope.zoomFactor = 1.0 + primaryBeat / 30
        kaleidoscope.angleFactor = secondaryBeat / 30

    $(window).mousemove (event) ->

        factorx = event.pageX / $(window).width()
        factory = event.pageY / $(window).height()

        kaleidoscope.angleFactor = factorx
        kaleidoscope.zoomFactor  = 1.0 + factory

    # setup the audio analyser
    analyser = new AudioAnalyser audioSource, NUM_BANDS, SMOOTHING

    analyser.onUpdate = analyzeCallback

    # start as soon as the audio is buffered
    analyser.start();

    # show audio controls
    document.body.appendChild analyser.audio
