// Drag-n-Drop helper
DragDrop = function(context, onDrop) {
  var disable = function( event ) {
    event.stopPropagation();
    event.preventDefault();
  };

  var dropHandler = function( event ) {
    disable(event);
    onDrop(event.dataTransfer.files);
  };

  context.addEventListener("dragleave", disable);
  context.addEventListener("dragenter", disable);
  context.addEventListener("dragover", disable);
  context.addEventListener("drop", dropHandler);
};
      