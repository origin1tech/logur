const del = require('del');

del.sync(['./dist/**/*.{ts,map,js}']);