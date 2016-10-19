import * as React from 'react'
import {Repo} from '../util/GitHubClient.ts'

export default function RepoLink({repo}: {repo: Repo}) {
    return <span>
        <a style={{color: 'green'}} href={repo.html_url}>{repo.full_name}</a> - {repo.description}
    </span>
}
