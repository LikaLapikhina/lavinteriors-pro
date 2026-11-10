# Handoff: подключение reference library к LAV Visual Studio

## Где находится проект

- Рабочий Git-репозиторий: `D:\lav-site\_github_lavinteriors_pro`
- Новый продукт: `D:\lav-site\_github_lavinteriors_pro\visual-studio`
- Локальная страница: `http://127.0.0.1:4173/visual-studio/`
- Будущий production URL: `https://lavinteriors.pro/visual-studio/`
- Существующий `/visual/` — другая страница услуги. Её не заменять и не изменять.

Для локального запуска из корня репозитория:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

## Текущее состояние Git

Папка `visual-studio/` сейчас новая и отображается как untracked. Изменения ещё не опубликованы и не закоммичены. Перед любой работой выполнить:

```powershell
git -c safe.directory='D:/lav-site/_github_lavinteriors_pro' status --short
```

Не менять посторонние файлы существующего сайта без отдельного задания.

## Файлы LAV Visual Studio

- `visual-studio/index.html` — DOM-каркас страницы.
- `visual-studio/styles.css` — утверждённый responsive desktop/mobile UI.
- `visual-studio/app.js` — состояние интерфейса и mock flow.
- `visual-studio/data/catalog.js` — taxonomy, стили, цвета, цены и временные картинки.
- `visual-studio/services/reference-provider.js` — точка подключения библиотеки.
- `visual-studio/services/ai-provider.js` — mock AI provider.
- `visual-studio/services/prompt-engine.js` — только placeholder-структура, реальных prompts нет.
- `visual-studio/services/storage-provider.js` — mock credit ledger в localStorage.
- `visual-studio/services/payment-provider.js` — mock Prodamus boundary.
- `visual-studio/services/analytics.js` — события существующей Яндекс.Метрики.
- `visual-studio/ARCHITECTURE.md` — общая архитектура этапа 1.

## Где сейчас лежат изображения

Общие изображения действующего сайта:

`D:\lav-site\_github_lavinteriors_pro\images`

Файлы вроде `living1.webp`, `living2.webp`, `architecture1.webp` используются для локальных style covers и demo room.

Настоящая reference library подключена через `visual-studio/data/references_manifest.json`: 2 143 классифицированных Google Drive assets. Изображения показываются через публичные Drive thumbnails по `sourceKey`; токены и API key не используются. Подробный актуальный аудит находится в `LIBRARY_AUDIT.md`.

## Куда подключать библиотеку

Текущий контракт:

```js
ReferenceProvider.getReferences({
  category,
  spaceType,
  styleId,
  colorId,
  goal
})
```

Сейчас основной реализацией является `ManifestReferenceProvider` в:

`visual-studio/services/reference-provider.js`

`StaticReferenceProvider` оставлен только как локальный fallback. Для production с приватной библиотекой или стабильным CDN нужен backend/serverless provider; секреты и токены нельзя помещать в браузерный JavaScript.

## Правильная модель reference asset

Не связывать генерацию напрямую с деревом папок. Физические папки — только источник импорта. В каталоге каждый asset должен иметь metadata:

```json
{
  "id": "ref_...",
  "sourceProvider": "google_drive",
  "sourceKey": "opaque/file/key",
  "category": "interior",
  "spaceTypes": ["living_room"],
  "styles": ["quiet_luxury"],
  "colors": ["beige", "light_wood"],
  "active": true,
  "metadata": {}
}
```

Подбор:

`category + space_type + optional style + optional color → goal-aware ranking → 8 references`

Random допустим только внутри уже отфильтрованного pool. Нельзя выбирать случайный файл из всей библиотеки.

Пользовательский `Upload your own reference` является альтернативой выбранному library reference; сама галерея остаётся доступной и может быть выбрана снова.

## Stable IDs

### Category

- `interior`
- `exterior`

### Interior space types

- `auto_free`
- `wardrobe`
- `living_room`
- `kids_room`
- `office`
- `kitchen`
- `hallway`
- `bathroom`
- `bedroom`
- `dining_room`

### Exterior space types

- `auto_free`
- `villa`
- `courtyard`
- `house`
- `public_building`
- `garden`
- `terrace`
- `facade`

### Interior styles

- `organic_modern`
- `quiet_luxury`
- `american`
- `minimalism`
- `scandinavian`
- `contemporary_classic`
- `mediterranean`
- `eclectic`

### Colors

- `beige`
- `white`
- `yellow`
- `green`
- `brown`
- `red`
- `pink`
- `light_wood`
- `light`
- `grey`
- `blue`
- `dark_wood`
- `dark`
- `black`

Названия на экране должны быть отдельными localized display labels. Не использовать русские имена папок как технические IDs.

## Что делать следующим этапом

1. Утвердить текущий пользовательский сценарий и формулировки параметров.
2. При необходимости добавить автоматический exporter/sync для обновления manifest из Drive.
3. Перед production решить, оставлять ли публичные Drive thumbnails или проксировать изображения через backend/CDN.
4. Не подключать AI API и не писать production prompts без отдельного задания.

## Проверка после подключения

- Interior и Exterior возвращают разные pools.
- `auto_free` не требует искусственного space type.
- Для неизвестной комбинации возвращается контролируемый fallback, а не случайный asset всей библиотеки.
- Один asset может иметь несколько style/space/color tags без физического копирования файла.
- Токены и секреты отсутствуют в frontend/source control.
- Существующий mock flow продолжает работать при недоступном backend provider.
