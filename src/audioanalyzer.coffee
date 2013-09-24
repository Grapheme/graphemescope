window.AudioAnalyser = class AudioAnalyser
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

    @audio.addEventListener 'ended', =>
      @onEnded?()
      @audio.currentTime = 0
      @audio.play()

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
