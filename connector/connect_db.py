import sqlite3


def connect_db(path_to_db):
    return sqlite3.connect(path_to_db)
