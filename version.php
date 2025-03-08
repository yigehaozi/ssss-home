<?php
// 获取文件的修改时间作为版本号
function getFileVersion($filePath) {
    if (file_exists($filePath)) {
        return filemtime($filePath);
    }
    return time(); // 如果文件不存在，返回当前时间
}

// 在HTML中使用: 
// <link rel="stylesheet" href="styles.css?v=<?php echo getFileVersion('styles.css'); ?>">
?> 