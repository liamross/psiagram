<p align="center">
  <a href="https://github.com/liamross/psiagram">
    <img alt="Psiagram" src="https://raw.githubusercontent.com/liamross/psiagram/master/logo/logo-title.png" width="888" >
  </a>
</p>

<p align="center">
  Ψ JavaScript diagramming framework for workflows.
</p>

<p align="center">
  <a href="https://github.com/liamross/psiagram/blob/master/LICENSE" target="_blank">
    <img
      alt="License"
      src="https://img.shields.io/github/license/liamross/psiagram.svg"
    >
  </a>
  <a href="https://travis-ci.org/liamross/psiagram" target="_blank">
    <img
      alt="Build"
      src="https://travis-ci.org/liamross/psiagram.svg?branch=master"
    >
  </a>
  <a href="https://codecov.io/gh/liamross/psiagram" target="_blank">
    <img
      alt="Coverage"
      src="https://img.shields.io/codecov/c/github/liamross/psiagram.svg"
    >
  </a>
</p>

---

> 🚧 Under Construction 🚧
>
> The core functionality is currently under development, so everything will be
> undergoing massive changes with **minor** documentation. Once the core of the
> framework is built and the major decisions have been made, documentation will
> catch up. Most code at this stage is highly dynamic, so check back later once
> everything has settled down!

# Use Psiagram

Psiagram is a monorepo, meaning it has multiple packages in one GitHub
repository. This ensures that inter-dependency between packages is maintained,
and allows for consistent versioning between psiagram and its plugins.

## Packages

See the [Official Documentation](https://www.psiagram.org/) for more details on
any of the packages.

### Psiagram

[![NPM Version](https://badge.fury.io/js/psiagram.svg)](https://www.npmjs.com/package/psiagram)

Psiagram is the core package, and contains all of the framework functionality.

To install:

```sh
# If you use Yarn:
yarn add psiagram

# If you use npm:
npm i psiagram
```

To use:

```js
// ES5
var { Psiagram } = require('psiagram');

// ES6
import { Psiagram } from 'psiagram';
```

### Psiagram Plugin Mouse Event

[![NPM Version](https://badge.fury.io/js/psiagram-plugin-mouse-events.svg)](https://www.npmjs.com/package/psiagram-plugin-mouse-events)

Psiagram's official mouse event plugin provides mouse event capabilities such as
selection and drag-and-drop for nodes and edges.

To install:

```sh
# If you use Yarn:
yarn add psiagram-plugin-mouse-handler

# If you use npm:
npm i psiagram-plugin-mouse-handler
```

To use:

```js
// ES5
var { MouseHandler } = require('psiagram-plugin-mouse-handler');

// ES6
import { MouseHandler } from 'psiagram-plugin-mouse-handler';
```
