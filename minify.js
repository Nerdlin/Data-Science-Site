import fs from 'fs'; //! Подключение модуля fs
import uglifyJS from 'uglify-js'; //! Подключение библиотеки uglify-js
import cssnano from 'cssnano'; //! Подключение библиотеки cssnano
import postcss from 'postcss'; //! Cssnano работает через postcss

const jsFiles = ['features.js', 'gallery.js', 'index.js', 'skills.js'];
const cssFiles = ['features.css', 'gallery.css', 'index.css', 'skills.css'];

//! Минификация JS-файлов
jsFiles.forEach(file => {
    const jsCode = fs.readFileSync(`./js/${file}`, 'utf8'); //! Чтение JS-файла
    const minifiedJS = uglifyJS.minify(jsCode).code; //! Минификация JS
    fs.writeFileSync(`./js/${file.replace('.js', '.min.js')}`, minifiedJS); //! Сохранение минифицированного файла
});

//! Минификация CSS-файлов
cssFiles.forEach(async (file) => {
    try {
        const cssCode = fs.readFileSync(`./css/${file}`, 'utf8'); //! Чтение CSS-файла
        const result = await postcss([cssnano]).process(cssCode, { from: undefined });
        fs.writeFileSync(`./css/${file.replace('.css', '.min.css')}`, result.css); //! Сохранение минифицированного файла
    } catch (err) {
        console.error(`Ошибка при обработке файла ${file}:`, err);
    }
});
