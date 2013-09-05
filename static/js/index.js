(function() {
  var AudioAnalyser, DragDrop, Kaleidoscope, MP3_PATH, NUM_BANDS, SMOOTHING, dragger, image, kaleidoscope, options, tr, tx, ty, update,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    _this = this;

  Kaleidoscope = (function() {
    Kaleidoscope.prototype.HALF_PI = Math.PI / 2;

    Kaleidoscope.prototype.TWO_PI = Math.PI * 2;

    function Kaleidoscope(options) {
      var key, val, _ref, _ref1;
      this.options = options != null ? options : {};
      this.defaults = {
        offsetRotation: 0.0,
        offsetScale: 1.0,
        offsetX: 0.0,
        offsetY: 0.0,
        radius: 260,
        slices: 12,
        zoom: 1.0
      };
      _ref = this.defaults;
      for (key in _ref) {
        val = _ref[key];
        this[key] = val;
      }
      _ref1 = this.options;
      for (key in _ref1) {
        val = _ref1[key];
        this[key] = val;
      }
      if (this.domElement == null) {
        this.domElement = document.createElement('canvas');
      }
      if (this.context == null) {
        this.context = this.domElement.getContext('2d');
      }
      if (this.image == null) {
        this.image = document.createElement('img');
      }
    }

    Kaleidoscope.prototype.draw = function() {
      var cx, index, scale, step, _i, _ref, _results;
      this.domElement.width = this.domElement.height = this.radius * 2;
      this.context.fillStyle = this.context.createPattern(this.image, 'repeat');
      scale = this.zoom * (this.radius / Math.min(this.image.width, this.image.height));
      step = this.TWO_PI / this.slices;
      cx = this.image.width / 2;
      _results = [];
      for (index = _i = 0, _ref = this.slices; 0 <= _ref ? _i <= _ref : _i >= _ref; index = 0 <= _ref ? ++_i : --_i) {
        this.context.save();
        this.context.translate(this.radius, this.radius);
        this.context.rotate(index * step);
        this.context.beginPath();
        this.context.moveTo(-0.5, -0.5);
        this.context.arc(0, 0, this.radius, step * -0.51, step * 0.51);
        this.context.lineTo(0.5, 0.5);
        this.context.closePath();
        this.context.rotate(this.HALF_PI);
        this.context.scale(scale, scale);
        this.context.scale([-1, 1][index % 2], 1);
        this.context.translate(this.offsetX - cx, this.offsetY);
        this.context.rotate(this.offsetRotation);
        this.context.scale(this.offsetScale, this.offsetScale);
        this.context.fill();
        _results.push(this.context.restore());
      }
      return _results;
    };

    return Kaleidoscope;

  })();

  DragDrop = (function() {
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

  image = new Image;

  image.onload = function() {
    return kaleidoscope.draw();
  };

  image.src = 'http://cl.ly/image/1X3e0u1Q0M01/cm.jpg';

  kaleidoscope = new Kaleidoscope({
    image: image,
    slices: 20
  });

  kaleidoscope.domElement.style.position = 'absolute';

  kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px';

  kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px';

  kaleidoscope.domElement.style.left = '50%';

  kaleidoscope.domElement.style.top = '50%';

  document.body.appendChild(kaleidoscope.domElement);

  dragger = new DragDrop(function(data) {
    return kaleidoscope.image.src = data;
  });

  tx = kaleidoscope.offsetX;

  ty = kaleidoscope.offsetY;

  tr = kaleidoscope.offsetRotation;

  NUM_BANDS = 32;

  SMOOTHING = 0.6;

  MP3_PATH = 'http://cs1-41v4.vk.me/p23/6496f65050b272.mp3';

  AudioAnalyser = (function() {
    var analyser, analyzeCallback, chart;

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

    chart = d3.select("body").append("div").attr("class", "chart");

    analyzeCallback = function(data) {
      var hx, hy, maxData;
      maxData = d3.max(data);
      hx = data[20] / maxData - 0.5;
      hy = data[20] / maxData - 0.5;
      tx = hx * kaleidoscope.radius * -2;
      ty = hy * kaleidoscope.radius * 2;
      tr = Math.atan2(hy, hx);
      chart.selectAll("div").data(data).enter().append("div");
      return chart.selectAll("div").data(data).style("height", function(d) {
        return (100 * d / maxData + 1).toFixed(0) + "px";
      });
    };

    analyser = new AudioAnalyser(MP3_PATH, NUM_BANDS, SMOOTHING);

    analyser.onUpdate = analyzeCallback;

    analyser.start();

    document.body.appendChild(analyser.audio);

    return AudioAnalyser;

  })();

  options = {
    interactive: true,
    ease: 0.1
  };

  (update = function() {
    var delta, theta;
    if (options.interactive) {
      delta = tr - kaleidoscope.offsetRotation;
      theta = Math.atan2(Math.sin(delta), Math.cos(delta));
      kaleidoscope.offsetX += (tx - kaleidoscope.offsetX) * options.ease;
      kaleidoscope.offsetY += (ty - kaleidoscope.offsetY) * options.ease;
      kaleidoscope.offsetRotation += (theta - kaleidoscope.offsetRotation) * options.ease;
      kaleidoscope.draw();
    }
    return setTimeout(update, 1000 / 60);
  })();

}).call(this);
