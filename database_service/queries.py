from py2neo import Graph, Node
from db_credentials import db_uri

db = Graph(db_uri)


def query_user(user_id:str):
    user = db.run('MATCH (u:User) WHERE u.user_id="EnjoysMath" RETURN u', user_id='user_id')
    user = user.to_table()
    if user:
        user = user[0][0]
        return user
    
    
def create_user(username:str, password:str, email:str):
    node = Node('User', user_id=username, password=password, email=email)
    db.create(node)
    
    user = query_user(username)
    return user