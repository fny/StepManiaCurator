import * as React from 'react'
import './App.css'

import Song from './lib/Song'
import Cover from './components/Cover'
import Tagging from './components/Tagging'
import Controls from './components/Controls'
import Rating from './components/Rating'

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
  return (
    <div className="Song" style={!visible ? {display: 'none'} : {}}>
      <Cover song={song} />
      <Rating song={song} />
      <Tagging tags={settings.tags} song={song} />
      <Controls song={song} playable={visible} nextSong={nextSong} prevSong={prevSong} />
    </div>
  )
}

interface AppProps { }
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
      console.log(response)
    } catch (err) {
      console.log(err)
      this.setState({ apiError: err.message, })
      return
    }
    this.appendSongs(response.data as Song[])
  }

  @bind
  appendSongs(newSongs: Song[]) {

    const currentSongIds = new Set(this.state.songs.map(s => s.id))
    const songs: Song[] = this.state.songs.concat(newSongs.filter(newSong => {
      return !currentSongIds.has(newSong.id)
    }))

    if (songs.length > settings.maxSongCount) {
      this.setState({
        songs: songs.slice(settings.songDropCount),
        cursor: this.state.cursor + settings.songDropCount
      })
    } else {
      this.setState({ songs })
    }
  }

  @bind
  prevSong() {
    if (this.state.cursor === 0) { return }
    this.setState({ cursor: this.state.cursor - 1})
  }

  @bind
  nextSong() {
    if (this.state.cursor === this.state.songs.length - 1) { return }
    this.setState({ cursor: this.state.cursor + 1 })

    const withinThreshold = ((this.state.songs.length - this.state.cursor) <= settings.songPreloadThreshold)
    if (withinThreshold) {
      this.loadUntaggedSongs()
    }
  }

  async componentDidMount() {
    await this.loadUntaggedSongs()
  }

  render() {  
    if (this.state.apiError) {
      return <div className="App-error">{this.state.apiError}</div>
      }
    if (this.state.songs.length === 0) {
      return <div className="App-loading">Loading...</div>
    }
    const songs = this.state.songs
    
    return (
      <div>
        <Offline>
          <div className="App-offline">You're currently offline! Noting will be saved.</div>
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
