# vueto-complete

vue autoComplete component

<!--
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][LICENSE]
-->

## Index

* [Features](#features)
* [Installation](#installation) 
* [Examples](#examples)
* [Props](#props)
* [Slots](#slots)
* [Events](#events)
* [Styling](#styling)
* [LICENSE](#license)
<!-- * [Contribution](#contribution) -->

## Features

* Supports full control over functionality and display.
* Supports regular lists as well as AJAX fetching.
* Supports grouping of results.
* Supports slots for custom rendering and formatters for custom formatting.
* Supports full control over styling.
* Supports full control over filtering and sorting results.
* Supports multiple keys to search against.
* Supports keyboard accessibility.
* Fires events for all its lifesycle hooks.

## Installation

```
npm install --save vueto-complete
```

or

```
yarn add vueto-complete
```

## Examples

```html
<template>
  <div>
    <VuetoComplete
        v-model="query"
        :auto-complete-list="list"
        :styles="styles"
    >
    </VuetoComplete>
  </div>
</template>

<script>
  import VuetoComplete from 'vueto-complete';
  
  const styles = {
    container: {
      maxWidth: '500px',
    },
    input: {
      border: '1px solid gray',
    },
    focusedInput: {
      background: '#e0e0e0',
    },
  };
  
  export default {
    name: 'app',
    data: () => ({
      query: '',
      styles,
      list: [
        'Cairo, Egypt',
        'Cairo, Thomasville, United States',
        'Cairo, Southwest Illinois, United States',
        'Giza, Cairo, Egypt',
        'Cairo, Central West Virginia, United States',
        'Cairo Montenotte, Savona - Riviera Delle Palme, Italy',
      ],
    }),
    components: {
      VuetoComplete,
    }
  };
</script>
```

```html
<template>
  <div>
    <VuetoComplete
        :fetch-handler="getTodos"
        display-key="title"
        :filter-handler="getCompleted"
        @select="onSelect"
    >
    </VuetoComplete>
  </div>
</template>

<script>
  import VuetoComplete from 'vueto-complete';
  
  export default {
    name: 'app',
    methods: {
      /**
       * get todos
       *
       * @param {String} query
       * @returns {Promise}
       */
      getTodos(query) {
        return fetch('https://jsonplaceholder.typicode.com/todos')
          .then(response => response.json());
      },
      
      /**
       * filter todos by completed
       * @param {Array<object>} todos
       * @return {Array<object>} todos
       */
      getCompleted(todos) {
        return todos.filter(({ completed }) => completed);
      },
  
      /**
       * handle select
       * @param {Object} todo
       */
      onSelect(todo) {
        console.log(todo);
      }
    },
    components: {
      VuetoComplete,
    },
  };
</script>
```

```html
<template>
  <div>
    <VuetoComplete
        :fetch-handler="getPosts"
        display-key="title"
        :search-keys="['title', 'body']"
        :debounce-time="200"
        :min-chars-to-auto-complete="2"
        :max-results-to-display="5"
        @select="onSelect"
    >
      <template slot="item-icon" slot-scope="{ item }">
        <i :class="`post-icon-${item.id}`"></i>
      </template>
    </VuetoComplete>
  </div>
</template>

<script>
  import VuetoComplete from 'vueto-complete';
  
  export default {
    name: 'app',
    methods: {
      /**
       * get posts
       *
       * @param {String} query
       * @returns {Promise}
       */
      getPosts(query) {
        return fetch('https://jsonplaceholder.typicode.com/posts')
          .then(response => response.json());
      },
      
      /**
       * handle select
       * @param {Object} post
       */
      onSelect(post) {
        console.log(post);
      }
    },
    components: {
      VuetoComplete,
    },
  };
</script>
```

## Props

| Prop                                          | Type      |  Default              | Required                                      | Description                                                                                                                                                                                               |                
| :---------------------------------------------| :-------  | :---------------------| :---------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `autoCompleteList`                            | Array     | empty array [ ]       | only when no `fetchHandler` provided          | `autoCompleteList` is required only if no `fetchHandler` provided, it can be array of strings or objects                                                                                                  |      
| `fetchHandler`                                | Function  | no default            | only when no `autoCompleteList` provided      | `fetchHandler` for fetching AJAX results, it's a function returns a promise resolves to a list, it's required only if no `autoCompleteList` provided.                                                     |       
| `displayKey`                                  | String    | title                 | only when the results are a list of objects   | `displayKey` is the key that will be displayed in the list, it's required only if the list is array of objects and you can override how you display the results with `resultsDisplayFormatHandler` prop   |       
| `searchKeys`                                  | Array     | [`displayKey`]        | No                                            |  you can provide multiple keys from the result object to search against while autoCompleting                                                                                                              |       
| `sortHandler`                                 | Function  | no default            | No                                            |  a function to sort the autoCompleted results                                                                                                                                                             |       
| `filterHandler`                               | Function  | no default            | No                                            |  a function to filter the autoCompleted results                                                                                                                                                           |       
| `resultsDisplayFormatHandler`                 | Function  | no default            | No                                            |  a function to format how the results get displayed                                                                                                                                                       |       
| `selectedItemFormatHandler`                   | Function  | no default            | No                                            |  a function to format how the selected result get displayed on the autoComplete input                                                                                                                     |       
| `minCharsToAutoComplete`                      | Number    | 1                     | No                                            |  the minimum characters to start autoComplete or fetch                                                                                                                                                    |       
| `maxResultsToDisplay`                         | Number    | Infinity              | No                                            |  the maximum results to display                                                                                                                                                                           |       
| `debounceTime`                                | Number    | 300 ms                | No                                            |  debounce time for the `input` event while fetching results                                                                                                                                               |       
| `highlightMatched`                            | Boolean   | true                  | No                                            |  highlight matched words as the query                                                                                                                                                                     |       
| `showLoadingIcon`                             | Boolean   | true                  | No                                            |  show loading icon while fetching results                                                                                                                                                                 |       
| `fetchOnFocus`                                | Boolean   | false                 | No                                            |  fetch results with the current query on input focus                                                                                                                                                      |       
| `placeholder`                                 | String    | empty string          | No                                            |  autoComplete input placeholder                                                                                                                                                                           |       
| `noResultsMessage`                            | Boolean   | `No results found`    | No                                            |  the message to display when no results matches the current query                                                                                                                                         |       
| `showNoResultsMessage`                        | String    | true                  | No                                            |  show a message when no results matches the current query                                                                                                                                                 |       
| `testId`                                      | String    | empty string          | No                                            |  `id` to define a data attribute `data-test-id` for each element in the component for `automation test`                                                                                                   |       
| `emptyResultsOnEmptyQuery`                    | Boolean   | true                  | No                                            |  empty the results array when the input query get empty                                                                                                                                                   |       
| `highlightResults`                            | Boolean   | true                  | No                                            |  highlight results with hovering over it or using keyboard                                                                                                                                                |       
| `useCategories`                               | Boolean   | false                 | No                                            |  categorise results                                                                                                                                                                                       |       
| `categoryKey`                                 | String    | no default            | only when `useCategories` is true             |  the key to categorise with                                                                                                                                                                               |       
| `categoryLabel`                               | String    | no default            | No                                            |  the label to show for the category, if it's not provided the `categoryKey` prop will be used as a label                                                                                                  |       
| `initialValue`                                | String    | empty string ' '      | No                                            |  initial value for the input query                                                                                                                                                                        |       
| `styles`                                      | Object    | empty object  { }     | No                                            |  styles object to style each element in the component in all its states                                                                                                                                   |


## Slots

| Name                                          | Scope                 |  Description|                
| :---------------------------------------------| :-------------------  | :-----------------------------------------| 
| `input-icon`                                  | no scope              | it renders icon for the input             |       
| `input-label`                                 | no scope              | it renders label for the input            |        
| `item`                                        | current item object   | it renders the result item                |        
| `item-icon`                                   | current item object   | it renders the result item icon           |          
| `item-caption`                                | current item object   | it renders the result item caption        |        
| `loading-icon`                                | no scope              | it renders the input loading icon         |        
| `no-results`                                  | no scope              | it renders the no results message         |        


## Events

| Name                                          | Payload               |  Description|                
| :---------------------------------------------| :---------------------| :-------------------------------------------------------------| 
| `input`                                       | no payload            | fired on input change, you can use `v-model` on the component |       
| `startedFetching`                             | no payload            | fired before fetch start                                      |       
| `fetchSuccess`                                | results list          | fired on fetch success                                        |        
| `fetchError`                                  | error                 | fired on fetch error                                          |        
| `finishedFetching`                            | no payload            | fired after fetch resolve/reject                              |        
| `select`                                      | selected item object  | fired on selecting autoComplete item                          |        
| `inputFocus`                                  | no payload            | fired on focusing the input                                   |        
| `inputBlur`                                   | no payload            | fired on bluring the input                                    |        
| `highlightItem`                               | item index            | fired on highlighting new item with hover/keyboard            |        
| `noResultsFound`                              | no payload            | fired on when no results found                                |  
    
    
## Styling

| Key                                           | description                                       |                
| :---------------------------------------------| :-------------------------------------------------| 
| `container`                                   | to style the component container                  |       
| `input`                                       | to style the input                                |        
| `focusedInput`                                | to style the input in the focus state             |        
| `inputWrapper`                                | to style the input wrapper                        |        
| `focusedInputWrapper`                         | to style the input wrapper in the focus state     |        
| `inputLabel`                                  | to style the input label                          |        
| `focusedInputLabel`                           | to style the input label in the focus state       |        
| `resultsList`                                 | to style the results list                         |        
| `resultItem`                                  | to style the result item                          |        
| `highlightedItem`                             | to style the result item in the highlight state   |        
| `matchedWords`                                | to style the matched words                        |        
| `highlightedMatchedWords`                     | to style the matched words in the highlight state |        
| `categoryLabel`                               | to style the category label                       |   


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
