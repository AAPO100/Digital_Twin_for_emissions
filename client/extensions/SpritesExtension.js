import { getLocationObjects } from './DataProcessing.js'


class SpritesExtension extends Autodesk.Viewing.Extension {
    
    constructor(viewer, options) {
        super(viewer, options);
        this._extension = null;
        this._group = null;
        this._button = null;
        this._isSpritesShowing = false;
    }

    load() {
        setTimeout(() => {
            this.loadSprites();
         }, 7000);
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
        console.log('SpritesExtensions has been unloaded');
        return true;
    }
    
    async loadSprites() {
        const positiondata = getLocationObjects();
        console.log(positiondata);
        this._extension = await this.viewer.loadExtension("Autodesk.DataVisualization");
        const DataVizCore = Autodesk.DataVisualization.Core;
        const viewableType = DataVizCore.ViewableType.SPRITE;
        const spriteColor = new THREE.Color(0xffffff);
        const highlightColor = new THREE.Color(0xffffff);
        // const baseURL = "https://shrikedoc.github.io/data-visualization-doc/_static/"; //native sprites
        // const spriteIconUrl = '`${baseURL}fan-00.svg`'; //native sprites
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
            viewableData.spriteSize = 58; // Sprites as points of size 24 x 24 pixels normally
            
            const myDataList = [
                { position: positiondata[0].Lmv },
                // { position: { x: 176.317125275187, y: 137.68808110566533, z: -16.825702667236328} },
                // { position: { x:112.38093831151251,y:29.759913345881873, z:-16.825702667236328} },
                // { position: { x:129.71875153892492,y:112.92621569847593,z:-16.825702667236328} },
                // { position: { x: 0, y: 0, z: 0 } },
                
            ];
            console.log(myDataList);
            
            myDataList.forEach((myData, index) => {
                const dbId = 10 + index;
                const position = myData.position;
                const viewable = new DataVizCore.SpriteViewable(position, style, dbId);
                
                viewableData.addViewable(viewable);
                // console.log(viewable.dbId); //this is just to understand how the index is working here, it logs the dbId of the sprites
            });
            
            await viewableData.finish();
            this._extension.addViewables(viewableData);
            

            
            
            const spritesToUpdate = this._extension.viewableData.viewables.map((v) => v.dbId); //creates an array with all dbids of the viewables
            // console.log('dbids', spritesToUpdate); //dbids are called 10,11,12
            this._extension.invalidateViewables(spritesToUpdate[1], (viewable) => {return { url: spriteIconUrl2 }; })
            let currentIndex = 1;
            //if I make this update outside of the sprites function, e.g. updating only the position data array every minute to a new position
            //then its fine that I remova all vieweables and add new ones for the site sensors list 
            setInterval(() => {
                this._extension.invalidateViewables(spritesToUpdate[0], (viewable) => { //spritesToUpdate[0] means Im getting only 1db of the array that spritestoupdate return
                    return {   
                        // position: positiondata[currentIndex].Lmv};
                        position: positiondata[positiondata.length-1].Lmv};
                    });
                    //    currentIndex = currentIndex + 1;
                    //    console.log(positiondata[currentIndex].Lmv);
                    // currentIndex = currentIndex + 1 < positiondata.length ? currentIndex + 1 : 0;
                }, 1000); //this loops through each index of the data every sec.
                
                function onSpriteHovering(event) { //needs creating a panel to show name at least
                    const targetDbId = event.dbId;
                    
                    if (event.hovering) {
                        console.log(`The mouse hovers over ${targetDbId}`);
                        
                        
                    } else {
                        console.log(`The mouse hovers off ${targetDbId}`);
            }
        }
        
        function onSpriteClicked(event) {
            console.log(`Sprite clicked: ${event.dbId}`);
        }
        
        // Register event handlers for these two events.
        this.viewer.addEventListener(DataVizCore.MOUSE_HOVERING, onSpriteHovering);
        this.viewer.addEventListener(DataVizCore.MOUSE_CLICK, onSpriteClicked);

    }

    // disableSprites() {
    //     this._extension.removeAllViewables();
    // }

     
        HideSprites() {
        this._extension.showHideViewables(false, false)
        //below is for the sensor sprites to activate
        // this.viewer.unloadExtension("Autodesk.DataVisualization");
    }
    
    ShowSprites() {
        this._extension.showHideViewables(true, false)
        
    }
    
    
    
    onToolbarCreated() {
        this._group = this.viewer.toolbar.getControl('dashboard-toolbar-group'); //if it exists it puts here /
        if (!this._group) { // Create a new toolbar group if it doesn't exist
            this._group = new Autodesk.Viewing.UI.ControlGroup('dashboard-toolbar-group');
            this.viewer.toolbar.addControl(this._group);
        }
           
        // Add a new button to the toolbar group
        this._button = new Autodesk.Viewing.UI.Button('SpriteExtensionButton');
        this._button.onClick = (event) => {

            if (this._isSpritesShowing) { // Same as (this._isSpritesShowing === true)
                // If showing disable sprites.
                this.HideSprites();
                this._isSpritesShowing = false;
            } else { // Same as (else if (!this._isSpritesShowing))
                // Else if not showing, enable sprites.
                this.ShowSprites();
                this._isSpritesShowing = true;
            }
            // instead of having the this._isSpritesshowing false and true above could just have this line here
            //  this._isSpritesShowing = !this._isSpritesShowing; // what this does is that whenever the button is clicked it assigns the oposite value.
        }
        
        this._button.setToolTip('Show Live Machines Position'); // when wehover the button 
        this._button.addClass('SpritesExtensionIcon'); //css id if we want to style
        this._group.addControl(this._button);
        
        
    }

    
}

    
Autodesk.Viewing.theExtensionManager.registerExtension('SpritesExtension', SpritesExtension);

