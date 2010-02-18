Twump.View.EditorWindow = Class.create();

Object.extend(Twump.View.EditorWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.EditorWindow.prototype, {
  initialize: function(){
    this.insertHeader('editor');
    this.delayExecute = new Twump.Utils.DelayExecute(1000);
    this.selectedItems = [];

    results.onmousedown = this.onResultsMouseDown.bind(this);
    
    this.addEventListener('filter', 'keydown');
    this.addEventListeners('click', ['results'])
  },
  
  onFilter: function(){
    this.delayExecute.cancel();
    this.delayExecute.schedule(function(){
      this.onFilterChanged($('filter').value)
    }.bind(this))
  },
  
  renderSearchResults: function(results){
    this.deselectAllItems();
    
    var index = 0, html = results.inject("", function(memo, result){
      var result = memo + this.searchResultTemplate.process({result: result, index: index});
      index++;
      return result;
    }.bind(this))

    $('results').update(html);
  },
  
  searchResultTemplate: TrimPath.parseTemplate(" \
    <div class='result' id='result${index}' value='${result}' index='${index}' style='width:1000'> \
      ${result} \
     </div> \
  "),
  
  getResultItem: function(index){
    return $('result' + index)
  },
  
  onResults: function(data){
    this.handleSelectItem(data);
  },
  
  handleSelectItem: function(data){
    var index = data.srcElement.getAttribute('index');
    if (index == null) return;
    
    if (!data.shiftKey || this.selectionEmpty())
      this.selectItem(index);
    else if(data.shiftKey)
      this.selectToItem(index);
  },
  
  onResultsMouseDown: function(data){
    var index = data.srcElement.getAttribute('index');
    if (index == null) return;
    
    if (!this.itemSelected(index))
      this.handleSelectItem(data);
    
    var clipboard = new air.Clipboard();
    clipboard.setData(air.ClipboardFormats.TEXT_FORMAT, "twump:moveAfter")
    air.NativeDragManager.doDrag(window.htmlLoader, clipboard)
  },
  
  selectItem: function(index){
    this.deselectAllItems();
    this.anchor = this.addSelectItem(index);
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
      return item.getAttribute('value');
    })
  }
});
