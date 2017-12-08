const utilTags = 'NUTS|LOWQ|MISC|DEL'.split('|')
const genreTags = 'TECHNO|HIPHOP|POP|LATIN|ROCK|OLDIES|FOB|LOL'.split('|')

export const tags = utilTags.concat(genreTags)

export const host = `//${new URL(window.location.href).searchParams.get('host')}`

export const songPreloadCount = 10
export const numPrevSongsToKeep = 3
export const songPreloadThreshold = numPrevSongsToKeep + 5
export const requestTimeoutSeconds = 10