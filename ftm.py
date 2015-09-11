#import sqlite3
from connector.connect_db import connect_db
import json
from os import path
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash
from contextlib import closing

# to do: make authorization later

app = Flask(__name__)
app.config.from_object(__name__)
app.config.from_pyfile('ftm-config.cfg')
path_to_database = app.config['DATABASE']
superuser = app.config['USERNAME']
superpassword = app.config['PASSWORD']


def init_db(path_to_db):
    with closing(connect_db(path_to_db)) as db:
        ftm_path = path.join('initdb', 'schema.sql')
        with app.open_resource(ftm_path, mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()


def database_initializer():
    if not path.isfile(path_to_database):
        init_db(path_to_database)
        return True
    else:
        return False


database_initializer()


@app.before_request
def before_request():
    g.db = connect_db(path_to_database)


@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()


@app.route('/', methods=['GET', 'POST'])
def show_tasks():
    cur = g.db.execute('select id, title, description from tasks order by id desc')
    entries = [dict(id=row[0], title=row[1], description=row[2]) for row in cur.fetchall()]
    return render_template('show_tasks.html', entries=entries)


@app.route('/statistics', methods=['GET', 'POST'])
def show_statistics():
    cur = g.db.execute('select id, title, timespent from statistics order by id desc')
    entries = [dict(id=row[0], title=row[1], timespent=row[2]) for row in cur.fetchall()]
    sum_of_times = 0
    for i in entries:
        i['timespent'] = i['timespent']/60000.0
        sum_of_times += i['timespent']
    sum_of_times = sum_of_times/60.0
    return render_template('show_statistics.html', entries=entries, overall_time = sum_of_times)


@app.route('/add', methods=['POST'])
def add_entry():
    if not session.get('logged_in'):
        abort(401)
    g.db.execute('insert into tasks (title, description) values (?, ?)',
                 [request.form['title'], request.form['description']])
    g.db.commit()
    flash('New task was successfully posted')
    cur = g.db.execute('select id from tasks where description = (?) and title = (?)', [request.form['description'], request.form['title']])
    task_id = [dict(id=row[0]) for row in cur.fetchall()]
    return json.dumps({'status': 'ok', 'id': task_id[0]})


@app.route('/finishtask', methods = ['POST'])
def finish_task():
    if not session.get('logged_in'):
        abort(401)
    g.db.execute('insert into statistics (title, timespent) values (?, ?)', [request.form['title'], request.form['timespent']])
    g.db.commit()
    g.db.execute('delete from tasks where id = (?)', [request.form['id']])
    g.db.commit()
    flash('Task finished')
    return json.dumps({'status': 'ok'})


@app.route('/delete', methods=['POST'])
def delete_entry():
    if not session.get('logged_in'):
        abort(401)
    g.db.execute('delete from tasks where id =(?)', [request.form['id']])
    g.db.commit()
    return json.dumps({'status': 'ok'})


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        cur = g.db.execute('select login, password from logins_passwords where login = (?)', [request.form['username']])
        credentials = cur.fetchall()
        if request.form['username'] == superuser and request.form['password'] == superpassword:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_tasks'))
        elif credentials == []:
            error = 'Invalid username'
        elif credentials[0][1] != request.form['password']:
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


@app.route('/register', methods=['GET', 'POST'])
def register():
    error = None
    if request.method == 'POST':
        cur = g.db.execute('select login from logins_passwords')
        login_list = cur.fetchall()
        m = request.form['username'],
        if m in login_list:
            flash('There is already such user, pick another username, please.')
        else:
            g.db.execute('insert into logins_passwords (login, password) values (?, ?)', [request.form['username'], request.form['password']])
            g.db.commit()
            flash('Registered successfully.')
    return render_template('register.html', error=error)


if __name__ == '__main__':
    app.run()
