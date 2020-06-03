# Node

Nodes are the **building blocks** of any diagram in Psiagram. At their most basic they are rectangular SVG components rendered onto Paper. Node classes provide all of the rendering information such as appearance, title placement, etc.

This section will address the input required to create a Node within the Paper, and details the output Node given by Paper.

## Paper Input Node

This is the input given to Paper to create a Node within Psiagram. This can be given in the `nodes` array in the `initialConditions` object when initializing Paper, or in the `addNode` method call. See the [Paper section](paper.md) for more on the initialization details or method definitions.

### IPaperInputNode Specification

Here is the Paper Input Node interface defined in TypeScript:

```typescript
interface IPaperInputNode {
	id: string;
	component: string;
	coords: ICoordinates;
	properties?: {
		[property: string]: any;
	};
}
```

This defines the shape of the object that must be given to Paper to create a Node. Let's take a look into what each of those potential properties mean.

#### id - `string`

This is the unique ID of the Node. These **must** be unique amongst other Nodes on the instance of Paper.

#### component - `string`

This string maps to a custom Node class within the `initialConditions.nodeComponentMap` object that the Paper was initialized with. This allows you to map different Nodes to different Node classes, allowing for Nodes with various colors, shapes and sizes. Information on Paper's initial conditions can be found [here](paper.md), and custom Nodes information is [here](../in-depth/custom-nodes.md).

#### coords - `ICoordinates`

The coordinates at which the Node sits on Paper. The default behavior is that Node will snap to the nearest grid if `gridSize` was provided to Paper.

-   iCoordinates:

    ```typescript
    interface ICoordinates {
    	x: number;
    	y: number;
    }
    ```

#### properties \(optional\) - `Object`

Properties is where you define any properties to pass into Node when it's initialized. These will be entirely dependent on what properties your custom Node accepts. For example, if your Node is a rectangle that displayes text, your properties object may look like this:

```typescript
const properties = {
	title: 'My Rectangle',
	width: 160,
	height: 80,
};
```

Whereas if it's a square perhaps you might have a slightly simpler set of properties:

```typescript
const properties = {
	title: 'My Square',
	length: 80,
};
```

For more information visit the [custom Nodes section](../in-depth/custom-nodes.md).

### Example

Here's an example of how to add a Node to the Paper using the Paper Input Node object. A custom Node would have been given when Paper was initialized, with a key matching `'rectangle'`. That custom Node will be initialized with the provided properties upon calling addNode.

```typescript
function addNode() {
	const node: IPaperInputNode = {
		id: 'new_node_test',
		component: 'rectangle',
		coords: {x: 320, y: 160},
		properties: {title: 'New Node', height: 80, width: 160},
	};

	myPaper.addNode(node);
}
```

## Paper Node

While the Paper Input Node is the input to the Paper, the Paper Node is the output. In many ways, you can think of it as an initialized Node class. Whichever custom Node class was specified by the component property of the Paper Input Node, will now be passed back as the Paper Node.

However, there is an additional property that has been added to a Paper Edge.

-   **`coords`** - The coordinates of the Node on Paper

Of course, these are in addition to any properties defined by the custom Node \(example: every Node must expose a `width` and `height` property, and some custom Nodes could expose something like `title`\).

We will run through some of the potential uses for PaperNode.

```typescript
// Reminder: getNode(id: string): PaperNode

const yourNode = getNode('your-node-id');
```

Now that you have your Paper Node, you can manipulate the `coords` property to position it on the Paper:

```typescript
yourNode.coords = {x: yourNode.coords.x, y: 120};
```

Here, we have kept the x-coordinate the same, but updated the y-coordinate to 120. This will update in the DOM automatically, and will also fire a `move-node` event. More detail on events can be found in the [events section](../in-depth/events.md).

{% hint style="warning" %} Because this uses getters and setters to wrap the DOM manipulation logic, you must re-assign `yourNode.coords` entirely. You **can't** do something like:

```typescript
yourNode.coords.x = 50;
```

This just changes the x-property of the object **without calling the set method**. Therefore, none of the wrapped DOM manipulation logic will fire. Since the object itself **remains the same**, the set method for coords **will not be triggered** and none of the DOM manipulation logic will fire. {% endhint %}
