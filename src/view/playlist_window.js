Twump.View.PlaylistWindow = Class.create();

Object.extend(Twump.View.PlaylistWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.PlaylistWindow.prototype, {
  initialize: function(){
    this.addEventListeners('click', ['copyPathToClipboard', 'deleteContext']);
    
    document.body.addEventListener('click', this.onBodyClick.bind(this))
    
    this.playingParts = {};
    
    this.addEventListener('playlist', 'mouseover')
    this.addEventListener('playlist', 'mousewheel')
    this.addEventListener('playlist', "dragover")
    
    new Tooltip('playlist', 'tooltip');

    
    this.list = new Twump.LargeList({
      parentElement: $('playlist'), itemClass: 'playlistItem',
      template: this.playlistTemplate
    });
    
    this.list.onDoubleClick = this.onItemDoubleClick.bind(this);
    this.list.onRightClick = this.onItemRightClick.bind(this);
    this.list.onStartDrag = this.onStartDrag.bind(this);
    
    this.pageSlider = this.initSlider('pageProgress', {min: 0, max: 0, direction: 'vertical',
      onchange: this.onPageSliderChange.bind(this)
    })
  },
  
  onPlaylistMouseover: function(event){
    
    var tooltipText = ''
      
    var file = this.list.findModel(event.srcElement);
    if (file)
      tooltipText = file.path;
      
    $('tooltip').update(tooltipText)
  },
  
  onPlaylistMousewheel: function(event){
    this.pageSlider.setValue( 
      Math.min(
        this.pageSlider.getMaximum(),
        Math.max(0, this.pageSlider.getValue() + event.wheelDeltaY / 120)
      )
    )
  },
  
  selectedItems: function(){
    return this.list.selectedItems;
  },
  
  selectedIds: function(){
    return this.selectedItems().map(function(item){
      return item.id;
    })
  },
  
  selectItem: function(file){
    this.list.selectItem(file)
  },
  
  onItemDoubleClick: function(item, event){
    this.onItemSelected(item.id);
  },
  
  onBodyClick: function(event){
    this.closeContextMenu();
  },
  
  onCopyPathToClipboardClick: function(){
    this.onCopyPathToClipboard(this.relatedContextMenuItem.id);
  },
  
  onDeleteContextClick: function(){
    this.onDeleteClick();
  },
  
  itemId: function(item){
    return $(item).getAttribute('fileId');
  },
  
  display: function(options){
    this.displayOptions = options;
    
    options.playlist.item = options.playlist.file;
    options.playlist.itemAt = options.playlist.fileAt;
    this.list.setModel(options.playlist);
    
    this.ignorePageSliderChange = true;
    
    this.pageSlider.setMinimum(0);
    this.pageSlider.setMaximum(options.playlist.length() - 2 * options.range);
    
    this.ignorePageSliderChange = false;

    if (!this.playingFile) return;

    var bounds = options.playlist.boundsAround(options);
    this.list.drawItems(bounds);
    
    this.pageSlider.setValue(this.pageSlider.getMaximum() - bounds.start);
    
    this.notifyViewportChange(bounds);
  },
  
  drawAround: function(pos){
    var bounds = this.displayOptions.playlist.boundsFrom({start: pos, range: this.displayOptions.range});
    this.list.drawItems(bounds);
    //this.notifyViewportChange(bounds);
  },
  
  notifyViewportChange: function(bounds){
    if (this.onScrollChanged)
      this.onScrollChanged(this.displayOptions.playlist.items(bounds))
  },
  
  onPageSliderChange: function(){
    if (!this.pageSlider || this.ignorePageSliderChange) return;
    this.drawAround(Math.max(0, this.pageSlider.getMaximum() - this.pageSlider.getValue()))
  },
  
  onItemRightClick: function(item, event){
    this.openContextMenu(item, event)
  },
  
  openContextMenu: function(item, event){
    var contextMenu = $('playListContextMenu')
    contextMenu.show();
    Position.absolutize(contextMenu);
    contextMenu.style.top = event.clientY.toString() + "px";
    contextMenu.style.left = event.clientX.toString() + "px";
    
    this.relatedContextMenuItem = item;
  },
  
  closeContextMenu: function(){
    $('playListContextMenu').hide();
  },
  
  playlistTemplate: TrimPath.parseTemplate(" \
    <table cellspacing='0' cellpadding='0' border='0'> \
      <tbody id='itemsParent'> \
        {for file in items} \
          <tr class='playlistItem' itemId='${file.id}'>\
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
  
  setPlayingItem: function(file){
    if (!this.displayOptions) return;
    
    this.displayOptions.file = file;
    this.playingFile = file;
    
    this.list.removeHtmlClassFromAll('playing');
    this.list.setItemHtmlClass(file, 'playing');
    this.display(this.displayOptions);
  },
  
  onPlaylistDragover: function(event){
    this.itemUnderMouseIndex = this.list.findModel(event.srcElement);
  },
  
  findItem: function(el, htmlClass){
    el = $(el)
    
    if (!el || !el.hasClassName) return null;
    
    if (el.hasClassName(htmlClass)) return el;
    return this.findItem(el.parentElement, htmlClass);
  },
  
  onStartDrag: function(){
    Twump.Api.startDrag("twump:reorderFromPlaylist");
  }
});
