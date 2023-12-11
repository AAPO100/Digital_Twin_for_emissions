from flask import Flask
from flask import jsonify
from pymongo import MongoClient
import numpy as np
import pandas as pd
from flask_cors import CORS
from flask import request
import time
import json
import API
from Simulation import simulation

y=API.get_air_intel_token()

app = Flask(__name__)
CORS(app)

# Connect to the MongoDB database
client = MongoClient("mongodb+srv://aapo:AASbjhlxU49H1UyY@cluster0.qdcd8a5.mongodb.net/?retryWrites=true&w=majority")
port=8001
#Historical data
db1 = client["position-data-history"]
collection1 = db1["positions2"]

#Real time data
db2 = client["LiveDrillingRig"]
collection2 = db2["Location"]

db3 = client["DrillingRigEmissions"]
collection3 = db3["NOx3"]

dbPEMSEXCAVATOR=client["PEMS_HEATMAPS"]
collectionExcavator=dbPEMSEXCAVATOR["Excavator"]

@app.route("/")
def index():
    return 'hello world'

@app.route("/NOxEmissionsfromMongo.js")
def NOxEmissions_js():
    results = collection3.find()
    timestamps = []
    NOxs = []
    

    for result in results:
        timestamp = result["timestamp"]
        NOx = result["value"]
        
        
        # Append the data to the lists
        timestamps.append(timestamp)
        NOxs.append(NOx)
        

    return [timestamps, NOxs]


# Define a route that loads the NumPy arrays into a JavaScript file
@app.route("/DatafromMongo.js")
def data_js():
    results = collection1.find()
    timestamps = []
    lons = []
    lats = []

    for result in results:
        timestamp = result["timestamp"]
        lon = result["longitude"]
        lat = result["latitude"]
        
        # Append the data to the lists
        timestamps.append(timestamp)
        lons.append(lon)
        lats.append(lat)

    return [timestamps, lons, lats]

@app.route("/DatafromMongoLive.js")
def datalive_js():
    data_array = []  # Initialize an empty array to store the numbers
    
    while True:
        r2 = collection2.find({"deviceId": "71405791-feda-448a-8918-c78a57b7223b"})
        dictionary = [d for d in r2]
        last_dict_index = len(dictionary) - 1
        last_dict = dictionary[last_dict_index]
        df = pd.DataFrame(last_dict['payload'][0]['values'], index=[0])
        lonOriginal = float(df['longitude'][0])
        latOriginal = float(df['latitude'][0])

        lon = lonOriginal
        lat = latOriginal
        x = [lon, lat]
        
        data_array.append(x)  # Append the numbers to the array
        
        time.sleep(3)  # Wait for three seconds before repeating the loop

        return jsonify(x)


@app.route('/DataToMongoLive.js', methods=['GET', 'POST'])
def save_position():
    if request.method == 'POST':
        # Handle POST requests as before
        uri = "mongodb+srv://aapo:AASbjhlxU49H1UyY@cluster0.qdcd8a5.mongodb.net/?retryWrites=true&w=majority"
        client = MongoClient(uri)
        db3 = client['LiveDrillingRig']
        collection = db3['Location']
        try:
            data3 = request.get_json()
            print('data3:', data3)
            result3 = collection.insert_one(data3)
            print('result3:', result3)
            return jsonify(result3.inserted_id), 200
        except Exception as e:
            print('Error:', e)
            return 'Internal server error', 500
    else:
        # Handle GET requests
        # Add your logic here for GET requests
        return 'GET request received', 200

@app.route("/NOxEmissionsfromAirlabsDrillingRig.js", methods=['GET','POST'])
def NOxEmissions_jsAirlabDrillingRig():
    start = request.args.get('start')
    intervall = request.args.get('intervall')
    maxDataPoints = request.args.get('maxDataPoints')
    aggregationFunction = request.args.get('aggregationFunction')
    end = request.args.get('end')
    x=API.get_air_intel_measurement_NOx_DrillingRig(start, end, intervall, maxDataPoints, aggregationFunction)
    return (x)

@app.route("/NOxEmissionsfromAirlabsExcavator.js", methods=['GET','POST'])
def NOxEmissions_jsAirlabExcavator():
    start = request.args.get('start')
    intervall = request.args.get('intervall')
    maxDataPoints = request.args.get('maxDataPoints')
    aggregationFunction = request.args.get('aggregationFunction')
    end = request.args.get('end')
    x=API.get_air_intel_measurement_NOx_Excavator(start, end, intervall, maxDataPoints, aggregationFunction)
    return (x)

@app.route("/CO2EmissionsfromAirlabsDrillingRig.js", methods=['GET','POST'])
def CO2Emissions_jsAirlabDrillingRig():
    start = request.args.get('start')
    intervall = request.args.get('intervall')
    maxDataPoints = request.args.get('maxDataPoints')
    aggregationFunction = request.args.get('aggregationFunction')
    end = request.args.get('end')
    x=API.get_air_intel_measurement_CO2_DrillingRig(start, end, intervall, maxDataPoints, aggregationFunction)
    return (x)

@app.route("/CO2EmissionsfromAirlabsExcavator.js", methods=['GET','POST'])
def CO2Emissions_jsAirlabExcavator():
    start = request.args.get('start')
    intervall = request.args.get('intervall')
    maxDataPoints = request.args.get('maxDataPoints')
    aggregationFunction = request.args.get('aggregationFunction')
    end = request.args.get('end')
    x=API.get_air_intel_measurement_CO2_Excavator(start, end, intervall, maxDataPoints, aggregationFunction)
    return (x)

# @app.route("/ExcavatorEmissions.js" )

    

@app.route("/get_resources.js", methods=['POST'])
def get_resources():
    global trucks
    machine_resources = request.json
    NUM_TRUCKS = int(machine_resources['Trucks'])
    NUM_DRILLINGRIGS = int(machine_resources['DrillingRig'])
    Stockpile = int(machine_resources['Stockpile'])
    NUM_LOADERS= int(machine_resources['Loaders'])
    SIMTime = int(machine_resources['simulationTime'])*60
    DistanceToTravel = int(machine_resources['DistanceToTravel'])
    SoilType = str(machine_resources['SoilType'])
    BucketSize = int(machine_resources['BucketSize'])
    TruckCapacity = int(machine_resources['TruckCapacity'])
    TruckBrand=str(machine_resources['TruckBrand'])
    LoaderType=str(machine_resources['LoaderType'])

    # print(TruckBrand)
    x=simulation(NUM_LOADERS, NUM_TRUCKS, NUM_DRILLINGRIGS, Stockpile, SIMTime,DistanceToTravel,SoilType,BucketSize,TruckCapacity,TruckBrand,LoaderType)
    return jsonify(x)
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)


