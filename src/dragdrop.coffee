window.DragDrop = class DragDrop
  
  constructor: (@context, @onDrop ) ->
    
    disable = ( event ) ->
      do event.stopPropagation
      do event.preventDefault
    
    @context.addEventListener 'dragleave', (event) =>
      disable event
      @onLeave? event

    @context.addEventListener 'dragenter', (event) =>
      disable event
      @onEnter? event

    @context.addEventListener 'dragover', (event) =>
      disable event 
      @onOver? event

    @context.addEventListener 'drop', (event) =>
      disable event
      @onDrop? event.dataTransfer.files
      