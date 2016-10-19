import * as React from 'react'
import * as ReactDOM from "react-dom";

import GitHubProvider from './components/GitHubProvider.tsx'
import Thing from './components/Thing.tsx'
import UserRepos from './components/UserRepos.tsx'

ReactDOM.render(
    <GitHubProvider>
        <Thing/>
        <UserRepos username="grncdr"/>
    </GitHubProvider>,
    document.getElementById("example")
);
