# Active Item

The active item is a way to designate or determine which element on paper **is being acted on**. This is an abstract concept: it could mean whatever is necessary for your diagram to function effectively. A simple example would be in the Mouse Events Plugin, where the active item is whichever element has been clicked. This section will discuss some of the uses for active items. See the Paper API for details on the [get active item](../basics/paper.md#getactiveitem) and [update active item](../basics/paper.md#updateactiveitem) methods.

## Properties

### ActiveItem

```typescript
interface IActiveItem {
  elementType: ElementType;
  id: string;
  paperItemState: PaperItemState;
  [key: string]: any;
}
```

#### elementType - [`ElementType`](#elementtype)

hi

#### id - `string`

hi

#### paperItemState - [`PaperItemState`](#paperitemstate)

hi

#### Additional Properties

hi

### ElementType

```typescript
enum ElementType {
  Paper = 'paper',
  Node = 'node',
  Edge = 'edge',
}
```

### PaperItemState

```typescript
enum PaperItemState {
  Selected = 'selected',
  Default = 'default',
}
```



