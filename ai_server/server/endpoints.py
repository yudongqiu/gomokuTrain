from flask import send_from_directory

from server import app
from server.server_manager import manager

@app.route('/')
def index():
    return send_from_directory('../../web_game/build', 'index.html')

@app.route('/<path:path>')
def send_file(path):
    return app.send_static_file(path)