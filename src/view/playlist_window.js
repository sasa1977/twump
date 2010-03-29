Twump.View.PlaylistWindow = Class.create();

Object.extend(Twump.View.PlaylistWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.PlaylistWindow.prototype, {
  initialize: function(){
    this.songlist = new Twump.View.Songlist({dragCode: "reorderFromPlaylist",
      contextMenuDescriptor: [
        {id: 'copyPathToClipboard', title: 'copy full path to clipboard', onClick: this.onCopyPathToClipboardClick.bind(this)},
        {id: 'deleteContext', title: 'remove from playlist', onClick: this.onDeleteContextClick.bind(this)},
        {id: 'shuffleSelection', title: 'shuffle selection', onClick: this.onShuffleSelectionClick.bind(this)},
        {id: 'repeatPattern', title: 'repeat selection', onClick: this.onSetRepeatPatternClick.bind(this)},
        {id: 'repeatShufflePattern', title: 'repeat and reshuffle selection', onClick: this.onSetRepeatPatternWithShuffleClick.bind(this)},
        {id: 'clearRepeatPattern', title: 'clear repeat selection', onClick: this.onClearRepeatPatternClick.bind(this)},
      ]
    });
    
    this.songlist.onItemSelected = function(item){this.onItemSelected(item)}.bind(this);
    this.songlist.onPageChanged = function(files){this.onPageChanged(files)}.bind(this);
  
    [
      "selectItem", "selectedItems", "refreshItem", "displayed", "normalizedHeight",
      "onWindowSizeChanged", "onDragFinished"
    ].each(function(passthrough){
      this[passthrough] = this.songlist[passthrough].bind(this.songlist);
    }.bind(this));
  },
  
  itemUnderMouseIndex: function(){
    return this.songlist.itemUnderMouseIndex;
  },
  
  onCopyPathToClipboardClick: function(item){
    Twump.Api.copyTextToClipboard(item.path)
  },
  
  onDeleteContextClick: function(item){
    this.onDeleteClick(item);
  },
  
  display: function(playlist){
    this.playlist = playlist;
    this.songlist.display(playlist);
    this.setRepeatPattern(playlist.repeatPattern())
  },
  
  refreshCurrentPage: function(){
    this.setRepeatPattern(this.playlist.repeatPattern());
    this.songlist.refreshCurrentPage();
  },
  
  setPlayingItem: function(file){
    this.songlist.list.removeHtmlClassFromAll('playing');
    this.songlist.list.setItemHtmlClass(file, 'playing');
    this.playingItem = file
  },
  
  bringPlayingItemToFocus: function(){
    this.songlist.bringToFocus(this.playingItem);
  },
  
  onSetRepeatPatternClick: function(){
    this.onSetRepeatPattern(this.selectedItems());
  },
  
  onClearRepeatPatternClick: function(){
    this.onSetRepeatPattern([]);
  },
  
  onSetRepeatPatternWithShuffleClick: function(){
    this.onSetRepeatPattern(this.selectedItems(), true)
  },
  
  setRepeatPattern: function(files){
    this.songlist.list.removeHtmlClassFromAll('repeatPattern');
    (files || []).each(function(file){
      this.songlist.list.setItemHtmlClass(file, 'repeatPattern');
    }.bind(this))
  },
  
  onShuffleSelectionClick: function(){
    this.onShuffleSelection();
  }
});
