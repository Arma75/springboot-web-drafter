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

    const insertableColumnGetterCalls = getInsertableColumns(schema).map(c => `${dtoInstanceName}.${getGetterCall(c)}`);
    const primaryColumnGetterCalls = getPrimaryColumns(schema).map(c => `${dtoInstanceName}.${getGetterCall(c)}`);

    let content = "";
    content += `package ${packageName}.dao;\n`
    content += `\n`
    content += `import java.util.ArrayList;\n`
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
    content += `        StringBuilder sql = new StringBuilder("${generatePreparedSelectSql(schema)}");\n`;
    content += `        List<Object> params = new ArrayList<>();\n`
    content += `\n`;
    schema.columns.forEach(column => {
        const fieldName = toCamelCase(column.name);
        const colName = toScreamSnakeCase(column.name);
        const javaType = getJavaType(column.type);
        const getterCall = `${dtoInstanceName}.${getGetterCall(column)}`;

        if (javaType === 'String') {
            content += `        if (${getterCall} != null && !${getterCall}.isEmpty()) {\n`;
            content += `            sql.append(" AND ${colName} LIKE '%' || ? || '%'");\n`;
            content += `            params.add(${getterCall});\n`;
            content += `        }\n`;
        } else if (['LocalDate', 'LocalDateTime', 'LocalTime'].includes(javaType)) {
            const startGetter = `${dtoInstanceName}.get${toPascalCase(fieldName)}Start()`;
            const endGetter = `${dtoInstanceName}.get${toPascalCase(fieldName)}End()`;
            
            content += `        if (${startGetter} != null) {\n`;
            content += `            sql.append(" AND ${colName} >= ?");\n`;
            content += `            params.add(${startGetter});\n`;
            content += `        }\n`;
            content += `        if (${endGetter} != null) {\n`;
            content += `            sql.append(" AND ${colName} <= ?");\n`;
            content += `            params.add(${endGetter});\n`;
            content += `        }\n`;
        } else {
            content += `        if (${getterCall} != null) {\n`;
            content += `            sql.append(" AND ${colName} = ?");\n`;
            content += `            params.add(${getterCall});\n`;
            content += `        }\n`;
        }
    });
    content += `\n`;
    content += `        if (sort != null && !sort.isBlank()) {\n`
    content += `            sql.append(" ORDER BY");\n`
    content += `            String[] orders = sort.split(";");\n`
    content += `            for (int i = 0; i < orders.length; i++) {\n`
    content += `                String[] tokens = orders[i].split(",");\n`
    content += `                String column = tokens[0];\n`
    content += `                String direction = tokens[1];\n`
    content += `\n`;
    content += `                List<String> allowedColumns = List.of(${schema.columns.map(c => `"${toScreamSnakeCase(c.name)}"`).join(", ")});\n`
    content += `                if (!allowedColumns.contains(column.toUpperCase())) {\n`
    content += `                    throw new IllegalArgumentException("Invalid sort parameter.");\n`
    content += `                }\n`
    content += `                if (!"ASC".equalsIgnoreCase(direction) && !"DESC".equalsIgnoreCase(direction)) {\n`
    content += `                    throw new IllegalArgumentException("Invalid sort parameter.");\n`
    content += `                }\n`
    content += `\n`;
    content += `                if (i > 0) {\n`
    content += `                    sql.append(",");\n`
    content += `                }\n`
    content += `                sql.append(" " + column + " " + direction);\n`
    content += `            }\n`
    content += `        } else {\n`
    content += `            sql.append(" ORDER BY ${toScreamSnakeCase(getPrimaryColumns(schema)[0].name)} DESC");\n`
    content += `        }\n`
    content += `\n`;
    content += `        sql.append(" LIMIT ? OFFSET ?");\n`
    content += `        params.add(size);\n`
    content += `        params.add(offset);\n`
    content += `\n`;
    content += `        return jdbcTemplate.query(sql.toString(), rowMapper, params.toArray());\n`
    content += `    }\n`;
    // content += `\n`;
    // content += `    public int countAll(${dtoClassName} ${dtoInstanceName}) {\n`;
    // content += `        StringBuilder sql = new StringBuilder("${generatePreparedCountSql(schema)}");\n`;
    // content += `        List<Object> params = new ArrayList<>();\n`;
    // content += `\n`;
    // schema.columns.forEach(column => {
    //     const fieldName = toCamelCase(column.name);
    //     const colName = toScreamSnakeCase(column.name);
    //     const javaType = getJavaType(column.type);
    //     const getterCall = `${dtoInstanceName}.${getGetterCall(column)}`;

    //     if (javaType === 'String') {
    //         content += `        if (${getterCall} != null && !${getterCall}.isEmpty()) {\n`;
    //         content += `            sql.append(" AND ${colName} LIKE '%' || ? || '%'");\n`;
    //         content += `            params.add(${getterCall});\n`;
    //         content += `        }\n`;
    //     } else if (['LocalDate', 'LocalDateTime', 'LocalTime'].includes(javaType)) {
    //         const startGetter = `${dtoInstanceName}.get${toPascalCase(fieldName)}Start()`;
    //         const endGetter = `${dtoInstanceName}.get${toPascalCase(fieldName)}End()`;
            
    //         content += `        if (${startGetter} != null) {\n`;
    //         content += `            sql.append(" AND ${colName} >= ?");\n`;
    //         content += `            params.add(${startGetter});\n`;
    //         content += `        }\n`;
    //         content += `        if (${endGetter} != null) {\n`;
    //         content += `            sql.append(" AND ${colName} <= ?");\n`;
    //         content += `            params.add(${endGetter});\n`;
    //         content += `        }\n`;
    //     } else {
    //         content += `        if (${getterCall} != null) {\n`;
    //         content += `            sql.append(" AND ${colName} = ?");\n`;
    //         content += `            params.add(${getterCall});\n`;
    //         content += `        }\n`;
    //     }
    // });
    // content += `\n`;
    // content += `        return jdbcTemplate.queryForObject(sql.toString(), Long.class, params.toArray());\n`;
    // content += `    }\n`;
    content += `\n`;
    content += `    public int update(${dtoClassName} ${dtoInstanceName}) {\n`;
    content += `        String sql = "${generatePreparedUpdateSql(schema)}";\n`;
    content += `        return jdbcTemplate.update(sql, ${insertableColumnGetterCalls.concat(primaryColumnGetterCalls).join(", ")});\n`;
    content += `    }\n`;
    // content += `\n`;
    // content += `    public int patch(${dtoClassName} ${dtoInstanceName}) {\n`;
    // content += `        return 0;\n`;
    // content += `    }\n`;
    content += `\n`;
    content += `    public int delete(${pkParams}) {\n`;
    content += `        String sql = "${generatePreparedDeleteSql(schema)}";\n`;
    content += `        return jdbcTemplate.update(sql, ${pkArgs});\n`;
    content += `    }\n`;
    content += `}`

    return content;
}