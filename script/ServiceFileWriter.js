function createServiceFiles(folder, userOptions = {}, schema) {
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
    
    FileUtil.createFile(folder, {
        name: `src/main/java/${packagePath}/service/${getServiceClassName(schema)}.java`,
        content: generateServiceContent(options, schema)
    });
    
    FileUtil.createFile(folder, {
        name: `src/main/java/${packagePath}/service/${getServiceImplClassName(schema)}.java`,
        content: generateServiceImplContent(options, schema)
    });
}

function generateServiceContent(options, schema) {
    const packageName = options.groupName + "." + options.projectName;

    const controllerClassName = getControllerClassName(schema);
    const serviceClassName = getServiceClassName(schema);
    const serviceInstanceName = getServiceInstanceName(schema);
    const dtoClassName = getDtoClassName(schema);
    const dtoInstanceName = getDtoInstanceName(schema);

    const pkParams = getPrimaryKeyParams(schema);
    const pkArgs = getPrimaryKeyArgs(schema);

    let content = "";
    content += `package ${packageName}.service;\n`
    content += `\n`
    content += `import java.util.List;\n`
    content += `${getJavaTypeImports(getPrimaryColumns(schema)).join("\n")}\n`;
    content += `\n`
    content += `import ${packageName}.dto.${dtoClassName};\n`
    content += `\n`
    content += `public interface ${serviceClassName} {\n`
    content += `    int create(${dtoClassName} ${dtoInstanceName});\n`
    content += `\n`
    content += `    ${dtoClassName} findById(${pkParams});\n`
    content += `\n`
    content += `    List<${dtoClassName}> findAll(${dtoClassName} ${dtoInstanceName}, int page, int size, String sort);\n`
    content += `\n`
    content += `    int update(${pkParams}, ${dtoClassName} ${dtoInstanceName});\n`
    // content += `\n`
    // content += `    int patch(${pkParams}, ${dtoClassName} ${dtoInstanceName});\n`
    content += `\n`
    content += `    int delete(${pkParams});\n`
    content += `}`;

    return content;
}

function generateServiceImplContent(options, schema) {
    const packageName = options.groupName + "." + options.projectName;

    const controllerClassName = getControllerClassName(schema);
    const serviceClassName = getServiceClassName(schema);
    const serviceInstanceName = getServiceInstanceName(schema);
    const serviceImplClassName = getServiceImplClassName(schema);
    const dtoClassName = getDtoClassName(schema);
    const dtoInstanceName = getDtoInstanceName(schema);
    const daoClassName = getDaoClassName(schema);
    const daoInstanceName = getDaoInstanceName(schema);

    const pkParams = getPrimaryKeyParams(schema);
    const pkArgs = getPrimaryKeyArgs(schema);
    const primaryColumns = getPrimaryColumns(schema);

    const primaryColumnsSetter = primaryColumns.map(col => {
        const setterName = "set" + toPascalCase(col.name);
        const paramName = toCamelCase(col.name);
        return `        ${dtoInstanceName}.${setterName}(${paramName});\n`;
    });

    let content = "";
    content += `package ${packageName}.service;\n`
    content += `\n`
    content += `import org.springframework.stereotype.Service;\n`
    content += `import java.util.List;\n`
    content += `${getJavaTypeImports(getPrimaryColumns(schema)).join("\n")}\n`;
    content += `\n`
    content += `import ${packageName}.dto.${dtoClassName};\n`
    content += `import ${packageName}.dao.${daoClassName};\n`
    content += `\n`
    content += `@Service\n`
    content += `public class ${serviceImplClassName} implements ${serviceClassName} {\n`
    content += `    private final ${daoClassName} ${daoInstanceName};\n`
    content += `\n`
    content += `    public ${serviceImplClassName}(${daoClassName} ${daoInstanceName}) {\n`
    content += `        this.${daoInstanceName} = ${daoInstanceName};\n`
    content += `    }\n`
    content += `\n`
    content += `    public int create(${dtoClassName} ${dtoInstanceName}) {\n`
    content += `        return ${daoInstanceName}.create(${dtoInstanceName});\n`
    content += `    }\n`
    content += `\n`
    content += `    public ${dtoClassName} findById(${pkParams}) {\n`
    content += `        return ${daoInstanceName}.findById(${pkArgs});\n`
    content += `    }\n`
    content += `\n`
    content += `    public List<${dtoClassName}> findAll(${dtoClassName} ${dtoInstanceName}, int page, int size, String sort) {\n`
    content += `        return ${daoInstanceName}.findAll(${dtoInstanceName}, (page - 1) * size, size, sort);\n`
    content += `    }\n`
    content += `\n`
    content += `    public int update(${pkParams}, ${dtoClassName} ${dtoInstanceName}) {\n`
    content += `${primaryColumnsSetter.join("\n")}\n`;
    content += `        return ${daoInstanceName}.update(${dtoInstanceName});\n`
    content += `    }\n`
    // content += `\n`
    // content += `    public int patch(${pkParams}, ${dtoClassName} ${dtoInstanceName}) {\n`
    // content += `${primaryColumnsSetter.join("\n")}\n`;
    // content += `        return ${daoInstanceName}.patch(${dtoInstanceName});\n`
    // content += `    }\n`
    content += `\n`
    content += `    public int delete(${pkParams}) {\n`
    content += `        return ${daoInstanceName}.delete(${pkArgs});\n`
    content += `    }\n`
    content += `}`;

    return content;
}