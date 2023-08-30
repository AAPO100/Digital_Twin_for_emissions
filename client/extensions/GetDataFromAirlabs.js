let ACCESS_TOKEN = undefined;

/**
 * Retrieves access token form the AirIntel API.
 * @returns An object containing a 'token' and a 'refreshToken' property.
 */
export async function getAirIntelToken() {
    const url = 'http://airintel.cloud/api/auth/login';
    const data = {
        username: 'airintel.gb@airlabs.com',
        password: 'CleanSitesGB!',
    }
    const request = new Request(
        url,
        {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        });
    const response = await fetch(request);
    const accesRefreshToken = await response.json();
    ACCESS_TOKEN = accesRefreshToken.token;
    return accesRefreshToken;
}

//returns array of keys for a given device
export async function getKeys(deviceId) {
    const accessToken = ACCESS_TOKEN ?? (await getAirIntelToken()).token;
    const url = `http://airintel.cloud/api/plugins/telemetry/DEVICE/${deviceId}/keys/timeseries`
    const request = new Request(
        url,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': `Bearer: ${accessToken}`
            },
        });
    const response = await fetch(request);
    const sensorkeys = await response.json();
    return sensorkeys;
}

/**
 * Retrieves the latest measurements for the device with the given GUID
 * @param deviceId - GUID string for the specific device
 * @param keys - Array of time series keys for the measurements to contain. 
 * @returns A measurements object.
 */
export async function getAirIntelLatestMeasurements(deviceId, keys) {
    const accessToken = ACCESS_TOKEN ?? (await getAirIntelToken()).token;
    const keysString = keys.join();
    const url = `http://airintel.cloud/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${keysString}`
    const request = new Request(
        url,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': `Bearer: ${accessToken}`
            },
        });
    const response = await fetch(request);
    const measurements = await response.json();
    return measurements;
}

/**
 * Object containing the aggregation functions.
 */
export const AGGREGATION_FUNCTIONS = {
    MAX: 'MAX',
    MIN: 'MIN',
    AVG: 'AVG',
    SUM: 'SUM',
    COUNT: 'COUNT',
    NONE: 'NONE'
}
export const dsad = {
    PM: 'PM2.5',
    MIN: 'MIN',
    AVG: 'AVG',
    SUM: 'SUM',
    COUNT: 'COUNT',
    NONE: 'NONE'
}

/**
 * @param deviceId 
 * @param keys 
 * @param startMs 
 * @param endMs 
 * @param intervalMs 
 * @param maxDataPoints 
 * @param aggregationFunction 
 * @returns 
 */
export async function getAirIntelMeasurement(deviceId, keys, startMs, endMs, intervalMs, maxDataPoints, aggregationFunction) {
    const accessToken = ACCESS_TOKEN ?? (await getAirIntelToken()).token;
    const keysString = keys.join();
    const url = `http://airintel.cloud/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${keysString}&startTs=${startMs}&endTs=${endMs}&interval=${intervalMs}&limit=${maxDataPoints}&agg=${aggregationFunction}`;

    const request = new Request(
        url,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': `Bearer: ${accessToken}`
            },
        });
    const response = await fetch(request);
    const measurment = await response.json();
    return measurment;
}   
