Twump.Controller.Updater = {
  shouldUpdate: function(callback){
    new Ajax.Request('http://github.com/downloads/sasa1977/twump/app.xml',{
      onSuccess: function(response){
        var currentVersion = Twump.Api.currentApplicationVersion();
        var remoteVersion = Twump.Api.parseVersionInfo(response.responseText);
        
        if (this.newVersion(currentVersion, remoteVersion)){
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
  },
  
  newVersion: function(currentVersion, remoteVersion){
    var versionParts = remoteVersion.split('.');
    var currentVersionParts = currentVersion.split('.')
    
    var result = false;
    
    versionParts.each(function(part, index){
      var originalPart = currentVersionParts[index] || "";
      var len = Math.max(part.length, originalPart.length)
      
      part = part.padRight(len, "0");
      originalPart = originalPart.padRight(len, "0")
      
      if (part != originalPart) {
        result = part > originalPart;
        throw $break;
      }
    })
    
    return result;
  }
}
