/**
 * TravelGo - Script Xóa thư mục cũ backend & frontend trên GitHub
 */

const readline = require('readline');

const REPO_OWNER = 'tranhuuthang73-cyber';
const REPO_NAME = 'DACN';

async function listFilesRecursively(folderPath, token) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${folderPath}`;
    let files = [];
    try {
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'TravelGo-Cleaner',
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (!res.ok) return files;
        const items = await res.json();
        for (const item of items) {
            if (item.type === 'file') {
                files.push({ path: item.path, sha: item.sha });
            } else if (item.type === 'dir') {
                const subFiles = await listFilesRecursively(item.path, token);
                files = files.concat(subFiles);
            }
        }
    } catch (e) {
        console.error('Lỗi duyệt file:', e.message);
    }
    return files;
}

async function deleteFile(filePath, sha, token) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;
    const body = {
        message: `Remove deprecated legacy folder: ${filePath}`,
        sha: sha,
        branch: 'main'
    };

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'TravelGo-Cleaner',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            console.log(`[✓ Đã xóa]: ${filePath}`);
        } else {
            const err = await res.text();
            console.error(`[✗ Lỗi xóa ${filePath}]:`, err);
        }
    } catch (e) {
        console.error(`[✗ Lỗi kết nối khi xóa ${filePath}]:`, e.message);
    }
}

async function startCleaning(token) {
    console.log('\n[*] Đang tìm kiếm các file trong thư mục cũ backend/ và frontend/ trên GitHub...');
    const backendFiles = await listFilesRecursively('backend', token);
    const frontendFiles = await listFilesRecursively('frontend', token);
    const allFiles = [...backendFiles, ...frontendFiles];

    if (allFiles.length === 0) {
        console.log('[*] Không tìm thấy thư mục backend/ hoặc frontend/ cũ trên GitHub (Hoặc đã được xóa trước đó).');
        return;
    }

    console.log(`[*] Tìm thấy ${allFiles.length} files cũ cần xóa. Đang tiến hành xóa sạch...`);

    for (const f of allFiles) {
        await deleteFile(f.path, f.sha, token);
        await new Promise(r => setTimeout(r, 80));
    }

    console.log(`\n======================================================`);
    console.log(`🎉 ĐÃ XÓA SẠCH CÁC THƯ MỤC CŨ TRÊN GITHUB THÀNH CÔNG!`);
    console.log(`👉 Repo hiện tại: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
    console.log(`======================================================\n`);
}

async function main() {
    console.log(`\n======================================================`);
    console.log(`🧹 DỌN DẸP THƯ MỤC CŨ (backend/ & frontend/) TRÊN GITHUB`);
    console.log(`   Repo: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
    console.log(`======================================================\n`);

    const tokenArg = process.argv[2];
    if (tokenArg) {
        await startCleaning(tokenArg.trim());
        return;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Nhập mã GitHub Token của bạn: ', async (token) => {
        token = token.trim();
        if (!token) {
            console.log('Lỗi: Bạn chưa nhập Token.');
            rl.close();
            return;
        }
        await startCleaning(token);
        rl.close();
    });
}

main();
