function createDaoFile(rootFolder, userOptions = {}, schema) {
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
        name: `src/main/java/${packagePath}/dao/${getDaoClassName(schema)}.java`,
        content: generateDaoContent(options, schema)
    });
}

function generateDaoContent(options, schema) {
    const packageName = options.groupName + "." + options.projectName;

    const controllerClassName = getControllerClassName(schema);
    const serviceClassName = getServiceClassName(schema);
    const serviceInstanceName = getServiceInstanceName(schema);
    const dtoClassName = getDtoClassName(schema);
    const dtoInstanceName = getDtoInstanceName(schema);
    const daoClassName = getDaoClassName(schema);

    const pkParams = getPrimaryKeyParams(schema);
    const pkArgs = getPrimaryKeyArgs(schema);

    const insertSqlArgs = schema.columns.filter(col => !col.isIncrement).map(col => `${dtoInstanceName}.get${toPascalCase(col.name)}()`).join(", ");

    let content = "";
    content += `package ${packageName}.dao;\n`
    content += `\n`
    content += `import java.util.List;\n`
    content += `import org.springframework.stereotype.Repository;\n`
    content += `import org.springframework.jdbc.core.BeanPropertyRowMapper;\n`
    content += `import org.springframework.jdbc.core.RowMapper;\n`
    content += `import org.springframework.jdbc.core.JdbcTemplate;\n`
    content += `${getJavaTypeImports(getPrimaryColumns(schema)).join("\n")}\n`;
    content += `\n`
    content += `import ${packageName}.dto.${dtoClassName};\n`
    content += `\n`
    content += `@Repository\n`;
    content += `public class ${daoClassName} {\n`
    content += `    private final RowMapper<${dtoClassName}> rowMapper = new BeanPropertyRowMapper<>(${dtoClassName}.class);\n`
    content += `    private final JdbcTemplate jdbcTemplate;\n`
    content += `\n`
    content += `    public ${daoClassName}(JdbcTemplate jdbcTemplate) {\n`
    content += `        this.jdbcTemplate = jdbcTemplate;\n`
    content += `    }\n`
    content += `\n`
    content += `    public int create(${dtoClassName} ${dtoInstanceName}) {\n`;
    content += `        String sql = "${generatePreparedInsertSql(schema)}";\n`;
    content += `        return jdbcTemplate.update(sql, ${insertSqlArgs});\n`;
    content += `    }\n`;
    content += `\n`;
    content += `    public ${dtoClassName} findById(${pkParams}) {\n`;
    content += `        String sql = "${generatePreparedSelectOneSql(schema)}";\n`;
    content += `        return jdbcTemplate.queryForObject(sql, rowMapper, ${pkArgs});\n`;
    content += `    }\n`;
    content += `\n`;
    content += `    public List<${dtoClassName}> findAll(${dtoClassName} ${dtoInstanceName}, int offset, int size, String sort) {\n`;
    content += `        return null;\n`;
    content += `    }\n`;
    content += `\n`;
    content += `    public int countAll(${dtoClassName} ${dtoInstanceName}) {\n`;
    content += `        return 0;\n`;
    content += `    }\n`;
    content += `\n`;
    content += `    public int update(${dtoClassName} ${dtoInstanceName}) {\n`;
    content += `        return 0;\n`;
    content += `    }\n`;
    content += `\n`;
    content += `    public int patch(${dtoClassName} ${dtoInstanceName}) {\n`;
    content += `        return 0;\n`;
    content += `    }\n`;
    content += `\n`;
    content += `    public int delete(${pkParams}) {\n`;
    content += `        return 0;\n`;
    content += `    }\n`;
    content += `}`

    return content;
}