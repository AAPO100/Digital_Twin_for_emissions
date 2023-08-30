import { BaseExtension } from './BaseExtension.js';
import { getLocationObjects, getMachineInfo } from './DataProcessing.js'
import { SoundsPanel } from './SoundsPanel.js';


class SoundsOverview extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._barChartButton = null;
        this._barChartPanel = null;
        
    }

    async load() {
        super.load();
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.1/chart.min.js', 'Chart');
        Chart.defaults.plugins.legend.display = false;
        console.log('SoundsOverviewExtension loaded');
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
        console.log('SoundsOverviewExtension unloaded')
        return true;
    }

    onToolbarCreated() {
        this._barChartPanel = new SoundsPanel(this, 'dashboard-barchart-panel', 'Sounds overview', { x: 10, y: 10, chartType: 'line' });
        this._barChartButton = this.createToolbarButton('sounds-noise-button',"https://www.clipartmax.com/png/small/8-82242_pin-sound-waves-clipart-sound-waves-black-and-white.png",'Show noise levels of sensors');
        this._barChartButton.onClick = () => {
            this._barChartPanel.setVisible(!this._barChartPanel.isVisible());
            this._barChartButton.setState(this._barChartPanel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            // if (this._barChartPanel.isVisible() && this.viewer.model) {
            //     this._barChartPanel.setModel(this.viewer.model);
            // }

        };
     

    }
    onModelLoaded(model) {
        super.onModelLoaded(model);
        if (this._barChartPanel && this._barChartPanel.isVisible()) {
            this._barChartPanel.setModel(model);
        }
       
    }
   
    // async getDiagram(){
    //     return new Promise((resolve, reject) => {
            
    //             const DATA_COUNT = 7;
    //             const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};
                
    //             const labels = Utils.months({count: 7});
    //             const data = {
    //             labels: labels,
    //             datasets: [
    //                 {
    //                 label: 'Dataset 1',
    //                 data: Utils.numbers(NUMBER_CFG),
    //                 borderColor: Utils.CHART_COLORS.red,
    //                 backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    //                 },
    //                 {
    //                 label: 'Dataset 2',
    //                 data: Utils.numbers(NUMBER_CFG),
    //                 borderColor: Utils.CHART_COLORS.blue,
    //                 backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    //                 }
    //             ]
    //             }; 
    //     })
        
    // }


    
}
    









Autodesk.Viewing.theExtensionManager.registerExtension('SoundsOverview', SoundsOverview);