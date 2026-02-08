function createSchemaFiles(rootFolder, schemaJson, database) {
    if (!schemaJson) {
        return;
    }
    
    const tableCreateSQL = generatePostgreSQLCreateTableSql(schemaJson);
    FileUtil.createFile(rootFolder, {name: "src/main/resources/schema.sql", content: tableCreateSQL});
}

function generatePostgreSQLCreateTableSql(schemaJson) {
    let sql = `DROP TABLE IF EXISTS ${schemaJson.tableName};\n`;
    sql += `\n`;
    sql += `CREATE TABLE ${schemaJson.tableName} (\n`;
    const columnDefinitions = [];
    const pkColumns = []; // PK 컬럼 이름을 담을 배열
    
    schemaJson.columns.forEach(col => {
        let column = `    ${col.name} ${col.type}`;

        if (col.length) {
            column += `(${col.length})`;
        }

        if (col.isIncrement) {
            column = " ${col.name} SERIAL";
        }

        if (!col.isNullable) {
            column += " NOT NULL";
        }
        
        if (col.defaultValue) {
            const isFunction = ["CURRENT_TIMESTAMP", "NOW()"].includes(col.defaultValue.toUpperCase());
            const isNumeric = ["INT", "BIGINT", "BOOLEAN"].includes(col.type);
            column += ` DEFAULT ${isNumeric || isFunction ? col.defaultValue : `'${col.defaultValue}'`}`;
        }

        if (col.isPrimaryKey) {
            pkColumns.push(col.name);
        }

        columnDefinitions.push(column);
    });

    // 모든 컬럼 정의 추가
    sql += columnDefinitions.join(",\n");

    // PK가 있을 경우 하단에 별도 선언
    if (pkColumns.length > 0) {
        sql += `,\n    PRIMARY KEY (${pkColumns.join(", ")})`;
    }

    sql += "\n);";
    
    return sql;
}