########################################################################
# Kaleidoscope
########################################################################
class Kaleidoscope
  
  HALF_PI: Math.PI / 2
  TWO_PI: Math.PI * 2
  
  constructor: ( @options = {} ) ->
    
    @defaults =
      offsetRotation: 0.0
      offsetScale: 1.0
      offsetX: 0.0
      offsetY: 0.0
      radius: 260
      slices: 12
      zoom: 1.0
        
    @[ key ] = val for key, val of @defaults
    @[ key ] = val for key, val of @options
      
    @domElement ?= document.createElement 'canvas'
    @context ?= @domElement.getContext '2d'
    @image ?= document.createElement 'img'
    
  draw: ->
    
    @domElement.width = @domElement.height = @radius * 2
    @context.fillStyle = @context.createPattern @image, 'repeat'
    
    scale = @zoom * ( @radius / Math.min @image.width, @image.height )
    step = @TWO_PI / @slices
    cx = @image.width / 2

    for index in [ 0..@slices ]
      
      @context.save()
      @context.translate @radius, @radius
      @context.rotate index * step
      
      @context.beginPath()
      @context.moveTo -0.5, -0.5
      @context.arc 0, 0, @radius, step * -0.51, step * 0.51
      @context.lineTo 0.5, 0.5
      @context.closePath()
      
      @context.rotate @HALF_PI
      @context.scale scale, scale
      @context.scale [-1,1][index % 2], 1
      @context.translate @offsetX - cx, @offsetY
      @context.rotate @offsetRotation
      @context.scale @offsetScale, @offsetScale
      
      @context.fill()
      @context.restore()

# Drag & Drop
  
class DragDrop
  
  constructor: ( @callback, @context = document, @filter = /^image/i ) ->
    
    disable = ( event ) ->
      do event.stopPropagation
      do event.preventDefault
    
    @context.addEventListener 'dragleave', disable
    @context.addEventListener 'dragenter', disable
    @context.addEventListener 'dragover', disable
    @context.addEventListener 'drop', @onDrop, no
      
  onDrop: ( event ) =>
    
    do event.stopPropagation
    do event.preventDefault
      
    file = event.dataTransfer.files[0]
    
    if @filter.test file.type
      
      reader = new FileReader
      reader.onload = ( event ) => @callback? event.target.result
      reader.readAsDataURL file

# Init kaleidoscope
  
image = new Image
image.onload = => do kaleidoscope.draw
image.src = 'http://cl.ly/image/1X3e0u1Q0M01/cm.jpg'

kaleidoscope = new Kaleidoscope
  image: image
  slices: 20

kaleidoscope.domElement.style.position = 'absolute'
kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px'
kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px'
kaleidoscope.domElement.style.left = '50%'
kaleidoscope.domElement.style.top = '50%'
document.body.appendChild kaleidoscope.domElement
  
# Init drag & drop

dragger = new DragDrop ( data ) -> kaleidoscope.image.src = data
  
# Mouse events
  
tx = kaleidoscope.offsetX
ty = kaleidoscope.offsetY
tr = kaleidoscope.offsetRotation




########################################################################
# Audio Analyzer
########################################################################
NUM_BANDS = 32
SMOOTHING = 0.6
MP3_PATH = 'http://cs1-41v4.vk.me/p23/6496f65050b272.mp3'


## Audio Analyzer by Justin Windle
class AudioAnalyser
  
  @AudioContext: self.AudioContext or self.webkitAudioContext
  @enabled: @AudioContext?
  
  constructor: ( @audio = new Audio(), @numBands = 256, @smoothing = 0.3 ) ->
  
    # construct audio object
    if typeof @audio is 'string'
      
      src = @audio
      @audio = new Audio()
      @audio.controls = yes
      @audio.src = src
  
    # setup audio context and nodes
    @context = new AudioAnalyser.AudioContext()
    
    # JavaScriptNode so we can hook onto updates
    @jsNode = @context.createJavaScriptNode 2048, 1, 1
    
    # smoothed analyser with n bins for frequency-domain analysis
    @analyser = @context.createAnalyser()
    @analyser.smoothingTimeConstant = @smoothing
    @analyser.fftSize = @numBands * 2
    
    # persistant bands array
    @bands = new Uint8Array @analyser.frequencyBinCount

    # circumvent http://crbug.com/112368
    @audio.addEventListener 'canplay', =>
    
      # media source
      @source = @context.createMediaElementSource @audio

      # wire up nodes

      @source.connect @analyser
      @analyser.connect @jsNode

      @jsNode.connect @context.destination
      @source.connect @context.destination

      # update each time the JavaScriptNode is called
      @jsNode.onaudioprocess = =>

        # retreive the data from the first channel
        @analyser.getByteFrequencyData @bands
        
        # fire callback
        @onUpdate? @bands if not @audio.paused
        
  start: ->
  
    @audio.play()
    
  stop: ->
  
    @audio.pause()





########################################################################
# Initialization Stuff
########################################################################
  chart = d3.select("body")
    .append("div")    
    .attr("class", "chart")

  analyzeCallback = (data) ->
    maxData = d3.max(data)

    
    hx = data[20] / maxData - 0.5
    hy = data[20] / maxData - 0.5
                  
    tx = hx * kaleidoscope.radius * -2
    ty = hy * kaleidoscope.radius * 2
    tr = Math.atan2 hy, hx


    chart.selectAll("div")
      .data(data)
    .enter().append("div")

    chart.selectAll("div")
      .data(data)
      .style("height", (d) -> (100*d/maxData + 1).toFixed(0) + "px")

  # cx = window.innerWidth / 2
  # cy = window.innerHeight / 2
                
  # dx = event.pageX / window.innerWidth
  # dy = event.pageY / window.innerHeight
                


  # setup the audio analyser
  analyser = new AudioAnalyser MP3_PATH, NUM_BANDS, SMOOTHING

  # update particles based on fft transformed audio frequencies
  analyser.onUpdate = analyzeCallback

  # start as soon as the audio is buffered
  analyser.start();

  # show audio controls
  document.body.appendChild analyser.audio

                
# Init
  
options =
  interactive: yes
  ease: 0.1
                
do update = =>
                
  if options.interactive

    delta = tr - kaleidoscope.offsetRotation
    theta = Math.atan2( Math.sin( delta ), Math.cos( delta ) )
                
    kaleidoscope.offsetX += ( tx - kaleidoscope.offsetX ) * options.ease
    kaleidoscope.offsetY += ( ty - kaleidoscope.offsetY ) * options.ease
    kaleidoscope.offsetRotation += ( theta - kaleidoscope.offsetRotation ) * options.ease
    
    do kaleidoscope.draw
  
  setTimeout update, 1000/60