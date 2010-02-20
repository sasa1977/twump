Twump.View.PlaylistWindow = Class.create();

Object.extend(Twump.View.PlaylistWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.PlaylistWindow.prototype, {
  initialize: function(){
    this.addEventListener('playlist', 'mouseover');
    this.selectionInfo = {};
  },
  
  display: function(playlist){
    $('playlist').update(this.playlistHtml(playlist));
    
    this.drawCurrentSelection();
      
    $$('.playlistItem').each(function(el){
      el.addEventListener("dragover", this.onPlaylistItemOver.bind(this))
    }.bind(this))
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
        <td> \
          {var index = 0}\
          {for file in playlist.files} \
            <div class='playlistItem' id='playlistItem${file.id}' fileId='${file.id}'> \
              <nobr> \
                ${file.name} \
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
  element.update(file.displayName())
 },
  
  selectItem: function(file, index){
    this.deselectCurrent();
    this.selectItemPart('playlistItem', file.id);
    this.selectItemPart('playlistOrdinal', index);
    this.drawCurrentSelection();
  },
  
  selectItemPart: function(prefix, suffix){
    this.selectionInfo[prefix] = suffix;
  },
  
  currentSelectionPartElement: function(prefix){
    var suffix = this.selectionInfo[prefix];
    if (suffix == null) return null;

    return $(prefix + suffix);
  },
  
  deselectCurrent: function(){
    for (prefix in this.selectionInfo){
      var element = this.currentSelectionPartElement(prefix);
      if (!element) return;
      
      element.removeClassName('selectedPlaylistItem');
      this.selectionInfo[prefix] = null
    }
  },
  
  drawCurrentSelection: function(){
    for (prefix in this.selectionInfo){
      var element = this.currentSelectionPartElement(prefix);
      if (!element) continue;
    
      element.addClassName('selectedPlaylistItem');
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
