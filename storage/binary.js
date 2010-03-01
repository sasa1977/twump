Twump.Storage = {}
Twump.Storage.Binary = Class.create();
Twump.Storage.Binary.prototype = {
  initialize: function(){},

  writeAppData: function(path, object){
    this.writeData(
      air.File.applicationStorageDirectory.resolvePath(path),
      object
    )
  },
  
  readAppData: function(path, object){
    return this.readData(air.File.applicationStorageDirectory.resolvePath(path))
  },
  
  readData: function(file, object){
    if (!file.exists) return;
    
    var stream = new air.FileStream();
    
    stream.open(file, air.FileMode.READ);
    var result = stream.readObject();
    stream.close();
    return result;
  },
  
  writeData: function(file, object){
    var stream = new air.FileStream();
    stream.open(file, air.FileMode.WRITE);
    stream.writeObject(object)
    stream.close();
  }
}



Twump.Storage.Text = Class.create();
Twump.Storage.Text.prototype = {
  initialize: function(){},
  
  writeData: function(file, data){
    var stream = new air.FileStream();
    stream.open(file, air.FileMode.WRITE);
    stream.writeUTFBytes(data);
    stream.close();
  },
  
  readData: function(file){
    var stream = new air.FileStream();
    stream.open(file, air.FileMode.READ);
    var result = stream.readUTFBytes(stream.bytesAvailable);
    stream.close();
    return result;
  }
}
