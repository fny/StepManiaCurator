# Hackily ported from https://github.com/tenphi/sm-parser/
#
# Example Output for `SMCParser.new(path).result`
# {
#   "notes"=>[
#     {"mode"=>"dance-single", "difficulty"=>"Easy", "steps"=>4},
#     {"mode"=>"dance-single", "difficulty"=>"Medium", "steps"=>6},
#     {"mode"=>"dance-single", "difficulty"=>"Hard", "steps"=>8},
#     {"mode"=>"dance-double", "difficulty"=>"Easy", "steps"=>3},
#     {"mode"=>"dance-double", "difficulty"=>"Medium", "steps"=>6},
#     {"mode"=>"dance-double", "difficulty"=>"Hard", "steps"=>8},
#     {"mode"=>"dance-single", "difficulty"=>"Beginner", "steps"=>1}
#   ],
#   "title"=>"Groove",
#   "subTitle"=>nil,
#   "artist"=>"Sho-Tfeat.Brenda",
#   "titleTranslit"=>nil,
#   "subTitleTransit"=>nil,
#   "artistTranslit"=>nil,
#   "credit"=>nil,
#   "banner"=>"Groove.png",
#   "background"=>"Groove-bg.png",
#   "lyricsPath"=>nil,
#   "CDTitle"=>"./CDTITLES/DANCEDANCEREVOLUTIONHOMEVERSION.PNG",
#   "music"=>"Groove.mp3",
#   "offset"=>-64.0,
#   "sampleStart"=>59.1,
#   "sampleLength"=>15.5,
#   "selectable"=>true,
#   "bpms"=>[[0.0, 129.99]],
#   "stops"=>nil,
#   "bgChanges"=>nil
# }


SIZES = {
  'dance' => {
    'threepanel' => 3,
    'single' => 4,
    'solo' => 6,
    'double' => 8,
    'couple' => 8
  },
  'pump' => {
    'single' => 5,
    'halfdouble' => 6,
    'double' => 10,
    'couple' => 10
  },
  'ez2' => {
    'single' => 5,
    'double' => 10,
    'real' => 7,
  },
  'para' => {
    'single' => 5,
  },
  'ds3ddx' => {
    'single' => 8
  },
  'maniax' => {
    'single' => 4,
    'double' => 8,
  },
  'techno' => {
    'single4' => 4,
    'single5' => 5,
    'single8' => 8,
    'double4' => 8,
    'double5' => 10,
  },
  'pnm' => {
    'five' => 5,
    'nine' => 9
  }
}


def parseOffset(v)
  return v.to_f * 1000;
end

def parseBoolean(v)
  return v == 'YES' ? true : false;
end

def parseBPMs(v)
  v.split(',').map { |str|
    str.split('=').map { |flt|
      flt.to_f
    }
  }
end

def parseStops(v)
  return v;
end

def parseDelays(v)
  return v;
end

def parseTimeSignatures(v)
  return v;
end

def parseTickCounts(v)
  return v;
end

def parseBgChanges(v)
  return v;
end

def parseKeySounds(v)
  return v;
end

def parseAttacks(v)
  return v;
end

def parseNotes(mode, difficulty, steps, notes)
  modeDesc = mode.split('-');
  upperLimit = SIZES.fetch(modeDesc[0], {}).fetch(modeDesc[1], -1)
  return {
    'mode' => mode,
    'difficulty' => difficulty,
    'steps' => steps.to_i,
    # 'rawNotes' => notes.split(',').map { |measure|
    #   re = Regexp.new(".{1,#{upperLimit}}","g");
    #   measure.match(re)[0];
    # }
  }
end

def parseMeasures(data)
  baseBPM = data['bpms'][0][1]
  measureLength = 60000 / baseBPM * 4
  data['notes'].each do |note_set|
    notes = []
    offset = 0;
    note_set['rawNotes'].each_with_index do |measure, measureId|
      next if(!measure)
      len = measure.length;
      noteTime = measureLength / len;
      measure.each_with_index do |note, i|
        # add mine handling
        if (note.to_i)
          notes.push({
            "offset" => offset,
            "steps" => note,
            "measure" => measureId,
            "type" => getStepType(i, len)
          });
        end
        offset += noteTime;
      end
    end

  note_set['notes'] = notes
  end
end

# TODO: add support for triples
def getStepType(offset, parts)
  pow = 1
  # type 1 if there are 4 parts or less
  if (parts / 4 <= 1)
    return 1
  else
    # reduce offset by quads
    parts = parts / 4
    while (offset >= parts)
      offset -= parts
    end
  end
  # type 1
  if (offset == 0)
    return 1
  end

  (2..5).each do |i|
    pow *= 2
    part = parts / pow
    if (part != part.to_i)
      break
    elsif (offset - part == 0)
      return i
    elsif (offset - part > 0)
      offset -= part
    end
  end
  return 8
end

def parseFloat(v)
  v.to_f
end


KEYMAP = {
  'TITLE' => 'title',
  'SUBTITLE' => 'subTitle',
  'ARTIST' => 'artist',
  'TITLETRANSLIT' => 'titleTranslit',
  'SUBTITLETRANSLIT' => 'subTitleTransit',
  'ARTISTTRANSLIT' => 'artistTranslit',
  'GENRE' => 'genre',
  'CREDIT' => 'credit',
  'BANNER' => 'banner',
  'BACKGROUND' => 'background',
  'LYRICSPATH' => 'lyricsPath',
  'CDTITLE' => 'CDTitle',
  'MUSIC' => 'music',
  'OFFSET' => ['offset', method(:parseOffset)],
  'SAMPLESTART' => ['sampleStart', method(:parseFloat)],
  'SAMPLELENGTH' => ['sampleLength', method(:parseFloat)],
  'SELECTABLE' => ['selectable', method(:parseBoolean)],
  'BPMS' => ['bpms', method(:parseBPMs)],
  'STOPS' => ['stops', method(:parseStops)],
  'DELAYS' => ['delays', method(:parseDelays)],
  'TIMESIGNATURES' => ['timeSignatures', method(:parseTimeSignatures)],
  'TICKCOUNTS' => ['tickCounts', method(:parseTickCounts)],
  'BGCHANGES' => ['bgChanges', method(:parseBgChanges)],
  'KEYSOUNDS' => ['keySounds', method(:parseKeySounds)],
  'ATTACKS' => ['attacks', method(:parseAttacks)]
}





class SMParser
  def initialize(file_path)

    content = File.read(file_path).encode("UTF-16be", :invalid=>:replace, :replace=>"?").encode('UTF-8')

    inData = content
      .gsub(/\/\*![^*]*\*+(?:[^*\/][^*]*\*+)*\//, '')
      .gsub(/\s*\/\/.*/, '')
      .gsub(/[\r\n\t\s]/, '')
      .split(';')
      .map { |field| field.split(':') }

    outData = {
      'notes' => []
    }

    inData.each do |field|
      next if field.empty?
      fieldName = field[0].gsub('#', '')
      map = KEYMAP[fieldName]
      if (fieldName == 'NOTES')
        outData['notes'].push(parseNotes(field[1], field[3], field[4], field[6]))
      elsif (map.is_a?(String))
        outData[map] = field[1]
      elsif (map)
        outData[map[0]] = map[1].call(field.slice(1))
      end
    end
    #parseMeasures(outData)
    @result = outData
  end

  def result
    @result
  end

end
