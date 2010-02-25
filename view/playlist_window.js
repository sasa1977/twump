Twump.View.PlaylistWindow = Class.create();

Object.extend(Twump.View.PlaylistWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.PlaylistWindow.prototype, {
  initialize: function(){
    this.addEventListener('playlist', 'mouseover');
    this.addEventListener('copyPathToClipboard', 'click');
    
    document.body.addEventListener('click', this.onBodyClick.bind(this))
    
    this.playingParts = {};
    new PeriodicalExecuter(this.scrollWatcher.bind(this), 5);
    
    this.list = new Twump.List({
      parentElement: $('playlist'), itemClass: 'playlistItem'
    });
    
    this.list.onDoubleClick = this.onItemDoubleClick.bind(this);
    this.list.onRightClick = this.onItemRightClick.bind(this);
  },
  
  selectedIds: function(){
    return this.list.selectedItems.map(function(item){
      return item.getAttribute('fileId');
    }.bind(this))
  },
  
  selectItem: function(id){
    this.list.selectItem($('playlistItem' + id))
  },
  
  onItemDoubleClick: function(item, event){
    this.onItemSelected(item.getAttribute('fileId'));
  },
  
  onBodyClick: function(event){
    this.closeContextMenu();
  },
  
  onCopyPathToClipboardClick: function(){
    this.onCopyPathToClipboard(this.relatedContextMenuItem.getAttribute('fileId'));
  },
  
  scrollWatcher: function(){
    if (this.playlist.empty()) return;
  
    var playlistEl = $('playlist');
    var itemsParent = $('itemsParent');
    
    if (!itemsParent.children || itemsParent.children.length == 0) return;
    
    var itemHeight = itemsParent.children[0].clientHeight;
    
    var startIndex = Math.floor(playlistEl.scrollTop / itemHeight);
    var endIndex = Math.ceil((playlistEl.scrollTop + playlistEl.clientHeight) / itemHeight);
    endIndex = Math.min(itemsParent.children.length - 1, endIndex);

    var ids = []
    for (var index = startIndex;index <= endIndex;index++)
      ids.push(this.itemId(itemsParent.children[index]))

    this.onScrollChanged({ids: ids})
  },
  
  itemId: function(item){
    return $(item).getAttribute('fileId');
  },
  
  display: function(playlist, options){
    this.displayOptions = options;
    
    $('playlist').update(this.playlistHtml(playlist, options));
    
    $$('.playlistItem').each(function(el){
      el.addEventListener("dragover", this.onPlaylistItemOver.bind(this))
    }.bind(this));
    
    this.drawCurrentPlayingItem();
    
    this.playlist = playlist;
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
  
  playlistHtml: function(playlist, options){
    return this.playlistTemplate.process({playlist: playlist, files: playlist.filesAround(options)})
  },
  
  playlistTemplate: TrimPath.parseTemplate(" \
    <table cellspacing='0' cellpadding='0' border='0'> \
      <tbody id='itemsParent'> \
        {for file in files} \
          <tr class='playlistItem' id='playlistItem${file.id}' fileId='${file.id}'>\
            <td>\
              ${playlist.indexOf(file)+1}. \
            </td> \
            <td width='*'> \
              <div class='title'> \
                <nobr> \
                  ${file.displayName()} \
                </nobr> \
              </div>\
            </td> \
          </tr> \
        {/for} \
      </tbody> \
     </table> \
  "),
 
  refreshItem: function(file){
    var element = $('playlistItem' + file.id);
    if (!element) return;
    
    element.getElementsBySelector('.title')[0].update("<nobr>" + file.displayName() + "</nobr>")
  },
  
  setPlayingItem: function(file){
    if (!this.displayOptions || !this.playlist) return;
    
    var index = this.playlist.indexOf(file);
    
    this.displayOptions.index = index;
    this.display(this.playlist, this.displayOptions);

    if (this.playingItem)
      this.playingItem.removeClassName('playing');

    this.playingFile = file;
    this.drawCurrentPlayingItem();
  },
  
  drawCurrentPlayingItem: function(){
    if (!this.playingFile) return;
  
    this.playingItem = $('playlistItem' + this.playingFile.id);
    if (!this.playingItem) return;
    
    this.playingItem.addClassName('playing')
    this.showInView(this.playingItem)
  },
    
  showInView: function(el){
    if (!el) return;
  
    var viewTop = $('playlist').scrollTop;
    var viewHeight = $('playlist').clientHeight;
    var viewBottom = viewTop + viewHeight;
    var elTop = el.offsetTop;
    var elBottom = elTop + el.offsetHeight;
    
    if (elTop < viewTop || elBottom > viewBottom) {
      $('playlist').scrollTop = Math.max(elTop - parseInt(viewHeight / 2), 0);
    }
  },
  
  onPlaylistItemOver: function(event){
    var playlistItemEl = this.findItem(event.srcElement, 'playlistItem');
    if (playlistItemEl) {
      this.itemUnderMouseIndex = playlistItemEl.getAttribute('fileId');
    }
  },
  
  findItem: function(el, htmlClass){
    el = $(el)
    
    if (!el) return null;
    
    if (el.hasClassName(htmlClass)) return el;
    return this.findItem(el.parentElement, htmlClass);
  }
});
