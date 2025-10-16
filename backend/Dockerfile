FROM docker.io/python:3-alpine

WORKDIR /app

COPY requirements.txt . 
RUN apk add g++
RUN pip install -r requirements.txt

COPY main.py .
COPY modules modules

ENTRYPOINT ["uvicorn" ,"main:app", "--host", "0.0.0.0", "--port", "5000", "--workers", "4"]
