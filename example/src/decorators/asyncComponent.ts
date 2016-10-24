import init, {DecoratedProps} from 'react-async-component'
import {PropTypes} from 'react'
import GitHubClient from '../util/GitHubClient.ts'

export type DecoratedProps<I, O> = DecoratedProps<I, O>

export type Services = {
    gitHub: GitHubClient
}

const {Provider, connect} = init<Services, {}>(
    {
        gitHub: PropTypes.object
    },
    (props: {}) => {
        return {
            gitHub: new GitHubClient()
        }
    }
)

export {Provider, connect}
