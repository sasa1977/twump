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
    var playlistEl = $('playlist');
    var itemsParent = $('itemsParent');
    var itemHeight = $('playlistItem0').clientHeight;
    
    if (!itemsParent.children || itemsParent.children.length == 0) return;
    
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
  
  display: function(playlist){
    $('playlist').update(this.playlistHtml(playlist));
    
    this.drawPlayingItem();
      
    $$('.playlistItem').each(function(el){
      el.addEventListener("dragover", this.onPlaylistItemOver.bind(this))
      el.addEventListener("mousedown", this.onPlaylistItemMouseDown.bind(this))
    }.bind(this))
  },
  
  onPlaylistItemMouseDown: function(event){
    if (event.button == 2) {
      this.openContextMenu(event);
      return false;
    }
  },
  
  openContextMenu: function(event){
    var contextMenu = $('playListContextMenu')
    contextMenu.show();
    Position.absolutize(contextMenu);
    contextMenu.style.top = event.clientY.toString() + "px";
    contextMenu.style.left = event.clientX.toString() + "px";
    
    this.relatedContextMenuItem = this.findPlaylistItem(event.srcElement);
  },
  
  findPlaylistItem: function(el){
    if (!el) return null;
    
    var el = $(el)
    if (el.hasClassName('playlistItem')) return el;
    return this.findPlaylistItem(el.parentElement);
  },
  
  closeContextMenu: function(){
    $('playListContextMenu').hide();
  },
  
  playlistHtml: function(playlist){
    return this.playlistTemplate.process({playlist: playlist})
  },
  
  playlistTemplate: TrimPath.parseTemplate(" \
    <table cellspacing='0' cellpadding='0' border='0'> \
      <tr>\
        <td>\
          {var index = 0}\
          {for file in playlist.files} \
            <div id='playlistOrdinal${index}' style='text-align:right'>${index+1}.&nbsp;</div>\
            {eval}index++{/eval}\
          {/for} \
        </td> \
        <td id='itemsParent'> \
          {var index = 0}\
          {for file in playlist.files} \
            <div class='playlistItem' id='playlistItem${file.id}' fileId='${file.id}'> \
              <nobr> \
                ${file.displayName()} \
              </nobr> \
            </div>\
            {eval}index++{/eval}\
          {/for} \
        </td> \
      </tr> \
     </table> \
 "),
 
  refreshItem: function(file){
    var element = $('playlistItem' + file.id);
    if (!element) return;
    element.update("<nobr>" + file.displayName() + "</nobr>")
  },
  
  setPlayingItem: function(file, index){
    this.clearPlayingItem();
    this.setPlayingItemPart('playlistItem', file.id);
    this.setPlayingItemPart('playlistOrdinal', index);
    this.drawPlayingItem();
    
    this.showInView(this.playingPart('playlistItem'))
  },
  
  setPlayingItemPart: function(prefix, suffix){
    this.playingParts[prefix] = suffix;
  },
  
  playingPart: function(prefix){
    var suffix = this.playingParts[prefix];
    if (suffix == null) return null;

    return $(prefix + suffix);
  },
  
  clearPlayingItem: function(){
    for (prefix in this.playingParts){
      var element = this.playingPart(prefix);
      if (!element) return;
      
      element.removeClassName('playing');
      this.setPlayingItemPart(prefix, null);
    }
  },
  
  drawPlayingItem: function(){
    for (prefix in this.playingParts){
      var element = this.playingPart(prefix);
      if (!element) continue;
    
      element.addClassName('playing');
    }
  },
  
  showInView: function(el){
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
    var playlistItemEl = event.srcElement.parentElement;
    if (playlistItemEl.hasClassName('playlistItem')) {
      this.itemUnderMouseIndex = playlistItemEl.getAttribute('fileId');
    }
  },
  
  moveBefore: function(ids){
    if (!this.itemUnderMouseIndex) return;
    
    var targetElement = $('playlistItem' + this.itemUnderMouseIndex);
    var parentElement = targetElement.parentElement;
    
    ids.each(function(id){
      if (id == this.itemUnderMouseIndex) return;
      var elementToMove = $('playlistItem' + id);
      
      parentElement.insertBefore(elementToMove, targetElement)
    }.bind(this))
  }
});
