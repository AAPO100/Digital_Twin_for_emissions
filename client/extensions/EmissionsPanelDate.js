import { getData } from './EmissionsTestingData.js'
import { getDates } from './EmissionsTestingData.js'
import { getDataSensor2 } from './EmissionsTestingData.js'
import { getDatesSensor2 } from './EmissionsTestingData.js'

//Data from weather website

import { getTime } from './GetDataTest.js'
import { getTemperatures } from './GetDataTest.js'

const time = getTime()
const temperatures = getTemperatures()

//Data for sensor 1
const dataFromTesting = getData()
const datesFromTesting = getDates()
const dataFromTestingSensor2 = getDataSensor2()
const datesFromTestingSensor2 = getDatesSensor2()

const data= {
    labels:time,
    datasets:[{
        label:"Sensors data",
        data:temperatures[0],
        backgroundColor:'#FF8C00',
        // borderColor:'#FF8C00',
        borderWidth: '1' 
    }]

}

function updateSensor(sensorSelect) {
    if (sensorSelect.value === "sensor1") {
        // chart.data.datasets[0].data=[0,0];
        // chart.data.labels =[0,0];
        console.log("Drilling rig selected"); 
    } else if (sensorSelect.value === "sensor2") {
        // chart.data.datasets[0].data=[0,0];
        // chart.data.labels =[0,0];
        console.log("Excavator selected");
    }
    // chart.update();
}

function updateEmission(emissionSelect) {
    if (emissionSelect.value === "emission1") {

        console.log("emission 1 selected"); 
    } else if (emissionSelect.value === "emission2") {

        console.log("emission2 selected");
    }
    // chart.update();
}
async function filterDate(sensorSelect,emissionSelect,chartNOx,chartCO2){    
    if (emissionSelect.value==="emission1"){
        if (sensorSelect.value==="sensor1"){
            const start1 = new Date(document.getElementById('startDateEm').value);
            start1.setHours(0,0,0,0);
            const start=start1.getTime();
            console.log(start);        
            const intervall = document.getElementById('intervall').value;
            const maxDataPoints = document.getElementById('maxDataPoints').value;
            const aggregationFunction = document.getElementById('aggregationFunction').value;
            const end1=new Date(document.getElementById('endDateEm').value);
            const end = end1.setHours(0, 0, 0, 0);
            const datesFromAirlab = []; 
            const NoxEmissionsFromAirlab = [];
            const query = {
                start: start,
                intervall: intervall,
                maxDataPoints: maxDataPoints,
                aggregationFunction: aggregationFunction,
                end: end
            };
            const queryString = new URLSearchParams(query).toString();
            try {
                const response = await fetch(`http://127.0.0.1:8001/NOxEmissionsfromAirlabsDrillingRig.js?${queryString}`);
                if (response.ok) {
                    const responseData = await response.json();
                    console.log(responseData);
                    datesFromAirlab.push(...responseData.NO2.map(item => item.ts)); 
                    NoxEmissionsFromAirlab.push(...responseData.NO2.map(item => item.value));
                    console.log(datesFromAirlab, NoxEmissionsFromAirlab);
                } else {
                    console.error('Failed to retrieve data');
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
            const filterDates = datesFromAirlab.filter(date => date >= start && date <= end);
            this.chartNOx.data.labels =filterDates.map(timestamp => new Date(timestamp));
            console.log(filterDates)
            //working on the data
            const startArray=datesFromAirlab.indexOf(filterDates[0])
            const endArray=datesFromAirlab.indexOf(filterDates[filterDates.length - 1])
            console.log(startArray, endArray)
            const copydataFromTesting=[...NoxEmissionsFromAirlab]
            copydataFromTesting.splice(endArray + 1, filterDates.length)
            copydataFromTesting.splice(0, startArray)
            this.chartNOx.data.datasets[0].data=copydataFromTesting
            console.log(startArray,"startArray")
            this.chartNOx.data.datasets[0].borderColor = '#FFF000';
        } else if (sensorSelect.value==="sensor2"){
            const start1 = new Date(document.getElementById('startDateEm').value);
            start1.setHours(0,0,0,0);
            const start=start1.getTime();
            console.log(start);        
            
            const intervall = document.getElementById('intervall').value;
            const maxDataPoints = document.getElementById('maxDataPoints').value;
            const aggregationFunction = document.getElementById('aggregationFunction').value;
            const end1=new Date(document.getElementById('endDateEm').value);
            const end = end1.setHours(0, 0, 0, 0);
            const datesFromAirlab = []; 
            const NoxEmissionsFromAirlab = [];
            const query = {
                start: start,
                intervall: intervall,
                maxDataPoints: maxDataPoints,
                aggregationFunction: aggregationFunction,
                end: end
            };
            const queryString = new URLSearchParams(query).toString();
            
            try {
                const response = await fetch(`http://127.0.0.1:8001/NOxEmissionsfromAirlabsExcavator.js?${queryString}`);
                if (response.ok) {
                    const responseData = await response.json();
                    console.log(responseData);
                    datesFromAirlab.push(...responseData.NO2.map(item => item.ts)); 
                    NoxEmissionsFromAirlab.push(...responseData.NO2.map(item => item.value));
                    console.log(datesFromAirlab, NoxEmissionsFromAirlab);
                } else {
                    console.error('Failed to retrieve data');
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
            
            const filterDates = datesFromAirlab.filter(date => date >= start && date <= end);
            
            this.chartNOx.data.labels =filterDates.map(timestamp => new Date(timestamp));
            console.log(filterDates)
            //working on the data
            const startArray=datesFromAirlab.indexOf(filterDates[0])
            const endArray=datesFromAirlab.indexOf(filterDates[filterDates.length - 1])
            console.log(startArray, endArray)
            const copydataFromTesting=[...NoxEmissionsFromAirlab]
            copydataFromTesting.splice(endArray + 1, filterDates.length)
            copydataFromTesting.splice(0, startArray)
            this.chartNOx.data.datasets[0].data=copydataFromTesting
            console.log(startArray,"startArray")
            this.chartNOx.data.datasets[0].borderColor = '#FFF000';

        }
        this.chartNOx.update();
        this.chartNOx.canvas.style.display = 'block';
        this.chartCO2.canvas.style.display = 'none';   
    } 
    else if (emissionSelect.value==="emission2"){
        if (sensorSelect.value==="sensor1"){
            const start1 = new Date(document.getElementById('startDateEm').value);
            start1.setHours(0,0,0,0);
            const start=start1.getTime();
            console.log(start);        
            const intervall = document.getElementById('intervall').value;
            const maxDataPoints = document.getElementById('maxDataPoints').value;
            const aggregationFunction = document.getElementById('aggregationFunction').value;
            const end1=new Date(document.getElementById('endDateEm').value);
            const end = end1.setHours(0, 0, 0, 0);
            const datesFromAirlabCO2 = []; 
            const CO2EmissionsFromAirlab = [];
            const query = {
                start: start,
                intervall: intervall,
                maxDataPoints: maxDataPoints,
                aggregationFunction: aggregationFunction,
                end: end
            };
            const queryString = new URLSearchParams(query).toString();
            try {
                const response = await fetch(`http://127.0.0.1:8001/CO2EmissionsfromAirlabsDrillingRig.js?${queryString}`);
                if (response.ok) {
                    const responseData = await response.json();
                    console.log(responseData);
                    datesFromAirlabCO2.push(...responseData.SCD30_CO2.map(item => item.ts)); 
                    CO2EmissionsFromAirlab.push(...responseData.SCD30_CO2.map(item => item.value));
                    console.log(datesFromAirlabCO2, CO2EmissionsFromAirlab);
                } else {
                    console.error('Failed to retrieve data');
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
            const filterDates = datesFromAirlabCO2.filter(date => date >= start && date <= end);
            this.chartCO2.data.labels =filterDates.map(timestamp => new Date(timestamp));
            console.log(filterDates)
            //working on the data
            const startArray=datesFromAirlabCO2.indexOf(filterDates[0])
            const endArray=datesFromAirlabCO2.indexOf(filterDates[filterDates.length - 1])
            console.log(startArray, endArray)
            const copydataFromTesting=[...CO2EmissionsFromAirlab]
            copydataFromTesting.splice(endArray + 1, filterDates.length)
            copydataFromTesting.splice(0, startArray)
            this.chartCO2.data.datasets[0].data=copydataFromTesting
            console.log(startArray,"startArray")
            this.chartCO2.data.datasets[0].borderColor = '#0000FF';
        
            console.log("emission2 sensor1 selected")}
            else if (sensorSelect.value==="sensor2"){
                console.log("emission2 sensor2 selected")
                const start1 = new Date(document.getElementById('startDateEm').value);
                start1.setHours(0,0,0,0);
                const start=start1.getTime();
                console.log(start);        
                const intervall = document.getElementById('intervall').value;
                const maxDataPoints = document.getElementById('maxDataPoints').value;
                const aggregationFunction = document.getElementById('aggregationFunction').value;
                const end1=new Date(document.getElementById('endDateEm').value);
                const end = end1.setHours(0, 0, 0, 0);
                const datesFromAirlabCO2 = []; 
                const CO2EmissionsFromAirlab = [];
                const query = {
                    start: start,
                    intervall: intervall,
                    maxDataPoints: maxDataPoints,
                    aggregationFunction: aggregationFunction,
                    end: end
                };
                const queryString = new URLSearchParams(query).toString();
                try {
                    const response = await fetch(`http://127.0.0.1:8001/CO2EmissionsfromAirlabsExcavator.js?${queryString}`);
                    if (response.ok) {
                        const responseData = await response.json();
                        console.log(responseData);
                        datesFromAirlabCO2.push(...responseData.SCD30_CO2.map(item => item.ts)); 
                        CO2EmissionsFromAirlab.push(...responseData.SCD30_CO2.map(item => item.value));
                        console.log(datesFromAirlabCO2, CO2EmissionsFromAirlab);
                    } else {
                        console.error('Failed to retrieve data');
                    }
                } catch (error) {
                    console.error('An error occurred:', error);
                }
                const filterDates = datesFromAirlabCO2.filter(date => date >= start && date <= end);
                this.chartCO2.data.labels =filterDates.map(timestamp => new Date(timestamp));
                console.log(filterDates)
                //working on the data
                const startArray=datesFromAirlabCO2.indexOf(filterDates[0])
                const endArray=datesFromAirlabCO2.indexOf(filterDates[filterDates.length - 1])
                console.log(startArray, endArray)
                const copydataFromTesting=[...CO2EmissionsFromAirlab]
                copydataFromTesting.splice(endArray + 1, filterDates.length)
                copydataFromTesting.splice(0, startArray)
                this.chartCO2.data.datasets[0].data=copydataFromTesting
                console.log(startArray,"startArray")
                this.chartCO2.data.datasets[0].borderColor = '#0000FF';
        }
            this.chartCO2.update();
            this.chartNOx.canvas.style.display = 'none';
            this.chartCO2.canvas.style.display = 'block';
        } 
    }

function resetDate(sensorSelect,chartNOx){
    if (sensorSelect.value==='sensor1'){
        // chart.data.labels =[0,0]
        // chart.data=[0,0]
        this.chartNOx.data.labels=[0,0]
    } else if (sensorSelect.value==='sensor2'){
        chart.data.datasets[0].data = [0,0];
        chart.data.labels = [0,0]; 
    }
    this.chartNOx.update();
}

export class EmissionsPanelDate extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 1000) + 'px';
        this.container.style.height = (options.height || 800) + 'px';
        this.container.style.resize = 'both';
        this.chartType = options.chartType || 'bar'; // See https://www.chartjs.org/docs/latest for all the supported types of charts
        this.chartNOx = this.createChart(data, 'NOx');
        this.chartCO2 = this.createChart(data, 'CO2');


    }
    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.closer = this.createCloseButton();
        this.initializeMoveHandlers(this.title);
        this.initializeCloseHandler(this.closer);
        this.footer = this.createFooter(); //to resize container
        this.container.appendChild(this.title);
        this.container.appendChild(this.closer);
        this.container.appendChild(this.footer);
        this.content = document.createElement('div');
        this.content.style.height = '450px';
        this.content.style.backgroundColor = 'white';  
        
        // const emissionSelect = document.createElement('emissionSelect');

        //Button for selecting the sensors
        const select = document.createElement('select');
        const option1 = document.createElement('option');
        option1.value = "sensor1";
        option1.innerHTML = "Drilling rig";
        // sensorSelect.style.paddingBottom ="10px";     
        // sensorSelect.style.background= '#BAE6FD';
        // sensorSelect.style.boxshadow= '0px 1px 2px rgba(0, 0, 0, 0.05)';
        // sensorSelect.style.borderradius= '6px';
        // sensorSelect.style.padding = "10px" ;
        select.appendChild(option1);
        const option2 = document.createElement('option');
        option2.value = "sensor2";
        option2.innerHTML = "Excavator";
        select.appendChild(option2);
        // sensorSelect.value="sensor1";
        // sensorSelect.innerHTML="Sensor 1";

        const sensorSelect = document.createElement('sensor-select');
        select.appendChild(sensorSelect)  
        console.log(select,"sensor-select")
        select.addEventListener('change', () => updateSensor(select, this.chart));
        this.content.appendChild(select);


        //Button for selecting the emissions
        const emissionSelect = document.createElement('select');
        const option1Em = document.createElement('option');
        option1Em.value = "emission1";
        option1Em.innerHTML = "NOx";
        emissionSelect.appendChild(option1Em);
        const option2Em = document.createElement('option');
        option2Em.value = "emission2";
        option2Em.innerHTML = "CO2";
        emissionSelect.appendChild(option2Em);

        // const emissionSelectReal = document.createElement('emission-select');
        // emissionSelect.appendChild(emissionSelectReal)
        emissionSelect.addEventListener('change', () => updateEmission(emissionSelect));
        this.content.appendChild(emissionSelect);

        //buttons
        const dateTable = document.createElement('table');
        const dateRow = document.createElement('tr');
        dateTable.appendChild(dateRow);      
        const startDateCell = document.createElement('td');
        const intervallCell = document.createElement('td');
        const maxDataPoints = document.createElement('td');
        const aggregationFunction= document.createElement('td');
        const endDateCell = document.createElement('td');
        let minDate = "2023-08-01";
        let maxDate = "2023-08-31";


        startDateCell.innerHTML = `<label for="startDateEm">Start Date</label> 
        <input type="datetime-local" id="startDateEm" name="startDateEm" min="${minDate}T00:00" max="${maxDate}T23:59", value="2023-08-01T18:50">`;
        
        intervallCell.innerHTML = `<label for="intervall">intervall (ms)</label> 
        <input type="number" id="intervall" name="intervall" min="0" max="10000000000", value="0">`;

        maxDataPoints.innerHTML = `<label for="maxDataPoints">Max Data Points</label>
        <input type="number" id="maxDataPoints" name="maxDataPoints" min="0" max="50000", value="5">`;

        aggregationFunction.innerHTML = `
        <label for="aggregationFunction">Aggregation Function</label>
        <input list="functions" id="aggregationFunction" name="aggregationFunction">
        <datalist id="functions">
            <option value="NONE">
            <option value="AVG">
            <option value="MIN">
            <option value="MAX">
            <option value="SUM">
            <option value="COUNT">
        </datalist>`;     
        
        endDateCell.innerHTML = `<label for="endDateEm">End Date</label> 
        <input type="datetime-local" id="endDateEm" name="endDateEm" min="${minDate}T00:00" max="${maxDate}T23:59", value="2023-08-02T18:50">`;
        dateRow.appendChild(startDateCell);
        dateRow.appendChild(intervallCell);
        dateRow.appendChild(maxDataPoints);
        dateRow.appendChild(aggregationFunction);
        dateRow.appendChild(endDateCell);
        // dateRow.appendChild(emissionSelect);
        const filterButton = document.createElement('button');
        
        filterButton.textContent = 'Filter';
        filterButton.addEventListener('click', filterDate.bind(this, select, emissionSelect, this.chartNOx, this.chartCO2));
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.addEventListener('click', () => resetDate(this,select,emissionSelect,this.chartNOx));
        const actionCell = document.createElement('td');
        actionCell.appendChild(filterButton);
        actionCell.appendChild(resetButton);
        dateRow.appendChild(actionCell);
        this.content.appendChild(dateTable);

        
        this.canvas = this.content.querySelector('canvas.chart');
        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);
        this.container.appendChild(this.content);  
    }

    createChart(_data, chartType) {
        const canvas = document.createElement('canvas');
        this.content.appendChild(canvas);
    
        const borderColor = chartType === 'NOx' ? 'red' : chartType === 'CO2' ? 'blue' : '';
    
        const chartOptions = {
            type: 'line',
            data: _data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: chartType === 'NOx' ? 'NOx Emissions' : 'CO2 Emissions'
                    }
                },
                elements: {
                    line: {
                        backgroundColor:'#FFF000',
                        borderColor: '#FFF000', // Red color
                        borderWidth: 2 // You can adjust the line width if needed
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            tooltipFormat: 'MMM d, yyyy h:mm a'
                        },
                        title: {
                            display: true,
                            text: 'Days'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: chartType === 'NOx' ? 'μg/m3' : 'm3'
                        }
                    },
                },
            },
        };
        
        return new Chart(canvas.getContext('2d'), chartOptions);
        
    }
    
}



