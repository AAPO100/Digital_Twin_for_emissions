from flask import Flask
from flask import jsonify
from pymongo import MongoClient
import numpy as np
import pandas as pd
from flask_cors import CORS
from flask import request
import time
import json

app = Flask(__name__)
CORS(app)

# Connect to the MongoDB database
client = MongoClient("mongodb+srv://aapo:AASbjhlxU49H1UyY@cluster0.qdcd8a5.mongodb.net/?retryWrites=true&w=majority")
port=8001
#Historical data
db1 = client["DrillingRigEmissions"]
collection1 = db1["NOx3"]

# #Real time data
# db2 = client["LiveDrillingRig"]
# collection2 = db2["Location"]


# @app.route("/")
# def index():
#     return 'hello world'

# Define a route that loads the NumPy arrays into a JavaScript file
@app.route("/DatafromMongo.js")
def data_js():
    results = collection1.find()
    timestamps = []
    NOxs = []
    

    for result in results:
        timestamp = result["timestamp"]
        NOx = result["value"]
        
        
        # Append the data to the lists
        timestamps.append(timestamp)
        NOxs.append(NOx)
        

    return [timestamps, NOxs]

# @app.route("/DatafromMongoLive.js")
# def datalive_js():
#     data_array = []  # Initialize an empty array to store the numbers
    
#     while True:
#         r2 = collection2.find({"deviceId": "71405791-feda-448a-8918-c78a57b7223b"})
#         dictionary = [d for d in r2]
#         last_dict_index = len(dictionary) - 1
#         last_dict = dictionary[last_dict_index]
#         df = pd.DataFrame(last_dict['payload'][0]['values'], index=[0])
#         lonOriginal = float(df['longitude'][0])
#         latOriginal = float(df['latitude'][0])

#         lon = lonOriginal
#         lat = latOriginal
#         x = [lon, lat]
        
#         data_array.append(x)  # Append the numbers to the array
        
#         time.sleep(3)  # Wait for three seconds before repeating the loop

#         return jsonify(x)


# @app.route('/DataToMongoLive.js', methods=['GET', 'POST'])
# def save_position():
    # if request.method == 'POST':
    #     # Handle POST requests as before
    #     uri = "mongodb+srv://aapo:AASbjhlxU49H1UyY@cluster0.qdcd8a5.mongodb.net/?retryWrites=true&w=majority"
    #     client = MongoClient(uri)
    #     db3 = client['LiveDrillingRig']
    #     collection = db3['Location']
    #     try:
    #         data3 = request.get_json()
    #         print('data3:', data3)
    #         result3 = collection.insert_one(data3)
    #         print('result3:', result3)
    #         return jsonify(result3.inserted_id), 200
    #     except Exception as e:
    #         print('Error:', e)
    #         return 'Internal server error', 500
    # else:
    #     # Handle GET requests
    #     # Add your logic here for GET requests
    #     return 'GET request received', 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)


