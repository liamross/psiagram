# Contributing to Psiagram

First, ensure you have the [latest `yarn`](https://yarnpkg.com/en/).

To get started with the repo:

```sh
$ git clone https://github.com/liamross/psiagram.git && cd psiagram

$ yarn
```

## Commands

### Testing

```sh
$ yarn test

# watch for changes
$ yarn test --watch

# show coverage
$ yarn test --coverage
```

### Linting

```sh
$ yarn lint

# auto-fix any solvable lint errors
$ yarn lint --fix
```

### Develop

```sh
# starts development server of contents in demo folder
$ yarn start
```

### Build

> NOTE: These may change if the project is moved to Webpack from Parcel

To build a single-file minified version of the project to `dist/`:

```sh
$ yarn build
```

To build the final version with type files and comments in `lib/`:

```sh
# build full version with type files in lib folder
$ yarn build

# build parcel minified single file in dist folder
$ yarn parcel-build
```
