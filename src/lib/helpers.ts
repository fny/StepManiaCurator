import Song from './Song'
import * as settings from '../settings'
import axios from 'axios'

export const http = axios.create({
  baseURL: settings.host,
  timeout: 1000,
})

export function imageURL(song: Song) {
  return fileURL('image_path', song)
}

export function fileURL(type: string, song: Song) {
  return `${settings.host}/file/${type}/${song.id}`
}

export function audioURL(song: Song) {
  return fileURL('audio_path', song)
}

export function bgImage(song: Song) {
  return { backgroundImage: `url(${imageURL(song)})` }
}

export function addTagURL(song: Song, tag: string) {
  return `${settings.host}/songs/${song.id}/add_tag/${tag}`
}

export function removeTagURL(song: Song, tag: string) {
  return `${settings.host}/songs/${song.id}/remove_tag/${tag}`
}

export function ratingURL(song: Song, newRating: number) {
  return `${settings.host}/songs/${song.id}/rate/${newRating}`
}

export function hasNoSupportedAudio(song: Song) {
  return (song.audio_ext !== '.mp3' && song.audio_ext !== '.ogg')
}
