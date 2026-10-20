# Netflix Tracker

Film ve dizi izleme listenizi yerel olarak tutan bir Flask uygulaması. İsterseniz Chrome eklentisi, Netflix oynatıcısında ilerleme %88’e geldiğinde kaydı otomatik ekler.

## Özellikler

- Tailwind CSS arayüzü ile başlık ekleme ve listeleme
- SQLite veritabanı (`netflix_tracker.db`)
- `POST /api/add` ve `GET /api/titles` uç noktaları
- Manifest v3 Chrome eklentisi (`https://www.netflix.com/*`)
- TMDB API anahtarı `.env` üzerinden okunur (`TMDB_API_KEY`)

## Proje yapısı

```
netflix-tracker/
├── app.py
├── requirements.txt
├── templates/index.html
├── extension/
│   ├── manifest.json
│   └── content.js
├── .gitignore
└── .env                 # yerel, git'e eklenmez
```

## Kurulum

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Proje kökünde `.env` oluşturun:

```
TMDB_API_KEY=your_key_here
```

Sunucuyu başlatın:

```bash
python app.py
```

Arayüz: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## API

### `POST /api/add`

JSON gövdesi:

| Alan     | Zorunlu | Açıklama                                      |
|----------|---------|-----------------------------------------------|
| `title`  | evet    | Film / dizi adı                               |
| `status` | hayır   | `watchlist`, `watching` veya `completed`      |
| `rating` | hayır   | 1–10                                          |
| `notes`  | hayır   | serbest metin                                 |
| `season` | hayır   | sezon numarası                                |
| `episode`| hayır   | bölüm numarası                                |

Örnek:

```bash
curl -X POST http://127.0.0.1:5000/api/add \
  -H "Content-Type: application/json" \
  -d '{"title":"Dark","status":"completed","season":1,"episode":8}'
```

### `GET /api/titles`

Kayıtlı başlıkları listeler.

## Chrome eklentisi

1. Flask’ın `http://127.0.0.1:5000` üzerinde çalıştığından emin olun.
2. Chrome’da `chrome://extensions` sayfasını açın.
3. Geliştirici modunu açın.
4. **Paketlenmemiş öğe yükle** ile `extension` klasörünü seçin.
5. Netflix’te bir başlık oynatın. Video %88 tamamlanınca eklenti `/api/add` adresine `completed` kaydı gönderir.

Eklenti oynatıcıdaki `video` öğesini ve `data-uia="video-title"` alanını kullanır. Netflix arayüzü değişirse seçicilerin güncellenmesi gerekebilir.

## Güvenlik

`.gitignore` şu dosyaları dışarıda bırakır: sanal ortamlar, `__pycache__`, SQLite veritabanı, `.env`, işletim sistemi ve editör klasörleri. API anahtarlarını koda yazmayın.
