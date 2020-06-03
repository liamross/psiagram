# Events

Events allow the Paper to **report on actions** happening internally, and give you the opportunity to **react** to and **manipulate** these actions. Events allow you to structure listeners to manipulate actions and unlock the full potential of Psiagram.

## Examples

Before we dive into the methods and properties of an event, let's touch on some basic examples of what events can achieve.

### Simple

First, let's look at a very simple example of a listener for an event.

```typescript
function addNodeAnnouncement(evt) {
	console.log('Added Node. ID: ' + evt.target.id);
}

myPaper.addListener(PaperEventType.AddNode, addNodeAnnouncement);
```

In the example above, every time a Node is added to the Paper, it will log the ID of the added Node.

### Cancelling events

However, where events really shine is by giving control over the event to any listeners. Here's an example of a listener that stops an event from continuing.

```typescript
function noTallNodes(evt) {
	const height = evt.target.instance.height;
	if (height > 150) {
		evt.preventDefault();
		evt.stopPropagation();
		console.error('Can not add Node with height > 150px');
	}
}

myPaper.addListener(PaperEventType.AddNode, noTallNodes);
```

This listener checks the height, and if it exceeds 150px, it calls preventDefault to prevent the default action of the event \(adding the Node to Paper\) and stopPropagation to prevent the event from propagating to any additional listener functions. We will discuss the various methods and properties of an event below.

### Transforming data

One final example, and we will get into the internals of an event. In this example, the listener actually updates the data that will be used by the default action of the event once it has gone through every listener.

```typescript
function addNodeToCorner(evt) {
	evt.data.x = 0;
	evt.data.y = 0;
}

myPaper.addListener(PaperEventType.AddNode, addNodeToCorner);
```

For an AddNode event, the default action will be to add the Node to the paper at the coordinates specified. For a case like this, you don't want to prevent the default, nor do you want to stop the event from propagating \(in case additional listeners do important actions based on the event\). What you do want is to update the data that will be used by the default action once it is fired \(once every listener has been called\).

{% hint style="info" %} For a more complex example, check out the [`_updateEdgeRoute`](https://github.com/liamross/psiagram/blob/12bc468c635796223c4ab8ccf3f8559b470f3c9a/packages/psiagram-plugin-routing/src/plugin/ManhattanRouting.ts#L68-L108) method within the ManhattanRouting plugin repository \(this is an example of transforming data\). Now we will take a deeper look into events. {% endhint %}

## Event API

Each event has a set of properties and methods that allow you to view and manipulate the lifecycle of an event. When used together, these allow for complete control over the actions within Psiagram.

### eventType

```typescript
// To get the event type from an event:
const eventType = evt.eventType;
```

The event type defines what type of action the event represents. The events that are fired by Paper will have a type defined within the enum `PaperEventType`. For more information on each of the events fired by Paper, go to the [Paper Events](events.md#paper-events) section.

```typescript
enum PaperEventType {
	AddNode = 'add-node',
	MoveNode = 'move-node',
	RemoveNode = 'remove-node',
	AddEdge = 'add-edge',
	MoveEdge = 'move-edge',
	RemoveEdge = 'remove-edge',
	PaperInit = 'paper-init',
	UpdateActiveItem = 'update-active-item',
}
```

{% hint style="info" %} **For advanced users**: Event types can be any string. If you are writing a plugin or wish to fire a custom event, you can use the advanced Paper method [\_fireEvent](advanced-paper-methods.md#_fireevent). {% endhint %}

### target

```typescript
// To get the target of an event:
const target = evt.target;
```

The target is whatever the event is acting on. This could simply return `undefined` in the case of [PaperInit](events.md#paperinit), or it could be a stored Node in the case of [MoveNode](events.md#move-node).

### data

```typescript
// To get the data of an event:
const data = evt.data;
```

The data object contains any values that will be used by the default action once every listener for an event has been called. The default action is called with the data object. Therefore, these can be manipulated to change the result of the default action, as seen in the [transforming data](events.md#transforming-data) example. The data object is different for every action fired. Check the [Paper events](events.md#paper-events) below to see the specific data each event is fired with.

### paper

```typescript
// To get a reference to the paper that fired the event:
const paper = evt.paper;
```

This provides a reference to the Paper that fired the event. This can be useful for calling any [Paper methods](../basics/paper.md#paper-methods) in response to the event.

### defaultAction\(\)

```typescript
// To fire the default action:
evt.defaultAction();
```

Once all listeners for a particular event have been called, the Paper will call the event's default action with the data object. However, you may wish to call it early using the `defaultAction` method. This method can only be called once \(imagine the issues it would cause if [AddNode's](events.md#addnode) default action fired twice\). If it is called early using this method, it will not be called again once all event listeners have been called. As such, in many cases this should be used with [stopPropagation](events.md#stoppropagation), since there may be no need for any further listeners to be called once the default action is fired.

### preventDefault\(\)

```typescript
// To prevent the default action from firing:
evt.preventDefault();
```

Prevent default can be called on the event in order to prevent the default action from being called after every listener is called. This could be used in a validation listener to prevent illegal operations within Paper. In many cases this should be used with [stopPropagation](events.md#stoppropagation), since there may be no need for any further listeners to be called once the default action is cancelled.

### stopPropagation\(\)

```typescript
// To stop Paper from calling any other listeners:
evt.stopPropagation();
```

Calling this method will prevent any further listeners from being called. If you call this method alone, then once the listener returns the Paper will immediately fire the default action. However, it is usually used in combination with [defaultAction](events.md#defaultaction) or [preventDefault](events.md#preventdefault) to avoid unnecessary calls to other listeners once the default action has been preemptively fired or cancelled.

## Paper Events

There are various events that are fired by Paper whenever an action occurs. Each event has a specific target, data object and default action.

### AddNode

#### Target

```typescript
IPaperStoredNode;
```

#### Data

```typescript
{
	x: number;
	y: number;
}
```

#### Default action

Add the stored Node at the `x` and `y` coordinates.

### Move Node

#### Target

```typescript
IPaperStoredNode;
```

#### Data

```typescript
{
	coords: ICoordinates;
	oldCoords: ICoordinates;
}
```

#### Default action

Move the stored Node from `oldCoords` to `coords`.

### RemoveNode

#### Target

```typescript
IPaperStoredNode;
```

#### Data

```typescript
undefined;
```

#### Default action

Remove the target Node.

### AddEdge

#### Target

```typescript
IPaperStoredEdge;
```

#### Data

```typescript
undefined;
```

#### Default action

Add the Edge to the Paper.

### MoveEdge

#### Target

```typescript
IPaperStoredEdge;
```

#### Data

```typescript
{
  source: {
    node: IPaperStoredNode | null;
    midpoint: ICoordinates | null;
    point: ICoordinates | null;
  };
  target: {
    node: IPaperStoredNode | null;
    midpoint: ICoordinates | null;
    point: ICoordinates | null;
  };
  coords: ICoordinates[];
}
```

#### Default action

Move the Edge on the paper. If the source/target is a Node, then `node` and `midpoint` will be provided and `point` will be null within `data`. If it is a coordinate point, then `node` and `midpoint` will be null, and `point` will be provided within `data`. The default action is to trim the Edge at the end of either endpoint Node \(if there is one\), and then connect all of the coordinates.

### RemoveEdge

#### Target

```typescript
IPaperStoredEdge;
```

#### Data

```typescript
undefined;
```

#### Default action

Remove the target Edge.

### PaperInit

#### Target

```typescript
undefined;
```

#### Data

```typescript
undefined;
```

#### Default action

No default action. This is only fired once on the last line of the Paper constructor function. It ensures that any listeners know that any internal properties of Paper have been initialized and it is safe to use the [Paper methods](../basics/paper.md#paper-methods).

### UpdateActiveItem

#### Target

```typescript
IActiveItem | null;
```

#### Data

```typescript
{
	activeItem: IActiveItem | null;
	oldActiveItem: IActiveItem | null;
}
```

#### Default action

Update the active item from `oldActiveItem` to `activeItem`. The old item could be null if there was none and an item is becoming active, or the current could be null if there is no current active item.
