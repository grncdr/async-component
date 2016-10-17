import React from 'react'

type LoadCallback<Context, Props, Result> = (params: Context & Props) => Promise<Result>
type Container<P, R> = Class<React.Component<P, {result?: R, error?: Error}>>

export type Decorator<Context> = <Result, Props>(Component: Loadable<Context, Props, Result>) => Container<Props, Result>

// type ContextTypes<Context> = {[key: $Enum<Context>]: Function}

export default function <Context>(contextTypes: ContextTypes<Context>, defaultLoadingIndicator?: React.Element): Decorator<Context> {
  return function <P, R>(Component: Loadable<Context, P, R>): Container<P, R> {

    return class AsyncContainer extends React.Component {
      static displayName = `Async(${Component.displayName || Component.name || 'Component'})`
      static WrappedComponent = Component
      static contextTypes = contextTypes

      context: Context
      props: P
      state = {}

      componentWillMount() {
        loader.loadit({...this.props, ...this.context}).then(
          result => this.setState({result}),
          error => this.setState({error})
        )
      }

      render(): React.Element<any> {
        const { result, error } = this.state
        if (result !== void(0)) {
          return <Component {...this.props} {...result}/>
        } else if (error !== void(0)) {
          if (Component.renderLoadError) {
            return Component.renderLoadError(error)
          } else {
            return <p>Load error <pre>{error.stack}</pre></p>
          }
        } else if (Component.renderLoadingState) {
          return Component.renderLoadingState(this.props)
        } else {
          return defaultLoadingIndicator || <p>Loading...</p>
        }
      }
    }
  }
}
