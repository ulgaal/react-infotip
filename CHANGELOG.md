## Version 0.7.0 (2020/02/09)
- Major internal redesign: the codebase has been migrated to hooks and the Engine class has been replaced by a useReducer pattern.

## Version 0.6.1 (2019/12/12)
- Improved communication between Engine Source and Storage
- Removed ability to use react refs in container or target definition (not supported any more since deepmerge migration)

## Version 0.6.0 (2019/12/04)

- Replaced implementation of mergeObjects with dependency on [deepmerge](https://www.npmjs.com/package/deepmerge)
- Removed config property from Storage (config is now retrieved from Sources and also passed to onTipChange)

## Version 0.5.1 (2019/11/27)

- Fixed instantiation of wrapper components

## Version 0.5.0 (2019/11/15)

- Initial public release
