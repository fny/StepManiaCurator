import * as React from 'react'
import './Flash.css'

interface FlashProps {
  disappear?: boolean
  children: string
}

interface FlashState {
  visible: boolean
}

export default class Flash extends React.Component<FlashProps, FlashState> {
  public static defaultProps: Partial<FlashProps> = {
    disappear: true
  }

  constructor(props: FlashProps) {
    super(props)
    this.state = {
      visible: true
    } 
  }

  componentDidMount() {
    if (!this.props.disappear) { return }
    setTimeout(() => {
      this.setState({visible: false})
    }, 2000)
  }


  render() {
    return (
      <div className="Flash" style={this.state.visible ? {} : { display: 'none' }}>
        <div className="Flash-message">{this.props.children}</div>
      </div>
    )
  }
}