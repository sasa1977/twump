Twump.View.MainWindow = Class.create();
Object.extend(Twump.View.MainWindow.prototype, Twump.View.Common);
Object.extend(Twump.View.MainWindow.prototype, Twump.View.ResizeableSonglist);
Object.extend(Twump.View.MainWindow.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.insertHeader('player');
    this.initResizeableSonglist(this.playlistWindow, ['player', 'header', 'resize', 'statusBar']);
  },
  
  showLastFmLogin: function(login){
    $('lastFmStatus').update('Scrobbling as ' + login)
  },
  
  clearLastFmLogin: function(){
    $('lastFmStatus').update();
  }
})