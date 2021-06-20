<template>
  <v-hover left>
    <template #default="{hover}">
      <v-btn icon :color="hover ? 'error': ''" @click.prevent.stop="removeRow" :disabled="disabled">
        <v-icon>{{ hover ? 'mdi-delete-forever' : 'delete' }}</v-icon>
        <confirmation-dialog
          v-model="isDeleteDialogOpened"
          @confirm="confirm"
          @decline="isDeleteDialogOpened = false"
        />
      </v-btn>
    </template>
  </v-hover>
</template>
<script>
import ConfirmationDialog from './ConfirmationDialog.vue';

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ConfirmationDialog,
  },
  data() {
    return {
      isDeleteDialogOpened: false,
    };
  },
  methods: {
    removeRow() {
      this.isDeleteDialogOpened = true;
    },
    confirm() {
      this.$emit('delete');
      this.isDeleteDialogOpened = false;
    },
  },
};
</script>
