`Cloud` (component)
===================

A `Cloud` component wraps another React component in
a cloud-shaped styleable wrapper.

Graphically a `Cloud` is composed of a cloud outline and a content.
The cloud shape is randomly computed using just a `folds` parameter
which indicates the number of folds the cloud `Cloud` have.

It has the following structure:
```html
<div> // div to position the cloud outline and the content using absolute positioning
 <SvgCloud/> // Cloud outline
 <span> // Cloud content (overlaps the outline)
  ... tip content
 </span>
</div>
```

Props
-----

### `folds`

The number of randomly generated cloud folds

type: `number`
defaultValue: `13`


### `my`

The corner of the cloud to which the tail attaches

type: `custom`
defaultValue: `'top-left'`


### `onGeometryChange`

A callback function invoked when the geometry of the cloud changes.
The function receives a hash with the following keys:

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
defaultValue: `null`


### `style`

The CSS style to use to render the cloud

type: `object`
defaultValue: `styles.defaultStyle`


### `tail`

The size of the cloud tail

type: `shape[object Object]`
defaultValue: `{
  width: 25,
  height: 25
}`

