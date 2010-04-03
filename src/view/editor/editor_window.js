Twump.View.EditorWindow = Class.define(
  Twump.View.Common,
  Twump.View.ResizeableSonglist,
  {
    initialize: function(){
      this.insertHeader('editor');
      this.delayExecute = new Twump.Utils.DelayExecute(1000);

      this.addEventListener('filter', 'keydown');
    
      this.songlist = new Twump.View.Songlist({dragCode: "reorderFromEditor",
        contextMenuDescriptor: [
          {id: 'remove', title: 'remove from playlist', onClick: this.onRemoveClick.bind(this)},
          {id: 'jumpTo', title: 'jump to', onClick: this.onJumpToClick.bind(this)}
        ]
      });
      this.songlist.onItemSelected = this.onItemSelected.bind(this);
    
      this.initResizeableSonglist(this.songlist, ['filter', 'header', 'resize']);
    
      $('filter').activate();
    },
  
    onFilterKeydown: function(){
      this.delayExecute.cancel();
      this.delayExecute.schedule(function(){
        this.onFilterChanged($('filter').value)
      }.bind(this))
    },
  
    renderSearchResults: function(results){
      this.songlist.display(results);
    },
  
    selectedItems: function(){
      return this.songlist.selectedItems();
    },
  
    onItemSelected: function(item){
      this.onJumpToClick(item);
    },
  
    onJumpToClick: function(item){
      this.onJumpTo(item);
    },
  
    onRemoveClick: function(item){
      this.onRemove(item);
    }
  }
);
