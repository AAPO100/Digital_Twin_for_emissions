import { getData } from './SoundsTestingData.js'
import { getDates } from './SoundsTestingData.js'
import { getDataSensor2 } from './SoundsTestingData.js'
import { getDatesSensor2 } from './SoundsTestingData.js'

//Data from weather website

import { getTime } from './GetDataTest.js'
import { getTemperatures } from './GetDataTest.js'

const time = getTime()
const temperatures = getTemperatures()

//Data for sensor 1
const dataFromTesting = getData()
const datesFromTesting = getDates()
console.log(datesFromTesting)
//Data for sensor 2
const dataFromTestingSensor2 = getDataSensor2()
const datesFromTestingSensor2 = getDatesSensor2()

const data= {
    labels:time,
    datasets:[{
        label:"Sensors data",
        data:temperatures[0],
        backgroundColor:'#FF8C00',
        borderColor:'#FF8C00',
        borderWidth: '1' 
    }]

}

function updateSensor(sensorSelect,chart) {
    if (sensorSelect.value === "sensor1") {
        chart.data.datasets[0].data=temperatures[0];
        chart.data.labels =time;
        console.log("Sensor 1 selected"); 
    } else if (sensorSelect.value === "sensor2") {
        chart.data.datasets[0].data=dataFromTestingSensor2;
        chart.data.labels =datesFromTestingSensor2;
        console.log("Sensor 2 selected");
    }
    chart.update();
}
function filterDate(sensorSelect,chart){
    if (sensorSelect.value==="sensor1"){
        const start1 = new Date(document.getElementById('startDateEm').value);
        start1.setHours(0,0,0,0);
        const start=start1.getTime();
        console.log(start);
        
        
        const intervall = document.getElementById('intervall').value;
        const maxDataPoints = document.getElementById('maxDataPoints').value;
        const aggregationFunction = document.getElementById('aggregationFunction').value;

        const end1=new Date(document.getElementById('endDateEm').value);
        const end = end1.setHours(0,0,0,0);

        const filterDates=datesFromTesting.filter(date => date >= start && date <= end)
        chart.data.labels =filterDates;
        console.log(filterDates)
        //working on the data
        const startArray=datesFromTesting.indexOf(filterDates[0])
        const endArray=datesFromTesting.indexOf(filterDates[filterDates.length - 1])
        const copydataFromTesting=[...dataFromTesting]
        copydataFromTesting.splice(endArray + 1, filterDates.length)
        copydataFromTesting.splice(0, startArray)
        chart.data.datasets[0].data=copydataFromTesting
        console.log(startArray,"startArray")
        console.log(start,intervall, maxDataPoints, aggregationFunction,end)


    } else if (sensorSelect.value==="sensor2"){
        const start1Sensor2 = new Date(document.getElementById('startDateEm').value);
        const startSensor2=start1Sensor2.setHours(0,0,0,0);
        console.log(startSensor2)
        const end1Sensor2=new Date(document.getElementById('endDateEm').value);
        const endSensor2 = end1Sensor2.setHours(0,0,0,0);
        const filterDatesSensor2=datesFromTestingSensor2.filter(date => date >= startSensor2 && date <= endSensor2)
        chart.data.labels =filterDatesSensor2;
        //working on the data
        const startArraySensor2=datesFromTestingSensor2.indexOf(filterDatesSensor2[0])
        const endArraySensor2=datesFromTestingSensor2.indexOf(filterDatesSensor2[filterDatesSensor2.length - 1])
        const copydataFromTestingSensor2=[...dataFromTestingSensor2]
        copydataFromTestingSensor2.splice(endArraySensor2 + 1, filterDatesSensor2.length)
        copydataFromTestingSensor2.splice(0, startArraySensor2)
        chart.data.datasets[0].data=copydataFromTestingSensor2
        console.log(startArraySensor2,"startArray")  
    }
    chart.update();

}

function resetDate(sensorSelect,chart){
    if (sensorSelect.value==='sensor1'){
        chart.data.labels =datesFromTesting
        chart.data.datasets[0].data=dataFromTesting
    } else if (sensorSelect.value==='sensor2'){
        chart.data.datasets[0].data = dataFromTestingSensor2;
        chart.data.labels = datesFromTestingSensor2; 
    }
    chart.update();
}



export class SoundsPanelDate extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 1000) + 'px';
        this.container.style.height = (options.height || 800) + 'px';
        this.container.style.resize = 'both';
        this.chartType = options.chartType || 'bar'; // See https://www.chartjs.org/docs/latest for all the supported types of charts
        this.chart = this.createChart();

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

        
        //Button for selecting the sensors
        const select = document.createElement('select');
        const option1 = document.createElement('option');
        const sensorSelect = document.createElement('sensor-select');
        option1.value = "sensor1";
        option1.innerHTML = "Drilling rig";

        sensorSelect.style.paddingBottom ="10px";     
        sensorSelect.style.background= '#BAE6FD';
        sensorSelect.style.boxshadow= '0px 1px 2px rgba(0, 0, 0, 0.05)';
        sensorSelect.style.borderradius= '6px';
        sensorSelect.style.padding = "10px" ;

        select.appendChild(option1);
        const option2 = document.createElement('option');
        option2.value = "sensor2";
        option2.innerHTML = "Excavator";
        select.appendChild(option2);
        sensorSelect.value="sensor1";
        sensorSelect.innerHTML="Sensor 1";
        select.appendChild(sensorSelect)  
        
        console.log(select,"sensor-select")

        select.addEventListener('change', () => updateSensor(select, this.chart));

        this.content.appendChild(select);

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
        <input type="datetime-local" id="startDateEm" name="startDateEm" min="${minDate}T00:00" max="${maxDate}T23:59">`;
        
        intervallCell.innerHTML = `<label for="intervall">intervall</label> 
        <input type="number" id="intervall" name="intervall" min="0" max="10000000000">`;

        maxDataPoints.innerHTML = `<label for="maxDataPoints">Max Data Points</label>
        <input type="number" id="maxDataPoints" name="maxDataPoints" min="0" max="100000">`;

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
        <input type="datetime-local" id="endDateEm" name="endDateEm" min="${minDate}T00:00" max="${maxDate}T23:59">`;
        dateRow.appendChild(startDateCell);
        dateRow.appendChild(intervallCell);
        dateRow.appendChild(maxDataPoints);
        dateRow.appendChild(aggregationFunction);
        dateRow.appendChild(endDateCell);
        const filterButton = document.createElement('button');
        
        filterButton.textContent = 'Filter';
        filterButton.addEventListener('click', () => filterDate(select,this.chart));
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.addEventListener('click', () => resetDate(select,this.chart));
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

    createChart(_data) {
        const chart = new Chart(this.canvas.getContext('2d'), {
            type: this.chartType,
            data,
            options: {
                scales: {
                  x:{type:'time',
                  time:{
                    unit:'day'
                  }
    
                  }, 
                  y: {
                    beginAtZero: true
                  }
                }
           }
        });
        return chart;
    } 


}

