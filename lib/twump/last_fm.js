LastFm = Class.create();
LastFm.prototype = {
  initialize: function(userData) {
    this.userData = userData;
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
  
    var timestamp = Math.round(new Date().getTime() / 1000).toString();
       
    var authParams = {
      hs: true, p: "1.2.1", c: "tst", v: "1.0", u: this.userData.login, t: timestamp
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
        }
      }
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
    if (!this.sessionData && !this.scrobbleLength) return;
    
    req = new Ajax.Request(this.sessionData.submissionUrl, {
      method: 'post',
      parameters: Object.extend({s: this.sessionData.sessionId}, this.scrobbleParameters),
      
      onSuccess: function(response){
        var responseParts = response.responseText.split("\n");
        if (responseParts[0] == "OK"){
          this.scrobbleLength = 0;
          this.scrobbleParameters = {};
        }
      }.bind(this),
      
      onFailure: function(response){
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
      a: data.performer, t: data.name,i: data.startedPlaying, o: "P", l: data.length, 
      r: "", b: "", n: "", m: ""
    };
    
    this.scrobbleParameters = Object.extend(this.scrobbleParameters || {}, this.mapForScrobble(scrobbleRow))
    
    this.scrobbleLength++;
    
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
