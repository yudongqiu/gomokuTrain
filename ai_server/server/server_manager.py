import os
from functools import wraps

from server.server_namespace import server_ns
from server.constants import ServerStatus
from gomoku_ai.ai_player import AIPlayer
from gomoku_ai.dnn_model import load_existing_model
from ai_trainer.ai_trainer import AI_Trainer

THIS_FOLDER_PATH = os.path.dirname(os.path.realpath(__file__))
DATA_ROOT_PATH = os.path.realpath(os.path.join(THIS_FOLDER_PATH, '../server_data'))

# class method decorator to set the status to busy before executing the method
def busy(method):
    @wraps(method)
    def _impl(self, *method_args, **method_kwargs):
        if self.status == ServerStatus.BUSY:
            print(f"server is busy when {method.__name__} is called!")
            return
        # try to pause running training
        self.ai_trainer.pause_training()
        self.update_status(ServerStatus.BUSY)
        # run the method
        result = method(self, *method_args, **method_kwargs)
        self.ai_trainer.resume_training()
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
        # AI
        self.ai_player = self.load_dnn_model_player()
        # queue for predictions
        self.prediction_queue = []
        # trainer to manage / monitor training process
        self.ai_trainer = AI_Trainer(self)

    def load_dnn_model_player(self):
        model_file_path = os.path.join(self.root, 'dnn_model.pt')
        dnn_model = load_existing_model(model_file_path)
        print("Load dnn model successfully from ", model_file_path)
        return AIPlayer("AI", model=dnn_model, level=1)

    def getStatus(self):
        return self.status.value
    
    def update_status(self, status):
        self.status = status
        # post status to client
        server_ns.post_status(status.value)
    
    def queue_prediction(self, game_state):
        self.prediction_queue.append(game_state)

    @busy
    def process_prediction(self):
        if len(self.prediction_queue) == 0:
            print("process prediction called without any game_state in the queue")
            return {}
        game_state = self.prediction_queue.pop()
        return self.ai_player.predict(game_state)





manager = ServerManager()