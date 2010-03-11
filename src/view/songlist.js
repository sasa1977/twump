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
  
  display: function(options){
    this.displayOptions = options;
    
    options.playlist.item = options.playlist.file;
    options.playlist.itemAt = options.playlist.fileAt;
    this.list.setModel(options.playlist);

    this.displayPage(options.playlist.boundsFrom({start: options.start, range: 9}))
  },
  
  displayed: function(file){
    return this.list.displayed(file);
  },
  
  displayPage: function(bounds){
    this.list.setPage({page: bounds.start, maximum: this.displayOptions.playlist.length() - 18, itemsInViewPort: 18});
    this.notifyViewportChange(bounds);
  },
  
  refreshCurrentPage: function(){
    this.list.setMaximum(this.displayOptions.playlist.length() - 18);
  },
  
  notifyViewportChange: function(bounds){
    if (this.onScrollChanged)
      this.onScrollChanged(this.displayOptions.playlist.items(bounds))
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
