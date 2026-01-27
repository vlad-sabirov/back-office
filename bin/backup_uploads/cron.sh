#!/bin/bash
target_name='uploads'
date_time=`date +"%Y-%m-%d"`
base_path=/mnt/yadisk/$target_name
dir_path=archive/`date +"%Y"`/`date +"%m"`/`date +"%d"`

# Создание директорий
mkdir -p -m777 $base_path/$dir_path

# Создание бекапа
/usr/bin/tar -czvf $base_path/$target_name.tar.gz -C /app/apps/api $target_name
cp $base_path/$target_name.tar.gz $base_path/$dir_path/$target_name--$date_time.tar.gz

# Раздача прав
chmod -R 777 $base_path/