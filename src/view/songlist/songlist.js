Twump.View.Songlist = Class.define(
  Twump.View.Common,
  {
    initialize: function(options){
      Object.extend(this, options);
  
      document.body.addEventListener('click', this.onBodyClick.bind(this))
    
      this.addEventListener('songlist', 'mouseover')
      this.addEventListener('songlist', 'dragover')
    
      new Tooltip('songlist', 'tooltip');
    
      this.list = new Twump.View.LargeList({
        parentElement: $('songlist'), itemClass: 'songlistItem',
        template: this.songlistTemplate,
        pageScroller: new Twump.View.PageScroller('pageProgress')
      });
    
      this.list.onDoubleClick = this.onItemDoubleClick.bind(this);
      this.list.onRightClick = this.onItemRightClick.bind(this);
      this.list.onStartDrag = this.onStartDrag.bind(this);
      this.list.onDragFinished = this.onDragFinished.bind(this);
      this.list.onPageChanged = function(songs){
        if (this.onPageChanged)
          this.onPageChanged(songs)
      }.bind(this);
    },
  
    onSonglistMouseover: function(event){
      var tooltipText = ''
      
      var song = this.list.findModel(event.srcElement);
      if (song)
        tooltipText = song.path;
      
      $('tooltip').update(tooltipText)
    },
  
    selectedItems: function(){
      return this.list.selectedItems;
    },
  
    selectItem: function(song){
      this.list.selectItem(song)
    },
  
    onItemDoubleClick: function(item, event){
      if (this.onItemSelected)
        this.onItemSelected(item);
    },
  
    onBodyClick: function(event){
      this.closeContextMenu();
    },
  
    display: function(playlist){
      playlist.item = playlist.song;
      playlist.itemAt = playlist.songAt;
      this.list.setModel(playlist);

      this.displayPage(playlist.page({start: 0, range: this.pageLength}))
    },
  
    displayed: function(song){
      return this.list.displayed(song);
    },
  
    itemHeight: 15,
  
    normalizedHeight: function(requestedHeight){
      return Math.round(requestedHeight / this.itemHeight) * this.itemHeight;
    },
  
    pageLength: 18,
  
    maxPages: function(){
      return Math.max(0, this.list.model.length() - this.pageLength + 1);
    },
  
    onWindowSizeChanged: function(songlistHeight){
      $('songlist').style.height = songlistHeight.toString() + "px";
      $('pageProgress').style.height = songlistHeight.toString() + "px";
    
      this.pageLength = parseInt(songlistHeight / this.itemHeight);
      this.refreshCurrentPage();
    },
  
    displayPage: function(page){
      if (!this.list.model) return;
      
      if (page >= this.maxPages())
        page = Math.max(0, this.maxPages() - 1);
    
      this.resizeScroller();
      this.list.setPage({page: page, maximum: this.maxPages(), itemsInViewPort: this.pageLength});
    },
    
    resizeScroller: function(){
      var height = Math.max(20, this.list.pageScroller.dimensions().height - this.maxPages() * 10);
      this.list.pageScroller.slider().style.height = height.toString() + "px";
    },
  
    bringToFocus: function(song){
      this.displayPage(this.list.model.pageAround({song: song, range: this.pageLength}))
    },
  
    refreshCurrentPage: function(){
      this.displayPage(this.list.pageScroller.getPage());
    },
  
    onItemRightClick: function(item, event){
      if (this.contextMenuDescriptor)
        this.openContextMenu(event, this.contextMenuDescriptor, item)
    },
  
    songlistTemplate: TrimPath.parseTemplate(" \
      <table cellspacing='0' cellpadding='0' border='0'> \
        <tbody id='itemsParent'> \
          {for song in items} \
            <tr class='songlistItem' itemId='${song.id}'>\
              <td>\
                <div class='index'> \
                  ${model.indexOf(song)+1}. \
                </div> \
              </td> \
              <td> \
                <div class='title'> \
                  <nobr> \
                    ${song.displayName} \
                  </nobr>\
                </div> \
              </td> \
              <td class='length'> \
                ${song.displayLength()}\
              </td> \
            </tr> \
          {/for} \
        </tbody> \
       </table> \
    "),
 
    refreshItem: function(song){
      var element = this.list.htmlItem(song);
      if (!element) return;
    
      element.getElementsBySelector('.title')[0].update("<nobr>" + song.displayName + "</nobr>")
      element.getElementsBySelector('.length')[0].update(song.displayLength() || "")
    },
  
    onSonglistDragover: function(event){
      this.itemUnderMouseIndex = this.list.findModel(event.srcElement);
    
      this.list.removeHtmlClassFromAll('dropBefore')
      this.list.removeHtmlClassFromAll('dropAfter')
    
      if (this.itemUnderMouseIndex)
        this.list.setItemHtmlClass(this.itemUnderMouseIndex, 'dropBefore');
      else {
        var last = this.list.model.songs.last();
        if (last)
          this.list.setItemHtmlClass(last, 'dropAfter');
      }
    },
  
    onDragFinished: function(){
      this.list.removeHtmlClassFromAll('dropAfter')
      this.list.removeHtmlClassFromAll('dropBefore')
    },
  
    onStartDrag: function(){
      if (this.dragCode && this.selectedItems().length)
        Twump.Api.startDrag({text: "twump:" + this.dragCode, files: this.selectedPaths()});
    },
  
    selectedPaths: function(){
      return this.selectedItems().map(function(song){
        return song.path;
      })
    }
  }
);
