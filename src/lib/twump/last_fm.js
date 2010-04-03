LastFm = Class.define({
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
  
  pauseOrResumeScrobble: function(){
    this.scrobblePaused = !this.scrobblePaused;
    return this.scrobblePaused;
  },
  
  connected: function(){
    return (this.sessionData != null);
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
          
          this.notify('Handshaked');
          
          this.logger.log("handshaked")
        }
      }.bind(this)
    })
  },
  
  nowPlaying: function(data){
    if (!this.sessionData || this.scrobblePaused) return;
    
    new Ajax.Request(this.sessionData.nowPlayingUrl, {
      method: 'post',
      parameters: {s: this.sessionData.sessionId, a: data.performer, t: data.name},
      onSuccess: function(response){}.bind(this)
    })
  },
  
  scrobbleQueued: function(){ 
    if (!this.sessionData || !this.scrobbleQueue.length || this.scrobblePaused) return;
    
    if (this.scrobbledAt != null && (new Date() - this.scrobbledAt) / 1000 < 60) {
      // no scrobbling in next 60 seconds unless scrobble succeeded
      this.logger.log("skipping scrobbling")
      return;
    }
      
    this.scrobbledAt = new Date();
    
    var scrobbleParameters = this.makeScrobbleParams();
    var scrobbleQueue = this.scrobbleQueue.clone(); // make local copy for subsequent removing from queue
    
    var params = ""
    for (param in scrobbleParameters){
      params += param + "=" + scrobbleParameters[param].toString() + "\n";
    }
    
    this.logger.log("scrobbling\n" + params);
    
    req = new Ajax.Request(this.sessionData.submissionUrl, {
      method: 'post',
      parameters: Object.extend({s: this.sessionData.sessionId}, scrobbleParameters),
      
      onSuccess: function(response){
        this.scrobbledAt = null;
        
        this.logger.log("Scrobble response:\n" + response.responseText)
        
        var responseParts = response.responseText.split("\n");
        if (responseParts[0] == "OK"){
          scrobbleQueue.each(function(element){
            this.scrobbleQueue.findAndDelete(element);
          }.bind(this));
          
          this.addLastScrobbled(scrobbleQueue);
          
          this.logger.log("scrobbled");
        }
      }.bind(this),
      
      onFailure: function(response){
        this.scrobbledAt = null;
      }.bind(this)
    })
  },
  
  scrobbleQueue: [],
  
  pushForScrobble: function(data){
    if (!this.sessionData || this.scrobblePaused) return;
    
    this.scrobbleQueue.push(data);
    
    this.logger.log("queued for scrobble " + data.performer + " - " + data.name + "\nscrobble length = " + this.scrobbleQueue.length);
    
    if ((this.scrobbleQueue.length % 3) == 0)
      this.initializeConnection();
  },
  
  mapForScrobble: function(data){
    return {
      a: data.performer, t: data.name,i: data.startedPlaying, o: "P", l: parseInt(data.length), 
      r: "", b: "", n: "", m: ""
    }
  },
  
  adjustPropertyNames: function(data, index){
    var result = {}
    
    for (var sourceProperty in data){
      var targetProperty = sourceProperty + "[" + index + "]";
      result[targetProperty] = data[sourceProperty];
    }
    
    return result;
  },
  
  makeScrobbleParams: function(){
    return this.scrobbleQueue.inject({}, function(memo, data, index){
      return Object.extend(memo, this.adjustPropertyNames(this.mapForScrobble(data), index));
    }.bind(this))
  },
  
  lastScrobbled: [],
  addLastScrobbled: function(justScrobbled){
    this.lastScrobbled = justScrobbled.reverse().map(function(scrobbled){
      return Object.extend(Object.clone(scrobbled), {scrobbledAt: new Date()})
    }).concat(this.lastScrobbled);
    
    this.lastScrobbled.splice(5); // keep only most recent items
  },
  
  notify: function(event) {
    var handler = this["on" + event];
    if (handler)
      handler();
  }
})
