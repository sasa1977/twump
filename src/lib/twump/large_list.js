Twump.LargeList = Class.create();
Twump.LargeList.prototype = {
  initialize: function(options){
    Object.extend(this, options);

    $(this.parentElement).addEventListener('click', this.onParentClick.bind(this))
    $(this.parentElement).addEventListener('mousedown', this.onParentMouseDown.bind(this))
    $(this.parentElement).addEventListener('dblclick', this.onParentDoubleClick.bind(this))
    
    this.selectedItems = [];
    this.selectedItemsMap = {};
    
    this.itemsHtmlClasses = {};
    this.htmlClassesItems = {}
  },
  
  setModel: function(model){
    this.model = model;
  },
  
  drawItems: function(bounds){
    this.parentElement.update(this.itemsHtml(bounds));
    
    this.htmlItems().each(function(item){
      var modelItem = this.modelItem(item);
      item.id = "largeListItem" + modelItem.id;
      
      this.getItemHtmlClasses(modelItem).each(function(htmlClass){
        item.addClassName(htmlClass);
      })
    }.bind(this))
  },
  
  modelItem: function(htmlItem){
    return this.model.item(htmlItem.getAttribute('itemId'));
  },
  
  htmlItem: function(modelItem){
    return $('largeListItem' + modelItem.id);
  },
  
  setItemHtmlClass: function(item, htmlClass){
    if (this.getItemHtmlClasses(item).include(htmlClass)) return;

    this.getItemHtmlClasses(item).push(htmlClass);
    this.getHtmlClassItems(htmlClass).push(item);
    
    this.withHtmlItem(item, function(htmlItem){
      htmlItem.addClassName(htmlClass)
    })
  },
  
  withHtmlItem: function(modelItem, callback){
    var htmlItem = this.htmlItem(modelItem);
    if (htmlItem)
      callback(htmlItem);
  },
  
  getHtmlClassItems: function(htmlClass){
    return (this.htmlClassesItems[htmlClass] = this.htmlClassesItems[htmlClass] || [])
  },
  
  removeHtmlClassFromAll: function(htmlClass){
    this.getHtmlClassItems(htmlClass).clone().each(function(item){
      this.removeHtmlClass(item, htmlClass);
    }.bind(this));
  },
  
  removeHtmlClass: function(item, htmlClass){
    var itemHtmlClasses = this.getItemHtmlClasses(item);
    var position = itemHtmlClasses.indexOf(htmlClass);
    if (position >= 0)
      itemHtmlClasses.splice(position, 1);
      
    var htmlClassItems = this.getHtmlClassItems(htmlClass);
    position = htmlClassItems.indexOf(item);
    if (position >= 0)
      htmlClassItems.splice(position, 1);
      
    this.withHtmlItem(item, function(htmlItem){htmlItem.removeClassName(htmlClass)})
  },
  
  getItemHtmlClasses: function(item){
   this.itemsHtmlClasses[item.id] = this.itemsHtmlClasses[item.id] || [];
   return this.itemsHtmlClasses[item.id];
  },
  
  itemsHtml: function(bounds){
    return this.template.process({model: this.model, 
      items: this.model.items(bounds)}
    )
  },
  
  
  
  
  onParentDoubleClick: function(event){
    var item = this.findModel(event.srcElement, this.itemClass);
    
    if (item && this.onDoubleClick){
      this.onDoubleClick(item, event);
    }
  },
  
  onParentMouseDown: function(event){
    var item = this.findModel(event.srcElement, this.itemClass);
    if (!item) return;
    
    if (event.button == 2 && this.onRightClick)
      this.onRightClick(item, event);
    
    if (!this.itemSelected(item) && !event.ctrlKey)
      this.onItemClick(item, event);
    
    if (this.onStartDrag)
      this.onStartDrag();
  },
    
  onParentClick: function(event){
    var item = this.findModel(event.srcElement, this.itemClass);
    if (!item) return;
    
    this.onItemClick(item, event);
  },
  
  htmlItems: function(){
    return this.parentElement.getElementsBySelector('.' + this.itemClass);
  },
  
  findItem: function(el, htmlClass){
    el = $(el)
    
    if (!el || el == this.parentElement) return null;
    
    if (el.hasClassName(htmlClass)) return el;
    return this.findItem(el.parentElement, htmlClass);
  },
  
  findModel: function(el){
    var htmlElement = this.findItem(el, this.itemClass);
    if (htmlElement)
      return this.modelItem(htmlElement);
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
    this.anchor = item;
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
    
    var index = this.model.indexOf(item);
    var anchorIndex = this.model.indexOf(this.anchor);
    
    $R(Math.min(anchorIndex, index), Math.max(anchorIndex, index)).each(function(itemIndex){
      this.addSelectItem(this.model.item(itemIndex))
    }.bind(this))
  },
  
  addSelectItem: function(item){
    this.selectedItems.push(item);
    this.selectedItemsMap[item.id] = true;
    this.setItemHtmlClass(item, 'selected');
  },
  
  deselectItem: function(item){
    this.selectedItemsMap[item.id] = false;
    this.selectedItems = this.selectedItems.reject(function(selectedItem){return selectedItem == item})
    this.removeHtmlClass(item, 'selected')
  },
  
  itemSelected: function(item){
    return (this.selectedItemsMap[item.id] == true)
  },
  
  deselectAllItems: function(){
    this.selectedItems.clear();
    this.removeHtmlClassFromAll('selected');
    this.selectedItemsMap = {};
  }
}
