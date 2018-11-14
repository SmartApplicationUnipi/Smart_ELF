import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_ANSWER, TAG_ELF_EMOTION, TAG_COLORED_ANSWER, TAG_USER_TRANSCRIPT
sys.path.insert(0, PATH_TO_KB_MODULE)
import threading
import kb
import random
import math
class IESService:
    """
    This services update the internal elf emotion.
    it's based on some arcane black magic
    """

    def __init__(self, kb_ID):
        self.max_threshold = 5 # soglia oltre la quale aumento la veloc. di spostamento
        self.travel_step = 1.0 # di quanto mi sposto nela direzione dell'utente
        self.idle_time_update = 25# passato questo tempo parte l'update dello stato
        self.threshold = 0 # current counter
        self.timer = None # timer Object
        self.last_user_emotion = "anger" # ultima emozione dell'utente che ha parlato con elf
        self.travel_dist = 1.0 # normal travel distance
        self.elf_emotion_coord = (0.0, 0.0) # neutral
        self.kb_ID = kb_ID
        self.dist_modifier = 1.0
        print("init ies Service")

    def timed_update(self):
        """
        Funzione chiamata se non ci sono state interazioni per
        idle_time_update seconds
        """
        print("timed update !!")
        self.timer.cancel()
        # do stuff do stuff
        self.travel_in_emotion_space(self.elf_emotion_coord, (-0.5,-0.8) )
        # continue doing stuff
        self.timer = threading.Timer(self.idle_time_update, self.timed_update)
        self.timer.start()

    def on_user_interaction(self):
        # stuff
        print("user intereaction !!")
        self.timer.cancel()
        user_coord, emotion = get_mean_user_emotion()
        if (emotion == self.last_user_emotion):
            self.threshold += 1
        if (self.threshold >= self.max_threshold):
            # travel with modifier
            self.dist_modifier = 1.1
            self.travel_in_emotion_space(self.elf_emotion_coord, user_coord)
        else:
            self.dist_modifier = 1.0
            self.travel_in_emotion_space(self.elf_emotion_coord, user_coord)
        self.timer = threading.Timer(self.idle_time_update, self.timed_update)


    def get_mean_user_emotion(self):
        """
        Get user emotion a partire dai vari moduli e fai la media
        convertila in valore testuale e ritorna (valence, arousal), emotion
        """
        a = random.uniform(-1, 1)
        b = random.uniform(-1, 1)
        rand_point = (a, b)
        return rand_point

    def travel_in_emotion_space(self, start, end):
        """
        https://math.stackexchange.com/questions/175896/finding-a-point-along-a-line-a-certain-distance-away-from-another-point
        start e end tuple (valence, arousal)
        modifica le coordinate di valence arousal dello stato interno
        lo stato interno è il punto start, end è la coordinata standard dell'emozione dell'utente
        ritorna
        """
        print("current elf emotion cooord ==", start)
        print("current user emotion coord ==", end)

        vector = (end[0] - start[0], end[1] - start[1])
        norm_v = math.sqrt(vector[0]**2 + vector[1]**2)
        direction  = (vector[0]/norm_v, vector[1]/norm_v) #TODO warning division by zero
        step = self.travel_step * self.dist_modifier
        print(start[0])
        new_emotion_point = (start[0] + step * direction[0], start[1] + step * direction[0])
        # update elf statur
        self.elf_emotion_coord = new_emotion_point

        print("updated elf coord ==", self.elf_emotion_coord)

    def start_service(self):
        """
        Fa partire il servizio
        """
        kb.subscribe(self.kb_ID, {"TAG": TAG_USER_TRANSCRIPT, "text": "$input"}, self.on_user_interaction) #todo change with appropriate tag
        self.timer = threading.Timer(self.idle_time_update, self.timed_update)
        self.timer.start()
