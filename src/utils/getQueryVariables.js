export default (source, {
  page, itemsPerPage, sortBy = [], sortDesc = [],
}, { sortMapper }) => ({
  limit: itemsPerPage,
  offset: itemsPerPage * (page - 1),
  orderBy: Object.assign(
    {}, ...sortBy.map((key) => ({
      [key]: sortMapper(key, sortDesc[sortMapper]),
    })),
  ),
});
