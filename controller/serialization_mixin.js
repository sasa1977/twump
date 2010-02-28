Twump.Controller.Serialization = {}

Twump.Controller.Serialization.playlist = [
  {
    serializeData: function(data){
      return {list: data.playlist.paths(), current: data.currentIndex}
    },
    
    deserializeData: function(data){
      return {playlist: new Twump.Model.Playlist(data.list), currentIndex: data.current}
    }
  },
  
  {
    serializeData: function(data){
      return {listData: data.playlist.serializeData(this.version), current: data.currentIndex}
    },
    
    deserializeData: function(data){
      return {playlist: Twump.Model.Playlist.deserialize(this.version, data.listData), currentIndex: data.current}
    }
  }
]

Twump.Controller.Serialization.playlist.each(function(serializer, index){
  serializer.version = index;
})

Twump.Controller.SerializationMixin = {
  playlistSerializer: function(){
    return Twump.Controller.Serialization.playlist.last();
  },
  
  serializePlaylist: function(){
    var serializer = this.playlistSerializer();
  
    var serializationData = serializer.serializeData(
      {playlist: this.playlist, currentIndex: this.currentIndex()}
    );
    
    serializationData.version = serializer.version;
    
    return serializationData;
  },
  
  playlistDeserializer: function(data){
    return Twump.Controller.Serialization.playlist[data.version || 0];
  },
  
  deserializePlaylist: function(data){
    return this.playlistDeserializer(data).deserializeData(data);
  }
}
