`Source` (component)
====================

The `Source` component acts as a wrapper for other components and enables them
to provide tips.

Props
-----

### `config`

The tip `config`, as an object which contains the following keys:

| Key           | Type             | Description                                         |
|---------------|------------------|-----------------------------------------------------|
| position      | `<PositionType>` | sub-configuration describing the tip position       |
| show          | `<ShowType>`     | sub-configuration describing how the tip is shown   |
| hide          | `<HideType>`     | sub-configuration describing how the tip is hidden  |
| wrapper       | `<component>`    | The component to instantiate to wrap the tip        |
| wrapperProps  | `<object>`       | The React properties for the wrapper component      |

`<PositionType>` is an object, which contains the following keys:

| Key           | Type                   | Description                                                   |
|---------------|------------------------|---------------------------------------------------------------|
| my            | `<CornerType>`         | The corner of the tip to position in relation to the `at` key |
| at            | `<CornerType>`         | The corner of `target` element to position the tip corner at  |
   | target        | `<target-spec>`        | The element the tip will be positioned in relation to. Can be one of <dl><dt>false</dt><dd>the source itself (default)</dd><dt>[&lt;number&gt;, &lt;number&gt;]</dt><dd>an array of x, y coordinates</dd><dt>'mouse'</dt><dd>the mouse coordinates for the event which triggered the tip to show</dd><dt>&lt;string&gt;</dt><dd>CSS selector for another DOMElement</dd></dl>   |
  | adjust        | `<AdjustType>`         | sub-configuration describing how the tip position should be adjusted |
  | container     | `<string>` | CSS selector to the DOMElement under which tips will attached.      |

`<CornerType>` is one of the following enumeration value:
* top-left
* top-center
* top-right
* center-left
* center-right
* bottom-left
* bottom-center
* bottom-right

`<AdjustType>` is an object, which contains the following keys:

| Key           | Type                   | Description                                                   |
|---------------|------------------------|---------------------------------------------------------------|
  | mouse         | `<mouse-spec>`         | Describes how mouse movement affects the tip placement. Can be one of <dl><dt>false</dt><dd>do not adjust to mouse move (default)</dd><dt>true</dt><dd>adjust to mouse move</dd><dt><pre>function: event =&gt; ({ x, y })</pre></dt><dd>compute the position of the tip using a function which receives mouse move event as input</dd></dl>
| x             | `<number>`             | x-translation the tip (0 by default)
| y             | `<number>`             | y-translation the tip (0 by default)
  | method        | `<method-spec>`        | Decribes the method to use to optimize tip placement inside its container. Can be one of <dl><dt>none</dt><dd>no placement adjustment (default)</dd><dt>{ flip: [&lt;CornerType&gt; (, &lt;CornerType&gt;)\* ] }</dt><dd>pick the corner which maximizes overlap between the tip and its container</dd><dt>{ shift: [&lt;AxisType&gt; (, &lt;AxisType&gt;)\*]}</dt><dd>keep the tip inside its container for the specified axis</dd></dl>

`<AxisType>` is one of the following enumeration value:
* horizontal
* vertical

`<ShowType>` is an object, which contains the following keys:

| Key        | Type         | Description                                                                        |
|------------|--------------|------------------------------------------------------------------------------------|
| delay      | `<number>`   | Delay between mouse enter event in the source and the tip display (0ms by default) |

`<HideType>` is an object, which contains the following keys:

| Key        | Type         | Description                                                                        |
|------------|--------------|------------------------------------------------------------------------------------|
| delay      | `<number>`   | Delay between mouse leave event from the source or the tip and removal of the tip (0ms by default) |

type: `custom`


### `id`

If the `Source` is contained in a `Storage`, an id which uniquely identifies
this `Source` within its `Storage`

type: `string`


### `pinned`

`true` to make the tip always visible, `false` otherwise

type: `bool`


### `storage`

If the `Source` is contained in a `Storage`, a pointer to this `Storage` (this
property will be automatically valued by the englobing `Storage`)

type: `instanceOfStorage`


### `svg`

Must to set to `true` if the source wraps an SVG element, `false` otherwise

type: `bool`


### `tip`

The tip content as a React node

type: `node`

