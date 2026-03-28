const fs = require('fs');
const path = require('path');

// Helper to delete a folder recursively
function deleteFolderRecursive(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
}

// Helper to copy a folder recursively
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}

console.log('Cleaning public directory...');
deleteFolderRecursive('./public');
fs.mkdirSync('./public', { recursive: true });

console.log('Copying client/dist to public...');
if (fs.existsSync('./client/dist')) {
    copyRecursiveSync('./client/dist', './public');
    console.log('Build completed successfully!');
} else {
    console.error('Error: client/dist directory not found. Did the frontend build fail?');
    process.exit(1);
}
