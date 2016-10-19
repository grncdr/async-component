import * as React from 'react'

import asyncComponent, {Context} from '../decorators/asyncComponent.ts'
import {Repo} from '../util/GitHubClient.ts'

import RepoLink from './RepoLink.tsx'

type Props = { username: string }

type AsyncProps = { repos: Array<Repo> }

class UserRepos extends React.Component<Props & AsyncProps, void> {
    static load = ({gitHub}: Context, {username}: Props): Promise<AsyncProps> => gitHub.getUserRepos(username).then(repos => ({repos}))

    render() {
        const { username, repos } = this.props
        return <div>
            <h3>Repos</h3>
            <ul>
            {repos.map(repo => <li key={repo.full_name}><RepoLink repo={repo}/></li>)}
            </ul>
        </div>
    }
}

export default asyncComponent(UserRepos)
