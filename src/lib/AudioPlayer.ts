
class SimpleCache {
  store: { [key: string]: any }
  private size: number

  constructor(size: number) {
    this.size = size
    this.store = {}
  }

  get(key: string) {
    return this.store[key]
  }

  set(key: string, item: any) {
    this.store[key] = item
    this.cleanupAsNeeded()
  }
  
  cleanupAsNeeded() {
    const keys = Object.keys(this.store)
    if (keys.length > this.size) {
      const toDelete = keys[0]
      delete this.store[toDelete]
    }
    
  }
}

const AUDIO_CACHE = new SimpleCache(10)

export default class AudioPlayer {
  audio: HTMLAudioElement

  constructor(url: string) {
    const cachedAudio = AUDIO_CACHE.get(url)
    if (cachedAudio instanceof HTMLAudioElement) {
      this.audio = cachedAudio
    } else {
      this.audio = new Audio()
      // this.audio.preload = 'preload'
      this.audio.src = url
      AUDIO_CACHE.set(url, this.audio)
    }
  }

  isPlaying() {
    return !this.audio.paused
  }

  toggle() {
    if (this.audio.paused) {
      return this.audio.play()
    } else {
      return this.audio.pause()
    }
  }

  play() {
    return this.audio.play()
  }

  restart() {
    this.audio.pause()
    this.audio.currentTime = 0
    return this.audio.play()
  }

  pause() {
    return this.audio.pause()
  }

  seek(seconds: number) {
    return this.audio.currentTime += seconds
  }
}

(window as any).AudioPlayer = AudioPlayer
