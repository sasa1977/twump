Twump.Storage = {
  initialize: function(){},

  appStorageFile: function(path){
    return air.File.applicationStorageDirectory.resolvePath(path);
  },
  
  readObject: function(file, object){
    if (!file.exists) return;
    
    var stream = new air.FileStream();
    
    stream.open(file, air.FileMode.READ);
    var result = stream.readObject();
    stream.close();
    return result;
  },
  
  writeObject: function(file, object){
    var stream = new air.FileStream();
    stream.open(file, air.FileMode.WRITE);
    stream.writeObject(object)
    stream.close();
  },
  
  writeUTF: function(file, data){
    var stream = new air.FileStream();
    stream.open(file, air.FileMode.WRITE);
    stream.writeUTFBytes(data);
    stream.close();
  },
  
  readUTF: function(file){
    var stream = new air.FileStream();
    stream.open(file, air.FileMode.READ);
    var result = stream.readUTFBytes(stream.bytesAvailable);
    stream.close();
    return result;
  }
}
