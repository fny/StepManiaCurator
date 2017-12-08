import * as React from 'react'
import './Controls.css'
import Song from '../lib/Song'
import AudioPlayer from '../lib/AudioPlayer'
import * as helpers from '../lib/helpers'
import bind from 'bind-decorator'

interface ControlsProps {
  song: Song
  playable: boolean
  nextSong(): void
  prevSong(): void
}

interface ControlsState {
  isPlaying: boolean
  audioReadyState: number
}

class Controls extends React.Component<ControlsProps, ControlsState> {
  audioPlayer: AudioPlayer
  audioCheck: any
  constructor(props: ControlsProps) {
    super(props)
    this.state = {
      isPlaying: false,
      audioReadyState: 0
    }
    this.audioPlayer = new AudioPlayer(helpers.audioURL(this.props.song))
  }

  componentDidMount() {
    this.audioCheck = setInterval(() => {
      this.setState({audioReadyState: this.audioPlayer.audio.readyState})
    }, 500)
  }

  componentWillUnmount() {
    clearInterval(this.audioCheck)
  }

  componentWillUpdate(nextProps: ControlsProps, nextState: ControlsState) {
    if (!nextProps.playable) {
      this.audioPlayer.pause()
    }
    if (!this.props.playable && nextProps.playable) {
      this.audioPlayer.play()
    }
  }

  @bind
  songSeek(seconds: number) {
    this.audioPlayer.seek(seconds)
  }

  @bind
  async songToggle() {
    await this.audioPlayer.toggle()
    this.setState({ isPlaying: this.audioPlayer.isPlaying() })
  }
  
  render() {
    let playButton =
      this.audioPlayer.isPlaying() ?
        <button className="Controls-button" onClick={this.songToggle}>{`PAUSE ${this.state.audioReadyState}`}</button> :
        <button className="Controls-button" onClick={this.songToggle}>{`PLAY ${this.state.audioReadyState}`}</button>

    if (helpers.isVideo(this.props.song)) {
      playButton = <button className="Controls-button">ERR</button>
    }

    return (
      <div className="Controls">
        {playButton}
        <button className="Controls-button" onClick={() => this.songSeek(15)}>+15</button>
        <button className="Controls-button" onClick={() => this.audioPlayer.restart()}>RW</button>
        <button className="Controls-button" onClick={this.props.prevSong}>PREV</button>
        <button className="Controls-button" onClick={this.props.nextSong}>NEXT</button>
      </div>
    )
  }
}
export default Controls
