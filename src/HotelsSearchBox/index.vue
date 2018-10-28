<template>
  <div id="HotelsSearchBox" data-test-id="HotelsSearchBox">
    <AutoComplete
        test-key="hotels"
        :auto-complete-fetch-handler="searchDestinations"
        :max-results-to-display="MAX_AUTO_COMPLETE_RESULTS"
        :min-chars-to-fetch="MIN_CHARS_TO_FETCH_RESULTS"
        @beforeFetch="handleBeforeFetch"
        @fetchSuccess="handleFetchSuccess"
        @fetchError="handleFetchError"
        :styles="styles"
        @select="handleSelect"
    >
      <template slot-scope="{ item }">
        hotel: {{ item.name }}
      </template>
    </AutoComplete>
  </div>
</template>

<script>
import { SearchClient } from "web-js-sdk/packages/hotel-sdk/lib/clients/search.client.js";
import AutoComplete from "../components/AutoComplete";
import constants from "./constants";

const styles = {
  highlightedItem: {
    color: "green"
  }
};

export default {
  name: "HotelsSearchBox",
  data: () => ({
    ...constants,
    styles
  }),
  methods: {
    /**
     * search destinations
     *
     * @param {String} query
     * @returns {Promise}
     */
    searchDestinations(query) {
      return SearchClient.getHotelsAndDestinations(query).then(
        ({ hotels, locations }) => [
          ...hotels.map(hotel => ({ name: hotel.name })),
          ...locations.map(location => ({ name: location.name }))
        ]
      );
    },

    /**
     * handle select
     * @param {Object} selectedItem
     */
    handleSelect(selectedItem) {
      console.log(selectedItem);
    },

    /**
     * handle before fetch
     */
    handleBeforeFetch() {
      console.log("before fetch");
    },

    /**
     * handle fetch success
     * @param {Array<Object>} results
     */
    handleFetchSuccess(results) {
      console.log(results);
    },

    /**
     * handle fetch error
     * @param {object} error
     */
    handleFetchError(error) {
      console.log(error);
    }
  },
  components: {
    AutoComplete
  }
};
</script>

<style scoped>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
