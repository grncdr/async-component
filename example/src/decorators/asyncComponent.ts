import init from 'react-async-component'
import {PropTypes} from 'react'
import GitHubClient from '../util/GitHubClient.ts'

export type Context = {
    gitHub: GitHubClient
}

const {Provider, connect} = init<Context, void>(
    {
        gitHub: PropTypes.object
    },
    (props: void) => {
        return {
            gitHub: new GitHubClient()
        }
    }
)

export {Provider, connect}
