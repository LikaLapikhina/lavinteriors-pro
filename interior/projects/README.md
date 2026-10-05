# Project Pages

Все страницы проектов в `/interior/projects/<slug>/` создаются из одного файла данных и одного шаблона.

## Как добавить проект

1. Скопируйте готовые оптимизированные изображения в `images/portfolio-hire/`. Для каждого большого WebP желательно добавить мобильную версию с суффиксом `-mobile.webp`.
2. Откройте `interior/projects/projects.json` и добавьте новый объект в массив `projects`. Можно скопировать существующий проект как пример.
3. Заполните `name`, `slug`, `description`, `images`, `seoTitle` и `seoDescription`. Поля `style`, `roomType`, `location`, `category`, `tags` и `related` необязательны.
4. Установите `published: true`.
5. Из корня сайта выполните:

   ```powershell
   python scripts/generate_project_pages.py
   ```

Генератор проверит обязательные поля, уникальность slug и наличие изображений, затем создаст страницу, обновит каталог для основного портфолио и `sitemap.xml`.

Сгенерированный `index.html` внутри папки проекта редактировать не нужно: все изменения вносите в `projects.json` или общий `project-template.html`.

## Формат изображения

```json
{
  "src": "/images/portfolio-hire/project-01.webp",
  "mobileSrc": "/images/portfolio-hire/project-01-mobile.webp",
  "width": 1600,
  "height": 1200,
  "alt": "Описание кадра для доступности и поиска",
  "layout": "wide"
}
```

`layout` может быть `wide` или `standard`. Первое изображение автоматически используется для social preview и карточки проекта.

Pinterest-ссылки с UTM ведут на ту же статическую страницу, например:

`/interior/projects/warm-classic-apartment/?utm_source=pinterest&utm_medium=organic&utm_campaign=warm-classic-apartment&utm_content=01`

Canonical всегда остаётся чистым — без UTM-параметров.
