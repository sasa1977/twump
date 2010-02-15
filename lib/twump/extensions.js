////////////////////////////////////////////////////////////
// String
String.prototype.capitalizeEachWord = function(){
  return this.underscore().dasherize().capitalize().camelize();
}

String.prototype.pad = function(l, s, t){
  if (this.length > l)
    return this.substring(0, l);
	return s || (s = " "), (l -= this.length) > 0 ? (s = new Array(Math.ceil(l / s.length)
		+ 1).join(s)).substr(0, t = !t ? l : t == 1 ? 0 : Math.ceil(l / 2))
		+ this + s.substr(0, l - t) : this;
};

String.prototype.padLeft = function(l, ch){ return this.pad(l, ch || " ", 1) }
String.prototype.padRight = function(l, ch){ return this.pad(l, ch || " ", 0) }
String.prototype.padCenter = function(l){ return this.pad(l, " ", 2) }


////////////////////////////////////////////////////////////
// Number
Number.prototype.secondsToTimeString = function(){
  var minutes = parseInt(this / 60);
  var seconds = parseInt(this) % 60;
  return minutes.toString().padRight(2, '0') + ":" + seconds.toString().padRight(2, '0');
}

////////////////////////////////////////////////////////////
// Array
Array.prototype.shuffle = function(from){
  from = from || 0

  var fixedPart = this.slice(0, from);
  var variablePart = this.slice(from)
  
  return fixedPart.concat(
    variablePart.sortBy(function(x){
      return Math.random()
    })
  )
}


Array.prototype.insertArrayAt = function(index, data){
  var firstPart = this.slice(0, index)
  var lastPart = this.slice(index)
  return firstPart.concat(data).concat(lastPart);
}


////////////////////////////////////////////////////////////
// air.File
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

