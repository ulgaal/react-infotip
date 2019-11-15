Tips are appended to a container element. Since the tips use [position:absolute](https://developer.mozilla.org/en-US/docs/Web/CSS/position#Values), their container element must also use [position:absolute](https://developer.mozilla.org/en-US/docs/Web/CSS/position#Values) or [position:relative](https://developer.mozilla.org/en-US/docs/Web/CSS/position#Values)

If not specified in the tip configuration, this container element is the document body. To specify a container, use the `position.container` property. This property can either be a CSS selector, or a DOM element obtained using a React [reference](https://reactjs.org/docs/refs-and-the-dom.html)

Use your browser dev tools to see where the tips get attached for these three `<Source>s`.
