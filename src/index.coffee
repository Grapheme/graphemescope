$ ->
    container = document.getElementById "container"    
    

    # Init kaleidoscope
    kaleidoscope = new Kaleidoscope( container )

    # Init Drag'n'Drop 
    dragdrop = new DragDrop container, /^image/i, (result) ->
        img = new Image
        img.src = result
        kaleidoscope.image = img

    draw = ->
        # do kaleidoscope.update()
        do kaleidoscope.draw()

    setInterval draw, 1000 / 30

    image = new Image()
    image.src = "http://media-cache-ak0.pinimg.com/736x/4a/77/ab/4a77aba8f172f67c5b34ca672f2f17a2.jpg"
    image.onload = ->
        kaleidoscope.image = image

    resizeHandler = ->
        $("#container").height( $(window).height() )
        $("#container").width( $(window).width() )

    $(window).mousemove (event) ->
        factorx = event.pageX / $(window).width()
        factory = event.pageY / $(window).height()

        #kaleidoscope.zoomFactor  = 0.9 + 2.0*factorx 
        kaleidoscope.angleFactor = factorx 

    $(window).resize resizeHandler
    $(window).resize()
