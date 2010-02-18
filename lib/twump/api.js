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

