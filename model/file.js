Twump.Model.File = Class.create();
Twump.Model.File.prototype = {
  initialize: function(data){
    Object.extend(this, data)
  },
  
  metadataLoaded: function(){
    return this.metadata != null;
  },
  
  displayName: function(){
    if (!this.metadata) return this.name;
    
    this.metadata.name = this.metadata.name || ""
    this.metadata.performer = this.metadata.performer || ""
    
    if (this.metadata.name.length == 0 && this.metadata.performer.length == 0) return this.name;
    
    var parts = []
    
    if (this.metadata.performer.length > 0) parts.push(this.metadata.performer)
    if (this.metadata.name.length > 0) parts.push(this.metadata.name)
    
    return parts.join(" - ")
  },
  
  match: function(regex){
    var searchParts = [this.path];
    if (this.metadataLoaded()) searchParts.push(this.metadata.name, this.metadata.performer);

    return searchParts.join(" ").match(regex);
  }
}
