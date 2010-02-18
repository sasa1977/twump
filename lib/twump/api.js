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
}
