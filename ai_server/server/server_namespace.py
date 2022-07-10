from flask_socketio import Namespace
from server import socketio

class ServerNameSpace(Namespace):
    def register_manager(self, manager):
        self._manager = manager

    def on_get_status(self):
        return self._manager.getStatus()

server_ns = ServerNameSpace('/api')

socketio.on_namespace(server_ns)