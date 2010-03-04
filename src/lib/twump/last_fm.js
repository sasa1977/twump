LastFm = Class.create();
LastFm.prototype = {
  initialize: function(userData, logger) {
    this.userData = userData;
    this.logger = logger || {log: function(){}}
    this.initializeConnection();
  },
  
  initializeConnection: function(){
    this.handshake({
      onSuccess: function(sessionData){
        this.sessionData = sessionData;
      }.bind(this)
    })
  },
  
  handshake: function(options){
    if (!this.userData) return;

    this.logger.log("handshaking")
  
    var timestamp = Math.round(new Date().getTime() / 1000).toString();
       
    var authParams = {
      hs: true, p: "1.2.1", c: "twm", v: "0.1", u: this.userData.login, t: timestamp
    }
    authParams.a = hex_md5(hex_md5(this.userData.password) + timestamp)
    
    new Ajax.Request('http://post.audioscrobbler.com',{
      method: 'get',
      parameters: authParams,
      onSuccess: function(response){
        var responseParts = response.responseText.split("\n");
        if (responseParts[0] == "OK"){
          options.onSuccess({
            sessionId: responseParts[1],
            nowPlayingUrl: responseParts[2],
            submissionUrl: responseParts[3]
          })
          
          this.logger.log("handshaked")
        }
      }.bind(this)
    })
  },
  
  nowPlaying: function(data){
    if (!this.sessionData) return;
    
    new Ajax.Request(this.sessionData.nowPlayingUrl, {
      method: 'post',
      parameters: {s: this.sessionData.sessionId, a: data.performer, t: data.name},
      onSuccess: function(response){}.bind(this)
    })
  },
  
  scrobbleQueued: function(){ 
    if (!this.sessionData || !this.scrobbleLength) return;
    
    if (this.scrobbledAt != null && (new Date() - this.scrobbledAt) / 1000 < 60) {
      this.logger.log("skipping scrobbling")
      return;
    }
      
    this.scrobbledAt = new Date();
    
    var params = ""
    for (param in this.scrobbleParameters){
      params += param + "=" + this.scrobbleParameters[param].toString() + "\n";
    }
    
    this.logger.log("scrobbling\n" + params);
    
    req = new Ajax.Request(this.sessionData.submissionUrl, {
      method: 'post',
      parameters: Object.extend({s: this.sessionData.sessionId}, this.scrobbleParameters),
      
      onSuccess: function(response){
        this.scrobbledAt = null;
        
        this.logger.log("Scrobble response:\n" + response.responseText)
        
        var responseParts = response.responseText.split("\n");
        if (responseParts[0] == "OK"){
          this.scrobbleLength = 0;
          this.scrobbleParameters = {};
          
          this.logger.log("scrobbled");
        }
      }.bind(this),
      
      onFailure: function(response){
        this.scrobbledAt = null;
      }.bind(this)
    })
  },
  
  pushForScrobble: function(data){
    if (!this.sessionData) return;
    
    this.scrobbleLength = this.scrobbleLength || 0;
    if (this.scrobbleLength == 50) {
      this.scrobbleLength = 0;
      this.scrobbleParameters = {};
    }
    
    var scrobbleRow = {
      a: data.performer, t: data.name,i: data.startedPlaying, o: "P", l: parseInt(data.length), 
      r: "", b: "", n: "", m: ""
    };
    
    this.scrobbleParameters = Object.extend(this.scrobbleParameters || {}, this.mapForScrobble(scrobbleRow))
    
    this.scrobbleLength++;
    
    this.logger.log("queued for scrobble " + data.performer + " - " + data.name + "\nscrobble length = " + this.scrobbleLength);
    
    if ((this.scrobbleLength % 3) == 0)
      this.initializeConnection();
  },
  
  mapForScrobble: function(data){
    var result = {}
    
    for (var sourceProperty in data){
      var targetProperty = sourceProperty + "[" + this.scrobbleLength + "]";
      result[targetProperty] = data[sourceProperty];
    }
    
    return result;
  }
}
