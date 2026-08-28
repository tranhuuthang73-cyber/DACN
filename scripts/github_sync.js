/**
 * TravelGo - GitHub Direct Sync (Node.js Native)
 * Đẩy toàn bộ source code lên https://github.com/tranhuuthang73-cyber/DACN
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const REPO_OWNER = 'tranhuuthang73-cyber';
const REPO_NAME = 'DACN';
const ROOT_DIR = path.resolve(__dirname, '..');

// Danh sách file/thư mục bỏ qua
const IGNORE_LIST = ['.git', 'node_modules', '.env', '.DS_Store', 'Thumbs.db', '.vscode', '.idea'];

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        if (IGNORE_LIST.includes(file)) return;
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

async function uploadFile(filePath, token) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath);
    const base64Content = content.toString('base64');

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${relativePath}`;

    // Kiểm tra SHA cũ nếu file đã tồn tại
    let sha = null;
    try {
        const checkRes = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': 'TravelGo-Uploader',
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (checkRes.ok) {
            const data = await checkRes.json();
            sha = data.sha;
        }
    } catch (e) {}

    const body = {
        message: `Upload ${relativePath}`,
        content: base64Content,
        branch: 'main'
    };
    if (sha) body.sha = sha;

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'TravelGo-Uploader',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (res.ok) {
        console.log(`[OK] Đã tải lên: ${relativePath}`);
    } else {
        const err = await res.text();
        console.error(`[FAIL] Không thể tải ${relativePath}:`, err);
    }
}

async function main() {
    console.log(`\n======================================================`);
    console.log(`🚀 TRAVELGO - GITHUB UPLOADER DIRECT TO:`);
    console.log(`   https://github.com/${REPO_OWNER}/${REPO_NAME}`);
    console.log(`======================================================\n`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Nhập GitHub Personal Access Token (PAT) của bạn: ', async (token) => {
        token = token.trim();
        if (!token) {
            console.log('Lỗi: Bạn chưa nhập GitHub Token.');
            rl.close();
            return;
        }

        console.log('\n[*] Đang quét toàn bộ file dự án...');
        const files = getAllFiles(ROOT_DIR);
        console.log(`[*] Tìm thấy ${files.length} files. Đang tiến hành tải lên GitHub...\n`);

        for (const file of files) {
            await uploadFile(file, token);
        }

        console.log(`\n======================================================`);
        console.log(`🎉 ĐÃ ĐẨY TOÀN BỘ SOURCE CODE LÊN GITHUB THÀNH CÔNG!`);
        console.log(`👉 Xem repo: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
        console.log(`======================================================\n`);
        rl.close();
    });
}

main();
