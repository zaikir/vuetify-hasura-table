<script>
import Vue from 'vue';
import gql from 'graphql-tag';
import { VDataTable } from 'vuetify/lib/components';
import { buildItemsQuery, getQueryVariables } from './utils';

export default {
  name: 'VuetifyHasuraTable',
  props: {
    fields: {
      type: Array,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    defaultSelections: {
      type: String,
      default: 'id',
    },
    sortMapper: {
      type: Function,
      default: (key, value) => (value ? 'desc' : 'asc'),
    },
  },
  apollo: {
    items: {
      query() {
        return buildItemsQuery(this.source, this.fields, this.defaultSelections);
      },
      update(data) {
        return data[this.source];
      },
      result({ data }) {
        this.totalItems = data[`${this.source}_aggregate`].aggregate.count;
      },
      // error(error) {
      //   this.$emit('error', wrapGraphqlError(error));
      // },
      variables() {
        return getQueryVariables(this.source, this.options, {
          sortMapper: this.sortMapper,
        });
      },
    },
  },
  data() {
    return {
      options: { page: 1 },
      totalItems: 0,
      items: [],
    };
  },
  render(h) {
    const params = Vue.$hasuraTable || {};
    const options = {
      table: VDataTable,
      ...params,
    };

    const totalProps = {
      ...this.$props,
      ...this.$attrs,
      ...options.table === VDataTable
        ? { headers: this.fields }
        : { fields: this.fields },
      items: this.items,
      serverItemsLength: this.totalItems,
      options: this.options,
    };

    return h(options.table, {
      props: totalProps,
      class: this.$children,
      scopedSlots: this.$scopedSlots,
      on: {
        ...this.$listeners,
        'update:options': (val) => {
          this.options = val;
        },
      },
    }, this.$children);
  },
};
</script>
