Twump.Controller.LastFmMixin = {
  initLastFm: function(){
    var lastFmLoginData = null;
    
    var login = Twump.Api.readEncrypted('lastFmLogin'), password = Twump.Api.readEncrypted('lastFmPassword');
    
    loginData = (login && login.length && password && password.length) ?
      {login: login || "", password: password || ""} :
      null;
    
    this.setLastFmLogin(loginData)
  },
  
  setLastFmLogin: function(loginData){
    Twump.Api.writeEncrypted('lastFmLogin', loginData ? loginData.login : "");
    Twump.Api.writeEncrypted('lastFmPassword', loginData ? loginData.password : "");
    this.lastFm = new LastFm(loginData, this.logger);
    this.lastFm.onHandshaked = this.onLastFmHandshaked.bind(this);
    this.mainWindow.clearLastFmLogin();
  },
  
  lastFmLoginData: function(){
    return this.lastFm.userData;
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
    this.lastFm.nowPlaying(this.playlist.currentSong().metadata);
  },
  
  scrobbleCurrent: function(data){
    var arg = Object.extend({startedPlaying: this.startedPlaying}, data);
    Object.extend(arg, this.playlist.currentSong().metadata)
    
    this.lastFm.pushForScrobble(arg)
    this.scrobbledCurrent = true;
  },
  
  scrobbleCurrentPossible: function(){
    var song = this.playlist.currentSong();
    return (song.metadata && 
      song.metadata.name && song.metadata.name.length > 0 && 
      song.metadata.performer && song.metadata.performer.length > 0
    );
  },
  
  readyForScrobble: function(playingData){
    return (
      this.scrobbleCurrentPossible() && !this.scrobbledCurrent &&
      (playingData.position > 240 || playingData.position >= playingData.length / 2)
    )
  },
  
  onLastFmHandshaked: function(){
    this.mainWindow.showLastFmLogin(this.lastFmLoginData().login)
  },
  
  onLastFmTooltip: function(){
    if (this.lastFm.connected())
      this.mainWindow.setLastFmTooltip(this.lastFm.lastScrobbled)
  },
  
  onLastFmStatusClick: function(){
    this.mainWindow.setScrobblingStatus({paused: this.lastFm.pauseOrResumeScrobble()})
  }
}
