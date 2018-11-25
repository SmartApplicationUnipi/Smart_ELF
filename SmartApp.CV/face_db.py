from os.path import isfile
import json
from random import choice as pick
from string import ascii_lowercase as letters
from copy import deepcopy

# TODO: Inserire la documentazione per le funzioni
# TODO: applicare un po di refactoring
# TODO: dividere i test dalla classe

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

class face_db():

    PATH_DB = "face_db"
    OFFLINE_ID = 1
    ONLINE_ID = 2

    def __init__(self):
        self.file = None
        self.database = None
        exist = isfile(face_db.PATH_DB)
        if exist:
            self.database = json.load(open(face_db.PATH_DB, 'r+'))
            self.file = open(face_db.PATH_DB, 'w')
        else:
            self.file = open(face_db.PATH_DB, 'w')
            self.database = []

    def __getitem__(self, key):
        key = _validate_key(key)

        res = []
        for e in self.database:
            if e[0] == key:
                res.append(e)
        if res == []:
            raise IndexError("The key not exist.")
        return res

    def get_value(self, key, which = -1):
        res = []
        for e in self[key]:
            if which != -1:
                if which > 0 and which < len(e):
                    res.append(e[which])
                else:
                    raise IndexError("which not valid")
            else:
                res.append(e[1:])
        return res

    def _remove_duplicate(self):
        res = []
        for e in self.database:
            if not e in res:
                res.append(e)
        self.database = res

    def _fuzzy(self, item_or_value_or_key, do_list):
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

        res = []
        key, item = _take(item_or_value_or_key)
        i = 1 if item[0] is None else 0
        j = 1 if item[1] is None else 2
        for p, e in enumerate(self.database):
            if any(x == y for x,y in zip(e[i+1:j+1], item[i:j])) or item[i:j] is ():
                if key is None:
                    res.append(p)
                elif key == e[0]:
                    res.append(p)

                if not do_list:
                    if len(res) > 0:
                        return True

        if not do_list:
            return False
        if res == []:
            return None
        return res

    def fuzzy_contain(self, item_or_value_or_key):
        """
            fuzzy contain item vedi fuzzy_get
        """
        return self._fuzzy(item_or_value_or_key, do_list = False)

    def fuzzy_get(self, item_or_value_or_key):
        """
            take item in fuzzy
        """
        res = self._fuzzy(item_or_value_or_key, do_list = True)
        if res is not None:
            return [self.database[i] for i in res]
        else:
            return None

    def __len__(self):
        return len(self.database)

    def __setitem__(self, key, value):
        key = _validate_key(key)

        if _is_valid_value(value):
            try:
                res = self[key]
            except IndexError:
                self.database.append([key, *value])
            else:
                for e in res:
                    e[1:] = [ e[l+1] if value[l] is None else value[l] for l in range(2)]
        else:
            raise AttributeError("Value must be 2 element in [str, None] value")

    def __delitem__(self, key):
        key = _validate_key(key)
        try:
            for e in self[key]:
                self.database.remove(e)
        except IndexError as e: pass

    # def __iter__(self):
    # def __reversed__(self):

    def __contains__(self, item):
        """
            exact contain of item of database (id, offline_id, online_id)
        """
        key, value = _take(item)
        if key is None:
            raise AttributeError("must be a item")

        try:
            for e in self[key]:
                if set(e[1:]) == set(value):
                    return True
        except IndexError as e: pass
        return False

    def insert(self, item_or_value):
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
        try:
            key = _validate_key(item_or_key)
        except TypeError:
            key, value = _take(item_or_key)
            if key is None:
                raise IndexError("key not exist")
        else:
            item_or_key = (key, None, None)

        key_m, value_m = _take(item_or_value_modified)

        to_mod = self._fuzzy(item_or_key, True)
        if to_mod is None:
            raise Exception("Not valid operation: you try to insert an element not modify one")

        ele_mod = deepcopy([self.database[i] for i in to_mod])
        value = (key_m, *value_m)
        for i in to_mod:
            self.database[i] = ([self.database[i][l] if value[l] is None else value[l] for l in range(3)])

        self._remove_duplicate()
        return len(to_mod), ele_mod

    def delete(self, item_or_value_or_key):
        to_del = self._fuzzy(item_or_value_or_key, True)
        if to_del is None:
            return 0
        for i in to_del[::-1]:
            del self.database[i]
        return len(to_del)

    def __str__(self):
        return str(self.database)

    def __del__(self):
        json.dump(self.database, self.file)
        self.file.close()

if __name__ == '__main__':
    data = face_db()

    data.delete((None, None, None))
    #################################################################### __len__
    assert len(data) == 0

    ################################################################ __setitem__
    try:
        data[0] = (1, "ciao", "due")
    except AttributeError as e: pass
    else: print("Error")

    try:
        data["1"] = (1, "ciao", "due")
    except AttributeError as e: pass
    else: print("Error")

    data[0] = ("ciao", "due")
    data["1"] = ("cip", "ciop")
    assert len(data) == 2

    data[5] = ("co", "de")
    assert set(data["5"][0]) == set(("5", "co", "de"))
    data[5] = ("coco", "de")
    assert set(data["5"][0]) == set(("5", "coco", "de"))
    data[5] = ("co", "del")
    assert set(data["5"][0]) == set(("5", "co", "del"))

    assert len(data) == 3

    ################################################################ __getitem__

    # get no str
    assert set(data[0][0]) == set(("0", "ciao", "due"))

    #get str
    assert set(data["1"][0]) == set(("1", "cip", "ciop"))

    # IndexError if not present
    try:
        data["2"]
    except IndexError as e: pass
    else: print("Error")

    ################################################################ __delitem__

    # del no str
    del data[1]
    assert len(data) == 2
    try:
        data[1]
    except IndexError as e: pass
    else: print("Error")

    #del string
    data["1"] = ("cip", "ciop")
    del data["1"]
    assert len(data) == 2
    try:
        data["1"]
    except IndexError as e: pass
    else: print("Error")

    ############################################################### __contains__

    data["1"] = ("cip", "ciop")
    data["gino"] = ("tre", "porci")

    assert ("1", "cip", "ciop") in data
    assert ("gino", "tre", "porci") in data

    ################################################################## get_value

    assert set(data.get_value(1)[0]) == set(("cip", "ciop"))
    assert set(data.get_value("gino")[0]) == set(("tre", "porci"))

    try:
        data.get_value("giangiacomo")
    except IndexError as e: pass
    else: print("Error")
    try:
        data.get_value("10")
    except IndexError as e: pass
    else: print("Error")

    assert set(data.get_value("gino", 1)[0]) == set(("tre"))
    assert set(data.get_value("gino", 2)[0]) == set(("porci"))

    try:
        data.get_value("gino", 3)
    except IndexError as e: pass
    else: print("Error")

    data.insert(("1", "cipi", "ciopi"))
    assert list(data.get_value(1)) == list([["cip", "ciop"],["cipi", "ciopi"]])

    ################################################################## fuzzy_get

    assert len(data.fuzzy_get((1, "cipi", "ciopi"))) == 1

    data["1"] = (None, "cio")
    data["2"] = (None, "cio")
    assert len(data.fuzzy_get((None, "cio"))) == 3
    assert list(data.fuzzy_get((None, None, "cio"))) == list([["1", "cip", "cio"], ["1", "cipi", "cio"], ["2", None, "cio"]])

    data["giacomino"] = ("cipi", "gamba")
    assert list(data.fuzzy_get(("cipi", None))) == list([["1", "cipi", "cio"],["giacomino", "cipi", "gamba"]])
    assert len(data.fuzzy_get((None, "cipi", None))) == 2

    ############################################################## fuzzy_contain

    assert data.fuzzy_contain(1)
    assert data.fuzzy_contain("1")
    assert data.fuzzy_contain((1, "cipi", "ciopi"))
    assert data.fuzzy_contain((None, "cio"))
    assert data.fuzzy_contain((None, "cipi", None))

    assert not data.fuzzy_contain(205)
    assert not data.fuzzy_contain((200, "cipi", None))
    assert not data.fuzzy_contain((None, "fritto", None))
    assert not data.fuzzy_contain((None, "cipolle"))

    ##################################################################### insert

    data.insert(("1", "cipi", "ciopi"))
    assert len(data) == 8

    gid = data.insert(("matro", "ciccillo"))
    assert len(data) == 9
    id = data.fuzzy_get(("matro", "ciccillo"))[0][0]
    assert id == gid

    try:
        data.insert(("1", "cipi", "ciopi"))
    except ValueError as e: pass
    else: print("insert_Error")

    ##################################################################### modify

    l, mod = data.modify(1, ("cic", None))
    assert l == 3
    assert list(mod) == list([["1", "cip", "cio"], ["1", "cipi", "cio"], ["1", "cipi", "ciopi"]])
    assert list(data.fuzzy_get((1, "cic", None))) == list([["1", "cic", "cio"], ["1", "cic", "ciopi"]])

    l, mod = data.modify((1, "cic", None), (35, "c0c", None))
    assert l == 2
    assert list(mod) == list([["1", "cic", "cio"], ["1", "cic", "ciopi"]])
    assert list(data.fuzzy_get((35, "c0c", None))) == list([["35", "c0c", "cio"], ["35", "c0c", "ciopi"]])

    ##################################################################### delete

    assert data.delete((None, None, "cio")) == 2
    assert len(data) == 6

    assert data.delete(1) == 0
    assert len(data) == 6

    assert data.delete(35) == 1
    assert len(data) == 5

    assert data.delete((0, "ciao", None)) == 1
    assert len(data) == 4

    data.delete((None, None, None)) == 4
    assert len(data) == 0

    data["i"] = ("prova", "n")
    data["puoi"] = ("mettere qualisasi", "key")
    data["che però"] = ("sia", "stringable")
