class SignalNormalizer
    process : (value) ->
        if not @maxValue? or value > @maxValue
            @maxValue = value

        if @maxValue != 0
            value /= @maxValue
        value 


# Основной интерфейс библиотеки
window.Graphemescope = class Graphemescope 
    constructor : (@container) ->
        @kaleidoscope = new Kaleidoscope( @container )

        if AudioAnalyser.supported
            @analyser = new AudioAnalyser( 256, 0.5 )
            
            @primarySignal   = new SignalNormalizer
            @secondarySignal = new SignalNormalizer 

            @analyser.onUpdate = (data) => @analyzeCallback(data)
    
    setImage : (image) ->
        if typeof image is "string"
            # Аргумент - это строка с адресом картинки
            imageElement     = new Image()
            imageElement.src = image
            imageElement.onload = =>
                @kaleidoscope.setImage imageElement
        else
            @kaleidoscope.setImage image

    setAudio : (audio) ->
        if AudioAnalyser.supported
            @analyser.setAudio audio

    analyzeCallback: (data) ->
        primaryBeat = secondaryBeat = 0

        for i in [128...256]
            primaryBeat += (data[i] / 256)

        primaryBeat /= 128

        for i in [0...128]
            secondaryBeat += (data[i] / 256)

        secondaryBeat /= 128
        
        @kaleidoscope.zoomTarget = 1.0 + 1.0 *  primaryBeat
        @kaleidoscope.angleTarget = -0.5 + 0.5 * secondaryBeat



       