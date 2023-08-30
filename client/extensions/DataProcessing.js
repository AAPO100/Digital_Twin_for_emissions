
import { BaseExtension } from './BaseExtension.js';
import myJsondata from './test1-Preprocessed-Data-Minute.json' assert {type: 'json'};

// import myJsondata from './PEMS-data-Minute.json' assert {type: 'json'};





//for storing data with position converted and exporting the data through a function
const PositionData = [];

export function getLocationObjects() {
    return PositionData;
}

//for storing machineInfo in an object and exporting the machineInfo object
const DataMachineInfo = []

export function getMachineInfo () {
    // console.log('DataMachineInfo',DataMachineInfo)
    return DataMachineInfo[0]
}

//inputs for Machine Bbox based on machine position data (Lmv)
const Incx = 13.4042; //needs to be in ft to work in the viewer - 5 meters equals 16.4 meters
const Incy = 13.4042; //5 METERS IS 16,4 FEET
const Incz = Math.hypot(Incx, Incy); //this is wrong, doesn't need hypot, fix itt
//Machine Radius
const MachineSphereRadius = 16.4;

//creates array for storing Bbox of all piles
const Bboxespiles = [];

//creates empty arrays array for storing data for each Pile
const numberPiles = 150;
    // const nameofPiles = ['Pile 1', 'pile 2', 'pile3'] //for naming it if wanted.
let dataBboxespiles = new Array(numberPiles);
for (let i = 0; i < dataBboxespiles.length; i++) {
    dataBboxespiles[i] = []
    // dataBboxespiles[i].push(nameofPiles[i]) //for naming if wanted.
        }
    
const spheresPiles = []


//Array for storing arrays with Emission values
const DataBboxespilesEmissions = [];

export function getDataforPiles() {
    return DataBboxespilesEmissions
}

 class DataProcessing extends BaseExtension {
    load() {
        super.load();
        // console.log('data processing has started');
        return true;
        
    }

    unload() {
        super.unload();
        console.log('data processing extension unloaded.');
        return true;
    }

     async onModelLoaded(model) {
        super.onModelLoaded(model);

            const arr = [3646,3686,3687,3688,3689,3690,3691,3692,3693,3694,3695,3696,3697,3698,3699,3700,3701,3702,3703,3704,3705,3706,3707,3708,3709,3710,3711,3712,3713,3714,3715,3716,3717,3718,3719,3720,3721,3722,3723,3724,3725,3726,3727,3728,3729,3730,3731,3732,3733,3734,3735,3736,3737,3738,3739,3740,3741,3742,3743,3744,3745,3746,3747,3748,3749,3750,3751,3752,3753,3754,3755,3756,3757,3758,3759,3760,3761,3762,3763,3764,3765,3766,3767,3768,3769,3770,3771,3772,3773,3774,3775,3776,3777,3778,3779,3780,3781,3782,3783,3784,3785,3786,3787,3788,3789,3790,3791,3792,3793,3794,3795,3796,3797,3798,3799,3800,3801,3802,3803,3804,3805,3806,3807,3808,3809,3810,3811,3812,3813,3814,3815,3816,3817,3818,3819,3820,3821,3822,3823,3824,3825,3826,3827,3828,3829,3830,3831,3832,3833,3834]

            //creates a bounding sphere for each pile
            arr.forEach(element => {
                this.viewer.select(element, Autodesk.Viewing.SelectionMode.REGULAR) // https://aps.autodesk.com/en/docs/viewer/v2/reference/javascript/guiviewer3d/
                const box = this.viewer.utilities.getBoundingBox(false); //https://aps.autodesk.com/en/docs/viewer/v2/reference/javascript/viewingutilities/
                Bboxespiles.push(box)
                const centerbox = box.getCenter()
                const newCenterBox = new THREE.Vector3(centerbox.x, centerbox.y, centerbox.z + 22.9647)
                const SphereBox = new THREE.Sphere(newCenterBox, 1.968)
                // console.log('centerbox', centerbox)
                // console.log('newcenterbox', newCenterBox)
                spheresPiles.push(SphereBox)

            });

            this.viewer.select(3687, Autodesk.Viewing.SelectionMode.REGULAR) 
            const boxPileCorner = this.viewer.utilities.getBoundingBox(false);
            const centerbox = boxPileCorner.getCenter()
            const newCenterBoxPileCorner = new THREE.Vector3(centerbox.x, centerbox.y, centerbox.z + 22.9647)
            const SpherePileCorner = new THREE.Sphere(newCenterBoxPileCorner, 1.968)
        
        this.geoTool = await this.viewer.loadExtension('Autodesk.Geolocation');
        const data = myJsondata; //if I set Interval here to read the data every 3sec it would be like real time data?
        // console.log('JSON data', data)
        

        const MachineBboxData = []
        data.forEach(i => {
            i.vector = new THREE.Vector3(i.y, i.x, i.z)

            i.Lmv = this.geoTool.lonLatToLmv(i.vector)
            
            PositionData.push(i);
            const bbox_min = new THREE.Vector3(i.Lmv.x - Incx, i.Lmv.y - Incy, i.Lmv.z - Incz)
            const bbox_max = new THREE.Vector3(i.Lmv.x + Incx, i.Lmv.y + Incy, i.Lmv.z + Incz)
            i.bbox = new THREE.Box3 (bbox_min, bbox_max);
            i.sphere = new THREE.Sphere(i.Lmv, MachineSphereRadius)
            MachineBboxData.push(i)

        });
        // console.log('MachineBboxData', MachineBboxData)
        
        
        //for creating an object with machine information based on the entire data
        const MachineTotalCO2 = []
        const MachineTotalNOx = []
        const MachineTotalPM = []
        const MachineTotalFuel = []
        const DistanceTravelled = []
        PositionData.forEach(i => {
            MachineTotalCO2.push(i.CO2EmissionPerMin)
            MachineTotalNOx.push(i.NOxEmissionPerMin)
            MachineTotalPM.push(i.PMEmissionPerMin)
            MachineTotalFuel.push(i.FuelConsumptionPerMin)
            DistanceTravelled.push(i['Distance travelled'])
            //missing speeds here
        })

        const countIdling = PositionData.filter((obj) => obj.Status === 'Idling').length;
        const countMoving = PositionData.filter((obj) => obj.Status === 'Moving').length;
        const countDrilling = PositionData.filter((obj) => obj.Status === 'Drilling').length;

        const MachineInfo = {
            OperationTime: PositionData.length,
            IdlingTime: countIdling,
            DrillingTime: countDrilling,
            MovingTime: countMoving,
            TotalCO2: MachineTotalCO2.reduce((a,b) => a + b, 0),
            TotalPM: MachineTotalPM.reduce((a,b) => a + b, 0),
            TotalNOx: MachineTotalNOx.reduce((a,b) => a + b, 0),
            TotalFuel: MachineTotalFuel.reduce((a,b) => a + b, 0), 
            DistanceTravelled: DistanceTravelled[PositionData.length-1] //BECAUSE LENGTH is 4 but we want the last index which is 3
        };
        DataMachineInfo.push(MachineInfo)


        //segreggates data for each pile based on machine bbox
        for (let i = 0; i < Bboxespiles.length; i++) {
            // MachineBboxData.forEach(obj => { if (obj.bbox.intersectsBox(Bboxespiles[i])=== true) {
            //     dataBboxespiles[i].push(obj)
            //     }}
            //     )
                MachineBboxData.forEach(obj => { if (obj.sphere.intersectsSphere(spheresPiles[i])=== true && obj.AvgdrillRotationSpeed!== 0) { //for second experiment there is not avg drill rotatin
                    dataBboxespiles[i].push(obj)
                    }}
                    )
            };

        // add emissions data for each array of pile data
        // console.log('dataBboxespiles', dataBboxespiles)

        dataBboxespiles.forEach(i => {
            i.WorkingTime = i.length
            
            const CO2s = []
            const PMs = []
            const NOxs = []
            const AllAvgPowers = []
            const AllAvgDrillingSpeeds = []
            const AllAvgDrivingSpeeds = []
            i.forEach(obj => {
                CO2s.push(obj.CO2EmissionPerMin)
                PMs.push(obj.PMEmissionPerMin)
                NOxs.push(obj.NOxEmissionPerMin)
                AllAvgPowers.push(obj.AvgEnginePower)
                AllAvgDrillingSpeeds.push(obj.AvgdrillRotationSpeed)
                AllAvgDrivingSpeeds.push(obj.AvgDrivingSpeed)
            })
            
            i.forEach(obj => {
                if(i.length > 1 && obj.sphere.intersectsSphere(SpherePileCorner)=== true) {
                    i.WorkingTime = i.length / 15
                    i.SumCO2 = CO2s.reduce((a,b) => a + b, 0)/15 //this is total sum but we need to divide by no. of piles machine can reach
                    i.SumPM = PMs.reduce((a,b) => a + b, 0) /15 //this is total sum but we need to divide by no. of piles machine can reach
                    i.SumNOx = NOxs.reduce((a,b) => a + b, 0) /15 
                }
                else if (i.length > 1 && obj.sphere.intersectsSphere(SpherePileCorner)=== false)
                {
                    i.WorkingTime = i.length / 8
                    i.SumCO2 = CO2s.reduce((a,b) => a + b, 0)/8 //this is total sum but we need to divide by no. of piles machine can reach
                    i.SumPM = PMs.reduce((a,b) => a + b, 0) /8 //this is total sum but we need to divide by no. of piles machine can reach
                    i.SumNOx = NOxs.reduce((a,b) => a + b, 0) /8 
            }

            })
            // i.SumCO2 = CO2s.reduce((a,b) => a + b, 0)/8 //this is total sum but we need to divide by no. of piles machine can reach
            // i.SumPM = PMs.reduce((a,b) => a + b, 0) /8 //this is total sum but we need to divide by no. of piles machine can reach
            // i.SumNOx = NOxs.reduce((a,b) => a + b, 0) /8 //this is total sum but we need to divide by no. of piles machine can reach
            i.AvgPower = AllAvgPowers.reduce((a,b) => a + b, 0) / AllAvgPowers.length 
            i.AvgDrivingSpeed = AllAvgDrivingSpeeds.reduce((a,b) => a + b, 0) / AllAvgDrivingSpeeds.length 
            i.AvgDrillingSpeed = AllAvgDrillingSpeeds.reduce((a,b) => a + b, 0) / AllAvgDrillingSpeeds.length 
            DataBboxespilesEmissions.push(i)
        });
        // console.log('DataBboxespiles with Emissions', DataBboxespilesEmissions);
    }


    
}

Autodesk.Viewing.theExtensionManager.registerExtension('DataProcessing', DataProcessing);


