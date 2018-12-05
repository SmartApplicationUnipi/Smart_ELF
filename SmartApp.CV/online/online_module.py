from online.SDK.face_client import Facepp_Client as online
import urllib

class online_module():

    def __init__(self):
        self.faceset_outer_id = "Fibonacci_FaceSet_0001"
        self.faceset_token = ""
        self.HOST = "http://api-eu.faceplusplus.com"

        self.client = online()
        res = self.client.getFaceSets()

        for faceset in res['facesets']:
            if faceset['outer_id'] == self.faceset_outer_id:
                self.faceset_token = faceset['faceset_token']
                break

        if self.faceset_token == "":
            res = self.client.createFaceSet(outer_id = self.faceset_outer_id)
            self.faceset_token = res['faceset_token']

    def _jsonFace2Fact(self, json):
        """
            Modify a json dict according to KB-format that encapsulates
            information about faces.

            Params:
                json (dect): json response from API
            Return:
                fact (dict): json fact in KB-format
        """
        attr = json['attributes']
        attr['emotion'] = { k :round(v/100, 4) for k, v in  attr['emotion'].items()}
        attr['gender'] = attr['gender']['value']
        attr['age'] = attr['age']['value']
        attr['smile'] = 'True' if attr['smile']['value'] >= attr['smile']['threshold'] else 'False'
        attr['emotion']['calm'] = attr['emotion'].pop('neutral')

        del json['attributes']
        del json['face_rectangle']

        if 'known' not in json:
            json.update({"known": False})
        if 'confidence_identity' in json:
            json['confidence_identity']  = round(json['confidence_identity']/100, 4)
        else:
            json.update({"confidence_identity": 0})

        json['personID'] = json.pop('face_token')
        json.update(attr)

        return json

    def is_available(self):
        """
            Check server availability.

            Params:

            Return:
                result (bool): if server is available
                    - True: if is possible to connect to the service
                    - False: otherwise
        """
        res = True
        try:
            urllib.request.urlopen(self.HOST, timeout=5)
        except urllib.request.URLError:
            res = False
        return res

    def analyze_face(self, frame, toIdentify = True):
        """
            Recognition routine using API (Face++).
            It provide recognition and emotion detection. The result of operation
            will be added to Kb.

            Params:
                frame: matrix-like, filepath, file descriptor of the image.

            Return: json-like fact, tuple in the format (None, token)
        """
        # take respose from server of face present in the frame
        result = self.client.detect(frame)
        # take list of faces
        faces = result["faces"]
        to_check = True

        if len(faces) > 0:
            # Take only first face because i know that i have one face at time
            # in one frame
            face = faces[0]

            try:
                res = self.client.search(face_token = face["face_token"], faceset_token = self.faceset_token)

                if len(res["results"]) > 0:
                    for candidate in res["results"]:
                        if candidate["confidence"] < 80:
                            #new face add it
                            print("non ti conosco.. mi ricordero")
                            self.client.addFace(faceset_token = self.faceset_token, face_tokens = face["face_token"])
                        else:
                            #I know it and push a tuple to KB
                            print("ti conosco. Sei {}".format(candidate["face_token"]))

                            face["face_token"] = candidate["face_token"]
                            face.update({"known": True})
                            face.update({'confidence_identity' : candidate["confidence"]})
                else:
                    #face doesn't match add it
                    print("non ti conosco.. mi ricordero")
                    self.client.addFace(faceset_token = self.faceset_token, face_tokens = face["face_token"])
            except Exception as e:
                #TODO manage different possible error (this solution resolve EMPRTY_SET VALUE ERROR)
                print(type(e).__name__, e)
                self.client.addFace(faceset_token = self.faceset_token, face_tokens = face["face_token"])
            token = face["face_token"]
            return self._jsonFace2Fact(face), (None, token)
        else:
            return None, None

    def set_detect_attibutes(self, *args, **kwargs):
        self.client.setParamsDetect(*args, **kwargs)
        return self.client.detect_params

    def get_match(self, db, descriptor, desc_position, id_position, return_index=False, return_all=False):
        """
        Finds the matching id of the descriptor in the db, if there is one

        Params:
            db: list of tuples, which contain descriptors and ids
            descriptor: the descriptor to match
            desc_position: position of the descriptor field in db tuples
            id_position: position of the id field in db tuples
            return_index: if true returns also the position in db (None if not found)
            return_all: if true returns a list of all the results (pairs
                (id,index) if return_index=True)
        Return:
            result (int) or (tuple): An id if matching succeeded, else None;
                a pair, or a list of ids, or a list of pairs, according to options
        """
        if return_all:
            if return_index:
                return [(entry[id_position], index) for index, entry in enumerate(db) if entry[desc_position] == descriptor]
            else:
                return [entry[id_position] for entry in db if entry[desc_position] == descriptor]
        else:
            for index, entry in enumerate(db):
                if entry[desc_position] == descriptor:
                    return (entry[id_position], index) if return_index else entry[id_position]
            return (None, None) if return_index else None
