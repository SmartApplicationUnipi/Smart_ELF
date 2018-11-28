import pytest
import os
from face_db import face_db

def eq(uno, due):
    return uno == due

@pytest.fixture
def db():
    DB_PATH = "face_db"
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    return face_db(eq, eq, DB_PATH)
