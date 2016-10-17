import * as React from 'react'

type LoadCallback<Context, Props, Result> = (params: Context & Props) => Promise<Result>

type Decorated<P, R> = {
    new (): React.Component<P & R, any>,
    name?: string,
    displayName?: string
}

export type Options = {
    renderLoadError?: (err: Error) => JSX.Element,
    loadingPlaceholder?: JSX.Element
}

type Container<P, R> = { new (): React.Component<P, ContainerState<R>> }
type ContainerState<R> = { result?: R, error?: Error }

export type Decorator<Context> =
    <Result, Props>(load: LoadCallback<Context, Props, Result>, opts?: Options) =>
        (Component: { new (): React.Component<Props & Result, any> }) =>
            Container<Props, Result>

type ContextTypes = {[key: string]: Function}
// Maybe this feature will make it in TS 2.1
// type ContextTypes<Context> = {[key: keysof Context]: Function}

const DEFAULTS: Options = {
    loadingPlaceholder: <p>Loading...</p>,
    renderLoadError: (error) => <pre>{error.stack}</pre>
}

export default function <Context>(contextTypes: { [key: string]: Function }, defaults: Options = {}): Decorator<Context> {
    defaults = Object.assign({}, DEFAULTS, defaults)

    return function <P, R>(load: LoadCallback<Context, P, R>, options: Options = {}) {
        options = Object.assign({}, defaults, options)

        return function(Component: Decorated<P, R>): Container<P, R> {
            return class AsyncContainer extends React.Component<P, ContainerState<R>> {
                static displayName = `Async(${Component.displayName || Component.name || 'Component'})`
                static WrappedComponent = Component
                static contextTypes = contextTypes

                context: Context

                constructor() {
                    super()
                    this.state = {}
                }

                componentWillMount() {
                    const { props, context} = this
                    load(Object.assign({}, props, context)).then(
                        result => this.setState({ result }),
                        error => this.setState({ error })
                    )
                }

                render() {
                    const { result, error } = this.state
                    if (result !== void (0)) {
                        return <Component {...this.props} {...result} />
                    } else if (error !== void (0)) {
                        return options.renderLoadError(error)
                    } else {
                        return options.loadingPlaceholder
                    }
                }
            }
        }
    }
}

