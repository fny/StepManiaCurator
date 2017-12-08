import * as React from 'react'
import './Rating.css'
import Song from '../lib/Song'
import bind from 'bind-decorator'
import * as helpers from '../lib/helpers'

interface RatingButtonProps {
  currentRating: number
  value: number
  clickHandler(value: number): void
}

function RatingButton({ currentRating, value, clickHandler }: RatingButtonProps) {
  const classNames = ['Rating-button']
  if (currentRating >= value) {
    classNames.push('Rating-button-selected')
  }
  const onClick = () => {
    clickHandler(value)
  }
  return <button className={classNames.join(' ')} onClick={onClick}>{value}</button>
}

interface RatingProps {
  song: Song
}
interface RatingState {
  error:  'persistence' | 'request' | null
  rating: number
}
export default class Rating extends React.Component<RatingProps, RatingState> {
  constructor(props: RatingProps) {
    super(props)
    this.state = {
      error: null,
      rating: this.props.song.rating
    }
  }

  @bind
  async onRatingClick(value: number) {
    const currentRating = this.state.rating
    if (currentRating === value && currentRating !== 1) {
      return
    }
    const newRating = value === 1 && this.state.rating === 1 ? 0 : value
    let response
    try {
      response = await helpers.http.get(helpers.ratingURL(this.props.song, newRating))
    } catch (err) {
      console.log(err)
      this.setState({ error: 'request' })
      return
    }
    const song: Song = response.data
    if (song.rating !== newRating) {
      this.setState({ error: 'persistence' })
      return
    }

    this.setState({ rating: newRating })
  }

  render() {
    const classNames = ['Rating']
    if (this.state.error) {
      classNames.push(`Rating-${this.state.error}-error`)
    }
    const buttons = []
    for (let i = 1; i <= 5; i++) {
      buttons.push(
        <RatingButton key={i} currentRating={this.state.rating} value={i} clickHandler={this.onRatingClick} />
      )
    }
    // return <audio src={helpers.audioURL(this.props.song)} controls={true} />
    return (
     <div className={classNames.join(' ')}>
       {buttons}
     </div>
    )
  }
}
