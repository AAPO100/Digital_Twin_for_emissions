// import 'chartjs-plugin-datalabels';

async function filterParameters() {
    const SIMTime = document.getElementById('SimTime').value;
    const Trucks = document.getElementById('Trucks').value;
    const Loaders = document.getElementById('Loaders').value;
    const DrillingRig = document.getElementById('DrillingRig').value;
    const Stockpile = document.getElementById('Stockpile').value;
    const DistanceToTravel = document.getElementById('DistanceToTravel').value;
    const SoilType = document.getElementById('SoilType').value;
    const BucketSize = document.getElementById('BucketSize').value;
    const TruckCapacity = document.getElementById('TruckCapacity').value;
    const TruckBrand = document.getElementById('TruckBrand').value;
    const LoaderType = document.getElementById('LoaderBrand').value;
    const data = {
        simulationTime: SIMTime,
        DrillingRig: DrillingRig,
        Loaders: Loaders,
        Trucks: Trucks,
        Stockpile: Stockpile,
        DistanceToTravel: DistanceToTravel,
        SoilType:SoilType,
        BucketSize: BucketSize,
        TruckCapacity: TruckCapacity,
        TruckBrand: TruckBrand,
        LoaderType: LoaderType,
    };
    console.log(data);
    const chartDiv = document.createElement('div');
    chartDiv.style.height = '50%';  // Set height to 40% of viewport height
    chartDiv.style.display = 'block';
    // chartDiv.style.maxHeight = '50%';  // Set a maximum height
    this.content.appendChild(chartDiv);
    try {
        const response = await fetch('http://127.0.0.1:8001/get_resources.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            let responseDataArray = await response.json();
            let responseData = responseDataArray[0];
            responseData = JSON.parse(responseData);
            console.log(responseData);
            const DrillingRigNox = responseData['NOx [g/kwh]'][0];
            const DrillingRigCo2 = responseData['CO2 [kg]'][0];
            const DrillingRigFuel = responseData['Fuel [kg]'][0];
            const LoaderNox = responseData['NOx [g/kwh]'][1];
            const LoaderCo2 = responseData['CO2 [kg]'][1];
            const LoaderFuel = responseData['Fuel [kg]'][1];
            const TruckNox = responseData['NOx [g/kwh]'][2];
            const TruckCo2 = responseData['CO2 [kg]'][2];
            const TruckFuel = responseData['Fuel [kg]'][2];
            const soilLevelEndSim= responseData['Soil level [m3]'][0];
            // const simTimeStopped = responseData['Simulation time [min]'][0];
            // console.log(soilLevelEndSim,simTimeStopped)
            const jsonData = [
                {
                  Category: 'Drilling rig ',
                  NOx: DrillingRigNox,
                  CO2: DrillingRigCo2 ,
                  fuel: DrillingRigFuel,
                },
                {
                    Category: 'Loader',
                    NOx: LoaderNox,
                    CO2: LoaderCo2,
                    fuel: LoaderFuel,
                    },
                {
                    Category: 'Truck',
                    NOx: TruckNox,
                    CO2: TruckCo2,
                    fuel: TruckFuel,
                }
            ]
            console.log(jsonData)
            // function informUser() {
            //     alert("The simulation stopped at "+ simTimeStopped + " minutes with " + soilLevelEndSim + " m3 of soil left in the Stockpile.");
            //   }
            
            const machineNames = jsonData.map(entry => entry.Category);
            const noxData = jsonData.map(entry => entry.NOx);
            const co2Data = jsonData.map(entry => entry.CO2);
            const fuelData = jsonData.map(entry => entry.fuel);
            if (this.chartNOx) {
                this.chartNOx.destroy();
            }
            if  (this.chartSoilLevel) {
                this.chartSoilLevel.destroy();
            }
            this.chartNOx = this.createChart(
                machineNames,
                noxData,
                co2Data,
                fuelData,
                'NOx',
                chartDiv
            );
            
            // informUser();
        } else {
            console.error('Failed to send data to the Python script');
        }
        
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

function resetResults() {
    // Create new data arrays with all values set to 0
    const machineNames = ['Machine 1', 'Machine 2', 'Machine 3'];
    const zeroData = [0, 0, 0];

    // Update the chart data and labels
    this.chartNOx.data.labels = machineNames;
    this.chartNOx.data.datasets[0].data = zeroData;
    this.chartNOx.data.datasets[1].data = zeroData;
    this.chartNOx.data.datasets[2].data = zeroData;

    // Update the chart
    this.chartNOx.update();
}
async function drawSoilLevel() {
    const SIMTime = document.getElementById('SimTime').value;
    const Trucks = document.getElementById('Trucks').value;
    const Loaders = document.getElementById('Loaders').value;
    const DrillingRig = document.getElementById('DrillingRig').value;
    const Stockpile = document.getElementById('Stockpile').value;
    const DistanceToTravel = document.getElementById('DistanceToTravel').value;
    const SoilType = document.getElementById('SoilType').value;
    const BucketSize = document.getElementById('BucketSize').value;
    const TruckCapacity = document.getElementById('TruckCapacity').value;
    const TruckBrand = document.getElementById('TruckBrand').value;
    const data = {
        simulationTime: SIMTime,
        DrillingRig: DrillingRig,
        Loaders: Loaders,
        Trucks: Trucks,
        Stockpile: Stockpile,
        DistanceToTravel: DistanceToTravel,
        SoilType:SoilType,
        BucketSize: BucketSize,
        TruckCapacity: TruckCapacity,
        TruckBrand: TruckBrand,
    };
    const chartDiv = document.createElement('div');
    chartDiv.style.hyphenateCharactereight = '50%';  // Set a maximum height
    // chartDiv.style.height = '40vh';  // Set height to 40% of viewport height
    chartDiv.style.display = 'block'
    this.content.appendChild(chartDiv);
    try {
        const response = await fetch('http://127.0.0.1:8001/get_resources.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            let responseDataArray = await response.json();
            let responseData = responseDataArray[1];

            // console.log(responseData);
            responseData = JSON.parse(responseData);
            const soilLeftValues = [];
            const timeLeftValues = [];

            // Loop through the responseData
            for (let i = 0; i < responseData.length; i++) {
                if (typeof responseData[i] === 'object' && 'Soil left [m3]' in responseData[i]) {
                    soilLeftValues.push(responseData[i]['Soil left [m3]']);
                    timeLeftValues.push(responseData[i]['Time [min]']);
                }
            }
            console.log(soilLeftValues, timeLeftValues);
            if  (this.chartSoilLevel) {
                this.chartSoilLevel.destroy();
            }
            if (this.chartNOx) {
                this.chartNOx.destroy();
            }
            this.chartSoilLevel = this.newChart(
                timeLeftValues,
                soilLeftValues,
                'Soil Level',
                chartDiv
            );
            
        } else {
            console.error('Failed to send data to the Python script');
        }
        
    } catch (error) {
        console.error('An error occurred:', error);
    }
}
export class Simulation extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        // this.container.style.width = window.innerWidth + 'px';
        // this.container.style.height = window.innerHeight + 'px';
        this.container.style.resize = 'both';
        this.chartType = options.chartType || 'bar'; 
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
        this.content.style.height = '50px';
        
        this.content.style.backgroundColor = 'white';  
        window.addEventListener('resize', () => {
            this.container.style.width = window.innerWidth + 'px';
            this.container.style.height = window.innerHeight + 'px';
        });
        
        //buttons
        const dateTable = document.createElement('table');
        const dateRow = document.createElement('tr');
        dateTable.appendChild(dateRow);
        const scrollDownButton = document.createElement('button');
        scrollDownButton.textContent = 'Scroll Down';
        scrollDownButton.style.position = 'fixed';
        scrollDownButton.style.bottom = '10px';
        scrollDownButton.style.right = '10px';    
        
        const SimulationTime = document.createElement('td');
        const loaderCell = document.createElement('td');
        const Trucks = document.createElement('td');
        const DistanceToTravel = document.createElement('td');
        const DrillingRig= document.createElement('td');
        
        const Stockpile= document.createElement('td');

        SimulationTime.innerHTML = `<label for="SimTime">Sim. Time [mins]</label> 
        <input type="number" id="SimTime" name="SimTime" min="10" max="480", value="200">`;

        DrillingRig.innerHTML = `<label for="DrillingRig">Drilling rig(s) [No]</label>
        <input type="number" id="DrillingRig" name="DrillingRig" min="0" max="10", value="1">`;

        loaderCell.innerHTML = `<label for="Loaders">Loader(s) [No]</label> 
        <input type="number" id="Loaders" name="Loaders" min="0" max="10", value="1">` ;



        Trucks.innerHTML = `<label for="Trucks">Truck(s) [No]</label>
        <input type="number" id="Trucks" name="Trucks" min="0" max="50000", value="1">`;
        DistanceToTravel.innerHTML = `
        <label for="DistanceToTravel">Distance To Travel [km]</label>
        <input type="number" id="DistanceToTravel" name="DistanceToTravel" min="1" max="100", value="10">` ;
        Stockpile.innerHTML = `
        <label for="Stockpile">Initial amount of soil [m3]</label>
        <input type="number" id="Stockpile" name="Stockpile" min="0" max="1000", value="11">`;

        dateRow.appendChild(SimulationTime);
        dateRow.appendChild(DrillingRig);
        dateRow.appendChild(loaderCell);
        dateRow.appendChild(Trucks);
        dateRow.appendChild(Stockpile);
        // dateRow.appendChild(DistanceToTravel);
        const daterow2 = document.createElement('tr');
        dateTable.appendChild(daterow2);
        const DrillingRigBrand = document.createElement('td');
        const BucketSize = document.createElement('td');
        const TruckCapacity = document.createElement('td');
        const SoilTypecell= document.createElement('td');
        const emptycell24 = document.createElement('td');
        
        BucketSize.innerHTML = `<label for="BucketSize">Bucket Size [m3]</label>
        <input type="number" id="BucketSize" name="BucketSize" min="0" max="20", value="2">`;
        TruckCapacity.innerHTML = `<label for="TruckCapacity">Truck Capacity [m3]</label>
        <input type="number" id="TruckCapacity" name="TruckCapacity" min="0" max="25", value="10">`;
        SoilTypecell.innerHTML = `
        <label for="SoilType">SoilType</label>
        <input list="soils" id="SoilType" name="SoilType" value="Clay">
        <datalist id="soils">
            <option value="Rock">
            <option value="Gravel">
            <option value="Clay">
            <option value="Sand">
            <option value="Other">
        </datalist>`;

        DrillingRigBrand.innerHTML= `
        <label for="DrillingRigBrand">Drilling rig Brand</label>
        <input list="DrillingRigBrands" id="DrillingRigBrand" name="DrillingRigBrand" value="Bauer 355G">
        <datalist id="DrillingRigBrands">
            <option value="Bauer 355G">
            <option value="Bauer 325G">
            <option value="Liebherr">
        </datalist>`;

        // daterow2.appendChild();

        daterow2.appendChild(DistanceToTravel);
        daterow2.appendChild(DrillingRigBrand);
        daterow2.appendChild(BucketSize);
        daterow2.appendChild(TruckCapacity);
        daterow2.appendChild(SoilTypecell);
        // daterow2.appendChild(emptycell24);

        const dateRow3 = document.createElement('tr');
        dateTable.appendChild(dateRow3);
        const emptyCell3 = document.createElement('td');
        const emptyCell4 = document.createElement('td');
        const LoaderBrand = document.createElement('td');
        const TruckBrand = document.createElement('td');
        const soilDisruption = document.createElement('td');
        LoaderBrand.innerHTML= `
        <label for="LoaderBrand">Loader Brand</label>
        <input list="LoaderBrands" id="LoaderBrand" name="LoaderBrand" value="Caterpillar Excavator 325F">
        <datalist id="LoaderBrands">
            <option value="Volvo Wheel Loader L350F">
            <option value="Caterpillar Excavator 325F">
            <option value="Liebherr">
        </datalist>`;
        TruckBrand.innerHTML= `
        <label for="TruckBrand">Truck Brand</label>
        <input list="TruckBrands" id="TruckBrand" name="TruckBrand" value="Isuzu">
        <datalist id="TruckBrands">
            <option value="Volvo">
            <option value="MAN">
            <option value="Isuzu">
        </datalist>`;
        soilDisruption.innerHTML = `<label for="soilDisruption">Soil Disruption % </label>
        <input type="number" id="soilDisruption" name="soilDisruption" min="0" max="100", value="10">`;
        dateRow3.appendChild(emptyCell3);
        dateRow3.appendChild(emptyCell4);
        dateRow3.appendChild(LoaderBrand);
        dateRow3.appendChild(TruckBrand);
        dateRow3.appendChild(soilDisruption);

        const RunSimulationButton = document.createElement('button');
        RunSimulationButton.textContent = 'Run Simulation';
        RunSimulationButton.addEventListener('click', filterParameters.bind(this));
        scrollDownButton.addEventListener('click', () => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
        const SoilLevelButton = document.createElement('button');
        SoilLevelButton.textContent = 'Show Soil Level';
        SoilLevelButton.addEventListener('click', drawSoilLevel.bind(this));
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.addEventListener('click', () => resetResults.call(this));
        const actionCell = document.createElement('td');
        actionCell.appendChild(RunSimulationButton);
        actionCell.appendChild(resetButton);
        actionCell.appendChild(SoilLevelButton);
        dateRow.appendChild(actionCell);
        this.content.appendChild(dateTable);
        this.container.appendChild(this.content);  
    }

    createChart(machineNames, noxData, co2Data, fuelData, chartType, chartDiv) {
        const canvas = document.createElement('canvas');
        chartDiv.appendChild(canvas);
        chartType === 'NOx' ;
    
        const chartOptions = {
            type: 'bar',
            data: {
                labels: machineNames,
                datasets: [
                    {
                        label: 'NOx [kg/kwh]',
                        data: noxData,
                        backgroundColor: 'rgba(0, 123, 255, 0.5)', // Blue color
                        borderColor: 'rgba(0, 123, 255, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'CO2 [kg]',
                        data: co2Data,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)', // Red color
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Fuel [kg]',
                        data: fuelData,
                        backgroundColor: 'rgba(255, 206, 86, 0.5)', // Yellow color
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Emissions and Fuel consumption per machine'
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'NOx [kg/kwh] -- blue, CO2 [kg] -- red, Fuel [kg] -- yellow',
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Metrics'
                        },
                    },
                },
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                },
            },
        };
        
        
    return new Chart(canvas.getContext('2d'), chartOptions)
    
    }

    newChart(timeLeftValues, soilLeftValues, chartType, chartDiv) {
        const canvas = document.createElement('canvas');
        chartDiv.appendChild(canvas);
    
        const dataPoints = timeLeftValues.map((time, index) => ({
            x: time,
            y: soilLeftValues[index],
        }));
    
        const chartOptions = {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Soil left [m3]',
                        data: dataPoints,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        showLine: true,  // Add this line to connect the dots
                    },
                ],
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Stockpile soil level over time'
                    },
                    // legend: {
                    //     display: true,
                    //     position: 'bottom',
                    // },
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time [min]'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return value.toFixed(2);
                            }
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Soil left [m3]'
                        },
                    },
                },
            },
        };
    
        return new Chart(canvas.getContext('2d'), chartOptions);
    }
}

