class StepManiaFile
  extend Memoist

  def initialize(path)
    @path = path
    @data = SMParser.new(path).result
  end

  def title
    @data.fetch('title', 'NOTITLE.sm')
  end

  def subtitle
    @data.fetch('subTitle', '')
  end

  def artist
    @data.fetch('artist', 'NOARTIST.sm')
  end

  def bpms
    all = @data.fetch('bpms', []).flatten
    all.max.to_i
  end

  def levels
    Hash[
      @data.fetch('notes', [])
        .select { |note_set| note_set.fetch('mode', '') == 'dance-single' }
        .map { |note_set| [note_set.fetch('difficulty', '?').downcase, note_set.fetch('steps', 0) ] }
    ]
  end
end
