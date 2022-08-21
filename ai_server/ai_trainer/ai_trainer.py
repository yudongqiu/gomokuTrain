import os
import subprocess
import psutil
from server.constants import ServerStatus

class AI_Trainer:
    process_name = "gomoku_train_swap.py"

    def __init__(self, serverManager) -> None:
        self.serverManager = serverManager
        self.proc = None        

    def connected(self):
        if self.proc != None:
            try:
                return self.proc.is_running()
            except:
                pass
        self.find_process()
        return self.proc != None

    def find_process(self):
        '''
        Check if there is any running process that contains the given name process_name.
        '''
        #Iterate over the all the running process
        for proc in psutil.process_iter():
            try:
                # Check if process name contains the given name string.
                if any(self.process_name in arg for arg in proc.cmdline()):
                    self.proc = proc
                    print('found training process ', proc)
                    return
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        # process not found
        self.proc = None

    def check_process_status(self):
        # find process if not exist or killed
        if self.proc == None:
            self.find_process()
        try:
            if self.proc != None:
                status = self.proc.status()
        except psutil.NoSuchProcess:
            self.find_process()
        # if still not found, training does not exist
        if self.proc == None:
            return ServerStatus.IDLE
        status = self.proc.status()
        if status == 'running':
            return ServerStatus.TRAINING
        elif status == 'stopped':
            # paused training
            return ServerStatus.IDLE
        return ServerStatus.IDLE


    def pause_training(self):
        if self.check_process_status() == ServerStatus.TRAINING:
            self.proc.suspend()
            print("--- Trainer paused training process ", self.proc)

    def resume_training(self):
        if self.connected() and self.check_process_status() == ServerStatus.IDLE:
            self.proc.resume()
            print("--- Trainer resumed training process ", self.proc)

    def get_machine_stats(self):
        return {
            'cpu_usage': psutil.cpu_percent(),
            'memory_usage': psutil.virtual_memory().percent,
            'gpu_usage': float(subprocess.check_output("nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits", shell=True)),
            'gpu_memory_usage': float(subprocess.check_output("nvidia-smi --query-gpu=utilization.memory --format=csv,noheader,nounits", shell=True)),
        }

    def get_train_progress(self):
        if self.connected() and self.proc == None: return {}
        trainer_folder = self.proc.cwd()
        if trainer_folder.split('/')[-1].startswith("trained_model_"):
            trainer_folder = '/'.join(trainer_folder.split('/')[:-1])
        trained_model_names = sorted([f for f in os.listdir(trainer_folder) if f.startswith("trained_model_")])
        def read_status(name):
            try:
                with open(os.path.join(trainer_folder, name, 'status_report.txt')) as f:
                    status_line = f.readlines()[-1]
                    lsplit = status_line.strip().split()
                    return {
                        'name': name,
                        'epoch': lsplit[1],
                        'count': lsplit[2].split('/')[0],
                        'loss': lsplit[5],
                        'valLoss': lsplit[8],
                        'time': lsplit[-1],
                    }
            except Exception as e:
                print(e)
                pass
            return {}
        trained_models = []
        for name in trained_model_names:
            model_data = read_status(name)
            if model_data:
                trained_models.append(model_data)
        return {
            'folder': trainer_folder,
            'models': trained_models
        }
