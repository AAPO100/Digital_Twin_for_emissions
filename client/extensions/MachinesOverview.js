import { BaseExtension } from './BaseExtension.js';
import { getLocationObjects, getMachineInfo } from './DataProcessing.js'

//for storing data for machines charts
let timestamps = []
let CO2s = []
let PMs = []
let NOxs = []
let AvgEnginePowers = []
let maxEnginePowers = []
let minEnginePowers = []
let fuelConsump = []
let AvgdrillRotationSpeeds = []
let AvgDrivingSpeeds = []
let AvgDrillingSpeeds = []

//For storing overall machine that will be used in the panels
let machineInfo = {}

//sets a timer of 10 sec to execute this so there is enough time for data to process.
setTimeout(() => {
    machineInfo = getMachineInfo()

    //Retrieves machine data to create the charts
    const positiondata = getLocationObjects();
    positiondata.forEach(i => {
        timestamps.push(i.timestamp)
        CO2s.push(i.CO2EmissionPerMin / 1000)
        PMs.push(i.NOxEmissionPerMin)
        NOxs.push(i.PMEmissionPerMin)
        AvgEnginePowers.push(i.AvgEnginePower)
        maxEnginePowers.push(i.maxEnginePower)
        minEnginePowers.push(i.minEnginePower)
        fuelConsump.push((i.FuelConsumptionPerMin / 1000 / 0.85).toFixed(2)); //CO2)
        AvgdrillRotationSpeeds.push(i.AvgdrillRotationSpeed)
        AvgDrivingSpeeds.push(i.AvgDrivingSpeed)
        AvgDrillingSpeeds.push(i.AvgDrillingSpeed)
    })
    // console.log('positiondataimported', positiondata)
    // console.log('timestamps', timestamps)
}, 10000)

//thresholds for machine data
const MachineCO2rateThreshold = 30;  //kilograms per hour
const MachinePMrateThreshold = 5; //grams per hour
const MachineNOxrateThreshold = 500;  //grams per hour
const IdlingProportionThreshold = 0.4; //idling time divided by total time

class MachinesOverview extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._MachineOverviewPanel = null;
    }

    async load() {
        super.load();
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.1/chart.min.js', 'Chart');
        Chart.defaults.plugins.legend.display = true;
        return true;
    }

    unload() {
        super.unload();
        for (const button of [this._machineInfoButton]) {
            this.removeToolbarButton(button);
        }
        this._machineInfoButton = null;
        for (const panel of [this._MachineOverviewPanel]) {
            panel.setVisible(false);
            panel.uninitialize();
        }
        this._MachineOverviewPanel = null;
        console.log('machine info panel unloaded.');
        return true;
    }

    onToolbarCreated() {
        this._machineInfoButton = this.createToolbarButton('machine-info-button', 'https://img.icons8.com/external-nawicon-glyph-nawicon/512/external-excavator-construction-nawicon-glyph-nawicon.png', 'Show Machines Information');
        setTimeout(() => { //sets timer because needs to retrieve the machine data before creating the panel
            this._MachineOverviewPanel = new MachinesOverviewPanel(this.viewer, this.viewer.container, 'machine-list-panel', 'Machines Overview');
            this._MachineSimulationPanel = new MachineSimulationPanel(this.viewer, this.viewer.container, 'machine-simulate-panel', 'Machines Forecasting');
        }, 11000)

        //for the click event on the machine toolbar button
        this._machineInfoButton.onClick = () => {
            this._MachineOverviewPanel.setVisible(!this._MachineOverviewPanel.isVisible());
            this._machineInfoButton.setState(this._MachineOverviewPanel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);

            if (!this.viewer.isNodeVisible(10647)) {
                this.viewer.show(10647)
            } else {
                this.viewer.hide(10647)
            }

            //for the click event on the simulate button inside machine panel
            this._MachineOverviewPanel.content.querySelector('#machinesimulatebutton').addEventListener('click', () => {
                this._MachineSimulationPanel.setVisible(!this._MachineSimulationPanel.isVisible());
            })

        };
        //Creates data panels
        this._PileDriverChartPanel = new PileDriverDataPanel(this, 'Piledriver-data-panel', 'Datachart Drilling rig', { x: 10, y: 10, chartType: 'line' });
        this._ExcavatorChartPanel = new ExcavatorDataPanel(this, 'Excavator-data-panel', 'Datachart Excavator', { x: 10, y: 10, chartType: 'line' });

        //For updating charts according to switch on dropdown menu
        const selectElement = this._PileDriverChartPanel.container.querySelector('select.props');
        selectElement.onchange = (event) => {
            const value = event.target.value;

            switch (value) {
                case 'Power':
                    this._PileDriverChartPanel.chart.data.labels = timestamps
                    this._PileDriverChartPanel.chart.data.datasets[0].data = AvgEnginePowers;
                    this._PileDriverChartPanel.chart.data.datasets[0].label = 'Avg. Power'
                    this._PileDriverChartPanel.chart.data.datasets[1].data = minEnginePowers;
                    this._PileDriverChartPanel.chart.data.datasets[1].label = 'Min. Power'
                    this._PileDriverChartPanel.chart.data.datasets[2].data = maxEnginePowers;
                    this._PileDriverChartPanel.chart.data.datasets[2].label = 'Max. Power'
                    this._PileDriverChartPanel.chart.update();
                    break;
                case 'Emissions':
                    this._PileDriverChartPanel.chart.data.labels = timestamps
                    this._PileDriverChartPanel.chart.data.datasets[0].data = CO2s;
                    this._PileDriverChartPanel.chart.data.datasets[0].label = 'CO2 (kg)'
                    this._PileDriverChartPanel.chart.data.datasets[1].data = NOxs;
                    this._PileDriverChartPanel.chart.data.datasets[1].label = 'NOx (g)'
                    this._PileDriverChartPanel.chart.data.datasets[2].data = PMs;
                    this._PileDriverChartPanel.chart.data.datasets[2].label = 'PM (g)'
                    this._PileDriverChartPanel.chart.update();
                    break;
                case 'Fuel':
                    this._PileDriverChartPanel.chart.data.labels = timestamps
                    this._PileDriverChartPanel.chart.data.datasets[0].data = fuelConsump;
                    this._PileDriverChartPanel.chart.data.datasets[0].label = 'Fuel Consumption (L/min)'
                    this._PileDriverChartPanel.chart.data.datasets[1].label = ''
                    this._PileDriverChartPanel.chart.data.datasets[1].data = [];
                    this._PileDriverChartPanel.chart.data.datasets[2].label = ''
                    this._PileDriverChartPanel.chart.data.datasets[2].data = [];
                    this._PileDriverChartPanel.chart.update();
                    break;
                case 'Speeds':
                    this._PileDriverChartPanel.chart.data.labels = timestamps
                    this._PileDriverChartPanel.chart.data.datasets[2].data = [];
                    this._PileDriverChartPanel.chart.data.datasets[2].label = ''
                    this._PileDriverChartPanel.chart.data.datasets[0].label = 'Drill rotation speed (rpm)'
                    this._PileDriverChartPanel.chart.data.datasets[0].data = AvgdrillRotationSpeeds;
                    this._PileDriverChartPanel.chart.data.datasets[1].label = 'Driving speed (km/h)'
                    this._PileDriverChartPanel.chart.data.datasets[1].data = AvgDrivingSpeeds;
                    this._PileDriverChartPanel.chart.update();
                    break;
                default:
                    break;
            }
        }

    }

    onModelLoaded(model) {
        super.onModelLoaded(model);
        this.viewer.hide([10647, 10710])

        //  //creating a bounding box around the machine
        //  const geometry = new THREE.BoxGeometry( 32, 32, 70 );
        //  const geometry = new THREE.SphereGeometry( 16.4, 64, 32 );
        //  const material = new THREE.MeshBasicMaterial({
        //          color: new THREE.Color(0x7FFF00),
        //          opacity: 0.75,
        //          transparent: true,
        //          side: THREE.DoubleSide,
        //          wireframe: true,
        //          wireframeLinewidth: 1
        //      });


        //      let cube = new THREE.Mesh( geometry, material );
        //      //    cube.position.set(67, -19, 20)
        //      cube.position.set(115.51820621180504,20.68776596335374, -16.82691266387701)
        //      //    cube.rotateZ(70)

        //      this.viewer.impl.createOverlayScene(
        //          'myOverlay2', material)

        //          this.viewer.impl.addOverlay (
        //              'myOverlay2', cube)

        //        this.viewer.impl.invalidate (true)

        //        const geometry2 = new THREE.SphereGeometry( 1.968, 64, 32 );
        //        const material2 = new THREE.MeshBasicMaterial({
        //                color: new THREE.Color(0x7FFF00),
        //                opacity: 0.75,
        //                transparent: true,
        //                side: THREE.DoubleSide,
        //                wireframe: true,
        //                wireframeLinewidth: 1
        //            });


        //            let cube2 = new THREE.Mesh( geometry2, material2 );
        //            //    cube.position.set(67, -19, 20)
        //            cube2.position.set(131.89898681640625,23.723012924194336, -16.8774049118042)
        //            //    cube.rotateZ(70)

        //            this.viewer.impl.createOverlayScene(
        //                'myOverlay3', material2)

        //                this.viewer.impl.addOverlay (
        //                    'myOverlay3', cube2)

        //              this.viewer.impl.invalidate (true)
    }

    async onSelectionChanged(model, dbids) {
        super.onSelectionChanged(model, dbids);
        if (dbids[0] === 10647) {
            // console.log('Pile driver selected');
            this._PileDriverChartPanel.setVisible(!this._PileDriverChartPanel.isVisible());
            // this._machineInfoButton.setState(this._PileDriverChartPanel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);

        }
        if (dbids[0] === 10710) {
            // console.log('Excavator selected');
            this._ExcavatorChartPanel.setVisible(!this._ExcavatorChartPanel.isVisible());
            // this._machineInfoButton.setState(this._PileDriverChartPanel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
        }
    }


}

//Creates panel for machine overview 
class MachinesOverviewPanel extends Autodesk.Viewing.UI.PropertyPanel {
    constructor(viewer, container, id, title, options) {
        super(container, id, title, options);
        this.viewer = viewer;
        this.geometry = null;
        this.linesMaterial = null;
        this.lines = null;
        this._areLinesShowing = false;
        this.container.style.height = "350px";
        this.container.style.width = "900px";
        this.content = document.createElement('div');

        //Creat overview table    
        const machineList = document.createElement('table');
        // machineList.style.border = '2px solid black'
        machineList.style.fontSize = '0.9em'
        machineList.style.borderCollapse = 'collapse'
        machineList.style.minWidth = '400px'
        // machineList.style.width ='60%'
        // machineList.style.marginTop = '15px'
        machineList.style.margin = '15px 5px'
        machineList.style.fontFamily = 'sans-serif'
        machineList.style.boxShadow = '2px 2px 20px #888888'

        this.content.appendChild(machineList)

        const firstRowMachineList = document.createElement('tr');
        machineList.appendChild(firstRowMachineList)
        firstRowMachineList.style.backgroundColor = '#ffc20a'
        firstRowMachineList.style.color = '#000000'
        firstRowMachineList.style.textAlign = 'center'


        for (let index = 1; index < 19; index++) {
            const RowTitleMachineList = document.createElement('th');
            firstRowMachineList.appendChild(RowTitleMachineList)
            RowTitleMachineList.id = 'Title' + [index]
        }

        firstRowMachineList.querySelector('#Title1').innerText = 'Model name' //this could also be retrieved automatically from machine BIM model
        firstRowMachineList.querySelector('#Title2').innerText = 'Type'
        firstRowMachineList.querySelector('#Title3').innerText = 'Specs'
        firstRowMachineList.querySelector('#Title4').innerText = 'Work start / end'
        firstRowMachineList.querySelector('#Title5').innerText = 'Total operation time (h)'
        firstRowMachineList.querySelector('#Title6').innerText = 'Drilling time (h)'
        firstRowMachineList.querySelector('#Title7').innerText = 'Idling time (h)'
        firstRowMachineList.querySelector('#Title8').innerText = 'Driving time (h)'
        firstRowMachineList.querySelector('#Title9').innerText = 'Mileage (km)'
        firstRowMachineList.querySelector('#Title10').innerText = 'Total Fuel consumed (l)' //tank capacity is 1200 L
        firstRowMachineList.querySelector('#Title11').innerText = 'Avg fuel consumpt. (l/h)'
        firstRowMachineList.querySelector('#Title12').innerText = 'Total CO2 Emissions (kg)'
        firstRowMachineList.querySelector('#Title13').innerText = 'Avg. CO2 rate (kg/h)'
        firstRowMachineList.querySelector('#Title14').innerText = 'Total NOx Emissions (g)'
        firstRowMachineList.querySelector('#Title15').innerText = 'Avg. NOx rate (g/h)'
        firstRowMachineList.querySelector('#Title16').innerText = 'Total PM Emissions (g)'
        firstRowMachineList.querySelector('#Title17').innerText = 'Avg. PM rate (g/h)'
        firstRowMachineList.querySelector('#Title18').innerText = 'Performance'

        const secondRowMachineList = document.createElement('tr');
        machineList.appendChild(secondRowMachineList)

        for (let index = 1; index < 19; index++) {
            const secondrowData = document.createElement('td');
            secondRowMachineList.appendChild(secondrowData)
            secondrowData.style.borderBottom = '2px solid #dddddd'
            secondrowData.style.textAlign = 'center'
            secondrowData.style.minWidth = '50px'
            secondrowData.style.padding = '5px 5px'
            secondrowData.id = 'data' + [index]
        }
        secondRowMachineList.querySelector('#data1').innerText = 'Bauer BG 55 V'
        secondRowMachineList.querySelector('#data2').innerText = 'Drilling rig'
        secondRowMachineList.querySelector('#data3').innerHTML = '<a href="https://www.bauer.de/export/shared/documents/pdf/bma/datenblatter/BG_Rotary_Drilling_Rig/BG_55_BS_115_RotaryDrilling_Rig_EN_905_871_2.pdf";>Specs</a>'
        secondRowMachineList.querySelector('#data4').innerText = '01-09-22 / 01-12-22'
        secondRowMachineList.querySelector('#data5').innerText = (machineInfo['OperationTime'] / 60).toFixed(2)  // needs to divides by 60 because we get in minutes and show it in hours
        secondRowMachineList.querySelector('#data6').innerText = (machineInfo['DrillingTime'] / 60).toFixed(2)
        secondRowMachineList.querySelector('#data7').innerText = (machineInfo['IdlingTime'] / 60).toFixed(2)
        secondRowMachineList.querySelector('#data8').innerText = (machineInfo['MovingTime'] / 60).toFixed(2)
        secondRowMachineList.querySelector('#data9').innerText = machineInfo['DistanceTravelled']
        secondRowMachineList.querySelector('#data10').innerText = (machineInfo['TotalFuel'] / 1000 / 0.85).toFixed(2) //its in grams the fuel - converts to kg and 1 litre is 0,85 kg.
        secondRowMachineList.querySelector('#data11').innerText = ((machineInfo['TotalFuel'] / 1000 / 0.85) / (machineInfo['OperationTime'] / 60)).toFixed(2)  //divides total fuel by total working hours
        secondRowMachineList.querySelector('#data12').innerText = (machineInfo['TotalCO2'] / 1000).toFixed(2) // Divides by 1000 bbecause retrieves in grams and shows its in kg
        secondRowMachineList.querySelector('#data13').innerText = ((machineInfo['TotalCO2'] / 1000) / (machineInfo['OperationTime'] / 60)).toFixed(2)
        secondRowMachineList.querySelector('#data14').innerText = (machineInfo['TotalNOx']).toFixed(2)
        secondRowMachineList.querySelector('#data15').innerText = ((machineInfo['TotalNOx']) / (machineInfo['OperationTime'] / 60)).toFixed(2)
        secondRowMachineList.querySelector('#data16').innerText = (machineInfo['TotalPM']).toFixed(2)
        secondRowMachineList.querySelector('#data17').innerText = ((machineInfo['TotalPM']) / (machineInfo['OperationTime'] / 60)).toFixed(2)
       
        //To appear message in the performance field if it exceeds certain thresholds
        function ExceedThresholds() {
            const avgCO2rate = (machineInfo['TotalCO2'] / 1000) / (machineInfo['OperationTime'] / 60)
            const IdlingProportion = machineInfo['IdlingTime'] / machineInfo['OperationTime']
            if (avgCO2rate > MachineCO2rateThreshold) {
                return 'Excessive CO2 emissions'
            }
            else if (IdlingProportion > IdlingProportionThreshold) {
                return 'Excessive Idling'
            }
            else {
                return 'OK'
            }
        } 
        secondRowMachineList.querySelector('#data18').innerText = ExceedThresholds()

        //to turn the message in the performance field red or green
        if (secondRowMachineList.querySelector('#data18').innerText === 'Excessive CO2 emissions') { secondRowMachineList.querySelector('#data18').style.color = 'red' }
        else if (secondRowMachineList.querySelector('#data18').innerText === 'Excessive Idling') {
            secondRowMachineList.querySelector('#data18').style.color = 'red'
        } else { secondRowMachineList.querySelector('#data18').style.color = 'green' }

        //select the machine when clicking on the machine name
        secondRowMachineList.querySelector('#data1').addEventListener('click', () => {
            this.viewer.select(10647, Autodesk.Viewing.SelectionMode.REGULAR)
        })


        const thirdRowMachineList = document.createElement('tr');
        machineList.appendChild(thirdRowMachineList)

        for (let index = 1; index < 19; index++) {
            const thirdRowData = document.createElement('td');
            // thirdRowData.style.border = '2px solid black'
            thirdRowData.style.borderBottom = '2px solid #ffc20a'
            thirdRowData.style.backgroundColor = '#f3f3f3'
            thirdRowData.style.textAlign = 'center'
            thirdRowData.style.minWidth = '50px'
            // thirdRowData.style.padding ='2px 5px'
            thirdRowData.style.padding = '5px 5px'
            thirdRowMachineList.appendChild(thirdRowData)
            thirdRowData.id = 'data' + [index]
        }
        thirdRowMachineList.querySelector('#data1').innerText = 'Hitachi ZX135US-6'
        thirdRowMachineList.querySelector('#data2').innerText = 'Excavator'
        thirdRowMachineList.querySelector('#data3').innerText = 'Specs'
        thirdRowMachineList.querySelector('#data3').innerHTML = '<a href="https://www.hitachicm.eu/wp-content/uploads/2018/08/KA-EN283EU.pdf";>Specs</a>'
        thirdRowMachineList.querySelector('#data4').innerText = '20-11-22 / 20-12-23'
        thirdRowMachineList.querySelector('#data5').innerText = '-'
        thirdRowMachineList.querySelector('#data6').innerText = '-'
        thirdRowMachineList.querySelector('#data7').innerText = '-'
        thirdRowMachineList.querySelector('#data8').innerText = '-'
        thirdRowMachineList.querySelector('#data9').innerText = '-'
        thirdRowMachineList.querySelector('#data10').innerText = '-'
        thirdRowMachineList.querySelector('#data11').innerText = '-'
        thirdRowMachineList.querySelector('#data12').innerText = '-'
        thirdRowMachineList.querySelector('#data13').innerText = '-'
        thirdRowMachineList.querySelector('#data14').innerText = '-'
        thirdRowMachineList.querySelector('#data15').innerText = '- '
        thirdRowMachineList.querySelector('#data15').style.color = 'red'

        thirdRowMachineList.querySelector('#data1').addEventListener('click', () => {
            this.viewer.select(10710, Autodesk.Viewing.SelectionMode.REGULAR)
        })

        //text
        const h1 = document.createElement('h1');
        h1.innerText = 'Select the machine in the model or in the table to see charts'
        h1.style.fontSize = '15px'
        this.content.appendChild(h1)

        //buttons 
        const machineButtonstable = document.createElement('table');
        machineButtonstable.style.marginTop = '10px'
        const machineButtonRows = document.createElement('tr');
        machineButtonstable.appendChild(machineButtonRows)
        const machineButtonsCell1 = document.createElement('td')
        const machineButtonsCell2 = document.createElement('td')
        const machineButtonsCell3 = document.createElement('td')
        machineButtonRows.appendChild(machineButtonsCell1)
        machineButtonRows.appendChild(machineButtonsCell2)
        machineButtonRows.appendChild(machineButtonsCell3)
        const machineButton1 = document.createElement('button')
        const machineButton2 = document.createElement('button')
        const machineButton3 = document.createElement('button')
        machineButtonsCell1.appendChild(machineButton1)
        machineButtonsCell2.appendChild(machineButton2)
        machineButtonsCell3.appendChild(machineButton3)

        //data for sending the report
        const operationTotal = (machineInfo['OperationTime'] / 60).toFixed(2)
        const drillingTotal = (machineInfo['DrillingTime'] / 60).toFixed(2)
        const CO2Total = (machineInfo['TotalCO2'] / 1000).toFixed(2)
        const CO2Rate = ((machineInfo['TotalCO2'] / 1000) / (machineInfo['OperationTime'] / 60)).toFixed(2)
        const PMTotal = (machineInfo['TotalPM']).toFixed(2)
        const PMrate = ((machineInfo['TotalPM']) / (machineInfo['OperationTime'] / 60)).toFixed(2)
        const NOxTotal = (machineInfo['TotalNOx']).toFixed(2)
        const NOxRate = ((machineInfo['TotalNOx']) / (machineInfo['OperationTime'] / 60)).toFixed(2)
        const totalFuel = (machineInfo['TotalFuel'] / 1000 / 0.85).toFixed(2)
        const FuelRate = ((machineInfo['TotalFuel'] / 1000 / 0.85) / (machineInfo['OperationTime'] / 60)).toFixed(2)

        machineButton3.innerHTML = `<a href="mailto:destinatary@mail.com?subject=Report of machinery use on site Project XXX - Date ${new Date().toDateString()} &body=Machine model BAUER BG 55 (Drilling rig) was operated for ${operationTotal} hours (${drillingTotal} hours of drilling). %0D%0ATotal emissions produced so far are ${CO2Total} kilograms of CO2; ${NOxTotal} grams of NOx; ${PMTotal} grams of PM. %0D%0ACurrent average emission rates are ${CO2Rate} kg of CO2/hour; ${NOxRate} grams of NOx/hour; ${PMrate} grams of PM/hour. %0D%0ATotal fuel consumed so far is ${totalFuel} liters, with a consumption rate of ${FuelRate} liters/hour." style="text-decoration:none; color:black">Send report</a>`
        machineButton3.style.borderRadius = '4px'
        machineButton3.style.cursor = 'pointer'

        machineButton1.textContent = 'Draw / Erase Trajectory'
        machineButton1.style.borderRadius = '4px'
        machineButton1.style.cursor = 'pointer'
        machineButton1.addEventListener('click', () => {
            if (this._areLinesShowing) { // Same as (this._areLinesShowing === true)
                // If showing, erase lines and set the visibility to false.
                this.eraseLines();
                this._areLinesShowing = false;
            } else { // Same as (else if (!this._areLinesShowing))
                // If not showing, draw lines and set the visibility to true
                this.drawLines();
                this._areLinesShowing = true;
            }
        })

        machineButton2.textContent = 'Forecast performance'
        machineButton2.style.borderRadius = '4px'
        machineButton2.style.cursor = 'pointer'
        machineButton2.id = 'machinesimulatebutton'

        this.content.appendChild(machineButtonstable)

        this.scrollContainer.appendChild(this.content); //all content needs to go inside scroll container

    }

    drawLines() {
        this.geometry = new THREE.Geometry();
        const positiondata = getLocationObjects();
        
        const positiondouble = positiondata.flatMap(i => [i, i]);  //this duplicates values because lines are draw as pairs of points.
        //then we start the drawing from point one to eliminate the first duplicate point.
        for (let i = 1; i < positiondouble.length - 1; i++) {
            this.geometry.vertices.push(positiondouble[i].Lmv);
        }
        
        this.linesMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(0x7FFF00),
            transparent: true,
            depthWrite: false,
            depthTest: true,
            linewidth: 10, //will always be 1 regardless. Forge viewer bug.
            opacity: 1.0
        });

        this.lines = new THREE.Line(this.geometry,
            this.linesMaterial,
            THREE.LinePieces)

        this.viewer.impl.createOverlayScene(
            'myOverlay', this.linesMaterial)

        this.viewer.impl.addOverlay(
            'myOverlay', this.lines)

        this.viewer.impl.invalidate(true)

        console.log('DrawLines Function was called');
    }

    eraseLines() {
        this.viewer.impl.removeOverlay(
            'myOverlay', this.lines)
        console.clear();
    }

}


Autodesk.Viewing.theExtensionManager.registerExtension('MachinesOverview', MachinesOverview);

//Creates panel for forecasting machine data
class MachineSimulationPanel extends Autodesk.Viewing.UI.PropertyPanel {
    constructor(viewer, container, id, title, options) {
        super(container, id, title, options);
        this.viewer = viewer;
        this.container.style.height = "500px";
        this.container.style.width = "300px";

        this.content = document.createElement('div');
        const tableForecasting = document.createElement('table')
        this.content.appendChild(tableForecasting)
        const rowTableForecasting = document.createElement('tr')
        tableForecasting.appendChild(rowTableForecasting)
        const cell1TableForecasting = document.createElement('td')
        rowTableForecasting.appendChild(cell1TableForecasting)
        const cell2TableForecasting = document.createElement('td')
        cell2TableForecasting.style.paddingLeft = '1.5em'
        rowTableForecasting.appendChild(cell2TableForecasting)

        const forminputs = document.createElement('div')

        forminputs.innerHTML = `
        <FORM>
        <label for="machine">Machine ID:</label>
        <input type="text" id="machine" name="machine"><br><br>
        <label for="hours">No. Operation Hours:</label>
        <input type="text" id="hours" name="hours"><br><br>
        </FORM>
        `

        const buttonforSimulate = document.createElement('button')
        buttonforSimulate.innerText = 'Forecast'
        forminputs.appendChild(buttonforSimulate)
        buttonforSimulate.addEventListener('click', () => {

            var FieldValue = document.getElementById("hours").value;
            var FieldModelMachine = document.getElementById("machine").value;

            //for giving an error if tries to simulate with no values
            if (isNaN(FieldValue) | FieldValue == "") {
                var OutputValue = document.getElementById("outputfield");
                while (OutputValue.firstChild) OutputValue.removeChild(OutputValue.firstChild)
                var ErrorMessage = document.createTextNode("Incorrect or no content in the input field. Note: The system uses . (dot) as decimal separator!");
                OutputValue.appendChild(ErrorMessage);
            }

            else { //If there are inputs excutes the code below
                //Starts with if condition to use different values depending on the machine model written in the input field
                if (FieldModelMachine === 'Bauer BG 55 V') {
                    var OutputValue = document.getElementById("outputfield");
                    while (OutputValue.firstChild) OutputValue.removeChild(OutputValue.firstChild)
                    const CO2rate = ((machineInfo['TotalCO2'] / 1000) / (machineInfo['OperationTime'] / 60))
                    const PMrate = ((machineInfo['TotalPM']) / (machineInfo['OperationTime'] / 60))
                    const NOxRate = ((machineInfo['TotalNOx']) / (machineInfo['OperationTime'] / 60))
                    const FuelRate = ((machineInfo['TotalFuel'] / 1000 / 0.85) / (machineInfo['OperationTime'] / 60)).toFixed(2)
                    var resultCO2 = (FieldValue * CO2rate).toFixed(2)
                    var resultPM = (FieldValue * PMrate).toFixed(2)
                    var resultNOx = (FieldValue * NOxRate).toFixed(2)
                    var resultFuel = (FieldValue * FuelRate).toFixed(2)
                    var TextResult = `Expected Emissions for ${FieldValue} hours of operation based on current data is: ${resultCO2} kilograms of CO2; ${resultPM} grams of PM; ${resultNOx} grams of NOx. Expected fuel consumption is ${resultFuel} liters.  `
                    var text = document.createTextNode(TextResult);
                    OutputValue.appendChild(text);
                }
            }

        })

        const forminputs2 = document.createElement('div')

        forminputs2.innerHTML = `
        <FORM>
        <label for="machine2">Machine ID:</label>
        <input type="text" id="machine2" name="machine2"><br><br>
        <label for="hours2">No. Operation Hours:</label>
        <input type="text" id="hours2" name="hours2"><br><br>
        </FORM>
        `
        const buttonforSimulate2 = document.createElement('button')
        buttonforSimulate2.innerText = 'Forecast'
        forminputs2.appendChild(buttonforSimulate2)
        buttonforSimulate2.addEventListener('click', () => {

            var FieldValue2 = document.getElementById("hours2").value;
            var FieldModelMachine2 = document.getElementById("machine2").value;

            if (isNaN(FieldValue2) | FieldValue2 == "") {
                var OutputValue2 = document.getElementById("outputfield2");
                while (OutputValue2.firstChild) OutputValue2.removeChild(OutputValue2.firstChild)
                var ErrorMessage2 = document.createTextNode("Incorrect or no content in the input field. Note: The system uses . (dot) as decimal separator!");
                OutputValue2.appendChild(ErrorMessage2);
            }

            else {
                if (FieldModelMachine2 === 'Bauer BG 55 V') {
                    var OutputValue2 = document.getElementById("outputfield2");
                    while (OutputValue2.firstChild) OutputValue2.removeChild(OutputValue2.firstChild)
                    const CO2rate2 = ((machineInfo['TotalCO2'] / 1000) / (machineInfo['OperationTime'] / 60))
                    const PMrate2 = ((machineInfo['TotalPM']) / (machineInfo['OperationTime'] / 60))
                    const NOxRate2 = ((machineInfo['TotalNOx']) / (machineInfo['OperationTime'] / 60))
                    const FuelRate2 = ((machineInfo['TotalFuel'] / 1000 / 0.85) / (machineInfo['OperationTime'] / 60)).toFixed(2)
                    var resultCO22 = (FieldValue2 * CO2rate2).toFixed(2)
                    var resultPM2 = (FieldValue2 * PMrate2).toFixed(2)
                    var resultNOx2 = (FieldValue2 * NOxRate2).toFixed(2)
                    var resultFuel2 = (FieldValue2 * FuelRate2).toFixed(2)
                    var TextResult2 = `Expected Emissions for ${FieldValue2} hours of operation based on current data is: ${resultCO22} kilograms of CO2; ${resultPM2} grams of PM; ${resultNOx2} grams of NOx. Expected fuel consumption is ${resultFuel2} liters.`
                    var text2 = document.createTextNode(TextResult2);
                    OutputValue2.appendChild(text2);
                }
            }

        })

        const rowTableForecastingOutputs = document.createElement('tr')
        tableForecasting.appendChild(rowTableForecastingOutputs)
        const cell3TableForecasting = document.createElement('td')
        rowTableForecastingOutputs.appendChild(cell3TableForecasting)
        const cell4TableForecasting = document.createElement('td')
        cell4TableForecasting.style.paddingLeft = '1.5em'
        rowTableForecastingOutputs.appendChild(cell4TableForecasting)
        const outputField = document.createElement('div')
        outputField.id = 'outputfield'
        const outputField2 = document.createElement('div')
        outputField2.id = 'outputfield2'
        cell3TableForecasting.appendChild(outputField)
        cell4TableForecasting.appendChild(outputField2)

        cell1TableForecasting.appendChild(forminputs)
        cell2TableForecasting.appendChild(forminputs2)

        this.scrollContainer.appendChild(this.content); //all content needs to go inside scroll container

    }
}

//Creates data chart panel for Drilling Machine
class PileDriverDataPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 500) + 'px';
        this.container.style.height = (options.height || 450) + 'px';
        this.container.style.resize = 'none';
        this.chartType = options.chartType || 'bar';
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
        this.content.style.overflow = 'scroll'
        this.content.style.height = '400px';
        this.content.style.backgroundColor = 'white';
        this.content.innerHTML = `
        <div class="props-container" style="position: relative; height: 25px; padding: 0.5em;">
        <select class="props">
            <option value="Power">Engine Power</option>
            <option value="Emissions">Emissions</option>
            <option value="Fuel">Fuel Consumption</option>
            <option value="Speeds">Speeds</option>
        </select>
        </div>
        <div class="chart-container" style="position: relative; overflow-x: scroll; width:600px; height: 350px; padding: 0.5em;">
        <canvas class="chart"></canvas>
        </div>
        `;
        this.canvas = this.content.querySelector('canvas.chart');
        this.container.appendChild(this.content);
    }

    createChart() {
        return new Chart(this.canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: timestamps, 
                datasets: [{
                    data: AvgEnginePowers,
                    label: "Avg. Power ", 
                    borderColor: "#3e95cd",
                    backgroundColor: "#3e95cd",
                    fill: false
                }, {
                    data: minEnginePowers,
                    label: "Min. Power",
                    borderColor: "#8e5ea2",
                    backgroundColor: "#8e5ea2",
                    fill: false
                }, {
                    data: maxEnginePowers,
                    label: "Max. Power",
                    borderColor: "#FFA500",
                    backgroundColor: "#FFA500",
                    fill: false
                }
                ] 
            },
            options: {
                title: {
                    display: true,
                    text: 'Data Pile driver'
                }
            }
        });
    }

    
}

//Creates data chart panel for excavator 
class ExcavatorDataPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 500) + 'px';
        this.container.style.height = (options.height || 450) + 'px';
        this.container.style.resize = 'none';
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
        this.content.style.overflow = 'scroll'
        this.content.style.height = '400px';
        this.content.style.backgroundColor = 'white';
        this.content.innerHTML = `
        <div class="props-container" style="position: relative; height: 25px; padding: 0.5em;">
        <select class="props">
        <option value="Power">Engine Power</option>
        <option value="Emissions">Emissions</option>
        <option value="Fuel">Fuel Consumption</option>
        <option value="Speeds">Speeds</option>
        </select>
        </div>
        <div class="chart-container" style="position: relative; height: 350px; padding: 0.5em;">
        <canvas class="chart"></canvas>
        </div>
        `;

        const selectElement = this.content.querySelector('select.props');
        selectElement.onchange = this.updateChart;


        this.select = selectElement;
        this.canvas = this.content.querySelector('canvas.chart');
        this.container.appendChild(this.content);
    }

    // updateChart(event) {
    //     const value = event.target.value;

    //     switch (value) {
    //         case 'Power':
    //             //placeholder to execute change of data
    //             break;
    //         case 'Emissions':
    //             //placeholder to execute change of data
    //             break;
    //         case 'Fuel':
    //             //placeholder to execute change of data
    //             break;
    //         case 'Speeds':
    //             //placeholder to execute change of data
    //             break;
    //         default:
    //             break;
    //     }
    // }


    createChart() {
        return new Chart(this.canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['06/10/22 14:50', '06/10/22 14:51', '06/10/22 14:52', '06/10/22 14:53', '06/10/22 14:54', '06/10/22 14:55'], //get timestamps
                datasets: [{
                    data: [95, 180, 280, 250, 120, 140],
                    label: "Avg. Power ", 
                    borderColor: "#3e95cd",
                    backgroundColor: "#3e95cd",
                    fill: false
                }, {
                    data: [64, 150, 240, 64, 53, 86],
                    label: "Min. Power",
                    borderColor: "#8e5ea2",
                    backgroundColor: "#8e5ea2",
                    fill: false
                }, {
                    data: [110, 260, 320, 300, 220, 200],
                    label: "Max. Power",
                    borderColor: "#FFA500",
                    backgroundColor: "#FFA500",
                    fill: false
                }
                ]
            },
            options: {
                title: {
                    display: true,
                    text: 'Data Piledriver'
                }
            }
        });
    }
}