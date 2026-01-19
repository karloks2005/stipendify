Running tests:

```sh
# u root direktoriju projekta

# postavi flask auth key (google auth i email nisu potrebni za test)
echo "AUTH_KEY=$(openssl rand -hex 32)" > backend/.env

docker compose up -d --build --force-recreate 

# uv je nice, preporucam (https://docs.astral.sh/uv)
uv run pytest backend/tests/main.py

# ...ili manualno:
pip install httpx pytest
pytest backend/tests/main.py
```

Ovako izgleda uspješan rezultat:

```sh
==================== test session starts ====================
platform linux -- Python 3.14.2, pytest-9.0.2, pluggy-1.6.0
rootdir: /home/toni/proj/FER/progi/stipendify/backend/tests
configfile: pyproject.toml
plugins: anyio-4.12.1
collected 2 items

main.py ..                                             [100%]

===================== 2 passed in 0.38s =====================
```
