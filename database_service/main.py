import os
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "<h3>Hello World!</h3><p>Your app is working.</p>"

if __name__ == "__main__":
    if 'WINGDB_ACTIVE' in os.environ:
        app.debug = False
    app.run()