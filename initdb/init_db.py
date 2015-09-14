from flask import Flask
from contextlib import closing
from os import path
from connector.connect_db import connect_db

app = Flask('__main__')
app.config.from_object('__main__')


def init_db(path_to_db):
    with closing(connect_db(path_to_db)) as db:
        ftm_path = path.join('initdb', 'schema.sql')
        with app.open_resource(ftm_path, mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

'''
path_to_database = path.join('database', 'ftm.db')
#TODO: resolve question whether this piece of code is useful
def database_initializer(db_path):
    if not path.isfile(db_path):
        init_db(db_path)
        return True
    else:
        return False

#database_initializer(path_to_database) ?'''