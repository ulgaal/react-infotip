`<Cloud>` is a cloud-shaped customizable wrapper. This story shows the default appearance of an `<Cloud>`. You can use the position and style knobs to adjust its appearance.

The appearance of a `<Balloon>` is governed by:

- Its `style` CSS property or CSS `class`. It uses the standard CSS box-model properties, namely:
  - [margin](https://developer.mozilla.org/en-US/docs/Web/CSS/margin)
  - [padding](https://developer.mozilla.org/en-US/docs/Web/CSS/padding)
  - [border-width](https://developer.mozilla.org/en-US/docs/Web/CSS/border-width)
  - [border-color](https://developer.mozilla.org/en-US/docs/Web/CSS/border-color)
  - [border-style](https://developer.mozilla.org/en-US/docs/Web/CSS/border-style)
  - [background-color](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color)
  - [box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow)
- Its `my` property, which specifies where the cloud tail stems from.
- Its `tail.width` and `tail.height` properties which specify the dimensions of the tail.
- Its `folds` property defines the number of folds of the cloud
