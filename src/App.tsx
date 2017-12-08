import * as React from 'react'
import './App.css'

import Song from './lib/Song'
import Cover from './components/Cover'
import Tagging from './components/Tagging'
import Controls from './components/Controls'
import Rating from './components/Rating'
import Flash from './components/Flash'


import { Offline } from 'react-detect-offline'

import * as settings from './settings'
import * as helpers from './lib/helpers'
import bind from 'bind-decorator'

interface SongViewProps {
  song: Song
  visible: boolean
  prevSong(): void
  nextSong(): void
}

const SongView = ({ song, visible, nextSong, prevSong }: SongViewProps) => {
  const classNames = ['Song']
  if (!visible) { classNames.push('hidden') }
  return (
    <div className={classNames.join(' ')}>
      <Cover song={song} />
      <Rating song={song} />
      <Tagging tags={settings.tags} song={song} />
      <Controls song={song} playable={visible} nextSong={nextSong} prevSong={prevSong} />
    </div>
  )
}

interface AppProps {}
interface AppState {
  currentSong?: Song
  songs: Song[]
  cursor: number
  isPlaying: boolean
  apiError?: string
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)
    this.state = {
      cursor: 0,
      songs: [],
      isPlaying: true
    }
    this.loadUntaggedSongs = this.loadUntaggedSongs.bind(this)
  }
  
  @bind
  async loadUntaggedSongs(amount: number = settings.songPreloadCount) {
    let response
    try {
      response = await helpers.http.get(`${settings.host}/songs_tagless/${amount}`)
    }
    catch (err) {
      console.error(err)
      this.setState({ apiError: `${err.message} ${helpers.randomStr()}`, })
      return
    }
    const newSongs = response.data as Song[]
    const currentSongIds = new Set(this.state.songs.map(s => s.id))
    const songs: Song[] = this.state.songs.concat(newSongs.filter(newSong => {
      return !currentSongIds.has(newSong.id)
    }))

    this.setState({ songs })
  }


  @bind
  prevSong() {
    if (this.state.cursor === 0) { return }
    this.setState({ cursor: this.state.cursor - 1})
  }

  @bind
  nextSong() {
    // We can't go past the total number of songs
    if (this.state.cursor === this.state.songs.length - 1) { return }

    const newCursor = this.state.cursor + 1 

    const prevSongCount = newCursor - 1

    // Within amount to keeps
    if (prevSongCount <= settings.numPrevSongsToKeep) {
      const stateA = { cursor: newCursor }
      this.setState(stateA, () => {
        if (this.state.songs.length <= settings.songPreloadThreshold) {
          this.loadUntaggedSongs()
        }       
      })
    }
    // Drop the extra songs
    else {
      const stateB = {
        cursor: settings.numPrevSongsToKeep,
        songs: this.state.songs.slice(newCursor - settings.numPrevSongsToKeep)
      }
      this.setState(stateB, () => {
        if (this.state.songs.length <= settings.songPreloadThreshold) {
          this.loadUntaggedSongs()
        }       
      })
    }
  }

  async componentDidMount() {
    await this.loadUntaggedSongs()
  }

  render() {  
    if (this.state.songs.length === 0) {
      if (this.state.apiError) {
        return <Flash>{this.state.apiError}</Flash>
      } else {
        return <Flash>Loading...</Flash>
      }
    }

    const songs = this.state.songs
    
    return (
      <div>
        {this.state.apiError ? <Flash disappear={true}>{this.state.apiError}</Flash> : ''}
        <Offline>
          <Flash>Currently offline! Nothing will be saved.</Flash>
        </Offline>
        <div className="wrapper">
          {
            songs.map((song: Song, i: number) => (
              <SongView
                key={song.id} 
                song={song}
                visible={i === this.state.cursor}
                nextSong={this.nextSong}
                prevSong={this.prevSong}
              />
            ))
          }
        </div>
      </div>
    )
  }
}

export default App
