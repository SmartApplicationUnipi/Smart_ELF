

class FaceSet:
    """
    Shared database of faces used by the Vision module's Controller.
    It is a list of triples <face_descriptor, id, token>  where:
    - face_descriptor: array of 128 floats encoding the face
    - id: identifier assigned by the offline (and online) module
    - token:  identifier assigned by the online module
    """

    # position of fields within the triple
    DESCRIPTOR = 0
    ID = 1
    TOKEN = 2

    def __init__(self):
        self.face_list = []

    def add_person(self, triple):
        self.face_list.appen(triple)

    def add_person(self, desc, id, token=None):
        triple = (desc, id, token)
        self.face_list.appen(triple)

    def delete_person(self, arg):
        # TODO what argument to pass? triple? id? descriptor? token?
        pass

    def get_match(self, ...):
        # use the function get_match of offline module
        pass
