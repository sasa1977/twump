Twump.View.EditorWindow = Class.create();

Object.extend(Twump.View.EditorWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.EditorWindow.prototype, {
  initialize: function(){
    this.insertHeader('editor');
    this.delayExecute = new Twump.Utils.DelayExecute(1000);
    this.selectedItems = [];

    this.addEventListener('filter', 'keydown');
    this.addEventListeners('click', ['results']);
    this.addEventListener('results', 'mousedown')
  },
  
  onFilterKeydown: function(){
    this.delayExecute.cancel();
    this.delayExecute.schedule(function(){
      this.onFilterChanged($('filter').value)
    }.bind(this))
  },
  
  renderSearchResults: function(results){
    this.deselectAllItems();
    
    var index = 0, html = results.inject("", function(memo, file){
      var result = memo + this.searchResultTemplate.process({file: file, index: index});
      index++;
      return result;
    }.bind(this))

    $('results').update(html);
  },
  
  searchResultTemplate: TrimPath.parseTemplate(" \
    <div class='result' id='result${index}' value='${file.path}' index='${index}' fileId='${file.id}' style='width:1000'> \
      ${file.path} \
     </div> \
  "),
  
  getResultItem: function(index){
    return $('result' + index)
  },
  
  onResultsClick: function(data){
    this.handleSelectItem(data);
  },
  
  handleSelectItem: function(data){
    var index = data.srcElement.getAttribute('index');
    if (index == null) return;
    
    if ((!data.shiftKey && !data.ctrlKey) || this.selectionEmpty())
      this.selectItem(index);
    else if (data.shiftKey)
      this.selectToItem(index);
    else if (data.ctrlKey)
      this.ctrlSelectItem(index);
  },
  
  onResultsMousedown: function(data){
    var index = data.srcElement.getAttribute('index');
    if (index == null) return;
    
    if (!this.itemSelected(index) && !data.ctrlKey)
      this.handleSelectItem(data);
    
    Twump.Api.startDrag("twump:moveAfter");
  },
  
  selectItem: function(index){
    this.deselectAllItems();
    this.anchor = this.addSelectItem(index);
  },
  
  ctrlSelectItem: function(index){
    if (this.itemSelected(index))
      this.deselectItem(index);
    else
      this.addSelectItem(index)
  },
  
  selectToItem: function(index){
    if (this.selectionEmpty()) return;
    
    var lastSelected = this.anchor.getAttribute('index');
    this.deselectAllItems();
    
    $R(Math.min(lastSelected, index), Math.max(lastSelected, index)).each(function(itemIndex){
      this.addSelectItem(itemIndex)
    }.bind(this))
  },
  
  addSelectItem: function(index){
    var item = this.getResultItem(index);
    if (!item) return;
    
    item.addClassName('selected')
    this.selectedItems.push(item);
    return item;
  },
  
  deselectItem: function(index){
    var item = this.getResultItem(index);
    if (!item) return;
    
    item.removeClassName('selected');
    
    this.selectedItems = this.selectedItems.reject(function(selectedItem){return selectedItem.id == item.id})
  },
  
  itemSelected: function(index){
    var item = this.getResultItem(index);
    if (!item) return false;
    return item.hasClassName('selected')
  },
  
  deselectAllItems: function(){
    this.selectedItems.each(function(selectedItem){
      selectedItem.removeClassName('selected');
    })
    
    this.selectedItems.clear();
  },
  
  selectionEmpty: function(){
    return (this.selectedItems.length == 0);
  },
  
  getSelectedItems: function(){
    return this.selectedItems.map(function(item){
      return item.getAttribute('fileId');
    })
  }
});
