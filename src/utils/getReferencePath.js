import gql from 'graphql-tag';

function buildPathToNextField(selection, prepend = '') {
  if (!selection.selectionSet) {
    if (selection.name.value.startsWith('__') && selection.name.value.endsWith('__')) {
      return `${prepend}.${selection.name.value}`;
    }
    return prepend;
  }

  const pathes = selection.selectionSet.selections.map((s) => buildPathToNextField(s, `${prepend}.${selection.name.value}`));
  return pathes.flat();
}

export default (field) => {
  const selection = gql(`query {${field.value.replace(/\*/g, '__')}}`).definitions[0];
  const pathes = buildPathToNextField(
    selection.selectionSet.selections[0],
  );

  return pathes.find((x) => x.includes('__')).replace(/__/g, '').split('.').filter((x) => x.length);
};
