class AudioElement 
  constructor : (@context, src, callback) ->
    @audio          = new Audio()
    @audio.src      = src
    @audio.loop     = true

    @fadeDuration = 500

    document.body.appendChild @audio
    @audio.style.display = "none"

    # circumvent http://crbug.com/112368
    @audio.addEventListener "canplay", =>  
      @source = @context.createMediaElementSource @audio
      @gainNode = @context.createGain()
      @gainNode.gain.value = 1.0

      @source.connect @gainNode
      @gainNode.connect @context.destination  
      @paused = @audio.paused
      do callback

  clearTimeout : ->
    if @stopTimeout?
      clearTimeout @stopTimeout
      @stopTimeout = undefined

  play : ->
    do @clearTimeout

    @paused = false

    @audio.play()
    currTime = @context.currentTime
    if @gainNode?
      @gainNode.gain.linearRampToValueAtTime 0, currTime
      @gainNode.gain.linearRampToValueAtTime 1, currTime + @fadeDuration / 1000

  pause : ->
    do @clearTimeout

    @paused = true

    currTime = @context.currentTime

    if @gainNode?
      @gainNode.gain.linearRampToValueAtTime 1, currTime
      @gainNode.gain.linearRampToValueAtTime 0, currTime + @fadeDuration / 1000

    @stopTimeout = setTimeout =>
      @audio.pause()
    , @fadeDuration


window.AudioAnalyser = class AudioAnalyser
  @AudioContext: self.AudioContext or self.webkitAudioContext
  @supported: @AudioContext?
  
  constructor: (@numBands = 256, @smoothing = 0.3 ) ->
    # Создаем аудио-контекст (синглтон)
    @context = new AudioAnalyser.AudioContext()
    
    @analyser = @context.createAnalyser()
    @analyser.smoothingTimeConstant = @smoothing
    @analyser.fftSize = @numBands * 2    

    @bands = new Uint8Array @analyser.frequencyBinCount

    # JavaScriptNode so we can hook onto updates
    @jsNode = @context.createJavaScriptNode 2048, 1, 1

    @analyser.connect @jsNode
    @jsNode.connect @context.destination

    @currentId = 0

    @jsNode.onaudioprocess = =>
      # retreive the data from the first channel
      @analyser.getByteFrequencyData @bands

      # fire callback
      @onUpdate? @bands if not @isPaused()

  isPaused : ->
    if not @track?
      return true

    @track.paused

  setAudio : (src) ->
    @track?.pause()

    ++@currentId
    id = @currentId

    currentTrack = new AudioElement @context, src, =>
      if @currentId != id
        return  

      @track = currentTrack
      @track.gainNode.connect @analyser
      @play()

  play : ->
    @track?.play()

  pause : ->
    @track?.pause()


