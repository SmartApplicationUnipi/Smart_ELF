from os.path import isfile
import json
from random import choice as pick
from string import ascii_lowercase as letters
from copy import deepcopy

from numpy import ndarray
from numpy.linalg import norm

from threading import Timer
from logging import getLogger
log = getLogger("Face_Database.Saver")


def _validate_key(key):
    not_valid = "^@,.;:&=*\'\"()[]{}"
    try:
        key = str(key)
        if any(s in key for s in list(not_valid)):
            raise TypeError("the key o str(key) must not contain" +" ".join(not_valid) + " any of this char.")
    except Exception as e:
        raise TypeError("key must be stringable")
    return key

def _is_valid_value(value):
    return len(value) == 2 and any(isinstance(x, str) or x is None for x in value)

def _random_key():
    return ''.join(pick(letters) for _ in range(10))

def _take(item_or_value):
    key = None
    if len(item_or_value) == 3: #item
        if item_or_value[0] is not None:
            key = _validate_key(item_or_value[0])
        value = item_or_value[1:]
        if not _is_valid_value(value):
            raise AttributeError("last 2 element of item must be str o None value")
    elif _is_valid_value(item_or_value): #value
        value = item_or_value
    else:
        raise AttributeError("attribute must be a item or a value")
    return key, value

def _comparator_token(first_token, second_token):
    return first_token == second_token, 1

def _comparator_descriptor(first_descr, second_descr, threshold = 0.6):
    """
    Computes Euclidean distance between two face descriptors. The first descriptor may be
    None, that case the distance is set to infinity.

    @ params:
        - first_descr: descriptor
        - second_descr: descriptor
        - threshold: distnce threshold to determine if there was a match
    @ returns:
        - known: [True, False] whether there was a match or not
        - confidence: [0,1] confidence about the match
    """
    distance = float('inf') if first_descr is None else norm(first_descr - second_descr)
    known = (distance < threshold)
    confidence = round(max(1 - distance/threshold, 0), 4)
    #print (known, confidence, distance)
    return known, confidence

class face_db():
    """
        Shared database of faces used by the Vision module's Controller.
        It is a list of item that is a list of [id, face_descriptor, token] where:
        - id: identifier assigned by controller or generate at runtime
        - face_descriptor: array of 128 floats encoding the face
        - token: identifier assigned by the online module
    """

    # position of fields within the triple
    ID = 0
    DESCRIPTOR = 1
    TOKEN = 2

    def __init__(self, path_db = "face_db", save_every_minute = 10):
        self.PATH_DB = path_db
        self.file = None
        self.database = []

        exist = isfile(self.PATH_DB)
        if exist:
            try:
                with open(self.PATH_DB, 'r+') as f:
                    self.database = json.load(f)
            except json.decoder.JSONDecodeError:
                pass

        self.t = None
        self._saver(save_every_minute)
        log.debug("The DataBase will be save every " + str(save_every_minute) + " minutes.")

    def _saver(self, save_every_minute):
        self.close()
        log.debug("The DataBase has been permanently saved on the disk")
        self.t = Timer(save_every_minute * 60, self._saver, [save_every_minute])
        self.t.start()


    def __getitem__(self, key):
        """
            Get all element in db that have the key requested.
            The metod can be call with db[key]

            Params:
                key (str): key that will be searched

            Return:
                res(list(item)): return a list of item that have the requested key
        """
        key = _validate_key(key)
        res = []
        for e in self.database:
            if e[0] == key:
                res.append(e)
        if res == []:
            raise IndexError("The key not exist.")
        return res

    def get_value(self, key, which = -1):
        """
            Get value of element in db that have the key requested. The value is
            token and descriptor if which is not specified or return a list of
            requested value; 1 for descriptor, 2 for token.

            Params:
                key (str): key that will be searched
                [which] (int):  which value you want. Default is -1 and get both
                    descriptor and token.If set 1 get descriptor, 2 to get token

            Return:
                res(list(item)): return a list of value requested that have the
                    requested key
        """
        if which != -1 and not(which > 0 and which < 3):
            raise IndexError("which not valid")
        _slice = (slice(which,which+1) if which != -1 else slice(1,3))

        res = []
        for e in self[key]:
            res.append(e[_slice])
        return res

    def _remove_duplicate(self):
        """
            Private function.
            Remove all duplicate in the database with the exact match.
        """
        res = []
        for e in self.database:
            if not e in res:
                res.append(e)
        self.database = res

    def _soft(self, item_or_value_or_key, do_list):
        """
            Private function.
            Function that compute a match between all item in the database
            and a passed item. The match of item is computed for each element in
            the tuple, if an element of passed tuple is None the position will
            be ingnored. The maching function is a function that are passed in
            __init__. The final result is a list of position of item that are
            matched or a bool (i have a match or not).

            Params:
                item_or_value (tuple): A tuple of item or a tuple that contain
                    (descriptor, token) to make a match an item in the database.
                do_list (bool): if a list of items is returned or if it has had
                    a match.

            Return:
                [result] (list(int)): if do_list is True; list of position of
                    element in the database that are match
                [result] (bool): if do_list is False; if has an item that match.
        """
        try:
            key = _validate_key(item_or_value_or_key)
        except TypeError: pass
        else:
            if not do_list:
                for e in self.database:
                    if e[0] == key:
                        return True
                return False
            else:
                item_or_value_or_key = (key, None, None)

        cmp = [_comparator_descriptor, _comparator_token]
        # cmp = [_comparator_token, _comparator_token] #for tests
        res = []
        key, item = _take(item_or_value_or_key)
        i = 1 if item[0] is None else 0
        j = 1 if item[1] is None else 2
        for p, e in enumerate(self.database):
            match = []
            conf = 1
            for x,y,c in zip(e[i+1:j+1], item[i:j], [0,1][i:j]):
                _match, _conf = cmp[c](x,y)
                match.append(_match)
                conf = min(conf, _conf)
            if any(match) or item[i:j] is ():
                if key is None:
                    res.append([p, conf])
                elif key == e[0]:
                    res.append([p, conf])
                if not do_list and len(res) > 0:
                    return True

        if not do_list:
            return False
        return res

    def soft_contain(self, item_or_value_or_key):
        """
            Check if item is contained id the database. The match is computed by
            _soft, view _soft docs.

            Params:
                item_or_value (tuple): A tuple of item or a tuple that contain
                    (descriptor, token) to make a match an item in the database.

            Return:
                res (bool): True if item is contained False otherwise
        """
        return self._soft(item_or_value_or_key, do_list = False)

    def soft_get(self, item_or_value_or_key):
        """
            Get all item that match passed item with item in the database. The
            match is computed by _soft, view _soft docs.

            Params:
                item_or_value (tuple): A tuple of item or a tuple that contain
                    (descriptor, token) to make a match an item in the database.

            Return:
                res (list(item)): List of element that match passed item in the
                    database.
        """
        res = self._soft(item_or_value_or_key, do_list = True)
        return sorted([[self.database[i], conf] for i, conf in res], key=lambda x: -x[1])

    def __len__(self):
        return len(self.database)

    def __setitem__(self, key, value):
        """
            Insert a new item if key is not present in the database or modify an
            item with passed key with the passed value.

            Params:
                key (str): the generic id assigned
                value (tuple): A tuple that contain (descriptor, token) that
                    will be insert in or modify the database.

            Return:
                key (str): the that are assigned at a new item
        """
        key = _validate_key(key)

        if _is_valid_value(value):
            try: res = self[key]
            except IndexError:
                self.database.append([key, *value])
            else:
                for e in res: #modify only not None value in a tule
                    e[1:] = [ e[l+1] if value[l] is None else value[l] for l in range(2)]
        else:
            raise AttributeError("Value must be 2 element in [str, None] value")

    def __delitem__(self, key):
        """
            Delete all element with that key with notation del self[key]
        """
        key = _validate_key(key)
        try:
            for e in self[key]:
                self.database.remove(e)
        except IndexError as e: pass
        # If i have a IndexError then i not have element with requested key

    def __contains__(self, item):
        """
            Exact contain of item in the database (id, offline_id, online_id)

            Return:
                result (bool): True if item is contained False otherwise
        """
        key, value = _take(item)
        if key is None:
            raise AttributeError("The param must be a item defined above.")

        try:
            for e in self[key]:
                if set(e[1:]) == set(value):
                    return True
        except IndexError as e: pass
        return False

    def insert(self, item_or_value):
        """
            Insert a new item or value passed in the database. If the tuple contain
            only (descriptor, token) the unique key is autogenerated and
            added at the tuple to complete a item.

            Params:
                item_or_value (tuple): A tuple of item or a tuple that
                    contain (descriptor, token) that will be insert in the
                    database.

            Return:
                key (str): the that are assigned at a new item
        """
        key, value = _take(item_or_value)

        while not key:
            key = _random_key()
            key = key if not (_random_key(), None, None) in self else None

        if not (key, *value) in self:
            self.database.append([key, *value])
            return key
        else:
            raise ValueError("Not valid operation: you try to modify or there is yet a element an element not insert one")

    def modify(self, item_or_key, item_or_value_modified):
        """
            Modify all element that match the item or value passed with the item
            or value passed in item_or_value_modified. The match is
            computed by _soft, view _soft docs.

            Params:
                item_or_key (tuple): A tuple of item or a key that you want
                    modify in the database.
                item_or_value_modified (tuple): A tuple of item or a tuple that
                    contain (descriptor, token) that will be substituted at item
                    or value taked.

            Return:
                n_modified (int): num of element modified in the database
                modified (list(item)): element that are modified in the database
        """
        try:
            key = _validate_key(item_or_key)
        except TypeError:
            key, value = _take(item_or_key)
        else:
            item_or_key = (key, None, None)

        key_m, value_m = _take(item_or_value_modified)

        to_mod = self._soft(item_or_key, True)
        if to_mod is None:
            raise Exception("Not valid operation: you try to insert an element not modify one")

        ele_mod = deepcopy([self.database[i] for i, _ in to_mod])
        value = (key_m, *value_m)
        for i, _ in to_mod:
            self.database[i] = ([self.database[i][l] if value[l] is None else value[l] for l in range(3)])

        self._remove_duplicate()
        return len(to_mod), ele_mod

    def delete(self, item_or_value_or_key):
        """
            Delete all element that match the item or value passed. The match is
            computed by _soft, view _soft docs.

            Params:
                item_or_value (tuple): A tuple of item or a tuple that contain
                    (descriptor, token) to make a match an item in the database.

            Return:
                n_deleted (int): num of element deleted in the database
                deleted (list(item)): element that are deleted in the database
        """
        to_del = self._soft(item_or_value_or_key, True)
        if to_del is None: return 0, []

        ele_del = deepcopy([self.database[i] for i, _ in to_del])
        for i, _ in to_del[::-1]:
            del self.database[i]
        return len(to_del), ele_del

    def __str__(self):
        return str(self.database)

    def close(self):
        self.database = [[list(j) if isinstance(j, ndarray) else j for j in i] for i in self.database]
        with open(self.PATH_DB, 'w') as file:
            json.dump(self.database, file)

        if self.t and self.t.is_alive():
            self.t.cancel()

    def __del__(self):
        self.close()
