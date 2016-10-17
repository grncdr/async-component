import * as React from "react";
import * as ReactDOM from "react-dom";

import makeDecorator from './decorators/Async'

const asyncComponent = makeDecorator({})

type Props = { username: string }

type AsyncProps = { repos: Array<{ name: string }> }

function loadRepos({username}: Props): Promise<AsyncProps> {
    return fetch(`https://api.github.com/users/${username}/repos`).
        then(r => r.json()).
        then(repos => ({ repos }))
}

class RepoList$ extends React.Component<Props & AsyncProps, void> {
    render() {
        const { username, repos } = this.props
        return <div>
            <h3>{username}</h3>
            <ul>
                {repos.map(repo => <li key={repo.name}>{repo.name}</li>)}
            </ul>
        </div>
    }
}

const RepoList = asyncComponent(loadRepos)(RepoList$)

ReactDOM.render(
    <div><p>Hello world</p><RepoList username="grncdr" /></div>,
    document.getElementById("example")
);
