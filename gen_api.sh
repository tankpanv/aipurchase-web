# npm install @openapitools/openapi-generator-cli -g
APIDIR=./src/openapi-generated
jsonDir=src/assets/swagger
mkdir -p $jsonDir

model=""

while getopts ":m:" opt; do
    case $opt in
        m)
            model=$OPTARG
            echo "gen model: $OPTARG"
        ;;
        
        h)
            echo "m 参数值为: $OPTARG"
            echo "-m 模块：如果是all 就全部生成
            -m tobacco
            "
            
            exit
        ;;
        \?)
            echo "无效的参数: -$OPTARG"
        ;;
    esac
done
if [[ $model == "" ]];then
    echo "参数不能为空"
    echo "m 参数值为: $OPTARG"
    echo "-m 模块：如果是all 就全部生成
            -m tobacco
    "
fi
# userapi
if [[ "$model" == "" ]];then
    model="tobacco"
fi
tobacco_project_name="tobacco"
tobacco_json_dir=$jsonDir/${tobacco_project_name}
tobacco_api_dir=$APIDIR/${tobacco_project_name}
mkdir -p $tobacco_json_dir
mkdir -p $tobacco_api_dir
if [[ $model == "all" || $model == "tobacco" ]];then
# wget --header="x-env:ppe" http://localhost:5001/apispec_1.json -O $tobacco_json_dir/userapi.json
openapi-generator generate \
  -i http://localhost:8080/apispec.json \
  -g typescript-axios \
  -o ./$tobacco_api_dir/$model \
  --additional-properties=modelPropertyNaming=original,supportsES6=true \
  --skip-validate-spec
fi