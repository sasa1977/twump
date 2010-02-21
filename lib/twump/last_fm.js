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
    if (!this.sessionData || !data.metadata) return;
    if (data.metadata.name.length == 0 || data.metadata.performer.length == 0) return;
    
    new Ajax.Request(this.sessionData.nowPlayingUrl, {
      method: 'post',
      parameters: {s: this.sessionData.sessionId, a: data.metadata.performer, t: data.metadata.name},
      onSuccess: function(response){
        air.trace(response.responseText)
        air.trace(new Date())
      }.bind(this)
    })
  }
}
