(function() {
  var AudioAnalyser;

  window.AudioAnalyser = AudioAnalyser = (function() {
    AudioAnalyser.AudioContext = self.AudioContext || self.webkitAudioContext;

    AudioAnalyser.enabled = AudioAnalyser.AudioContext != null;

    function AudioAnalyser(audio, numBands, smoothing) {
      var src,
        _this = this;
      this.audio = audio != null ? audio : new Audio();
      this.numBands = numBands != null ? numBands : 256;
      this.smoothing = smoothing != null ? smoothing : 0.3;
      if (typeof this.audio === 'string') {
        src = this.audio;
        this.audio = new Audio();
        this.audio.controls = true;
        this.audio.src = src;
      }
      this.context = new AudioAnalyser.AudioContext();
      this.jsNode = this.context.createJavaScriptNode(2048, 1, 1);
      this.analyser = this.context.createAnalyser();
      this.analyser.smoothingTimeConstant = this.smoothing;
      this.analyser.fftSize = this.numBands * 2;
      this.bands = new Uint8Array(this.analyser.frequencyBinCount);
      this.audio.addEventListener('ended', function() {
        _this.audio.currentTime = 0;
        return _this.audio.play();
      });
      this.audio.addEventListener('canplay', function() {
        _this.source = _this.context.createMediaElementSource(_this.audio);
        _this.source.connect(_this.analyser);
        _this.analyser.connect(_this.jsNode);
        _this.jsNode.connect(_this.context.destination);
        _this.source.connect(_this.context.destination);
        return _this.jsNode.onaudioprocess = function() {
          _this.analyser.getByteFrequencyData(_this.bands);
          if (!_this.audio.paused) {
            return typeof _this.onUpdate === "function" ? _this.onUpdate(_this.bands) : void 0;
          }
        };
      });
    }

    AudioAnalyser.prototype.start = function() {
      return this.audio.play();
    };

    AudioAnalyser.prototype.stop = function() {
      return this.audio.pause();
    };

    return AudioAnalyser;

  })();

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
  window.Graphemescope = function(container, imageSource, audioSource) {
    var NUM_BANDS, SMOOTHING, analyser, analyzeCallback, draw, image, kaleidoscope;
    kaleidoscope = new Kaleidoscope(container);
    draw = function() {
      return kaleidoscope.draw();
    };
    setInterval(draw, 1000 / 30);
    image = new Image();
    image.src = imageSource;
    image.onload = function() {
      return kaleidoscope.image = image;
    };
    NUM_BANDS = 32;
    SMOOTHING = 0.5;
    analyzeCallback = function(data) {
      var i, primaryBeat, secondaryBeat, windowCoeffs, _i, _j, _ref, _ref1;
      windowCoeffs = [0.1, 0.1, 0.8, 1.0, 0.8, 0.5, 0.1];
      for (i = _i = 0, _ref = windowCoeffs.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        primaryBeat = data[10 + i] * windowCoeffs[i];
      }
      for (i = _j = 0, _ref1 = windowCoeffs.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        secondaryBeat = data[0 + i] * windowCoeffs[i];
      }
      kaleidoscope.zoomTarget = 1.0 + primaryBeat / 10;
      return kaleidoscope.angleTarget = secondaryBeat / 50;
    };
    analyser = new AudioAnalyser(audioSource, NUM_BANDS, SMOOTHING);
    analyser.onUpdate = analyzeCallback;
    analyser.start();
    return document.body.appendChild(analyser.audio);
  };

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
      this.zoomTarget = 1.2;
      this.angleTarget = 0.8;
      this.easeEnabled = true;
      this.ease = 0.1;
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
        this.ctx.translate(0, 2 / 3 * this.radiusHeight);
        this.ctx.scale(zoom, zoom);
        this.ctx.rotate(this.angleFactor * 2 * Math.PI);
        this.ctx.translate(-0.5 * this.image.width, -0.5 * this.image.height);
        this.ctx.fill();
        this.ctx.restore();
      }
      return this.ctx.restore();
    };

    Kaleidoscope.prototype.update = function() {
      if (this.easeEnabled) {
        this.angleFactor += (this.angleTarget - this.angleFactor) * this.ease;
        return this.zoomFactor += (this.zoomTarget - this.zoomFactor) * this.ease;
      } else {
        this.angleFactor = this.angleTarget;
        return this.zoomFactor = this.zoomTarget;
      }
    };

    Kaleidoscope.prototype.draw = function() {
      var h, horizontalLimit, horizontalStrype, v, verticalLimit, verticalStrype, _i, _j, _k, _l, _len, _len1, _results, _results1;
      this.update();
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
