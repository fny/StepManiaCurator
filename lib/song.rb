require 'digest'


class Song
  API_ATTRIBUTES = %w[
    id audio_ext artist title subtitle levels bpms tags rating
    has_image has_steps has_audio has_enough_levels
  ]
  attr_reader :path
  attr_accessor :cursor

  def initialize(song_path)
    @path = song_path
    @name = @path.split('/').last
    @smf =
      if sm_path
        StepManiaFile.new(sm_path)
      elsif ssc_path
        StepManiaFile.new(ssc_path)
      else
        OpenStruct.new(artist: 'No SM File', title: 'No SM File', subtitle: '')
      end
  end

  def id
    "s#{Digest::MD5.hexdigest(@path)}"
  end

  def audio_ext
    File.extname(audio_path) if audio_path
  end

  def artist
    @smf.artist || @artist || "ARTIST"
  end

  def title
    @smf.title || @title || "TITLE"
  end

  def subtitle
    @smf.subtitle || ''
  end

  def album
    @album || "ALBUM"
  end

  def levels
    @smf.levels
  end

  def bpms
    @smf.bpms
  end

  def json_response
    response = {}
    API_ATTRIBUTES.each do |attr|
      response[attr] = send(attr)
    end
    return response
  end

  def cdtitle_image_path
    path = "#{@path}/cdtitle.png"
    return path if File.exist?(path)
    nil
  end

  def sm_path
    path = "#{@path}/#{@name}.sm"
    return path if File.exist?(path)
    nil
  end

  def ssc_path
    path = "#{@path}/#{@name}.ssc"
    return path if File.exist?(path)
    nil
  end

  def bg_image_path
    path = "#{@path}/#{@name}-bg.png"
    return path if File.exist?(path)
    nil
  end

  def jacket_image_path
    path = "#{@path}/#{@name}-jacket.png"
    return path if File.exist?(path)
    nil
  end

  def teaser_image_path
    path = "#{@path}/#{@name}.png"
    return path if File.exist?(path)
    nil
  end

  def image_path
    [jacket_image_path, cdtitle_image_path, bg_image_path, jacket_image_path, teaser_image_path].first { |path| !path.nil? }
  end

  def collection
    @path.split('/')[-2]
  end

  def display_audio_path
    audio_path.split('/').last if audio_path
  end

  def audio_path
    [
      "#{@path}/#{@name}.mp3",
      "#{@path}/#{@name}.ogg",
      "#{@path}/#{@name}.avi"
    ].each do |path|
      return path if File.exist?(path)
    end
    nil
  end

  #
  # Tagging
  #

  def curator_data_path
    "#{@path}/curator.json"
  end

  def curator_data
    if File.exist?(curator_data_path)
      return JSON.parse(File.read(curator_data_path))
    end
    {
      'tags' => [],
      'rating' => 0
    }
  end

  def persist_curator_data(data)
    File.open(curator_data_path, 'w') do |f|
      f.puts(JSON.dump(data))
    end
  end

  def set_rating(rating)
    data = curator_data()
    data['rating'] = rating
    persist_curator_data(data)
  end

  def add_tag(tag)
    data = curator_data()
    data['tags'].push(tag)
    data['tags'] = data['tags'].uniq.sort 
    persist_curator_data(data)
  end

  def remove_tag(tag)
    data = curator_data()
    data['tags'].push(tag)
    data['tags'].delete(tag)
    persist_curator_data(data)
  end

  
  def tags
    curator_data.fetch('tags', [])
  end

  def rating
    curator_data.fetch('rating', 0)
  end

  def has_enough_levels
    levels.keys.size > 2
  end

  def has_steps
    !(sm_path || ssc_path).nil?
  end

  def has_audio
    !audio_path.nil?
  end

  def has_tag(tag)
    tags.include?(tag)
  end

  def has_image
    !image_path.nil?
  end

  def valid?
    has_audio && has_steps && has_enough_levels
  end
end
