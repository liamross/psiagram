<p align="center">
  <a href="https://github.com/liamross/workflow">
    <img alt="Psiagram" src="assets/psiagram.png?raw=true" width="888" >
  </a>
</p>

<p align="center">
  Ψ JavaScript diagramming framework for workflows.
</p>

<p align="center">
  <a href="https://travis-ci.org/liamross/workflow">
    <img alt="License" src="https://travis-ci.org/liamross/workflow.svg?branch=master">
  </a>
</p>

---

> NOTE: Documentation will likely be a last step, as of right now the
> functionality is in development, so more than likely everything detailed here
> will change by the final framework.

# Old Documentation (only use for reference)

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
