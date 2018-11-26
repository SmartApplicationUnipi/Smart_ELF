import pytest
import os
from face_db import face_db

@pytest.fixture
def db():
    os.remove("face_db")
    db = face_db()
    return db
