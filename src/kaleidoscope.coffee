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
    
    # Здесь нужно следить за старым обработчиком!
    window.onresize = () => do @resizeHandler
    do @resizeHandler

  # Обработчик resize события
  resizeHandler : ->
    @width  = @domElement.width  = @parentElement.offsetWidth
    @height = @domElement.height = @parentElement.offsetHeight 

    @radius       = 0.4 * Math.min(@width, @height) 
    @radiusHeight = 0.5 * Math.sqrt(3) * @radius

  # Функция рисует одну ячейку (соту) калейдоскопа в центре 
  # системы координат с радиусом @radius 
  drawCell : ->
    @ctx.save()

    # Сота состоит из 6 лепестков, каждый лепесток - 
    # равносторонний треугольник с радиусом @radius
    for cellIndex in [ 0..6 ]
      @ctx.save()
      @ctx.rotate(cellIndex * 2.0 * Math.PI / 6.0)

      # Каждый следующий лепесток отображаем зеркально
      @ctx.scale [-1, 1][ cellIndex % 2], 1
      @ctx.beginPath()

      @ctx.moveTo 0, 0
      @ctx.lineTo -0.5 * @radius, 1.0 * @radiusHeight
      @ctx.lineTo  0.5 * @radius, 1.0 * @radiusHeight
      @ctx.closePath()

      # TODO: фиксить здесь!
      zoomFactor = 0.3
      @ctx.translate( -@radius * 0.5, 0)
      @ctx.scale zoomFactor, zoomFactor

      @ctx.fill()

      @ctx.restore()

    @ctx.restore()


  # Функция отрисовки
  draw: ->
    @ctx.fillStyle = @ctx.createPattern @image, "repeat"
    @ctx.save()

    # Перемещаемся в центр
    @ctx.translate 0.5 * @width, 0.5 * @height

    # Вычисляем, сколько сот нужно рисовать
    # (не уверен, что формулы работают оптимально, но экран 
    # они покрывают)
    verticalLimit   = Math.ceil(0.5 * @height / @radiusHeight)
    horizontalLimit = Math.ceil(0.5 * @width  / (3 * @radius)) 
    
    horizontalStrype = [-horizontalLimit .. horizontalLimit]
    verticalStrype   = [-verticalLimit .. verticalLimit]

    for v in verticalStrype
      @ctx.save()

      @ctx.translate 0, @radiusHeight * v
      
      # Сдвиг у нечетных слоев
      if (Math.abs(v) % 2)
        @ctx.translate 1.5 * @radius, 0 
      
      for h in horizontalStrype 
        @ctx.save()
        
        @ctx.translate 3 * h * @radius, 0
        do @drawCell 

        @ctx.restore()

      @ctx.restore()  
    @ctx.restore()




