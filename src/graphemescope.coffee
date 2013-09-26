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

    setImage : (image) ->
        if typeof image is "string"
            # Аргумент - это строка с адресом картинки
            imageElement     = new Image()
            imageElement.src = image
            imageElement.onload = =>
                @kaleidoscope.setImage imageElement
        else
            @kaleidoscope.setImage image

    setAudio : (audio) =>
        if not @analyser?
            @analyser = new AudioAnalyser( 32, 0.8 )

            @primarySignal   = new SignalNormalizer
            @secondarySignal = new SignalNormalizer 

            @analyser.onUpdate = (data) => @analyzeCallback(data)
        
        @analyser.setAudio audio

    analyzeCallback: (data) ->
        windowCoeffs = [0.1, 0.1, 0.8, 1.0, 0.8, 0.5, 0.1];

        primaryBeat = secondaryBeat = 0
        
        for i in [0...windowCoeffs.length] 
            primaryBeat   += (data[10 + i] * windowCoeffs[i]) 
            secondaryBeat += (data[0  + i] * windowCoeffs[i]) 
        
        @kaleidoscope.zoomTarget = 1.0 + 0.5 * @primarySignal.process primaryBeat
        @kaleidoscope.angleTarget = @secondarySignal.process secondaryBeat



       