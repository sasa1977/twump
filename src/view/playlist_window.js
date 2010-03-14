Twump.View.PlaylistWindow = Class.create();

Object.extend(Twump.View.PlaylistWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.PlaylistWindow.prototype, {
  initialize: function(){
    this.songlist = new Twump.View.Songlist({dragCode: "reorderFromPlaylist"});
    this.songlist.onItemSelected = function(item){this.onItemSelected(item)}.bind(this);
    this.songlist.onPageChanged = function(files){this.onPageChanged(files)}.bind(this);
  
    this.addEventListeners('click', ['copyPathToClipboard', 'deleteContext']);
    
    [
      "selectItem", "selectedItems", "refreshItem", "refreshCurrentPage", "displayed", "normalizedHeight",
      "onWindowSizeChanged", "onDragFinished"
    ].each(function(passthrough){
      this[passthrough] = this.songlist[passthrough].bind(this.songlist);
    }.bind(this));
  },
  
  itemUnderMouseIndex: function(){
    return this.songlist.itemUnderMouseIndex;
  },
  
  onCopyPathToClipboardClick: function(){
    Twump.Api.copyTextToClipboard(this.songlist.relatedContextMenuItem.path)
  },
  
  onDeleteContextClick: function(){
    this.onDeleteClick();
  },
  
  display: function(playlist){
    this.playlist = playlist;
    this.songlist.display(playlist);
  },
  
  setPlayingItem: function(file){
    this.songlist.list.removeHtmlClassFromAll('playing');
    this.songlist.list.setItemHtmlClass(file, 'playing');
    this.playingItem = file
  },
  
  bringPlayingItemToFocus: function(){
    this.songlist.bringToFocus(this.playingItem);
  }
});
