const buildReferenceSortValue = (field, value) => {
  const pathes = field.$referencePath.filter((x, i) => i > 0 && x !== 'aggregate');
  return pathes.reduce((acc, item, i) => {
    if (!acc.current) { acc.current = acc.total; }
    acc.current[item] = i === pathes.length - 1 ? value : {};
    acc.current = acc.current[item];

    return acc;
  }, { current: null, total: {} }).total;
};

export default (source, fields, {
  page, itemsPerPage, sortBy = [], sortDesc = [],
}, { filters }, { sortMapper, preSort = (x) => x }) => {
  const orderBy = Object.fromEntries(sortBy.map((key, i) => {
    const sortValue = sortMapper(key, sortDesc[i]);

    const field = fields.find((x) => x.value === key);
    if (field.$referencePath) {
      return [field.$referencePath[0], buildReferenceSortValue(field, sortValue)];
    }

    return [key, sortValue];
  }));


  return {
    ...itemsPerPage > 0 && { limit: itemsPerPage },
    offset: itemsPerPage * (page - 1),
    orderBy: preSort(orderBy),
    where: {
      ...filters,
    },
  };
};
