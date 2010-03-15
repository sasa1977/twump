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
      file.removeEventListener(air.Event.SELECT, arguments.callee);
      options.onSelect(this.collectMusicPaths(air.File.getFilesRecursive(event.target.nativePath)))
    }.bind(this));
    
    file.browseForDirectory('Select folder');
  },
  
  browseForSave: function(options){
    this.initFileForOpenSave(options).browseForSave("Save as");
  },
  
  browseForOpen: function(options){
    this.initFileForOpenSave(options).browseForOpen("Open file", 
      [new air.FileFilter("M3U playlist", "*.m3u")]
    );
  },
  
  _addEventListener: function(object, eventId, callback){
    object.addEventListener(eventId, function(event){
      object.removeEventListener(eventId, arguments.callee);
      callback(event);
    })
  },
  
  initFileForOpenSave: function(options){
    var file = new air.File(options.startIn);
    this._addEventListener(file, air.Event.SELECT, function(event){options.onSelect(event.target)})
    return file;
  },
  
  collectMusicPaths: function(paths){
    return paths.map(function(fileName){
      return (fileName.toLowerCase().endsWith('.mp3')) ? fileName : null;
    }.bind(this)).compact();
  },
  
  startDrag: function(data){
    var clipboard = new air.Clipboard();

    if (data.text)
      clipboard.setData(air.ClipboardFormats.TEXT_FORMAT, data.text)
      
    if (data.files){
      var files = data.files.inject(new runtime.Array(), function(memo, path){
        memo.push(new air.File(path));
        return memo;
      });
      
      clipboard.setData(air.ClipboardFormats.FILE_LIST_FORMAT, files);
    }
    
    var dragOptions = new air.NativeDragOptions();
    dragOptions.allowCopy = true;
    dragOptions.allowMove = false;
      
    air.NativeDragManager.doDrag(window.htmlLoader, clipboard, null, null, dragOptions);
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
    
    this._addEventListener(sound, air.Event.ID3, function(event){
      callback({name: event.target.id3.TIT2, performer: event.target.id3.TPE1});
      air.System.gc();
    })
    
    this._addEventListener(sound, air.Event.COMPLETE, function(event){
      callback({length: sound.length / 1000});
      sound = null;
      air.System.gc();
    })
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
  },
  
  parseVersionInfo: function(appXmlString){
    var appXml = new DOMParser();
    var xmlObject = appXml.parseFromString(appXmlString, "text/xml");
    var root = xmlObject.getElementsByTagName('application')[0];
    var appVersion = root.getElementsByTagName("version")[0];
    return appVersion.firstChild.data;
  },
  
  applicationDescriptor: function(){
    return air.NativeApplication.nativeApplication.applicationDescriptor;
  },
  
  currentApplicationVersion: function(){
    return this.parseVersionInfo(this.applicationDescriptor())
  },
  
  downloadRemoteBinary: function(url, target, callback){
    var urlStream = new air.URLStream(); 

    urlStream.addEventListener(air.Event.COMPLETE, function(){
      var bytes = new air.ByteArray();
      urlStream.readBytes(bytes, 0, urlStream.bytesAvailable)
      Twump.Storage.writeBytes(target, bytes);
      callback(target);
    });
    
    urlStream.load(new air.URLRequest(url)); 
  }
}



//////////////////////////////////////////////
// air extensions
air.File.getFilesRecursive = function(folders){
  folders = $A([folders]).flatten();

  // private local function
  var _getFilesRecursive = function(folder, container) {
    var currentFolder = new air.File(folder);
    
    if (currentFolder.isDirectory) {
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
    }
    else
      container.push(currentFolder.nativePath)
  };

  // top level code
  var fileList = []
  
  folders.each(function(folder){
    _getFilesRecursive.bind({_getFilesRecursive: _getFilesRecursive})(folder, fileList)
  });
  
  return fileList;
};


air.File.url = function(urlOrNativePath){
  var file = new air.File(urlOrNativePath);
  return file.url;
}



Twump.Api.Logger = {
  log: function(message){
    var myFile = air.File.applicationStorageDirectory.resolvePath("twump.log"); 
    var myFileStream = new air.FileStream(); 

    myFileStream.open(myFile, air.FileMode.APPEND);
    myFileStream.writeUTFBytes("-------\n" + new Date().toString() + "\n" + message + "\n");
    myFileStream.close();
  }
}
