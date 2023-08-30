

class TestHeatmapForEarthwork extends Autodesk.Viewing.Extension {
    
    constructor(viewer, options) {
        super(viewer, options);
        this._extension = null;
        this._group = null;
        this._button = null;
        this._isHeatmapShowing = false;
    }

    load() {
        // console.log('HeatmapForEarthwork has been loaded');

        //doesnt need a button necesasry could just load but you could also set up something here as below
        //this.viewer.addEventListener(could put here something that happens when you select something in the viewer)//
        return true;
    }

    unload() {
        // Clean our UI elements if we added any
        if (this._group) {
            this._group.removeControl(this._button);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
        }
        console.log('HeatmapForEarthwork has been unloaded');
        return true;
    }

    
        async loadHeatmap() {
            this._extension = await this.viewer.loadExtension("Autodesk.DataVisualization");
    
            const {
                SurfaceShadingData,
                SurfaceShadingPoint,
                SurfaceShadingNode,
            } = Autodesk.DataVisualization.Core;
            
            const shadingNode1 = new SurfaceShadingNode("Earthcubes1", [4485]);
            const shadingNode2 = new SurfaceShadingNode("Earthcubes2", [10787]); //new SurfaceShadingNode(id, dbIds, shadingPoints(optional), name(optional)) 
            const shadingNode3 = new SurfaceShadingNode("Earthcubes3", [10788]);
            const shadingNode4 = new SurfaceShadingNode("Earthcubes4", [10789]);
            const shadingNode5 = new SurfaceShadingNode("Earthcubes5", [10790]);
            const shadingNode6 = new SurfaceShadingNode("Earthcubes6", [10791]);
            const shadingNode7 = new SurfaceShadingNode("Earthcubes7", [10792]);
            const shadingNode8 = new SurfaceShadingNode("Earthcubes8", [10793]);
            const shadingNode9 = new SurfaceShadingNode("Earthcubes9", [10794]);
            const shadingNode10 = new SurfaceShadingNode("Earthcubes10", [10795]);
            const shadingNode11 = new SurfaceShadingNode("Earthcubes11", [10796]);
            const shadingNode12 = new SurfaceShadingNode("Earthcubes12", [10817]);
            const shadingNode13 = new SurfaceShadingNode("Earthcubes13", [10797]);
            const shadingNode14 = new SurfaceShadingNode("Earthcubes14", [10798]);
            const shadingNode15 = new SurfaceShadingNode("Earthcubes15", [10802]);
            const shadingNode16 = new SurfaceShadingNode("Earthcubes16", [10877]);
            const shadingNode17 = new SurfaceShadingNode("Earthcubes17", [10829]);
            const shadingNode18 = new SurfaceShadingNode("Earthcubes18", [10809]);
            //can use array of dbIds on surface sahding node, read more https://forge.autodesk.com/en/docs/dataviz/v1/reference/Core/SurfaceShadingNode/
            const shadingPoint1 = new SurfaceShadingPoint("Earth-sensor-1", undefined, ["NOx", "CO2"]); //new SurfaceShadingPoint(id, position, types, name, contextData)
            const shadingPoint2 = new SurfaceShadingPoint("Earth-sensor-2", undefined, ["NOx", "CO2"]);
            const shadingPoint3 = new SurfaceShadingPoint("Earth-sensor-3", undefined, ["NOx", "CO2"]);
            const shadingPoint4 = new SurfaceShadingPoint("Earth-sensor-4", undefined, ["NOx", "CO2"]);
            const shadingPoint5 = new SurfaceShadingPoint("Earth-sensor-5", undefined, ["NOx", "CO2"]);
            const shadingPoint6 = new SurfaceShadingPoint("Earth-sensor-6", undefined, ["NOx", "CO2"]);
            const shadingPoint7 = new SurfaceShadingPoint("Earth-sensor-7", undefined, ["NOx", "CO2"]);
            const shadingPoint8 = new SurfaceShadingPoint("Earth-sensor-8", undefined, ["NOx", "CO2"]);
            const shadingPoint9 = new SurfaceShadingPoint("Earth-sensor-9", undefined, ["NOx", "CO2"]);
            const shadingPoint10 = new SurfaceShadingPoint("Earth-sensor-10", undefined, ["NOx", "CO2"]);
            const shadingPoint11 = new SurfaceShadingPoint("Earth-sensor-11", undefined, ["NOx", "CO2"]);
            const shadingPoint12 = new SurfaceShadingPoint("Earth-sensor-12", undefined, ["NOx", "CO2"]);
            const shadingPoint13 = new SurfaceShadingPoint("Earth-sensor-13", undefined, ["NOx", "CO2"]);
            const shadingPoint14 = new SurfaceShadingPoint("Earth-sensor-14", undefined, ["NOx", "CO2"]);
            const shadingPoint15 = new SurfaceShadingPoint("Earth-sensor-15", undefined, ["NOx", "CO2"]);
            const shadingPoint16 = new SurfaceShadingPoint("Earth-sensor-16", undefined, ["NOx", "CO2"]);
            const shadingPoint17 = new SurfaceShadingPoint("Earth-sensor-17", undefined, ["NOx", "CO2"]);
            const shadingPoint18 = new SurfaceShadingPoint("Earth-sensor-18", undefined, ["NOx", "CO2"]);
            // Note that the surface shading point was created without an initial
            // position, but the position can be set to the center point of the
            // bounding box of a given DBid with the function call below.
            shadingPoint1.positionFromDBId(this.viewer.model, 4485); //this.viewer.model is the  (model) in the API description
            shadingNode1.addPoint(shadingPoint1);
            shadingPoint2.positionFromDBId(this.viewer.model, 10787); //this.viewer.model is the  (model) in the API description
            shadingNode2.addPoint(shadingPoint2);
            shadingPoint3.positionFromDBId(this.viewer.model, 10788); //this.viewer.model is the  (model) in the API description
            shadingNode3.addPoint(shadingPoint3);
            shadingPoint4.positionFromDBId(this.viewer.model, 10789); //this.viewer.model is the  (model) in the API description
            shadingNode4.addPoint(shadingPoint4);
            shadingPoint5.positionFromDBId(this.viewer.model, 10790); //this.viewer.model is the  (model) in the API description
            shadingNode5.addPoint(shadingPoint5);
            shadingPoint6.positionFromDBId(this.viewer.model, 10791); //this.viewer.model is the  (model) in the API description
            shadingNode6.addPoint(shadingPoint6);
            shadingPoint7.positionFromDBId(this.viewer.model, 10792); //this.viewer.model is the  (model) in the API description
            shadingNode7.addPoint(shadingPoint7);
            shadingPoint8.positionFromDBId(this.viewer.model, 10793); //this.viewer.model is the  (model) in the API description
            shadingNode8.addPoint(shadingPoint8);
            shadingPoint9.positionFromDBId(this.viewer.model, 10794); //this.viewer.model is the  (model) in the API description
            shadingNode9.addPoint(shadingPoint9);
            shadingPoint10.positionFromDBId(this.viewer.model, 10795); //this.viewer.model is the  (model) in the API description
            shadingNode10.addPoint(shadingPoint10);
            shadingPoint11.positionFromDBId(this.viewer.model, 10796); //this.viewer.model is the  (model) in the API description
            shadingNode11.addPoint(shadingPoint11);
            shadingPoint12.positionFromDBId(this.viewer.model, 10817); //this.viewer.model is the  (model) in the API description
            shadingNode12.addPoint(shadingPoint12);
            shadingPoint13.positionFromDBId(this.viewer.model, 10797); //this.viewer.model is the  (model) in the API description
            shadingNode13.addPoint(shadingPoint13);
            shadingPoint14.positionFromDBId(this.viewer.model, 10798); //this.viewer.model is the  (model) in the API description
            shadingNode14.addPoint(shadingPoint14);
            shadingPoint15.positionFromDBId(this.viewer.model, 10802); //this.viewer.model is the  (model) in the API description
            shadingNode15.addPoint(shadingPoint15);
            shadingPoint16.positionFromDBId(this.viewer.model, 10877); //this.viewer.model is the  (model) in the API description
            shadingNode16.addPoint(shadingPoint16);
            shadingPoint17.positionFromDBId(this.viewer.model, 10829); //this.viewer.model is the  (model) in the API description
            shadingNode17.addPoint(shadingPoint17);
            shadingPoint18.positionFromDBId(this.viewer.model, 10809); //this.viewer.model is the  (model) in the API description
            shadingNode18.addPoint(shadingPoint18);
            
            const heatmapData = new SurfaceShadingData();
            heatmapData.addChild(shadingNode1);
            heatmapData.addChild(shadingNode2);
            heatmapData.addChild(shadingNode3);
            heatmapData.addChild(shadingNode4);
            heatmapData.addChild(shadingNode5);
            heatmapData.addChild(shadingNode6);
            heatmapData.addChild(shadingNode7);
            heatmapData.addChild(shadingNode8);
            heatmapData.addChild(shadingNode9);
            heatmapData.addChild(shadingNode10);
            heatmapData.addChild(shadingNode11);
            heatmapData.addChild(shadingNode12);
            heatmapData.addChild(shadingNode13);
            heatmapData.addChild(shadingNode14);
            heatmapData.addChild(shadingNode15);
            heatmapData.addChild(shadingNode16);
            heatmapData.addChild(shadingNode17);
            heatmapData.addChild(shadingNode18);
            heatmapData.initialize(this.viewer.model);
    
            
            await this._extension.setupSurfaceShading(this.viewer.model, heatmapData);
    
            this._extension.registerSurfaceShadingColors("CO2", ['#00ff00', '#ffff00', '#FF0000' ]);
            this._extension.registerSurfaceShadingColors("NOx", ['#ff0090', '#8c00ff', '#00fffb' ]);
    
    
            const testValues = {
                "Earth-sensor-1": {
                    "currentIndex": 0,
                    "NOx": [
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-2": {
                    "currentIndex": 0,
                    "NOx": [
                        0.5222,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ],
                    "CO2": [
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                    ]
                },
                "Earth-sensor-3": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-3": {
                    "currentIndex": 0,
                    "NOx": [
                        0.6544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.47658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-4": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.67658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-5": {
                    "currentIndex": 0,
                    "NOx": [
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-6": {
                    "currentIndex": 0,
                    "NOx": [
                        0.8544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.47658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-7": {
                    "currentIndex": 0,
                    "NOx": [
                        0.5544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.17658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-8": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-9": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.37658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-10": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-11": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.57658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-12": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.67658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-13": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.17658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-14": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.37658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-15": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.77658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-16": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.47658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-17": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.57658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
                    ]
                },
                "Earth-sensor-18": {
                    "currentIndex": 0,
                    "NOx": [
                        0.9544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367,
                        0.87658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367
                    ],
                    "CO2": [
                        0.27658762,
                        0.9679674,
                        0.97696,
                        0.96747554,
                        0.3564367,
                        0.2544,
                        0.425,
                        0.66,
                        0.7554,
                        0.4367
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
                console.log(value);
                return value;
            }
                
    
            this._extension.renderSurfaceShading(["Earthcubes1", "Earthcubes2", "Earthcubes3", "Earthcubes4", "Earthcubes5", "Earthcubes6", "Earthcubes7", "Earthcubes8", "Earthcubes9", "Earthcubes10", "Earthcubes11", "Earthcubes12", "Earthcubes13", "Earthcubes14", "Earthcubes15", "Earthcubes16", "Earthcubes17", "Earthcubes18"], "CO2", getSensorValue); //renderSurfaceShading(nodeIds, sensorType, valueCallback, options). nodeIds = One or more identifiers of nodes to render. The callback function that will be invoked when surface shading requires the sensor value to render.
            // this._extension.renderSurfaceShading(["Piles1", "Piles2"], "CO2", getSensorValue1); //renderSurfaceShading(nodeIds, sensorType, valueCallback, options). nodeIds = One or more identifiers of nodes to render. The callback function that will be invoked when surface shading requires the sensor value to render.
    
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


    onToolbarCreated() {
        this._group = this.viewer.toolbar.getControl('dashboard-toolbar-group'); //if it exists it puts here
        if (!this._group) { // Create a new toolbar group if it doesn't exist
            this._group = new Autodesk.Viewing.UI.ControlGroup('allMyAwesomeExtensionsToolbar');
            this.viewer.toolbar.addControl(this._group);
        }

        // Add a new button to the toolbar group
        this._button = new Autodesk.Viewing.UI.Button('HeatmapForEarthwork');
        this._button.onClick = (event) => {
            if (this._isHeatmapShowing) { // Same as (this._isHeatmapShowing === true)
                // If showing disable sprites.
                this.disableHeatmap();
                this._isHeatmapShowing = false;
            } else { // Same as (else if (!this._isHeatmapShowing))
                // Else if not showing, enable sprites.
                this.loadHeatmap();
                this._isHeatmapShowing = true;
            }
            // instead of having the this._isHeatmapShowing false and true above could just have this line here
            //  this._isHeatmapShowing = !this._isHeatmapShowing; // what this does is that whenever the button is clicked it assigns the oposite value.
        }

        this._button.setToolTip('Heatmap For Earthwork Extension'); // when wehover the button 
        this._button.addClass('HeatmapForEarthwork'); //css id if we want to style
        this._group.addControl(this._button);

    }

}

Autodesk.Viewing.theExtensionManager.registerExtension('TestHeatmapForEarthwork', TestHeatmapForEarthwork);

