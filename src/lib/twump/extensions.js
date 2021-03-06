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
String.prototype.escapeForRegex = function(){
  var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g");
  return this.replace(specials, "\\$&");
}

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

Array.prototype.shuffleItems = function(indices){
  var result = this.clone();
  
  var items = result.itemsAt(indices);
  items = items.shuffle();
  indices.each(function(arrayPosition, indexIndex){
    result[arrayPosition] = items[indexIndex]
  })

  return result;
}

Array.prototype.itemsAt = function(indices){
  return indices.map(function(index){return this[index]}.bind(this))
}


Array.prototype.insertArrayAt = function(index, data){
  var firstPart = this.slice(0, index)
  var lastPart = this.slice(index)
  return firstPart.concat(data).concat(lastPart);
}

Array.prototype.findAndDelete = function(el){
  var position = this.indexOf(el);
  if (position >= 0)
    this.splice(position, 1);
}



////////////////////////////////////////////////////////////
// Date
Date.prototype.shortTime = function(){
  return this.getHours().toString().padRight(2, "0") + ":" + this.getMinutes().toString().padRight(2, "0")
}


////////////////////////////////////////////////////////////
// Object
Object.wrap = function(object, memberName, newValue){
  object[memberName + "Original"] = object[memberName];
  object[memberName] = newValue;
}


////////////////////////////////////////////////////////////
// Event
Object.extend(Event, {
  KEY_SPACE: 32
});


////////////////////////////////////////////////////////////
// Class
Class.define = function(){
  var klass = Class.create();
  for (var i = 0; i < arguments.length;i++)
    Object.extend(klass.prototype, arguments[i]);
  
  return klass;
}