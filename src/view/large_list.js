Twump.View.LargeList = Class.create();
Twump.View.LargeList.prototype = {
  initialize: function(options){
    Object.extend(this, options);

    $(this.parentElement).addEventListener('click', this.onParentClick.bind(this))
    $(this.parentElement).addEventListener('mousedown', this.onParentMouseDown.bind(this))
    $(this.parentElement).addEventListener('mouseup', this.onParentMouseUp.bind(this))
    $(this.parentElement).addEventListener('mousemove', this.onParentMouseMove.bind(this))
    $(this.parentElement).addEventListener('dblclick', this.onParentDoubleClick.bind(this))
    $(this.parentElement).addEventListener('mousewheel', this.onParentMouseWheel.bind(this))
    
    this.selectedItems = [];
    this.selectedItemsMap = {};
    
    this.itemsHtmlClasses = {};
    this.htmlClassesItems = {};
    
    this.pageScroller.onPageChange = this.onPageChange.bind(this);
  },
  
  onPageChange: function(page){
    this.drawItems({start: page, end: page + this.itemsInViewPort});
  },
  
  onParentMouseWheel: function(event){
    this.pageScroller.incPage(-(event.wheelDeltaY / 120));
  },
  
  setPage: function(options){
    this.itemsInViewPort = options.itemsInViewPort;
    this.pageScroller.setPage(options.page, options.maximum);
  },
  
  setMaximum: function(maximum){
    this.pageScroller.setMaximum(maximum);
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
  
  itemsHtml: function(bounds){
    return this.template.process({model: this.model, 
      items: this.model.items(bounds)}
    )
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
    this.getItemHtmlClasses(item).findAndDelete(htmlClass);
    this.getHtmlClassItems(htmlClass).findAndDelete(item);
    this.withHtmlItem(item, function(htmlItem){htmlItem.removeClassName(htmlClass)})
  },
  
  getItemHtmlClasses: function(item){
   this.itemsHtmlClasses[item.id] = this.itemsHtmlClasses[item.id] || [];
   return this.itemsHtmlClasses[item.id];
  },
  
  
  
  
  onParentDoubleClick: function(event){
    var item = this.findModel(event.srcElement, this.itemClass);
    
    if (item && this.onDoubleClick){
      this.onDoubleClick(item, event);
    }
  },
  
  onParentMouseDown: function(event){
    if (event.which == 1)
      this.mousePressed = true;
    
    var item = this.findModel(event.srcElement, this.itemClass);
    if (!item) return;
    
    if (event.button == 2 && this.onRightClick)
      this.onRightClick(item, event);
    
    if (!this.itemSelected(item) && !event.ctrlKey)
      this.onItemClick(item, event);
  },
  
  onParentMouseUp: function(event){
    if (event.which == 1)
      this.mousePressed = false;
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
  
  onParentMouseMove: function(event){
    if (this.mousePressed && this.onStartDrag) {
      this.onStartDrag();
      this.mousePressed = false;
    }
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
      this.addSelectItem(this.model.itemAt(itemIndex))
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
