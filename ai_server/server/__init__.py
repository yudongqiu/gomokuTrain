from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__, static_folder='../../web_game/build')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

from server import endpoints