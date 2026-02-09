function createDtoFile(rootFolder, userOptions = {}, tableSchema) {
    const defaultOptions = {
        groupName: "com.example",
        projectName: "demo",
        description: "SpringBoot demo project",
        javaVersion: 17,
        useSwagger: false,
        useJDBC: false,
        useH2DB: false,
        usePostgreSQL: false
    };
    const options = { ...defaultOptions, ...userOptions };

    const packageName = options.groupName + "." + options.projectName;
    const packagePath = packageName.replace(/\./g, '/');
    const dtoClassName = options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1) + "DTO";

    FileUtil.createFile(rootFolder, {
        name: `src/main/java/${packagePath}/dto/${dtoClassName}.java`,
        content: generateDtoContent(options, tableSchema)
    });
}

function generateDtoContent(options, tableSchema) {
    const packageName = options.groupName + "." + options.projectName;
    const packagePath = packageName.replace(/\./g, '/');
    const dtoClassName = StringUtil.toPascalCase(options.projectName) + "DTO";
    const typeMap = {
        'BOOLEAN': 'Boolean',
        'INT': 'Integer',
        'BIGINT': 'Long',
        'VARCHAR': 'String',
        'TEXT': 'String',
        'CHAR': 'String',
        'TIMESTAMP': 'LocalDateTime',
        'DATETIME': 'LocalDateTime',
        'DATE': 'java.time.LocalDate',
    };

    let dtoContent = "";
    dtoContent += `package ${packageName}.dto;\n`
    dtoContent += `\n`
    if (tableSchema.columns.some(col => ['TIMESTAMP', 'DATETIME', 'DATE'].includes(col.type.toUpperCase()))) {
        dtoContent += `import java.time.LocalDateTime;\n`
        dtoContent += `\n`
    }
    dtoContent += `public class ${dtoClassName} {\n`
    dtoContent += `    // DTO fields and methods\n`

    tableSchema.columns.forEach(col => {
        const javaType = typeMap[col.type.toUpperCase()] || 'String';
        const columnName = StringUtil.toCamelCase(StringUtil.toSnakeCase(col.name));
        dtoContent += `    private ${javaType} ${columnName};\n\n`;
        // Getter
        dtoContent += `    public ${javaType} get${StringUtil.toPascalCase(columnName)}() {\n`;
        dtoContent += `        return ${columnName};\n`;
        dtoContent += `    }\n\n`;
        // Setter
        dtoContent += `    public void set${StringUtil.toPascalCase(columnName)}(${javaType} ${columnName}) {\n`;
        dtoContent += `        this.${columnName} = ${columnName};\n`;
        dtoContent += `    }\n\n`;
    });

    dtoContent += `    @Override\n`;
    dtoContent += `    public String toString() {\n`;
    dtoContent += `        return "${dtoClassName}[" +\n`;
    
    const toStringParts = tableSchema.columns.map(col => {
        const columnName = StringUtil.toCamelCase(StringUtil.toSnakeCase(col.name));
        return `               "${columnName}=" + ${columnName} + "`;
    });

    dtoContent += toStringParts.join(`," +\n`) + `]";\n`;
    dtoContent += `    }\n`;

    dtoContent += `}`;

    return dtoContent;
}

const StringUtil = {
    toSnakeCase: function(str) {
        if (!str) {
            return '';
        }

        return str.replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s\-]+/g, '_')
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
    },

    toCamelCase: function(str) {
        return this.toSnakeCase(str).replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    },

    toPascalCase: function(str) {
        const camelCase = this.toCamelCase(str);
        return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    }
};