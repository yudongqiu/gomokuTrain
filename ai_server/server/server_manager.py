import os
from functools import wraps

from server.server_namespace import server_ns
from server.constants import ServerStatus
from gomoku_ai.ai_player import AIPlayer

THIS_FOLDER_PATH = os.path.dirname(os.path.realpath(__file__))
DATA_ROOT_PATH = os.path.realpath(os.path.join(THIS_FOLDER_PATH, '../server_data'))

# class method decorator to set the status to busy before executing the method
def busy(method):
    @wraps(method)
    def _impl(self, *method_args, **method_kwargs):
        if self.status == ServerStatus.BUSY:
            print(f"server is busy when {method.__name__} is called!")
            return
        self.update_status(ServerStatus.BUSY)
        # run the method
        result = method(self, *method_args, **method_kwargs)
        self.update_status(ServerStatus.IDLE)
        return result
    return _impl

class ServerManager:
    def __init__(self) -> None:
        server_ns.register_manager(self)
        self.root = DATA_ROOT_PATH
        if not os.path.exists(self.root):
            os.makedirs(self.root)

        self.status = ServerStatus.IDLE
        self.ai_player = AIPlayer("AI", 1)

    def getStatus(self):
        return self.status.value
    
    def update_status(self, status):
        self.status = status
        # post status to client
        server_ns.post_status(status.value)

    @busy
    def getPrediction(self, game_state, callback):
        return callback(self.ai_player.predict(game_state))





manager = ServerManager()