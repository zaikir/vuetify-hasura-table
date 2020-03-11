import getFieldSelection from './getFieldSelection';

export default (source, fields, defaultSelections) => {
  const selections = fields.map(getFieldSelection).join(' ');

  const filter = '{ isRemoved: {_neq: true} }';
  return `query ${source} ($limit: Int, $offset: Int, $orderBy: [${source}_order_by!]) { 
    ${source} (limit: $limit, offset: $offset, order_by: $orderBy, where: ${filter} ) {
      ${defaultSelections}
      ${selections}
    } 
    
    ${source}_aggregate (where: ${filter} ){
      aggregate {
        count
      }
    }
  }`;
};
