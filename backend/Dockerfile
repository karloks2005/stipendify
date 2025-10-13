FROM docker.io/python:3-alpine

WORKDIR /app

COPY requirements.txt . 
RUN pip install -r requirements.txt

COPY main.py modules/ .

ENTRYPOINT ["uvicorn" ,"main:app", "--host", "0.0.0.0", "--port", "5000", "--workers", "4"]
