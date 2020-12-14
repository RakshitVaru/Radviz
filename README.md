# Info

This is the radviz visualization using flask to integrate different datasets. 
It is a multivariate data visualization algorithm that plots each feature dimension uniformly around the circumference of a circle then plots points on the interior of the circle such that the point normalizes its values on the axes from the center to each arc. This mechanism allows as many dimensions as will easily fit on a circle, greatly expanding the dimensionality of the visualization.
The implementation is done using python, flask, d3.js and html.

## Backend
```
$ git clone https://git.cs.dal.ca/varu/radviz.git
$ py -m venv env
$ .\env\Scripts\activate
$ pip install -r requirements.txt
$ python app.py
$ deactivate (when done)
```