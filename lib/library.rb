
class Library
  TAGS = %w[DEL ERR ??? LOL LAT POP RCK TCH OLD R&B FOB]
  extend Memoist
  attr_reader :songs

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

