require 'rubygems'
require 'find'
require 'fileutils'
require 'haml'

class Paths
  def initialize(root)
    @root = root
  end
  
  attr_reader :root
  
  def intermediate
    "#{root}/intermediate"
  end
  
  def src
    "#{root}/src"
  end
  
  def intermediate_src
    "#{intermediate}/src"
  end
end


module FilesProvider
  def self.files(root)
    result = []
  
    Find.find(root) do |path|
      if !FileTest.directory?(path) && yield(path)
        result << path
      end
    end
    
    result
  end
end


class CompilingContext
  def javascript_include(*paths)
    includes = paths.map do |path|
      "<script src='#{path}' type='text/javascript'></script>"
    end
    
    includes.join("\n")
  end
end


class Compiler
  def initialize
    @paths = Paths.new(Dir.pwd)
  end
  
  def run
    compile
    
    Dir.chdir(@paths.intermediate_src)
    system("adl app.xml")
  ensure
    finish
    puts 'finished'
  end

private
  def compile
    init
    process_hamls(get_hamls)
  end

  def process_hamls(hamls)
    hamls.each do |haml_file| 
      process_haml(haml_file)
      FileUtils.rm(haml_file)
    end
  end
  
  def process_haml(haml_file)
    content = html(haml_file)
    output_name = html_name(haml_file)
    File.open(output_name, "wt") do |f|
      f.write(content)
    end
  end
  
  def html_name(haml_file)
    "#{File.dirname(haml_file)}/#{File.basename(haml_file, '.haml')}.html"
  end
  
  def html(haml_file)
    engine = Haml::Engine.new(File.read(haml_file))
    engine.render(CompilingContext.new)
  end

  def get_hamls
    FilesProvider.files(@paths.intermediate_src) {|path| File.extname(path) == ".haml"}
  end

  def init
    if File.exist?(@paths.intermediate)
      FileUtils.rm_rf(@paths.intermediate)
    end
    
    FileUtils.mkdir_p(@paths.intermediate)
    FileUtils.cp_r(@paths.src, @paths.intermediate, :preserve => true)
  end
  
  def finish
    Dir.chdir(@paths.root)
  end
end


Compiler.new.run
