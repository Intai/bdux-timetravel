# Bdux TimeTravel

A [Bdux](https://github.com/Intai/bdux) middleware to record and travel back in history.

## Installation
To install as an [npm](https://www.npmjs.com/) package:
```
npm install --save-dev bdux-timetravel
```

## Usage
``` javascript
import * as Timetravel from 'bdux-timetravel';
import { applyMiddleware } from 'bdux';

applyMiddleware(
  Timetravel
);
```
Then place `<TimeTravel />` in root component to render a sidebar for time control.
``` javascript
import React from 'react';
import { TimeTravel } from 'bdux-timetravel';

const App = () => (
  <div>
    <TimeTravel />
  </div>
);

export default App;
```

## Features
Resume
Restart
Declutch
Action

## License
[The ISC License](./LICENSE.md)
