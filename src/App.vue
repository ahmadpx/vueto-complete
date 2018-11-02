<template>
  <div id="HotelsSearchBox" data-test-id="HotelsSearchBox">
    <AutoComplete
        :auto-complete-list="list"
    >
    </AutoComplete>
  </div>
</template>

<script>
  import AutoComplete from './VuetoComplete';
  
  const styles = {
    container: {
      width: '400px',
    },
    input: {
      boxSizing: 'border-box',
      borderRadius: '4px',
      padding: '15px',
      width: '100%',
      border: '1px solid #d0d0d0',
      lineHeight: 1.6,
      fontSize: '14px',
      display: 'block',
      height: '45px',
      background: 'white',
    },
    focusedInput: {
      outline: 'none',
      background: 'white',
    },
    inputWrapper: {},
    focusedInputWrapper: {},
    inputLabel: {},
    focusedInputLabel: {},
    resultsList: {
      width: '100%',
      border: '1px solid #d0d0d0',
      borderRadius: '2px',
      maxHeight: '50vh',
      overflow: 'scroll',
    },
    resultItem: {
      textAlign: 'left',
      maxWidth: '100%',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      display: 'inlineBlock',
      width: '100%',
      padding: '0 15px',
      height: '35px',
      lineHeight: '35px',
      cursor: 'pointer',
      fontSize: '12px',
      color: '#777',
      whiteSpace: 'nowrap',
      fontWeight: 'normal',
    },
    highlightedItem: {
      background: '#3a3a3a',
      color: 'white',
    },
    matchedWords: {
      padding: '0',
      fontWeight: 'bold',
      background: 'inherit',
      color: 'inherit',
    },
    highlightedMatchedWords: {},
    categoryLabel: {
      textAlign: 'left',
      bottom: '100%',
      lineHeight: '25px',
      content: 'attr(data-type)',
      display: 'block',
      width: '100%',
      color: '#123867',
      backgroundColor: '#f9f9f9',
      borderBottom: '1px solid #E7E7E7',
      padding: '0 10px',
      fontSize: '12px',
      fontWeight: '700',
      margin: 0,
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
        '6Th Of October City, Cairo, Egypt',
        'Cairo, New York, United States',
        'Cairon, Calvados, France',
        'Cairo City Center Hotel, Cairo, EG',
        'Cairo Heliopolis Towers hotel, Cairo, EG',
        'Havana Hotel Cairo, Cairo, EG',
        'Barcelo Cairo Pyramids, Cairo, EG',
        'Novotel Cairo Airport, Cairo, EG',
        'Staybridge Suites Cairo Citystars, Cairo, EG',
        'Hilton Zamalek Residence Cairo, Cairo, EG',
        'Mercure Cairo Le Sphinx, Cairo, EG',
        'Golden Park Hotel Cairo, Heliopolis, Cairo, EG',
        'Moevenpick Resort Cairo Pyramids, Cairo, EG',
      ],
    }),
    methods: {
      /**
       * search destinations
       *
       * @param {String} query
       * @returns {Promise}
       */
      searchDestinations(query) {
        // return SearchClient.getHotelsAndDestinations(query).then(({ hotels, locations }) => [...locations, ...hotels]);
      },
    },
    components: {
      AutoComplete,
    }
  };
</script>

<style lang="scss" scoped>
</style>
