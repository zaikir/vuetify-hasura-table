export default (field) => {
  switch (typeof field) {
    case 'object': {
      return (field.selector || field.value).replace(/\*/g, '');
    }
    default: {
      throw new Error('Field type should be object');
    }
  }
};
