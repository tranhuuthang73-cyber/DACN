/**
 * TravelGo - GitHub Direct Pull (Node.js Native)
 * Kéo toàn bộ mã nguồn mới nhất từ https://github.com/tranhuuthang73-cyber/DACN về máy
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const REPO_OWNER = 'tranhuuthang73-cyber';
const REPO_NAME = 'DACN';
const ROOT_DIR = path.resolve(__dirname, '..');

// Các file bảo vệ không ghi đè khi pull
const PROTECTED_FILES = ['.env', '.token'];

async function getRepoTree(token) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'TravelGo-Puller',
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Không thể lấy danh sách tệp từ GitHub: ${err}`);
    }

    const data = await res.json();
    return data.tree.filter(item => item.type === 'blob');
}

async function downloadBlob(sha, token) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/blobs/${sha}`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'TravelGo-Puller',
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!res.ok) {
        throw new Error(`Lỗi tải blob ${sha}`);
    }

    const data = await res.json();
    return Buffer.from(data.content, 'base64');
}

async function startPull(token) {
    console.log(`\n======================================================`);
    console.log(`📥 TRAVELGO - GITHUB PULL CODE MỚI NHẤT`);
    console.log(`   Từ Repo: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
    console.log(`======================================================\n`);

    console.log('[*] Đang kết nối tới GitHub và kiểm tra cây thư mục nhánh main...');
    const files = await getRepoTree(token);
    console.log(`[*] Tìm thấy tổng cộng ${files.length} tệp tin trên GitHub. Đang so sánh và đồng bộ về máy...\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const item of files) {
        if (PROTECTED_FILES.includes(item.path)) {
            skippedCount++;
            continue;
        }

        const localPath = path.join(ROOT_DIR, item.path);
        let needsDownload = true;

        if (fs.existsSync(localPath)) {
            const stats = fs.statSync(localPath);
            // So sánh kích thước sơ bộ để tối ưu tốc độ
            if (stats.size === item.size) {
                // Kiểm tra nội dung nếu cần
                needsDownload = false;
            }
        }

        if (needsDownload) {
            try {
                const content = await downloadBlob(item.sha, token);
                const parentDir = path.dirname(localPath);
                if (!fs.existsSync(parentDir)) {
                    fs.mkdirSync(parentDir, { recursive: true });
                }
                fs.writeFileSync(localPath, content);
                console.log(`[✓ Đã cập nhật]: ${item.path}`);
                updatedCount++;
            } catch (err) {
                console.error(`[✗ Lỗi khi tải ${item.path}]:`, err.message);
            }
            await new Promise(r => setTimeout(r, 60));
        } else {
            skippedCount++;
        }
    }

    console.log(`\n======================================================`);
    console.log(`🎉 HOÀN TẤT ĐỒNG BỘ TỪ GITHUB VỀ MÁY CỤC BỘ!`);
    console.log(`- Tệp mới/Cập nhật: ${updatedCount}`);
    console.log(`- Tệp đã trùng khớp sẵn: ${skippedCount}`);
    console.log(`👉 Dự án đã ở trạng thái mới nhất!`);
    console.log(`======================================================\n`);
}

async function main() {
    let token = process.argv[2];

    if (!token) {
        const tokenFilePath = path.join(ROOT_DIR, '.token');
        if (fs.existsSync(tokenFilePath)) {
            token = fs.readFileSync(tokenFilePath, 'utf8').trim();
            console.log('[*] Đã tự động nhận diện mã Token từ tệp cục bộ (.token).');
        }
    }

    if (token) {
        try {
            await startPull(token.trim());
        } catch (e) {
            console.error('Lỗi khi pull:', e.message);
        }
        return;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Nhập mã GitHub Token của bạn (Click chuột phải để dán): ', async (inputToken) => {
        inputToken = inputToken.trim();
        if (!inputToken) {
            console.log('Lỗi: Bạn chưa nhập GitHub Token.');
            rl.close();
            return;
        }
        try {
            await startPull(inputToken);
        } catch (e) {
            console.error('Lỗi khi pull:', e.message);
        }
        rl.close();
    });
}

main();
