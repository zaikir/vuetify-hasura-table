import Table from './DataTable.vue';

export const HasuraTable = Table;

export default {
  install: (Vue, options = {}) => {
    console.log(options);
    // eslint-disable-next-line no-param-reassign
    Vue.$hasuraTable = options;
  },
};
