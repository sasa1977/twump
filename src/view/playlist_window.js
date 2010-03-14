Twump.View.PlaylistWindow = Class.create();

Object.extend(Twump.View.PlaylistWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.PlaylistWindow.prototype, {
  initialize: function(){
    this.songlist = new Twump.View.Songlist({dragCode: "reorderFromPlaylist"});
    this.songlist.onItemSelected = function(item){this.onItemSelected(item)}.bind(this);
    this.songlist.onPageChanged = function(files){this.onPageChanged(files)}.bind(this);
  
    this.addEventListeners('click', ['copyPathToClipboard', 'deleteContext']);
    
    ["selectItem", "selectedItems", "refreshItem", "refreshCurrentPage", "displayed"].each(function(passthrough){
      this[passthrough] = this.songlist[passthrough].bind(this.songlist);
    }.bind(this));
    
    this.addEventListener("resize", "mousedown");
    
    this.normalizeWindowHeight(window.nativeWindow.height)
  },
  
  onResizeMousedown: function(){
    this.resizeMouseMove = this.onResizeMousemove.bind(this);
    document.addEventListener("mousemove", this.resizeMouseMove);
    
    this.resizeMouseUp = this.onResizeMouseup.bind(this);
    document.addEventListener("mouseup", this.resizeMouseUp);
  },
  
  onResizeMouseup: function(){
    if (this.resizeMouseMove){
      document.removeEventListener("mousemove", this.resizeMouseMove);
      this.resizeMouseMove = null;
      
      document.removeEventListener("mouseup", this.resizeMouseUp);
      this.resizeMouseUp = null;
    }
  },
  
  onResizeMousemove: function(event){
    this.normalizeWindowHeight(event.screenY - window.nativeWindow.y)
  },
  
  normalizeWindowHeight: function(desiredWindowHeight){
    var fixedHeight = ['player', 'header', 'resize'].inject(0, function(memo, id){
      return memo + $(id).clientHeight;
    });
  
    var maxSonglistHeight = desiredWindowHeight - fixedHeight;
    var songlistHeight = this.songlist.normalizedHeight(maxSonglistHeight);
    
    window.nativeWindow.height = fixedHeight + songlistHeight;
    
    this.songlist.onWindowSizeChanged(songlistHeight);
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
