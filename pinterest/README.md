# Как я сама создаю доски и выкладываю пины

Chrome (где ты уже залогинена) — только для **одного** разрешения API.
Дальше всё делаю я скриптом.

## 1. Создай приложение Pinterest (один раз)

1. Открой https://developers.pinterest.com/apps/ (вкладки уже открыты в Chrome).
2. Create app → имя например `LAV Interiors Publisher`.
3. В настройках app добавь Redirect URI:
   `http://127.0.0.1:8787/callback`
4. Скопируй **App ID** и **App secret**.

## 2. Сохрани ключи локально

Создай файл `pinterest/.env`:

```
PINTEREST_APP_ID=твой_id
PINTEREST_APP_SECRET=твой_secret
```

Файл не коммитим в git.

## 3. Подключи аккаунт (Allow)

Запусти `pinterest/connect.bat` или:

```
python pinterest/publish.py oauth
```

Откроется Chrome → нажми **Allow** → токен сохранится в `pinterest/secrets/token.json`.

## 4. Я публикую

```
python pinterest/publish.py publish
```

Скрипт:
- создаёт недостающие доски (`Quiet Luxury Interiors` и т.д.);
- заливает каждый кадр на **все** его доски;
- ставит title, description, link на сайт.

## Важно про доступ API

У новых приложений сначала **Trial**. Создание пинов иногда доступно только после апгрейда на **Standard** (короткое демо-видео OAuth + create pin). Если publish вернёт ошибку доступа — пришли текст, подскажу апгрейд.

Пока Trial не пускает write — могу всё равно держать готовую очередь и повторить publish одной командой.
