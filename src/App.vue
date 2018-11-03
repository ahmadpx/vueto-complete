<template>
  <div id="HotelsSearchBox" data-test-id="HotelsSearchBox">
    <AutoComplete
        :auto-complete-list="list"
        display-key="name"
        use-categories
        category-key="displayType"
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
        {
          'name': 'Cairo, Egypt',
          'name_en': 'Cairo, Egypt',
          'hotelCount': 1,
          'displayType': 'Location',
          'countryCode': 'EG',
          'hotelId': '562282',
        },
        {
          'name': 'Cairo City Center Hotel, Cairo, EG',
          'name_en': 'Cairo City Center Hotel, Cairo, EG',
          'hotelCount': 1,
          'displayType': 'Hotel',
          'countryCode': 'EG',
          'hotelId': '4271772',
        },
        {
          'name': 'Cairo, Thomasville, United States',
          'name_en': 'Cairo, Thomasville, United States',
          'hotelCount': 1,
          'displayType': 'Location',
          'countryCode': 'US',
          'hotelId': '648129',
        },
        {
          'name': 'Cairo, Southwest Illinois, United States',
          'name_en': 'Cairo, Southwest Illinois, United States',
          'hotelCount': 1,
          'displayType': 'Location',
          'countryCode': 'US',
          'hotelId': '646153',
        }, {
          'name': 'Giza, Cairo, Egypt',
          'name_en': 'Giza, Cairo, Egypt',
          'hotelCount': 1,
          'displayType': 'Location',
          'countryCode': 'EG',
          'hotelId': '562335',
        }, {
          'name': 'Cairo, Central West Virginia, United States',
          'name_en': 'Cairo, Central West Virginia, United States',
          'hotelCount': 1,
          'displayType': 'Location',
          'countryCode': 'US',
          'hotelId': '656412',
        }, {
          'name': 'Cairo Montenotte, Savona - Riviera Delle Palme, Italy',
          'name_en': 'Cairo Montenotte, Savona - Riviera Delle Palme, Italy',
          'hotelCount': 1,
          'displayType': 'Location',
          'countryCode': 'IT',
          'hotelId': '660779',
        }, {
          'name': '6Th Of October City, Cairo, Egypt',
          'name_en': '6Th Of October City, Cairo, Egypt',
          'hotelCount': 1,
          'displayType': 'Location',
          'countryCode': 'EG',
          'hotelId': '562302',
        }, {
          'name': 'Cairo, New York, United States',
          'name_en': 'Cairo, New York, United States',
          'hotelCount': 1,
          'displayType': 'Location',
          'countryCode': 'US',
          'hotelId': '644803',
        }, {
          'name': 'Cairon, Calvados, France',
          'name_en': 'Cairon, Calvados, France',
          'hotelCount': 1,
          'displayType': 'Location',
          'countryCode': 'FR',
          'hotelId': '627847',
        }, {
          'name': 'Cairo Heliopolis Towers hotel, Cairo, EG',
          'name_en': 'Cairo Heliopolis Towers hotel, Cairo, EG',
          'hotelCount': 1,
          'displayType': 'Hotel',
          'countryCode': 'EG',
          'hotelId': '7226770',
        }, {
          'name': 'Havana Hotel Cairo, Cairo, EG',
          'name_en': 'Havana Hotel Cairo, Cairo, EG',
          'hotelCount': 1,
          'displayType': 'Hotel',
          'countryCode': 'EG',
          'hotelId': '4271740',
        }, {
          'name': 'Novotel Cairo Airport, Cairo, EG',
          'name_en': 'Novotel Cairo Airport, Cairo, EG',
          'hotelCount': 1,
          'displayType': 'Hotel',
          'countryCode': 'EG',
          'hotelId': '4271617',
        }, {
          'name': 'Staybridge Suites Cairo Citystars, Cairo, EG',
          'name_en': 'Staybridge Suites Cairo Citystars, Cairo, EG',
          'hotelCount': 1,
          'displayType': 'Hotel',
          'countryCode': 'EG',
          'hotelId': '4271743',
        }, {
          'name': 'Mercure Cairo Le Sphinx, Cairo, EG',
          'name_en': 'Mercure Cairo Le Sphinx, Cairo, EG',
          'hotelCount': 1,
          'displayType': 'Hotel',
          'countryCode': 'EG',
          'hotelId': '4271618',
        }, {
          'name': 'Hilton Zamalek Residence Cairo, Cairo, EG',
          'name_en': 'Hilton Zamalek Residence Cairo, Cairo, EG',
          'hotelCount': 1,
          'displayType': 'Hotel',
          'countryCode': 'EG',
          'hotelId': '4271676',
        }, {
          'name': 'Barcel\u00f3 Cairo Pyramids Hotel, Cairo, EG',
          'name_en': 'Barcel\u00f3 Cairo Pyramids Hotel, Cairo, EG',
          'hotelCount': 1,
          'displayType': 'Hotel',
          'countryCode': 'EG',
          'hotelId': '4271625',
        }, {
          'name': 'Moevenpick Resort Cairo Pyramids, Cairo, EG',
          'name_en': 'Moevenpick Resort Cairo Pyramids, Cairo, EG',
          'hotelCount': 1,
          'displayType': 'Hotel',
          'countryCode': 'EG',
          'hotelId': '4271634',
        }, {
          'name': 'Tolip El Galaa Hotel Cairo, Cairo, EG',
          'name_en': 'Tolip El Galaa Hotel Cairo, Cairo, EG',
          'hotelCount': 1,
          'displayType': 'Hotel',
          'countryCode': 'EG',
          'hotelId': '6231432',
        },
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
    },
  };
</script>

<style lang="scss" scoped>
</style>
