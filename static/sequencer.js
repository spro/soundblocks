// Generated by CoffeeScript 1.3.3
(function() {

  window.GridView = Backbone.View.extend({
    events: {
      'change input#channel': 'changeChannel',
      'change input#cols': 'changeCols',
      'change input#rows': 'changeRows',
      'change input#root': 'changeRoot',
      'change select#scale': 'changeScale',
      'click button.double': 'doubleSize',
      'click .box': 'boxOn'
    },
    changeChannel: function() {
      return this.channel = Number(this.$('input#channel').val());
    },
    changeCols: function() {
      this.cols = Number(this.$('input#cols').val());
      return this.render();
    },
    changeRows: function() {
      console.log('ork?');
      this.rows = Number(this.$('input#rows').val());
      return this.render();
    },
    changeRoot: function() {
      this.root = Number(this.$('input#root').val());
      this.genScale();
      return this.rewriteNotes();
    },
    changeScale: function() {
      this.scale_name = this.$('select#scale').val();
      this.genScale();
      return this.rewriteNotes();
    },
    constructor: function(channel, cols, rows, root, scale_name) {
      var $controls, scale;
      this.channel = channel;
      this.cols = cols;
      this.rows = rows;
      this.root = root;
      this.scale_name = scale_name;
      console.log("building a new grid @" + this.channel + " " + this.cols + "x" + this.rows);
      this.genScale();
      this.$el = $('<div class="grid">');
      $controls = $('<div class="controls">');
      this.$el.append($controls);
      this.$el.append('<div class="cols">');
      $controls.append('<input id="channel">');
      $controls.append('<input id="cols">');
      $controls.append('<input id="rows">');
      $controls.append('<input id="root">');
      $controls.append('<select id="scale">');
      for (scale in scales) {
        this.$('select#scale').append("<option>" + scale + "</option>");
      }
      $controls.append('<button class="double">+</button>');
      this.$el.appendTo($('#grids'));
      return this;
    },
    boxOn: function(e) {
      return $(e.target).toggleClass('on');
    },
    doubleSize: function(e) {
      var box1, box2, col1, col2, x, y, _i, _j, _ref, _ref1;
      e.preventDefault();
      this.buildColumns(this.cols, this.cols * 2);
      for (x = _i = 0, _ref = this.cols - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
        col1 = this.$(".col#col" + x).children();
        col2 = this.$(".col#col" + (x + this.cols)).children();
        for (y = _j = 0, _ref1 = this.scale.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
          box1 = $(col1[y]);
          box2 = $(col2[y]);
          if (box1.hasClass('on')) {
            box2.addClass('on');
          }
        }
      }
      return this.cols = this.cols * 2;
    },
    genScale: function() {
      var inc, n, y, _i, _ref;
      this.scale = [];
      n = this.root;
      for (y = _i = 0, _ref = this.rows - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
        this.scale.push(n);
        inc = scales[this.scale_name][y % scales[this.scale_name].length];
        n += inc;
      }
      return this.scale.reverse();
    },
    rewriteNotes: function() {
      var col, x, y, _i, _ref, _results;
      _results = [];
      for (x = _i = 0, _ref = this.cols - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
        col = this.$(".col#col" + x).children();
        _results.push((function() {
          var _j, _ref1, _results1;
          _results1 = [];
          for (y = _j = 0, _ref1 = this.rows - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
            _results1.push($(col[y]).data('note', this.scale[y]));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    },
    buildColumns: function(from_col, to_col) {
      var $col, n, x, _i, _j, _len, _ref, _ref1, _results;
      _results = [];
      for (x = _i = from_col, _ref = to_col - 1; from_col <= _ref ? _i <= _ref : _i >= _ref; x = from_col <= _ref ? ++_i : --_i) {
        $col = $('<div class="col">').attr('id', 'col' + x);
        _ref1 = this.scale;
        for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
          n = _ref1[_j];
          $col.append($('<div class="box">').data('note', n).data('vel', 127));
        }
        _results.push(this.$('.cols').append($col));
      }
      return _results;
    },
    render: function() {
      this.$('.cols').empty();
      this.$('input#channel').val(this.channel);
      this.$('input#cols').val(this.cols);
      this.$('input#rows').val(this.rows);
      this.$('input#root').val(this.root);
      this.$('select#scale').val(this.scale_name);
      this.buildColumns(0, this.cols);
      this.delegateEvents();
      return this;
    }
  });

  window.tempo = 0.3;

  window.grids = [];

  window.scales = {
    chromatic: [1],
    major: [2, 2, 1, 2, 2, 2, 1],
    minor: [2, 1, 2, 2, 1, 2, 2],
    creepy: [2, 1, 2, 2, 1, 3, 1]
  };

  $(function() {
    var updateTempo;
    grids.push(new GridView(1, 4, 6, 36, 'chromatic').render());
    grids.push(new GridView(2, 16, 12, 48, 'minor').render());
    grids.push(new GridView(3, 32, 12, 36, 'minor').render());
    window.socket.on('clock', next);
    updateTempo = function() {
      return window.socket.emit('tempo', $('input#tempo').val());
    };
    $('input#tempo').val(window.tempo);
    updateTempo();
    $('input#tempo').on('change', updateTempo);
    return $('#add-grid').on('click', function() {
      return grids.push(new GridView(3, 32, 12, 36, 'minor').render());
    });
  });

  window.next = function(d) {
    var notes;
    notes = [];
    _.each(grids, function(grid) {
      var i;
      i = d % grid.cols;
      grid.$('.col').removeClass('active');
      grid.$("#col" + i).addClass('active');
      return grid.$("#col" + i + " .box.on").each(function(b, bel) {
        return notes.push([$(bel).data('note'), grid.channel, window.tempo, $(bel).data('vel')]);
      });
    });
    if (notes.length) {
      return window.socket.emit('notes', notes);
    }
  };

}).call(this);
