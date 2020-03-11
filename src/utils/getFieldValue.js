export default (field, item) => {
  const { customValue = (x) => x } = field;

  if (field.$referencePath) {
    return customValue(field.$referenceMapper(item));
  }

  return customValue(item[field.value]);
};
