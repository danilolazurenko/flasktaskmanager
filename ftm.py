# todo: fully redesign app, make it work smoothly, if after reforming it won't be payed, go to next task
from db.connect_db import connect_db
import json
from os import path
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash


app = Flask(__name__)
app.config.from_object(__name__)
app.config.from_pyfile('ftm-config.cfg')
path_to_database = path.join('database', 'ftm.db')
superuser = app.config['USERNAME']
superpassword = app.config['PASSWORD']


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
    cur = g.db.execute('select id, title, description from tasks where status = "idle" or status = "not_started" order by id desc')
    entries = [dict(id=row[0], title=row[1], description=row[2]) for row in cur.fetchall()]
    return render_template('show_tasks.html', entries=entries)


@app.route('/statistics', methods=['GET', 'POST'])
def show_statistics():
    cur = g.db.execute('select id, title, description, status from tasks order by id desc')
    tasks = [dict(id=row[0], title=row[1], description=row[2], status=row[3]) for row in cur.fetchall()]
    for i in tasks:
        cur = g.db.execute('select statistics_id, starttime, endtime from tasks_statistics where track_period = (?) order by statistics_id desc', [i['id']])
        i['entries'] = [dict(id=row[0], starttime=row[1], endtime=row[2]) for row in cur.fetchall()]
    return render_template('show_statistics.html', tasks=tasks)


@app.route('/add', methods=['POST'])
def add_entry():
    if not session.get('logged_in'):
        abort(401)
    g.db.execute('insert into tasks (title, description, status, timespent) values (?, ?, ?, ?)',
                 [request.form['title'], request.form['description'], 'not_started', 0.0])
    g.db.commit()
    cur = g.db.execute('select id from tasks where description = (?) and title = (?) and status = (?)', \
                       [request.form['description'], request.form['title'], 'not_started'])
    task_id = [dict(id=row[0]) for row in cur.fetchall()]
    return json.dumps({'status': 'ok', 'id': task_id[0]})


@app.route('/updatetask', methods=['POST'])
def update_entry():
    if not session.get('logged_in'):
        abort(401)
    g.db.execute('update tasks set status = (?) where id = (?)', [request.form['status'], request.form['task_id']])
    g.db.commit()
    g.db.execute('insert into tasks_statistics (starttime, endtime, track_period) values (?, ?, ?)', \
                 [request.form['StartingTime'], request.form['EndingTime'], request.form['task_id']])
    g.db.commit()
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
