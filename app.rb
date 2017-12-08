
require 'cgi'
require 'ostruct'

require 'sinatra'
require 'sinatra/logger'
require 'memoist'
require 'parallel'

require './lib/library'
require './lib/song'
require './lib/sm_parser'
require './lib/step_mania_file'

songs_path = '../Songs/'

$library = Library.cached_load_from(songs_path, refresh: !ENV['REFRESH_SONGS'].nil?)

class App < Sinatra::Base
  logger filename: "logs/#{settings.environment}.log", level: :debug
  set :public_folder, './build'
  enable :static

  get '/' do
    redirect "/index.html?host=#{request.host_with_port}"
  end

  get '/old' do
    @scope = Scope.new(params)
    slim :index
  end

  get '/ping' do
    'PONG'
  end

  get '/songs' do
    content_type :json
    scope = Scope.new(params)
    scope.map(&:json_response).to_json
  end

  get '/songs_by_cursor/:cursor' do
    content_type :json
    scope = Scope.new(params)
    song = scope.songs[params['cursor'].to_i]
    song.json_response.to_json
  end

  get '/songs_tagless/:count' do
    content_type :json
    songs = $library.songs.lazy.select { |s| s.tags.empty? }.take(params['count'].to_i).to_a
    songs.map(&:json_response).to_json
  end

  get '/songs/:song_id' do
    content_type :json
    song = $library.find(params['song_id'])
    song.json_response.to_json
  end

  get '/songs/:song_id' do
    content_type :json
    song = $library.find(params['song_id'])
    song.json_response.to_json
  end

  get '/songs/:song_id/add_tag/:tag' do
    content_type :json
    song = $library.find(params['song_id'])
    song.add_tag(params['tag'])
    song.json_response.to_json
  end

  get '/songs/:song_id/rate/:rating' do
    content_type :json
    song = $library.find(params['song_id'])
    song.set_rating(params['rating'].to_i)
    song.json_response.to_json
  end

  get '/songs/:song_id/remove_tag/:tag' do
    content_type :json
    song = $library.find(params['song_id'])
    song.remove_tag(params['tag'])
    song.json_response.to_json
  end
  
  get '/partials/song/:song_id' do
    slim :song, locals: { song: $library.find(params['song_id']) }
  end

  get '/file/:type/:song_id' do
    song = $library.find(params['song_id'])
    type = params['type']
    unless type.end_with?('_path')
      status 404
      return 'Not Found'
    end
    begin
      file_path = song.send(type)
    rescue NoMethodError
      status 404
      return "You're calling for the wrong thing: #{type}"
    end
    if file_path
      send_file(file_path)
    else
      status 404
      'Not Found'
    end
  end

  get '/add_tag/:tag/:song_id' do
    song = $library.find(params['song_id'])
    song.add_tag(params['tag'])
    slim :song, locals: { song: song }, layout: false
  end

  get '/remove_tag/:tag/:song_id' do
    song = $library.find(params['song_id'])
    song.remove_tag(params['tag'])
    slim :song, locals: { song: song }, layout: false
  end

  helpers do
    def file_url(song, type)
      "/file/#{type}/#{song.id}"
    end

    def add_tag_url(song, tag)
      "/add_tag/#{tag}/#{song.id}"
    end

    def remove_tag_url(song, tag)
      "/remove_tag/#{tag}/#{song.id}"
    end
  end

  before do
    response.headers['Access-Control-Allow-Origin'] = '*'
  end
  
  before do
    headers({
      'Access-Control-Allow-Origin' => '*',
      'Access-Control-Allow-Methods' => 'GET, OPTIONS'
    })
  end

  # routes...
  options "*" do
    headers({
      'Access-Control-Allow-Origin' => '*',
      'Access-Control-Allow-Methods' => 'GET, OPTIONS'
    })
    200
  end
end
