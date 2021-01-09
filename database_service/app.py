from flask import Flask, render_template, redirect, url_for, g
from flask_bootstrap import Bootstrap
from flask_wtf import FlaskForm 
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import InputRequired, Email, Length
from flask_sqlalchemy  import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from graph_db_credentials import db_user, db_password, db_uri
import os
from global_settings import username_length, password_length, email_length

app = Flask(__name__)

app.config['SECRET_KEY'] = 'Thisissupposedtobesecret!'

cwd = os.getcwd()
cwd = cwd[cwd.index(':') + 2:]
cwd = os.path.join(os.path.dirname(cwd), os.path.basename(cwd), 'user_database.db')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////' + cwd

bootstrap = Bootstrap(app)
db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(username_length.max), unique=True)
    email = db.Column(db.String(email_length.max), unique=True)
    password = db.Column(db.String(password_length.max))


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class LoginForm(FlaskForm):
    username = StringField('username', validators=[InputRequired(), username_length])
    password = PasswordField('password', validators=[InputRequired(), password_length])
    remember = BooleanField('remember me')

class RegisterForm(FlaskForm):
    email = StringField('email', validators=[InputRequired(), Email(message='Invalid email'), email_length])
    username = StringField('username', validators=[InputRequired(), username_length])
    password = PasswordField('password', validators=[InputRequired(), password_length])


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if check_password_hash(user.password, form.password.data):
                login_user(user, remember=form.remember.data)
                return redirect(url_for('index'))
            
        error = '<h1>Invalid username or password</h1>'
    
    return render_template('login.html', form=form, error=g.error)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    form = RegisterForm()
    error = None

    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if not user:
            hashed_password = generate_password_hash(form.password.data, method='sha256')
            new_user = User(username=form.username.data, email=form.email.data, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            return redirect(url_for('login'))
        else:
            error = "That username already exists"        
        
    return render_template('signup.html', form=form, error=error)


@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', name=current_user.username)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(debug=True)
