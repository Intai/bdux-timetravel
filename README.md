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
History will be recorded in session storage and resumed automatically on page reload. The recorded history of actions and state changes are displayed in a list. Select an action from the list to travel back in time. Above the list, there are restart and declutch button.
- Restart button to clear history and reload the page.
- Declutch button to stop actions from flowing into stores.
- Clutch button to start engaging stores again.

## License
[The ISC License](./LICENSE.md)
