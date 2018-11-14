"""Internal Emotion State Service"""
import threading
import kb
import random
class IESService:
"""
This services update the internal elf emotion. 
it's based on some arcane black magic
"""

    def __init__(self, kb_ID):
        self.max_threshold # soglia oltre la quale aumento la veloc. di spostamento
        self.travel_step # di quanto mi sposto nela direzione dell'utente
        self.idle_time_update # passato questo tempo parte l'update dello stato
        self.threshold # current counter
        self.timer # timer Object
        self.last_user_emotion # ultima emozione dell'utente che ha parlato con elf
        self.travel_dist # normal travel distance
        self.elf_emotion_coord = (0,0) # neutral
        
        def timed_update(self):
            """
            Funzione chiamata se non ci sono state interazioni per 
            idle_time_update seconds
            """
            self.timer.cancel()
            # do stuff do stuff
            self.travel_in_emotion_space(self.elf_emotion_coord, )
            # continue doing stuff
            self.timer = Timer(idle_time_update, self.timed_update)
            self.timer.start()
            
        def on_user_interaction(self):
            # stuff
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
            self.timer = Timer(idle_time_update, self.timed_update)
            
            
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
            step = travel_step * dist_modifier
            new_emotion_point = (start[0] + step * direction, start[1] + step * direction)
            # update elf statur
            self.elf_emotion_coord = new_emotion_point
            
            print("updated elf coord ==", self_emotion_coord)
            

    def start_service():
        """
        Fa partire il servizio
        """
        self.
        kb.subscribe(self.kb_ID, {TAG_ANSWER: "$input"}, self.on_user_interaction) # todo change input
        self.timer = Timer(idle_time_update, self.timed_update)
        self.timer.start()
        
        
        
        
        
        
            
            
        