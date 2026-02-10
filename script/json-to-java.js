const POSTGRESQL_TYPE_TO_JAVA_MAP = {
    'SMALLINT': { javaType: 'Integer', import: null },
    'INTEGER': { javaType: 'Integer', import: null },
    'INT': { javaType: 'Integer', import: null },
    'BIGINT': { javaType: 'Long', import: null },
    'DECIMAL': { javaType: 'BigDecimal', import: 'java.math.BigDecimal' },
    'NUMERIC': { javaType: 'BigDecimal', import: 'java.math.BigDecimal' },
    'REAL': { javaType: 'Float', import: null },
    'DOUBLE PRECISION': { javaType: 'Double', import: null },
    'CHARACTER VARYING': { javaType: 'String', import: null },
    'VARCHAR': { javaType: 'String', import: null },
    'CHARACTER': { javaType: 'String', import: null },
    'CHAR': { javaType: 'String', import: null },
    'TEXT': { javaType: 'String', import: null },
    'TIME': { javaType: 'LocalTime', import: 'java.time.LocalTime' },
    'DATE': { javaType: 'LocalDate', import: 'java.time.LocalDate' },
    'TIMESTAMP': { javaType: 'LocalDateTime', import: 'java.time.LocalDateTime' },
    'TIMESTAMP WITH TIME ZONE': { javaType: 'OffsetDateTime', import: 'java.time.OffsetDateTime' },
    'TIMESTAMPTZ': { javaType: 'OffsetDateTime', import: 'java.time.OffsetDateTime' },
    'BOOLEAN': { javaType: 'Boolean', import: null },
    'UUID': { javaType: 'UUID', import: 'java.util.UUID' },
    'JSON': { javaType: 'String', import: null },
    'JSONB': { javaType: 'String', import: null }
};

function getJavaType(columnType) {
    const type = columnType.toUpperCase();

    if (POSTGRESQL_TYPE_TO_JAVA_MAP[type]) {
        return POSTGRESQL_TYPE_TO_JAVA_MAP[type].javaType;
    }

    return 'Object';
}

function getJavaTypeImport(columnType) {
    const type = columnType.toUpperCase();

    if (POSTGRESQL_TYPE_TO_JAVA_MAP[type]) {
        return POSTGRESQL_TYPE_TO_JAVA_MAP[type].import;
    }

    return null;
}
function getFieldMember(column, intent = 0) {
    const javaType = getJavaType(column.type);
    const columnName = toCamelCase(column.name);
    
    return " ".repeat(intent) + `private ${javaType} ${columnName};`;
}
function getGetter(column, intent = 0) {
    const javaType = getJavaType(column.type);
    const columnName = toCamelCase(column.name);
    const columnMethodName = toPascalCase(columnName);

    let content = ""
    content += " ".repeat(intent) + `public ${javaType} get${columnMethodName}() {\n`;
    content += " ".repeat(intent) + `    return ${columnName};\n`;
    content += " ".repeat(intent) + `}`;

    return content;
}
function getSetter(column, intent = 0) {
    const javaType = getJavaType(column.type);
    const columnName = toCamelCase(column.name);
    const columnMethodName = toPascalCase(columnName);

    let content = ""
    content += " ".repeat(intent) + `public void set${columnMethodName}(${javaType} ${columnName}) {\n`;
    content += " ".repeat(intent) + `    this.${columnName} = ${columnName};\n`;
    content += " ".repeat(intent) + `}`;

    return content;
}
function getDtoToStringMethod(schema, intent = 0) {
    const toStringParts = schema.columns.map(column => {
        const columnName = toCamelCase(column.name);
        return " ".repeat(intent) + `        "${columnName}=" + ${columnName} + "`;
    });

    let content = ""
    content += " ".repeat(intent) + `@Override\n`;
    content += " ".repeat(intent) + `public String toString() {\n`;
    content += " ".repeat(intent) + `    return "${getDtoClassName(schema)}[" +\n`;
    content += toStringParts.join(`," +\n`) + `]";\n`;
    content += " ".repeat(intent) + `}\n`;

    return content;
}

function getJavaTypeImports(columns) {
    let imports = columns.map(column => POSTGRESQL_TYPE_TO_JAVA_MAP[column.type]? POSTGRESQL_TYPE_TO_JAVA_MAP[column.type].import : null)
        .filter(o => o)
        .map(s => "import " + s + ";");

    return [...new Set(imports)];
}

function getPrimaryColumns(schema) {
    return schema.columns.filter(column => column.isPrimaryKey);
}
function getPrimaryKeyPath(schema) {
    return getPrimaryColumns(schema).map(column => `{${toCamelCase(column.name)}}`).join("/");
}
function getPrimaryKeyParams(schema) {
    return getPrimaryColumns(schema).map(column => {
        return `${getJavaType(column.type)} ${toCamelCase(column.name)}`;
    }).join(", ");
}
function getPrimaryKeyPathParams(schema) {
    return getPrimaryColumns(schema).map(column => {
        return `@PathVariable("${toCamelCase(column.name)}") ${getJavaType(column.type)} ${toCamelCase(column.name)}`;
    }).join(", ");
}
function getPrimaryKeyArgs(schema) {
    return getPrimaryColumns(schema).map(column => toCamelCase(column.name)).join(", ");
}

function getApplicationClassName(schema) {
    return toPascalCase(schema.name) + "Application";
}
function getControllerClassName(schema) {
    return toPascalCase(schema.name) + "Controller";
}
function getServiceClassName(schema) {
    return toPascalCase(schema.name) + "Service";
}
function getServiceInstanceName(schema) {
    return toCamelCase(schema.name) + "Service";
}
function getServiceImplClassName(schema) {
    return toPascalCase(schema.name) + "ServiceImpl";
}
function getServiceImplInstanceName(schema) {
    return toCamelCase(schema.name) + "ServiceImpl";
}
function getDaoClassName(schema) {
    return toPascalCase(schema.name) + "DAO";
}
function getDaoInstanceName(schema) {
    return toCamelCase(schema.name) + "DAO";
}
function getDtoClassName(schema) {
    return toPascalCase(schema.name) + "DTO";
}
function getDtoInstanceName(schema) {
    return toCamelCase(schema.name) + "DTO";
}