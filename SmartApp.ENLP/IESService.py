"""Internal Emotion State Service"""
import threading
import kb
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
        
        def timed_update(self):
            """
            Funzione chiamata se non ci sono state interazioni per 
            idle_time_update seconds
            """
            self.timer.cancel()
            # do stuff do stuff
            # continue doing stuff
            self.timer = Timer(idle_time_update, self.timed_update)
            self.timer.start()
            
            
            
        def on_user_interaction():
            # stuff
            pass
            
        def get_mean_user_emotion(self):
            """
            Get user emotion a partire dai vari moduli e fai la media
            """
            pass
        
        
            
    
    def start_service():
        """
        Fa partire il servizio
        """
        kb.subscribe(self.kb_ID, {TAG_ANSWER: "$input"}, self.callback) # todo change input
        self.timer = Timer(idle_time_update, self.timed_update)
        self.timer.start()
        
        
        
        
            
            
        