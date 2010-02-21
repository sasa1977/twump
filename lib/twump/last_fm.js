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
  
  nowPlaying: function(file){
    if (!this.sessionData || !file.metadata) return;
    if (file.metadata.name.length == 0 || file.metadata.performer.length == 0) return;
    
    new Ajax.Request(this.sessionData.nowPlayingUrl, {
      method: 'post',
      parameters: {s: this.sessionData.sessionId, a: file.metadata.performer, t: file.metadata.name},
      onSuccess: function(response){
      }.bind(this)
    })
  },
  
  scrobble: function(file, data){
    return; // currently not working, so it is disabled
  
    if (!this.sessionData || !file.metadata) return;
    if (file.metadata.name.length == 0 || file.metadata.performer.length == 0) return;
    
    air.trace('scrobbling')
    
    var params = {s: this.sessionData.sessionId, "a[0]": file.metadata.performer, "t[0]": file.metadata.name,
        "i[0]": data.startedPlaying, "o[0]": "P", "l[0]": data.length.toString(), "r[0]": "", "b[0]": "", "n[0]": "", "m[0]": ""
    };
    
    req = new Ajax.Request(this.sessionData.submissionUrl, {
      method: 'post',
      parameters: params,
      
      onSuccess: function(response){
        air.trace(response.responseText)
      }.bind(this),
      
      onFailure: function(response){
        air.trace(response.responseText)
      }.bind(this)
    })
  }
}
