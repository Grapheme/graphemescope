# Параметры движения 
#   offsetRotation: 0.0
#   offsetScale: 1.0
#   offsetX: 0.0
#   offsetY: 0.0
#   radius: 260
#   slices: 12
#   zoom: 1.0

window.Kaleidoscope = class Kaleidoscope  
  constructor: ( @parentElement = window.document.body ) ->      
    @domElement ?= document.createElement 'canvas'
    @ctx        ?= @domElement.getContext '2d'
    @image      ?= document.createElement 'img'
    
    @parentElement.appendChild @domElement
    
    window.onresize = () => do @resizeHandler
    do @resizeHandler

  resizeHandler : ->
    @width  = @domElement.width  = @parentElement.offsetWidth
    @height = @domElement.height = @parentElement.offsetHeight 

    @radius       = 0.2 * Math.min(@width, @height) 
    @radiusHeight = 0.5 * Math.sqrt(3) * @radius

  drawCell : ->
    @ctx.save()
    for cellIndex in [ 0..6 ]
      @ctx.save()
      @ctx.rotate cellIndex * 2 * Math.PI / 6
      @ctx.scale [-1, 1][ cellIndex % 2], 1
      @ctx.beginPath()

      @ctx.moveTo 0, 0
      @ctx.lineTo -0.5 * @radius, 1.0 * -@radiusHeight
      @ctx.lineTo  0.5 * @radius, 1.0 * -@radiusHeight
      @ctx.closePath()


      zoomFactor = 0.3
      @ctx.scale zoomFactor, zoomFactor

      @ctx.fill()
      @ctx.stroke()
      @ctx.restore()

    @ctx.restore()

  draw: ->
    @ctx.fillStyle = "#ff006c"
    @ctx.fillRect 0, 0, @width, @height

    @ctx.fillStyle = @ctx.createPattern @image, "repeat"
  

    @ctx.save()
    @ctx.translate 0.5 * @width, 0.5 * @height


    verticalLimit   = Math.ceil(0.5 * @height / @radiusHeight)
    horizontalLimit = Math.ceil(0.5 * @width  / (3 * @radius)) 
    
    horizontalStrype = [-horizontalLimit .. horizontalLimit]
    verticalStrype   = [-verticalLimit .. verticalLimit]

    for v in verticalStrype
      @ctx.save()

      @ctx.translate 0, @radiusHeight * v
      
      if (Math.abs(v) % 2)
        @ctx.translate 1.5*@radius, 0 
      
      for h in horizontalStrype 
        @ctx.save()
        @ctx.translate 3 * h * @radius, 0
        do @drawCell 
        @ctx.restore()

      @ctx.restore()  

    @ctx.restore()




