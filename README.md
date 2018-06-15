<p align="center">
  <a href="https://github.com/liamross/psiagram">
    <img alt="Psiagram" src="https://raw.githubusercontent.com/liamross/psiagram/master/logo/logo-title.png" width="700" >
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

Psiagram is a framework that enables anyone to build complex and interactive
diagrams and workflows easily, in any project, and without the need for external
dependencies.

# Use Psiagram

For instructions on how to use Psiagram, as well as documentation on the API,
use in your project, and all of the official plugins, see the
[Official Documentation](https://www.psiagram.org/).

For instructions on how to **work with the GitHub repository**, including
cloning, initializing and running, see the
[Contributing Document](https://github.com/liamross/psiagram/blob/master/CONTRIBUTING.md).

Psiagram is a monorepo, meaning it has multiple packages in one GitHub
repository. This ensures that inter-dependency between packages is maintained,
and allows for consistent versioning between psiagram and its plugins.

## Packages

- [Psiagram](#psiagram)
- [Psiagram Plugin Mouse Events](#psiagram-plugin-mouse-events)

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
var { Paper, Node, Edge } = require('psiagram');

// ES6
import { Paper, Node, Edge } from 'psiagram';
```

### Psiagram Plugin Mouse Events

[![NPM Version](https://badge.fury.io/js/psiagram-plugin-mouse-events.svg)](https://www.npmjs.com/package/psiagram-plugin-mouse-events)

Psiagram's official mouse event plugin provides mouse event capabilities such as
selection and drag-and-drop for nodes and edges.

To install:

```sh
# If you use Yarn:
yarn add psiagram-plugin-mouse-events

# If you use npm:
npm i psiagram-plugin-mouse-events
```

To use:

```js
// ES5
var { MouseEvents } = require('psiagram-plugin-mouse-events');

// ES6
import { MouseEvents } from 'psiagram-plugin-mouse-events';
```
