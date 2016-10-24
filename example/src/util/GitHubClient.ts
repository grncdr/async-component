import {Observable} from 'rx'

export default class GitHubClient {
    getUserRepos(user: string, page: number): Observable<Array<Repo>> {
        return Observable.amb(
            fetch(`https://api.github.com/users/${user}/repos?page=${page}`).then(r => r.json() as Promise<Array<Repo>>)
        )
    }
}

export interface Repo { name: string }
