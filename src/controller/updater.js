Twump.Controller.Updater = {
  shouldUpdate: function(callback){
    new Ajax.Request('http://github.com/sasa1977/twump/raw/build/build/app.xml',{
      onSuccess: function(response){
        var remoteVersion = Twump.Api.parseVersionInfo(response.responseText);
        var currentVersion = Twump.Api.currentApplicationVersion();

        if (remoteVersion != currentVersion || true){
          if (confirm(
            "New version is available.\n" +
            "Current version: " + currentVersion + "\n" +
            "New version:" + remoteVersion + "\n\n" +
            "Install?")
          ){
            callback(remoteVersion);
          }
        }
      }.bind(this)
    });
  },
  
  downloadRemote: function(remoteVersion){
    Twump.Api.downloadRemoteBinary(
      'http://github.com/sasa1977/twump/raw/build/build/twump.air',
      Twump.Storage.appStorageFile('twump.air'),
      function(file){
        this.doUpdate(file, remoteVersion)
      }.bind(this)
    )
  },
  
  doUpdate: function(file, remoteVersion){
    alert('Remote file downloaded. Setup will now start.\n');
    new air.Updater().update(file, remoteVersion)
  },
  
  update: function(){
    this.shouldUpdate(this.downloadRemote.bind(this))
  }
}
