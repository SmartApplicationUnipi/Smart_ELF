import pytest

def test_db_len(db):

    assert len(db) == 0

    with pytest.raises(AttributeError):
        db[0] = (1, "ciao", "due")

    with pytest.raises(AttributeError):
        db["1"] = (1, "ciao", "due")

    db[0] = ("ciao", "due")
    db["1"] = ("cip", "ciop")
    assert len(db) == 2

    db.delete((None, None, None))

def test_db_set_get(db):

    db[5] = ("co", "de")
    assert set(db["5"][0]) == set(("5", "co", "de"))
    db[5] = ("coco", "de")
    assert set(db["5"][0]) == set(("5", "coco", "de"))
    db[5] = ("co", "del")
    assert set(db["5"][0]) == set(("5", "co", "del"))

    # get no str
    db[0] = ("ciao", "due")
    db[1] = ("ciaociao", "tre")

    assert set(db[0][0]) == set(("0", "ciao", "due"))
    #get str
    assert set(db["1"][0]) == set( ("1", "ciaociao", "tre"))

    # IndexError if not present
    with pytest.raises(IndexError):
        db["2"]

    db.delete((None, None, None))


# if __name__ == '__main__':
#     db = face_db()
#     ################################################################ __delitem__
#
#     # del no str
#     del db[1]
#     assert len(db) == 2
#     try:
#         db[1]
#     except IndexError as e: pass
#     else: print("Error")
#
#     #del string
#     db["1"] = ("cip", "ciop")
#     del db["1"]
#     assert len(db) == 2
#     try:
#         db["1"]
#     except IndexError as e: pass
#     else: print("Error")
#
#     ############################################################### __contains__
#
#     db["1"] = ("cip", "ciop")
#     db["gino"] = ("tre", "porci")
#
#     assert ("1", "cip", "ciop") in db
#     assert ("gino", "tre", "porci") in db
#
#     ################################################################## get_value
#
#     assert set(db.get_value(1)[0]) == set(("cip", "ciop"))
#     assert set(db.get_value("gino")[0]) == set(("tre", "porci"))
#
#     try:
#         db.get_value("giangiacomo")
#     except IndexError as e: pass
#     else: print("Error")
#     try:
#         db.get_value("10")
#     except IndexError as e: pass
#     else: print("Error")
#
#     assert set(db.get_value("gino", 1)[0]) == set(("tre"))
#     assert set(db.get_value("gino", 2)[0]) == set(("porci"))
#
#     try:
#         db.get_value("gino", 3)
#     except IndexError as e: pass
#     else: print("Error")
#
#     db.insert(("1", "cipi", "ciopi"))
#     assert list(db.get_value(1)) == list([["cip", "ciop"],["cipi", "ciopi"]])
#
#     ################################################################## fuzzy_get
#
#     assert len(db.fuzzy_get((1, "cipi", "ciopi"))) == 1
#
#     db["1"] = (None, "cio")
#     db["2"] = (None, "cio")
#     assert len(db.fuzzy_get((None, "cio"))) == 3
#     assert list(db.fuzzy_get((None, None, "cio"))) == list([["1", "cip", "cio"], ["1", "cipi", "cio"], ["2", None, "cio"]])
#
#     db["giacomino"] = ("cipi", "gamba")
#     assert list(db.fuzzy_get(("cipi", None))) == list([["1", "cipi", "cio"],["giacomino", "cipi", "gamba"]])
#     assert len(db.fuzzy_get((None, "cipi", None))) == 2
#
#     ############################################################## fuzzy_contain
#
#     assert db.fuzzy_contain(1)
#     assert db.fuzzy_contain("1")
#     assert db.fuzzy_contain((1, "cipi", "ciopi"))
#     assert db.fuzzy_contain((None, "cio"))
#     assert db.fuzzy_contain((None, "cipi", None))
#
#     assert not db.fuzzy_contain(205)
#     assert not db.fuzzy_contain((200, "cipi", None))
#     assert not db.fuzzy_contain((None, "fritto", None))
#     assert not db.fuzzy_contain((None, "cipolle"))
#
#     ##################################################################### insert
#
#     db.insert(("1", "cipi", "ciopi"))
#     assert len(db) == 8
#
#     gid = db.insert(("matro", "ciccillo"))
#     assert len(db) == 9
#     id = db.fuzzy_get(("matro", "ciccillo"))[0][0]
#     assert id == gid
#
#     try:
#         db.insert(("1", "cipi", "ciopi"))
#     except ValueError as e: pass
#     else: print("insert_Error")
#
#     ##################################################################### modify
#
#     l, mod = db.modify(1, ("cic", None))
#     assert l == 3
#     assert list(mod) == list([["1", "cip", "cio"], ["1", "cipi", "cio"], ["1", "cipi", "ciopi"]])
#     assert list(db.fuzzy_get((1, "cic", None))) == list([["1", "cic", "cio"], ["1", "cic", "ciopi"]])
#
#     l, mod = db.modify((1, "cic", None), (35, "c0c", None))
#     assert l == 2
#     assert list(mod) == list([["1", "cic", "cio"], ["1", "cic", "ciopi"]])
#     assert list(db.fuzzy_get((35, "c0c", None))) == list([["35", "c0c", "cio"], ["35", "c0c", "ciopi"]])
#
#     ##################################################################### delete
#
#     assert db.delete((None, None, "cio")) == 2
#     assert len(db) == 6
#
#     assert db.delete(1) == 0
#     assert len(db) == 6
#
#     assert db.delete(35) == 1
#     assert len(db) == 5
#
#     assert db.delete((0, "ciao", None)) == 1
#     assert len(db) == 4
#
#     db.delete((None, None, None)) == 4
#     assert len(db) == 0
#
#     db["i"] = ("prova", "n")
#     db["puoi"] = ("mettere qualisasi", "key")
#     db["che però"] = ("sia", "stringable")
