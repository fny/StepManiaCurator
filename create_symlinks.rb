require 'fileutils'

require './lib/library'
require './lib/song'
require './lib/sm_parser'
require './lib/step_mania_file'

SONGS_DIR = '../Songs'
SORTED_SONGS_DIR = '../SongsSorted'
library = Library.cached_load_from(SONGS_DIR)

songs = library.songs.lazy

FileUtils.mkdir_p SORTED_SONGS_DIR

FileUtils.mkdir_p File.join(SORTED_SONGS_DIR, 'Keepers')
songs.reject { |song| song.tags.include?('DEL') }.each { |song|
  FileUtils.ln_s song.path song.path.gsub('/Songs/', '/SongsSorted/Keepers/')
}

