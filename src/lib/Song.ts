export default interface Song {
  id: string
  audio_ext: string
  artist: string
  title: string
  subtitle: string
  bpms: number
  tags: string[]
  rating: number
  has_image: boolean
  levels: { [s: string]: number }
}
