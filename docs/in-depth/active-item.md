# Active Item

The active item is a way to designate or determine which element on paper **is being acted on**. This is an abstract concept: it could mean whatever is necessary for your diagram to function effectively. A simple example would be in the Mouse Events Plugin, where the active item is whichever element has been clicked. This section will discuss some of the uses for active items. See the Paper API for details on the [get active item](../basics/paper.md#getactiveitem) and [update active item](../basics/paper.md#updateactiveitem) methods.

## Properties

```typescript
interface IActiveItem {
  elementType: ElementType;
  id: string;
  isSelected: boolean;
  [key: string]: any;
}
```

#### elementType - `ElementType`

This property helps to narrow down the active item. IDs must be unique across all Nodes or Edges, but there may be duplicate IDs between Nodes and Edges. Therefore, defining the `elementType` and `id` together helps to determine which item is active.

```typescript
enum ElementType {
  Paper = 'paper',
  Node = 'node',
  Edge = 'edge',
}
```

The element type is added to the Paper, all Nodes and all Edges automatically \(by the [Base Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/BaseNode.ts) and [Base Edge](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Edge/BaseEdge.ts)\). It indicates which of the types of elements within Psiagram are active.

#### id - `string`

As mentioned above, the `id` property used in conjunction with `elementType` allows you to specify a single element as the active item.

#### isSelected - `boolean`

This is used for every active item. It shows if an item is in a selected state. Not every active item is selected; for example, in the [Mouse Events Plugin](../plugins/mouse-events.md), when you click on an item to begin dragging it, it does not immediately become selected, so when setting the active item this should be `false`. However, upon releasing the item, it becomes `true` as the item is now selected.

#### Additional properties - `any`

Any additional properties can be added to the active item object. This can be useful for adding plugin-specific properties to whichever item is active. One example is in the [Mouse Events Plugin](../plugins/mouse-events.md), where an `isMoving` boolean is added in order to determine if an active item is in a moving state.



