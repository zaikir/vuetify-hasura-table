<script>
import Vue from 'vue';
import gql from 'graphql-tag';
import { VDataTable } from 'vuetify/lib/components';
import {
  buildItemsQuery, getQueryVariables, getReferencePath, getFieldValue,
  wrapGraphqlError,
} from './utils';
import { DeleteRowButton } from './components';

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
    noDelete: Boolean,
    deleteParams: {
      type: Object,
      default: () => ({}),
    },
    filters: {
      type: Object,
      default: () => ({}),
    },
    search: String,
    searchFilter: Function,
    searchDelay: {
      type: Number,
      default: 200,
    },
    noRemovedFilter: Boolean,
    removedFilter: {
      type: Object,
      default: () => ({ isRemoved: { _neq: true } }),
    },
    globalProps: Object,
    globalClasses: Object,
    skeletonLoading: Boolean,
    skeletonRowsCount: Number,
  },
  apollo: {
    items: {
      query() {
        return gql(buildItemsQuery(this.source, this.mappedFields, this.defaultSelections));
      },
      update(data) {
        return data[this.source];
      },
      result({ data }) {
        if (data[`${this.source}_aggregate`]) {
          this.initialLoading = false;
          this.totalItemsLength = data[`${this.source}_aggregate`].aggregate.count;
        }
      },
      error(error) {
        const errorText = wrapGraphqlError(error);
        this.emitError(errorText, error);
      },
      variables() {
        const filters = {
          ...!this.noRemovedFilter && this.removedFilter,
          ...this.filters,
        };
        return getQueryVariables(this.source, this.mappedFields, this.options,
          {
            filters: this.searchFilter && this.searchValue
              ? { ...filters, ...this.searchFilter(this.searchValue, filters) }
              : filters,
          },
          { sortMapper: this.sortMapper });
      },
      skip() {
        return !this.options;
      },
    },
  },
  data() {
    return {
      options: null,
      totalItemsLength: 0,
      items: [],
      searchValue: null,
      initialLoading: true,
    };
  },
  computed: {
    mappedFields() {
      return this.fields.map((field) => {
        if (field.value.includes('*')) {
          const referencePath = getReferencePath(field);

          return {
            ...field,
            $referencePath: referencePath,
            $referenceMapper: (x) => referencePath.reduce((acc, item) => (acc || {})[item], x),
          };
        }

        return field;
      });
    },
  },
  methods: {
    emitError(errorText, error) {
      if ((Vue.$hasuraTable || {}).errorHandler) {
        Vue.$hasuraTable.errorHandler(errorText, error);
      }

      this.$emit('error', errorText);
    },
  },
  watch: {
    search: {
      handler(val) {
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
          this.searchTimeout = null;
        }

        this.searchTimeout = setTimeout(
          () => { this.searchValue = val; }, this.searchDelay,
        );
      },
      immediate: true,
    },
  },
  render(h) {
    const params = Vue.$hasuraTable || {};
    const options = {
      table: VDataTable,
      ...params,
    };

    const items = (this.items || []).map((item) => Object.assign(
      {},
      ...this.defaultSelections.split(' ').map((key) => ({ [key]: item[key] })),
      ...this.mappedFields.map((field) => ({
        [field.value]: getFieldValue(field, item),
      })),
    ));

    const skeletonLoading = this.initialLoading;

    const totalFields = this.noDelete ? this.fields : [
      ...this.fields,
      {
        value: '$delete', sortable: false, width: 1, ...skeletonLoading && { headerSkeleton: false, skeleton: { type: 'button', maxWidth: 24, maxHeight: 24 } },
      },
    ];

    const totalProps = {
      ...this.$props,
      ...this.$attrs,
      ...options.table === VDataTable
        ? { headers: totalFields }
        : { fields: totalFields },
      items,
      serverItemsLength: this.totalItemsLength,
      options: this.options,
      loading: this.$apollo.loading,
      skeletonLoading,
    };

    const renderDeleteRowButton = (item, deleteRowFunc) => h(DeleteRowButton, {
      props: { icon: true },
      on: {
        delete: deleteRowFunc,
      },
    });

    const totalScopedSlots = {
      'item.$delete': ({ item }) => {
        const deleteRowFunc = () => {
          const mutation = `mutation ($id: ${this.deleteParams.idType || 'uuid!'}) {
            update_${this.source} (where: {id: {_eq: $id } }, _set: { isRemoved: true }) { affected_rows }
          }`;

          this.$apollo.mutate({
            mutation: gql(this.deleteParams.customMutation
              ? this.deleteParams.customMutation(mutation)
              : mutation),
            refetchQueries: () => {
              this.$apollo.queries.items.refetch();
            },
            update: (cache) => {
              if (this.deleteParams.onDeleted) {
                this.deleteParams.onDeleted({ cache, item });
              }
            },
            error(error) {
              const errorText = wrapGraphqlError(error);
              this.emitError(errorText, error);
            },
            variables: {
              id: item[this.deleteParams.idKey || 'id'],
            },
          });
        };

        return this.$scopedSlots['item.$delete']
          ? this.$scopedSlots['item.$delete']({ item, deleteRowFunc })
          : renderDeleteRowButton(item, deleteRowFunc);
      },
      ...this.$scopedSlots,
    };

    return h(options.table, {
      props: totalProps,
      scopedSlots: totalScopedSlots,
      on: {
        ...this.$listeners,
        'update:options': (val) => { this.options = val; },
        'update:search': (val) => { this.$emit('update:search', val); },
      },
    }, this.$children);
  },
};
</script>
