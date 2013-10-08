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
        @analyser.setAudio audio

    analyzeCallback: (data) ->
        primaryBeat = secondaryBeat = 0

        for i in [128...196]
            primaryBeat += (data[i] / 256)

        for i in [32...64]
            secondaryBeat += (data[i] / 256)
        
        @kaleidoscope.zoomTarget = 1.0 + 1.2 * @primarySignal.process primaryBeat
        @kaleidoscope.angleTarget = -0.5 + 0.5 * @secondarySignal.process secondaryBeat



       