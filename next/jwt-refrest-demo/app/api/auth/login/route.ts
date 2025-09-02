import {
    NextRequest,
    NextResponse
} from 'next/server';
import {
    prisma
} from '@/lib/db';
import {
    emailRegex,
    passwordRegex
} from '@/lib/regexp';
import bcrypt from 'bcryptjs';
import {
    createTokens
} from '@/lib/jwt';
import { setAuthCookie } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const {
            email,
            password
        } = await request.json();

        if (!email || !emailRegex.test(email)) {
            return NextResponse.json({
                error: '邮箱输入有误' 
            }, {
                status: 400 
            })
        }
        if (!password || !passwordRegex.test(password)) {
            return NextResponse.json({
                error: '密码输入有误'
            }, {
                status: 400
            })
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            return NextResponse.json({
                error: '用户不存在'
            }, {
                status: 401
            })
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({
                error: '密码错误'
            }, {
                status: 401
            })
        }
        const { accessToken, refreshToken } = await createTokens(user.id);
        
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                refreshToken
            }
        })

        // 创建响应对象
        const response = NextResponse.json({
            message: 'Login successful'  // 修复拼写错误：mwssage -> message
        })

        // 设置 Cookie
        await setAuthCookie(accessToken, refreshToken);

        return response;

    } catch(err) {
        console.error(err);
        return NextResponse.json({
            error: 'Internal server error'
        }, {
            status: 500
        })

    } finally {
        // 释放数据库对象
        await prisma.$disconnect();
    }


}