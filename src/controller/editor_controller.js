Twump.Controller.Editor = Class.create();

Object.extend(Twump.Controller.Editor.prototype, Twump.Controller.Common);

Object.extend(Twump.Controller.Editor.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.onWindowClosing = this.playerController.onEditorClosing.bind(this.playerController);
    this.subscribeToViewEvents(this.editorWindow, ["windowClosing", "filterChanged", "removeClick", "jumpToClick"]);
  },
  
  onFilterChanged: function(filter){
    if (filter == this.lastFilter) return;
    
    this.editorWindow.renderSearchResults(this.playlist.search(filter))
    this.lastFilter = filter;
  },
  
  onRemoveClick: function(){
    this.playerController.deleteFromPlaylist(this.selectedIds())
  },
  
  onJumpToClick: function(){
    var selectedItem = this.selectedItems()[0];
    if (!selectedItem) return;
    
    this.playerController.jumpTo(selectedItem);
  },
  
  selectedIds: function(){
    return this.editorWindow.selectedIds();
  }
})
