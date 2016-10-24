import * as React from 'react'
import * as ReactDOM from "react-dom";

import {Provider} from './decorators/asyncComponent.ts'
import Thing from './components/Thing.tsx'
import UserRepos from './components/UserRepos.tsx'

const username = window.location.hash.substr(1) || 'grncdr'
ReactDOM.render(
    <Provider>
        <UserRepos username={username}/>
    </Provider>,
    document.getElementById("example")
);
