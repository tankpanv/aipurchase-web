#!/bin/bash

# 1. 检查 Nginx 是否正在运行
if pgrep -x "nginx" > /dev/null; then
    echo "🔄 正在停止 Nginx..."
    sudo nginx -s quit  # 优雅停止（等待请求完成）
    sleep 2  # 等待进程完全退出

    # 强制终止残留进程（如果有）
    if pgrep -x "nginx" > /dev/null; then
        echo "⚠️ 检测到残留进程，强制终止..."
        sudo pkill -9 nginx
    fi
else
    echo "ℹ️ Nginx 未运行，跳过停止步骤"
fi

# 2. 启动 Nginx
echo "🚀 启动 Nginx..."
sudo /usr/sbin/nginx -g 'daemon on; master_process on;'

# 3. 验证状态
sleep 1
if pgrep -x "nginx" > /dev/null; then
    echo "✅ Nginx 已成功重启！"
    echo "📊 当前进程："
    ps -ef | grep nginx | grep -v grep
else
    echo "❌ 启动失败，请检查错误日志："
    sudo tail -n 10 /var/log/nginx/error.log
    exit 1
fi