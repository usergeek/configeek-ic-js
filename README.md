# Configeek-IC-JS

Configeek JavaScript IC SDK for Internet Computer can be installed as an npm package.

## Installation

### NPM

Install the npm package and embed Configeek JavaScript IC SDK into your project.

```sh
npm install configeek-ic-js
```

Import Configeek JavaScript IC SDK into your code.

```javascript
import {Configeek} from "configeek-ic-js";
//or
const {Configeek} = require("configeek-ic-js")
```

## Usage

### Initialization

Configeek JavaScript IC SDK must be initialized in order to use any method available.
The only exception is `Configeek.isInitialized` getter which can be used to check if SDK is initialized.

Project API key is needed to initialise Configeek JavaScript IC SDK.

It can be found in your project settings at [https://configeek.app](https://configeek.app).

```typescript
const config: InitConfig = {
    apiKey: "<API_KEY>",
}
Configeek.init(config)
```

`InitConfig` has the following interface:

```typescript
export type InitConfig = {
    /**
     * Project API key
     */
    apiKey: string,
    /**
     * Whether to fetch the configuration periodically. `false` by default
     */
    periodicFetchingEnabled?: boolean
    /**
     * Callback that notifies about updated keys in configuration
     * @param {{ updatedKeys: Array<string> }} result
     */
    onConfigurationUpdatedCallback?: (result: { updatedKeys: Array<string> }) => void
    /**
     * Periodic fetch interval. `300000` by default (5 minutes in milliseconds). One minute minimal.
     */
    fetchIntervalMillis?: number
    /**
     * Actor configuration. Used when Configeek library is used in a project running on local replica.
     */
    localReplicaConfig?: ReplicaConfig
}
```

### Working with configuration

All configuration related data stored in browser's `localStorage`

#### Get all configuration

```typescript
const allConfiguration: Record<string, string> | undefined = Configeek.getAll()
```

#### Get value of a key

```typescript
const myKeyValue: sting | undefined = Configeek.getValue("myKey")
```

#### Periodical fetching

Periodical fetching can be used to monitor configuration changes automatically without manual fetch.

##### periodical fetching status

```typescript
const enabled: boolean = Configeek.isPeriodicFetchingEnabled
```

##### start periodical fetching

```typescript
Configeek.startPeriodicFetching()
```

##### stop periodical fetching

```typescript
Configeek.stopPeriodicFetching()
```

#### Manual fetching

Configuration can be fetched manually at any time (after initialization)

```typescript
Configeek.fetchConfig()
```

#### Cleanup

Sometimes it is worth to delete all data related to configuration.
This method stops periodical fetching and removes all data stored in `localStorage`.

```typescript
Configeek.destroy()
```



## Configeek on environments other than IC main network

In order not to mix configuration from development environment with configuration from production environment we suggest separating development (DEV) and production (PROD) environments by creating additional project in Configeek portal.

Initialization in the code would look like this:
```javascript
const CONFIGEEK_PROJECT_API_KEY_PROD = "ABCD"
const CONFIGEEK_PROJECT_API_KEY_DEV = "EFGH"

if (process.env.NODE_ENV === "development") {
    Configeek.init({apiKey: CONFIGEEK_PROJECT_API_KEY_DEV})
} else {
    Configeek.init({apiKey: CONFIGEEK_PROJECT_API_KEY_PROD})
}
```