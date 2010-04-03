Twump.View.PlaylistWindow = Class.define(
  Twump.View.Common,

  {
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
      this.songlist.onPageChanged = function(songs){this.onPageChanged(songs)}.bind(this);
  
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
  
    setPlayingItem: function(song){
      this.songlist.list.removeHtmlClassFromAll('playing');
      this.songlist.list.setItemHtmlClass(song, 'playing');
      this.playingItem = song
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
  
    setRepeatPattern: function(songs){
      this.songlist.list.removeHtmlClassFromAll('repeatPattern');
      (songs || []).each(function(song){
        this.songlist.list.setItemHtmlClass(song, 'repeatPattern');
      }.bind(this))
    },
  
    onShuffleSelectionClick: function(){
      this.onShuffleSelection();
    }
  }
);
