# Custom Edges

Edges are the **connective elements** within a Psiagram Paper. They could be any connective shape: a simple black line, or a clickable arrow with a title block. This section exposes the API of Edges and describes the steps needed to build your first custom Edge.

But first, some links to various Edge files:

1. [Base Edge](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/BaseEdge.ts)
   * Provides the base implementation of Edge. Every Edge must extend this class

     \(or if not, it must at least be in the prototype chain\)

   * Must be extended in order to be functional
2. [Line](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/EdgeLibrary/Line.ts)
   * Provides an extended Edge that renders a black arrow
   * Functional as is \(does not need to be extended\)
3. [Text Line](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/EdgeLibrary/TextLine.ts)
   * Extends [Line](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/EdgeLibrary/Line.ts) \(see above\) to additionally render a title for the Edge
   * Functional as is \(does not need to be extended\)

Feel free to check the links out to get a basic idea of some of the Edges provided by Psiagram. They will be referenced later on.

The [Base Edge](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/BaseEdge.ts) takes care of a lot of the internal-use scenarios \(example: the `getElement` method is defined already, so that Paper can call it to get the Edge group, which is also pre-defined\). However, some of the functionality must be implemented in order for your custom Edge to work. The following are the methods and interfaces within the Edge API.

## Base Edge Initialization Properties

The properties of the [Base Edge](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/BaseEdge.ts) defined in TypeScript are:

```typescript
export interface IBaseEdgeProperties {
  id: string;
  gridSize: number;
  uniqueId: string;
  paper: Paper;
}
```

The `id`, `gridSize`, `uniqueId` and `paper` properties are given by Paper to every Edge. As you can see, there isn't much here to define the look and feel of the Edge. This only serves as a foundation, and provides definitions for the two properties that are passed in from the Paper instance.

See the [Text Line](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/EdgeLibrary/TextLine.ts) to see how `IBaseEdgeProperties` is extended to allow for more properties.

## Base Edge Class Properties

The properties of the Base Class defined in TypeScript are:

```typescript
protected props: P;
private _group: SVGElement;
```

`P` represents the props given to the [Base Edge](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/BaseEdge.ts) or extending class. These props **must** extend `IBaseEdgeProperties` - i.e. they must include `id` and `gridSize`.

Group is kept private, and should **not** be touched by any classes extending the [Base Edge](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/BaseEdge.ts). However, `props` is to be used for storing any passed-in props, and is accessible from all extending classes.

Check out how [Line](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/EdgeLibrary/Line.ts) extends the constructor of [Base Edge](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/BaseEdge.ts) to set defaults for certain props.

## Base Edge Class Methods

There are multiple methods within the [Base Edge](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/BaseEdge.ts). Many of these should not be touched, or should only be extended if needed.

### constructor

```typescript
constructor(props: P);
```

Once again, `P` represents the props given to the [Base Edge](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/BaseEdge.ts) or extending class. The constructor is where you initialize any of the props passed into the extending class. All of the [Base Edge](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/BaseEdge.ts) props are already taken care of, so you only need to worry about the new ones. For example, here is the constructor taken from [Line](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/EdgeLibrary/Line.ts):

```typescript
constructor(props: P) {
  // Call super so that the base Edge can initialize it's props and create the
  // Edge group
  super(props);

  // Initialize any additional elements for the class. Later on, these will be
  // generated and then inserted into the group using the methods within Edge.
  this._clickZone = null;
  this._path = null;
  this._coordinates = [];

  // This is where you can set the defaults for any additional props that are
  // passed into the extending class. For Line, it takes an additional prop
  // paperUniqueId in order to set markers (arrow heads).
  this.props = {
    // To avoid ts error https://github.com/Microsoft/TypeScript/issues/14409
    ...(this.props as any),
    paperUniqueId: props.paperUniqueId,
  };
}
```

### initialize

```typescript
initialize(): void;
```

> The initialize method **must** be overwritten.

Initialize is called when the Edge is being mounted into the DOM. You can build visual SVG components and add them to the group using `this.addToGroup(element)`. This function is only called once, so any changes in the future must be done through setters. Here's [Line's](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/EdgeLibrary/Line.ts) initialize function as an example:

```typescript
public initialize(): void {
  const { id, paper, strokeColor, strokeWidth } = this.props;

  // Create an SVG arrowhead for this line.
  const arrowhead = createSVGWithAttributes('marker', {
    id: this.getArrowId(),
    markerWidth: '10',
    markerHeight: '10',
    refX: '6',
    refY: '5',
    orient: 'auto',
    markerUnits: 'userSpaceOnUse',
  });
  const arrowheadPath = createSVGWithAttributes('path', {
    d: 'M 0 0 L 0 10 L 10 5 Z',
    fill: strokeColor,
  });
  arrowhead.appendChild(arrowheadPath);

  // Use the paper prop to call the insert def method. This is a special method
  // that should only be used by plugins and if you absolutely need it within
  // your custom elements.
  paper._insertPaperDef(arrowhead, this.getArrowId());

  // Create a large transparent click zone so click events don't require too
  // much precision.
  this._clickZone = createSVGWithAttributes('path', {
    id: id + '_clickZone',
    fill: 'none',
    stroke: 'transparent',
    'stroke-width': `10px`,
  });

  // Create the visual Edge path with a marker-end arrowhead.
  this._path = createSVGWithAttributes('path', {
    id: id + '_path',
    fill: 'none',
    stroke: '#333',
    'stroke-linecap': 'round',
    'stroke-width': '1px',
    'marker-end': `url(#arrow_${paperUniqueId})`,
  });

  // Add them both to the Edge group.
  this.addToGroup(this._clickZone);
  this.addToGroup(this._path);
}
```

### teardown

```typescript
teardown(): void;
```

Teardown is called when the Edge is being removed from the DOM. You can cause transformations, change appearance, and teardown any listeners or processes. If none of these are needed, you do not need to overwrite this function.

### getCoordinates

> The getCoordinates method **must** be overwritten.

```typescript
getCoordinates(): ICoordinates[];
```

External methods need to call `ThisEdge.getCoordinates()` in order to get the real Edge coordinates. Only the Edge instance knows the true coordinates, as it may choose to manipulate them internally regardless of the input coordinates. Any implementations of this method must return the true coordinates of the Edge.

For example, here is the `getCoordinates` implementation in [Line](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/EdgeLibrary/Line.ts):

```typescript
public getCoordinates(): ICoordinates[] {
  return this._coordinates;
}
```

### setCoordinates

> The setCoordinates method **must** be overwritten.

```typescript
setCoordinates(coordinates: ICoordinates[]): void;
```

External methods need to call `ThisEdge.setCoordinates()` in order to provide potential coordinates to the Edge. Once these are finalized, they should be stored within the Edge in order to be easily retrieved using `getCoordinates`.

For example, here is the `setCoordinates` implementation in [Line](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/EdgeLibrary/Line.ts):

```typescript
public setCoordinates(coordinates: ICoordinates[]): void {
  // Must have at least two coordinate points to be a valid Line.
  if (coordinates.length < 2) {
    throw new PaperError(
      'E_EDGE_LENGTH',
      `You must provide at least two coordinate points to set edge coordinates`,
      'Edge.ts',
      'coordinates',
    );
  }

  if (this._path && this._clickZone) {
    // Avoid manipulating passed-in coordinates object. Since no manipulation is
    // done in this Edge, coordinates can be directly set as the stored
    // coordinates.
    this._coordinates = coordinates.slice();

    // Get source and target points.
    const source = coordinates.shift() as ICoordinates;
    const target = coordinates.pop() as ICoordinates;

    // Build the d-attribute string value.
    const dString = `M ${source.x} ${source.y} ${
      coordinates.length
        ? coordinates.map(point => `L ${point.x} ${point.y} `).join('')
        : ''
    }L ${target.x} ${target.y}`;

    // Manipulate the DOM.
    setSVGAttribute(this._clickZone, 'd', dString);
    setSVGAttribute(this._path, 'd', dString);
  } else {
    throw new PaperError(
      'E_NO_ELEM',
      `No path exists for Edge ID: ${this.props.id}`,
      'Edge.ts',
      'coordinates',
    );
  }
}
```

### getElement

```typescript
getElement(): SVGElement;
```

> **WARNING:** Do not modify this function unless you know what you're doing. It is used by the Paper to extract the entire Edge group, and breaking the functionality may cause all of Psiagram to work incorrectly.

This function will always return the Edge group. Any visual components for this Edge should be contained within the Edge group by adding them using this.addToGroup\(element\).

### addToGroup

```typescript
addToGroup(element: SVGElement): void;
```

> **WARNING:** Do not modify this function unless you know what you're doing. It should be used by all extending classes to insert SVG elements into the Edge group. Breaking the functionality may lead to incorrect rendering of the Edge.

This function allows you to easily append elements into the Edge group. Generally, it is used inside of initialize to add created elements to the Edge group.

