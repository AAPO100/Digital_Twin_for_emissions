
# from flask import Flask
import json
import numpy as np
from pymongo import MongoClient
# from flask import jsonify
client = MongoClient("mongodb+srv://aapo:AASbjhlxU49H1UyY@cluster0.qdcd8a5.mongodb.net/?retryWrites=true&w=majority")
dbPEMS_HEATMAPS=client["PEMS_HEATMAPS"]
collectionExcavator=dbPEMS_HEATMAPS["Excavator"]
collectionDrillingRig=dbPEMS_HEATMAPS["DrillingRig"]
collectionTrucks=dbPEMS_HEATMAPS["Trucks"]


def calculate_emissions(probability_array, value_array,numberObeservations):
    flat_probability = probability_array.flatten()
    flat_value = value_array.flatten()

    cumulative_probabilities = np.cumsum(flat_probability)
    cumulative_probabilities[-1] = 1.0

    random_numbers = np.random.rand(numberObeservations)  
    # print(random_numbers)
    selected_values = []

    for random_num in random_numbers:
        row_index = np.searchsorted(cumulative_probabilities, random_num)

        selected_value = flat_value[row_index]

        selected_values.append(selected_value)

    Sum=np.sum(selected_values)
    # print(Sum)
    return(Sum)


def format_and_convert(data):
    emissions_data = np.array(data)
    
    emissions_data = emissions_data.tolist()
    
    formatted_data = emissions_data
    
    json_string = json.dumps(formatted_data)
    
    return json_string


def getEmissions(name, collection):
    result = collection.find_one({"_id": name})
    if result:
        data = result["data"]
        emissions_data = format_and_convert(data)
        # print(emissions_data)
        return (emissions_data)
    else:
        return "Document not found", 404
    
# Ex_probability_Idling = (getEmissions("Ex_probability_Idling", collectionExcavator))
# print(Ex_probability_Idling)
    
# Excavator

Lo_probability_Idling = np.array([[0.00, 0.00, 0.00, 0.00, 0.00], [0.01, 0.00, 0.00, 0.00, 0.00], [0.04, 0.00, 0.00, 0.00, 0.00], [0.19, 0.75, 0.00, 0.00, 0.00]])

Lo_probability_Loading=np.array([[0.00, 0.00, 0.00, 0.00, 0.00], [0.00, 0.00, 0.00, 0.00, 0.00], [0.04, 0.05, 0.03, 0.00, 0.00], [0.01, 0.01, 0.09, 0.43, 0.34]])

Lo_NOx_Idling = np.array([[0.39, 0.00, 0.00, 2.45, 0.00], [1.17, 0.08, 2.94, 0.00, 0.00], [1.21, 0.00, 0.00, 0.00, 0.00], [1.05, 0.81, 0.04, 0.00, 0.00]])

Lo_CO2_Idling=np.array([[2.42, 0.00, 0.00, 0.08, 0.00], [1.98, 2.19, 0.63, 0.00, 0.00], [2.03, 0.00, 0.00, 0.00, 0.00], [2.10, 2.19, 3.19, 0.00, 0.00]])

Lo_Fuel_Idling=np.array([[0.41, 0.00, 0.00, 0.59, 0.00], [0.40, 0.50, 0.59, 0.00, 0.00], [0.48, 0.00, 0.00, 0.00, 0.00], [0.46, 0.49, 0.57, 0.00, 0.00]])


Lo_NOx_Loading=np.array([[0.02, 0.00, 0.00, 0.12, 0.00], [0.05, 0.00, 0.00, 0.13, 0.00], [0.10, 0.15, 0.14, 0.24, 0.20], [0.14, 0.07, 0.08, 0.12, 0.15]])

Lo_CO2_Loading=np.array([[19.24, 0.00, 0.00, 17.00, 0.00], [13.65, 2.17, 0.00, 18.60, 0.00], [17.07, 17.82, 18.76, 19.83, 19.95], [16.65, 11.96, 15.10, 17.41, 19.33]])

Lo_Fuel_Loading=np.array([[6.07, 0.00, 0.00, 6.22, 0.00], [4.67, 1.61, 0.00, 5.45, 0.00], [5.01, 5.75, 6.06, 6.71, 7.00], [5.16, 3.77, 4.32, 5.30, 5.73]])

# Drilling rig

Dr_probability_Idling = np.array([[0.93, 0.00, 0.00, 0.00, 0.00], [0.00, 0.01, 0.00, 0.00, 0.00], [0.00, 0.03, 0.00, 0.00, 0.00], [0.00, 0.01, 0.00, 0.00, 0.00]])

Dr_probability_Drilling=np.array([[0.05, 0.00, 0.00, 0.00, 0.00], [0.02, 0.57, 0.05, 0.01, 0.00], [0.02, 0.20, 0.03, 0.00, 0.00], [0.00, 0.03, 0.01, 0.00, 0.00]])

Dr_NOx_Idling = np.array([[1.88, 0.91, 1.42, 0.0, 0.0], [0.0, 1.28, 0.76, 0.50, 0.0], [0.0, 1.09, 2.01, 2.87, 2.82], [2.82, 1.80, 1.28, 0.0, 0.0]])

Dr_CO2_Idling=np.array([[5.05, 5.30, 6.47, 0.00, 0.00], [0.00, 7.16, 9.31, 10.96, 0.00], [0.00, 7.75, 13.67, 16.90, 17.71], [12.41, 13.44, 14.43, 0.00, 0.00]])

Dr_Fuel_Idling=np.array([[1.61, 1.78, 2.48, 0.00, 0.00], [0.00, 2.44, 3.61, 4.16, 0.00], [0.00, 2.42, 4.65, 4.45, 7.59], [3.85, 4.13, 4.82, 0.00, 0.00]])

Dr_NOx_Drilling=np.array([[1.15, 1.04, 0.42, 0.0, 0.0], [0.80, 0.87, 0.57, 0.90, 1.15], [0.72, 0.87, 0.82, 0.94, 0.48], [0.58, 1.74, 0.62, 0.50, 1.70]])

Dr_CO2_Drilling=np.array([[5.19, 5.53, 5.72, 0.00, 0.00], [7.61, 7.57, 11.92, 14.63, 16.00], [10.52, 12.55, 16.40, 16.65, 18.43], [15.35, 15.29, 19.20, 10.42, 19.28]])

Dr_Fuel_Drilling=np.array([[1.62, 1.77, 1.91, 0.00, 0.00], [2.34, 2.40, 3.92, 5.35, 6.82], [3.26, 4.02, 5.59, 6.12, 6.65], [4.36, 4.87, 6.67, 8.89, 7.35]])

# Truck
Tr_probability_Idling = np.array([[0.009989023051591658,0,0,0,0],
 [0.3356750823271131, 0.6201244054152946, 0,0,0],
 [0.00995243322356385, 0.021185510428100986, 0,0,0],
 [0.0008049762166117819, 0.002158799853640688,0,0,0]])

Tr_probability_Driving=np.array([[0.09851029387644496, 0.08546021151117102, 0.00016401742863459057,0,0],
 [0.15325645907765156, 0.35813562101990315, 0.08573832802059489,0.0004991834784531017,0],
 [0.015724279571272703, 0.06936510992733315, 0.10655427907208923,0.02571508033288407,0],
 [0,0,0.00013549265843727047, 0.0005918889815943921,0]])

Tr_NOx_Idling = np.array([[0.80622711, 5.6,0,0,0],
 [3.50091563, 3.43903115,0.2,0,0],
 [2.94852941, 3.13903282,0,0,0],
 [5.76818182, 3.03728814,0,0,0]])

Tr_CO2_Idling=np.array([[0.03, 1.26, 0.00, 0.00, 0.00], 
[0.63, 1.37, 3.05, 0.00, 0.00], 
[0.69, 1.51, 0.00, 0.00, 0.00], 
[0.83, 1.63, 0.00, 0.00, 0.00]])

Tr_Fuel_Idling=np.array([[0.01, 0.39, 0.00, 0.00, 0.00], 
[0.22, 0.43, 0.95, 0.00, 0.00],
[0.23, 0.48, 0.00, 0.00, 0.00],
[0.27, 0.51, 0.00, 0.00, 0.00]])

Tr_NOx_Driving=np.array([[6.67574200,5.26427737,2.13913043,0.00,0.00],
 [6.61328928,4.32816153,1.43679614,0.00,0.00],
 [7.82530612,4.34307597,1.67656271,0,0.00],
 [0.00, 2.15,0.00,0.00,0.00]])

Tr_CO2_Driving=np.array([[0.69, 1.41, 3.55, 0.00, 0.00], [0.73, 1.90, 3.77, 6.12, 0.00], [0.70, 2.07, 4.28, 6.44, 9.39], [0.00, 1.81, 4.71, 7.67, 9.13]])

Tr_Fuel_Driving=np.array([[0.22, 0.44, 1.13, 0.00, 0.00], [0.23, 0.60, 1.18, 1.92, 0.00], [0.22, 0.65, 1.35, 2.02, 2.94], [0.00, 0.57, 1.48, 2.41, 2.93]]
)

Tr_NOx_Idling_Isuzu=Tr_NOx_Idling
Tr_CO2_Idling_Isuzu=Tr_CO2_Idling
Tr_Fuel_Idling_Isuzu=Tr_Fuel_Idling
Tr_NOx_Driving_Isuzu=Tr_NOx_Driving
Tr_CO2_Driving_Isuzu=Tr_CO2_Driving
Tr_Fuel_Driving_Isuzu=Tr_Fuel_Driving


Tr_NOx_Idling_Volvo=0.8*Tr_NOx_Idling
Tr_CO2_Idling_Volvo=0.8*Tr_CO2_Idling
Tr_Fuel_Idling_Volvo=0.8*Tr_Fuel_Idling
Tr_NOx_Driving_Volvo=0.8*Tr_NOx_Driving
Tr_CO2_Driving_Volvo=0.8*Tr_CO2_Driving
Tr_Fuel_Driving_Volvo=0.8*Tr_Fuel_Driving

Lo_NOx_Idling_Excavator=Lo_NOx_Idling
Lo_CO2_Idling_Excavator=Lo_CO2_Idling
Lo_Fuel_Idling_Excavator=Lo_Fuel_Idling
Lo_NOx_Loading_Excavator=Lo_NOx_Loading
Lo_CO2_Loading_Excavator=Lo_CO2_Loading
Lo_Fuel_Loading_Excavator=Lo_Fuel_Loading

Lo_NOx_Idling_WheelLoader=0.5*Lo_NOx_Idling
Lo_CO2_Idling_WheelLoader=0.5*Lo_CO2_Idling
Lo_Fuel_Idling_WheelLoader=0.5*Lo_Fuel_Idling
Lo_NOx_Loading_WheelLoader=0.5*Lo_NOx_Loading
Lo_CO2_Loading_WheelLoader=0.5*Lo_CO2_Loading
Lo_Fuel_Loading_WheelLoader=0.5*Lo_Fuel_Loading



calculate_emissions(Tr_probability_Idling, Tr_NOx_Idling_Volvo, 18*60)
calculate_emissions(Tr_probability_Idling, Tr_NOx_Idling_Isuzu, 18*60)

#analogyCO2fuelDriving=Tr_CO2_Driving/Tr_Fuel_Driving
#analogyCO2fuelIdling=Tr_CO2_Idling/Tr_Fuel_Idling
# print(analogyCO2fuelIdling)
# print(analogyCO2fuelDriving)

# calculate_emissions(Lo_probability_Idling, Lo_NOx_Idling, 600)
# calculate_emissions(Lo_probability_Idling, Lo_CO2_Idling, 10)
# calculate_emissions(Lo_probability_Idling, Lo_Fuel_Idling, 10)

# calculate_emissions(Lo_probability_Loading, Lo_CO2_Loading, 35*60)
# calculate_emissions(Lo_probability_Loading, Lo_Fuel_Loading, 10)
# calculate_emissions(Lo_probability_Loading, Lo_NOx_Loading, 10)

# calculate_emissions(Dr_probability_Idling, Dr_NOx_Idling, 10)
# calculate_emissions(Dr_probability_Idling, Dr_CO2_Idling, 35*60)
# calculate_emissions(Dr_probability_Idling, Dr_Fuel_Idling, 10)

# calculate_emissions(Dr_probability_Drilling, Dr_NOx_Drilling, 35*60)
# calculate_emissions(Dr_probability_Drilling, Dr_CO2_Drilling, 35*60)
# calculate_emissions(Dr_probability_Drilling, Dr_Fuel_Drilling, 35*60)

# calculate_emissions(Tr_probability_Idling, Tr_NOx_Idling, 0)
# calculate_emissions(Tr_probability_Idling, Tr_CO2_Idling, 10)
# calculate_emissions(Tr_probability_Idling, Tr_Fuel_Idling, 10)

# calculate_emissions(Tr_probability_Driving, Tr_NOx_Driving, 50*60)
# calculate_emissions(Tr_probability_Driving, Tr_CO2_Driving, 10)
# calculate_emissions(Tr_probability_Driving, Tr_Fuel_Driving, 10)