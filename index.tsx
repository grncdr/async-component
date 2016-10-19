import * as React from 'react'

export type ContextTypes = {[key: string]: Function}
// Maybe this feature will make it in TS 2.1
// type ContextTypes<Context> = {[key: keysof Context]: Function}

export type Options<SyncProps> = {
    renderLoadingError?: (err: Error, props: SyncProps) => JSX.Element,
    renderLoadingPlaceholder?: (props: SyncProps) => JSX.Element
}

export type LoadableComponent<Context, SyncProps, AsyncProps> = Options<SyncProps> & {
    new (): React.Component<SyncProps & AsyncProps, any>,
    load: (context: Context, props: SyncProps) => Promise<AsyncProps>,
    name?: string,
    displayName?: string
}

export type Container<S, A> = { new (): React.Component<S, ContainerState<A>> }
export type ContainerState<A> = { asyncProps?: A, error?: Error }

export type Decorator<C> =
    <S, A>(Component: LoadableComponent<C, S, A>) => Container<S, A>

const DEFAULT_CALLBACKS = {
    renderLoadingPlaceholder: () => <p>Loading...</p>,
    renderLoadingError: (error: Error) => <pre>{error.stack}</pre>
}

export default function makeDecorator<Context>(contextTypes: ContextTypes, defaults: Options<any> = {}): Decorator<Context> {
    return function<S, A>(WrappedComponent: LoadableComponent<Context, S, A>): Container<S, A> {
        const callbacks = {
            load: WrappedComponent.load,
            renderLoadingPlaceholder: WrappedComponent.renderLoadingPlaceholder || defaults.renderLoadingPlaceholder || DEFAULT_CALLBACKS.renderLoadingPlaceholder,
            renderLoadingError: WrappedComponent.renderLoadingError || defaults.renderLoadingError || DEFAULT_CALLBACKS.renderLoadingError
        }

        return class AsyncContainer extends React.Component<S, ContainerState<A>> {
            static displayName = `Async(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
            static WrappedComponent = WrappedComponent
            static contextTypes = contextTypes

            context: Context

            props: S
            state: ContainerState<A> = {}

            componentWillMount() {
                const { props, context} = this
                callbacks.load(context, props).then(
                    asyncProps => this.setState({ asyncProps }),
                    error => this.setState({ error })
                )
            }

            render() {
                const { asyncProps, error } = this.state
                if (asyncProps !== void (0)) {
                    return <WrappedComponent {...this.props} {...asyncProps} />
                } else if (error !== void (0)) {
                    return callbacks.renderLoadingError(error, this.props)
                } else {
                    return callbacks.renderLoadingPlaceholder(this.props)
                }
            }
        }
    }
}

