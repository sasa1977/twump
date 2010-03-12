Twump.Controller.LastFmMixin = {
  lastFmSetup: function(){
    var lastFmLoginData = null;
    
    if(confirm('last.fm?')){
      var login = Twump.Api.readEncrypted('lastFmLogin'), password = Twump.Api.readEncrypted('lastFmPassword');
      if (!login)
        lastFmLoginData = this.lastFmLogin();
      else {
        if (confirm(login + '?'))
          lastFmLoginData = {login: login, password: password};
        else
          lastFmLoginData = this.lastFmLogin();
      }
      
      if (lastFmLoginData) {
        Twump.Api.writeEncrypted('lastFmLogin', lastFmLoginData.login);
        Twump.Api.writeEncrypted('lastFmPassword', lastFmLoginData.password);
      }
    }
    
    this.lastFm = new LastFm(lastFmLoginData, this.logger);
  },
  
  lastFmLogin: function(){
    var login = prompt('login');
    if (!login) return null;
    
    var password = prompt('password');
    if (!password) return null;
    
    return {login: login, password: password}
  },
  
  lastFmPlayProgress: function(data){
    if (!this.scrobbleCurrentPossible()) return;
  
    if (this.progressStep == 0)
      this.lastFmNowPlaying();

    this.progressStep = (this.progressStep + 1) % 10;
    
    if (!this.startedPlaying)
        this.startedPlaying = Math.round(new Date().getTime() / 1000);
    
    if (this.readyForScrobble(data))
      this.scrobbleCurrent(data);
  },
  
  lastFmNowPlaying: function(){
    this.lastFm.nowPlaying(this.playlist.currentFile().metadata)
  },
  
  scrobbleCurrent: function(data){
    var file = this.playlist.currentFile();
    
    var arg = Object.extend({startedPlaying: this.startedPlaying}, data);
    Object.extend(arg, this.playlist.currentFile().metadata)
    
    this.lastFm.pushForScrobble(arg)
    this.scrobbledCurrent = true;
  },
  
  scrobbleCurrentPossible: function(){
    var file = this.playlist.currentFile();
    return (file.metadata && 
      file.metadata.name && file.metadata.name.length > 0 && 
      file.metadata.performer && file.metadata.performer.length > 0
    );
  },
  
  readyForScrobble: function(playingData){
    return (
      this.scrobbleCurrentPossible() && !this.scrobbledCurrent &&
      (playingData.position > 240 || playingData.position >= playingData.length / 2)
    )
  }
}
