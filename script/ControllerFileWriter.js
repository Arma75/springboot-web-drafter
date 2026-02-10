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

    const packageName = options.groupName + "." + options.projectName;
    const packagePath = packageName.replace(/\./g, '/');
    
    FileUtil.createFile(folder, {
        name: `src/main/java/${packagePath}/controller/${getControllerClassName(schema)}.java`,
        content: generateControllerContent(options, schema)
    });
}

function generateControllerContent(options, schema) {
    const packageName = options.groupName + "." + options.projectName;

    const controllerClassName = getControllerClassName(schema);
    const serviceClassName = getServiceClassName(schema);
    const serviceInstanceName = getServiceInstanceName(schema);
    const dtoClassName = getDtoClassName(schema);
    const dtoInstanceName = getDtoInstanceName(schema);

    const pkParams = getPrimaryKeyPathParams(schema);
    const pkArgs = getPrimaryKeyArgs(schema);

    let content = "";
    content += `package ${packageName}.controller;\n`
    content += `\n`
    content += `import org.springframework.http.ResponseEntity;\n`
    content += `import org.springframework.web.bind.annotation.DeleteMapping;\n`
    content += `import org.springframework.web.bind.annotation.GetMapping;\n`
    content += `import org.springframework.web.bind.annotation.PatchMapping;\n`
    content += `import org.springframework.web.bind.annotation.PostMapping;\n`
    content += `import org.springframework.web.bind.annotation.PutMapping;\n`
    content += `import org.springframework.web.bind.annotation.RequestMapping;\n`
    content += `import org.springframework.web.bind.annotation.RequestParam;\n`
    content += `import org.springframework.web.bind.annotation.RestController;\n`
    content += `import org.springframework.web.bind.annotation.RequestBody;\n`
    content += `import org.springframework.web.bind.annotation.PathVariable;\n`
    content += `${getJavaTypeImports(getPrimaryColumns(schema)).join("\n")}\n`;
    content += `\n`
    content += `import ${packageName}.dto.${dtoClassName};\n`
    content += `import ${packageName}.service.${serviceClassName};\n`
    content += `\n`
    content += `@RestController\n`
    content += `@RequestMapping("/${toKebabCase(schema.name)}")\n`
    content += `public class ${controllerClassName} {\n`
    content += `    private final ${serviceClassName} ${serviceInstanceName};\n`
    content += `\n`
    content += `    public ${controllerClassName}(${serviceClassName} ${serviceInstanceName}) {\n`
    content += `        this.${serviceInstanceName} = ${serviceInstanceName};\n`
    content += `    }\n`
    content += `\n`
    content += `    @PostMapping\n`
    content += `    public ResponseEntity<Object> create(@RequestBody ${dtoClassName} ${dtoInstanceName}) {\n`
    content += `        ${serviceInstanceName}.create(${dtoInstanceName});\n`
    content += `        return ResponseEntity.status(201).body("Create success");\n`
    content += `    }\n`
    content += `\n`
    content += `    @GetMapping("/${getPrimaryKeyPath(schema)}")\n`
    content += `    public ResponseEntity<${dtoClassName}> findById(${pkParams}) {\n`
    content += `        return ResponseEntity.ok(${serviceInstanceName}.findById(${pkArgs}));\n`
    content += `    }\n`
    content += `\n`
    content += `    @GetMapping\n`
    content += `    public ResponseEntity<?> findAll(\n`
    content += `        ${dtoClassName} ${dtoInstanceName},\n`
    content += `        @RequestParam(name="page", defaultValue = "1") int page,\n`
    content += `        @RequestParam(name="size", defaultValue = "10") int size,\n`
    content += `        @RequestParam(required = false) String sort\n`
    content += `    ) {\n`
    content += `        return ResponseEntity.ok(${serviceInstanceName}.findAll(${dtoInstanceName}, page, size, sort));\n`
    content += `    }\n`
    content += `\n`
    content += `    @PutMapping("/${getPrimaryKeyPath(schema)}")\n`
    content += `    public ResponseEntity<?> update(${pkParams}, @RequestBody ${dtoClassName} ${dtoInstanceName}) {\n`
    content += `        ${serviceInstanceName}.update(${pkArgs}, ${dtoInstanceName});\n`
    content += `        return ResponseEntity.status(200).body("Update success");\n`
    content += `    }\n`
    content += `\n`
    content += `    @PatchMapping("/${getPrimaryKeyPath(schema)}")\n`
    content += `    public ResponseEntity<?> patch(${pkParams}, @RequestBody ${dtoClassName} ${dtoInstanceName}) {\n`
    content += `        ${serviceInstanceName}.patch(${pkArgs}, ${dtoInstanceName});\n`
    content += `        return ResponseEntity.status(200).body("Patch success");\n`
    content += `    }\n`
    content += `\n`
    content += `    @DeleteMapping("/${getPrimaryKeyPath(schema)}")\n`
    content += `    public ResponseEntity<?> delete(${pkParams}) {\n`
    content += `        ${serviceInstanceName}.delete(${pkArgs});\n`
    content += `        return ResponseEntity.status(200).body("Delete success");\n`
    content += `    }\n`
    content += `}`;

    return content;
}