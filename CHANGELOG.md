## Version 0.9.1 (2020/02/28)
- Fixed reg in dynamic tip placement by reintroducing resize-observer-polyfill, but just for tip wrappers
- Fix reg in mouseMove handling in Storage mode

## Version 0.9.0 (2020/02/21)
- Performance improvement: replaced addref-release with lazy tip creation / destruction in storage
- Replaced react-table with react-reducer-table in storybook

## Version 0.8.2 (2020/02/13)

- Added story to demonstrate sticky nodes on a storage with mouse move handling
- Added mouse move handling to storage reducer. Translations caused by window.scoll are now handled by event handlers
- Added children props to equality test of Cloud and Balloon

## Version 0.8.1 (2020/02/12)

- Migrated to storybook 5.3.13
- Migrated all dependencies
- Fixed reg in position.target='mouse' and added a story for this use case

## Version 0.8.0 (2020/02/12)

- More internal redesign: use a lazy approach to minimize the amount of DOM measurements
- Removed dependency on resize-observer-polyfill
- Fixed reg in mouseover/mouseout timer cancelation
- Fixed proptype warning

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
