const fs = require('fs');
const path = require('path');
const depcheck = require('depcheck');

const packageJsonPath = path.join(__dirname, 'package.json');

// 读取 package.json
const packageJson = require(packageJsonPath);

// 定义不应删除的依赖
const protectedDependencies = ['tailwindcss', 'postcss', 'autoprefixer'];

// 使用 depcheck 检测未使用的依赖
depcheck(__dirname, {
    ignoreBin: true,
    skipMissing: true,
}, (unused) => {
    // 获取未使用的依赖和开发依赖
    const unusedDependencies = unused.dependencies;
    const unusedDevDependencies = unused.devDependencies;

    // 删除未使用的依赖
    unusedDependencies.forEach(dep => {
        if (!protectedDependencies.includes(dep)) {
            delete packageJson.dependencies[dep];
            console.log(`Removed unused dependency: ${dep}`);
        } else {
            console.log(`Skipped protected dependency: ${dep}`);
        }
    });

    // 删除未使用的开发依赖
    unusedDevDependencies.forEach(dep => {
        if (!protectedDependencies.includes(dep)) {
            delete packageJson.devDependencies[dep];
            console.log(`Removed unused devDependency: ${dep}`);
        } else {
            console.log(`Skipped protected devDependency: ${dep}`);
        }
    });

    // 写回 package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json');
});
