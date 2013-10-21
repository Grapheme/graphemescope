
# Polyfill for requestAnimationFrame function
# http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
requestAnimFrame = (->
  window.requestAnimationFrame || 
  window.webkitRequestAnimationFrame || 
  window.mozRequestAnimationFrame || 
  (callback) ->
    window.setTimeout callback, (1000 / 30) 
)()

# Калейдоскоп
window.Graphemescope = class Graphemescope  
  constructor: ( @parentElement = window.document.body ) ->    
    @enabled = true  
    @radiusFactor = 1.0
    
    # Конкретные значения угла и увеличения (используются внутренне)
    # Меняются от 0 до 1 
    @zoomFactor   = 1.0
    @angleFactor  = 0.0

    # Значения угла и увеличения, доступные из интерфейса
    @zoomTarget  = 1.2
    @angleTarget = 0.8 

    # Настройки плавности движения
    @easeEnabled  = true
    @ease = 0.1

    @domElement ?= document.createElement "canvas"
    @ctx        ?= @domElement.getContext "2d"

    @alphaFactor = 1.0
    @alphaTarget = 1.0

    @parentElement.appendChild @domElement

    # Запоминаем старый обработчик события resize
    # TODO: сделать через addEventListener!
    @oldResizeHandler = () ->

    if window.onresize != null
      @oldResizeHandler = window.onresize

    window.onresize = () => do @resizeHandler
    do @resizeHandler

    requestAnimFrame => do @animationFrame

  animationFrame : ->
    requestAnimFrame => do @animationFrame
    if @enabled
      do @update
      do @draw

  # Обработчик resize события
  resizeHandler : ->
    @width  = @domElement.width  = @parentElement.offsetWidth
    @height = @domElement.height = @parentElement.offsetHeight 

    @radius       = 0.5 * @radiusFactor * Math.min(@width, @height) 
    @radiusHeight = 0.5 * Math.sqrt(3) * @radius

    do @oldResizeHandler

  # Функция обновления параметром (для изменения параметров движения)
  update: ->
    if @easeEnabled
      # Плавность включена
      @angleFactor += ( @angleTarget - @angleFactor ) * @ease
      @zoomFactor  += ( @zoomTarget  - @zoomFactor  ) * @ease
      @alphaFactor += ( @alphaTarget - @alphaFactor ) * @ease 
    else 
      # Плавность выключена
      @angleFactor = @angleTarget
      @zoomFactor  = @zoomTarget
      @alphaFactor = @alphaTarget

  # Функция рисует заданную картинку в центре правильного треугольника
  drawImage : (image) ->
    @ctx.save()

    # Cчитаем радиус описанной окружности
    outerRadius = 2 / 3 * @radiusHeight
    
    # Делаем масштабирование таким, что при zoomFactor = 1 картинка полностью оптимально
    # заполняет треугольник
    zoom = @zoomFactor * outerRadius / (0.5 * Math.min(image.width, image.height))

    # Помещаем центр вращения в центр треугольника, то есть в центр описанной окружности.
    # Центр лежит на высоте и делит ее в отношении 2/3
    @ctx.translate 0, outerRadius 
    @ctx.scale zoom, zoom
    @ctx.rotate @angleFactor * 2 * Math.PI
    @ctx.translate -0.5 * image.width, -0.5 * image.height

    @ctx.fill()
    @ctx.restore()

  # Функция рисует одну ячейку (соту) калейдоскопа в центре 
  # системы координат с радиусом @radius 
  drawCell : (image) ->
    # Сота состоит из 6 лепестков, каждый лепесток - 
    # равносторонний треугольник с радиусом @radius
    for cellIndex in [ 0...6 ]
      @ctx.save()
      @ctx.rotate(cellIndex * 2.0 * Math.PI / 6.0)

      # Каждый следующий лепесток отображаем зеркально
      @ctx.scale [-1, 1][ cellIndex % 2], 1
      @ctx.beginPath()

      # Рисуем правильный треугольник, вспоминая школьные формулы:
      # 1. В равнобедренном (то есть и в правильном треугольнике) высота есть и медиана
      # 2. Высота равна sqrt(3) / 2 стороны треугольника
      @ctx.moveTo 0, 0
      @ctx.lineTo -0.5 * @radius, 1.0 * @radiusHeight
      @ctx.lineTo  0.5 * @radius, 1.0 * @radiusHeight
      @ctx.closePath()

      @drawImage image

      @ctx.restore()

  # Функция отрисовки
  drawLayer: (image) ->
    @ctx.save()

    # Перемещаемся в центр
    @ctx.translate 0.5 * @width, 0.5 * @height

    # Вычисляем, сколько сот нужно рисовать
    # (не уверен, что формулы работают оптимально, но экран 
    # они покрывают)
    verticalLimit   =  Math.ceil(0.5 * @height / @radiusHeight)
    horizontalLimit =  Math.ceil(0.5 * @width  / (3 * @radius)) 
    
    horizontalStrype = [ -horizontalLimit .. horizontalLimit ]
    verticalStrype   = [ -verticalLimit .. verticalLimit ]

    for v in verticalStrype
      @ctx.save()
      @ctx.translate 0, @radiusHeight * v
      
      # Сдвиг у нечетных слоев
      if (Math.abs(v) % 2)
        @ctx.translate 1.5 * @radius, 0 
      
      for h in horizontalStrype 
        @ctx.save()
        
        @ctx.translate 3 * h * @radius, 0
        @drawCell image 

        @ctx.restore()

      @ctx.restore()  
    @ctx.restore()

  # Главная функция отрисовки
  draw : ->
    if @imageProxy?
      @ctx.fillStyle   = @patternProxy
      @ctx.globalAlpha = 1 - @alphaFactor
      @drawLayer @imageProxy

    if @image?    
      @ctx.fillStyle   = @pattern
      @ctx.globalAlpha = @alphaFactor  
      @drawLayer @image

  # Меняет картинку калейдоскопа напрямую (предполагается, что объект уже загружен)
  setImageDirect : (image) ->
    if @image?
      @imageProxy = @image
      @patternProxy = @pattern 

    @image = image
    @pattern = @ctx.createPattern @image, "repeat"

    @alphaFactor = 0.0

  # Меняет картинку калейдоскопа
  setImage : (image) ->
    if typeof image is "string"
      # Аргумент - это строка с адресом картинки
      imageElement     = new Image()
      imageElement.src = image
      imageElement.onload = =>
          @setImageDirect imageElement
    else
      @setImageDirect image



