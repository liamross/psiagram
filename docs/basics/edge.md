# Edge

Edges dictate the flow of a diagram in Psiagram. Edge classes detail all the
rendering information for Edge lines rendered onto Paper, such as color and
title. Again, various objects in the Psiagram ecosystem contain the Edge name,
with each referring to a specific part of the Edge lifecycle. Let's take a look.

## Paper Input Edge

This is the 'Edge' that is input into Paper to create an Edge. This can be given
in the `edges` array in the `initialConditions` object when initializing Paper,
or in the `addEdge` method call. See the [paper section](paper.md) for more on
the initialization details or method definitions.

### IPaperInputEdge Specification

Here is the Paper Input Edge interface defined in TypeScript:

```ts
interface IPaperInputEdge {
  id: string;
  component: string;
  source: edgeEndPoint;
  target: edgeEndPoint;
  coords: ICoordinates[];
  properties?: {
    title?: string;
  };
}
```

This defines the shape of the object that must be given to Paper to create an
Edge. Let's take a look into what each of those potential properties mean.

#### id - `string`

This is the unique ID of the Edge. These **must** be unique amongst other Edges
on the instance of Paper.

#### component - `string`

This string maps to an Edge class within the
`initialConditions.edgeComponentMap` object that the Paper was initialized with.
This allows you to map different Edges to different Edge classes, allowing for
Edges with various colors and widths.

#### source - `edgeEndPoint`

This is the source from which the Edge extends. This has the type
`edgeEndPoint`, which is an object that contains either an id of a Node, or a
set of coordinates. If `id` is given, the Edge will point to the Node with that
ID. If no Node matches the given ID, the Edge will not be added.

- edgeEndPoint:

  ```ts
  declare type edgeEndPoint = { id: string } | ICoordinates;
  ```

- iCoordinates:

  ```ts
  interface ICoordinates {
    x: number;
    y: number;
  }
  ```

#### target - `edgeEndPoint`

This is the target from which the Edge points to. This has the type
`edgeEndPoint`, which is an object that contains either an id of a Node, or a
set of coordinates. If `id` is given, the Edge will point to the Node with that
ID. If no Node matches the given ID, the Edge will not be added.

#### coords - `ICoordinates[]`

An array of coordinates that the Edge path should pass through in order. These
will snap to the nearest grid point.

#### properties (optional) - `Object`

Properties is where you define any properties to pass into Edge when it's
initialized. These will be entirely dependent on what properties your custom
Edge accepts. For example, a basic TextLine may have most of the style built in,
but may accept a title to display:

```ts
const properties = {
  title: 'My Rectangle',
};
```

For more information visit the
[custom Edges section](../in-depth/custom-edges.md).

### Example

Here's an example of how to add an Edge to the Paper using the Paper Input Edge
object:

```ts
function addEdge() {
  const edge: IPaperInputEdge = {
    id: 'new_edge_test',
    component: 'text-edge',
    source: { id: 'new_node_test' },
    target: { x: 240, y: 120 },
    coords: [{ x: 140, y: 160 }],
    properties: { title: 'New Edge' },
  };

  myPaper.addEdge(edge);
}
```

## Edge Class

This is the class that defines the render details of an Edge. It is passed into
Paper as the component property of Paper Input Edge. Creating Edges with
different colors and other characteristics requires extending the Edge class.
Creating custom Edges is detailed in the
[custom edges section](../in-depth/custom-edges.md). You will never interact
directly with a Edge class, it is only passed in to the Paper. when you call the
`getEdge` method, it actually returns an augmented version of the Edge class
that will be discussed next.

## Paper Edge

When Edge classes are initialized within Paper, they have special proxy
properties added to them that simplify the process of changing the source,
target, and coordinates of the Edge. Without customization, an Edge class
exposes the get/set methods for all properties passed in with the `properties`
object detailed above. _Any custom implementation of Edge may take different
properties, and thus may have different get/set methods_. Paper adds get/set
methods for **source**, **target**, and **coords** to the Edge, thus returning a
new object we call PaperEdge.

We will run through some of the potential uses for PaperEdge.

```ts
// Reminder: getEdge(id: string): PaperEdge

const yourEdge = getEdge('your-edge-id');
```

Once you have your PaperEdge, you can manipulate the properties directly. All of
the DOM manipulation logic should be wrapped inside of get/set methods, so it's
as simple as re-assigning the properties. Here's one example from a Edge with
text:

```ts
yourEdge.title = 'New Title';
```

These properties will be updated automatically in the DOM. However, this ability
would have been available on the Edge class, let's look at updating the
coordinates, something only available to the `yourEdge` PaperEdge returned from
Paper.

```ts
yourEdge.source = { id: 'some-node-id' };
yourEdge.target = { x: yourEdge.target.x, y: 120 };
// ES6
yourEdge.coords = [...yourEdge.coords, { x: 20, y: 40 }];
// ES5
yourEdge.coords = yourEdge.coords.concat([{ x: 20, y: 40 }]);
```

Each of these changes will update in the DOM automatically, and will also fire a
`move-edge` event. More detail on events can be found in the
[events section](../in-depth/events.md).

**Gotcha**: Because this uses getters and setters to wrap the DOM manipulation
logic, you must re-assign the properties entirely. You can't do something like:

```ts
yourEdge.target.x = 50;
```

This just changes the x property of the object without actually calling the
setter. Therefore, none of the wrapped DOM manipulation logic will fire. Notice
that for `yourEdge.coords`, the array spread operator (or concat) was used when
adding a new element to the end of the array rather than using push. This is so
that a new array is assigned to coords in order to fire the setter.
