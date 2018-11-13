# Edge

Edges **dictate flow** within Psiagram. They can often be thought of as lines connecting the Nodes within a diagram. Edge classes detail all the rendering information for Edge lines rendered onto Paper, such as color and title.

This section will address the input required to create an Edge within the Paper, and details the output Edge given by Paper.

## Paper Input Edge

This is the input given to Paper to create an Edge within Psiagram. This can be given in the `edges` array in the `initialConditions` object when initializing Paper, or in the `addEdge` method call. See the [Paper section](paper.md) for more on the initialization details or method definitions.

### IPaperInputEdge Specification

Here is the Paper Input Edge interface defined in TypeScript:

```typescript
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

This defines the shape of the object that must be given to Paper to create an Edge. Let's take a look into what each of those potential properties mean.

#### id - `string`

This is the unique ID of the Edge. These **must** be unique amongst other Edges on the instance of Paper.

#### component - `string`

This string maps to an Edge class within the `initialConditions.edgeComponentMap` object that the Paper was initialized with. This allows you to map different Paper Input Edges to different Edge classes, allowing for each Edge to have different colors and widths. Information on Paper's initial conditions can be found [here](paper.md), and custom Edge information is [here](../in-depth/custom-edges.md).

#### source - `edgeEndPoint`

This is the source from which the Edge extends. This has the type `edgeEndPoint`, which is an object that contains either an id of a Node, or a set of coordinates. If `id` is given, the Edge will point to the Node with that ID. If no Node matches the given ID, the Edge will not be added.

* edgeEndPoint:

  ```typescript
  type edgeEndPoint = { id: string } | ICoordinates;
  ```

* iCoordinates:

  ```typescript
  interface ICoordinates {
    x: number;
    y: number;
  }
  ```

#### target - `edgeEndPoint`

This is the target from which the Edge points to. This has the type `edgeEndPoint`, which is an object that contains either an id of a Node, or a set of coordinates. If `id` is given, the Edge will point to the Node with that ID. If no Node matches the given ID, the Edge will not be added.

#### coords - `ICoordinates[]`

An array of coordinates that the Edge path should pass through in order. These will snap to the nearest grid point.

#### properties \(optional\) - `Object`

Properties is where you define any properties to pass into Edge when it's initialized. These will be entirely dependent on what properties your custom Edge accepts. For example, a basic TextLine may have most of the style built in, but may accept a title to display:

```typescript
const properties = {
  title: 'My Line',
};
```

For more information visit the [custom Edges section](../in-depth/custom-edges.md).

### Example

Here's an example of how to add an Edge to the Paper using the Paper Input Edge object. In this case, Paper would have been initialized with a custom Edge class inside of `edgeComponentMap` initial properties, with the key `'text-edge'`. This custom Edge will be initialized with the provided properties upon calling addEdge.

```typescript
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

## Paper Edge

While the Paper Input Edge is the input to the Paper, the Paper Edge is the output. In many ways, you can think of it as an initialized Edge class. Whichever custom Edge class was specified by the component property of the Paper Input Edge, will now be passed back as the Paper Edge.

However, there are three additional properties added to a Paper Edge.

* `source` - The ID of the source Node, or a coordinate point.
* `target` - The ID of the target Node, or a coordinate point.
* `coords` - An array of additional coordinate points for the Edge to pass through.

Of course, these are in addition to any properties defined by the custom Edge \(example: a `title` property or a `strokeWidth` property\).

We will run through some of the potential uses for PaperEdge.

```typescript
// Reminder: getEdge(id: string): PaperEdge

const yourEdge = getEdge('your-edge-id');
```

Now that you have your Edge, you can manipulate the additional properties:

```typescript
// Updating source and target
yourEdge.source = { id: 'some-node-id' };
yourEdge.target = { x: yourEdge.target.x, y: 120 };

// Adding an additional coordinate point
/* ES6 */
yourEdge.coords = [...yourEdge.coords, { x: 20, y: 40 }];
/* ES5 */
yourEdge.coords = yourEdge.coords.concat([{ x: 20, y: 40 }]);
```

Each of these changes will update in the DOM automatically, and will also fire a `move-edge` event. More detail on events can be found in the [events section](../in-depth/events.md).

{% hint style="warning" %}
Because this uses getters and setters to wrap the DOM manipulation logic, you must re-assign the properties entirely. You **can't** do something like:

```typescript
yourEdge.target.x = 50;
```

This just changes the x-property of the object **without calling the set method**. Since the object itself **remains the same**, the set method for target **will not be triggered** and none of the DOM manipulation logic will fire. Notice that for `yourEdge.coords`, the array spread operator \(or concat\) was used when adding a new element to the end of the array rather than using push. This is so that a new array is assigned to coords in order to trigger the set method.
{% endhint %}

