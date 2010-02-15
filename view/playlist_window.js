Twump.View.PlaylistWindow = Class.create();
Twump.View.PlaylistWindow.prototype = {
  initialize: function(){},
  
  display: function(playlist){
    $('playlist').update(this.playlistHtml(playlist));
    
    if (this.selectedIndex)
      this.selectItem(this.selectedIndex);
  },
  
  playlistHtml: function(playlist){
    var html = "<table class='playlistTable'>";
    
    playlist.files.each(function(file, index){
      html +=
        "<tr class='playlistItem' id='playlistItem" + index + "'>" + 
          "<td>" + (index + 1) + "</td>" +
          "<td>" + file + "</td>"
        "</tr>";
    })
    
    html += "</table>";
    
    return html;
  },
  
  selectItem: function(index){
    if (this.selectedItem)
      this.selectedItem.removeClassName('selected')
  
    var el = $('playlistItem' + index);
    if (!el) return;
    
    el.addClassName('selected');
    this.showInView(el);

    this.selectedItem = el;
    this.selectedIndex = index;
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
  }
}
