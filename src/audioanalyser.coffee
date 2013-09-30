class AudioElement 
  constructor : (@context, src, callback) ->
    @audio          = new Audio()
    @audio.controls = yes
    @audio.src      = src

    @fadeDuration = 500

    document.body.appendChild @audio
    @audio.style.visibility = "hidden"

    # circumvent http://crbug.com/112368
    @audio.addEventListener 'canplay', =>  
      @initialized = true

      @source = @context.createMediaElementSource @audio
      @gainNode = @context.createGain()
      @gainNode.gain.value = 1.0

      @source.connect @gainNode
      @gainNode.connect @context.destination  
      do callback

  # Остановка трека сейчас происходит по таймауту, который не обязан
  # соответствовать виртуальному времени контекста WebAudio!
  # TODO: отлавливать это правильно! 
  clearTimeout : ->
    if @stopTimeout?
      clearTimeout @stopTimeout
      @stopTimeout = undefined

  play : ->
    do @clearTimeout

    @audio.play()
    currTime = @context.currentTime
    if @gainNode?
      @gainNode.gain.linearRampToValueAtTime 0, currTime
      @gainNode.gain.linearRampToValueAtTime 1, currTime + @fadeDuration / 1000

  pause : ->
    do @clearTimeout

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

    @paused = true
  
    @jsNode.onaudioprocess = =>
      # retreive the data from the first channel
      @analyser.getByteFrequencyData @bands

      # fire callback
      @onUpdate? @bands if not @paused

  setAudio : (src) ->
    @current?.pause()

    current = @current = new AudioElement @context, src, =>
      current.gainNode.connect @analyser
      @play()

  play : ->
    @paused = false
    @current?.play()

  pause : ->
    @paused = true
    @current?.pause()


