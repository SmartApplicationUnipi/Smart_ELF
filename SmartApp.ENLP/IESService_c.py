import sys
import logging
from interface_tags import PATH_TO_KB_MODULE, TAG_ANSWER, TAG_ELF_EMOTION, TAG_COLORED_ANSWER, TAG_USER_TRANSCRIPT
sys.path.insert(0, PATH_TO_KB_MODULE)
import threading
from kb import KnowledgeBaseClient
import emotion_conversion as em_conv
import logging

import math
class IESService:
    """
    This services update the internal elf emotion.
    it's based on some arcane black magic
    """

    def __init__(self, kb_ID, logging_lvl):
        self.logging_lvl = logging_lvl
        self.max_threshold = 5 # soglia oltre la quale aumento la veloc. di spostamento
        self.travel_step = 1.0 # di quanto mi sposto nela direzione dell'utente
        self.idle_time_update = 250# passato questo tempo parte l'update dello stato
        self.threshold = 0 # current counter
        self.timer = None # timer Object
        self.last_user_emotion = "anger" # ultima emozione dell'utente che ha parlato con elf
        self.travel_dist = 1.0 # normal travel distance
        self.elf_emotion_coord = (0.0, 0.0) # neutral
        self.kb_ID = kb_ID
        self.dist_modifier = 1.0
        self.kb_client = KnowledgeBaseClient(True)
        #logging.basicConfig(stream=sys.stderr, level=logging_lvl)
        logging.info('\tIES Service started')


    def write_to_KB(self, fact, tag):
        """
        Post a tuple to the KB
        """
        self.kb_client.addFact(self.kb_ID, tag, 1, 100, fact)

    def timed_update(self):
        """
        Funzione chiamata se non ci sono state interazioni per
        idle_time_update seconds
        """
        self.timer.cancel()
        # do stuff do stuff
        new_emotion_point = self.travel_in_emotion_space(self.elf_emotion_coord, (-0.5,-0.8) )
        fact = {
            "time_stamp": 3, #fix this!!!!!
            "valence" : new_emotion_point[0],
            "arousal" : new_emotion_point[1],
            "tag": TAG_ELF_EMOTION
        }
        self.write_to_KB(fact, TAG_ELF_EMOTION)
        # continue doing stuff
        self.timer = threading.Timer(self.idle_time_update, self.timed_update)
        self.timer.start()

    def on_user_interaction(self, *params):
        # stuff-
        logging.info("\tcallback IES called")
        self.timer.cancel()
        user_coord, emotion = self.get_mean_user_emotion()
        if (emotion == self.last_user_emotion):
            self.threshold += 1
            new_emotion_point = user_coord
        if (self.threshold >= self.max_threshold):
            # travel with modifier
            self.dist_modifier = 1.1
            new_emotion_point = self.travel_in_emotion_space(self.elf_emotion_coord, user_coord)
        else:
            self.dist_modifier = 1.0
            logging.debug("\tCurrent user coord: " + str(user_coord) + "Closest Emotion category: " + str(emotion))
            new_emotion_point = self.travel_in_emotion_space(self.elf_emotion_coord, user_coord)

        fact = {
            "timestamp": 3, #fix this!!!!!
            "valence" : new_emotion_point[0],
            "arousal" : new_emotion_point[1],
            "tag": TAG_ELF_EMOTION
        }
        self.write_to_KB(fact, TAG_ELF_EMOTION)
        self.timer = threading.Timer(self.idle_time_update, self.timed_update)

    def _get_query_datas(self,response):
        """Metodo per accedere velocemente al risultato di una query
            ritorna il dizionario datas
        """

        obj = response["details"][0]["object"]
        datas = obj["_data"]
        return datas

    def get_mean_user_emotion(self):
        """
        Get user emotion a partire dai vari moduli e fai la media
        convertila in valore testuale e ritorna (valence, arousal), emotion
        """

        a = 0
        b = 0
        success = True
        # take emotions from face recognition
        query_vis = {
            "_data": {
                "tag":"VISION_FACE_ANALYSIS",
                "is_interlocutor":"True"
            }
        }
        res_vis = self.kb_client.query(query_vis)
        if res_vis["success"]:
            data_vis = self._get_query_datas(res_vis)
            vis_point = em_conv.vector_to_circumplex(data_vis["emotion"])
            print("Vision: ", vis_point)
            a += vis_point[0]
            b += vis_point[0]
        else:
            success = False
            print("Error while retrieving facial emotion")

        query_enlp = {
            "_data": {
                "tag":"ENLP_ELF_EMOTION",
            }
        }

        res_enlp = self.kb_client.query(query_enlp)
        if res_enlp["success"]:
            data_enlp = self._get_query_datas(res_enlp)
            a += data_enlp["valence"]
            b += data_enlp["arousal"]
        else:
            success = False
            print("Error while retrieving enlp internal emotion")


        if success:
            a /= 2
            b /= 2

        rand_point = (a, b)
        if (a == 0 and b == 0):
            categorical_emo = "Neutral"
        else:
            categorical_emo = em_conv.circumplex_to_emotion(rand_point[0], rand_point[1])

        return rand_point, categorical_emo


    def travel_in_emotion_space(self, start, end):
        """
        https://math.stackexchange.com/questions/175896/finding-a-point-along-a-line-a-certain-distance-away-from-another-point
        start e end tuple (valence, arousal)
        modifica le coordinate di valence arousal dello stato interno
        lo stato interno è il punto start, end è la coordinata standard dell'emozione dell'utente
        ritorna
        """
        logging.debug("\tcurrent elf emotion cooord ==" + str(start))
        logging.debug("\tcurrent user emotion coord ==" + str(end))

        vector = (end[0] - start[0], end[1] - start[1])
        norm_v = math.sqrt(vector[0]**2 + vector[1]**2)
        if norm_v > 0:
            direction  = (vector[0]/norm_v, vector[1]/norm_v)
        else:
            direction = (0.,0.)

        step = self.travel_step * self.dist_modifier
        new_emotion_point = (start[0] + step * direction[0], start[1] + step * direction[0])
        # update elf status
        self.elf_emotion_coord = new_emotion_point

        logging.debug("\tupdated elf coord ==" + str(self.elf_emotion_coord))

        return new_emotion_point

    def start(self):
        """
        Start service
        """
        self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_USER_TRANSCRIPT, "text": "$input"}}, self.on_user_interaction) #todo change with appropriate tag
        self.timer = threading.Timer(self.idle_time_update, self.timed_update)
        self.timer.start()
