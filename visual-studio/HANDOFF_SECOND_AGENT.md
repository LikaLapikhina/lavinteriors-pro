# Передача проекта второму агенту — LAV Visual Studio

Актуально на 11 октября 2026 года.

## Твоя роль

Продолжай разработку нового продукта **LAV Visual Studio** внутри существующего сайта LAV Interiors. Сначала изучи текущее состояние и сохрани уже работающую архитектуру. Не начинай интерфейс или генератор заново.

Перед любыми изменениями прочитай полностью:

1. `visual-studio/HANDOFF_SECOND_AGENT.md` — этот документ.
2. `visual-studio/ARCHITECTURE.md` — архитектура продукта.
3. `visual-studio/GENERATION_API.md` — локальный сервер и RunningHub API.
4. `visual-studio/LIBRARY_AUDIT.md` — состояние библиотеки референсов.
5. `visual-studio/HANDOFF_LIBRARY.md` — модель reference assets и stable IDs.

## Где находится проект

- Репозиторий: `D:\lav-site\_github_lavinteriors_pro`
- Продукт: `D:\lav-site\_github_lavinteriors_pro\visual-studio`
- Backend: `D:\lav-site\_github_lavinteriors_pro\lav_visual_server.py`
- Backend-модули: `D:\lav-site\_github_lavinteriors_pro\visual_studio_backend`
- Русская страница: `http://127.0.0.1:4173/ru/visual-studio/`
- Английская страница: `http://127.0.0.1:4173/en/visual-studio/`
- Нейтральный entry point: `http://127.0.0.1:4173/visual-studio/`
- Планируемый production URL: `https://lavinteriors.pro/visual-studio/`

Существующая страница `/visual/` — отдельная услуга. Не заменять её и не переносить туда код Visual Studio.

## Текущее состояние Git

На момент передачи новые каталоги и backend ещё не закоммичены:

```text
 M sitemap.xml
?? en/
?? lav_visual_server.py
?? ru/
?? scripts/set-runninghub-key.ps1
?? tests/
?? visual-studio/
?? visual_studio_backend/
```

Это рабочие изменения пользователя. Не удалять, не сбрасывать и не перезаписывать их. Всегда начинать с:

```powershell
git -c safe.directory=D:/lav-site/_github_lavinteriors_pro status --short
```

Не делать commit, push или публикацию без прямой просьбы пользователя.

## Что уже реализовано

### Интерфейс

- Полноэкранное рабочее пространство для image-to-image генерации.
- Desktop и mobile responsive layout.
- Исходное изображение, результаты и режим сравнения «до / после».
- Цель, помещение, стиль, палитра, уровень изменений и референс.
- Свободное поле особых пожеланий.
- Проекты и локальная история в браузере.
- RU/EN интерфейс с сохранением выбранных параметров.
- Цена `10 ₽` сейчас является UI-конфигурацией, а не реальным биллингом.

### Реальная генерация

- Подключён RunningHub.
- Канал: Nano Banana 2 image-to-image economy.
- Исходник всегда передаётся как `Image 1`.
- Выбранный library reference или собственный reference передаётся как `Image 2`.
- Соотношение сторон выбирается из поддерживаемых значений по размеру исходника.
- Разрешение: `1k`.
- Frontend опрашивает задачу каждые 3 секунды, максимум 240 секунд.
- Автоматических платных повторов нет.
- Одна реальная генерация ранее успешно завершилась с task ID `2107802870312214529`, двумя изображениями, форматом `2:3`, стоимостью провайдера `0.027` и временем около 16.7 секунды.

### Production prompt v1

Активный prompt builder находится в `visual_studio_backend/prompt_builder.py`. Он собирает промпт из независимых секций:

1. `layout_preservation` — камера, перспектива, геометрия и положение объектов.
2. `style_transfer` — роль второго изображения или режим без явного референса.
3. `change_level` — что разрешено менять.
4. `materials_surfaces` — материалы и поверхности.
5. `decor_atmosphere` — декор, свет и атмосфера.
6. `user_goal` — уютнее, дороже, светлее и т. п.
7. `palette` — полноценное цветовое описание, а не одно слово.
8. `special_requests` — исходные пожелания пользователя, если они есть.
9. `editorial_finish` — фотореалистичная журнальная подача.

Функция `build_prompt_plan(request)` возвращает:

```json
{
  "version": "lav-production-v1",
  "sections": [],
  "finalPrompt": "..."
}
```

Не возвращать временный монолитный prompt builder и не дублировать одно ограничение много раз. Сохранять явное разделение `preserve` и `transform`.

### Prompt transparency

В owner/debug режиме доступны две команды в панели «Описание проекта»:

- «Предпросмотр текущего запроса» — строит prompt и payload без загрузки файлов и без платной генерации.
- «Данные последней генерации» — показывает фактически использованные данные завершённого запроса.

Показываются:

- понятая задача;
- `Image 1 / Image 2`, их роли, названия и источники;
- почему reference был выбран;
- все секции промпта;
- полный итоговый prompt;
- фактический payload: `imageUrls`, `aspectRatio`, `resolution`, `provider`, `channel`, `model`.

Owner mode автоматически включён на `localhost` и `127.0.0.1`; на другом хосте его можно включить параметром `?debug=1`.

## Основные файлы

- `visual-studio/app.js` — состояние интерфейса, локализация, генерация, owner/debug UI.
- `visual-studio/styles.css` — вся responsive-вёрстка.
- `visual-studio/data/catalog.js` — stable IDs, цели, стили, цвета и demo.
- `visual-studio/data/references_manifest.json` — 2 143 классифицированных reference assets.
- `visual-studio/services/reference-provider.js` — фильтрация и ranking референсов.
- `visual-studio/services/ai-provider.js` — frontend-клиент generation API и polling.
- `lav_visual_server.py` — same-origin HTTP server и API routes.
- `visual_studio_backend/runninghub_provider.py` — RunningHub и mock providers.
- `visual_studio_backend/prompt_builder.py` — production prompt v1.
- `tests/test_prompt_builder.py` — базовые тесты prompt builder.
- `scripts/set-runninghub-key.ps1` — безопасный интерактивный ввод ключа в Windows user environment.

## Reference library

Библиотека содержит **2 143** assets из Google Drive. Frontend использует публичные thumbnails по `sourceKey`; Google Drive API key в браузере не нужен.

Подбор работает так:

```text
category
+ space type
+ optional style
+ optional color
→ goal-aware metadata ranking
→ 12 подходящих references
```

Library reference и пользовательский upload взаимоисключающие: можно использовать только один style reference как `Image 2`.

Не выбирать случайный файл из всей библиотеки. Не связывать продукт напрямую с физическим деревом папок. Technical IDs должны оставаться стабильными и не зависеть от русских подписей.

## API

- `GET /api/health` — состояние провайдера без секретов.
- `POST /api/generations/preview` — бесплатная сборка prompt/debug preview.
- `POST /api/generations` — загрузка изображений и запуск задачи.
- `GET /api/generations/{taskId}` — статус и результат задачи.

RunningHub endpoints:

- upload: `https://www.runninghub.ai/openapi/v2/media/upload/binary`
- submit: `/openapi/v2/rhart-image-n-g31-flash/image-to-image`
- query: `/openapi/v2/query`

Хост `.cn` для binary upload ранее отвечал `method not allowed`; рабочим является `.ai`.

## Запуск без списаний

Использовать для разработки UI, prompt builder и API-контракта:

```powershell
cd D:\lav-site\_github_lavinteriors_pro
$env:LAV_GENERATION_PROVIDER='mock'
$env:LAV_VISUAL_PORT='4174'
python lav_visual_server.py
```

Открыть:

```text
http://127.0.0.1:4174/ru/visual-studio/
```

Mock возвращает `/images/living2.webp` и ничего не списывает.

## Запуск реального провайдера

Ключ должен находиться только в переменной окружения `RUNNINGHUB_API_KEY`. Никогда не помещать ключ:

- в frontend;
- в query string;
- в Git;
- в документацию;
- в вывод терминала;
- в сообщения между агентами.

Безопасный интерактивный вариант:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "D:\lav-site\_github_lavinteriors_pro\scripts\set-runninghub-key.ps1"
```

После установки открыть новый PowerShell и запустить:

```powershell
cd D:\lav-site\_github_lavinteriors_pro
python lav_visual_server.py
```

На момент этого handoff:

- сервер `4173` **не запущен**;
- временного файла `D:\lav-site\runninghub-key.txt` **нет**;
- значение ключа неизвестно агентам и его нельзя восстанавливать из истории;
- если реальная генерация нужна, попросить пользователя безопасно установить новый действующий ключ;
- не просить присылать ключ в чат.

## Что уже проверено

Выполнялись успешно:

```powershell
python -m unittest discover -s tests -v
node --check visual-studio/app.js
node --check visual-studio/services/ai-provider.js
python -m py_compile lav_visual_server.py visual_studio_backend/prompt_builder.py visual_studio_backend/runninghub_provider.py
git -c safe.directory=D:/lav-site/_github_lavinteriors_pro diff --check
```

Последняя UI-проверка на mock-контуре подтвердила:

- 9 prompt sections;
- 2 применённых изображения;
- корректный reference `Parisian Modern` из Google Drive;
- причины выбора: room + style + color + goal;
- особое пожелание `Сохранить диван, не менять пол.`;
- payload `2:3`, `1k`, mock provider;
- сохранение debug-данных после завершения генерации.

## Важные границы текущего прототипа

- Авторизации и базы данных пока нет.
- Uploads находятся только в памяти страницы / object URLs.
- Настройки и история хранятся в `localStorage`.
- Результаты RunningHub имеют временные URL; постоянное копирование в собственное хранилище ещё не реализовано.
- Платёжный провайдер не подключён.
- Цена `10 ₽` не списывается автоматически.
- Публичные Drive thumbnails не являются финальной production-схемой хранения.
- Backend сейчас локальный Python vertical slice, не production deployment.

## Безопасный порядок работы второго агента

1. Выполнить `git status --short` с `safe.directory` и не трогать чужие изменения.
2. Прочитать перечисленную документацию и ключевые файлы.
3. Запустить тесты до изменения кода.
4. Для разработки поднять mock на `4174`, а не реальный RunningHub.
5. Проверять desktop и mobile, RU и EN.
6. Не запускать платную генерацию без необходимости и без явного понимания, что используется реальный provider.
7. После изменений повторить syntax/tests/UI smoke test.
8. В отчёте перечислить изменённые файлы, проверенные сценарии и оставшиеся риски.

## Что логично делать дальше

Не выбирать следующий крупный этап самостоятельно: сначала уточнить приоритет у пользователя. Технически ближайшие направления:

1. Durable storage для исходников и результатов вместо временных URL.
2. Аутентификация, проекты и постоянная история.
3. Кредиты, реальный ledger и Prodamus.
4. Версионирование prompt builder и evaluation-набор реальных интерьеров.
5. Синхронизация reference manifest с Google Drive.
6. Production backend, rate limiting, request ownership и secret management.
7. UX-полировка owner/debug режима и выбор конкретного результата при нескольких outputs.

Любое из этих направлений существенно меняет объём проекта, поэтому перед реализацией получить конкретное задание.

## Короткий ожидаемый отчёт от агента

После работы сообщить пользователю:

- что именно сделано;
- какие файлы изменены;
- что проверено;
- использовался mock или реальный provider;
- были ли платные запросы;
- требуется ли действие пользователя;
- что осталось следующим шагом.
