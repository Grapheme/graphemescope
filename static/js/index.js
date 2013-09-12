(function() {


}).call(this);

(function() {
  var DragDrop,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.DragDrop = DragDrop = (function() {
    function DragDrop(callback, context, filter) {
      var disable;
      this.callback = callback;
      this.context = context != null ? context : document;
      this.filter = filter != null ? filter : /^image/i;
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
  window.onload = function() {
    var draw, image, kaleidoscope;
    console.log("App init");
    kaleidoscope = new Kaleidoscope(document.getElementById("container"));
    draw = function() {
      return kaleidoscope.draw();
    };
    image = new Image();
    image.src = "http://behance.vo.llnwd.net/profiles24/1527863/projects/6019601/88640bd21481ee461ae31285d725d47e.jpg";
    return image.onload = function() {
      kaleidoscope.image = image;
      return setInterval(draw, 1000 / 30);
    };
  };

}).call(this);

(function() {
  var Kaleidoscope;

  window.Kaleidoscope = Kaleidoscope = (function() {
    function Kaleidoscope(parentElement) {
      var _this = this;
      this.parentElement = parentElement != null ? parentElement : window.document.body;
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
      window.onresize = function() {
        return _this.resizeHandler();
      };
      this.resizeHandler();
    }

    Kaleidoscope.prototype.resizeHandler = function() {
      this.width = this.domElement.width = this.parentElement.offsetWidth;
      this.height = this.domElement.height = this.parentElement.offsetHeight;
      this.radius = 0.2 * Math.min(this.width, this.height);
      return this.radiusHeight = 0.5 * Math.sqrt(3) * this.radius;
    };

    Kaleidoscope.prototype.drawCell = function() {
      var cellIndex, zoomFactor, _i;
      this.ctx.save();
      for (cellIndex = _i = 0; _i <= 6; cellIndex = ++_i) {
        this.ctx.save();
        this.ctx.rotate(cellIndex * 2 * Math.PI / 6);
        this.ctx.scale([-1, 1][cellIndex % 2], 1);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-0.5 * this.radius, 1.0 * -this.radiusHeight);
        this.ctx.lineTo(0.5 * this.radius, 1.0 * -this.radiusHeight);
        this.ctx.closePath();
        zoomFactor = 0.3;
        this.ctx.scale(zoomFactor, zoomFactor);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
      }
      return this.ctx.restore();
    };

    Kaleidoscope.prototype.draw = function() {
      var h, horizontalLimit, horizontalStrype, v, verticalLimit, verticalStrype, _i, _j, _k, _l, _len, _len1, _results, _results1;
      this.ctx.fillStyle = "#ff006c";
      this.ctx.fillRect(0, 0, this.width, this.height);
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
