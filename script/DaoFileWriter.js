function createDaoFile(rootFolder, userOptions = {}, tableSchema) {
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
    const daoClassName = StringUtil.toPascalCase(options.projectName) + "DAO";

    FileUtil.createFile(rootFolder, {
        name: `src/main/java/${packagePath}/dao/${daoClassName}.java`,
        content: generateDaoContent(options, tableSchema)
    });
}

function generateDaoContent(options, tableSchema) {
    const packageName = options.groupName + "." + options.projectName;
    const packagePath = packageName.replace(/\./g, '/');
    const dtoClassName = StringUtil.toPascalCase(options.projectName) + "DTO";
    const daoClassName = StringUtil.toPascalCase(options.projectName) + "DAO";
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

    // pk 컬럼들만 필터링
    const pkColumns = tableSchema.columns.filter(col => col.isPrimaryKey);

    // pk 파라미터 생성
    const pkParams = pkColumns.map(col => {
        const javaType = typeMap[col.type.toUpperCase()] || 'String';
        const camelName = StringUtil.toCamelCase(col.name);
        return `${javaType} ${camelName}`;
    }).join(", ");

    let daoContent = "";
    daoContent += `package ${packageName}.dao;\n`
    daoContent += `\n`
    daoContent += `import java.util.List;\n`
    daoContent += `import org.springframework.stereotype.Repository;\n`
    daoContent += `import ${packageName}.dto.${dtoClassName};\n`
    daoContent += `\n`
    daoContent += `@Repository\n`;
    daoContent += `public class ${daoClassName} {\n`
    daoContent += `    public int create(${dtoClassName} dto) {\n`;
    daoContent += `        return 0;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public int createBulk(List<${dtoClassName}> dtos) {\n`;
    daoContent += `        return 0;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public ${dtoClassName} findById(${pkParams}) {\n`;
    daoContent += `        return null;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public List<${dtoClassName}> findAll(${dtoClassName} dto, int offset, int size, String sort) {\n`;
    daoContent += `        return null;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public int countAll(${dtoClassName} dto) {\n`;
    daoContent += `        return 0;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public List<${dtoClassName}> findRandom(${dtoClassName} dto, int count) {\n`;
    daoContent += `        return null;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public int update(${dtoClassName} dto) {\n`;
    daoContent += `        return 0;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public int updateBulk(List<${dtoClassName}> dtos) {\n`;
    daoContent += `        return 0;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public int patch(${dtoClassName} dto) {\n`;
    daoContent += `        return 0;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public int patchBulk(List<${dtoClassName}> dtos) {\n`;
    daoContent += `        return 0;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public int unuse(${dtoClassName} dto) {\n`;
    daoContent += `        return 0;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public int unuseBulk(List<${dtoClassName}> dtos) {\n`;
    daoContent += `        return 0;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public int delete(${dtoClassName} dto) {\n`;
    daoContent += `        return 0;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `    public int deleteBulk(List<${dtoClassName}> dtos) {\n`;
    daoContent += `        return 0;\n`;
    daoContent += `    }\n`;
    daoContent += `\n`;
    daoContent += `}`

    return daoContent;
}