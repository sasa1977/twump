Twump.View.MainWindow = Class.define(
  Twump.View.Common,
  Twump.View.ResizeableSonglist,
  {
    initialize: function(options){
      Object.extend(this, options);
    
      this.insertHeader('player');
      this.initResizeableSonglist(this.playlistWindow, ['player', 'header', 'resize', 'statusBar']);
    
      new Tooltip('lastFmStatus', 'tooltip');
    
      this.addEventListener('lastFmStatus', 'mouseover')
      this.addEventListener('lastFmStatus', 'click')
    },
  
    showLastFmLogin: function(login){
      $('lastFmStatus').update('Scrobbling as ' + login)
    },
  
    clearLastFmLogin: function(){
      $('lastFmStatus').update();
    },
  
    setScrobblingStatus: function(status){
      if (status.paused)
        $('lastFmStatus').addClassName('paused');
      else
        $('lastFmStatus').removeClassName('paused')
    },
  
    onLastFmStatusMouseover: function(event){
      this.onLastFmTooltip();
    },
  
    setLastFmTooltip: function(lastScrobbled){
      if (!lastScrobbled.length)
        $('tooltip').update('Nothing scrobbled yet.')
      else
        $('tooltip').update(this.lastFmHistoryTooltip.process({lastScrobbled: lastScrobbled}));
    },
  
    lastFmHistoryTooltip: TrimPath.parseTemplate(" \
      Last scrobbled: <br/> \
      <table cellpadding='0' cellspacing='0' border='0' \
        {for song in lastScrobbled} \
          <tr> \
            <td class='lastFmScrobbledEntry' width='*'> \
              ${song.performer} - ${song.name} \
            </td> \
            <td>&nbsp;</td> \
            <td> \
              <div class='lastFmScrobbledAt'>${song.scrobbledAt.shortTime()}</td> \
            </td>\
          </tr> \
        {/for} \
      </table> \
    ")
  }
)