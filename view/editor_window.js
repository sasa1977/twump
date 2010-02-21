Twump.View.EditorWindow = Class.create();

Object.extend(Twump.View.EditorWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.EditorWindow.prototype, {
  initialize: function(){
    this.insertHeader('editor');
    this.delayExecute = new Twump.Utils.DelayExecute(1000);

    this.addEventListener('filter', 'keydown');
    
    this.list = new Twump.List({
      parentElement: $('results'), itemClass: 'result'
    });
    this.list.onStartDrag = this.onStartDrag.bind(this);
  },
  
  onFilterKeydown: function(){
    this.delayExecute.cancel();
    this.delayExecute.schedule(function(){
      this.onFilterChanged($('filter').value)
    }.bind(this))
  },
  
  renderSearchResults: function(results){
    this.list.deselectAllItems();
    
    var index = 0, html = results.inject("", function(memo, file){
      var result = memo + this.searchResultTemplate.process({file: file, index: index});
      index++;
      return result;
    }.bind(this))

    $('results').update(html);
  },
  
  searchResultTemplate: TrimPath.parseTemplate(" \
    <div class='result' id='result${index}' value='${file.path}' index='${index}' fileId='${file.id}' style='width:1000'> \
      ${file.name} \
     </div> \
  "),
  
  onStartDrag: function(){
    Twump.Api.startDrag("twump:moveBefore");
  },
  
  selectedItems: function(){
    return this.list.selectedItems.map(function(item){
      return item.getAttribute('fileId');
    })
  }
});
