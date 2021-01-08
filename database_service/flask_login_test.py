from login_manager import LoginManager
from flask import *
import os
import json

app = Flask(__name__)

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

@app.route('/editor/')
@app.route('/editor/<name>')
def editor(name=None):
    return render_template('editor.html', name=name)

@app.route('/login', methods=['POST'])
def login():
    info  = json.loads(request.data)
    
    if 'username' not in info:
        return redirect(url_for('editor'))
    if 'password' not in info:
        return redirect(url_for('editor'))
    
    user = User.objects(username, password).first()
    
    if user:
        login_user(user)
        return jsonify(user.to_json())
    else:
        return jsonify({"status": 401, 
                        "reason": "Username or Password Error"})

if __name__ == "__main__":
    if 'WINGDB_ACTIVE' in os.environ:
        app.debug = False   # Let Wing handle the debugging
    app.run(use_reloader=True)
