Twump.Storage = {}
Twump.Storage.Binary = Class.create();
Twump.Storage.Binary.prototype = {
  initialize: function(){},

  writeAppData: function(file, object){
    var file = air.File.applicationStorageDirectory.resolvePath(file);
    var stream = new air.FileStream();
    stream.open(file, air.FileMode.WRITE);
    stream.writeObject(object)
    stream.close();
  },
  
  readAppData: function(file, object){
    var file = air.File.applicationStorageDirectory.resolvePath(file);
    
    if (!file.exists) return;
    
    var stream = new air.FileStream();
    
    stream.open(file, air.FileMode.READ);
    var result = stream.readObject();
    stream.close();
    return result;
  }
}
