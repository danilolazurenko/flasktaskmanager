import sqlite3, json
from os import path
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, flash
from contextlib import closing

DATABASE = path.join('D:\\', 'work', 'pytest', 'flasktaskmanager', 'tmp', 'ftm.db')
DEBUG = True
SECRET_KEY = 'very key'
USERNAME = 'a'
PASSWORD = 'a'
DBFLAG = 0

app = Flask(__name__)
app.config.from_object(__name__)


def connect_db():
    x = DATABASE
    return sqlite3.connect(app.config['DATABASE'])


def init_db():
    with closing(connect_db()) as db:
        ftm_path = path.join('database', 'schema.sql')
        with app.open_resource(ftm_path, mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()


@app.before_request
def before_request():
    g.db = connect_db()


@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()


#init_db() # for database initializing


@app.route('/', methods=['GET', 'POST'])
def show_tasks():
    cur = g.db.execute('select id, title, description, timefortask from tasks order by id desc')
    entries = [dict(id=row[0], title=row[1], description=row[2], timefortask=row[3]) for row in cur.fetchall()]
    return render_template('show_tasks.html', entries=entries)


@app.route('/add', methods=['POST'])
def add_entry():
    if not session.get('logged_in'):
        abort(401)
    g.db.execute('insert into tasks (title, description, timefortask) values ( ?, ?, ?)',
                 [request.form['title'], request.form['description'], request.form['timefortask']])
    g.db.commit()
    flash('New task was successfully posted')
    cur = g.db.execute('select id from tasks where description = (?) and title = (?)', [request.form['description'], request.form['title'] ])
    task_id = [dict(id=row[0]) for row in cur.fetchall()]
    return json.dumps({'status': 'ok', 'id': task_id[0], 'timefortask': request.form['timefortask']})


@app.route('/delete', methods=['POST'])
def delete_entry():
    if not session.get('logged_in'):
        abort(401)
    r = request
    g.db.execute('delete from tasks where id =(?)', [request.form['id']])
    g.db.commit()
    return json.dumps({'status':'ok'})


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_tasks'))
    return render_template('login.html', error=error)


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('show_tasks'))


if __name__ == '__main__':
    app.run()
