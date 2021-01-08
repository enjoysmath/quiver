import os
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/hello/')
@app.route('/hello/<name>')
def hello(name=None):
    return render_template('hello.html', name=name)

if __name__ == "__main__":
    if 'WINGDB_ACTIVE' in os.environ:
        app.debug = False
    app.run(use_reloader=True)
