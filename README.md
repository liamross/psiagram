<p align="center">
  <a href="https://github.com/liamross/psiagram">
    <img alt="Psiagram" src="assets/psiagram.png?raw=true" width="888" >
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

# 🚧 Under Construction 🚧

> The core functionality is currently under develop, so everything will be
> undergoing massive changes with **no** documentation to justify the changes.
> Once the core of the framework is built and the major decisions have been
> made, documentation will catch up. More than likely everything detailed here
> will change by the final framework, so use at your own discretion.
>
> \- Liam

## Initial plans (now severely outdated, only for reference)

```js
const myPaper = new Paper({ width, height, plugins, ...etc });
myPaper.getPaperElement(); // Returns SVGElement

// TODO:  ...

INodeComponent
INodeComponent.getNodeElement()
INodeComponent.getParameters(): {width height}
INodeComponent.updateProps(some prop change)

myPaper.addNode({
    id: string (unique for paper instance),
    coords: ICoords{ // Top-left corner of the node
        x,
        y,
        [z]
    },
    component: INodeComponent,
    props: IComponentProps{
        [
          content: HTMLElement,
            (or),
          title: string,
          icon: string
      ]
    }
}); // Returns Promise: returns the node object if success, otherwise return error

myPaper.removeNode(id);

myPaper.getNode(id).updateProps({
    ...patchedProps
});

myPaper.addEdge({
    id: string (unique),
    points: [ICoords],
    component: IEdgeComponent,
    props: IEdgeComponentProps{
        [content, (or), title, icon]
    },
    source: { (either an object with id, or ICoords) },
    target: { (either an object with id, or ICoords) }
});

// Collision detection (inside Paper) - will not trigger 'add-edge'
// Workflow Data validation
const myListener = myPaper.addListener('add-edge', async (event, edge) => {
    if (await validate(edge)) {
        try {
            edge.updateProps(new edge or something)
        }
        catch(e) {
            probably remove edge
            // const myEdge = await myPaper.addEdge(edge);
            // this.addEdgeToState(myEdge);
        }
    }
    else {
        myPaper.removeEdge(edge.id)
    }
});

myListener.remove( );
```
