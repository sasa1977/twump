Twump.Controller.Editor = Class.create();

Object.extend(Twump.Controller.Editor.prototype, Twump.Controller.Common);

Object.extend(Twump.Controller.Editor.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.onWindowClosing = this.playerController.onEditorClosing.bind(this.playerController);
    this.subscribeToViewEvents(this.editorWindow, ["windowClosing", "filterChanged", "moveAfterCurrent"]);
  },
  
  onFilterChanged: function(filter){
    if (filter == this.lastFilter) return;
    
    this.editorWindow.renderSearchResults(this.playlist.search(filter))
    this.lastFilter = filter;
  },
  
  onMoveAfterCurrent: function(){
    this.playerController.moveAfterCurrent(this.editorWindow.getSelectedItems());
  }
})
