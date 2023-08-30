import { BaseExtension } from './BaseExtension.js';
import { getDataforPiles } from './DataProcessing.js';


//this is used in tables, charts and heatmap - sets the order for clicking on the pile and seeing correct data
const ListPilesDbIds = [3646,3686,3687,3688,3689,3690,3691,3692,3693,3694,3695,3696,3697,3698,3699,3700,3701,3702,3703,3704,3705,3706,3707,3708,3709,3710,3711,3712,3713,3714,3715,3716,3717,3718,3719,3720,3721,3722,3723,3724,3725,3726,3727,3728,3729,3730,3731,3732,3733,3734,3735,3736,3737,3738,3739,3740,3741,3742,3743,3744,3745,3746,3747,3748,3749,3750,3751,3752,3753,3754,3755,3756,3757,3758,3759,3760,3761,3762,3763,3764,3765,3766,3767,3768,3769,3770,3771,3772,3773,3774,3775,3776,3777,3778,3779,3780,3781,3782,3783,3784,3785,3786,3787,3788,3789,3790,3791,3792,3793,3794,3795,3796,3797,3798,3799,3800,3801,3802,3803,3804,3805,3806,3807,3808,3809,3810,3811,3812,3813,3814,3815,3816,3817,3818,3819,3820,3821,3822,3823,3824,3825,3826,3827,3828,3829,3830,3831,3832,3833,3834]
// console.log(ListPilesDbIds); 

const DataBboxespilesEmissions = getDataforPiles();


const PilesNames = []
for (let i = 1; i < ListPilesDbIds.length + 1; i++) {
    const Names = 'Pile' + i
    PilesNames.push(Names)
}

//Necessary for naming the piles for the heatmaps 
const SensorPointsNames = []
for (let i = 1; i < ListPilesDbIds.length + 1; i++) {
    const PointNames = 'Pile-sensor-' + i
    SensorPointsNames.push(PointNames)
}

//Empty arrays for storing all values. Necessary for the sums in the panels and for the charts (so that it can find by index when selection changes in the same order as pile).
const dataForallPiles = [];
const CO2Emissions = [];
const PMEmissions = [];
const NOxEmissions = [];
const WorkingTime = []; //driling time 
const AvgPowers = [];
const AvgDrivingSpeeds = [];
const AvgDrillingSpeeds = [];
const filteredCO2Emissions = [];
const filteredNOxEmissions = [];
const filteredPMEmissions = [];

//Also for storing data when the chart is updated by clicking in a different pile. 
let newChartLabel = [];
let newchartCO2Data = [];
let newchartNOxData = [];
let newchartPMData = [];
let newchartAvgPower = [];
let newChartDrillingTime = [];
let newchartAvgDrillingSpeed = [];


//For retrieving the processed data and sending it to the arrays above
setTimeout(() => {
    const data = getDataforPiles();
    dataForallPiles.push(data);
    dataForallPiles[0].forEach(i => {
        CO2Emissions.push(i.SumCO2 / 1000) //for now divides by 1000 because is in grams to kgs
        PMEmissions.push(i.SumPM)
        NOxEmissions.push(i.SumNOx)
        WorkingTime.push(i.WorkingTime / 60) //retrieves in minuts and we want in hours
        AvgPowers.push(i.AvgPower)
        AvgDrillingSpeeds.push(i.AvgDrillingSpeed)

    })

    //For eliminating NaN values in empty piles, else the sums go wrong.
    CO2Emissions.forEach(i => {
        filteredCO2Emissions.push(isNaN(i) ? 0 : i); //if isNaN(i) is true uses 0(to the left) and if its false uses i(to the right)
    });
    PMEmissions.forEach(i => {
        filteredPMEmissions.push(isNaN(i) ? 0 : i); //if isNaN(i) is true uses 0(to the left) and if its false uses i(to the right)
    });
    NOxEmissions.forEach(i => {
        filteredNOxEmissions.push(isNaN(i) ? 0 : i); //if isNaN(i) is true uses 0(to the left) and if its false uses i(to the right)
    });
    // console.log('CO2Emissions', filteredCO2Emissions)
}, 10000) 

//Initial counters of piles for the overview panel
let TotalNoPiles = 0;
let countPilesInExec = 0;
let countPilesfinished = 0 //initial counter of finished piles. Will be used for updating counter when marking piles as finished.
setTimeout(() => {
    //Necessary for naming the piles for the charts and heatmaps
    DataBboxespilesEmissions.forEach(i => {
        if (i.length) {
            countPilesInExec++;
        }
    }) 
    TotalNoPiles = DataBboxespilesEmissions.length
}, 10000);

//Thresholds for time and emissions per pile
const CO2perPilethreshold = 2; //kilograms 
const TimePerPilethreshold = 10; //hours
const PMperPileThreshold = 2; //grams
const NOxPerPileThreshold = 20; //grams

class ActivitiesOverview extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._barChartPanel = null;
        this._PileslistPanel = null;
        this._PilesSimulationPanel = null;
        this._ActivitiesOverviewPanel = null;
        this._extension = null; //heatmap extension
        this._isHeatmapShowing = false; 
    }

    async load() {
        super.load();
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.1/chart.min.js', 'Chart');
        Chart.defaults.plugins.legend.display = true;
        return true;
    }

    unload() {
        super.unload();
        for (const button of [this._barChartButton]) {
            this.removeToolbarButton(button);
        }
        this._barChartButton = null;
        for (const panel of [this._barChartPanel]) {
            panel.setVisible(false);
            panel.uninitialize();
        }
        this._barChartPanel = null;
        return true;
    }

    onToolbarCreated() {
        this._barChartPanel = new DatachartPanel(this, 'datachart-panel-new', 'Piles Data', { x: 10, y: 10, chartType: 'bar' });
        this._barChartButton = this.createToolbarButton('activity-overview-button', 'https://img.icons8.com/ios/344/combo-chart--v1.png', 'Show Activity Overview)');
        setTimeout(() => { //needs the timeout else it creates panel as soon as the viewer is initialized. Needs to wait for data to process 
            this._ActivitiesOverviewPanel = new ActivitiesOverviewPanel(this.viewer, this.viewer.container, 'ActivitiesOverviewPanel', 'Show Activities Overview');
            this._PileslistPanel = new PilesListPanel(this.viewer, this.viewer.container, 'listPilesPanel', 'Piles list');
            this._PilesSimulationPanel = new PilesSimulationPanel(this.viewer, this.viewer.container, 'PilesSimulationPanel', 'Piles Forecasting');
            this._HeatmapSwitchPanel = new HeatmapSwitchPanel(this, 'piles-heatmap-panel', 'Heatmap Piles', { x: 10, y: 10 });
        }, 12000)
        this._barChartButton.onClick = () => {
            this._ActivitiesOverviewPanel.setVisible(!this._ActivitiesOverviewPanel.isVisible());
            this._barChartButton.setState(this._ActivitiesOverviewPanel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            

            //Gets button to add click event to appear list of piles
            this._ActivitiesOverviewPanel.content.querySelector('#PilesDetailsButton').addEventListener('click', () => {
                this._PileslistPanel.setVisible(!this._PileslistPanel.isVisible());
                this._barChartButton.setState(this._PileslistPanel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);

                this._barChartPanel.setVisible(!this._barChartPanel.isVisible());
                this._barChartButton.setState(this._barChartPanel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);

            })

            //Gets button to add click event to appear simulation panel
            this._ActivitiesOverviewPanel.content.querySelector('#SimulatePiles').addEventListener('click', () => {
                this._PilesSimulationPanel.setVisible(!this._PilesSimulationPanel.isVisible());
                this._barChartButton.setState(this._PilesSimulationPanel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);

            })


            //Gets button to add click event to initialize piles heatmap 
            this._ActivitiesOverviewPanel.content.querySelector('#PilesHeatmapButton').addEventListener('click', () => {
                this._HeatmapSwitchPanel.setVisible(!this._HeatmapSwitchPanel.isVisible());
                this._barChartButton.setState(this._HeatmapSwitchPanel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);

                if (this._isHeatmapShowing) { // Same as (this._isHeatmapShowing === true)
                    // If showing disable heatmap.
                    this.disableHeatmap();
                    this._isHeatmapShowing = false;
                } else { // Same as (else if (!this._isHeatmapShowing))
                    // Else if not showing, enable heatmap.
                    this.loadHeatmap();
                    this._isHeatmapShowing = true;
                }

            })

            //For updating the heatmaps
            const selectElement = this._HeatmapSwitchPanel.container.querySelector('select.props');
            selectElement.onchange = (event) => {
                const value = event.target.value;

                switch (value) {
                    case 'CO2':
                        this.disableHeatmap();
                        this.loadHeatmap();
                        break;
                    case 'PM':
                        this.disableHeatmap();
                        this.loadHeatmapPM();
                        break;
                    case 'NOx':
                        this.disableHeatmap();
                        this.loadHeatmapNOx();
                        break;

                    default:
                        break;
                }
            }


        };



    }

    onModelLoaded(model) {
        super.onModelLoaded(model);
        if (this._barChartPanel && this._barChartPanel.isVisible()) {
            // this._barChartPanel.setModel(model);
        }

    }

    async onSelectionChanged(model, dbids) {
        // setTimeout(() =>  { 
        super.onSelectionChanged(model, dbids);
        for (let i = 0; i < ListPilesDbIds.length; i++) {
            if (dbids[0] === ListPilesDbIds[i]) {
                // console.log('emissiondatapile', CO2Emissions[i])
                newChartLabel = PilesNames[i] //needs to get it from the list that says D1180-1
                newchartCO2Data = CO2Emissions[i] //CO2 DATA
                newchartNOxData = NOxEmissions[i] //CO2 DATA
                newchartPMData = PMEmissions[i] //CO2 DATA
                // newchartAvgPower = AvgPowers[i]
                // newchartAvgDrillingSpeed = AvgDrillingSpeeds[i]
                newchartAvgPower = 0
                newchartAvgDrillingSpeed = 0
                newChartDrillingTime = WorkingTime[i] * 60 //neds to be drilling time
                // newChartDrillingSpeed = AvgSpeeds[i] //neds to be drilling time
                this._barChartPanel.chart.data.labels[0] = newChartLabel;
                this._barChartPanel.chart.data.datasets[0].data[0] = newchartCO2Data; //CO2
                this._barChartPanel.chart.data.datasets[1].data[0] = newchartNOxData; //NO2
                this._barChartPanel.chart.data.datasets[2].data[0] = newchartPMData; //PM
                this._barChartPanel.chart.data.datasets[3].data[0] = newchartAvgPower; //Avg. Power
                this._barChartPanel.chart.data.datasets[4].data[0] = newChartDrillingTime; //drillign time
                this._barChartPanel.chart.data.datasets[5].data[0] = newchartAvgDrillingSpeed; //avg drillign speed
                this._barChartPanel.chart.update();
                // this._barChartPanel.setVisible(!this._barChartPanel.isVisible());
            }


        }
        // }, 12000) 
    }

    async loadHeatmap() {
        this._extension = await this.viewer.loadExtension("Autodesk.DataVisualization");

        const {
            SurfaceShadingData,
            SurfaceShadingPoint,
            SurfaceShadingNode,
        } = Autodesk.DataVisualization.Core;

        const ShadingNodes = []
        for (let i = 0; i < ListPilesDbIds.length; i++) {
            const Nodes = new SurfaceShadingNode(PilesNames[i], ListPilesDbIds[i])
            // console.log(Nodes)
            ShadingNodes.push(Nodes)
        }

        const ShadingPoints = []
        for (let i = 0; i < ListPilesDbIds.length; i++) {
            const Points = new SurfaceShadingPoint(SensorPointsNames[i], undefined, ["NOx", "CO2", "PM"])
            ShadingPoints.push(Points)
            ShadingPoints[i].positionFromDBId(this.viewer.model, ListPilesDbIds[i])

        }
        console.log('pointssss', ShadingPoints)


        const heatmapData = new SurfaceShadingData();

        for (let i = 0; i < ListPilesDbIds.length; i++) {
            ShadingNodes[i].addPoint(ShadingPoints[i])
            heatmapData.addChild(ShadingNodes[i])
        }
        // console.log('Nodesssss', ShadingNodes)

        //logging name sensor point and emission values to test
        // for (let i = 0; i < ListPilesDbIds.length; i++) {
        // console.log('id of points', ShadingPoints[i].id)
        // console.log('emission values for each', DataBboxespilesEmissions[i].TotalEmissions)
        // }


        heatmapData.initialize(this.viewer.model);


        await this._extension.setupSurfaceShading(this.viewer.model, heatmapData);

        this._extension.registerSurfaceShadingColors("NOx", ['#ff99cc', '#ff0080', '#99004d']);
        this._extension.registerSurfaceShadingColors("PM", ['#bf80ff', '#8c1aff', '#4d0099']); //#99c2ff #1a75ff #003380
        this._extension.registerSurfaceShadingColors("CO2", ['#00ff00', '#ffff00', '#FF0000']); //'#ff0090', '#8c00ff', '#00fffb'

        //for clamping values but not sure if thats necessary yet - depends on mx and min
        // const ClampedValues = []
        // DataBboxespilesEmissions.forEach(i => {
        //     const clamp = Math.min(Math.max(i.SumCO2 / 1000, 0.0), 1.0); //Math.min(Math.max(num, min), max);
        //     ClampedValues.push(clamp)
        // })

        // console.log('clamped values', ClampedValues)

        const testValues = {};
        for (let i = 0; i < ListPilesDbIds.length; i++) {
            testValues[ShadingPoints[i].id] = {
                currentIndex: 0,
                NOx: [
                    (DataBboxespilesEmissions[i].SumNOx) / 10//bc values need to be in a range 0<1
                ],
                PM: [
                    (DataBboxespilesEmissions[i].SumPM) / 10
                ],
                CO2: [
                    (DataBboxespilesEmissions[i].SumCO2) / 1000, //divides by 100 bc values need to be < 1
                ]
            }


        }

        console.log('here is the obj', testValues)



        function getSensorValueFromId(shadingPointId, sensorType) {
            const shadingPoint = testValues[shadingPointId];
            const currentIndex = shadingPoint["currentIndex"];
            const typeValues = shadingPoint[sensorType]
            shadingPoint["currentIndex"] = currentIndex + 1 < typeValues.length ? currentIndex + 1 : 0;
            const value = typeValues[currentIndex];
            return value;
        }

        // Function that provides the value. This needs to be updated for generating automatically from list of devices, see referneces herehttps://forge.autodesk.com/en/docs/dataviz/v1/developers_guide/examples/heatmap/create_heatmap_for_rooms/
        function getSensorValue(surfaceShadingPoint, sensorType) {
            console.log(surfaceShadingPoint, sensorType);
            const value = getSensorValueFromId(surfaceShadingPoint.id, sensorType);
            // console.log('value', value);
            return value;
        }


        // this._extension.renderSurfaceShading(PilesNames, "PM", getSensorValue); //renderSurfaceShading(nodeIds, sensorType, valueCallback, options). nodeIds = One or more identifiers of nodes to render. The callback function that will be invoked when surface shading requires the sensor value to render.
        this._extension.renderSurfaceShading(PilesNames, "CO2", getSensorValue); //renderSurfaceShading(nodeIds, sensorType, valueCallback, options). nodeIds = One or more identifiers of nodes to render. The callback function that will be invoked when surface shading requires the sensor value to render.

        // this._extension.renderSurfaceShading("Piles2", "Temperature", getSensorValue2); 
        // Update sensor values every 2 sec
        setInterval(() => {
            this._extension.updateSurfaceShading(getSensorValue);
            // this._extension.updateSurfaceShading(getSensorValue2);
        }, 5000);





        console.log('loadheatmapextension logged');
    }


    disableHeatmap() {
        this._extension.removeSurfaceShading(this.viewer.model);
    }

    async loadHeatmapPM() {
        this._extension = await this.viewer.loadExtension("Autodesk.DataVisualization");

        const {
            SurfaceShadingData,
            SurfaceShadingPoint,
            SurfaceShadingNode,
        } = Autodesk.DataVisualization.Core;

        const ShadingNodes = []
        for (let i = 0; i < ListPilesDbIds.length; i++) {
            const Nodes = new SurfaceShadingNode(PilesNames[i], ListPilesDbIds[i])
            // console.log(Nodes)
            ShadingNodes.push(Nodes)
        }

        const ShadingPoints = []
        for (let i = 0; i < ListPilesDbIds.length; i++) {
            const Points = new SurfaceShadingPoint(SensorPointsNames[i], undefined, ["NOx", "CO2", "PM"])
            ShadingPoints.push(Points)
            ShadingPoints[i].positionFromDBId(this.viewer.model, ListPilesDbIds[i])

        }
        console.log('pointssss', ShadingPoints)


        const heatmapData = new SurfaceShadingData();

        for (let i = 0; i < ListPilesDbIds.length; i++) {
            ShadingNodes[i].addPoint(ShadingPoints[i])
            heatmapData.addChild(ShadingNodes[i])
        }


        heatmapData.initialize(this.viewer.model);


        await this._extension.setupSurfaceShading(this.viewer.model, heatmapData);

        this._extension.registerSurfaceShadingColors("PM", ['#bf80ff', '#8c1aff', '#4d0099']); //#99c2ff #1a75ff #003380


        const testValues = {};
        for (let i = 0; i < ListPilesDbIds.length; i++) {
            testValues[ShadingPoints[i].id] = {
                currentIndex: 0,
                PM: [
                    (DataBboxespilesEmissions[i].SumPM) / 10
                ]
            }


        }

        console.log('here is the obj', testValues)



        function getSensorValueFromId(shadingPointId, sensorType) {
            const shadingPoint = testValues[shadingPointId];
            const currentIndex = shadingPoint["currentIndex"];
            const typeValues = shadingPoint[sensorType]
            shadingPoint["currentIndex"] = currentIndex + 1 < typeValues.length ? currentIndex + 1 : 0;
            const value = typeValues[currentIndex];
            return value;
        }

        // Function that provides the value. This needs to be updated for generating automatically from list of devices, see referneces herehttps://forge.autodesk.com/en/docs/dataviz/v1/developers_guide/examples/heatmap/create_heatmap_for_rooms/
        function getSensorValue(surfaceShadingPoint, sensorType) {
            console.log(surfaceShadingPoint, sensorType);
            const value = getSensorValueFromId(surfaceShadingPoint.id, sensorType);
            console.log('value', value);
            return value;
        }


        this._extension.renderSurfaceShading(PilesNames, "PM", getSensorValue);

        // Update sensor values every 2 sec
        setInterval(() => {
            this._extension.updateSurfaceShading(getSensorValue);

        }, 5000);


    }

    async loadHeatmapNOx() {
        this._extension = await this.viewer.loadExtension("Autodesk.DataVisualization");

        const {
            SurfaceShadingData,
            SurfaceShadingPoint,
            SurfaceShadingNode,
        } = Autodesk.DataVisualization.Core;

        const ShadingNodes = []
        for (let i = 0; i < ListPilesDbIds.length; i++) {
            const Nodes = new SurfaceShadingNode(PilesNames[i], ListPilesDbIds[i])
            // console.log(Nodes)
            ShadingNodes.push(Nodes)
        }

        const ShadingPoints = []
        for (let i = 0; i < ListPilesDbIds.length; i++) {
            const Points = new SurfaceShadingPoint(SensorPointsNames[i], undefined, ["NOx", "CO2", "PM"])
            ShadingPoints.push(Points)
            ShadingPoints[i].positionFromDBId(this.viewer.model, ListPilesDbIds[i])

        }
        console.log('pointssss', ShadingPoints)


        const heatmapData = new SurfaceShadingData();

        for (let i = 0; i < ListPilesDbIds.length; i++) {
            ShadingNodes[i].addPoint(ShadingPoints[i])
            heatmapData.addChild(ShadingNodes[i])
        }


        heatmapData.initialize(this.viewer.model);


        await this._extension.setupSurfaceShading(this.viewer.model, heatmapData);

        this._extension.registerSurfaceShadingColors("NOx", ['#ff99cc', '#ff0080', '#99004d']);

        const testValues = {};
        for (let i = 0; i < ListPilesDbIds.length; i++) {
            testValues[ShadingPoints[i].id] = {
                currentIndex: 0,
                NOx: [
                    (DataBboxespilesEmissions[i].SumNOx) / 10//bc values need to be in a range 0<1
                ]

            }


        }


        function getSensorValueFromId(shadingPointId, sensorType) {
            const shadingPoint = testValues[shadingPointId];
            const currentIndex = shadingPoint["currentIndex"];
            const typeValues = shadingPoint[sensorType]
            shadingPoint["currentIndex"] = currentIndex + 1 < typeValues.length ? currentIndex + 1 : 0;
            const value = typeValues[currentIndex];
            return value;
        }

        // Function that provides the value. This needs to be updated for generating automatically from list of devices, see referneces herehttps://forge.autodesk.com/en/docs/dataviz/v1/developers_guide/examples/heatmap/create_heatmap_for_rooms/
        function getSensorValue(surfaceShadingPoint, sensorType) {
            console.log(surfaceShadingPoint, sensorType);
            const value = getSensorValueFromId(surfaceShadingPoint.id, sensorType);
            console.log('value', value);
            return value;
        }


        this._extension.renderSurfaceShading(PilesNames, "NOx", getSensorValue);




    }

}

//Creates Data chart Panel
class DatachartPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 500) + 'px';
        this.container.style.height = (options.height || 400) + 'px';
        this.container.style.resize = 'none';
        this.chartType = options.chartType || 'bar'; // See https://www.chartjs.org/docs/latest for all the supported types of charts
        this.chart = this.createChart();
        // this.newchart = this.updateChart();
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.closer = this.createCloseButton();
        // this.footer = this.createFooter(); //to resize container
        this.initializeMoveHandlers(this.title);
        this.initializeCloseHandler(this.closer);
        this.footer = this.createFooter(); //to resize container
        this.container.appendChild(this.title);
        this.container.appendChild(this.closer);
        this.container.appendChild(this.footer);
        this.content = document.createElement('div');
        this.content.style.height = '400px';
        this.content.style.backgroundColor = 'white';
        this.content.innerHTML = `
       
        <div class="chart-container" style="position: relative; height: 300px; padding: 0.5em;">
        <canvas class="chart"></canvas>
        </div>
        `;
        //old one with select props
        // this.content.innerHTML = `
        // <div class="props-container" style="position: relative; height: 25px; padding: 0.5em;">
        // <select class="props">
        //     <option value="CO2">CO2</option>
        //     <option value="Fuel">Fuel</option>
        //     <option value="NOx">NOx</option>
        //     <option value="PM">PM</option>
        // </select>
        // </div>
        // <div class="chart-container" style="position: relative; height: 325px; padding: 0.5em;">
        // <canvas class="chart"></canvas>
        // </div>
        // `;

        // const selectElement = this.content.querySelector('select.props');
        // selectElement.onchange = this.updateChart;
        // this.select = selectElement;


        this.canvas = this.content.querySelector('canvas.chart');
        this.container.appendChild(this.content);
    }

    // updateChart(event) {
    //     const value = event.target.value;

    //     switch (value) {
    //         case 'CO2':
    //             console.log('co2 maaand');
    //             break;
    //         case 'NOx':
    //             console.log('NOx maaand');
    //             break;
    //         case 'Fuel':
    //             console.log('Fuel maaand');
    //             break;
    //         case 'PM':
    //             console.log('PM maaand');
    //             break;
    //         default:
    //             break;
    //     }
    // }

    createChart() {
        return new Chart(this.canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Pile name'], //or PilesNames[0]
                datasets: [{
                    data: [CO2Emissions[0]],
                    label: 'CO2 Emissions(kg)',
                    borderColor: "#FF0000",
                    backgroundColor: ["#FF0000"],
                    fill: false
                },
                {
                    data: [NOxEmissions[0]],
                    label: "NOx Emissions(g)",
                    borderColor: "#FFA500",
                    backgroundColor: ["#FFA500"],
                    fill: false
                },
                {
                    data: [PMEmissions[0]],
                    label: "PM Emissions (g)",
                    borderColor: "#FFFF00",
                    backgroundColor: ["#FFFF00"],
                    fill: false
                },
                {
                    data: [AvgPowers[0]],
                    label: "Avg. Power (kW)",
                    borderColor: "##008000",
                    backgroundColor: ["#008000"],
                    fill: false
                },
                {
                    data: [WorkingTime[0] * 60],
                    label: "Drilling time (min)",
                    borderColor: "#8e5ea2",
                    backgroundColor: ["#3e95cd"],
                    fill: false
                },
                {
                    data: [AvgDrillingSpeeds[0]],
                    label: "Avg. Drilling Speed (rpm)",
                    borderColor: "#800080",
                    backgroundColor: ["#800080"],
                    fill: false
                },

                ]
            },
            options: {
                title: {
                    display: true,
                    text: 'Data per piles'
                }
            }
        });
    }
}


//Creates list of piles panel
class PilesListPanel extends Autodesk.Viewing.UI.PropertyPanel {
    constructor(viewer, container, id, title, options) {
        super(container, id, title, options);
        this.viewer = viewer;
        this.container.style.height = "500px";
        this.container.style.width = "300px";
        //  this.scrollContainer.style.width = "auto";
        // this.scrollContainer.style.height = "auto";
        // this.scrollContainer.style.resize = "auto";


        this.content = document.createElement('div');

        const h1 = document.createElement('h1');
        h1.innerText = 'Click on piles on the list or in the model to see its charts'
        h1.style.fontSize = '15px'
        h1.style.fontFamily = 'sans-serif'
        const h2 = document.createElement('h1');
        h2.innerText = '*Drilling Times and CO2 Emissions above threshold appear in red color'
        h2.style.fontSize = '12px'
        h2.style.fontFamily = 'sans-serif'
        this.content.appendChild(h1)
        this.content.appendChild(h2)

        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse'
        table.style.width = '100%'
        table.style.fontSize = '0.9em'
        // machineList.style.width ='60%'
        // machineList.style.marginTop = '15px'
        table.style.margin = '5px 5px'
        table.style.fontFamily = 'sans-serif'
        table.style.boxShadow = '2px 2px 20px #888888'


        const firstRow = document.createElement('tr');
        table.appendChild(firstRow)

        for (let index = 1; index < 10; index++) {
            const RowTitles = document.createElement('td');
            firstRow.appendChild(RowTitles)
            RowTitles.id = 'Title' + [index]
            RowTitles.style.backgroundColor = '#ffc20a' //	
            RowTitles.style.color = '#000000' //	
            RowTitles.style.textAlign = 'center' //	
            RowTitles.style.fontWeight = 'bold' //	
        }

        firstRow.querySelector('#Title1').innerText = 'Pile'
        firstRow.querySelector('#Title2').innerText = 'Top Level'
        firstRow.querySelector('#Title3').innerText = 'Depth'
        firstRow.querySelector('#Title4').innerText = 'D(mm)'
        firstRow.querySelector('#Title5').innerText = 'Execution Status' //Finished / in execution /not started
        firstRow.querySelector('#Title6').innerText = 'Drilling Time (h)' //get length of array and divide by number of piles the machine can reach
        firstRow.querySelector('#Title7').innerText = 'Embedded CO2 (kg)' //Fixed value
        firstRow.querySelector('#Title8').innerText = 'Machine CO2 (kg)' //get CO2 sum of array and divide by number of piles the machine can reach
        firstRow.querySelector('#Title9').innerText = '' //get CO2 sum of array and divide by number of piles the machine can reach


        //add a button for marking pile as completed, then on appear objects show only completed, on progress change color,
        //or completed show as green



        for (let index = 0; index < 150; index++) {
            const allRows = document.createElement('tr');
            allRows.style.borderBottom = '2px solid #dddddd'
            allRows.style.padding = '5px 5px'
            allRows.style.textAlign = 'center'
            table.appendChild(allRows)
            const pileName = document.createElement('th');
            pileName.innerText = 'D1180-' + (index + 1);
            // th.id = [index]
            allRows.appendChild(pileName)
            const topLevel = document.createElement('td');
            topLevel.innerText = '+2.0';
            const Depth = document.createElement('td');
            Depth.innerText = '16m';
            const Dmm = document.createElement('td');
            Dmm.innerText = '118';
            const execStatus = document.createElement('td');
            
            function execStarted() { //to return yes or no for execution started
                if (WorkingTime[index] === 0) {
                    return 'not started'
                }
                else { return 'in execution' }
            }
            execStatus.innerText = execStarted()

            const execTime = document.createElement('td');
            execTime.innerText = `${(WorkingTime[index]).toFixed(2)}`  //make it so that if this is bigger than a value color in red
            if (WorkingTime[index] == 0) {
                execTime.innerText = '-'
            } else if (WorkingTime[index] > TimePerPilethreshold) {
                execTime.style.color = 'red'
            }

            const embCO2 = document.createElement('td');
            embCO2.innerText = 'TBD'
            const machCO2 = document.createElement('td');
            machCO2.innerText = `${(filteredCO2Emissions[index]).toFixed(2)}`
           
            const ButtonFinishedPile = document.createElement('button')
            ButtonFinishedPile.textContent = 'Mark as Finished'
            ButtonFinishedPile.style.borderRadius = '4px'
            ButtonFinishedPile.style.cursor = 'pointer'
            ButtonFinishedPile.style.maxWidth = '60px'
            ButtonFinishedPile.id = 'buttonFinished'

            if (CO2Emissions[index] > CO2perPilethreshold) {  //make it so that if this is bigger than a value color in red
                machCO2.style.color = 'red'
            }
            allRows.appendChild(topLevel)
            allRows.appendChild(Depth)
            allRows.appendChild(Dmm)
            allRows.appendChild(execStatus)
            allRows.appendChild(execTime)
            allRows.appendChild(embCO2)
            allRows.appendChild(machCO2)
            allRows.appendChild(ButtonFinishedPile)

            allRows.style.textAlign = 'center'

            pileName.addEventListener('click', () => {
                this.viewer.select(ListPilesDbIds[index], Autodesk.Viewing.SelectionMode.REGULAR)

            })
            
            ButtonFinishedPile.addEventListener('click', () => {
                execStatus.innerText = 'Finished'
                ButtonFinishedPile.textContent = '-' //can change later to change text content to mark as unfinished
                ButtonFinishedPile.disabled = 'true'
                countPilesfinished = countPilesfinished + 1
                countPilesInExec = countPilesInExec -1
                document.querySelector('#secondData3').innerText = `${countPilesfinished}`
                document.querySelector('#secondData4').innerText = `${countPilesInExec}`
                document.querySelector('#secondData5').innerText = `${(TotalNoPiles-countPilesfinished-countPilesInExec)}`
                //needs to make this panel interact with other panel by putting other panel in the extension properties
            })

            // th.style.pointerEvents = 'fill'
        }

        this.content.appendChild(table)

        this.scrollContainer.appendChild(this.content); //content needs to go inside scroll container

    }
}

class PilesSimulationPanel extends Autodesk.Viewing.UI.PropertyPanel {
    constructor(viewer, container, id, title, options) {
        super(container, id, title, options);
        this.viewer = viewer;
        this.container.style.height = "500px";
        this.container.style.width = "300px";
        //  this.scrollContainer.style.width = "auto";
        // this.scrollContainer.style.height = "auto";
        // this.scrollContainer.style.resize = "auto";



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

        const formspace = document.createElement('div')

        formspace.innerHTML = `
<FORM>
<label for="machineID">Machine ID:</label>
<input type="text" id="machineID" name="machineID"><br><br>
<label for="NoPiles">No. Piles to drill:</label>
<input type="text" id="NoPiles" name="NoPiles"><br><br>
<label for="DiamPiles">Diameter of piles:</label>
<input type="text" id="DiamPiles" name="DiamPiles"><br><br>
<label for="LengthPiles">Length of piles:</label>
<input type="text" id="LengthPiles" name="LengthPiles"><br><br>
</FORM>
`
        const buttonsimulate = document.createElement('button')
        buttonsimulate.innerText = 'Forecast'
        formspace.appendChild(buttonsimulate)
        buttonsimulate.addEventListener('click', () => {

            var FieldValue = document.getElementById("NoPiles").value;

            if (isNaN(FieldValue) | FieldValue == "") {
                var OutputValue = document.getElementById("OutputValue");
                while (OutputValue.firstChild) OutputValue.removeChild(OutputValue.firstChild)
                var ErrorMessage = document.createTextNode("Incorrect or no content in the input field. Note: The system uses . (dot) as decimal separator!");
                OutputValue.appendChild(ErrorMessage);
            }

            else { //WRITES another IF condition here depending on type of machine
                var OutputValue = document.getElementById("OutputValue");
                while (OutputValue.firstChild) OutputValue.removeChild(OutputValue.firstChild)
                // var Result = document.createTextNode(FieldValue*3);

                const avgTimeperPile = (((WorkingTime.reduce((a, b) => a + b, 0))) / countPilesInExec).toFixed(4)
                const CO2rate = (filteredCO2Emissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2)
                const PMrate = (filteredPMEmissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2)
                const NOxRate = (filteredNOxEmissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2)
                var resultCO2 = (FieldValue * CO2rate).toFixed(2)
                var resultPM = (FieldValue * PMrate).toFixed(2)
                var resultNOx = (FieldValue * NOxRate).toFixed(2)
                var resultTime = (FieldValue * avgTimeperPile).toFixed(4)
                var TextResult = `Expected Emissions for the execution of ${FieldValue} piles based on current data is: ${resultCO2} kilograms of CO2; ${resultPM} grams of PM; ${resultNOx} grams of NOx; The average drilling time for ${FieldValue} piles is ${resultTime} hours.`


                var text = document.createTextNode(TextResult);
                // var Result = document.createTextNode(Math.pow(FieldValue,2));
                OutputValue.appendChild(text);
            }

        })

        const formspace2 = document.createElement('div')
        formspace2.innerHTML = `
        <FORM>
        <label for="machineID2">Machine ID:</label>
        <input type="text" id="machineID2" name="machineID2"><br><br>
        <label for="NoPiles2">No. Piles to drill:</label>
        <input type="text" id="NoPiles2" name="NoPiles2"><br><br>
        <label for="DiamPiles2">Diameter of piles:</label>
        <input type="text" id="DiamPiles2" name="DiamPiles2"><br><br>
        <label for="LengthPiles2">Length of piles:</label>
        <input type="text" id="LengthPiles2" name="LengthPiles2"><br><br>
        </FORM>
        `
        const buttonsimulate2 = document.createElement('button')
        buttonsimulate2.innerText = 'Forecast'
        formspace2.appendChild(buttonsimulate2)
        buttonsimulate2.addEventListener('click', () => {

            var FieldValue2 = document.getElementById("NoPiles2").value;

            if (isNaN(FieldValue2) | FieldValue2 == "") {
                var OutputValue2 = document.getElementById("OutputValue2");
                while (OutputValue2.firstChild) OutputValue2.removeChild(OutputValue2.firstChild)
                var ErrorMessage2 = document.createTextNode("Incorrect or no content in the input field. Note: The system uses . (dot) as decimal separator!");
                OutputValue2.appendChild(ErrorMessage2);
            }

            else { //WRITES another IF condition here depending on type of machine
                var OutputValue2 = document.getElementById("OutputValue2");
                while (OutputValue2.firstChild) OutputValue2.removeChild(OutputValue2.firstChild)
                const avgTimeperPile2 = (((WorkingTime.reduce((a, b) => a + b, 0))) / countPilesInExec).toFixed(4)
                const CO2rate2 = (filteredCO2Emissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2)
                const PMrate2 = (filteredPMEmissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2)
                const NOxRate2 = (filteredNOxEmissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2)
                var resultCO22 = (FieldValue2 * CO2rate2).toFixed(2)
                var resultPM2 = (FieldValue2 * PMrate2).toFixed(2)
                var resultNOx2 = (FieldValue2 * NOxRate2).toFixed(2)
                var resultTime2 = (FieldValue2 * avgTimeperPile2).toFixed(4)
                var TextResult2 = `Expected Emissions for the execution of ${FieldValue2} piles based on current data is: ${resultCO22} kilograms of CO2; ${resultPM2} grams of PM; ${resultNOx2} grams of NOx; The average drilling time for ${FieldValue2} piles is ${resultTime2} hours.`


                var text2 = document.createTextNode(TextResult2);
                // var Result = document.createTextNode(Math.pow(FieldValue,2));
                OutputValue2.appendChild(text2);
            }

        })


        const rowTableForecastingOutputs = document.createElement('tr')
        tableForecasting.appendChild(rowTableForecastingOutputs)
        const cell3TableForecasting = document.createElement('td')
        rowTableForecastingOutputs.appendChild(cell3TableForecasting)
        const cell4TableForecasting = document.createElement('td')
        cell4TableForecasting.style.paddingLeft = '1.5em'
        rowTableForecastingOutputs.appendChild(cell4TableForecasting)
        const output = document.createElement('div')
        output.id = 'OutputValue'
        const output2 = document.createElement('div')
        output2.id = 'OutputValue2'
        cell3TableForecasting.appendChild(output)
        cell4TableForecasting.appendChild(output2)

        cell1TableForecasting.appendChild(formspace)
        cell2TableForecasting.appendChild(formspace2)


        this.scrollContainer.appendChild(this.content); //content needs to go inside scroll container

    }
}


class HeatmapSwitchPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 350) + 'px';
        this.container.style.height = (options.height || 320) + 'px';
        this.container.style.resize = 'none';
        // this.chartType = options.chartType || 'bar'; // See https://www.chartjs.org/docs/latest for all the supported types of charts
        // this.chart = this.createChart();
        // this.newchart = this.updateChart();
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.closer = this.createCloseButton();
        this.footer = this.createFooter(); //to resize container
        // this.footer = this.createFooter(); //to resize container
        this.initializeMoveHandlers(this.title);
        this.initializeCloseHandler(this.closer);
        this.container.appendChild(this.title);
        this.container.appendChild(this.closer);
        this.container.appendChild(this.footer);
        this.content = document.createElement('div');
        // this.content.style.height = '50px';
        this.content.style.backgroundColor = 'white';
        //delete the select props for this one 

        this.content.innerHTML = `
        <div style="position: relative; height: 15px; padding: 0.1em;">
        <h3 style="color:black;font-size:15px"> Choose the type of heatmap on the menu </h3>
        </div>
            <div class="props-container" style="position: relative; height: 5px; padding: 2.0em 0.5em;">
            <select class="props">
                <option value="CO2">CO2</option>
                <option value="NOx">NOx</option>
                <option value="PM">PM</option>
            </select>
            </div>
            <div style="position: relative; height: 150px; padding: 0.5em;">
            <img src="/extensions/colorscale.png" style="width:300px;height:150px;">
            </div>
            `;

        const selectElement = this.content.querySelector('select.props');
        selectElement.onchange = this.updateChart;


        this.select = selectElement;
        this.canvas = this.content.querySelector('canvas.chart');
        this.container.appendChild(this.content);
    }

    //     updateHeatmap(event) {
    //         // const value = event.target.value;

    //         // switch (value) {
    //         //     case 'CO2':
    //         //         console.log('co2 maaand');
    //         //         break;
    //         //     case 'NOx':
    //         //         console.log('NOx maaand');
    //         //         break;
    //         //     case 'PM':
    //         //         console.log('PM maaand');
    //         //         break;
    //         //     default:
    //         //         break;
    //         // }
    //     }

    //     createHeatmap() {

    // }
}
//Activity overview panel 
class ActivitiesOverviewPanel extends Autodesk.Viewing.UI.PropertyPanel {
    constructor(viewer, container, id, title, options) {
        super(container, id, title, options);
        this.viewer = viewer;
        this.container.style.height = "400px";
        this.container.style.width = "700px";
        // this.container.style.position = 'absolute'
        // this.container.style.left = '20px';
        // this.container.style.top = '20px';
        //  this.scrollContainer.style.width = "auto";
        // this.scrollContainer.style.height = "auto";
        // this.scrollContainer.style.resize = "auto";


        this.content = document.createElement('div');

        const h1 = document.createElement('h1');
        h1.innerText = 'Pile drilling Overview'
        h1.style.fontSize = '20px'
        h1.style.padding = '5px 5px'
        this.content.appendChild(h1)

        // const h2 = document.createElement('h2');
        // h2.innerText = 'Description of activity, no. of piles etc'
        // h2.style.fontSize = '10px'
        // this.content.appendChild(h2)

        //table 1 pile drilling
        const table1Drill = document.createElement('table');
        // table1Drill.style.border = '2px solid black'
        table1Drill.style.fontSize = '0.9em'
        table1Drill.style.borderCollapse = 'collapse'
        // table1Drill.style.maxWidth = '60%'
        table1Drill.style.minWidth = '400px'
        table1Drill.style.margin = '15px 5px'
        table1Drill.style.fontFamily = 'sans-serif'
        table1Drill.style.boxShadow = '2px 2px 20px #888888'

        const firstRow = document.createElement('tr');
        // firstRow.style.backgroundColor = 'gainsboro'
        // firstRow.style.backgroundColor = 'LightGrey'
        firstRow.style.backgroundColor = '#ffc20a' //	
        firstRow.style.color = '#000000' //	
        firstRow.style.textAlign = 'center' //	
        table1Drill.appendChild(firstRow)

        for (let index = 1; index < 15; index++) {
            const RowTitles = document.createElement('td');
            firstRow.appendChild(RowTitles)
            // RowTitles.style.minWidth = '20px'
            RowTitles.style.padding = '0px 5px'
            RowTitles.id = 'Title' + [index]
            // RowTitles.style.border = '2px solid black'
            RowTitles.style.fontWeight = 'bold'
            RowTitles.style.textAlign = 'center'
        }


        firstRow.querySelector('#Title1').innerText = 'Start date'
        firstRow.querySelector('#Title2').innerText = 'Expected duration (days)'
        firstRow.querySelector('#Title3').innerText = 'No. piles executed' //based on marking piles as finished
        firstRow.querySelector('#Title4').innerText = 'No. piles in exec.' //based on marking piles as finished
        firstRow.querySelector('#Title5').innerText = 'No. piles to be exec.'
        firstRow.querySelector('#Title6').innerText = 'Total drilling time (h)'
        firstRow.querySelector('#Title7').innerText = 'Avg. time per pile (h)'
        firstRow.querySelector('#Title8').innerText = 'Avg. CO2 per pile (kg)'
        firstRow.querySelector('#Title9').innerText = 'Total CO2  drilling (kg)'
        firstRow.querySelector('#Title10').innerText = 'Avg. NOx per pile (g)'
        firstRow.querySelector('#Title11').innerText = 'Total NOx drilling (g)'
        firstRow.querySelector('#Title12').innerText = 'Avg. PM per pile (g)'
        firstRow.querySelector('#Title13').innerText = 'Total PM drilling (g)'
        firstRow.querySelector('#Title14').innerText = 'Status' //(ok/delayed/high emissions) //can it send automatic alert


        const SecondRow = document.createElement('tr');
        table1Drill.appendChild(SecondRow)

        for (let index = 1; index < 15; index++) {
            const secondrowtitles = document.createElement('td');
            SecondRow.appendChild(secondrowtitles)
            // secondrowtitles.style.width = '10%'
            SecondRow.style.backgroundColor = '#f3f3f3'
            secondrowtitles.style.minWidth = '20px'
            secondrowtitles.style.borderBottom = '2px solid #ffc20a'
            secondrowtitles.style.padding = '5px 5px'
            secondrowtitles.id = 'secondData' + [index]
            secondrowtitles.style.textAlign = 'center'
        }


        SecondRow.querySelector('#secondData1').innerText = '01-09-22'
        SecondRow.querySelector('#secondData2').innerText = '30'
        SecondRow.querySelector('#secondData3').innerText = `${countPilesfinished}` //bring it from marks as executed
        SecondRow.querySelector('#secondData4').innerText = `${countPilesInExec}` 
        SecondRow.querySelector('#secondData5').innerText = `${TotalNoPiles-countPilesInExec}`
        SecondRow.querySelector('#secondData6').innerText = `${((WorkingTime.reduce((a, b) => a + b, 0))).toFixed(2)}`
        SecondRow.querySelector('#secondData7').innerText = `${(((WorkingTime.reduce((a, b) => a + b, 0))) / countPilesInExec).toFixed(4)}`
        SecondRow.querySelector('#secondData8').innerText = `${(filteredCO2Emissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2)}` //maybe needs to come from the machine data as drilling
        SecondRow.querySelector('#secondData9').innerText = `${(filteredCO2Emissions.reduce((a, b) => a + b, 0)).toFixed(2)}`
        SecondRow.querySelector('#secondData10').innerText = `${(filteredNOxEmissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2)}` //maybe needs to come from the machine data as drilling
        SecondRow.querySelector('#secondData11').innerText = `${(filteredNOxEmissions.reduce((a, b) => a + b, 0)).toFixed(2)}`
        SecondRow.querySelector('#secondData12').innerText = `${(filteredPMEmissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2)}` //maybe needs to come from the machine data as drilling
        SecondRow.querySelector('#secondData13').innerText = `${(filteredPMEmissions.reduce((a, b) => a + b, 0)).toFixed(2)}`

        function ExceedThresholds() { //to return yes or no for execution started
            const avgCO2perPile = (filteredCO2Emissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2)
            const avgTimePerPile = (((WorkingTime.reduce((a, b) => a + b, 0))) / countPilesInExec).toFixed(4)
            if (avgCO2perPile > CO2perPilethreshold) {
                return 'Excessive CO2 emission / pile'
            }
            else if (avgTimePerPile > TimePerPilethreshold) {
                return 'Slow drilling'
            }
            else {
                return 'OK'
            }
        }

        SecondRow.querySelector('#secondData14').innerText = ExceedThresholds() //function that if avg hours/CO2 per hour/fuel exceeds desired amount it says high hours/CO2 emissions/high fuel consumption

        if (SecondRow.querySelector('#secondData14').innerText === 'Excessive CO2 emission / pile') { SecondRow.querySelector('#secondData14').style.color = 'red' }
        else if (SecondRow.querySelector('#secondData14').innerText === 'Slow drilling') {
            SecondRow.querySelector('#secondData14').style.color = 'red'
        } else { SecondRow.querySelector('#secondData14').style.color = 'green' }

        // SecondRow.querySelector('#secondData14').innerText = 'Excessive CO2' //(ok/delayed/high emissions) //can it send automatic alert
        // SecondRow.querySelector('#secondData14').style.color = 'red' //(ok/delayed/high emissions) //can it send automatic alert


        const tablebuttons = document.createElement('table');
        tablebuttons.style.marginTop = '10px'
        const buttonRows = document.createElement('tr');
        tablebuttons.appendChild(buttonRows)
        const cell1 = document.createElement('td')
        const cell2 = document.createElement('td')
        const cell3 = document.createElement('td')
        const cell4 = document.createElement('td')
        buttonRows.appendChild(cell2)
        buttonRows.appendChild(cell3)
        buttonRows.appendChild(cell1)
        buttonRows.appendChild(cell4)
        const button3 = document.createElement('button')
        const button2 = document.createElement('button')
        const button1 = document.createElement('button')
        const button4 = document.createElement('button')
        cell2.appendChild(button2)
        cell3.appendChild(button3)
        cell1.appendChild(button1)
        cell4.appendChild(button4)

        //data for the report
        const DrillingTime = ((WorkingTime.reduce((a, b) => a + b, 0))).toFixed(2)
        const DrillingTimePerPile = (((WorkingTime.reduce((a, b) => a + b, 0))) / countPilesInExec).toFixed(4)
        const CO2TotalPerPile = (filteredCO2Emissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2) //maybe needs to come from the machine data as drilling
        const CO2Total = (filteredCO2Emissions.reduce((a, b) => a + b, 0)).toFixed(2)
        const NOxTotalPerPile = (filteredNOxEmissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2) //maybe needs to come from the machine data as drilling
        const NOxTotal = (filteredNOxEmissions.reduce((a, b) => a + b, 0)).toFixed(2)
        const PMTotalPerPile = (filteredPMEmissions.reduce((a, b) => a + b, 0) / countPilesInExec).toFixed(2) //maybe needs to come from the machine data as drilling
        const PMTotal = (filteredPMEmissions.reduce((a, b) => a + b, 0)).toFixed(2)


        button1.innerHTML = `<a href="mailto:destinatary@mail.com?subject=Report of drilling activities on site Project XXX - Date ${new Date().toDateString()} &body=Current execution status is ${countPilesfinished} piles executed, ${countPilesInExec} in execution and ${TotalNoPiles-countPilesInExec} to be executed. %0D%0ATotal drilling time so far is ${DrillingTime} hours, with an average drilling time of ${DrillingTimePerPile} hours per pile. %0D%0ATotal emissions produced in drilling activities are ${CO2Total} kilograms of CO2, ${NOxTotal} grams of NOx and ${PMTotal} grams of PM. %0D%0AAverage Emission rates are ${CO2TotalPerPile} kgs of CO2 per pile; ${PMTotalPerPile} grams of PM per pile; and ${NOxTotalPerPile} grams of NOx per pile" style="text-decoration:none; color:black">Send report</a>`

        button1.style.borderRadius = '4px'
        button1.style.cursor = 'pointer'
        // button1.onclick()

        button2.textContent = 'Forecast activity'
        button2.id = 'SimulatePiles'
        button2.style.borderRadius = '4px'
        button2.style.cursor = 'pointer'
        button2.style.backgroundColor = 'pointer'
        button3.textContent = "Piles details"
        button3.style.borderRadius = '4px'
        button3.style.cursor = 'pointer'
        button3.id = 'PilesDetailsButton'
        button4.textContent = "Piles Heatmap"
        button4.style.borderRadius = '4px'
        button4.style.cursor = 'pointer'
        button4.id = 'PilesHeatmapButton'


        this.content.appendChild(table1Drill)
        this.content.appendChild(tablebuttons)


        //Excavation overview header
        const h3 = document.createElement('h1');
        h3.innerText = 'Excavation Overview'
        h3.style.fontSize = '20px'
        h3.style.marginTop = '20px'
        this.content.appendChild(h3)

        //excavation table
        const table1Exc = document.createElement('table');
        table1Exc.style.fontSize = '0.9em'
        table1Exc.style.borderCollapse = 'collapse'
        table1Exc.style.minWidth = '400px'
        table1Exc.style.margin = '15px 5px'
        table1Exc.style.fontFamily = 'sans-serif'
        table1Exc.style.boxShadow = '2px 2px 20px #888888'

        const firstRowExc = document.createElement('tr');
        firstRowExc.style.backgroundColor = '#ffc20a' //	
        firstRowExc.style.color = '#000000' //	
        firstRowExc.style.textAlign = 'center' //	
        table1Exc.appendChild(firstRowExc)

        for (let index = 1; index < 15; index++) {
            const RowTitles = document.createElement('td');
            firstRowExc.appendChild(RowTitles)
            RowTitles.style.padding = '0px 5px'
            RowTitles.id = 'Title' + [index]
            RowTitles.style.fontWeight = 'bold'
            RowTitles.style.textAlign = 'center'

        }

        firstRowExc.querySelector('#Title1').innerText = 'Start date'
        firstRowExc.querySelector('#Title2').innerText = 'Expected duration (days)'
        firstRowExc.querySelector('#Title3').innerText = 'Total excavation volume (m3) ' //based on marking piles as finished
        firstRowExc.querySelector('#Title4').innerText = 'Excavated (m3)' //based on marking piles as finished
        firstRowExc.querySelector('#Title5').innerText = 'To be excavated (m3)'
        firstRowExc.querySelector('#Title6').innerText = 'Total excavation time (h)'
        firstRowExc.querySelector('#Title7').innerText = 'Avg. time per m3 (min/m3)'
        firstRowExc.querySelector('#Title8').innerText = 'Avg. CO2 per volume (kg/m3)'
        firstRowExc.querySelector('#Title9').innerText = 'Total CO2 excavating (kg)'
        firstRowExc.querySelector('#Title10').innerText = 'Avg. NOx per volume (g/m3)'
        firstRowExc.querySelector('#Title11').innerText = 'Total NOx excavating (g)'
        firstRowExc.querySelector('#Title12').innerText = 'Avg. PM per volume (g/m3)'
        firstRowExc.querySelector('#Title13').innerText = 'Total PM excavating (g)'
        firstRowExc.querySelector('#Title14').innerText = 'Status' //(ok/delayed/high emissions) //can it send automatic alert

        firstRowExc.querySelector('#Title1').innerText = 'Start date'
        firstRowExc.querySelector('#Title2').innerText = 'Expected end date'
        firstRowExc.querySelector('#Title3').innerText = 'Expected duration'
        firstRowExc.querySelector('#Title4').innerText = 'Current duration'
        firstRowExc.querySelector('#Title5').innerText = 'Expected cost'
        firstRowExc.querySelector('#Title6').innerText = 'Current cost' //Sums fixed + machine cost by time working on piles
        firstRowExc.querySelector('#Title7').innerText = 'M3 excavated' //maybe can split if I add drilling depth into the game
        firstRowExc.querySelector('#Title8').innerText = 'M3 to be excavated'


        const SecondRowExc = document.createElement('tr');
        table1Exc.appendChild(SecondRowExc)

        for (let index = 1; index < 15; index++) {
            const secondrowtitles = document.createElement('td');
            SecondRowExc.appendChild(secondrowtitles)
            SecondRowExc.style.backgroundColor = '#f3f3f3'
            secondrowtitles.style.minWidth = '20px'
            secondrowtitles.style.borderBottom = '2px solid #ffc20a'
            secondrowtitles.style.padding = '5px 5px'
            secondrowtitles.id = 'secondData' + [index]
            secondrowtitles.style.textAlign = 'center'
        }


        SecondRowExc.querySelector('#secondData1').innerText = '-'
        SecondRowExc.querySelector('#secondData2').innerText = '-'
        SecondRowExc.querySelector('#secondData3').innerText = '-'
        SecondRowExc.querySelector('#secondData4').innerText = '-'
        SecondRowExc.querySelector('#secondData5').innerText = '-'
        SecondRowExc.querySelector('#secondData6').innerText = '-'
        SecondRowExc.querySelector('#secondData7').innerText = '-'
        SecondRowExc.querySelector('#secondData8').innerText = '-'
        SecondRowExc.querySelector('#secondData9').innerText = '-'
        SecondRowExc.querySelector('#secondData10').innerText = '-'
        SecondRowExc.querySelector('#secondData11').innerText = '-'
        SecondRowExc.querySelector('#secondData12').innerText = '-'
        SecondRowExc.querySelector('#secondData13').innerText = '-'
        SecondRowExc.querySelector('#secondData14').innerText = '-'


        // const table2Exc = document.createElement('table');
        // table2Exc.style.border = '2px solid black'
        // table2Exc.style.borderCollapse = 'collapse'
        // table2Exc.style.width = '60%'
        // table2Exc.style.marginTop = '5px'


        const tablebuttonsExc = document.createElement('table');
        tablebuttonsExc.style.marginTop = '10px'
        const buttonRowsExc = document.createElement('tr');
        tablebuttonsExc.appendChild(buttonRowsExc)
        const cell1Exc = document.createElement('td')
        const cell2Exc = document.createElement('td')
        const cell3Exc = document.createElement('td')
        const cell4Exc = document.createElement('td')
        buttonRowsExc.appendChild(cell1Exc)
        buttonRowsExc.appendChild(cell2Exc)
        buttonRowsExc.appendChild(cell3Exc)
        buttonRowsExc.appendChild(cell4Exc)
        const button1Exc = document.createElement('button')
        const button2Exc = document.createElement('button')
        const button3Exc = document.createElement('button')
        const button4Exc = document.createElement('button')
        cell1Exc.appendChild(button1Exc)
        cell2Exc.appendChild(button2Exc)
        cell3Exc.appendChild(button3Exc)
        cell4Exc.appendChild(button4Exc)

        button3Exc.innerHTML = `<a href="mailto:destinatary@mail.com?subject=Report of excavation activities on site Project XXX - Date ${new Date().toDateString()} &body=Current execution status is..." style="text-decoration:none; color:black">Send report</a>`
        button3Exc.style.borderRadius = '4px'
        button3Exc.style.cursor = 'pointer'

        button1Exc.textContent = 'Forecast activity'
        button1Exc.id = 'ForecastExc'
        button1Exc.style.borderRadius = '4px'
        button1Exc.style.cursor = 'pointer'
        button1Exc.style.backgroundColor = 'pointer'
        button2Exc.textContent = "Excavation details"
        button2Exc.style.borderRadius = '4px'
        button2Exc.style.cursor = 'pointer'
        button2Exc.id = 'ExcDetailsButton'
        button4Exc.textContent = "Excavation Heatmap"
        button4Exc.style.borderRadius = '4px'
        button4Exc.style.cursor = 'pointer'
        button4Exc.id = 'ExcHeatmapButton'

        this.content.appendChild(table1Exc)
        this.content.appendChild(tablebuttonsExc)


        this.scrollContainer.appendChild(this.content); //content needs to go inside scroll container

    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('ActivitiesOverview', ActivitiesOverview);

