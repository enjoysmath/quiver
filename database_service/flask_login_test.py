from flask_login import (current_user, LoginManager, login_user, 
                         logout_user, login_required)
from flask import *
import os
import json
from queries import query_user, create_user
from db_credentials import db_uri
from validators import *

app = Flask(__name__)

app.config['SECRET_KEY'] = os.urandom(32)


@app.route('/editor/')
def editor():
    username = None
    
    if g.user:
        username = g.user['user_id']
        
    return render_template('editor.html', name=username)
    


@app.before_request
def before_request():
    g.user = None
    if 'user_id' in session:
        user = query_user(session['user_id'])
        if user:
            g.user = user
            return
        

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = request.form['username']    
        passw = request.form['password']
        
        user = query_user(user)
        
        if user:       
            if user['password'] == passw:
                session['user_id'] = user['user_id']
                return redirect(url_for('editor'))
            
    return render_template('login.html', error="Username or password incorrect")


@app.route('/profile', methods=['GET'])
def profile():
    if g.user:
        return render_template('profile.html')             
    return redirect(url_for('login'))    


@app.route('/register/', methods=["GET","POST"])
def register_new_user():
    error = None
    
    if request.method == 'POST':
        form = request.form
        username = form.get('username', None)
        error = validate_username(username)
        
        if not error:
            user = query_user(username)
            
            if user:
                error = "That user name already exists"
                
            password = form.get('password', None)
            error = validate_password(password)
            
            if not error:
                confirm = form.get('confirm', None)
                if password == confirm:
                    email = form.get('email', None)
                    email = validate_email(email)
                    
                    if email is not None:
                        user = create_user(username, password, email)
                        
                        if user:
                            session['user_id'] = username
                            return redirect(url_for('editor'))
                        else:
                            error = "Unable to create a new user"
                    else:
                        error = "Invalid email address"                                            
                else:
                    error = "Incorrect username or password"
            
    return render_template('register.html', error=error)
    

if __name__ == "__main__":
    if 'WINGDB_ACTIVE' in os.environ:
        app.debug = False   # Let Wing handle the debugging
    app.run(use_reloader=True)
