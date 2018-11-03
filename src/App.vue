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
    </VuetoComplete>
  </div>
</template>

<script>
  import VuetoComplete from './VuetoComplete';
  
  export default {
    name: 'app',
    methods: {
      /**
       * get todos
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
