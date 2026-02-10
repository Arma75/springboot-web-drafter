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

        if (column.isNullable === false && !column.isPrimaryKey) {
            line += " NOT NULL";
        }

        if (column.isUnique && !column.isPrimaryKey) {
            line += " UNIQUE";
        }

        if (!column.isIncrement && column.defaultValue !== undefined && column.defaultValue !== "") {
            const isFunc = ["TIMESTAMP", "NOW", "CURRENT_TIMESTAMP"].includes(column.defaultValue.toUpperCase());
            const isNumeric = POSTGRESQL_NUMERIC_TYPES.includes(column.type.toUpperCase());
            
            if (isFunc || isNumeric) {
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
    sql += `PRIMARY KEY (${primaryColumns.join(", ")})\n`;
    sql += "\n);";

    if (tableComment) {
        sql += `\nCOMMENT ON TABLE ${tableName} IS '${tableComment}';`;
    }
    if (columnCommentLines.length > 0) {
        sql += `\n${columnCommentLines.join("\n")}`;
    }

    return sql;
}