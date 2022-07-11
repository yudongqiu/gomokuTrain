from flask_socketio import Namespace
from server import socketio

class ServerNameSpace(Namespace):
    def register_manager(self, manager):
        self._manager = manager

    def on_get_status(self):
        return self._manager.getStatus()

    def post_status(self, data):
        self.emit('status', data)

    def on_queuePrediction(self, game_state):
        print("got event queuePrediction: ", game_state)
        self._manager.queue_prediction(game_state)
        print("queue prediction successful")
        return "success"

    def on_processPrediction(self):
        print("got event processPrediction")
        prediction_result = self._manager.process_prediction()
        print("prediction result finished: ", prediction_result)
        self.emit("prediction", prediction_result)


server_ns = ServerNameSpace('/api')

socketio.on_namespace(server_ns)