from flask_wtf import FlaskForm
from wtforms import TextField, PasswordField, BooleanField
import wtforms.validators as validators
from global_settings import *

class RegistrationForm(FlaskForm):
    user_id = TextField(
        'User ID', 
        [validators.Length(min=user_id_min_len, max=user_id_max_len)])
    email = TextField(
        'Email Address', 
        [validators.Length(min=user_email_min_len, max=user_email_max_len)])
    password = PasswordField(
        'New Password', 
        [
            validators.Required(),
            validators.EqualTo('confirm', message='Passwords must match')
        ])
    confirm = PasswordField('Repeat Password')
    accept_tos = BooleanField(
        'I accept the Terms of Service and Privacy Notice (updated Jan TODO, TODO)', 
        [validators.Required()])