<script>
import Vue from 'vue';
import { VDataTable } from 'vuetify/lib/components';

export default {
  name: 'VuetifyHasuraTable',
  props: {
    fields: {
      type: Array,
      required: true,
    },
  },
  render(h) {
    const params = Vue.$hasuraTable || {};
    const options = {
      table: VDataTable,
      ...params,
    };

    return h(options.table, {
      props: {
        ...this.$attrs,
        ...options.table === VDataTable
          ? { headers: this.fields }
          : { fields: this.fields },
      },
      class: this.$children,
      scopedSlots: this.$scopedSlots,
      on: this.$listeners,
    }, this.$children);
  },
};
</script>
