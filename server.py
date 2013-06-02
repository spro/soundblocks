from gevent import monkey; monkey.patch_all()
import bottle
import gevent

from socketio import socketio_manage
from socketio.server import SocketIOServer
from socketio.namespace import BaseNamespace

beat_time = 0.2

from simplecoremidi import send_midi
def play_note(n, c, l, v):
    send_midi((0x90|(c-1), n, v))
    gevent.sleep(l)
    send_midi((0x90|(c-1), n, 0))
def play_notes(notes):
    for n in notes:
        gevent.spawn(play_note, *n)

clock = [0]
clocked = []
def start_clock():
    global beat_time
    while True:
        for c in clocked:
            c.clock()
        clock[0] += 1
        gevent.sleep(beat_time)

class ChannelNamespace(BaseNamespace):
    def clock(self):
        self.emit('clock', clock[0])

    def on_subscribe(self):
        clocked.append(self)

    def on_notes(self, msg):
        gevent.spawn(play_notes, msg)

    def on_tempo(self, msg):
        global beat_time
        beat_time = float(msg)

@bottle.get('/socket.io/<remaining:path>')
def socketio(remaining):
    return socketio_manage(bottle.request.environ, {'': ChannelNamespace}, request=bottle.request)

@bottle.get('/sequence')
def sequencer():
    return render('sequencer')

from spromata.basic import *
socket_server = SocketIOServer(("", 8040), bottle.app())
gevent.spawn(start_clock)
socket_server.serve_forever()
