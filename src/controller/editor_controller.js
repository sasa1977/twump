Twump.Controller.Editor = Class.define(
  Twump.Controller.Common,
  {
    initialize: function(options){
      Object.extend(this, options);
    
      this.subscribeToViewEvents(this.editorWindow, ["filterChanged", "remove", "jumpTo", "windowResized"]);

      this.editorWindow.setDimensions(this.playerController.options.editorWindowDimensions);
    },
  
    onFilterChanged: function(filter){
      if (filter == this.lastFilter) return;
    
      this.editorWindow.renderSearchResults(this.playlist.search(filter))
      this.lastFilter = filter;
    },
  
    onRemove: function(){
      this.playerController.removeFromPlaylist(this.selectedItems())
    },
  
    onJumpTo: function(){
      var selectedItem = this.selectedItems()[0];
      if (!selectedItem) return;
    
      this.playerController.jumpTo(selectedItem);
    },
  
    selectedItems: function(){
      return this.editorWindow.selectedItems();
    },
  
    onWindowResized: function(){
      this.playerController.savePlayerData();
    },
  
    nativeWindowDimensions: function(){
      return this.editorWindow.nativeWindowDimensions();
    }
  }
)
