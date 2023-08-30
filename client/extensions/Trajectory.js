class Point2D {

  constructor(x, y) {

    this.x = x; this.y = y;

  }

}

class Polygon2D {
  constructor(x, y, ...vertices) {
    this.position = new Point2D(x, y);
    this.vertices = [];
    this.weight = 0;
    this.score=0;
    this.scoreEmissions=0;

    for (let index = vertices.length - 2; index > -1; index -= 2) {
      this.vertices[index * 0.5] = new Point2D(vertices[index], vertices[index + 1]);
    }
  }

  isInside(x, y) {
    let xMin = this.vertices[0].x;
    let xMax = this.vertices[0].x;
    let yMin = this.vertices[0].y;
    let yMax = this.vertices[0].y;

    for (let i = 1; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      if (vertex.x < xMin) xMin = vertex.x;
      if (vertex.x > xMax) xMax = vertex.x;
      if (vertex.y < yMin) yMin = vertex.y;
      if (vertex.y > yMax) yMax = vertex.y;
    }

    return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
  }
}

class HistoricData {
  constructor() {
    this.historicData = [];
    this.realData = [];
    this.emissions = [];
    this.dataLoaded = false;
    this.emissionsLoaded = false;
    this.realDataLoaded = false;
    this.timestampHistory = 0;
    this.lons = 0;
    // this.realon = 0;
    this.lats = 0;
    this.NOxs = 0;
    // this.realat = 0;
    this.get_Livedata();
    this.get_emissions()
    // this.loadData();
  }

  async get_data() {
    if (this.dataLoaded === false) {// check if we already have the data
      await new Promise(r => setTimeout(r, 2000));
      this.historicData = [[1, 2, 3], [1, 2, 3], [1, 2, 3]]; //await response.json();
      const result = await fetch ('http://127.0.0.1:8001/DatafromMongo.js')
      this.historicData = await result.json()
      this.timestampHistory = this.historicData[0];
      this.lons = this.historicData[2];
      this.lats = this.historicData[1];
      
      this.dataLoaded = true;
      this.filteredTimestamps=[];
      this.filteredLats=[];
      this.filteredLons =[];
      return  true ;
    } else {
      return true;
    }
  }

  async get_emissions() {
    if (this.dataLoaded === false) {// check if we already have the data
      await new Promise(r => setTimeout(r, 2000));
      this.emissions = [[1, 2, 3], [1, 2, 3], [1, 2, 3]]; //await response.json();
      const result3 = await fetch ('http://127.0.0.1:8001/NOxEmissionsfromMongo.js')
      this.emissions = await result3.json()
      // this.timestampHistory = this.historicData[0];
      this.NOxs = this.emissions[1];
      // console.log(this.emissions)
      // console.log(this.NOxs)

      this.emissionsLoadedLoaded = true;
      this.filteredEmissions=[];
      return  true ;
    } else {
      return true;
    }
  }


  async get_Livedata() {
    if (this.realDataLoaded === false) {
      const refreshInterval = 12000;
    
      const fetchData = async () => {
        const result2 = await fetch('http://127.0.0.1:8001/DatafromMongoLive.js');
        const newData = await result2.json();
        if (newData.length > 0) {
          this.realat = newData[1];
          this.realon = newData[0];
          // console.log(this.realon)
          
          
          // console.log(this.realon, this.realat)
          // console.log(this.realat);
        }
      };
    
      const refreshData = async () => {
        await fetchData();
        setTimeout(refreshData, refreshInterval);
      };
    
      refreshData();
    
      this.realDataLoaded = true;
      return this.realat;
    } else {
      return true;
    }
  }


  async dataExists(startDate, endDate) {
    await this.get_data();
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
  
    this.filteredTimestamps = this.timestampHistory.filter(point => {
      const pointTime = new Date(point).getTime();
      return !isNaN(pointTime) && pointTime >= startTime && pointTime <= endTime;
    });
 
    this.filteredLons = this.lons.filter((lon, index) => this.filteredTimestamps.includes(this.timestampHistory[index]));
    this.filteredLats = this.lats.filter((lat, index) => this.filteredTimestamps.includes(this.timestampHistory[index]));
    this.filteredEmissions=this.NOxs.filter((NOx, index) => this.filteredTimestamps.includes(this.timestampHistory[index]));
    if (this.filteredTimestamps.length > 0) {
      // console.log(this.filteredTimestamps, this.filteredLons, this.filteredLats)
      return [this.filteredTimestamps, this.filteredLons, this.filteredLats];
      
    } else {
      return false;
    }
  }
  
}

export class Trajectory extends Autodesk.Viewing.UI.DockingPanel {
  constructor(extension, id, title, options) {
    super(extension.viewer.container, id, title, options);
    this.extension = extension;
    this.container.style.left = (options.x || 0) + 'px';
    this.container.style.top = (options.y || 0) + 'px';
    this.container.style.width = (options.width || 500) + 'px';
    this.container.style.height = (options.height || 200) + 'px';
    this.container.style.resize = 'both';
    this.linesMaterial = null;
    this.lines = null;
    this._areLinesShowing = true;
    
    this.viewer = extension.viewer;
    this.loadSprites();
    // this.his = new HistoricData();
    
    
    setTimeout(() => {
      this.HideSprites();
      // console.log("Hide sprites");
    }, "500");
    this._isSpritesShowing = false;

    
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
    this.content.style.height = '400px';
    this.content.style.backgroundColor = 'white';
    // create a button to draw / erase trajectory
    const dateTable = document.createElement('table');
    const dateRow = document.createElement('tr');
    dateTable.appendChild(dateRow);
    const startDate = document.createElement('td');
    const endDate = document.createElement('td');
    let minDate = "2023-03-20T14:00";
    let maxDate = "2023-20-03";
    let latestDate = "2023-03-20T14:45"
    // startDate.innerHTML = `<label for="startDate">Start Date</label> 
    // <input type="datetime-local" id="startDate" name="startDate" min="${minDate}" max="${maxDate}">`;
    startDate.innerHTML = `<label for="startDate">Start Date</label> 
    <input type="datetime-local" id="startDate" name="startDate" value="2023-03-20T16:00">`;
    
    //Buttons Start styling  
    startDate.style.paddingBottom ="10px"; 
    startDate.style.paddingTop ="10px";  
    startDate.style.c ="10px";     
    startDate.style.borderradius= '6px';
    startDate.style.padding = "10px" ;
    endDate.innerHTML = `<label for="endDate">End Date</label> 
    // <input type="datetime-local" id="endDate" name="endDate" value="2023-03-20T18:50">`;
    // endDate.innerHTML = `<label for="endDate">End Date</label> 
    // <input type="datetime-local" id="endDate" name="endDate" min=${minDate} max=${maxDate}>`;
    dateRow.appendChild(startDate);
    dateRow.appendChild(endDate);
    dateTable.appendChild(dateRow);
    //create new row for buttons
    const buttonRow = document.createElement('tr');
    const submit = document.createElement('button');
    submit.style.margin = "10px";
    submit.textContent = 'Draw Trajectory';
    submit.addEventListener('click', async event => {
      event.preventDefault();
      const startDate = event.currentTarget.parentElement.parentElement.querySelector('#startDate').value;
      const endDate = event.currentTarget.parentElement.parentElement.querySelector('#endDate').value;
      const dataExists = await this.his.dataExists(startDate, endDate);
      if (dataExists) {
        const dataInRange = await this.his.dataExists(startDate, endDate);
        this.drawFilteredLines();
      } else {
        console.log('Data does not exist for the given date range.'); 
      }
    });
    this._isSpritesShowing = false;
    this._isHeatmapShowing = false;
    this._isemissionsLocShowing = false;
    this.his = new HistoricData();
    const realDataxx=new HistoricData();  
    const historicData = new HistoricData();
    // historicData.loadData().then(realData => {
    //   console.log(realData); // should log the loaded realData array
    // });  
    
    const EraseButton1 = document.createElement('button');
    EraseButton1.style.margin = "10px";
    EraseButton1.textContent = 'Erase Trajectory';
    EraseButton1.addEventListener('click', () => {
          if (this._areLinesShowing) { 
              this.eraseLines();
              this._areLinesShowing = false;
          } else { 
              console.log("nothing to clear")
              this._areLinesShowing = true;
          }
      })

    const Heatmap = document.createElement('button');
    Heatmap.style.margin = "10px";
    Heatmap.textContent = 'Create Heatmap';
    Heatmap.addEventListener('click', async event => {
      event.preventDefault();
      if (this._isHeatmapShowing) {
        this.loadHeatmap();
        console.log('Heatmap hidden.');
        this._isHeatmapShowing = false;
      } else {
        this.disableHeatmap();
        console.log('Heatmap shown.');
        this._isHeatmapShowing = true;
      }
    });
    const emissionsLoc = document.createElement('button');
    emissionsLoc.style.margin = "10px";
    emissionsLoc.textContent = 'Show loc. of emissions';
    emissionsLoc.addEventListener('click', async event => {
      event.preventDefault();
      if (this._isemissionsLocShowing) {
        this.drawCrosses();
        console.log('emissionsLoc hidden.');
        this._isemissionsLocShowing = false;
      } else {
        this.disableCrosses();
        console.log('emissionsLoc shown.');
        this._isemissionsLocShowing = true;
      }
    });
      
      



    const location = document.createElement('button');
    
    location.style.margin = "10px";
    location.textContent = 'Show live location';
    this._isSpritesShowing = true
    
    
    location.addEventListener("click", () => {
      if (this._isSpritesShowing) {
        this.HideSprites();
        console.log('Sprites hidden.');
        this._isSpritesShowing = false;
      } else {
        this.ShowSprites();
        console.log('Sprites shown.');
        this._isSpritesShowing = true;
      }
    });

    buttonRow.appendChild(submit);
    buttonRow.appendChild(EraseButton1);
    buttonRow.appendChild(Heatmap)
    buttonRow.appendChild(location);
    buttonRow.appendChild(emissionsLoc);
    dateTable.appendChild(buttonRow);
    this.content.appendChild(dateTable);
    this.container.appendChild(this.content);
    
    // this._extension.showHideViewables(true, false);
  }
async loadHeatmap() {
    this._extension = await this.viewer.loadExtension("Autodesk.DataVisualization");

    const {
        SurfaceShadingData,
        SurfaceShadingPoint,
        SurfaceShadingNode,
    } = Autodesk.DataVisualization.Core;
    
    const shadingNode1 = new SurfaceShadingNode("Earthcubes1", [4479]);
    const shadingNode2 = new SurfaceShadingNode("Earthcubes2", [10757]); //new SurfaceShadingNode(id, dbIds, shadingPoints(optional), name(optional)) 
    const shadingNode3 = new SurfaceShadingNode("Earthcubes3", [10758]);
    const shadingNode4 = new SurfaceShadingNode("Earthcubes4", [10759]);
    const shadingNode5 = new SurfaceShadingNode("Earthcubes5", [10760]);
    const shadingNode6 = new SurfaceShadingNode("Earthcubes6", [10761]);
    const shadingNode7 = new SurfaceShadingNode("Earthcubes7", [10762]);
    const shadingNode8 = new SurfaceShadingNode("Earthcubes8", [10763]);
    const shadingNode9 = new SurfaceShadingNode("Earthcubes9", [10764]);
    const shadingNode10 = new SurfaceShadingNode("Earthcubes10", [10765]);
    const shadingNode11 = new SurfaceShadingNode("Earthcubes11", [10766]);
    const shadingNode12 = new SurfaceShadingNode("Earthcubes12", [10767]);
    const shadingNode13 = new SurfaceShadingNode("Earthcubes13", [10768]);
    const shadingNode14 = new SurfaceShadingNode("Earthcubes14", [10772]);
    const shadingNode15 = new SurfaceShadingNode("Earthcubes15", [10779]);
    const shadingNode16 = new SurfaceShadingNode("Earthcubes16", [10787]);
    const shadingNode17 = new SurfaceShadingNode("Earthcubes17", [10799]);
    const shadingNode18 = new SurfaceShadingNode("Earthcubes18", [10847]);
    const shadingNode19 = new SurfaceShadingNode("Earthcubes19", [4488]);
    const shadingNode20 = new SurfaceShadingNode("Earthcubes20", [4330]);
    //can use array of dbIds on surface sahding node, read more https://forge.autodesk.com/en/docs/dataviz/v1/reference/Core/SurfaceShadingNode/
    const shadingPoint1 = new SurfaceShadingPoint("Earth-sensor-1", undefined, ["NOx","CO2"]); //new SurfaceShadingPoint(id, position, types, name, contextData)
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
    const shadingPoint19 = new SurfaceShadingPoint("Earth-sensor-19", undefined, ["NOx", "CO2"]);
    const shadingPoint20 = new SurfaceShadingPoint("Earth-sensor-20", undefined, ["NOx", "CO2"]);
    // Note that the surface shading point was created without an initial
    // position, but the position can be set to the center point of the
    // bounding box of a given DBid with the function call below.
    shadingPoint1.positionFromDBId(this.viewer.model, 4479); //this.viewer.model is the  (model) in the API description
    shadingNode1.addPoint(shadingPoint1);
    shadingPoint2.positionFromDBId(this.viewer.model, 10757); //this.viewer.model is the  (model) in the API description
    shadingNode2.addPoint(shadingPoint2);
    shadingPoint3.positionFromDBId(this.viewer.model, 10758); //this.viewer.model is the  (model) in the API description
    shadingNode3.addPoint(shadingPoint3);
    shadingPoint4.positionFromDBId(this.viewer.model, 10759); //this.viewer.model is the  (model) in the API description
    shadingNode4.addPoint(shadingPoint4);
    shadingPoint5.positionFromDBId(this.viewer.model, 10760); //this.viewer.model is the  (model) in the API description
    shadingNode5.addPoint(shadingPoint5);
    shadingPoint6.positionFromDBId(this.viewer.model, 10761); //this.viewer.model is the  (model) in the API description
    shadingNode6.addPoint(shadingPoint6);
    shadingPoint7.positionFromDBId(this.viewer.model, 10762); //this.viewer.model is the  (model) in the API description
    shadingNode7.addPoint(shadingPoint7);
    shadingPoint8.positionFromDBId(this.viewer.model, 10763); //this.viewer.model is the  (model) in the API description
    shadingNode8.addPoint(shadingPoint8);
    shadingPoint9.positionFromDBId(this.viewer.model, 10764); //this.viewer.model is the  (model) in the API description
    shadingNode9.addPoint(shadingPoint9);
    shadingPoint10.positionFromDBId(this.viewer.model, 10765); //this.viewer.model is the  (model) in the API description
    shadingNode10.addPoint(shadingPoint10);
    shadingPoint11.positionFromDBId(this.viewer.model, 10766); //this.viewer.model is the  (model) in the API description
    shadingNode11.addPoint(shadingPoint11);
    shadingPoint12.positionFromDBId(this.viewer.model, 10767); //this.viewer.model is the  (model) in the API description
    shadingNode12.addPoint(shadingPoint12);
    shadingPoint13.positionFromDBId(this.viewer.model, 10768); //this.viewer.model is the  (model) in the API description
    shadingNode13.addPoint(shadingPoint13);
    shadingPoint14.positionFromDBId(this.viewer.model, 10772); //this.viewer.model is the  (model) in the API description
    shadingNode14.addPoint(shadingPoint14);
    shadingPoint15.positionFromDBId(this.viewer.model, 10779); //this.viewer.model is the  (model) in the API description
    shadingNode15.addPoint(shadingPoint15);
    shadingPoint16.positionFromDBId(this.viewer.model, 10787); //this.viewer.model is the  (model) in the API description
    shadingNode16.addPoint(shadingPoint16);
    shadingPoint17.positionFromDBId(this.viewer.model, 10799); //this.viewer.model is the  (model) in the API description
    shadingNode17.addPoint(shadingPoint17);
    shadingPoint18.positionFromDBId(this.viewer.model, 10847); //this.viewer.model is the  (model) in the API description
    shadingNode18.addPoint(shadingPoint18);
    shadingPoint19.positionFromDBId(this.viewer.model, 4488); //this.viewer.model is the  (model) in the API description
    shadingNode19.addPoint(shadingPoint19);
    shadingPoint20.positionFromDBId(this.viewer.model, 4330); //this.viewer.model is the  (model) in the API description
    shadingNode20.addPoint(shadingPoint20);
    
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
    heatmapData.addChild(shadingNode19);
    heatmapData.addChild(shadingNode20);
    heatmapData.initialize(this.viewer.model);

    
    await this._extension.setupSurfaceShading(this.viewer.model, heatmapData);

    // this._extension.registerSurfaceShadingColors("CO2", ['#00ff00', '#ffff00', '#FF0000' ]);
    this._extension.registerSurfaceShadingColors("CO2", ['#00ff00', '#ffff00', '#FF0000' ]);
    // this._extension.registerSurfaceShadingColors("NOx", ['#ff0090', '#8c00ff', '#00fffb' ]);
    
    const polygonCollection = [];
    
    this.polygon1 = new Polygon2D(46.01514053,103.7871742 ,46.01514053+15,103.7871742+15,46.01514053+15,103.7871742-15,46.01514053-15,103.7871742-15,46.01514053-15,103.7871742+15)
    this.polygon2 = new Polygon2D(77.01471138,107.1271324,77.01471138+15,107.1271324+15.5,77.01471138+15.5,107.1271324-15.5,77.01471138-15.5,107.1271324-15.5,77.01471138-15.5,107.1271324+15.5)
    this.polygon3 = new Polygon2D(108.004158,110.64217,108.004158+15,110.64217+15,108.004158+15,110.64217-15,108.004158-15,110.64217-15,108.004158-15,110.64217+15)
    this.polygon4 = new Polygon2D(139.003727,114.178978,139.003727+15,114.178978+15,139.003727+15,114.178978-15,139.003727-15,114.178978-15,139.003727-15,114.178978+15)
    this.polygon5 = new Polygon2D(49.28166199,74.44085121,49.28166199+15,74.44085121+15,49.28166199+15,74.44085121-15,49.28166199-15,74.44085121-15,49.28166199-15,74.44085121+15)
    this.polygon6 = new Polygon2D(80.28123474, 77.78081131,80.28123474+15,77.78081131+15,80.28123474+15,77.78081131-15,80.28123474-15,77.78081131-15,80.28123474-15,77.78081131+15)
    this.polygon7 = new Polygon2D(111.2706757,81.29584885,111.2706757+15,81.29584885+15,111.2706757+15,81.29584885-15,111.2706757-15,81.29584885-15,111.2706757-15,81.29584885+15)
    this.polygon8 = new Polygon2D(142.2702484,84.83265305,142.2702484+15,84.83265305+15,142.2702484+15,84.83265305-15,142.2702484-15,84.83265305-15,142.2702484-15,84.83265305+15)
    this.polygon9 = new Polygon2D(52.74716377,45.11701965,52.74716377+15,45.11701965+15,52.74716377+15,45.11701965-15,52.74716377-15,45.11701965-15,52.74716377-15,45.11701965+15)
    this.polygon10 = new Polygon2D(83.74673462,48.45698166,83.74673462+15,48.45698166+15,83.74673462+15,48.45698166-15,83.74673462-15,48.45698166-15,83.74673462-15,48.45698166+15)
    this.polygon11 = new Polygon2D(114.7361794,51.97201347,114.7361794+15,51.97201347+15,114.7361794+15,51.97201347-15,114.7361794-15,51.97201347-15,114.7361794-15,51.97201347+15)
    this.polygon12 = new Polygon2D(56.01368713,15.77069828,56.01368713+15,15.77069828+15,56.01368713+15,15.77069828-15,56.01368713-15,15.77069828-15,56.01368713-15,15.77069828+15)
    this.polygon13 = new Polygon2D(87.01325989,19.11065757,87.01325989+15,19.11065757+15,87.01325989+15,19.11065757-15,87.01325989-15,19.11065757-15,87.01325989-15,19.11065757+15)
    this.polygon14 = new Polygon2D(120.4453239,23.07937765,120.4453239+6.6*3,23.07937765+15,120.4453239,23.07937765-9,120.4453239-5.18*3,23.07937765-9,120.4453239-5.18*3,23.07937765+9)
    this.polygon15 = new Polygon2D(112.2900696,-3.836624146,112.2900696-2.18*3,-3.836624146+4*3,112.2900696-2.18*3,-3.836624146-3*3,112.2900696+3*3,-3.836624146+4*3)
    this.polygon16 = new Polygon2D(144.0594559,55.52048874,144.0594559+7.125*3,55.52048874+4.5*3,144.0594559+0.125*3,55.52048874-4.5*3,144.0594559-2.375*3,55.52048874-4.5*3,144.0594559-2.375*3,55.52048874+4.5*3)
    this.polygon17 = new Polygon2D(89.87278366,-13.21999764,89.87278366+4.75*3,-13.21999764+7*3,89.87278366+4.75*3,-13.21999764,89.87278366,-13.21999764-4.75*3,89.87278366-4.75*3,-13.21999764,89.87278366-4.75*3,-13.21999764+7*3)
    this.polygon18 = new Polygon2D(59.38447762,-8.734884024,59.38447762+4.8*3,-8.734884024+3.5*3,59.38447762+4.8*3,-8.734884024-3.5*3,59.38447762-4.8*3,-8.734884024+3.5*3)
    this.polygon19 = new Polygon2D(138.7353,10.9452,163.0503,69.8371,182.4836,62.76,114.1642,-59.70,98.6556,-38.8220) 
    this.polygon20 = new Polygon2D(157.015,-4.06,181.2,59.78,164.94,-0.6108,117.9801,-52.64) 

    

    polygonCollection.push(this.polygon1,this.polygon2,this.polygon3,this.polygon4,this.polygon5,this.polygon6,this.polygon7,
      this.polygon8,this.polygon9,this.polygon10,this.polygon11,this.polygon12,this.polygon13,this.polygon14,this.polygon15,this.polygon16,this.polygon17,this.polygon18,this.polygon19,this.polygon20)  

    const positiondata = [this.his.filteredLons, this.his.filteredLats,new Array(this.his.filteredLons.length).fill(0)];
    console.log(positiondata)
    const PositionDataRelative=[]
    const weights = [];
    const scores = [];
    let finalScore = 0;



    const Emissions = [this.his.emissions[1]];
    
    // console.log(NOxs)

    const EmissionsFiltered =[this.his.filteredEmissions]
    const NOxsFiltered = [Emissions];
    console.log(EmissionsFiltered)

    for (let polygon of polygonCollection) {
      polygon.weight = 0; // Reset weight for each polygon
      for (let i = 0; i < positiondata[0].length; i++) {
        const x = positiondata[0][i];
        const y = positiondata[1][i];
        const z = positiondata[2][i];
        const vector = new THREE.Vector3(y, x, z);
        const lmv = this.geoTool.lonLatToLmv(vector);
        if (polygon.isInside(lmv.x, lmv.y) && EmissionsFiltered[0][i] > 0.4) {
          polygon.weight += 1;
          weights.push(polygon.weight);
        }
      }
      polygon.score = polygon.weight / positiondata[0].length;
      scores.push(polygon.score);
      finalScore += polygon.score;
    }
    
    console.log(weights, scores, finalScore);
    
    // console.log(scores.sumscores)
    // console.log(scores[1])
    // console.log(polygonCollection)

    const testValues = {
        "Earth-sensor-1": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
              scores[0],
            ]
        },
        "Earth-sensor-2": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[1],
            ]
        },
        "Earth-sensor-3": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[2],
            ]
        },
        "Earth-sensor-4": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[3],
            ]
        },
        "Earth-sensor-5": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[4],
            ]
        },
        "Earth-sensor-6": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[5],
            ]
        },
        "Earth-sensor-7": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[6],
            ]
        },
        "Earth-sensor-8": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[7],
            ]
        },
        "Earth-sensor-9": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[8],
            ]
        },
        "Earth-sensor-10": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[9],
            ]
        },
        "Earth-sensor-11": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[10],
            ]
        },
        "Earth-sensor-12": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[11],
            ]
        },
        "Earth-sensor-13": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
              scores[12],
            ]
        },
        "Earth-sensor-14": {
            "currentIndex": 0,
            "NOx": [
                1,

            ],
            "CO2": [
                scores[13],

            ]
        },
        "Earth-sensor-15": {
            "currentIndex": 0,
            "NOx": [
                1

            ],
            "CO2": [
                scores[14],

            ]
        },
        "Earth-sensor-16": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[15],
            ]
        },
        "Earth-sensor-17": {
            "currentIndex": 0,
            "NOx": [
                1,

            ],
            "CO2": [
                scores[16],
            ]
        },
        "Earth-sensor-18": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[17],
            ]
        },
        "Earth-sensor-19": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[18],
            ]
        },
        "Earth-sensor-20": {
            "currentIndex": 0,
            "NOx": [
                1,
            ],
            "CO2": [
                scores[19],
            ]
        }
     }     
    

    function getSensorValueFromId(shadingPointId, sensorType) {
        const shadingPoint = testValues[shadingPointId];
        const currentIndex = shadingPoint["currentIndex"];
        const typeValues = shadingPoint[sensorType]
        // console.log(typeValues);
        shadingPoint["currentIndex"] = currentIndex + 1 < typeValues.length ? currentIndex + 1 : 0;
        const value = typeValues[currentIndex];
        return value;
    }

    // Function that provides the value. This needs to be updated for generating automatically from list of devices, see referneces herehttps://forge.autodesk.com/en/docs/dataviz/v1/developers_guide/examples/heatmap/create_heatmap_for_rooms/
    function getSensorValue(surfaceShadingPoint, sensorType) {
        // console.log(surfaceShadingPoint, sensorType);
        const value = getSensorValueFromId(surfaceShadingPoint.id, sensorType);
        // console.log(value);
        return value;
    }
        

    this._extension.renderSurfaceShading(["Earthcubes1", "Earthcubes2", "Earthcubes3", "Earthcubes4", "Earthcubes5", "Earthcubes6", "Earthcubes7", "Earthcubes8", "Earthcubes9", "Earthcubes10", "Earthcubes11", "Earthcubes12", "Earthcubes13", "Earthcubes14", "Earthcubes15", "Earthcubes16", "Earthcubes17", "Earthcubes18","Earthcubes19","Earthcubes20"], "CO2", getSensorValue); //renderSurfaceShading(nodeIds, sensorType, valueCallback, options). nodeIds = One or more identifiers of nodes to render. The callback function that will be invoked when surface shading requires the sensor value to render.
    // this._extension.renderSurfaceShading(["Piles1", "Piles2"], "CO2", getSensorValue1); //renderSurfaceShading(nodeIds, sensorType, valueCallback, options). nodeIds = One or more identifiers of nodes to render. The callback function that will be invoked when surface shading requires the sensor value to render.

    // this._extension.renderSurfaceShading("Piles2", "Temperature", getSensorValue2); 
        // Update sensor values every 2 sec
    setTimeout(() => {
        this._extension.updateSurfaceShading(getSensorValue);
        // this._extension.updateSurfaceShading(getSensorValue2);
    }, 2000);
    console.log('loadheatmapextension logged');
}
disableHeatmap() {
  this.extension.removeSurfaceShading(this.viewer.model);
}
// async drawFilteredLines() {
//   this.geoTool = await this.viewer.loadExtension('Autodesk.Geolocation');
//   const positiondata = [this.his.filteredLons, this.his.filteredLats, new Array(this.his.filteredLons.length).fill(0)];
//   console.log(positiondata);
//   const PositionDataRelative = [];
//   const spheres = [];

//   for (let i = 0; i < positiondata[0].length; i++) {
//     const x = positiondata[0][i];
//     const y = positiondata[1][i];
//     const z = positiondata[2][i];
//     console.log(x, y, z);
//     const vector = new THREE.Vector3(y, x, z);
//     console.log(vector);
//     const lmv = this.geoTool.lonLatToLmv(vector);
//     console.log(lmv);
//     PositionDataRelative.push(lmv);

//     const geometry = new THREE.SphereGeometry(100); // Adjust the radius as needed
//     const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7FFF00) });
//     const sphere = new THREE.Mesh(geometry, material);
//     sphere.position.copy(lmv);
//     spheres.push(sphere);
//   }

//   console.log(PositionDataRelative);

//   spheres.forEach(sphere => this.viewer.impl.scene.add(sphere));
//   this.viewer.impl.createOverlayScene('myOverlay', material);
//   this.viewer.impl.addOverlay('myOverlay', spheres);
//   this.viewer.impl.invalidate(true);

//   console.log('DrawSpheres Function was called');
// }

// eraseLines() {
//   const scene = this.viewer.impl.scene;
//   spheres.forEach(sphere => scene.remove(sphere));
//   // console.clear();
// }




//Needs update the three.js version
// async drawFilteredLines() {
//   this.geoTool = await this.viewer.loadExtension('Autodesk.Geolocation');
//   const positiondata = [this.his.filteredLons, this.his.filteredLats, new Array(this.his.filteredLons.length).fill(0)];
//   console.log(positiondata);
//   const PositionDataRelative = [];
//   const vertices=[];
//   for (let i = 0; i < positiondata[0].length; i++) {
//     const x = positiondata[0][i];
//     const y = positiondata[1][i];
//     const z = positiondata[2][i];
//     console.log(x, y, z);
//     const vector = new THREE.Vector3(y, x, z);
//     console.log(vector);
//     const lmv = this.geoTool.lonLatToLmv(vector);
//     console.log(lmv);
//     PositionDataRelative.push(lmv)
//     vertices.push(lmv.x,lmv.y,lmv.z);
//   }
//   console.log(PositionDataRelative);

//   const geometry = new THREE.BufferGeometry();
//   // for (let i = 0; i < PositionDataRelative.length; i++) {
//   //   geometry.vertices.push(PositionDataRelative[i]);
//   // }
//   console.log(PositionDataRelative)
//   geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
//   const pointsMaterial = new THREE.PointsMaterial( { 
//     color: new THREE.Color(0x7FFF00),
//     size: 100,
//   } );


//   const points = new THREE.Points(geometry, pointsMaterial);
//   //  scene.add(points)
//   console.log(points);

//   this.viewer.impl.createOverlayScene('myOverlay', pointsMaterial);
//   this.viewer.impl.addOverlay('myOverlay', points);
//   this.viewer.impl.invalidate(true);

//   console.log('DrawLines Function was called');
// }

// eraseLines() {
//   this.viewer.impl.removeOverlay('myOverlay', this.points);
//   // console.clear();
// }

  
  
async drawFilteredLines() {
  this.geoTool = await this.viewer.loadExtension('Autodesk.Geolocation');
  const positiondata = [this.his.filteredLons, this.his.filteredLats,new Array(this.his.filteredLons.length).fill(0)];
  console.log(positiondata)
  const PositionDataRelative=[]
  for (let i = 0; i < positiondata[0].length; i++) {

    const x = positiondata[0][i];
    const y = positiondata[1][i];
    const z = positiondata[2][i];
    console.log(x,y,z);
    const vector =new THREE.Vector3(y,x,z);
    console.log(vector);
    const lmv = this.geoTool.lonLatToLmv(vector);
    console.log(lmv);
    PositionDataRelative.push(lmv);
  }
  // console.log(PositionDataRelative)
   const filteredData = positiondata.filter(point => {
      const pointDate = new Date(point.timestamp);
      return pointDate >= startDate && pointDate <= endDate;
  });
  const positiondouble = PositionDataRelative.flatMap(i => [i, i]);
  this.geometry = new THREE.Geometry();
  const PositionDataRelativeDouble = PositionDataRelative.flatMap(i => [i, i]);
  for (let i = 1; i < PositionDataRelativeDouble.length-1; i++) {
      this.geometry.vertices.push(PositionDataRelativeDouble[i])
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
      THREE.LinePieces);
      console.log(this.lines)

  this.viewer.impl.createOverlayScene(
      'myOverlay', this.linesMaterial);

  this.viewer.impl.addOverlay(
      'myOverlay', this.lines);

  this.viewer.impl.invalidate(true)

  console.log('DrawLines Function was called');
}

eraseLines() {
  this.viewer.impl.removeOverlay(
      'myOverlay', this.lines)
  // console.clear();
} 
async drawCrosses() {
  this.geoTool = await this.viewer.loadExtension('Autodesk.Geolocation');
  const positiondata = [this.his.filteredLons, this.his.filteredLats, new Array(this.his.filteredLons.length).fill(0)];
  const PositionDataRelative = [];
  const positionsfiltered = [];

  const EmissionsFiltered =[this.his.filteredEmissions]
  // const NOxsFiltered = [Emissions];
  console.log(PositionDataRelative,EmissionsFiltered)

  
  for (let i = 0; i < positiondata[0].length; i++) {
    const x = positiondata[0][i];
    const y = positiondata[1][i];
    const z = positiondata[2][i];
    const vector = new THREE.Vector3(y, x, z);
    const lmv = this.geoTool.lonLatToLmv(vector);
    PositionDataRelative.push(lmv);
    if (EmissionsFiltered[0][i] > 2) {
      positionsfiltered.push(lmv);
    }
  }
  
  console.log(positionsfiltered)
  
  const crosses = [];
  
  for (let i = 0; i < positionsfiltered.length; i++) {
    const crossGeometry = new THREE.Geometry();
    const crossSize = 1;
    const crossColor = new THREE.Color(0xFF0000);
    const crossOpacity = 1.0;
    
    // Vertices for the cross
    crossGeometry.vertices.push(
      new THREE.Vector3(-crossSize, 0, 0),
      new THREE.Vector3(crossSize, 0, 0),
      new THREE.Vector3(0, -crossSize, 0),
      new THREE.Vector3(0, crossSize, 0),
      new THREE.Vector3(0, 0, -crossSize),
      new THREE.Vector3(0, 0, crossSize)
    );
    
    const crossMaterial = new THREE.LineBasicMaterial({
      color: crossColor,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      linewidth: 1, // Adjust as needed
      opacity: crossOpacity
    });
    
    const crossMesh = new THREE.LineSegments(crossGeometry, crossMaterial);
    crossMesh.position.copy(PositionDataRelative[i]);
    crosses.push(crossMesh);
  }
  
  this.viewer.impl.createOverlayScene('myOverlay', this.linesMaterial);
  
  for (const cross of crosses) {
    this.viewer.impl.addOverlay('myOverlay', cross);
  }
  
  this.viewer.impl.invalidate(true);
  
  console.log('DrawLines Function was called');
}


  disableCrosses() {
      this.viewer.impl.removeOverlay(
          'myOverlay', this.lines)
      // console.clear();
  } 

  
  async loadSprites() {
     
    this.extension = await this.viewer.loadExtension("Autodesk.DataVisualization");
    const DataVizCore = Autodesk.DataVisualization.Core;
    const viewableType = DataVizCore.ViewableType.SPRITE;
    const spriteColor = new THREE.Color(0xffffff);
    const highlightColor = new THREE.Color(0xffffff);
    const spriteIconUrl = './extensions/drilling.png';
    const spriteIconUrl2 = './extensions/excavator.png';
    const style = new DataVizCore.ViewableStyle(
        viewableType,
        spriteColor,
        spriteIconUrl,
        highlightColor,
        spriteIconUrl,
        [spriteIconUrl2]
        );
        const viewableData = new DataVizCore.ViewableData();
        viewableData.spriteSize = 30; // Sprites as points of size 24 x 24 pixels normally
        
    
    let position = [];
    let myDataList = [
      { position: { x: 0, y: 0, z: -16.825702667236328 } }
    ];
    const updateMyDataList = () => {
      myDataList = [
        { position: { x: finalLat, y: finalLon, z: -16.825702667236328 } }
      ];
      // console.log(myDataList);
    };
    let finalLat;
    let finalLon;
    let latitudeDTU = 0;
    let longitudeDTU= 0;
    
    const alexPromise = new Promise((resolve, reject) => {
      setInterval(() => {
        latitudeDTU = this.his.realat+0.36098000000000496;
        // console.log(latitudeDTU)
        longitudeDTU = this.his.realon-2.3105720000000005;
        // console.log(longitudeDTU)
        
        // console.log(latitudeDTU);
        if (longitudeDTU != null && latitudeDTU != null) {
          resolve({ longitude: longitudeDTU, latitude: latitudeDTU });
        } else {
          reject("Failure!");
        }
      }, 15000);
    });

    async function fetchData() {
      try {
        const { longitude, latitude } = await alexPromise;
        finalLat = latitudeDTU
        finalLon = longitudeDTU;
        ;
        
        // position = [
        //   // { position: positiondata[0].Lmv },
        //   { position: { x: finalLat, y: finalLon, z: -16.825702667236328 } }
        // ];
        
        // console.log(position);
      } catch (error) {
        console.log("This is not lon: " + error);
      }
    }
    
    await fetchData();

    const refreshInterval = 3000;
        
    const refreshData = async () => {
      await fetchData();
      setTimeout(refreshData, refreshInterval);
    };

    refreshData();


  
    myDataList.forEach((myData, index) => {
      const dbId = 10 + index;
      // console.log(dbId, index);
      const position = myData.position;
      // console.log(position);
      const viewable = new DataVizCore.SpriteViewable(position, style, dbId);
      // console.log(viewable);
      viewableData.addViewable(viewable);
      // console.log(myDataList);
    });
    
    await viewableData.finish();
    this.geoTool = await this.viewer.loadExtension('Autodesk.Geolocation');
    // this.viewer.loadExtension.hasGeolocationData() 
    // activate() 

    this.extension.addViewables(viewableData);
    const spritesToUpdate = this.extension.viewableData.viewables.map((v) => v.dbId);
    // console.log(spritesToUpdate);
    
    setInterval(() => {
      // this.geoTool =  this.viewer.loadExtension('Autodesk.Geolocation');
      myDataList.forEach((myData) => {
        const position = myData.position;
        if (position && typeof position.y === 'number') {
          const updatedPosition = {
            x: finalLat,
            y: finalLon,
            z: 0,

            vector: new THREE.Vector3(finalLat,finalLon,0),
            // console.log(vector);
            lmv : this.geoTool.lonLatToLmv(new THREE.Vector3(longitudeDTU,latitudeDTU,0)),
            // vector: new THREE.Vector3(longitudeDTU+6, latitudeDTU+4, position.z),
            // lmv: this.geoTool.lonLatToLmv(new THREE.Vector3(longitudeDTU+66.90498414504137,latitudeDTU+49.62409718510002, 0))
          };
          
          this.extension.invalidateViewables(10, (viewable) => {
            return {
              url: spriteIconUrl,
              position: updatedPosition.lmv
            };
          });
          
          // console.log(longitudeDTU, updatedPosition.lmv,updatedPosition.x,updatedPosition.y);
        } else {
          console.log('Invalid position data:', position.vector);
        }
      });
    }, 3000);
    
    updateMyDataList()
    // 66.90498414504137
    // 49.62409718510002


    // console.log(updatedPosition.lmv);
    // for (let i = 0; i < positiondata[0].length; i++) {

    //   const x = positiondata[0][i];
    //   const y = positiondata[1][i];
    //   const z = positiondata[2][i];
    //   // console.log(x,y,z);
    //   const vector =new THREE.Vector3(y,x,z);
    //   // console.log(vector);
    //   const lmv = this.geoTool.lonLatToLmv(vector);
    //   console.log(lmv);
    //   PositionDataRelative.push(lmv);
    // }




      
      // setInterval(() => {
      //   spritesToUpdate.forEach((dbId) => {
      //     // console.log('hey')
      //     const myData = myDataList[0];
      //     console.log(myDataList)
      //     console.log(myData)
      //     const position = myDataList.position;
      //     console.log(position)
      //     this.extension.invalidateViewables(dbId, (viewable) => {
      //         return {
      //           position: { x: position.x, y: position.y, z: position.z }
      //         };
      //       });
      //     }
      //   );
      //   //  console.log(viewable.position)
      // }, 6000);
      
        
        // setInterval(() => {
        //   this.extension.invalidateViewables(spritesToUpdate[0], (viewable) => {
        //     return {
        //       position: { x: finalLon, y: finalLat, z: -16.825702667236328 }
        //     };
        //   });
        // }, 3000);

        // this.extension.invalidateViewables(spritesToUpdate[0], (viewable) => {return { url: spriteIconUrl2 }; })
        // let currentIndex = 1;
        // //if I make this update outside of the sprites function, e.g. updating only the position data array every minute to a new position
        // //then its fine that I remova all vieweables and add new ones for the site sensors list 
        // setInterval(() => {
        //     this.extension.invalidateViewables(spritesToUpdate[0], (viewable) => { //spritesToUpdate[0] means Im getting only 1db of the array that spritestoupdate return
        //         return {   
        //             position: {x: finalLon, y: finalLat, z: -16.825702667236328}.Lmv};
                  
        //         });
        //         // console.log(position).Lmv
        //     }, 3000); //this loops through each index of the data every sec.
            


          

            function onSpriteHovering(event) { //needs creating a panel to show name at least
                const targetDbId = event.dbId;
                
                if (event.hovering) {
                    console.log(`The mouse hovers over ${targetDbId}`);
                    
                    
                } else {
                    console.log(`The mouse hovers off ${targetDbId}`);
        }
    }
    function onSpriteClicked(event) {
      const dbId = event.dbId;
      console.log(`Sprite clicked: dbId=${dbId}`);
    
      const modelPosition = getSpritePosition(dbId);
      if (modelPosition) {
        console.log('Position:', modelPosition);
      } else {
        console.log('Position information not available for this sprite.');
      }
    }
    
    function getSpritePosition(dbId) {
      const modelData = NOP_VIEWER.model.getData();
      if (modelData && modelData.fragments && modelData.fragments.dbId2fragId) {
        const fragIds = modelData.fragments.dbId2fragId[dbId];
        if (fragIds && fragIds.length > 0) {
          const fragmentId = fragIds[0];
          const fragmentList = NOP_VIEWER.model.getFragmentList();
          if (fragmentList && fragmentList.getWorldBounds) {
            const fragmentBounds = fragmentList.getWorldBounds(fragmentId);
            if (fragmentBounds) {
              const modelPosition = fragmentBounds.center();
              return modelPosition;
            }
          }
        }
      }
    
      return null;
    }
    
    
  // Register event handlers for these two events.
  this.viewer.addEventListener(DataVizCore.MOUSE_HOVERING, onSpriteHovering);
  this.viewer.addEventListener(DataVizCore.MOUSE_CLICK, onSpriteClicked);      
} 



HideSprites() {
  this.extension.showHideViewables(false, false)
}
ShowSprites() {
    this.extension.showHideViewables(true, false)
    
}


}




