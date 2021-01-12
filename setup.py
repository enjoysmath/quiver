from setuptools import setup, find_packages

setup(
    name='QuiverDatabase',
    version='0.0.0',
    url='https://github.com/enjoysmath/quiver-database.git',
    author='Enjoys Math',
    author_email='enjoysmath@gmail.com',
    description='Database support for Quiver: a commutative diagram editor for the web.',
    packages=find_packages(),    
    install_requires=[
	'django', 
	'gunicorn', 
	'django-heroku', 
	'requests', 
	'neomodel',
	'django-neomodel']
)