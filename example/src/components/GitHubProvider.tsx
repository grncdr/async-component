import * as React from 'react'
import GitHubClient from '../util/GitHubClient.ts';

export default class GitHubProvider extends React.Component<void, void> {
    static childContextTypes = {
        gitHub: React.PropTypes.object
    }

    render() {
        return <div>{this.props.children}</div>
    }

    getChildContext() {
        return {
            gitHub: new GitHubClient()
        }
    }
}
