import * as React from 'react'
import {Observable} from 'rx'

import {connect, Services, DecoratedProps} from '../decorators/asyncComponent.ts'
import {Repo} from '../util/GitHubClient.ts'

import RepoLink from './RepoLink.tsx'

type Inputs = { username: string }
type Props = DecoratedProps<Inputs, Inputs & {
    loading: boolean,
    repos: Array<Repo>,
    loadError?: Error
}>

class UserRepos extends React.Component<Props, void> {
    static init ({gitHub}: Services, {username}: Inputs): [Props, Observable<Props>] {
        let goToPage: (page: number) => void = () => {}
        const updates = Observable.create<number>(o => {
            goToPage = (i) => o.onNext(i)
            o.onNext(1)
        }).flatMap(
            page => gitHub.getUserRepos(username, page).map(repos => ({
                username,
                repos,
                page,
                goToPage,
                loading: false,
            }))
        )

        return [{username, repos: [], loading: true, goToPage: () => {}}, updates]
    }

    props: Props

    render() {
        const { username, repos, loading, loadError, reset, goToPage, page } = this.props
        const refreshButton = <button onClick={reset}>Refresh repos</button>
        return <div>
            <h3>Repos for user {username} {refreshButton}</h3>
            { loading
            ? <p>Loading ...</p>
            : loadError
                ? <p>Failed to load {loadError.message}</p>
              : <div>
              <RepoList username={username} repos={repos}/>
              { page > 1 && <button onClick={() => goToPage(page-1)}>Prev</button> }
              Page: {page}
              <button onClick={() => goToPage(page+1)}>Next</button>
              </div>
            }
        </div>
    }
}

class RepoList extends React.Component<{username: string, repos: Array<Repo>}, void> {
    render() {
        const {username, repos} = this.props
        return <ul>{repos.map(
            repo => <li key={repo.full_name}><RepoLink repo={repo}/></li>
        )}</ul>
    }
}

export default connect(UserRepos)
