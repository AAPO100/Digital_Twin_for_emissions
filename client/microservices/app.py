from flask import Flask
from flask import jsonify
from pymongo import MongoClient
import numpy as np
import pandas as pd
from flask_cors import CORS
from flask import request

app = Flask(__name__)
CORS(app)

port = 3000
uri = "mongodb+srv://aapo:AASbjhlxU49H1UyY@cluster0.qdcd8a5.mongodb.net/?retryWrites=true&w=majority"


client = MongoClient(uri)
db = client['getTheDataRe']
collection = db['Prospathw']

@app.route('/positions', methods=['POST'])
def save_position():
    try:
        data = request.get_json()
        print('data:', data)
        result = collection.insert_one(data)
        print('result:', result)
        return jsonify(result.inserted_id), 200
    except Exception as e:
        print('Error:', e)
        return 'Internal server error', 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)