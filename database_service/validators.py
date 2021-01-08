import re
from global_settings import *
from email_validator import EmailNotValidError
import email_validator

username_regex = re.compile(r'^(\-|[_a-zA-Z0-9])+$')


def validate_username(username:str):
    """
    Returns non-empty string on error.
    """
    if not username:
        return "A username should be provided."
    
    if len(username) > user_id_max_len or \
       len(username) < user_id_min_len:
        return "User name should be between " + str(user_id_min_len) + " and " + \
               str(user_id_max_len) + ' characters long.'
    
    if not username_regex.match(username):
        return 'User name should conist of symbols: a-z, A-Z, 0-9, -, _'
    
    
def validate_email(email:str):
    """
    Returns normalized form of email if valid.
    """
    try:
        valid = email_validator.validate_email(email, check_deliverability=True)
        return valid.email
    
    except EmailNotValidError as e:
        return None
    
def validate_password(password:str):
    """
    Returns non-empty string on error.
    """    
    if len(password) > user_password_max_len or \
       len(password) < user_password_min_len:
        return "Password must be between " + str(user_password_min_len) + " and " + \
               str(user_password_max_len) + " characters long."
    