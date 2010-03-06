require 'rubygems'
require 'find'
require 'fileutils'
require 'haml'

require 'rexml/document'

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
  
  def release
    "#{root}/release"
  end
  
  def build
    "#{root}/build"
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
  def initialize(file)
    @file = file
  end

  def javascript_include(*paths)
    includes = paths.map do |path|
      "<script src='../#{path}.js' type='text/javascript'></script>"
    end
    
    includes.join("\n")
  end
  
  def stylesheet_include(*paths)
    includes = paths.map do |path|
      "<link href='../#{path}.css' rel='stylesheet' type='text/css' />"
    end
    
    includes.join("\n")
  end
  
  def render_partial(relative)
    partial = "#{File.dirname(@file)}/_#{relative}.haml"
    engine = Haml::Engine.new(File.read(partial))
    engine.render(self)
  end
end


class Compiler
  def initialize
    @paths = Paths.new(Dir.pwd)
  end
  
  def run
    with_compile do
      puts "\nrunning"
      system("adl app.xml")
    end
  end
  
  def package
    with_compile do
      puts "\npackaging"
      system("echo 123 | adt -package -storetype pkcs12 -keystore #{@paths.build}/cert.pfx #{@paths.release}/twump-#{app_version}.air app.xml . > /dev/null")
      FileUtils.cp("#{@paths.src}/app.xml", @paths.release, :preserve => true)
    end
  end

private
  def app_version
    REXML::XPath.first(
      REXML::Document.new(File.read("#{@paths.src}/app.xml")),
      "//version"
    ).text
  end

  def with_compile
    puts "compiling"
    compile
    Dir.chdir(@paths.intermediate_src)
    
    yield
  ensure
    finish
    puts 'finished'
  end

  def compile
    init
    process_hamls(get_hamls)
  end

  def process_hamls(hamls)
    hamls.each do |haml_file|
      unless File.basename(haml_file).start_with?("_")
        puts "#{haml_file}"
        process_haml(haml_file)
      end
    end
    
    hamls.each{|haml_file| FileUtils.rm(haml_file)}
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
    engine.render(CompilingContext.new(haml_file))
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

if ARGV.length == 0
  puts "\nUsage: ruby compile.rb actions\n"
  puts "\taction = run | package\n\n"
end

ARGV.each do |action|
  Compiler.new.send(action)
end

