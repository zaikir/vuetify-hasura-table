import getFieldSelection from './getFieldSelection';

export default (source, fields, defaultSelections) => {
  const selections = fields.map(getFieldSelection).join(' ');

  return `query ${source} ($limit: Int, $offset: Int, $orderBy: [${source}_order_by!], $where: ${source}_bool_exp) { 
    ${source} (limit: $limit, offset: $offset, order_by: $orderBy, where: $where ) {
      ${defaultSelections}
      ${selections}
    } 
    
    ${source}_aggregate (where: $where ){
      aggregate {
        count
      }
    }
  }`;
};
