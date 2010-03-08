Twump.View.EditorWindow = Class.create();

Object.extend(Twump.View.EditorWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.EditorWindow.prototype, {
  initialize: function(){
    this.insertHeader('editor');
    this.delayExecute = new Twump.Utils.DelayExecute(1000);

    this.addEventListener('filter', 'keydown');
    this.addEventListeners('click', ['remove', 'jumpTo']);
    
    document.body.addEventListener('click', this.onBodyClick.bind(this))
    
    this.list = new Twump.LargeList({
      parentElement: $('results'), itemClass: 'result',
      template: this.searchResultTemplate
    });
    
    this.list.onStartDrag = this.onStartDrag.bind(this);
    this.list.onRightClick = this.onItemRightClick.bind(this);
    $('filter').activate();
    
    this.pageSlider = this.initSlider('pageProgress', {min: 0, max: 0, direction: 'vertical',
      onchange: this.onPageSliderChange.bind(this)
    })
  },
  
  onPageSliderChange: function(){
    if (!this.pageSlider || this.ignorePageSliderChange) return;
    
    var page = this.pageSlider.getMaximum() - this.pageSlider.getValue();
    this.list.drawItems({start: page, end: page + 19});
  },
  
  selectedIds: function(){
    return this.selectedItems().map(function(item){
      return item.id;
    })
  },
  
  onItemRightClick: function(item, event){
    this.openContextMenu(item, event);
  },
  
  openContextMenu: function(item, event){
    var contextMenu = $('editorContextMenu')
    contextMenu.show();
    Position.absolutize(contextMenu);
    contextMenu.style.top = event.clientY.toString() + "px";
    contextMenu.style.left = event.clientX.toString() + "px";
    
    this.relatedContextMenuItem = item;
  },
  
  onBodyClick: function(){
    this.closeContextMenu();
  },
  
  closeContextMenu: function(){
    $('editorContextMenu').hide();
  },
  
  onFilterKeydown: function(){
    this.delayExecute.cancel();
    this.delayExecute.schedule(function(){
      this.onFilterChanged($('filter').value)
    }.bind(this))
  },
  
  renderSearchResults: function(results){
    this.list.deselectAllItems();
    
    results.item = results.file;
    results.itemAt = results.fileAt;
    this.list.setModel(results);
    
    this.ignorePageSliderChange = true;
    
    this.pageSlider.setMinimum(0);
    this.pageSlider.setMaximum(results.length() - 19);
    this.pageSlider.setValue(this.pageSlider.getMaximum());
    
    this.ignorePageSliderChange = false;
    
    this.list.drawItems({start: 0, end: 19});
  },
  
  searchResultTemplate: TrimPath.parseTemplate(" \
    {for file in items}\
      <div class='result' value='${file.path}' itemId='${file.id}'> \
        ${file.displayName} \
       </div> \
    {/for} \
  "),
  
  onStartDrag: function(){
    Twump.Api.startDrag("twump:reorderFromEditor");
  },
  
  selectedItems: function(){
    return this.list.selectedItems;
  }
});
