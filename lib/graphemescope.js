(function() {
  var AudioAnalyser, AudioElement;

  AudioElement = (function() {
    function AudioElement(context, src, callback) {
      var _this = this;
      this.context = context;
      this.audio = new Audio();
      this.audio.controls = true;
      this.audio.src = src;
      this.fadeDuration = 500;
      document.body.appendChild(this.audio);
      this.audio.style.visibility = "hidden";
      this.audio.addEventListener('canplay', function() {
        _this.initialized = true;
        _this.source = _this.context.createMediaElementSource(_this.audio);
        _this.gainNode = _this.context.createGain();
        _this.gainNode.gain.value = 1.0;
        _this.source.connect(_this.gainNode);
        _this.gainNode.connect(_this.context.destination);
        return callback();
      });
    }

    AudioElement.prototype.clearTimeout = function() {
      if (this.stopTimeout != null) {
        clearTimeout(this.stopTimeout);
        return this.stopTimeout = void 0;
      }
    };

    AudioElement.prototype.play = function() {
      var currTime;
      this.clearTimeout();
      this.audio.play();
      currTime = this.context.currentTime;
      if (this.gainNode != null) {
        this.gainNode.gain.linearRampToValueAtTime(0, currTime);
        return this.gainNode.gain.linearRampToValueAtTime(1, currTime + this.fadeDuration / 1000);
      }
    };

    AudioElement.prototype.pause = function() {
      var currTime,
        _this = this;
      this.clearTimeout();
      currTime = this.context.currentTime;
      if (this.gainNode != null) {
        this.gainNode.gain.linearRampToValueAtTime(1, currTime);
        this.gainNode.gain.linearRampToValueAtTime(0, currTime + this.fadeDuration / 1000);
      }
      return this.stopTimeout = setTimeout(function() {
        return _this.audio.pause();
      }, this.fadeDuration);
    };

    return AudioElement;

  })();

  window.AudioAnalyser = AudioAnalyser = (function() {
    var _ref, _ref1;

    AudioAnalyser.AudioContext = self.AudioContext || self.webkitAudioContext;

    AudioAnalyser.supported = AudioAnalyser.AudioContext != null;

    function AudioAnalyser(numBands, smoothing) {
      var _this = this;
      this.numBands = numBands != null ? numBands : 256;
      this.smoothing = smoothing != null ? smoothing : 0.3;
      this.context = new AudioAnalyser.AudioContext();
      this.analyser = this.context.createAnalyser();
      this.analyser.smoothingTimeConstant = this.smoothing;
      this.analyser.fftSize = this.numBands * 2;
      this.bands = new Uint8Array(this.analyser.frequencyBinCount);
      this.jsNode = this.context.createJavaScriptNode(2048, 1, 1);
      this.analyser.connect(this.jsNode);
      this.jsNode.connect(this.context.destination);
      this.jsNode.onaudioprocess = function() {
        _this.analyser.getByteFrequencyData(_this.bands);
        if (!_this.paused) {
          return typeof _this.onUpdate === "function" ? _this.onUpdate(_this.bands) : void 0;
        }
      };
    }

    AudioAnalyser.prototype.setAudio = function(src) {
      var current, _ref,
        _this = this;
      if ((_ref = this.current) != null) {
        _ref.pause();
      }
      return current = this.current = new AudioElement(this.context, src, function() {
        current.gainNode.connect(_this.analyser);
        return current.play();
      });
    };

    AudioAnalyser.prototype.play = (_ref = AudioAnalyser.current) != null ? _ref.play() : void 0;

    AudioAnalyser.prototype.pause = (_ref1 = AudioAnalyser.current) != null ? _ref1.pause() : void 0;

    return AudioAnalyser;

  })();

}).call(this);

(function() {
  var DragDrop;

  window.DragDrop = DragDrop = (function() {
    function DragDrop(context, onDrop) {
      var disable,
        _this = this;
      this.context = context;
      this.onDrop = onDrop;
      disable = function(event) {
        event.stopPropagation();
        return event.preventDefault();
      };
      this.context.addEventListener('dragleave', function(event) {
        disable(event);
        return typeof _this.onLeave === "function" ? _this.onLeave(event) : void 0;
      });
      this.context.addEventListener('dragenter', function(event) {
        disable(event);
        return typeof _this.onEnter === "function" ? _this.onEnter(event) : void 0;
      });
      this.context.addEventListener('dragover', function(event) {
        disable(event);
        return typeof _this.onOver === "function" ? _this.onOver(event) : void 0;
      });
      this.context.addEventListener('drop', function(event) {
        disable(event);
        return typeof _this.onDrop === "function" ? _this.onDrop(event.dataTransfer.files) : void 0;
      });
    }

    return DragDrop;

  })();

}).call(this);

(function() {
  var Graphemescope, SignalNormalizer,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SignalNormalizer = (function() {
    function SignalNormalizer() {}

    SignalNormalizer.prototype.process = function(value) {
      if ((this.maxValue == null) || value > this.maxValue) {
        this.maxValue = value;
      }
      if (this.maxValue !== 0) {
        value /= this.maxValue;
      }
      return value;
    };

    return SignalNormalizer;

  })();

  window.Graphemescope = Graphemescope = (function() {
    function Graphemescope(container) {
      this.container = container;
      this.setAudio = __bind(this.setAudio, this);
      this.kaleidoscope = new Kaleidoscope(this.container);
    }

    Graphemescope.prototype.setImage = function(image) {
      var imageElement,
        _this = this;
      if (typeof image === "string") {
        imageElement = new Image();
        imageElement.src = image;
        return imageElement.onload = function() {
          return _this.kaleidoscope.setImage(imageElement);
        };
      } else {
        return this.kaleidoscope.setImage(image);
      }
    };

    Graphemescope.prototype.setAudio = function(audio) {
      var _this = this;
      if (this.analyser == null) {
        this.analyser = new AudioAnalyser(32, 0.8);
        this.primarySignal = new SignalNormalizer;
        this.secondarySignal = new SignalNormalizer;
        this.analyser.onUpdate = function(data) {
          return _this.analyzeCallback(data);
        };
      }
      return this.analyser.setAudio(audio);
    };

    Graphemescope.prototype.analyzeCallback = function(data) {
      var i, primaryBeat, secondaryBeat, windowCoeffs, _i, _ref;
      windowCoeffs = [0.1, 0.1, 0.8, 1.0, 0.8, 0.5, 0.1];
      primaryBeat = secondaryBeat = 0;
      for (i = _i = 0, _ref = windowCoeffs.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        primaryBeat += data[10 + i] * windowCoeffs[i];
        secondaryBeat += data[0 + i] * windowCoeffs[i];
      }
      this.kaleidoscope.zoomTarget = 1.0 + 0.5 * this.primarySignal.process(primaryBeat);
      return this.kaleidoscope.angleTarget = this.secondarySignal.process(secondaryBeat);
    };

    return Graphemescope;

  })();

}).call(this);

(function() {
  var Kaleidoscope, requestAnimFrame;

  requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
      return window.setTimeout(callback, 1000 / 24);
    };
  })();

  window.Kaleidoscope = Kaleidoscope = (function() {
    function Kaleidoscope(parentElement) {
      var _this = this;
      this.parentElement = parentElement != null ? parentElement : window.document.body;
      this.enabled = true;
      this.radiusFactor = 1.0;
      this.zoomFactor = 1.0;
      this.angleFactor = 0.0;
      this.zoomTarget = 1.2;
      this.angleTarget = 0.8;
      this.easeEnabled = true;
      this.ease = 0.1;
      if (this.domElement == null) {
        this.domElement = document.createElement("canvas");
      }
      if (this.ctx == null) {
        this.ctx = this.domElement.getContext("2d");
      }
      if (this.image == null) {
        this.image = document.createElement("img");
      }
      if (this.imageProxy == null) {
        this.imageProxy = document.createElement("img");
      }
      this.alphaFactor = 1.0;
      this.alphaTarget = 1.0;
      this.parentElement.appendChild(this.domElement);
      this.oldResizeHandler = function() {};
      if (window.onresize !== null) {
        this.oldResizeHandler = window.onresize;
      }
      window.onresize = function() {
        return _this.resizeHandler();
      };
      this.resizeHandler();
      requestAnimFrame(function() {
        return _this.animationFrame();
      });
    }

    Kaleidoscope.prototype.animationFrame = function() {
      var _this = this;
      requestAnimFrame(function() {
        return _this.animationFrame();
      });
      if (this.enabled) {
        this.update();
        return this.draw();
      }
    };

    Kaleidoscope.prototype.resizeHandler = function() {
      this.width = this.domElement.width = this.parentElement.offsetWidth;
      this.height = this.domElement.height = this.parentElement.offsetHeight;
      this.radius = 0.5 * this.radiusFactor * Math.min(this.width, this.height);
      this.radiusHeight = 0.5 * Math.sqrt(3) * this.radius;
      return this.oldResizeHandler();
    };

    Kaleidoscope.prototype.drawImage = function(image, alpha) {
      var zoom;
      this.ctx.save();
      zoom = this.zoomFactor * this.radius / Math.min(image.width, image.height);
      this.ctx.translate(0, 2 / 3 * this.radiusHeight);
      this.ctx.scale(zoom, zoom);
      this.ctx.rotate(this.angleFactor * 2 * Math.PI);
      this.ctx.translate(-0.5 * image.width, -0.5 * image.height);
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = this.ctx.createPattern(image, "repeat");
      this.ctx.fill();
      return this.ctx.restore();
    };

    Kaleidoscope.prototype.drawCell = function() {
      var cellIndex, _i;
      this.ctx.save();
      for (cellIndex = _i = 0; _i < 6; cellIndex = ++_i) {
        this.ctx.save();
        this.ctx.rotate(cellIndex * 2.0 * Math.PI / 6.0);
        this.ctx.scale([-1, 1][cellIndex % 2], 1);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-0.5 * this.radius, 1.0 * this.radiusHeight);
        this.ctx.lineTo(0.5 * this.radius, 1.0 * this.radiusHeight);
        this.ctx.closePath();
        this.drawImage(this.image, this.alphaFactor);
        this.drawImage(this.imageProxy, 1 - this.alphaFactor);
        this.ctx.restore();
      }
      return this.ctx.restore();
    };

    Kaleidoscope.prototype.update = function() {
      if (this.easeEnabled) {
        this.angleFactor += (this.angleTarget - this.angleFactor) * this.ease;
        this.zoomFactor += (this.zoomTarget - this.zoomFactor) * this.ease;
        return this.alphaFactor += (this.alphaTarget - this.alphaFactor) * this.ease;
      } else {
        this.angleFactor = this.angleTarget;
        this.zoomFactor = this.zoomTarget;
        return this.alphaFactor = this.alphaTarget;
      }
    };

    Kaleidoscope.prototype.draw = function() {
      var h, horizontalLimit, horizontalStrype, v, verticalLimit, verticalStrype, _i, _j, _k, _l, _len, _len1, _results, _results1;
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

    Kaleidoscope.prototype.setImage = function(image) {
      this.imageProxy = this.image;
      this.image = image;
      return this.alphaFactor = 0.0;
    };

    return Kaleidoscope;

  })();

}).call(this);
