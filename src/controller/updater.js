Twump.Controller.Updater = {
  shouldUpdate: function(callback){
    new Ajax.Request('http://github.com/downloads/sasa1977/twump/app.xml',{
      onSuccess: function(response){
        var currentVersion = Twump.Api.currentApplicationVersion();
        var remoteVersion = Twump.Api.parseVersionInfo(response.responseText);
        
        if (remoteVersion > currentVersion){
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
  
  updateFromLocal: function(){
    var updated = false;
  
    Twump.Api.getFilesRecursive(Twump.Storage.appStorageFile('.').nativePath).each(function(file){
      var updateVersion = file.match(/twump\-.+\.air/);
      if (updateVersion && updateVersion.length) {
        updateVersion = updateVersion[0].replace(/^twump\-/,'').replace(/\.air/,'')

        if (updateVersion > Twump.Api.currentApplicationVersion()) {
          this.doUpdate(file, updateVersion);
          updated = true;
          throw $break;
        }
        else
          Twump.Api.deleteFile(file);
      }
    }.bind(this))
    
    return updated;
  },
  
  downloadRemote: function(remoteVersion){
    Twump.Api.downloadRemoteBinary(
      'http://github.com/downloads/sasa1977/twump/twump-' + remoteVersion + '.air',
      Twump.Storage.appStorageFile('twump-' + remoteVersion + '.air'),
      function(file){
        alert('Update is downloaded and will be installed next time you start the application.');
      }.bind(this)
    )
  },
  
  doUpdate: function(file, version){
    alert('Updating to version ' + version);
    new Twump.Api.update(file, version)
  },
  
  update: function(){
    if (this.updateFromLocal()) return true;
  
    this.shouldUpdate(this.downloadRemote.bind(this))
  }
}
