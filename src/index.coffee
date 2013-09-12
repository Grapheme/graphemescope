window.onload = ->
    console.log "App init"

    # Init kaleidoscope
    kaleidoscope = new Kaleidoscope( document.getElementById "container" )

    draw = -> do kaleidoscope.draw
    
    image = new Image()
    image.src = "http://media-cache-ak0.pinimg.com/736x/4a/77/ab/4a77aba8f172f67c5b34ca672f2f17a2.jpg"
    
    image.onload = ->
        kaleidoscope.image = image
        setInterval draw, 1000/30

    #cont = document.getElementById "container"

    # old = window.onresize 
    # window.onresize = ->
    #     cont.width  = window.innerWidth
    #     cont.height = window.innerHeight 
    #     do old


     ########################################################################
# # Audio Analyzer
# ########################################################################
# NUM_BANDS = 32
# SMOOTHING = 0.6
# MP3_PATH = 'http://cs1-41v4.vk.me/p23/6496f65050b272.mp3'


# ## Audio Analyzer by Justin Windle
# class AudioAnalyser
  
#   @AudioContext: self.AudioContext or self.webkitAudioContext
#   @enabled: @AudioContext?
  
#   constructor: ( @audio = new Audio(), @numBands = 256, @smoothing = 0.3 ) ->
  
#     # construct audio object
#     if typeof @audio is 'string'
      
#       src = @audio
#       @audio = new Audio()
#       @audio.controls = yes
#       @audio.src = src
  
#     # setup audio context and nodes
#     @context = new AudioAnalyser.AudioContext()
    
#     # JavaScriptNode so we can hook onto updates
#     @jsNode = @context.createJavaScriptNode 2048, 1, 1
    
#     # smoothed analyser with n bins for frequency-domain analysis
#     @analyser = @context.createAnalyser()
#     @analyser.smoothingTimeConstant = @smoothing
#     @analyser.fftSize = @numBands * 2
    
#     # persistant bands array
#     @bands = new Uint8Array @analyser.frequencyBinCount

#     # circumvent http://crbug.com/112368
#     @audio.addEventListener 'canplay', =>
    
#       # media source
#       @source = @context.createMediaElementSource @audio

#       # wire up nodes

#       @source.connect @analyser
#       @analyser.connect @jsNode

#       @jsNode.connect @context.destination
#       @source.connect @context.destination

#       # update each time the JavaScriptNode is called
#       @jsNode.onaudioprocess = =>

#         # retreive the data from the first channel
#         @analyser.getByteFrequencyData @bands
        
#         # fire callback
#         @onUpdate? @bands if not @audio.paused
        
#   start: ->
  
#     @audio.play()
    
#   stop: ->
  
#     @audio.pause()
