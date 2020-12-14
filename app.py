import json
import os
from flask_cors import CORS
from flask import Flask, flash, request, redirect, url_for, render_template, jsonify, send_file, make_response,send_from_directory
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import io, glob
from sklearn.cluster import KMeans


ALLOWED_EXTENSIONS = {'csv'}
app = Flask(__name__)
CORS(app)
app._static_folder = os.path.abspath("templates/static/")
app.config["JSON_SORT_KEYS"] = False
app.secret_key = "xmk"

@app.after_request
def add_header(response):
    response.headers['Pragma'] = 'no-cache'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Expires'] = '0'
    return response

@app.route('/')
def trial():
    return render_template("index.html")

@app.route('/upload', methods=['POST'])
def upload():
    if request.method == 'POST':
        global r
        f = request.files['file']
        r = pd.read_csv(f)
        r.iloc[:, -1] = r.iloc[:, -1].astype(str)
        files = glob.glob(r'templates/images/*')
        for items in files:
            os.remove(items)
        post_image()
        global jsonfiles
        jsonfiles = json.loads(r.to_json(orient='records'))
    return render_template("home.html")

@app.route('/visual')
def visual():
    return render_template("visual.html")

@app.route('/cluster')
def cluster():
    return render_template("cluster.html")    

@app.route('/download', methods=['GET'])
def download():
    post_image()
    RESULT= jsonify(jsonfiles)
    return RESULT

def post_image():
    arrray=(r[r.columns[len(r.columns)-1]].unique())
    datasets = {}
    by_class = r.groupby(r[r.columns[len(r.columns)-1]])
    for col in r.columns: 
        name= col
    for groups, data in by_class:
        datasets[groups] = data
    for i in arrray:
        plt.figure()
        plot= sns.heatmap(datasets[i].corr(),cmap='YlGnBu')
        plot.figure.savefig("templates/images/"+ name +"-"+ str(i) +".png",  bbox_inches = "tight")
    return 0

@app.route('/get_image/<id>')
def get_image(id):
    file_name='templates/images/'
    return send_from_directory(file_name, (id+'.png'))

@app.route('/clustering')
def clustering():
    cluster_num= len(r[r.columns[len(r.columns)-1]].unique())
    cluster_data=r.copy()
    cluster_data.drop(cluster_data.columns[len(cluster_data.columns)-1], axis=1, inplace=True)
    km= KMeans(n_clusters = cluster_num, n_jobs = 4, random_state=21)
    km.fit(cluster_data)
    prediction= km.fit_predict(cluster_data)
    cluster_data['clusters']=prediction
    cluster_file = json.loads(cluster_data.to_json(orient='records'))
    cluster_data['clusters']=cluster_data['clusters'].astype(str)
    arrray=(cluster_data[cluster_data.columns[len(cluster_data.columns)-1]].unique())
    datasets = {}
    by_class = cluster_data.groupby(cluster_data[cluster_data.columns[len(cluster_data.columns)-1]])
    for groups, data in by_class:
        datasets[groups] = data
    for i in arrray:
        plt.figure()
        plot= sns.heatmap(datasets[i].corr(),cmap='YlGnBu')
        plot.figure.savefig("templates/images/clusters-"+str(i) +".png",  bbox_inches = "tight")
    return jsonify(cluster_file)

@app.route('/newcluster')
def newcluster():
    files = glob.glob(r'templates/images/*')
    for items in files:
        os.remove(items)
    cluster_data=r.copy()
    num=request.values.get("parameter")
    cluster_num=int(num)
    #print(type(cluster_num))
    cluster_data.drop(cluster_data.columns[len(cluster_data.columns)-1], axis=1, inplace=True)
    km= KMeans(n_clusters = cluster_num, n_jobs = 4, random_state=21)
    km.fit(cluster_data)
    prediction= km.fit_predict(cluster_data)
    cluster_data['clusters']=prediction
    cluster_file = json.loads(cluster_data.to_json(orient='records'))
    cluster_data['clusters']=cluster_data['clusters'].astype(str)
    arrray=(cluster_data[cluster_data.columns[len(cluster_data.columns)-1]].unique())
    datasets = {}
    by_class = cluster_data.groupby(cluster_data[cluster_data.columns[len(cluster_data.columns)-1]])
    print(cluster_data['clusters'].dtypes)
    for groups, data in by_class:
        datasets[groups] = data
    for i in arrray:
        plt.figure()
        plot= sns.heatmap(datasets[i].corr(),cmap='YlGnBu')
        plot.figure.savefig("templates/images/clusters-"+str(i) +".png",  bbox_inches = "tight")
    return jsonify(cluster_file)


@app.route("/bonus")
def bonus():
    bonus_file= pd.read_csv("dataset1_processed.csv")
    clean={"salary":{"<=50K":"equal to or less than 50K", ">50K":"greater than 50K"}}
    bonus_file.replace(clean, inplace=True)
    jsonf = json.loads(bonus_file.to_json(orient='records'))
    return jsonify(jsonf)
if __name__ == '__main__':
   app.run(debug = True)