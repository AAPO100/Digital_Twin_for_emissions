import requests
import json

ACCESS_TOKEN = None

def get_air_intel_token():
    url = 'http://airintel.cloud/api/auth/login'
    data = {
        "username": "airintel.gb@airlabs.com",
        "password": "CleanSitesGB!"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    response = requests.post(url, json=data, headers=headers)
    access_refresh_token = response.json()
    global ACCESS_TOKEN
    ACCESS_TOKEN = access_refresh_token['token']
    return access_refresh_token

def get_air_intel_measurement_NOx_DrillingRig(start_ms, end_ms, interval_ms, max_data_points, aggregation_function):
    global ACCESS_TOKEN
    access_token = ACCESS_TOKEN if ACCESS_TOKEN else get_air_intel_token()['token']
    device_id = "3cfa8190-0b1d-11ec-a709-299dc78f8a52"
    keys = ['NO2']
    keys_string = ','.join(keys)
    url = f'http://airintel.cloud/api/plugins/telemetry/DEVICE/{device_id}/values/timeseries?keys={keys_string}&startTs={start_ms}&endTs={end_ms}&interval={interval_ms}&limit={max_data_points}&agg={aggregation_function}'
    headers = {
        "Content-Type": "application/json",
        "X-Authorization": f"Bearer {access_token}"
    }
    response = requests.get(url, headers=headers)
    measurement = response.json()

    timestamps = []
    values=[]
    for entry in measurement['NO2']:
        timestamps.append(entry['ts'])
        values.append(entry['value'])
    
    timestamps_reversed=timestamps[::-1]
    values_reversed=values[::-1]   
    
    data_list = []
    for ts, value in zip(timestamps_reversed, values_reversed):
        data_list.append({"ts": ts, "value": value})

    json_data = {"NO2": data_list}

    return json_data

def get_air_intel_measurement_NOx_Excavator(start_ms, end_ms, interval_ms, max_data_points, aggregation_function):
    global ACCESS_TOKEN
    access_token = ACCESS_TOKEN if ACCESS_TOKEN else get_air_intel_token()['token']
    device_id = "f8816730-0b1d-11ec-a709-299dc78f8a52"
    keys = ['NO2']
    keys_string = ','.join(keys)
    url = f'http://airintel.cloud/api/plugins/telemetry/DEVICE/{device_id}/values/timeseries?keys={keys_string}&startTs={start_ms}&endTs={end_ms}&interval={interval_ms}&limit={max_data_points}&agg={aggregation_function}'
    headers = {
        "Content-Type": "application/json",
        "X-Authorization": f"Bearer {access_token}"
    }
    response = requests.get(url, headers=headers)
    measurement = response.json()

    timestamps = []
    values=[]
    for entry in measurement['NO2']:
        timestamps.append(entry['ts'])
        values.append(entry['value'])
    
    timestamps_reversed=timestamps[::-1]
    values_reversed=values[::-1]   
    
    data_list = []
    for ts, value in zip(timestamps_reversed, values_reversed):
        data_list.append({"ts": ts, "value": value})

    json_data = {"NO2": data_list}

    return json_data


def get_air_intel_measurement_CO2_DrillingRig(start_ms, end_ms, interval_ms, max_data_points, aggregation_function):
    global ACCESS_TOKEN
    access_token = ACCESS_TOKEN if ACCESS_TOKEN else get_air_intel_token()['token']
    device_id = "3cfa8190-0b1d-11ec-a709-299dc78f8a52"
    keys = ['SCD30_CO2']
    keys_string = ','.join(keys)
    url = f'http://airintel.cloud/api/plugins/telemetry/DEVICE/{device_id}/values/timeseries?keys={keys_string}&startTs={start_ms}&endTs={end_ms}&interval={interval_ms}&limit={max_data_points}&agg={aggregation_function}'
    headers = {
        "Content-Type": "application/json",
        "X-Authorization": f"Bearer {access_token}"
    }
    response = requests.get(url, headers=headers)
    measurement = response.json()

    timestamps = []
    values=[]
    for entry in measurement['SCD30_CO2']:
        timestamps.append(entry['ts'])
        values.append(entry['value'])
    
    timestamps_reversed=timestamps[::-1]
    values_reversed=values[::-1]   
    
    data_list = []
    for ts, value in zip(timestamps_reversed, values_reversed):
        data_list.append({"ts": ts, "value": value})

    json_data = {"SCD30_CO2": data_list}

    return json_data


def get_air_intel_measurement_CO2_Excavator(start_ms, end_ms, interval_ms, max_data_points, aggregation_function):
    global ACCESS_TOKEN
    access_token = ACCESS_TOKEN if ACCESS_TOKEN else get_air_intel_token()['token']
    device_id = "f8816730-0b1d-11ec-a709-299dc78f8a52"
    keys = ['SCD30_CO2']
    keys_string = ','.join(keys)
    url = f'http://airintel.cloud/api/plugins/telemetry/DEVICE/{device_id}/values/timeseries?keys={keys_string}&startTs={start_ms}&endTs={end_ms}&interval={interval_ms}&limit={max_data_points}&agg={aggregation_function}'
    headers = {
        "Content-Type": "application/json",
        "X-Authorization": f"Bearer {access_token}"
    }
    response = requests.get(url, headers=headers)
    measurement = response.json()

    timestamps = []
    values=[]
    for entry in measurement['SCD30_CO2']:
        timestamps.append(entry['ts'])
        values.append(entry['value'])
    
    timestamps_reversed=timestamps[::-1]
    values_reversed=values[::-1]   
    
    data_list = []
    for ts, value in zip(timestamps_reversed, values_reversed):
        data_list.append({"ts": ts, "value": value})

    json_data = {"SCD30_CO2": data_list}

    return json_data

