function createPropertyFiles(folder, userOptions = {}, schema) {
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
    
    FileUtil.createFile(folder, {
        name: `src/main/resources/application.properties`,
        content: generatePropertyContent(options, schema)
    });
}

function generatePropertyContent(options, schema) {
    const packageName = options.groupName + "." + options.projectName;

    const controllerClassName = getControllerClassName(schema);
    const serviceClassName = getServiceClassName(schema);
    const serviceInstanceName = getServiceInstanceName(schema);
    const dtoClassName = getDtoClassName(schema);
    const dtoInstanceName = getDtoInstanceName(schema);

    const pkParams = getPrimaryKeyPathParams(schema);
    const pkArgs = getPrimaryKeyArgs(schema);

    let content = "";
    content += `spring.application.name=${options.projectName}\n`;
    content += `\n`;
    content += `spring.sql.init.mode=embedded\n`;
    content += `\n`;
    content += `spring.h2.console.enabled=true\n`;
    content += `\n`;
    content += `spring.datasource.url=jdbc:h2:mem:testdb\n`;
    content += `spring.datasource.username=sa\n`;
    content += `spring.datasource.password=\n`;
    content += `spring.datasource.driver-class-name=org.h2.Driver\n`;

    return content;
}