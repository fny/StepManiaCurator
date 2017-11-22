const utilTags = 'DEL|ERR|POOR|MISC'.split('|')
const genreTags = 'TECHNO|HIPHOP|ROCK|LATIN|OLDIES|ROCK|FOB|LOL'.split('|')

export const tags = utilTags.concat(genreTags)

export const host = `//${new URL(window.location.href).searchParams.get('host')}`

export const maxSongCount = 50

export const songPreloadCount = 15

export const songPreloadThreshold = 3

export const songDropCount = 20
