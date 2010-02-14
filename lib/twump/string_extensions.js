String.prototype.capitalizeEachWord = function(){
  return this.underscore().dasherize().capitalize().camelize();
}
