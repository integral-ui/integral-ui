declare const window: any;

const GLOBAL_NAMESPACE = Symbol('integral-ui');
window[GLOBAL_NAMESPACE] = {};

export const setGlobalReference = function(key: string, value) {
  window[GLOBAL_NAMESPACE] = window[GLOBAL_NAMESPACE] || {};
	window[GLOBAL_NAMESPACE][key] = value;
}

export const getGlobalReference = function(key): any {
    return window[GLOBAL_NAMESPACE][key];
}
// INTERFACES
export interface Sort {
    key: string,
    direction?: 'ASC'|'DESC'
};
  
export interface Group {
    key: string,
    label: string
};

export interface Filter {
    key: string,
    label: string
};
export interface Pagination {
    page: number,
    length: number
};

export interface Config {
    sort?: Sort[];
    search?: string,
    group?: Group[],
    filter?: Filter[],
    paginate?: Pagination
}

const normalizePath = (path) => {
    if (Array.isArray(path)) {
        return path;
    }
    return path.split(/\.|\[(\d*)\]/).filter(e => !!e);
};

export const walkObject = (source, path) => {
    const parts = normalizePath(path);
    const l = parts.length;
    let i = 0;
    for (i; i < l; i++) {
        if (
            source !== undefined &&
            parts[i] !== undefined &&
            source.hasOwnProperty(parts[i])
        ) {
            source = source[parts[i]];
        } else {
            return undefined;
        }
    }
    return source;
}

const sortGenerator = (...columns) => {
    const fnBody = `
      ${columns.map((col, i) => `
          const a${i} = walkObject(a, '${col.key}')
          const b${i} = walkObject(b, '${col.key}')
          if ('${col.direction}' === 'DESC') {
            if (a${i} > b${i}) return -1;
            if (a${i} < b${i}) return 1;
          } else {
            if (a${i} > b${i}) return 1;
            if (a${i} < b${i}) return -1;
          }
      `).join('')}
      return 0;`
    const innerFunction = new Function('a', 'b', 'walkObject', fnBody);
    return (a, b) => innerFunction(a, b, walkObject)
}

const putRowInGroup = (grouping, row, levels: Group[]) => {
    const currentLevel = levels.shift();
    const currentLevelKey = currentLevel.key;
    const currentLevelValue = walkObject(row, currentLevelKey);
    grouping[currentLevelValue] = grouping[currentLevelValue] || Object.create(null);
    grouping[currentLevelValue].__groupKey = currentLevelKey;
    grouping[currentLevelValue].__groupValue = currentLevelValue;
    grouping[currentLevelValue].__groupLabel = currentLevel.label;

    if (levels.length) {
        putRowInGroup(grouping[currentLevelValue], row, levels)
    } else {
        grouping[currentLevelValue].__rows = grouping[currentLevelValue].__rows || []
        grouping[currentLevelValue].__rows.push(row);
    }
}

export const groupBy = (data, groups: Group[]) => {
    const groupings = Object.create(null)
    data.forEach((row) => {
        putRowInGroup(groupings, row, groups.slice())
    });
    return groupings;
}

export const sortBy = (data, columns: Sort[]) => {
    const sortFn = sortGenerator.apply(null, columns);
    data.sort(sortFn);
    return data;
}

export const paginate = (data: any[], page: number, rowsPerPage: number): any[] => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
}

export const search = (data: any[], term: string, key?: string): any[] => {
    if (!term) {
        return data;
    }
    const safeTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return data.filter(row => {
        const regex = new RegExp(safeTerm, 'gi');
        let value: any;
        if (key) {
            value = walkObject(row, key);
        } else {
            value = row;
        }
        if (value !== undefined && value !== null) {
            return regex.test(JSON.stringify(value));
        } else {
            return false;
        }
    });
}