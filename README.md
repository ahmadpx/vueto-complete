<div>
<h1>vueto-complete</h1>

<p>yet another vue autoComplete component</a></p>
</div>

<hr />

[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][LICENSE]

## Index

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [Props](#props)
* [Slots](#slots)
* [Events](#events)
* [Styling](#styling)
* [LICENSE](#license)
* [Contribution](#contribution)

## Features

* WAI-ARIA complete autosuggest component built with the power of Vue.
* Full control over rendering with built in defaults or custom components for rendering.
* Easily integrate AJAX data fetching for list presentation.
* Supports multiple sections.
* No opinions on CSS, full control over styling.
* Rigorously tested.

## Installation

```
npm install --save vueto-complete
```

or

```
yarn add vueto-complete
```



## [Props](#props)

| Prop                                        | Type     | Required | Description                                               |
| :------------------------------------------ | :------- | :------: | :-------------------------------------------------------- |
| [`suggestions`](#suggestionsProp)           | Array    |    ✓     | Suggestions to be rendered. e.g.`suggestions: [{data: ['harry','ron','hermione']}]`                               |
| [`input-props`](#inputPropsTable)            | Object   |    ✓     | Add props to the `<input>`.                               |
| [`section-configs`](#sectionConfigsProp)     | Object   |          | Define multiple sections `<input>`.                       |
| [`render-suggestion`](#renderSuggestion)     | Function |          | Tell vueto-complete how to render inside the `<li>` tag. Overrides what is inside the default suggestion template slot. |
| [`get-suggestion-value`](#getSuggestionValue) | Function |          | Tells vueto-complete what to put in the `<input/>` value |
| `@selected`            | Function   |    ✓     | suggestion select handler. equivalent to sectionConfigs `on-selected` but for all items             |
| `component-attr-id-autosuggest` | String |          | `id` of entire component |
| `component-attr-class-autosuggest-results-container` | String |          | `class` of container of results container |
| `component-attr-class-autosuggest-results` | String |          | `class` of results container |

## LICENSE

MIT

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/Educents/vueto-complete.svg?style=flat-square
[build]: https://travis-ci.org/Educents/vueto-complete
[coverage-badge]: https://img.shields.io/codecov/c/github/Educents/vueto-complete.svg?style=flat-square
[coverage]: https://codecov.io/github/Educents/vueto-complete
[version-badge]: https://img.shields.io/npm/v/vueto-complete.svg?style=flat-square
[package]: https://www.npmjs.com/package/vueto-complete
[downloads-badge]: https://img.shields.io/npm/dm/vueto-complete.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/vueto-complete
[license-badge]: https://img.shields.io/npm/l/vueto-complete.svg?style=flat-square
[license]: https://github.com/Educents/vueto-complete/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/Educents/vueto-complete/blob/master/other/CODE_OF_CONDUCT.md
[github-watch-badge]: https://img.shields.io/github/watchers/Educents/vueto-complete.svg?style=social
[github-watch]: https://github.com/Educents/vueto-complete/watchers
[github-star-badge]: https://img.shields.io/github/stars/Educents/vueto-complete.svg?style=social
[github-star]: https://github.com/Educents/vueto-complete/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20vueto-complete%20by%20%40educents%20https%3A%2F%2Fgithub.com%2Feducents%2Fvueto-complete%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/Educents/vueto-complete.svg?style=social
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
