/*
const tableSchema = {
    name: "PLAYLIST",
    comment: "플레이리스트 테이블",
    columns: [
        {
            name: "ID",
            comment: "아이디",
            type: "BIGINT",
            length: "20",
            defaultValue: "",
            isPrimaryKey: true,
            isNullable: false,
            isIncrement: true
        },
        {
            name: "GENRE",
            comment: "장르",
            type: "VARCHAR",
            length: "50",
            defaultValue: "",
            isPrimaryKey: false,
            isNullable: false,
            isIncrement: false
        },
        {
            name: "ARTIST",
            comment: "아티스트",
            type: "VARCHAR",
            length: "100",
            defaultValue: "",
            isPrimaryKey: false,
            isNullable: false,
            isIncrement: false
        },
        {
            name: "SONG_TITLE",
            comment: "곡 제목",
            type: "VARCHAR",
            length: "200",
            defaultValue: "",
            isPrimaryKey: false,
            isNullable: true,
            isIncrement: false
        },
        {
            name: "IS_USED",
            comment: "사용 여부",
            type: "CHAR",
            length: "1",
            defaultValue: "Y",
            isPrimaryKey: false,
            isNullable: false,
            isIncrement: false,
            isLogicalUse: true
        },
        {
            name: "CREATED_AT",
            comment: "생성일",
            type: "TIMESTAMP",
            length: null,
            defaultValue: "CURRENT_TIMESTAMP",
            isPrimaryKey: false,
            isNullable: false,
            isIncrement: false
        },
        {
            name: "UPDATED_AT",
            comment: "수정일",
            type: "TIMESTAMP",
            length: null,
            defaultValue: "CURRENT_TIMESTAMP",
            isPrimaryKey: false,
            isNullable: false,
            isIncrement: false
        }
    ]
};
*/
const DATABASE_RESERVED_WORDS = [
    'ALL', 'AND', 'ANY', 'AS', 'ASC', 'BETWEEN', 'BY', 'CASE', 'CAST', 'CHECK', 'COLUMN', 'CONSTRAINT',
    'CREATE', 'CROSS', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'DEFAULT', 'DELETE', 'DESC',
    'DISTINCT', 'DROP', 'ELSE', 'END', 'EXISTS', 'FALSE', 'FOR', 'FOREIGN', 'FROM', 'FULL', 'GROUP',
    'HAVING', 'IN', 'INNER', 'INSERT', 'INTERSECT', 'INTO', 'IS', 'JOIN', 'LEFT', 'LIKE', 'LIMIT',
    'NOT', 'NULL', 'ON', 'OR', 'ORDER', 'OUTER', 'PRIMARY', 'REFERENCES', 'RIGHT', 'SELECT', 'SET',
    'TABLE', 'THEN', 'TRUE', 'UNION', 'UNIQUE', 'UPDATE', 'USER', 'USING', 'VALUES', 'WHEN', 'WHERE',
    'WITH', 'WINDOW', 'FETCH', 'OFFSET', 'ROW', 'ROWS', 'ONLY', 'RETURNING', 'VARYING', 'SEQUENCE', 'TRIGGER',
    'PROCEDURE', 'FUNCTION', 'DATABASE', 'SCHEMA', 'INDEX', 'KEY'
];

const POSTGRESQL_TYPES = [
    'SMALLINT', 'INTEGER', 'INT', 'BIGINT', 'DECIMAL', 'NUMERIC',
    'REAL', 'DOUBLE PRECISION',
    'CHARACTER VARYING', 'VARCHAR', 'CHARACTER', 'CHAR', 'TEXT',
    'TIME', 'DATE', 'TIMESTAMP',
    'TIMESTAMP WITH TIME ZONE', 'TIMESTAMPTZ',
    'BOOLEAN', 'UUID', 'JSON', 'JSONB'
    // 'SMALLSERIAL', 'SERIAL', 'BIGSERIAL'
];
const POSTGRESQL_NUMERIC_TYPES = [
    'SMALLINT', 'INTEGER', 'INT', 'BIGINT', 'DECIMAL', 'NUMERIC'
];
const POSTGRESQL_INCREMENTABLE_TYPES = [
    'SMALLINT', 'INT', 'INTEGER', 'BIGINT'
];
const POSTGRESQL_FUNCTION_TYPES = [
    'NOW()', 'CURRENT_TIMESTAMP'
];
const POSTGRESQL_LENGTH_REQUIRED_TYPES = [
    'CHARACTER VARYING', 'VARCHAR', 'CHARACTER', 'CHAR'
];
const POSTGRESQL_DATE_TYPES = [
    'TIME', 'DATE', 'TIMESTAMP',
    'TIMESTAMP WITH TIME ZONE', 'TIMESTAMPTZ',
];

function getPrimaryColumns(schema) {
    return schema.columns.filter(column => column.isPrimaryKey);
}
function getInsertableColumns(schema) {
    return schema.columns.filter(column => !column.isIncrement);
}
function getRequiredInsertColumns(schema) {
    return schema.columns.filter(column => {
        if (column.isIncrement) {
            return false;
        }
        if (column.isPrimaryKey) {
            return true;
        }
        
        return !column.isNullable && !column.defaultValue;
    });
}
function getUpdatableColumns(schema) {
    return schema.columns.filter(column => {
        if (column.isIncrement) {
            return false;
        }
        if (column.isPrimaryKey) {
            return false;
        }
        
        return !column.isIncrement && !column.isPrimaryKey;
    });
}
function getDateColumns(schema) {
    return schema.columns.filter(column => POSTGRESQL_DATE_TYPES.includes(column.type.toUpperCase()));
}

const isValidIdentifier = (value) => {
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
        throw new Error(`'${value}' is not a valid identifier. It must start with a letter and can only contain letters, numbers, and underscores.`);
    }

    return true;
}

const isReserved = (name) => {
    return DATABASE_RESERVED_WORDS.includes(name.toUpperCase());
}

const isValidSchema = (schema) => {
    if (!schema || typeof schema !== 'object') {
        throw new Error("Schema information must be an object.");
    }
    if (!schema.name) {
        throw new Error("Table name is required.");
    }
    if (!isValidIdentifier(schema.name)) {
        throw new Error(`Table name '${schema.name}' is not a valid identifier.`);
    }
    if (isReserved(schema.name)) {
        throw new Error(`Table name '${schema.name}' is a reserved database word.`);
    }
    if (!Array.isArray(schema.columns) || schema.columns.length === 0) {
        throw new Error("At least one column definition is required.");
    }

    schema.columns.forEach((column, index) => {
        if (!column.name) {
            throw new Error(`Column ${index + 1} is missing a name.`);
        }
        if (!isValidIdentifier(column.name)) {
            throw new Error(`Column name '${column.name}' is not a valid identifier.`);
        }
        if (isReserved(column.name)) {
            throw new Error(`Column name '${column.name}' is a reserved database word.`);
        }
        if (column.name.includes(' ') || column.name.includes("'")) {
            throw new Error(`Column name '${column.name}' cannot contain spaces or single quotes.`);
        }
        if (!column.type) {
            throw new Error(`Column ${column.name} is missing a type.`);
        }
        
        if (!POSTGRESQL_TYPES.includes(column.type.toUpperCase())) {
            throw new Error(`Column ${column.name} has an invalid type.`);
        }
        
        if (column.isIncrement) {
            if (!POSTGRESQL_INCREMENTABLE_TYPES.includes(column.type.toUpperCase())) {
                throw new Error(`Column ${column.name} is incrementing but its type '${column.type}' is not a valid numeric type for auto-increment.`);
            }
        }
    });

    if (!schema.columns.some(column => column.isPrimaryKey)) {
        throw new Error("At least one primary key column is required.");
    }

    if (schema.columns.filter(column => column.isPrimaryKey).some(column => column.isNullable)) {
        throw new Error("Primary key columns cannot be nullable.");
    }

    const columnNames = new Set();
    schema.columns.forEach(column => {
        const upperName = column.name.toUpperCase();

        if (columnNames.has(upperName)) {
            throw new Error(`Duplicate '${column.name}' column found.`);
        }

        columnNames.add(upperName);
    });

    return true;
}

const getPostgreSQLType = (column) => {
    const type = column.type.toUpperCase();
    if (column.isIncrement) {
        switch (type) {
            case 'SMALLINT':
                return 'SMALLSERIAL';
            case 'BIGINT':
                return 'BIGSERIAL';
            default:
                return 'SERIAL';
        }
    }
    
    return type === 'INT' ? 'INTEGER' : type;
};

const generateCreateTableSQL = (schema) => {
    isValidSchema(schema);

    const tableName = toSnakeCase(schema.name).toUpperCase();
    const tableComment = schema.comment;

    let primaryColumns = [];
    let columnCommentLines = [];
    
    let sql = `-- ${tableName} Table Creation Script\n`;
    sql += `CREATE TABLE ${tableName} (\n`;

    const columnDefinitions = schema.columns.map(column => {
        const columnName = toSnakeCase(column.name).toUpperCase();
        const type = getPostgreSQLType(column);
        
        let line = `    ${columnName} ${type}`;

        if (POSTGRESQL_LENGTH_REQUIRED_TYPES.includes(column.type.toUpperCase())) {
            line += `(${column.length})`
        }

        if (column.isNullable === false && !column.isPrimaryKey) {
            line += " NOT NULL";
        }

        if (column.isUnique && !column.isPrimaryKey) {
            line += " UNIQUE";
        }

        if (!column.isIncrement && column.defaultValue !== undefined && column.defaultValue !== "") {
            const isFunction = POSTGRESQL_FUNCTION_TYPES.includes(column.defaultValue.toUpperCase());
            const isNumeric = POSTGRESQL_NUMERIC_TYPES.includes(column.type.toUpperCase());
            
            if (isFunction || isNumeric) {
                line += ` DEFAULT ${column.defaultValue}`;
            } else {
                line += ` DEFAULT '${column.defaultValue}'`;
            }
        }

        if (column.comment) {
            line += ` -- ${column.comment}`;
            columnCommentLines.push(`COMMENT ON COLUMN ${tableName}.${columnName} IS '${column.comment}';`);
        }

        if (column.isPrimaryKey) {
            primaryColumns.push(columnName);
        }

        return line;
    });

    sql += columnDefinitions.join(",\n") + ",\n";
    sql += `    PRIMARY KEY (${primaryColumns.join(", ")})\n`;
    sql += ");";

    if (tableComment) {
        sql += `\nCOMMENT ON TABLE ${tableName} IS '${tableComment}';`;
    }
    if (columnCommentLines.length > 0) {
        sql += `\n${columnCommentLines.join("\n")}`;
    }

    return sql;
}

function formatSqlValue(column, value) {
    const type = column.type.toUpperCase();
    
    const isFunction = POSTGRESQL_FUNCTION_TYPES.includes(String(value).toUpperCase());
    const isNumeric = POSTGRESQL_NUMERIC_TYPES.includes(type);
    
    if (isNumeric || isFunction || typeof value === 'number') {
        return value;
    }

    if (type === 'BOOLEAN') {
        return String(value).toUpperCase();
    }

    return `'${String(value).replace(/'/g, "''")}'`;
}

function generateDummyInsertSql(schema, count = 1) {
    const tableName = toSnakeCase(schema.name).toUpperCase();
    
    const columnsToInsert = schema.columns.filter(col => !col.isIncrement);
    const columnNames = columnsToInsert.map(col => toSnakeCase(col.name).toUpperCase()).join(", ");

    let sql = "";
    for (let i = 0; i < count; i++) {
        const values = columnsToInsert.map(column => {
            const type = column.type.toUpperCase();
            const length = parseInt(column.length) || 1;

            let val;

            if (POSTGRESQL_NUMERIC_TYPES.includes(type)) {
                val = Math.floor(Math.random() * 100);
            } else if (type === 'BOOLEAN') {
                val = Math.random() > 0.5 ? 'TRUE' : 'FALSE';
            } else if (['TIME', 'DATE', 'TIMESTAMP', 'TIMESTAMP WITH TIME ZONE', 'TIMESTAMPTZ'].includes(type)) {
                val = 'CURRENT_TIMESTAMP'
            } else {
                val = (i + Math.random().toString(36).substring(2, 2 + length)).substr(0, length);
            }

            return formatSqlValue(column, val);
        }).join(", ");

        sql += `INSERT INTO ${tableName} (\n`;
        sql += `    ${columnNames}\n`;
        sql += `) VALUES (\n`;
        sql += `    ${values}\n`;
        sql += `);\n`;
    }

    return sql;
}

function generateInsertSql(schema, data) {
    const tableName = toSnakeCase(schema.name).toUpperCase();
    
    const columnsToInsert = schema.columns.filter(col => !col.isIncrement);
    const columnNames = columnsToInsert.map(col => toSnakeCase(col.name).toUpperCase()).join(", ");

    const values = columnsToInsert.map(col => {
        // 전달받은 값이 없으면 디폴트값을 가지고 판단
        const val = data[col.name] || data[toSnakeCase(col.name).toUpperCase()] || col.defaultValue;
        
        if (val === undefined || val === null || val === "") {
            if (col.isNullable) {
                return "NULL";
            }
            if (col.defaultValue) {
                return formatSqlValue(col, col.defaultValue);
            }
            return "''";
        }

        return formatSqlValue(col, val);
    }).join(", ");

    let sql = "";
    sql += `INSERT INTO ${tableName} (\n`;
    sql += `    ${columnNames}\n`;
    sql += `) VALUES (\n`;
    sql += `    ${values}\n`;
    sql += `);`;

    return sql;
}

function generatePreparedInsertSql(schema) {
    const tableName = toSnakeCase(schema.name).toUpperCase();
    
    const columnsToInsert = schema.columns.filter(col => !col.isIncrement);
    const columnNames = columnsToInsert.map(col => toSnakeCase(col.name).toUpperCase()).join(", ");

    const values = columnsToInsert.map(_ => '?').join(", ");

    let sql = "";
    sql += `INSERT INTO ${tableName} (${columnNames}) VALUES (${values});`;

    return sql;
}
function generatePreparedSelectOneSql(schema) {
    const tableName = toSnakeCase(schema.name).toUpperCase();
    
    const columnsToInsert = schema.columns.filter(col => !col.isIncrement);
    const columnNames = columnsToInsert.map(col => toSnakeCase(col.name).toUpperCase()).join(", ");

    const values = columnsToInsert.map(_ => '?').join(", ");

    const conditions = schema.columns.filter(column => column.isPrimaryKey).map(c => `${toSnakeCase(c.name).toUpperCase()} = ?`).join(" AND ");

    let sql = "";
    sql += `SELECT * FROM ${tableName} WHERE ${conditions};`;

    return sql;
}
function generatePreparedSelectSql(schema) {
    const tableName = toScreamSnakeCase(schema.name);
    
    let sql = "";
    sql += `SELECT * FROM ${tableName} WHERE 1=1`;

    return sql;
}
function generatePreparedCountSql(schema) {
    const tableName = toScreamSnakeCase(schema.name);
    
    let sql = "";
    sql += `SELECT COUNT(*) FROM ${tableName} WHERE 1=1`;

    return sql;
}
function generatePreparedUpdateSql(schema) {
    const tableName = toScreamSnakeCase(schema.name);

    const conditions = getPrimaryColumns(schema).map(c => `${toSnakeCase(c.name).toUpperCase()} = ?`).join(" AND ");
    const values = getInsertableColumns(schema).map(c => `${toSnakeCase(c.name).toUpperCase()} = ?`).join(", ");
    
    let sql = "";
    sql += `UPDATE ${tableName} SET ${values} WHERE ${conditions}`;

    return sql;
}
function generatePreparedDeleteSql(schema) {
    const tableName = toScreamSnakeCase(schema.name);

    const conditions = getPrimaryColumns(schema).map(c => `${toSnakeCase(c.name).toUpperCase()} = ?`).join(" AND ");
    const values = getInsertableColumns(schema).map(c => `${toSnakeCase(c.name).toUpperCase()} = ?`).join(", ");
    
    let sql = "";
    sql += `DELETE FROM ${tableName} WHERE ${conditions}`;

    return sql;
}