function createDtoFile(rootFolder, userOptions = {}, schema) {
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

    FileUtil.createFile(rootFolder, {
        name: `src/main/java/${packagePath}/dto/${getDtoClassName(schema)}.java`,
        content: generateDtoContent(options, schema)
    });
}

function generateDtoContent(options, schema) {
    const packageName = options.groupName + "." + options.projectName;

    const dtoClassName = getDtoClassName(schema);
    const dateColumns = getDateColumns(schema);
    let customColumns = [];
    schema.columns.map(column => {
        customColumns.push(column);

        if (dateColumns.includes(column)) {
            customColumns.push({
                ...column,
                name: `${toScreamSnakeCase(column.name)}_START`,
                comment: `${column.comment} (시작일)`
            });
            customColumns.push({
                ...column,
                name: `${toScreamSnakeCase(column.name)}_END`,
                comment: `${column.comment} (종료일)`
            });
        }
    })

    let content = "";
    content += `package ${packageName}.dto;\n`
    content += `\n`
    content += `${getJavaTypeImports(customColumns).join("\n")}\n`;
    content += `\n`
    content += `public class ${dtoClassName} {\n`
    customColumns.forEach(column => {
        content += `${getFieldMember(column, 4)}\n`;
    });
    content += `\n`;
    customColumns.forEach(column => {
        content += `${getGetter(column, 4)}\n`;
    });
    content += `\n`;
    customColumns.forEach(column => {
        content += `${getSetter(column, 4)}\n`;
    });
    content += `\n`;
    content += getDtoToStringMethod(schema, 4);
    content += `}`;

    return content;
}