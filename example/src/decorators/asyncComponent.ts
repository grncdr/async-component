import makeDecorator from 'react-async-component'
import {PropTypes} from 'react'
import GitHubClient from '../util/GitHubClient.ts'

export type Context = {
    gitHub: GitHubClient
}

export default makeDecorator<Context>({
    gitHub: PropTypes.object
})
