Twump.View.EditorWindow = Class.create();

Object.extend(Twump.View.EditorWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.EditorWindow.prototype, {
  initialize: function(){
    this.insertHeader('editor');
    this.delayExecute = new Twump.Utils.DelayExecute(1000);

    this.addEventListener('filter', 'keydown');
    this.addEventListeners('click', ['remove', 'jumpTo']);
    
    this.songlist = new Twump.View.Songlist({dragCode: "reorderFromEditor"});
    this.songlist.onItemSelected = this.onItemSelected.bind(this);
    
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
    this.onJumpToClick();
  }
});
