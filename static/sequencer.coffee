window.GridView = Backbone.View.extend
    events:
        'change input#channel': 'changeChannel'
        'change input#cols': 'changeCols'
        'change input#rows': 'changeRows'
        'change input#root': 'changeRoot'
        'change select#scale': 'changeScale'
        'click button.double': 'doubleSize'
        'click .box': 'boxOn'
    changeChannel: ->
        @channel = Number @$('input#channel').val()
    changeCols: ->
        @cols = Number @$('input#cols').val()
        @render()
    changeRows: ->
        console.log 'ork?'
        @rows = Number @$('input#rows').val()
        @render()
    changeRoot: ->
        @root = Number @$('input#root').val()
        @genScale()
        @rewriteNotes()
    changeScale: ->
        @scale_name = @$('select#scale').val()
        @genScale()
        @rewriteNotes()
    constructor: (@channel, @cols, @rows, @root, @scale_name) ->
        console.log "building a new grid @#{ @channel } #{ @cols }x#{ @rows }"
        @genScale()
        @$el = $('<div class="grid">')
        $controls = $('<div class="controls">')
        @$el.append($controls)
        @$el.append('<div class="cols">')
        # Channel selector
        $controls.append('<input id="channel">')
        $controls.append('<input id="cols">')
        $controls.append('<input id="rows">')
        $controls.append('<input id="root">')
        # Scales selector
        $controls.append('<select id="scale">')
        for scale of scales
            @$('select#scale').append("<option>#{ scale }</option>")
        $controls.append('<button class="double">+</button>')
        @$el.appendTo($('#grids'))
        @
    boxOn: (e) ->
        $(e.target).toggleClass('on')
    doubleSize: (e) ->
        e.preventDefault()
        @buildColumns(@cols, @cols*2)
        for x in [0..@cols-1]
            col1 = @$(".col#col#{ x }").children()
            col2 = @$(".col#col#{ x+@cols }").children()
            for y in [0..@scale.length-1]
                box1 = $(col1[y])
                box2 = $(col2[y])
                if box1.hasClass('on')
                    box2.addClass('on')
        @cols = @cols*2
    genScale: ->
        @scale = []
        n = @root
        for y in [0..@rows-1]
            @scale.push(n)
            inc = scales[@scale_name][y % scales[@scale_name].length]
            n += inc
        @scale.reverse()
    rewriteNotes: ->
        for x in [0..@cols-1]
            col = @$(".col#col#{ x }").children()
            for y in [0..@rows-1]
                $(col[y]).data('note', @scale[y])
                
    buildColumns: (from_col, to_col) ->
        # Build columns, then rows
        for x in [from_col..to_col-1]
            $col = $('<div class="col">').attr('id', 'col' + x)
            for n in @scale
                $col.append($('<div class="box">').data('note', n).data('vel', 127))
            @$('.cols').append($col)
    render: ->
        @$('.cols').empty()
        @$('input#channel').val(@channel)
        @$('input#cols').val(@cols)
        @$('input#rows').val(@rows)
        @$('input#root').val(@root)
        @$('select#scale').val(@scale_name)
        @buildColumns(0, @cols)
        # Delegate events
        @delegateEvents()
        @

window.tempo = 0.3
window.grids = []

window.scales =
    chromatic: [1]
    major: [2, 2, 1, 2, 2, 2, 1]
    minor: [2, 1, 2, 2, 1, 2, 2]
    creepy: [2, 1, 2, 2, 1, 3, 1]

$ ->
    grids.push new GridView(1, 4, 6, 36, 'chromatic').render()
    grids.push new GridView(2, 16, 12, 48, 'minor').render()
    grids.push new GridView(3, 32, 12, 36, 'minor').render()
    window.socket.on 'clock', next
    updateTempo = ->
        window.socket.emit('tempo', $('input#tempo').val())
    $('input#tempo').val(window.tempo)
    updateTempo()
    $('input#tempo').on 'change', updateTempo
    $('#add-grid').on 'click', ->
        grids.push new GridView(3, 32, 12, 36, 'minor').render()

window.next = (d) ->
    notes = []
    _.each grids, (grid) ->
        i = d % grid.cols
        grid.$('.col').removeClass('active')
        grid.$("#col#{ i }").addClass('active')

        grid.$("#col#{ i } .box.on").each (b, bel) ->
            notes.push([$(bel).data('note'), grid.channel, window.tempo, $(bel).data('vel')])
    if notes.length
        window.socket.emit('notes', notes)

