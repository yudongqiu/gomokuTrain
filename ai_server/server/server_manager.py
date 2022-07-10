import os

from server.server_namespace import server_ns
from server.constants import ServerStatus

THIS_FOLDER_PATH = os.path.dirname(os.path.realpath(__file__))
DATA_ROOT_PATH = os.path.realpath(os.path.join(THIS_FOLDER_PATH, '../server_data'))

class ServerManager:
    def __init__(self) -> None:
        server_ns.register_manager(self)
        self.root = DATA_ROOT_PATH
        if not os.path.exists(self.root):
            os.makedirs(self.root)

        self.status = ServerStatus.IDLE

    def getStatus(self):
        return self.status.value

manager = ServerManager()