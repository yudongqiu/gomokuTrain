from flask_socketio import Namespace
from server import socketio

class ServerNameSpace(Namespace):
    def register_manager(self, manager):
        self._manager = manager

    def on_get_status(self):
        return self._manager.getStatus()

    def post_status(self, data):
        self.emit('status', data)

    def on_getPrediction(self, game_state):
        print("getPrediction", game_state)
        self._manager.getPrediction(game_state, self.post_prediction)
        return "success"

    def post_prediction(self, data):
        print("post prediction", data)
        self.emit("prediction", data)


server_ns = ServerNameSpace('/api')

socketio.on_namespace(server_ns)