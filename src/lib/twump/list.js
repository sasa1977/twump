Twump.List = Class.create();
Twump.List.prototype = {
  initialize: function(options){
    Object.extend(this, options);

    $(this.parentElement).addEventListener('click', this.onParentClick.bind(this))
    $(this.parentElement).addEventListener('mousedown', this.onParentMouseDown.bind(this))
    $(this.parentElement).addEventListener('dblclick', this.onParentDoubleClick.bind(this))
    
    this.selectedItems = [];
  },
  
  onParentDoubleClick: function(event){
    var item = this.findItem(event.srcElement, this.itemClass);
    
    if (this.onDoubleClick){
      this.onDoubleClick(item, event);
    }
  },
  
  onParentMouseDown: function(event){
    var item = this.findItem(event.srcElement, this.itemClass);
    if (!item) return;
    
    if (event.button == 2 && this.onRightClick)
      this.onRightClick(item, event);
    
    if (!this.itemSelected(item) && !event.ctrlKey)
      this.onItemClick(item, event);
    
    if (this.onStartDrag)
      this.onStartDrag();
  },
    
  onParentClick: function(event){
    var item = this.findItem(event.srcElement, this.itemClass);
    if (!item) return;
    
    this.onItemClick(item, event);
  },
  
  indexOf: function(item){
    return this.items().indexOf(item)
  },
  
  items: function(){
    return this.parentElement.getElementsBySelector('.' + this.itemClass);
  },
  
  item: function(index){
    return this.items()[index];
  },
  
  findItem: function(el, htmlClass){
    el = $(el)
    
    if (!el || el == this.parentElement) return null;
    
    if (el.hasClassName(htmlClass)) return el;
    return this.findItem(el.parentElement, htmlClass);
  },
  
  onItemClick: function(item, data){
    if ((!data.shiftKey && !data.ctrlKey) || this.selectionEmpty())
      this.selectItem(item);
    else if (data.shiftKey)
      this.selectToItem(item);
    else if (data.ctrlKey)
      this.ctrlSelectItem(item);
  },
  
  selectionEmpty: function(){
    return (this.selectedItems.length == 0);
  },
  
  selectItem: function(item){
    this.deselectAllItems();
    this.anchor = this.indexOf(item);
    this.addSelectItem(item);
  },
  
  ctrlSelectItem: function(item){
    if (this.itemSelected(item))
      this.deselectItem(item);
    else
      this.addSelectItem(item)
  },
  
  selectToItem: function(item){
    if (this.selectionEmpty()) return;
    
    this.deselectAllItems();
    var index = this.indexOf(item)
    
    $R(Math.min(this.anchor, index), Math.max(this.anchor, index)).each(function(itemIndex){
      this.addSelectItem(this.item(itemIndex))
    }.bind(this))
  },
  
  addSelectItem: function(item){
    item.addClassName('selected')
    this.selectedItems.push(item);
  },
  
  deselectItem: function(item){
    item.removeClassName('selected');
    
    this.selectedItems = this.selectedItems.reject(function(selectedItem){return selectedItem == item})
  },
  
  itemSelected: function(item){
    return item.hasClassName('selected')
  },
  
  deselectAllItems: function(){
    this.selectedItems.each(function(selectedItem){
      selectedItem.removeClassName('selected');
    })
    
    this.selectedItems.clear();
  }
}
