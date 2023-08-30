import { BaseExtension } from './BaseExtension.js';
import { getLocationObjects, getMachineInfo } from './DataProcessing.js'
import { Trajectory} from './Trajectory.js';


class TrajectoryOverview extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._barChartButton = null;
        this._barChartPanel = null;
        this.viewer=viewer;
        
    }

    async load() {
        super.load();
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.1/chart.min.js', 'Chart');
        Chart.defaults.plugins.legend.display = false;
        console.log('TrajectoryOverviewExtension loaded');
        return true;
        
    }

    unload() {
        super.unload();
        for (const button of [this._barChartButton]){
            this.removeToolbarButton(button);
        }
        this._barChartButton=null;
        for (const panel of [this._barChartPanel]) {
            panel.setVisible(false);
            panel.uninitialize();
        }
        this._barChartPanel = null;
        console.log('TrajectoryOverviewExtension unloaded')
        return true;
    }

    onToolbarCreated() {
        this._barChartPanel = new Trajectory(this, 'dashboard-barchart-panel', 'Trajectory overview', { x: 10, y: 10, chartType: 'line' });
        this._barChartButton = this.createToolbarButton('sounds-noise-button',"https://as2.ftcdn.net/v2/jpg/02/54/62/25/1000_F_254622588_6OClHyYpak64rVI8y9QVjUvDlStsDEu9.jpg",'Position Information');
        this._barChartButton.onClick = () => {                                  
            this._barChartPanel.setVisible(!this._barChartPanel.isVisible());
            this._barChartButton.setState(this._barChartPanel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            // if (this._barChartPanel.isVisible() && this.viewer.model) {
            //     this._barChartPanel.setModel(this.viewer.model);
            // }

        };
     

    }
    async onModelLoaded(model) {
        super.onModelLoaded(model);
        
        if (this._barChartPanel && this._barChartPanel.isVisible()) {
            this._barChartPanel.setModel(model);
        }

        this.geoTool = await this.viewer.loadExtension('Autodesk.Geolocation');
    }  

    
    
}
    

Autodesk.Viewing.theExtensionManager.registerExtension('TrajectoryOverview', TrajectoryOverview);


