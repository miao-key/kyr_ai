import {
    NextRequest,
    NextResponse
} from 'next/server';
import {
    ensureUploadDirs,
    fileAlreadyExists,
    readMeta,
    listUploadedChunks,
    writeMeta
} from '@/lib/upload-server';

export async function POST(request: NextRequest) {
    const { fileHash, fileName, fileSize, chunkSize, totalChunks } = await request.json();

    ensureUploadDirs(fileHash);
    if (fileAlreadyExists(fileHash,fileName)) {
        return NextResponse.json({
            complete: true,
            uploaded: [],
            message: "秒传; 文件已存在"
        });
    }

    // 断点续传
    const existed = readMeta(fileHash); // 已上传 都可以
    const uploaded = listUploadedChunks(fileHash);
    const meta = {
        fileName,
        fileSize,
        chunkSize,
        totalChunks,
        uploadedChunks: uploaded,
        complete: false,   
    }

    writeMeta(fileHash, {...(existed || {}), ...meta});

    return NextResponse.json({
        complete: false,
        uploaded,
        message: "初始化成功"
    });
}