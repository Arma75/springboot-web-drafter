function createGradleFiles(rootFolder, userOptions = {}) {
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

    createStaticGradleFiles(rootFolder);

    createSettingsGradleFile(rootFolder, options);
    createBuildGradleFile(rootFolder, options);
}

function createStaticGradleFiles(folder) {
    // gradlew 파일 추가
    FileUtil.createFile(folder, { name: "gradlew", assetPath: "./assets/gradlew" });
    // gradlew.bat 파일 추가
    FileUtil.createFile(folder, { name: "gradlew.bat", assetPath: "./assets/gradlew.bat" });

    // gradle 폴더 생성
    FileUtil.createFile(folder, { name: "gradle/wrapper/gradle-wrapper.jar", assetPath: "./assets/gradle-wrapper.jar" });
    FileUtil.createFile(folder, { name: "gradle/wrapper/gradle-wrapper.properties", assetPath: "./assets/gradle-wrapper.properties" });
}

function createSettingsGradleFile(folder, options) {
    let settingsGradleContent = "";
    settingsGradleContent += `rootProject.name = '${options.projectName}'\n`;

    folder.file("settings.gradle", settingsGradleContent);
}

function createBuildGradleFile(folder, options) {
    const { groupName, description, javaVersion, useSwagger, useJDBC, useH2DB, usePostgreSQL } = options;

    let buildGradleContent = "";
    buildGradleContent += `plugins {\n`
    buildGradleContent += `    id 'java'\n`
    buildGradleContent += `    id 'org.springframework.boot' version '3.5.9'\n`
    buildGradleContent += `    id 'io.spring.dependency-management' version '1.1.7'\n`
    buildGradleContent += `}\n`
    buildGradleContent += `\n`
    buildGradleContent += `group = '${groupName}'\n`
    buildGradleContent += `version = '0.0.1-SNAPSHOT'\n`
    buildGradleContent += `description = '${description}'\n`
    buildGradleContent += `\n`
    buildGradleContent += `java {\n`
    buildGradleContent += `    toolchain {\n`
    buildGradleContent += `        languageVersion = JavaLanguageVersion.of(${javaVersion})\n`
    buildGradleContent += `    }\n`
    buildGradleContent += `}\n`
    buildGradleContent += `\n`
    buildGradleContent += `repositories {\n`
    buildGradleContent += `    mavenCentral()\n`
    buildGradleContent += `}\n`
    buildGradleContent += `\n`
    buildGradleContent += `dependencies {\n`
    buildGradleContent += `    implementation 'org.springframework.boot:spring-boot-starter-web'\n`
    if (useSwagger) {
        buildGradleContent += `\n`
        buildGradleContent += `    // Swagger (Springdoc OpenAPI)\n`
        buildGradleContent += `    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.1.0'\n`
    }
    if (useJDBC) {
        buildGradleContent += `\n`
        buildGradleContent += `    // JDBC\n`
        buildGradleContent += `    implementation 'org.springframework.boot:spring-boot-starter-jdbc'\n`
    }
    if (useH2DB) {
        buildGradleContent += `\n`
        buildGradleContent += `    // H2 Database Driver\n`
        buildGradleContent += `    implementation 'com.h2database:h2'\n`
    }
    if (usePostgreSQL) {
        buildGradleContent += `\n`
        buildGradleContent += `    // PostgreSQL Driver\n`
        buildGradleContent += `    runtimeOnly 'org.postgresql:postgresql'\n`
    }
    buildGradleContent += `}`;

    FileUtil.createFile(folder, { name: "build.gradle", content: buildGradleContent});
}