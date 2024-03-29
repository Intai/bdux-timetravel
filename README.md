# Bdux TimeTravel

A [Bdux](https://github.com/Intai/bdux) middleware to record and travel back in history.

[![Build Status](https://app.travis-ci.com/Intai/bdux-timetravel.svg?branch=master)](https://app.travis-ci.com/Intai/bdux-timetravel)
[![Coverage Status](https://coveralls.io/repos/github/Intai/bdux-timetravel/badge.svg?branch=master)](https://coveralls.io/github/Intai/bdux-timetravel?branch=master)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/06e413b912b34846858c59e99c797938)](https://www.codacy.com/gh/Intai/bdux-timetravel/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Intai/bdux-timetravel&amp;utm_campaign=Badge_Grade)

## Installation
To install as an [npm](https://www.npmjs.com/) package:
```sh
npm install --save-dev bdux-timetravel
```

## Usage
```javascript
import * as Timetravel from 'bdux-timetravel'
import { applyMiddleware } from 'bdux'

applyMiddleware(
  Timetravel
)
```
Then place `<TimeTravel />` in root component to render a sidebar for time control.
```javascript
import React from 'react'
import { TimeTravel } from 'bdux-timetravel'

const App = () => (
  <>
    <TimeTravel />
  </>
)

export default App
```

## Features
History will be recorded in session storage and resumed automatically on page reload. The recorded history of actions and state changes are displayed in a list. Select an action from the list to travel back in time. Above the list, there are restart and declutch button.
- Restart button to clear history and reload the page.
- Declutch button to stop actions from flowing into stores.
- Clutch button to start engaging stores again.

## License
[The ISC License](./LICENSE.md)
