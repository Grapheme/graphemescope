(function() {


}).call(this);

(function() {
  var DragDrop,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.DragDrop = DragDrop = (function() {
    function DragDrop(context, filter, callback) {
      var disable;
      this.context = context;
      this.filter = filter;
      this.callback = callback;
      this.onDrop = __bind(this.onDrop, this);
      disable = function(event) {
        event.stopPropagation();
        return event.preventDefault();
      };
      this.context.addEventListener('dragleave', disable);
      this.context.addEventListener('dragenter', disable);
      this.context.addEventListener('dragover', disable);
      this.context.addEventListener('drop', this.onDrop, false);
    }

    DragDrop.prototype.onDrop = function(event) {
      var file, reader,
        _this = this;
      event.stopPropagation();
      event.preventDefault();
      file = event.dataTransfer.files[0];
      if (this.filter.test(file.type)) {
        reader = new FileReader;
        reader.onload = function(event) {
          return typeof _this.callback === "function" ? _this.callback(event.target.result) : void 0;
        };
        return reader.readAsDataURL(file);
      }
    };

    return DragDrop;

  })();

}).call(this);

(function() {
  $(function() {
    var container, dragdrop, draw, image, kaleidoscope, resizeHandler;
    container = document.getElementById("container");
    kaleidoscope = new Kaleidoscope(container);
    dragdrop = new DragDrop(container, /^image/i, function(result) {
      var img;
      img = new Image;
      img.src = result;
      return kaleidoscope.image = img;
    });
    draw = function() {
      return kaleidoscope.draw()();
    };
    setInterval(draw, 1000 / 30);
    image = new Image();
    image.src = "http://media-cache-ak0.pinimg.com/736x/4a/77/ab/4a77aba8f172f67c5b34ca672f2f17a2.jpg";
    image.onload = function() {
      return kaleidoscope.image = image;
    };
    resizeHandler = function() {
      $("#container").height($(window).height());
      return $("#container").width($(window).width());
    };
    $(window).mousemove(function(event) {
      var factorx, factory;
      factorx = event.pageX / $(window).width();
      factory = event.pageY / $(window).height();
      return kaleidoscope.angleFactor = factorx;
    });
    $(window).resize(resizeHandler);
    return $(window).resize();
  });

}).call(this);

(function() {
  var Kaleidoscope;

  window.Kaleidoscope = Kaleidoscope = (function() {
    function Kaleidoscope(parentElement) {
      var _this = this;
      this.parentElement = parentElement != null ? parentElement : window.document.body;
      this.radiusFactor = 1.0;
      this.zoomFactor = 1.0;
      this.angleFactor = 0.0;
      if (this.domElement == null) {
        this.domElement = document.createElement('canvas');
      }
      if (this.ctx == null) {
        this.ctx = this.domElement.getContext('2d');
      }
      if (this.image == null) {
        this.image = document.createElement('img');
      }
      this.parentElement.appendChild(this.domElement);
      this.oldResizeHandler = function() {};
      if (window.onresize !== null) {
        this.oldResizeHandler = window.onresize;
      }
      window.onresize = function() {
        return _this.resizeHandler();
      };
      this.resizeHandler();
    }

    Kaleidoscope.prototype.resizeHandler = function() {
      this.width = this.domElement.width = this.parentElement.offsetWidth;
      this.height = this.domElement.height = this.parentElement.offsetHeight;
      this.radius = 0.5 * this.radiusFactor * Math.min(this.width, this.height);
      this.radiusHeight = 0.5 * Math.sqrt(3) * this.radius;
      return this.oldResizeHandler();
    };

    Kaleidoscope.prototype.drawCell = function() {
      var cellIndex, zoom, _i;
      this.ctx.save();
      for (cellIndex = _i = 0; _i <= 6; cellIndex = ++_i) {
        this.ctx.save();
        this.ctx.rotate(cellIndex * 2.0 * Math.PI / 6.0);
        this.ctx.scale([-1, 1][cellIndex % 2], 1);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-0.5 * this.radius, 1.0 * this.radiusHeight);
        this.ctx.lineTo(0.5 * this.radius, 1.0 * this.radiusHeight);
        this.ctx.closePath();
        zoom = this.zoomFactor * this.radius / Math.min(this.image.width, this.image.height);
        this.ctx.translate(-this.radius * 0.5, 0);
        this.ctx.scale(zoom, zoom);
        this.ctx.rotate(this.angleFactor * 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();
      }
      return this.ctx.restore();
    };

    Kaleidoscope.prototype.draw = function() {
      var h, horizontalLimit, horizontalStrype, v, verticalLimit, verticalStrype, _i, _j, _k, _l, _len, _len1, _results, _results1;
      this.ctx.fillStyle = this.ctx.createPattern(this.image, "repeat");
      this.ctx.save();
      this.ctx.translate(0.5 * this.width, 0.5 * this.height);
      verticalLimit = Math.ceil(0.5 * this.height / this.radiusHeight);
      horizontalLimit = Math.ceil(0.5 * this.width / (3 * this.radius));
      horizontalStrype = (function() {
        _results = [];
        for (var _i = -horizontalLimit; -horizontalLimit <= horizontalLimit ? _i <= horizontalLimit : _i >= horizontalLimit; -horizontalLimit <= horizontalLimit ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
      verticalStrype = (function() {
        _results1 = [];
        for (var _j = -verticalLimit; -verticalLimit <= verticalLimit ? _j <= verticalLimit : _j >= verticalLimit; -verticalLimit <= verticalLimit ? _j++ : _j--){ _results1.push(_j); }
        return _results1;
      }).apply(this);
      for (_k = 0, _len = verticalStrype.length; _k < _len; _k++) {
        v = verticalStrype[_k];
        this.ctx.save();
        this.ctx.translate(0, this.radiusHeight * v);
        if (Math.abs(v) % 2) {
          this.ctx.translate(1.5 * this.radius, 0);
        }
        for (_l = 0, _len1 = horizontalStrype.length; _l < _len1; _l++) {
          h = horizontalStrype[_l];
          this.ctx.save();
          this.ctx.translate(3 * h * this.radius, 0);
          this.drawCell();
          this.ctx.restore();
        }
        this.ctx.restore();
      }
      return this.ctx.restore();
    };

    return Kaleidoscope;

  })();

}).call(this);
