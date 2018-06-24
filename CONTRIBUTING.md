# Contributing to Psiagram

First, ensure you have the [latest `yarn`](https://yarnpkg.com/en/).

> These can also be done with the [latest `npm`](https://docs.npmjs.com/),
> simply follow npm instructions (may need to add 'run' after `$ npm`).

## Cloning Repository

```sh
$ git clone https://github.com/liamross/psiagram.git && cd psiagram

# install node_modules
$ yarn
$ npm i

# bootstrap the packages to build any inter-dependencies
$ yarn bootstrap
$ npm run bootstrap
```

## Commands

### Testing

```sh
$ yarn test
$ npm test

# watch for changes
$ yarn test --watch
$ npm test --watch

# show coverage (will by default)
$ yarn test --coverage
$ npm test --coverage
```

### Linting

> Note: this will likely show an overly-verbose error if there is one. This is
> due to lerna reading the error from the failed lint as an error with the
> scripts.

```sh
$ yarn lint
$ npm run lint

# auto-fix any solvable lint errors
$ yarn lint --fix
$ npm run lint --fix
```

### Develop

```sh
# starts development server of contents in demo folder
$ yarn start
$ npm start

# cleans the dist and cache folders, then starts development server
$ yarn start-clean
$ npm run start-clean

# builds the files, then starts development server
$ yarn start-build
$ npm run start-build

# builds the files, cleans the dist and cache folders, then starts development
# server
$ yarn start-build-clean
$ npm run start-build-clean
```

### Build

> Clean is run on relevant folder prior to build to avoid issues.

```sh
# build full version with type files in lib folder
$ yarn build
$ npm run build
```

### Clean

```sh
# delete dist and .cache folders (cleans before development server)
$ yarn clean-dev
$ npm run clean-dev

# delete all build folders (run automatically by build command)
$ yarn clean-build
$ npm run clean-build

# delete all node_modules folders
$ yarn clean-deep
$ npm run clean-deep

# runs all of the above cleans
$ yarn clean-all
$ npm run clean-all
```
