import * as React from 'react'
// import hoistNonReactStatics = require('hoist-non-react-statics')

// We depend on a minimal subset of observables so define our own interface
export interface Observable<A> {
    subscribe: (fn: (val: A) => void) => Disposable
}

export interface Disposable {
    dispose: () => void
}


export type ContextTypes = {[key: string]: Function}
// Maybe this feature will make it in TS 2.1
// type ContextTypes<Context> = {[key: keysof Context]: Function}

export type DecoratedProps<Inputs, Props> =
    Props & { reset: () => void }

export type Init<Context, Inputs, Props> =
    (context: Context, inputs: Inputs, state: ContainerState<Props>) => [Props, Observable<Props>]

export interface LoadableComponent<Context, Inputs, Props> {
    new(): React.Component<DecoratedProps<Inputs, Props>, any>,
    init: Init<Context, Inputs, Props>,
    name?: string,
    displayName?: string
}

export type Container<S, A> = { new(): React.Component<S, ContainerState<A>> }
export type ContainerState<A> = { observedProps?: A, observable?: Observable<A>, disposable?: Disposable }

export type Decorator<C> =
    <S, A>(Component: LoadableComponent<C, S, A>) => Container<S, A>

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
            return React.Children.only(this.props.children || React.createElement('div'))
        }
    }
}

export function makeDecorator<Context>(contextTypes: ContextTypes): Decorator<Context> {
    return function<Inputs, Props>(WrappedComponent: LoadableComponent<Context, Inputs, Props>): Container<Inputs, Props> {
        const init = WrappedComponent.init

        class ObservableContainer extends React.Component<Inputs, ContainerState<Props>> {
            static displayName = `Observer(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
            static WrappedComponent = WrappedComponent
            static contextTypes = contextTypes

            context: Context

            props: Inputs
            state: ContainerState<Props> = {}

            componentWillMount() {
                this.initSubscription(this.props)
            }

            componentWillReceiveProps(nextProps: Inputs) {
                this.initSubscription(nextProps)
            }

            componentWillUnmount() {
                if (this.state.disposable) {
                  this.state.disposable.dispose()
                }
            }

            initSubscription(props: Inputs) {
                const { context, state } = this

                const [initialProps, newObservable] = init(context, props, state)

                if (state.observable === newObservable) {
                    return
                }

                if (state.disposable) {
                    state.disposable.dispose()
                }

                const newDisposable = newObservable.subscribe(this.handleNewProps)
                this.setState({
                    observedProps: initialProps,
                    observable: newObservable,
                    disposable: newObservable.subscribe(this.handleNewProps)
                })
            }

            reset = () => this.initSubscription(this.props)

            handleNewProps = (observedProps: Props) => {
                this.setState(Object.assign({}, this.state, {observedProps}))
            }

            render() {
                return React.createElement(
                    WrappedComponent,
                    Object.assign({reset: this.reset}, this.state.observedProps as Props)
                )
            }
        }

        return ObservableContainer
        //return hoistNonReactStatics(ObservableContainer, WrappedComponent)
    }
}
