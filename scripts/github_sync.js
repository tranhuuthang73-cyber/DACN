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
const IGNORE_LIST = [
    '.git',
    'node_modules',
    '.env',
    '.DS_Store',
    'Thumbs.db',
    '.vscode',
    '.idea',
    'bin',
    'mingit.zip'
];

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

    // Kiểm tra SHA cũ nếu file đã tồn tại để update ghi đè
    let sha = null;
    try {
        const checkRes = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
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
        message: `Update ${relativePath} (Phase 3 Google Maps Live GPS & Domestic Routes)`,
        content: base64Content,
        branch: 'main'
    };
    if (sha) body.sha = sha;

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'TravelGo-Uploader',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            console.log(`[✓ Tải lên thành công]: ${relativePath}`);
            return true;
        } else {
            const err = await res.text();
            console.error(`[✗ Lỗi khi tải ${relativePath}]:`, err);
            return false;
        }
    } catch (err) {
        console.error(`[✗ Lỗi mạng ${relativePath}]:`, err.message);
        return false;
    }
}

async function main() {
    console.log(`\n======================================================`);
    console.log(`🚀 TRAVELGO - GITHUB UPLOADER (PHASE 3 GOOGLE MAPS)`);
    console.log(`   Repo: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
    console.log(`======================================================\n`);

    const tokenArg = process.argv[2];

    if (tokenArg) {
        await startUpload(tokenArg.trim());
        return;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Nhập mã GitHub Token của bạn (Click chuột phải để dán): ', async (token) => {
        token = token.trim();
        if (!token) {
            console.log('Lỗi: Bạn chưa nhập GitHub Token.');
            rl.close();
            return;
        }
        await startUpload(token);
        rl.close();
    });
}

async function startUpload(token) {
    console.log('\n[*] Đang quét toàn bộ file dự án...');
    const files = getAllFiles(ROOT_DIR);
    console.log(`[*] Tìm thấy tổng cộng ${files.length} files. Đang tiến hành tải lên GitHub...\n`);

    let successCount = 0;
    for (const file of files) {
        const ok = await uploadFile(file, token);
        if (ok) successCount++;
        await new Promise(r => setTimeout(r, 80));
    }

    console.log(`\n======================================================`);
    console.log(`🎉 HOÀN TẤT! Đã đồng bộ thành công ${successCount}/${files.length} files lên GitHub!`);
    console.log(`👉 Xem repo: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
    console.log(`======================================================\n`);
}

main();
