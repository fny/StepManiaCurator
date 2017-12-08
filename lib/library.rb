require 'cgi'

class Library
  extend Memoist
  attr_reader :songs

  def self.load_from(relative_path)
    glob_path = File.join(relative_path, '*', '*')
    song_paths = Dir.glob(glob_path).map { |rel_path| File.expand_path(rel_path) }
    songs = Parallel.map_with_index(song_paths) { |s| Song.new(s) }.select { |s| s.valid? }.sort_by(&:artist)
    new(songs)
  end
  
  def self.cached_load_from(relative_path, refresh: false)
    library_cache_path = CGI.escape(File.join('tmp', relative_path))
    # This only works because any changes made are read/write from disk
    if File.exists?(library_cache_path) && !refresh
      Marshal.load(File.read(cache_path))
    else
      Library.load_from('../Songs/')
      File.open(library_cache_path, 'w') { |f| f.write(Marshal.dump(self)) }
    end
  end

  def initialize(songs)
    @songs = songs
  end

  def find(id)
    found = songs.find { |s| s.id == id }
    raise("Song not found: #{id}, #{songs.first.id}") if !found
    found
  end

  memoize def collections
    songs.map(&:collection).uniq.sort
  end

  def songs_without_tag(tag)
    @library.songs.select { |song| !song.tags.include?(tag) }
  end

  def songs_with_tag(tag)
    @library.songs.select { |song| song.tags.include?(tag) }
  end

  def songs_with_tags(tags)
    @library.songs.select { |song| includes_all(song.tags, tags) }
  end

  private

  def includes_all(a1, a2)
    a2.all? { |e| a1.include?(e) }
  end
end

class Scope
  attr_reader :songs
  def initialize(opts = {query: '', page: 1, per_page: 50, skip_tagged: false})
    @query = opts[:query]
    @page = opts[:page].to_i
    @per_page = opts[:per_page].to_i
    @per_page = 50 if @per_page == 0
    @skip_tagged = opts[:skip_tagged]
    songs = $library.songs
    songs = query_songs(songs) if @query && !@query.empty?
    songs = songs.select { |s| s.tags.empty? } if @skip_tagged
    @songs = songs || []
  end


  def total_pages
    (@songs.size.to_f / @per_page).ceil
  end

  def by_page
    @songs[@page * @per_page + 1, @per_page] || []
  end


  private

  def query_songs(songs)
    songs.map { |song|
      z = {
        str: [song.display_audio_path, song.title, song.artist, song.collection].join('|'),
        song: song
      }
      puts z[:str]
      z

    }.select { |x| x[:str].include?(@query) }.map { |x| x[:song] }
  end
end

