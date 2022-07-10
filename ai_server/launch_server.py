#!/usr/bin/env python
from server import app, socketio

if __name__ == "__main__":
    socketio.run(app, debug=False, use_reloader=False, port=5005)