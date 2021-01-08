db_user = "neo4j"          #TODO make hard to guess
db_password = "lunamoona"  #TODO change before first deploy
db_schema = 'bolt'
db_host = 'localhost'
db_port = 7687
db_name = "Mathematics"

db_uri = "{0}://{1}:{2}".format(db_schema, db_host, db_port)