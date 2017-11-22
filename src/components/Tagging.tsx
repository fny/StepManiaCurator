import * as React from 'react'
import './Tagging.css'
import Song from '../lib/Song'
import bind from 'bind-decorator'
import * as helpers from '../lib/helpers'

function tagRows(tags: string[], numRows: number) {
  let blanksNeeded = 0
  if (tags.length % numRows > 0) {
    blanksNeeded = numRows - (tags.length % numRows)
  }

  const paddedTags = tags.slice(0)
  for (let i = 0; i < blanksNeeded; i++) {
    paddedTags.push('')
  }
  const perRow = paddedTags.length / numRows
  const tagSets = []
  for (let i = 0; i < numRows; i++) {
    tagSets.push(paddedTags.slice(perRow * i, perRow * i + perRow))
  }
  return tagSets
}

const Tagging = ({ tags, song }: { tags: string[], song: Song }) => (
  <div className="Tagging">
    {
      tagRows(tags, 3).map((tagRow, i) => (
        <div className="Tagging-row" key={i}>
          {tagRow.map((tag, j) => <Tag key={`${tag}${i}${j}`} tag={tag} song={song} />)}
        </div>
      ))
    }
  </div>
)

interface TagProps {
  tag: string
  song: Song
}

interface TagState {
  isSelected: boolean
  isPlaceholder: boolean
  error: 'persistence' | 'request' | null
}

class Tag extends React.Component<TagProps, TagState> {
  constructor(props: TagProps) {
    super(props)
    this.state = {
      isSelected: props.song.tags.indexOf(props.tag) !== -1,
      isPlaceholder: this.props.tag === '',
      error: null
    }
  }

  @bind
  async toggleTag() {
    if (this.state.isPlaceholder) { return }
    const areAdding = !this.state.isSelected
    const url = areAdding ? 
      helpers.addTagURL(this.props.song, this.props.tag) :
      helpers.removeTagURL(this.props.song, this.props.tag)
  
    let response
    try {
      response = await helpers.http.get(url)
    }
    catch (err) {
      console.error(err)
      this.setState({ error: 'request' })
      return
    }
    
    const song: Song = response.data

    if (areAdding) {
      const tagAdded = song.tags.indexOf(this.props.tag) !== -1
      if (tagAdded) {
        this.setState({ isSelected: true, error: null })
      }
      else {
        this.setState({ error: 'persistence' })
      }
      return
    }
    
    if (!areAdding) {
      const tagRemoved = song.tags.indexOf(this.props.tag) === -1
      if (tagRemoved) {
        this.setState({ isSelected: false, error: null })
      }
      else {
        this.setState({ error: 'persistence' })
      }
    }
  }
  
  render() {
    const classNames = ['Tagging-tag']
    if (this.state.isPlaceholder) { classNames.push('Tagging-tag-placeholder') }
    if (this.state.isSelected) { classNames.push('Tagging-tag-selected') }
    if (this.state.error) { classNames.push(`Tagging-tag-${this.state.error}-error`) }
    return (
      <button onClick={this.toggleTag} className={classNames.join(' ')}>
        {this.props.tag}
      </button>
    ) 
  }
}

export default Tagging
