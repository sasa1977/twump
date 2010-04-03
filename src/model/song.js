Twump.Model.Song = Class.define({
  initialize: function(data){
    Object.extend(this, data);
    if (!this.displayName)
      this.displayName = Twump.Api.fileName(this.path);
  },
  
  metadataLoaded: function(){
    return this.metadata != null;
  },
  
  addMetadata: function(metadata){
    this.metadata = this.metadata || {}
    Object.extend(this.metadata, metadata)
    
    $A(["name", "performer"]).each(function(field){
      var value = (this.metadata[field] || "").strip();
      if (value.length == 0)
        this.metadata[field] = null;
      else
        this.metadata[field] = value;
    }.bind(this));

    var displayName = [this.metadata.performer, this.metadata.name].compact().join(" - ");
    if (displayName.length > 0)
      this.displayName = displayName; 
  },
  
  displayLength: function(){
    if (!this.metadata || !this.metadata.length) return null;
    return this.metadata.length.secondsToTimeString();
  },
  
  match: function(regex){
    var searchParts = [this.path];
    if (this.metadataLoaded()) searchParts.push(this.metadata.name, this.metadata.performer);

    return searchParts.join(" ").match(regex);
  }
});
