///////////////////////////////////////////////////
// api wrapper
Twump.Api = {
  newWindow: function(options){
    var windowOptions = new air.NativeWindowInitOptions();
    windowOptions.systemChrome = "none";
    windowOptions.type = "lightweight";
    windowOptions.transparent = false;
    
    var windowBounds = new air.Rectangle(200,250,600,400);
    
    var newHTMLLoader = air.HTMLLoader.createRootWindow(
       true, windowOptions, true, windowBounds);
       
    newHTMLLoader.load(new air.URLRequest(options.url));
    newHTMLLoader.window.options = options;
    
    return newHTMLLoader;
  },
  
  openFolder: function(options){
    var file = new air.File(); 
    file.addEventListener(air.Event.SELECT, function(event){
      options.onSelect(this.collectMusicPaths(air.File.getFilesRecursive(event.target.nativePath)))
    }.bind(this)); 
    file.browseForDirectory('Select folder');
  },
  
  collectMusicPaths: function(paths){
    return paths.map(function(fileName){
      return (fileName.toLowerCase().endsWith('.mp3')) ? fileName : null;
    }.bind(this)).compact();
  },
  
  startDrag: function(data){
    var clipboard = new air.Clipboard();
    clipboard.setData(air.ClipboardFormats.TEXT_FORMAT, data)
    air.NativeDragManager.doDrag(window.htmlLoader, clipboard);
  },
  
  getDropData: function(event){
    return event.clipboard.getData(air.ClipboardFormats.TEXT_FORMAT);
  },
  
  fileName: function(path){
    return new air.File(path).name
  },
  
  sound: function(path){
    return new air.Sound(new air.URLRequest(air.File.url(path)))
  },
  
  songMetadata: function(path, callback){
    var sound = this.sound(path);
    
    sound.addEventListener(air.Event.ID3, function(event){
      callback({name: event.target.id3.TIT2, performer: event.target.id3.TPE1})
      sound.close();
      
      sound.removeEventListener(air.Event.ID3, arguments.callee);
      sound = null;
    });
  },
  
  writeEncrypted: function(key, value){
    var bytes = new air.ByteArray(); 
    bytes.writeUTFBytes(value.toString()); 
    air.EncryptedLocalStore.setItem(key, bytes);
  },
  
  readEncrypted: function(key){
    var storedValue = air.EncryptedLocalStore.getItem(key); 
    if (!storedValue) return null;
    
    return storedValue.readUTFBytes(storedValue.length);
  },
  
  copyTextToClipboard: function(text){
    air.Clipboard.generalClipboard.clear(); 
    air.Clipboard.generalClipboard.setData(air.ClipboardFormats.TEXT_FORMAT, text, false);
  }
}



//////////////////////////////////////////////
// air extensions
air.File.getFilesRecursive = function(folder){
  // private local function
  var _getFilesRecursive = function(folder, container) {
    var currentFolder = new air.File(folder);
    var files = $A(currentFolder.getDirectoryListing());
    
    files.each(function(file){
      if (file.isDirectory) {
        if (file.name !="." && file.name !="..") {
          this._getFilesRecursive(file.nativePath, container);
        }
      } 
      else
        container.push(file.nativePath);
    }.bind(this));
  };

  // top level code
  var fileList = []
  _getFilesRecursive.bind({_getFilesRecursive: _getFilesRecursive})(folder, fileList)
  return fileList;
};


air.File.url = function(urlOrNativePath){
  var file = new air.File(urlOrNativePath);
  return file.url;
}

