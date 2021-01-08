from wtforms.validators import Length

username_length = Length(min=4, max=20)
password_length = Length(min=8, max=30)
email_length = Length(max=50)