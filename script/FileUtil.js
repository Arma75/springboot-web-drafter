const FileUtil = {
    async createFile(folder, options) {
        const { name, assetPath, content, isBinary = false } = options;
        if (assetPath) {
            const fileContent = await this.readFile(assetPath);
            if (fileContent) {
                folder.file(name, fileContent, { binary: true });
            }
        } else {
            folder.file(name, content, { binary: isBinary });
        }
    },
    
    async readFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error('파일을 찾을 수 없습니다. 경로를 확인해주세요.');
            }

            return await response.arrayBuffer();
        } catch (error) {
            console.error("❌ error::", error);
            return null;
        }
    },

    async download(zip, name) {
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `${name}.zip`;
        link.click();
    }
}