import * as React from 'react'
import './Cover.css'
import Song from '../lib/Song'
import * as helpers from '../lib/helpers'

interface CoverLevelsProps {
  levels: { [key: string]: number }
}
const CoverLevels = ({ levels }: CoverLevelsProps) => {
  const insides = ['beginner', 'easy', 'medium', 'hard'].map(level => {
    const rating = levels[level]
    const className = `Levels-level Levels-level-${level}`
    return <div key={level} className={className}>{rating || 0}</div>
  })
  return <div className="Cover-levels">{insides}</div>
}

const Cover = ({ song }: { song: Song }) => (
  <div className="Cover">
    {
      song.has_image ?
        <div className="Cover-image" style={helpers.bgImage(song)} />
        :
        <div className="Cover-image" />
    }
    <div className="Cover-content">
      <div className="Cover-title">
        <b>{song.title}</b>
        {song.subtitle ? <span>&nbsp;/&nbsp;{song.subtitle}</span> : ''}
        
      </div>
      <div className="Cover-artist">{song.artist}</div>
      <CoverLevels levels={song.levels} />
      <div className="Cover-bpm">{song.bpms} BPM</div>
      <div>{song.audio_ext}</div>
    </div>
  </div>
)
export default Cover
