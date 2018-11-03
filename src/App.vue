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
