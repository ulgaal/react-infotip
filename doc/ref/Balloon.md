`Balloon` (component)
=====================

A `Balloon` component wraps another React component in
a balloon-shaped styleable wrapper.

Graphically a `Balloon` is composed of a bubble and a tail which points towards
the elements from which the balloon originates.

It has the following structure:
```html
<span> // Span to position the bubble and the tail using absolute positioning
 <span> // Bubble span
  ... tip content
 </span>
 <SvgTail/> // Tail (overlaps the border of the bubble)
</span>
```

Props
-----

### `className`

A CSS class specification to use to render the ballon (if used, will replace `style`)

type: `string`


### `dispatch`

A dispatch function invoked when the geometry of the balloon changes.
The function receives a GEOMETRY action with the following keys:

| Key  | Type            | Description                                                                    |
| ---- | --------------- | ------------------------------------------------------------------------------ |
| corners  | `<CornersType>` | The position of the `Balloon`'s tail end for all possible tail configurations. |
| size | `<SizeType>`    | The size of the `Balloon`.                                                     |

CornersType

`<CornersType>` is an object, which contains the following keys:

| Key  | Type            | Description                                                                    |
| ---- | --------------- | ------------------------------------------------------------------------------ |
| top-left  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to top-left. |
| top-center  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to top-center. |
| top-right  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to top-right. |
| center-left  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to center-left. |
| center-right  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to center-right. |
| bottom-left  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to top-left. |
| bottom-left  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to bottom-center. |
| bottom-center  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to top-left. |
| bottom-right  | `<LocationType>` | The position of the wrapper's tail end when the `my` property is set to bottom-right. |

`<SizeType>` is an object, which contains the following keys:

| Key  | Type            | Description                                                                    |
| ---- | --------------- | ------------------------------------------------------------------------------ |
| width  | `<number>` | Width of the wrapper. |
| height  | `<number>` | height of the wrapper. |

type: `func`


### `id`

If the balloon is contained in a `Storage`, an id which uniquely identifies
the `Source` to which this balloon belongs

type: `string`


### `my`

The corner of the balloon to which the tail attaches

type: `custom`
defaultValue: `'top-left'`


### `pinned`

`true` if the balloon is pinned to the screen

type: `bool`


### `style`

The CSS style to use to render the balloon

type: `object`
defaultValue: `styles.defaultStyle`


### `tail`

The size of the ballon tail

type: `custom`
defaultValue: `{ width: 8, height: 8 }`

