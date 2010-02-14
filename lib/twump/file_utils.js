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
