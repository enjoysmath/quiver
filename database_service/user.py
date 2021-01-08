class User(DatabaseNode):   
    def __init__(self, name:str, password:str, email:str):
        super().__init__(
            label="User", 
            properties={
                'name' : name,
                'password' : password,
                'email' : email,
            })
        
        
