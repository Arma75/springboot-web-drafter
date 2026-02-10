function createControllerFiles(folder, userOptions = {}, schema) {
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

    const tableName = schema.name;
    const packageName = options.groupName + "." + options.projectName;
    const packagePath = packageName.replace(/\./g, '/');

    const controllerClassName = getControllerClassName(schema);
    const serviceClassName = getServiceClassName(schema);
    const serviceInstanceName = getServiceInstanceName(schema);
    const dtoClassName = getDtoClassName(schema);
    const dtoInstanceName = getDtoInstanceName(schema);

    const pkParams = getPrimaryKeyParams(schema);
    const pkArgs = getPrimaryKeyArgs(schema);

    let controllerContent = "";
    controllerContent += `package ${packageName}.controller;\n`
    controllerContent += `\n`
    controllerContent += `import org.springframework.http.ResponseEntity;\n`
    controllerContent += `import org.springframework.web.bind.annotation.DeleteMapping;\n`
    controllerContent += `import org.springframework.web.bind.annotation.GetMapping;\n`
    controllerContent += `import org.springframework.web.bind.annotation.PatchMapping;\n`
    controllerContent += `import org.springframework.web.bind.annotation.PostMapping;\n`
    controllerContent += `import org.springframework.web.bind.annotation.PutMapping;\n`
    controllerContent += `import org.springframework.web.bind.annotation.RequestMapping;\n`
    controllerContent += `import org.springframework.web.bind.annotation.RequestParam;\n`
    controllerContent += `import org.springframework.web.bind.annotation.RestController;\n`
    controllerContent += `\n`
    controllerContent += `@RestController\n`
    controllerContent += `@RequestMapping("/${toKebabCase(tableName)}")\n`
    controllerContent += `public class ${controllerClassName} {\n`
    controllerContent += `    private final ${serviceClassName} ${serviceInstanceName};\n`
    controllerContent += `\n`
    controllerContent += `    public ${controllerClassName}(${serviceClassName} ${serviceInstanceName}) {\n`
    controllerContent += `        this.${serviceInstanceName} = ${serviceInstanceName};\n`
    controllerContent += `    }\n`
    controllerContent += `\n`
    controllerContent += `    @PostMapping\n`
    controllerContent += `    public ResponseEntity<Object> create(@RequestBody ${dtoClassName} ${dtoInstanceName}) {\n`
    controllerContent += `        ${serviceInstanceName}.create(${dtoInstanceName});\n`
    controllerContent += `        return ResponseEntity.status(201).body("Create success");\n`
    controllerContent += `    }\n`
    controllerContent += `\n`
    controllerContent += `    @GetMapping("/${getPrimaryKeyPath(schema)}")\n`
    controllerContent += `    public ResponseEntity<${dtoClassName}> findById(${pkParams}) {\n`
    controllerContent += `        return ResponseEntity.ok(${serviceInstanceName}.findById(${pkArgs});\n`
    controllerContent += `    }\n`
    controllerContent += `\n`
    controllerContent += `    @GetMapping\n`
    controllerContent += `    public ResponseEntity<?> findAll(\n`
    controllerContent += `        ${dtoClassName} ${dtoInstanceName},\n`
    controllerContent += `        @RequestParam(name="page", defaultValue = "1") int page,\n`
    controllerContent += `        @RequestParam(name="size", defaultValue = "10") int size,\n`
    controllerContent += `        @RequestParam(required = false) String sort\n`
    controllerContent += `    ) {\n`
    controllerContent += `        return ResponseEntity.ok(${serviceInstanceName}.findAll(${dtoInstanceName}, page, size, sort));\n`
    controllerContent += `    }\n`
    controllerContent += `\n`
    controllerContent += `    @PutMapping("/${getPrimaryKeyPath(schema)}")\n`
    controllerContent += `    public ResponseEntity<${dtoClassName}> update(${pkParams}, @RequestBody ${dtoClassName} ${dtoInstanceName}) {\n`
    controllerContent += `        ${serviceInstanceName}.update(${pkArgs}, ${dtoInstanceName});\n`
    controllerContent += `        return ResponseEntity.status(200).body("Update success");\n`
    controllerContent += `    }\n`
    controllerContent += `\n`
    controllerContent += `    @PatchMapping("/${getPrimaryKeyPath(schema)}")\n`
    controllerContent += `    public ResponseEntity<${dtoClassName}> patch(${pkParams}, @RequestBody ${dtoClassName} ${dtoInstanceName}) {\n`
    controllerContent += `        ${serviceInstanceName}.patch(${pkArgs}, ${dtoInstanceName});\n`
    controllerContent += `        return ResponseEntity.status(200).body("Patch success");\n`
    controllerContent += `    }\n`
    controllerContent += `\n`
    controllerContent += `    @DeleteMapping("/${getPrimaryKeyPath(schema)}")\n`
    controllerContent += `    public ResponseEntity<${dtoClassName}> delete(${pkParams}) {\n`
    controllerContent += `        ${serviceInstanceName}.delete(${pkArgs});\n`
    controllerContent += `        return ResponseEntity.status(200).body("Delete success");\n`
    controllerContent += `    }\n`
    controllerContent += `}`;
    
    FileUtil.createFile(folder, {
        name: `src/main/java/${packagePath}/controller/${controllerClassName}.java`,
        content: controllerContent
    });
}