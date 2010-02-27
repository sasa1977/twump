Twump.Controller.Serialization = {}

Twump.Controller.Serialization.playlist = [
  {
    serializeData: function(data){
      return {list: data.playlist.paths(), current: data.currentIndex}
    },
    
    deserializeData: function(data){
      return {playlist: new Twump.Model.Playlist(data.list), currentIndex: data.current}
    }
  }
]

Twump.Controller.SerializationMixin = {
  playlistSerializer: function(){
    return Twump.Controller.Serialization.playlist.last();
  },
  
  serializePlaylist: function(){
    var serializationData = this.playlistSerializer().serializeData(
      {playlist: this.playlist, currentIndex: this.currentIndex()}
    );
    
    serializationData.version = Twump.Controller.Serialization.playlist.length - 1;
    
    return serializationData;
  },
  
  playlistDeserializer: function(data){
    return Twump.Controller.Serialization.playlist[data.version || 0];
  },
  
  deserializePlaylist: function(data){
    return this.playlistDeserializer(data).deserializeData(data);
  }
}
