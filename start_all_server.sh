sudo /etc/init.d/mysql start
export MINIO_ROOT_USER=admin
export MINIO_ROOT_PASSWORD=MinioData123
nohup /usr/local/bin/minio server /home/devbox/project/minio-data --console-address ":9090" &
nohup npx serve -s tobacco/dist -p 15112 &
source venv/bin/activate && cd tobacco-server && nohup python  run.py &