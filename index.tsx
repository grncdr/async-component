import * as React from 'react'

export type ContextTypes = {[key: string]: Function}
// Maybe this feature will make it in TS 2.1
// type ContextTypes<Context> = {[key: keysof Context]: Function}


export type ChildProps<SyncProps, AsyncProps> =
    SyncProps & { refresh: (clearState: boolean) => void } &
    ( { loading: true } |
      { loading: false, loadError: Error } |
      { loading: false, async: AsyncProps } )

export type LoadableComponent<Context, SyncProps, AsyncProps> = {
    new(): React.Component<ChildProps<SyncProps, AsyncProps>, any>,
    load: (context: Context, props: SyncProps, prevProps: ChildProps<SyncProps, AsyncProps>) => Promise<AsyncProps>,
    // shouldReload: (context: Context, props: SyncProps, prevProps: Props<SyncProps, AsyncProps>) => boolean,
    name?: string,
    displayName?: string
}

export type Container<S, A> = { new (): React.Component<S, ContainerState<A>> }
export type ContainerState<A> = { asyncProps?: A, loadError?: Error }

export type Decorator<C> =
    <S, A>(Component: LoadableComponent<C, S, A>) => Container<S, A>

const DEFAULT_CALLBACKS = {
    renderLoadingPlaceholder: () => <p>Loading...</p>,
    renderLoadingError: (error: Error) => <pre>{error.stack}</pre>
}

export type Provider<C, P> = {
    new(): React.Component<P, void>
}

export default function init<C, P>(contextTypes: ContextTypes, getChildContext: (props: P) => C): { Provider: Provider<C, P>, connect: Decorator<C> } {
    return {
        Provider: makeProvider(contextTypes, getChildContext),
        connect: makeDecorator(contextTypes)
    }
}

export function makeProvider<Context, Props>(contextTypes: ContextTypes, getChildContext: (props: Props) => Context): Provider<Context, Props> {
    return class Provider extends React.Component<Props, void> {
        static childContextTypes = contextTypes

        getChildContext() {
            return getChildContext(this.props)
        }

        render() {
            return React.Children.only(this.props.children || <div/>)
        }
    }
}

export function makeDecorator<Context>(contextTypes: ContextTypes): Decorator<Context> {
    return function<S, A>(WrappedComponent: LoadableComponent<Context, S, A>): Container<S, A> {
        const load = WrappedComponent.load

        return class AsyncContainer extends React.Component<S, ContainerState<A>> {
            static displayName = `Async(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
            static WrappedComponent = WrappedComponent
            static contextTypes = contextTypes

            context: Context

            props: S
            state: ContainerState<A> = {}

            componentWillMount() {
                this.reload(this.props)
            }

            componentWillReceiveProps(nextProps: S) {
                this.reload(nextProps)
            }

            reload(nextProps: S) {
                const { context, state: { asyncProps } } = this
                load(context, nextProps, this.getChildProps()).then(
                    (asyncProps) => this.setState({ asyncProps }),
                    (loadError: Error) => this.setState({ loadError })
                )
            }

            forceReload = (clearState: boolean = true) => {
                if (clearState) {
                    this.setState({ asyncProps: void(0), loadError: void(0) })
                }
                this.reload(this.props)
            }

            render() {
                return <WrappedComponent {...this.getChildProps()}/>
            }

            getChildProps(): ChildProps<S, A> {
                const { props, state: { asyncProps, loadError } } = this
                if (asyncProps !== void (0)) {
                    return Object.assign({}, this.props, {
                        refresh: this.forceReload,
                        loading: false as false, // type of `false` literal is `boolean` :\
                        async: asyncProps
                    })
                } else if (loadError !== void (0)) {
                    return Object.assign({}, this.props, {
                        refresh: this.forceReload,
                        loading: false as false,
                        loadError
                    })
                } else {
                    return Object.assign({}, this.props, {
                        refresh: this.forceReload,
                        loading: true as true
                    })
                }
            }
        }
    }
}
