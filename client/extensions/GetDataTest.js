let time;
let temperature;
async function getData() {
    try {
        let response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=55.68&longitude=12.57&hourly=temperature_2m")
        let data = await response.json();
        let time2 = data.hourly.time;
        time = [time2];
        let temperature2= data.hourly.temperature_2m;
        temperature=[temperature2];
    } catch (error) {
        console.error(error);
    }
}

await getData();
//console.log(time,temperature)
let timeOnly=time[0]
let timestamps = [];

for (let i = 0; i < timeOnly.length; i++) {
  let timestamp = Date.parse(timeOnly[i]);
  timestamps.push(timestamp);
}


// time.forEach(time => {
//   let date = new Date(time);
//   let timestamp = date.getTime();
//   timestamps.push(timestamp);
// });

// console.log(timestamps)

const temperature2= temperature
// console.log(temperature2)

export function getTime() {
  return(timestamps)
}
export function getTemperatures() {
  return(temperature2)
}