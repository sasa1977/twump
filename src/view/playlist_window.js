Twump.View.PlaylistWindow = Class.create();

Object.extend(Twump.View.PlaylistWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.PlaylistWindow.prototype, {
  initialize: function(){
    this.songlist = new Twump.View.Songlist({dragCode: "reorderFromPlaylist"});
    this.songlist.onItemSelected = function(item){this.onItemSelected(item)}.bind(this)
  
    this.addEventListeners('click', ['copyPathToClipboard', 'deleteContext']);
    
    ["selectItem", "selectedItems", "refreshItem", "refreshCurrentPage"].each(function(passThrough){
      this[passThrough] = this.songlist[passThrough].bind(this.songlist);
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
  
  display: function(options){
    this.playlist = options.playlist;
    this.songlist.display(options);
  },
  
  setPlayingItem: function(file){
    this.songlist.list.removeHtmlClassFromAll('playing');
    this.songlist.list.setItemHtmlClass(file, 'playing');
    this.playingItem = file
  },
  
  bringPlayingItemToFocus: function(){
    this.display({playlist: this.playlist, start: this.playlist.boundsAround({file: this.playingItem, range: 9}).start})
  }
});
