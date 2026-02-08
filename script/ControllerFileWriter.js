function createControllerFiles(folder, userOptions = {}) {
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
    const controllerClassName = options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1) + "Controller";

    let controllerContent = "";
    controllerContent += `package ${packageName}.controller;\n`
    controllerContent += `\n`
    controllerContent += `import org.springframework.http.ResponseEntity;\n`
    controllerContent += `import org.springframework.web.bind.annotation.*;\n`
    controllerContent += `import java.util.Map;\n`
    controllerContent += `\n`
    controllerContent += `@RestController\n`
    controllerContent += `@RequestMapping("")\n`
    controllerContent += `public class ${controllerClassName} {\n`
    controllerContent += `    public ResponseEntity<?> create(Map<String, Object> dto) {\n`
    controllerContent += `        return ResponseEntity.status(201).body("");\n`
    controllerContent += `    }\n`
    controllerContent += `}`;
    
    FileUtil.createFile(folder, {
        name: `src/main/java/${packagePath}/controller/${controllerClassName}.java`,
        content: controllerContent
    });
}