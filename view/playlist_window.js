Twump.View.PlaylistWindow = Class.create();

Object.extend(Twump.View.PlaylistWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.PlaylistWindow.prototype, {
  initialize: function(){
    this.addEventListener('playlist', 'mouseover')
  },
  
  display: function(playlist){
    $('playlist').update(this.playlistHtml(playlist));
    
    if (this.selectedFile)
      this.selectItem(this.selectedFile);
      
    $$('.playlistItem').each(function(el){
      el.addEventListener("dragover", this.onPlaylistItemOver.bind(this))
    }.bind(this))
  },
  
  playlistHtml: function(playlist){
    return this.playlistTemplate.process({playlist: playlist})
  },
  
  playlistTemplate: TrimPath.parseTemplate(" \
    <table class='playlistTable'> \
      \
      {var index = 0}\
      {for file in playlist.files} \
        <tr class='playlistItem' id='playlistItem${file.id}' fileId='${file.id}'> \
          <td>${index +1}</td> \
          <td>${file.path}</td> \
        </tr> \
        {eval}index++{/eval}\
      {/for} \
    </table>\
 "),
  
  selectItem: function(file){
    if (this.selectedItem)
      this.selectedItem.removeClassName('selected')
  
    if (!file) return;
  
    var el = $('playlistItem' + file.id);
    if (!el) return;
    
    el.addClassName('selected');
    this.showInView(el);

    this.selectedItem = el;
    this.selectedFile = file;
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
  }
});

