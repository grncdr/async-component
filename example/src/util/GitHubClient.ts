export default class GitHubClient {
    getUserRepos(user: string) {
        return fetch(`https://api.github.com/users/${user}/repos`).then(r => r.json())
    }
}

export interface Repo { name: string }
