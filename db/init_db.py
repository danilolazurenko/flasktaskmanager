from contextlib import closing
from os import path
from connect_db import connect_db

path_to_database = path.join('..', 'database', 'ftm.db')


def init_db(path_to_db):
    with closing(connect_db(path_to_db)) as db:
        ftm_path = path.join('.', 'data', 'schema.sql')
        with open(ftm_path, mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()


init_db(path_to_database)