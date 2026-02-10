function createApplicationFiles(folder, userOptions = {}, schema) {
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
        name: `src/main/java/${packagePath}/${getApplicationClassName(schema)}.java`,
        content: generateApplicationContent(options, schema)
    });
}

function generateApplicationContent(options, schema) {
    const packageName = options.groupName + "." + options.projectName;

    const applicationClassName = getApplicationClassName(schema);

    let content = "";
    content += `package ${packageName};\n`
    content += `\n`
    content += `\n`
    content += `import org.springframework.boot.SpringApplication;\n`
    content += `import org.springframework.boot.autoconfigure.SpringBootApplication;\n`
    content += `\n`
    content += `@SpringBootApplication\n`
    content += `public class ${applicationClassName} {\n`
    content += `    public static void main(String[] args) {\n`
    content += `        SpringApplication.run(${applicationClassName}.class, args);\n`
    content += `    }\n`
    content += `}`;

    return content;
}