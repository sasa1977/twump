Twump.View.Songlist = Class.create();

Object.extend(Twump.View.Songlist.prototype, Twump.View.Common);

Object.extend(Twump.View.Songlist.prototype, {
  initialize: function(options){
    Object.extend(this, options);
  
    document.body.addEventListener('click', this.onBodyClick.bind(this))
    
    this.addEventListener('songlist', 'mouseover')
    this.addEventListener('songlist', "dragover")
    
    new Tooltip('songlist', 'tooltip');
    
    this.list = new Twump.View.LargeList({
      parentElement: $('songlist'), itemClass: 'songlistItem',
      template: this.songlistTemplate,
      pageScroller: new Twump.View.PageScroller('pageProgress')
    });
    
    this.list.onDoubleClick = this.onItemDoubleClick.bind(this);
    this.list.onRightClick = this.onItemRightClick.bind(this);
    this.list.onStartDrag = this.onStartDrag.bind(this);
    this.list.onPageChanged = function(files){this.onPageChanged(files)}.bind(this);
  },
  
  onSonglistMouseover: function(event){
    var tooltipText = ''
      
    var file = this.list.findModel(event.srcElement);
    if (file)
      tooltipText = file.path;
      
    $('tooltip').update(tooltipText)
  },
  
  selectedItems: function(){
    return this.list.selectedItems;
  },
  
  selectItem: function(file){
    this.list.selectItem(file)
  },
  
  onItemDoubleClick: function(item, event){
    if (this.onItemSelected)
      this.onItemSelected(item);
  },
  
  onBodyClick: function(event){
    this.closeContextMenu();
  },
  
  display: function(playlist){
    playlist.item = playlist.file;
    playlist.itemAt = playlist.fileAt;
    this.list.setModel(playlist);

    this.displayPage(playlist.page({start: 0, range: this.pageLength}))
  },
  
  displayed: function(file){
    return this.list.displayed(file);
  },
  
  pageLength: 18,
  
  maxPages: function(){
    return (this.list.model.length() - this.pageLength);
  },
  
  displayPage: function(page){
    this.list.setPage({page: page, maximum: this.maxPages(), itemsInViewPort: this.pageLength});
    this.notifyViewportChange(page);
  },
  
  bringToFocus: function(file){
    this.displayPage(this.list.model.pageAround({file: file, range: this.pageLength}))
  },
  
  refreshCurrentPage: function(){
    this.displayPage(this.list.pageScroller.getPage());
  },
  
  notifyViewportChange: function(bounds){
    if (this.onScrollChanged)
      this.onScrollChanged(this.list.model.items(bounds))
  },
  
  onItemRightClick: function(item, event){
    this.openContextMenu(item, event)
  },
  
  openContextMenu: function(item, event){
    var contextMenu = $('songlistContextMenu')
    contextMenu.show();
    Position.absolutize(contextMenu);
    contextMenu.style.top = event.clientY.toString() + "px";
    contextMenu.style.left = event.clientX.toString() + "px";
    
    this.relatedContextMenuItem = item;
  },
  
  closeContextMenu: function(){
    $('songlistContextMenu').hide();
  },
  
  songlistTemplate: TrimPath.parseTemplate(" \
    <table cellspacing='0' cellpadding='0' border='0'> \
      <tbody id='itemsParent'> \
        {for file in items} \
          <tr class='songlistItem' itemId='${file.id}'>\
            <td>\
              <div class='index'> \
                ${model.indexOf(file)+1}. \
              </div> \
            </td> \
            <td> \
              <div class='title'> \
                <nobr> \
                  ${file.displayName} \
                </nobr>\
              </div> \
            </td> \
            <td class='length'> \
              ${file.displayLength()}\
            </td> \
          </tr> \
        {/for} \
      </tbody> \
     </table> \
  "),
 
  refreshItem: function(file){
    var element = this.list.htmlItem(file);
    if (!element) return;
    
    element.getElementsBySelector('.title')[0].update("<nobr>" + file.displayName + "</nobr>")
    element.getElementsBySelector('.length')[0].update(file.displayLength() || "")
  },
  
  onSonglistDragover: function(event){
    this.itemUnderMouseIndex = this.list.findModel(event.srcElement);
  },
  
  onStartDrag: function(){
    if (this.dragCode)
      Twump.Api.startDrag("twump:" + this.dragCode);
  }
});
