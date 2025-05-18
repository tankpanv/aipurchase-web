
workspace=`pwd`
cd ~/go/src/code.huanfangsk.com/infra/idls && git pull
cd $workspace
thrift -r --gen ts ~/go/src/code.huanfangsk.com/infra/idls/huanfangai/wealth_huanfangai_ugcapi.thrift
