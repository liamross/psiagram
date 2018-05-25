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
```

## Commands

### Testing

```sh
$ yarn test
$ npm test

# watch for changes
$ yarn test --watch
$ npm test --watch

# show coverage
$ yarn test --coverage
$ npm test --coverage
```

### Linting

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
```

### Build

> Clean is run on relevant folder prior to build to avoid issues.

```sh
# build full version with type files in lib folder
$ yarn build
$ npm run build

# build parcel minified single file in dist folder
$ yarn build:parcel
$ npm run build:parcel
```

### Clean

```sh
# delete dist and lib folders
$ yarn clean
$ npm run clean

# delete dist folder
$ yarn clean:dist
$ npm run clean:dist

# delete lib folder
$ yarn clean:lib
$ npm run clean:lib
```
