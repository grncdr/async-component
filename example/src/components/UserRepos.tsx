import * as React from 'react'

import asyncComponent, {Context} from '../decorators/asyncComponent.ts'
import {Props as AsyncProps} from 'react-async-component'
import {Repo} from '../util/GitHubClient.ts'

import RepoLink from './RepoLink.tsx'

type Props = AsyncProps<{ username: string }, { repos: Array<Repo> }>

function delay<T>(v: T) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, Math.random() * 1000 + 500, v)
    })
}

class UserRepos extends React.Component<Props, void> {
    static load = ({gitHub}: Context, {username}: Props): Promise<typeof Props.async> => gitHub.getUserRepos(username).then(delay).then(repos => ({repos}))

    render() {
        const { username, loading, loadError, refresh } = this.props
        if (loading) {
            return <p>Loading repos for {username} ...</p>
        }

        const refreshButton = <button onClick={refresh}>Refresh repos</button>
        if (loadError) {
            return <p>Failed to load repos for {username} {loadError.message} {refreshButton}</p>
        }
        const { repos } = this.props.async
        return <div>
            <h3>Repos</h3>
            {refreshButton}
            <ul>
            {repos.map(repo => <li key={repo.full_name}><RepoLink repo={repo}/></li>)}
            </ul>
        </div>
    }
}

export default asyncComponent(UserRepos)
