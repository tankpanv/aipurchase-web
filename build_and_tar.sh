pnpm run build 
mkdir -p output
rm output/* -rf
relaseVersion=1.0.0
name=release
tar -cvf ${name}_${relaseVersion}.tar dist
mv ${name}_${relaseVersion}.tar output/
